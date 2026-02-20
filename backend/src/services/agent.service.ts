import path from 'path';
import fs from 'fs';
import { execFile } from 'child_process';
import { promisify } from 'util';
import { runStore } from '../store/RunStore';
import { gitService } from './git.service';
import { jenkinsService } from './jenkins.service';
import { crewAIService, AnalyzedFailure } from './crewai.service';
import { calculateScore } from './score.service';
import { logger } from '../utils/logger';
import { config } from '../config';
import { AgentRun, Fix, ResultsJSON } from '../types';

const execFileAsync = promisify(execFile);

export class AgentService {
    /**
     * Main entry point: orchestrates the full agent pipeline.
     * Runs asynchronously — callers should not await this.
     */
    async executeRun(runId: string): Promise<void> {
        const run = runStore.getRun(runId);
        if (!run) {
            logger.error(`Run not found: ${runId}`);
            return;
        }

        const repoDir = path.join(config.agent.cloneBaseDir, run.run_id);

        try {
            // ── Stage 1: Clone ──────────────────────────────────────────────
            runStore.updateRunStatus(runId, 'CLONING');
            this.addStage(runId, 'Clone', 'RUNNING');

            await gitService.cloneRepo(run.repo_url, repoDir);
            await gitService.createBranch(repoDir, run.branch_name);

            this.updateStage(runId, 'Clone', 'SUCCESS');

            // ── Stage 2: Install Dependencies ───────────────────────────────
            this.addStage(runId, 'Install Dependencies', 'RUNNING');

            await this.installDependencies(repoDir);

            this.updateStage(runId, 'Install Dependencies', 'SUCCESS');

            // ── Stage 3: Iterate — run tests, fix, push ─────────────────────
            runStore.updateRunStatus(runId, 'RUNNING');

            for (let iteration = 1; iteration <= run.max_iterations; iteration++) {
                logger.info(`=== Iteration ${iteration}/${run.max_iterations} ===`);

                this.addStage(runId, `Run Tests (Iteration ${iteration})`, 'RUNNING');
                this.addStep(runId, `Running tests — iteration ${iteration}`, 'IN_PROGRESS');

                const testResult = await this.runTests(repoDir);

                if (testResult.passed) {
                    // All tests pass — we're done!
                    this.updateStage(runId, `Run Tests (Iteration ${iteration})`, 'SUCCESS');
                    this.addStep(runId, 'All tests passed', 'DONE');

                    runStore.addTimelineIteration(runId, {
                        iteration,
                        status: 'PASSED',
                        started_at: new Date().toISOString(),
                        finished_at: new Date().toISOString(),
                        failures_found: 0,
                        fixes_applied: 0,
                        jenkins_build_url: '',
                    });

                    runStore.finalizeRun(runId, 'PASSED');
                    break;
                }

                // Tests failed — invoke AI agent
                this.updateStage(runId, `Run Tests (Iteration ${iteration})`, 'FAILED');
                runStore.updateRunStatus(runId, 'AGENT_FIXING');
                this.addStep(runId, 'Analyzing test failures with AI agents', 'IN_PROGRESS');

                // Get repo structure for context
                const repoStructure = await this.getRepoStructure(repoDir);

                // AnalyzerAgent: identify failures
                const failures = await crewAIService.analyzeFailures(
                    testResult.output,
                    repoStructure,
                );

                runStore.updateRun(runId, {
                    summary: {
                        ...run.summary,
                        total_failures_detected:
                            run.summary.total_failures_detected + failures.length,
                    },
                });

                this.addStep(
                    runId,
                    `Found ${failures.length} failures to fix`,
                    'DONE',
                );

                let fixesApplied = 0;

                // FixerAgent + ValidatorAgent: fix each failure
                for (const failure of failures) {
                    this.addStep(
                        runId,
                        `Fixing ${failure.bug_type} error in ${failure.file} line ${failure.line_number}`,
                        'IN_PROGRESS',
                    );

                    try {
                        const filePath = path.join(repoDir, failure.file);
                        if (!fs.existsSync(filePath)) {
                            logger.warn(`File not found: ${filePath}`);
                            this.addFixRecord(runId, failure, '', '', 'FAILED', iteration);
                            continue;
                        }

                        const originalContent = fs.readFileSync(filePath, 'utf-8');

                        // Generate fix
                        const generatedFix = await crewAIService.generateFix(
                            failure,
                            originalContent,
                        );
                        if (!generatedFix) {
                            this.addFixRecord(runId, failure, '', '', 'FAILED', iteration);
                            continue;
                        }

                        // Validate fix
                        const validation = await crewAIService.validateFix(
                            failure,
                            originalContent,
                            generatedFix.fixed_content,
                        );

                        if (!validation.is_valid && validation.confidence > 0.7) {
                            logger.warn(
                                `Fix rejected by validator: ${validation.reason}`,
                            );
                            this.addFixRecord(runId, failure, '', '', 'FAILED', iteration);
                            continue;
                        }

                        // Apply fix
                        fs.writeFileSync(filePath, generatedFix.fixed_content, 'utf-8');

                        // Commit and push
                        const sha = await gitService.commitAndPush(
                            repoDir,
                            failure.file,
                            generatedFix.commit_message,
                            run.branch_name,
                        );

                        this.addFixRecord(
                            runId,
                            failure,
                            generatedFix.commit_message,
                            sha,
                            'FIXED',
                            iteration,
                        );
                        fixesApplied++;

                        // Update commit count
                        const currentRun = runStore.getRun(runId);
                        if (currentRun) {
                            currentRun.score.total_commits++;
                        }
                    } catch (error) {
                        logger.error(`Failed to fix ${failure.file}: ${error}`);
                        this.addFixRecord(runId, failure, '', '', 'FAILED', iteration);
                    }
                }

                runStore.addTimelineIteration(runId, {
                    iteration,
                    status: 'FAILED',
                    started_at: new Date().toISOString(),
                    finished_at: new Date().toISOString(),
                    failures_found: failures.length,
                    fixes_applied: fixesApplied,
                    jenkins_build_url: '',
                });

                // If this was the last iteration and still failing
                if (iteration === run.max_iterations) {
                    runStore.finalizeRun(runId, 'FAILED');
                }
            }

            // Generate results.json
            await this.generateResultsJSON(runId, repoDir);
        } catch (error) {
            logger.error(`Agent run failed: ${error}`);
            runStore.updateRunStatus(runId, 'ERROR');
            const currentRun = runStore.getRun(runId);
            if (currentRun) {
                currentRun.summary.finished_at = new Date().toISOString();
            }
        }
    }

    /**
     * Install project dependencies (auto-detects package manager).
     */
    private async installDependencies(repoDir: string): Promise<void> {
        try {
            if (fs.existsSync(path.join(repoDir, 'package.json'))) {
                await execFileAsync('npm', ['install'], { cwd: repoDir, shell: true });
            } else if (fs.existsSync(path.join(repoDir, 'requirements.txt'))) {
                await execFileAsync('pip', ['install', '-r', 'requirements.txt'], {
                    cwd: repoDir,
                    shell: true,
                });
            } else if (fs.existsSync(path.join(repoDir, 'Pipfile'))) {
                await execFileAsync('pipenv', ['install'], { cwd: repoDir, shell: true });
            }
            logger.info('Dependencies installed');
        } catch (error) {
            logger.warn(`Dependency installation warning: ${error}`);
        }
    }

    /**
     * Run tests and capture output.
     */
    private async runTests(
        repoDir: string,
    ): Promise<{ passed: boolean; output: string }> {
        try {
            // Try multiple test runners
            const testCommands = this.detectTestCommands(repoDir);

            let allOutput = '';
            let allPassed = true;

            for (const cmd of testCommands) {
                try {
                    const { stdout, stderr } = await execFileAsync(cmd[0], cmd.slice(1), {
                        cwd: repoDir,
                        shell: true,
                        timeout: 120000, // 2 minute timeout per test command
                    });
                    allOutput += stdout + '\n' + stderr;
                } catch (error: unknown) {
                    const execError = error as { stdout?: string; stderr?: string };
                    allOutput +=
                        (execError.stdout || '') + '\n' + (execError.stderr || '');
                    allPassed = false;
                }
            }

            return { passed: allPassed, output: allOutput };
        } catch (error) {
            return { passed: false, output: String(error) };
        }
    }

    /**
     * Auto-detect test commands based on project structure.
     */
    private detectTestCommands(repoDir: string): string[][] {
        const commands: string[][] = [];

        if (fs.existsSync(path.join(repoDir, 'package.json'))) {
            try {
                const pkg = JSON.parse(
                    fs.readFileSync(path.join(repoDir, 'package.json'), 'utf-8'),
                );
                if (pkg.scripts?.test) {
                    commands.push(['npm', 'test', '--', '--forceExit']);
                }
            } catch {
                // ignore parse errors
            }
        }

        if (
            fs.existsSync(path.join(repoDir, 'pytest.ini')) ||
            fs.existsSync(path.join(repoDir, 'setup.cfg')) ||
            fs.existsSync(path.join(repoDir, 'pyproject.toml'))
        ) {
            commands.push(['python', '-m', 'pytest', '-v']);
        }

        // Fallback: look for test files
        if (commands.length === 0) {
            if (fs.existsSync(path.join(repoDir, 'requirements.txt'))) {
                commands.push(['python', '-m', 'pytest', '-v']);
            } else {
                commands.push(['npm', 'test']);
            }
        }

        return commands;
    }

    /**
     * Get repository file structure as a string.
     */
    private async getRepoStructure(repoDir: string): Promise<string> {
        try {
            const { stdout } = await execFileAsync(
                'find',
                ['.', '-type', 'f', '-not', '-path', './.git/*', '-not', '-path', './node_modules/*'],
                { cwd: repoDir, shell: true },
            );
            return stdout;
        } catch {
            // Fallback for Windows
            try {
                const { stdout } = await execFileAsync(
                    'dir',
                    ['/s', '/b'],
                    { cwd: repoDir, shell: true },
                );
                return stdout;
            } catch {
                return 'Could not read repo structure';
            }
        }
    }

    /**
     * Add a fix record to the store.
     */
    private addFixRecord(
        runId: string,
        failure: AnalyzedFailure,
        commitMessage: string,
        commitSha: string,
        status: 'FIXED' | 'FAILED',
        iteration: number,
    ): void {
        const fix: Fix = {
            file: failure.file,
            bug_type: failure.bug_type,
            line_number: failure.line_number,
            description: failure.description,
            commit_message: commitMessage,
            commit_sha: commitSha,
            status,
            iteration,
        };
        runStore.addFix(runId, fix);
    }

    /**
     * Helper: add a pipeline stage.
     */
    private addStage(
        runId: string,
        name: string,
        status: 'PENDING' | 'RUNNING' | 'SUCCESS' | 'FAILED',
    ): void {
        runStore.addPipelineStage(runId, {
            name,
            status,
            started_at: new Date().toISOString(),
            finished_at: null,
        });
    }

    /**
     * Helper: update a pipeline stage status.
     */
    private updateStage(
        runId: string,
        name: string,
        status: 'SUCCESS' | 'FAILED',
    ): void {
        runStore.updatePipelineStage(runId, name, {
            status,
            finished_at: new Date().toISOString(),
        });
    }

    /**
     * Helper: add an agent step.
     */
    private addStep(
        runId: string,
        action: string,
        status: 'IN_PROGRESS' | 'DONE' | 'FAILED',
    ): void {
        const run = runStore.getRun(runId);
        const stepNumber = (run?.agent_steps.length || 0) + 1;
        runStore.addAgentStep(runId, {
            step: stepNumber,
            action,
            status,
            timestamp: new Date().toISOString(),
        });
    }

    /**
     * Generate results.json at end of run.
     */
    private async generateResultsJSON(
        runId: string,
        repoDir: string,
    ): Promise<void> {
        const run = runStore.getRun(runId);
        if (!run) return;

        const results: ResultsJSON = {
            run_id: run.run_id,
            repo_url: run.repo_url,
            team_name: run.team_name,
            team_leader: run.team_leader,
            branch_name: run.branch_name,
            status: run.status,
            summary: run.summary,
            score: run.score,
            fixes: run.fixes,
            timeline: run.timeline,
            generated_at: new Date().toISOString(),
        };

        const resultsPath = path.join(repoDir, 'results.json');
        fs.writeFileSync(resultsPath, JSON.stringify(results, null, 2), 'utf-8');
        logger.info(`Results JSON written to: ${resultsPath}`);
    }

    /**
     * Handle Jenkins webhook: called when Jenkins reports build status.
     */
    async handleJenkinsWebhook(
        branch: string,
        status: 'SUCCESS' | 'FAILURE',
        buildUrl: string,
    ): Promise<void> {
        const run = runStore.getRunByBranch(branch);
        if (!run) {
            logger.warn(`No run found for branch: ${branch}`);
            return;
        }

        if (status === 'SUCCESS') {
            runStore.finalizeRun(run.run_id, 'PASSED');
            logger.info(`Run ${run.run_id} PASSED via Jenkins webhook`);
        } else if (status === 'FAILURE') {
            // If we haven't hit the retry limit, the main loop handles re-runs
            logger.info(
                `Jenkins reported FAILURE for run ${run.run_id}, iteration ${run.current_iteration}`,
            );
        }
    }
}

export const agentService = new AgentService();
