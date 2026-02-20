import { execFile } from 'child_process';
import { promisify } from 'util';
import path from 'path';
import fs from 'fs';
import { logger } from '../utils/logger';
import { config } from '../config';

const execFileAsync = promisify(execFile);

export class GitService {
    /**
     * Clone a GitHub repository to a local directory.
     */
    async cloneRepo(repoUrl: string, targetDir: string): Promise<string> {
        // Ensure base directory exists
        const baseDir = path.dirname(targetDir);
        if (!fs.existsSync(baseDir)) {
            fs.mkdirSync(baseDir, { recursive: true });
        }

        // Remove existing directory if present
        if (fs.existsSync(targetDir)) {
            fs.rmSync(targetDir, { recursive: true, force: true });
        }

        // Build clone URL with token if available
        let cloneUrl = repoUrl;
        if (config.github.token) {
            const urlObj = new URL(repoUrl);
            cloneUrl = `https://${config.github.token}@${urlObj.host}${urlObj.pathname}`;
        }

        logger.info(`Cloning repository ${repoUrl} to ${targetDir}`);
        await execFileAsync('git', ['clone', cloneUrl, targetDir]);
        logger.info('Clone completed successfully');

        return targetDir;
    }

    /**
     * Create and checkout a new branch.
     */
    async createBranch(repoDir: string, branchName: string): Promise<void> {
        logger.info(`Creating branch: ${branchName}`);
        await execFileAsync('git', ['checkout', '-b', branchName], { cwd: repoDir });
    }

    /**
     * Stage, commit, and push changes.
     */
    async commitAndPush(
        repoDir: string,
        filePath: string,
        commitMessage: string,
        branchName: string,
    ): Promise<string> {
        // Stage the file
        await execFileAsync('git', ['add', filePath], { cwd: repoDir });

        // Commit with [AI-AGENT] prefix
        const fullMessage = commitMessage.startsWith('[AI-AGENT]')
            ? commitMessage
            : `[AI-AGENT] ${commitMessage}`;

        await execFileAsync('git', ['commit', '-m', fullMessage], { cwd: repoDir });

        // Get commit SHA
        const { stdout: sha } = await execFileAsync('git', ['rev-parse', 'HEAD'], {
            cwd: repoDir,
        });

        // Push to remote
        await execFileAsync('git', ['push', 'origin', branchName], { cwd: repoDir });

        logger.info(`Committed and pushed: ${fullMessage} (${sha.trim()})`);
        return sha.trim();
    }

    /**
     * Get the list of changed files.
     */
    async getChangedFiles(repoDir: string): Promise<string[]> {
        const { stdout } = await execFileAsync(
            'git',
            ['diff', '--name-only', 'HEAD~1'],
            { cwd: repoDir },
        );
        return stdout.trim().split('\n').filter(Boolean);
    }

    /**
     * Count total commits on current branch.
     */
    async getCommitCount(repoDir: string): Promise<number> {
        const { stdout } = await execFileAsync(
            'git',
            ['rev-list', '--count', 'HEAD'],
            { cwd: repoDir },
        );
        return parseInt(stdout.trim(), 10);
    }
}

export const gitService = new GitService();
