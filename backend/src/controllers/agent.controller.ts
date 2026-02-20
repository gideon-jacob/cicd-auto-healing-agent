import { Request, Response } from 'express';
import { runStore } from '../store/RunStore';
import { agentService } from '../services/agent.service';
import { validateAgentRunRequest } from '../utils/validation';
import { logger } from '../utils/logger';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * POST /api/agent/run
 * Trigger a new agent run.
 */
export const triggerRun = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validation = validateAgentRunRequest(req.body);

    if (!validation.valid || !validation.data) {
        throw new AppError(
            `Validation failed: ${validation.errors.map((e) => e.message).join(', ')}`,
            400,
        );
    }

    const run = runStore.createRun(validation.data);

    logger.info(`Agent run created: ${run.run_id} for ${run.repo_url}`);

    // Fire and forget — agent runs asynchronously
    agentService.executeRun(run.run_id).catch((error) => {
        logger.error(`Agent execution error for run ${run.run_id}: ${error}`);
    });

    res.status(202).json({
        run_id: run.run_id,
        status: run.status,
        branch_name: run.branch_name,
        created_at: run.created_at,
    });
});
