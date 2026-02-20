import { v4 as uuidv4 } from 'uuid';
import {
    AgentRun,
    AgentRunRequest,
    RunStatus,
    Repo,
    Build,
    Fix,
    TimelineIteration,
    AgentStep,
    PipelineStage,
} from '../types';
import { generateBranchName } from '../utils/branchName';
import { config } from '../config';

class RunStore {
    private runs: Map<string, AgentRun> = new Map();

    createRun(request: AgentRunRequest): AgentRun {
        const runId = uuidv4();
        const branchName = generateBranchName(request.team_name, request.team_leader);
        const now = new Date().toISOString();

        // Extract repo name from URL
        const urlParts = request.repo_url.replace(/\.git$/, '').split('/');
        const repoName = urlParts[urlParts.length - 1] || 'unknown-repo';

        const run: AgentRun = {
            run_id: runId,
            status: 'QUEUED',
            repo_url: request.repo_url,
            repo_name: repoName,
            team_name: request.team_name,
            team_leader: request.team_leader,
            branch_name: branchName,
            created_at: now,

            summary: {
                total_failures_detected: 0,
                total_fixes_applied: 0,
                final_cicd_status: 'RUNNING',
                total_time_seconds: 0,
                started_at: now,
                finished_at: null,
            },

            score: {
                base: 100,
                speed_bonus: 0,
                efficiency_penalty: 0,
                total: 100,
                total_commits: 0,
            },

            current_iteration: 0,
            max_iterations: config.agent.maxRetryLimit,

            pipeline_stages: [],
            agent_steps: [],
            fixes: [],
            timeline: [],
        };

        this.runs.set(runId, run);
        return run;
    }

    getRun(runId: string): AgentRun | undefined {
        return this.runs.get(runId);
    }

    updateRun(runId: string, updates: Partial<AgentRun>): AgentRun | undefined {
        const run = this.runs.get(runId);
        if (!run) return undefined;

        const updated = { ...run, ...updates };
        this.runs.set(runId, updated);
        return updated;
    }

    updateRunStatus(runId: string, status: RunStatus): AgentRun | undefined {
        return this.updateRun(runId, { status });
    }

    addPipelineStage(runId: string, stage: PipelineStage): void {
        const run = this.runs.get(runId);
        if (run) {
            run.pipeline_stages.push(stage);
        }
    }

    updatePipelineStage(
        runId: string,
        stageName: string,
        updates: Partial<PipelineStage>,
    ): void {
        const run = this.runs.get(runId);
        if (run) {
            const stage = run.pipeline_stages.find((s) => s.name === stageName);
            if (stage) {
                Object.assign(stage, updates);
            }
        }
    }

    addAgentStep(runId: string, step: AgentStep): void {
        const run = this.runs.get(runId);
        if (run) {
            run.agent_steps.push(step);
        }
    }

    addFix(runId: string, fix: Fix): void {
        const run = this.runs.get(runId);
        if (run) {
            run.fixes.push(fix);
            run.summary.total_fixes_applied = run.fixes.filter(
                (f) => f.status === 'FIXED',
            ).length;
        }
    }

    addTimelineIteration(runId: string, iteration: TimelineIteration): void {
        const run = this.runs.get(runId);
        if (run) {
            run.timeline.push(iteration);
            run.current_iteration = iteration.iteration;
        }
    }

    finalizeRun(runId: string, status: 'PASSED' | 'FAILED'): void {
        const run = this.runs.get(runId);
        if (!run) return;

        const now = new Date().toISOString();
        const startTime = new Date(run.summary.started_at).getTime();
        const endTime = new Date(now).getTime();
        const totalSeconds = Math.round((endTime - startTime) / 1000);

        // Calculate score
        const speedBonus = totalSeconds < 300 ? 10 : 0; // < 5 minutes
        const efficiencyPenalty =
            run.score.total_commits > 20
                ? -2 * (run.score.total_commits - 20)
                : 0;

        run.status = status;
        run.summary.final_cicd_status = status;
        run.summary.finished_at = now;
        run.summary.total_time_seconds = totalSeconds;
        run.score.speed_bonus = speedBonus;
        run.score.efficiency_penalty = efficiencyPenalty;
        run.score.total = run.score.base + speedBonus + efficiencyPenalty;
    }

    getAllRepos(): Repo[] {
        const repoMap = new Map<string, Repo>();

        for (const run of this.runs.values()) {
            const existing = repoMap.get(run.repo_name);
            if (
                !existing ||
                new Date(run.created_at) > new Date(existing.created_at)
            ) {
                repoMap.set(run.repo_name, {
                    name: run.repo_name,
                    repo_url: run.repo_url,
                    latest_run_id: run.run_id,
                    latest_status: run.status,
                    created_at: run.created_at,
                });
            }
        }

        return Array.from(repoMap.values());
    }

    getBuildsForRepo(repoName: string): Build[] {
        const builds: Build[] = [];
        let buildNumber = 1;

        for (const run of this.runs.values()) {
            if (run.repo_name === repoName) {
                builds.push({
                    run_id: run.run_id,
                    build_number: buildNumber++,
                    status: run.status,
                    branch_name: run.branch_name,
                    started_at: run.summary.started_at,
                    finished_at: run.summary.finished_at,
                });
            }
        }

        return builds;
    }

    getRunByBranch(branch: string): AgentRun | undefined {
        for (const run of this.runs.values()) {
            if (run.branch_name === branch) {
                return run;
            }
        }
        return undefined;
    }
}

// Singleton
export const runStore = new RunStore();
