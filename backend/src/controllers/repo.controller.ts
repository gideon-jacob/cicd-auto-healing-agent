import { Request, Response } from 'express';
import { runStore } from '../store/RunStore';
import { asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/repos
 */
export const listRepos = asyncHandler(async (_req: Request, res: Response): Promise<void> => {
    const repos = runStore.getAllRepos();
    res.json({ repos });
});

/**
 * GET /api/repos/:repo_name/builds
 */
export const listBuilds = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const repo_name = req.params.repo_name as string;
    const builds = runStore.getBuildsForRepo(repo_name);
    res.json({ builds });
});
