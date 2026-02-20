import { Request, Response } from 'express';
import { runStore } from '../store/RunStore';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * GET /api/runs/:run_id/status
 */
export const getStatus = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const run_id = req.params.run_id as string;
    const run = runStore.getRun(run_id);

    if (!run) {
        throw new AppError(`Run not found: ${run_id}`, 404);
    }

    res.json({
        run_id: run.run_id,
        status: run.status,
        repo_url: run.repo_url,
        team_name: run.team_name,
        team_leader: run.team_leader,
        branch_name: run.branch_name,
        summary: run.summary,
        score: run.score,
        current_iteration: run.current_iteration,
        max_iterations: run.max_iterations,
        pipeline_stages: run.pipeline_stages,
        agent_steps: run.agent_steps,
    });
});

/**
 * GET /api/runs/:run_id/fixes
 */
export const getFixes = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const run_id = req.params.run_id as string;
    const run = runStore.getRun(run_id);

    if (!run) {
        throw new AppError(`Run not found: ${run_id}`, 404);
    }

    res.json({ fixes: run.fixes });
});

/**
 * GET /api/runs/:run_id/timeline
 */
export const getTimeline = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const run_id = req.params.run_id as string;
    const run = runStore.getRun(run_id);

    if (!run) {
        throw new AppError(`Run not found: ${run_id}`, 404);
    }

    res.json({
        iterations: run.timeline,
        current_iteration: run.current_iteration,
        max_iterations: run.max_iterations,
    });
});

/**
 * GET /api/runs/:run_id/results
 */
export const getResults = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const run_id = req.params.run_id as string;
    const run = runStore.getRun(run_id);

    if (!run) {
        throw new AppError(`Run not found: ${run_id}`, 404);
    }

    res.json({
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
    });
});
