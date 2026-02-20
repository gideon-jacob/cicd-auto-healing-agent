import { Request, Response } from 'express';
import { validateJenkinsWebhook } from '../utils/validation';
import { agentService } from '../services/agent.service';
import { logger } from '../utils/logger';
import { AppError, asyncHandler } from '../middleware/errorHandler';

/**
 * POST /api/webhooks/jenkins
 * Receive Jenkins pipeline completion callbacks.
 */
export const handleJenkins = asyncHandler(async (req: Request, res: Response): Promise<void> => {
    const validation = validateJenkinsWebhook(req.body);

    if (!validation.valid || !validation.data) {
        throw new AppError(
            `Invalid webhook payload: ${validation.errors.map((e) => e.message).join(', ')}`,
            400,
        );
    }

    const { branch, status, log_url } = validation.data;

    logger.info(
        `Jenkins webhook received: branch=${branch}, status=${status}`,
    );

    // Handle asynchronously
    agentService
        .handleJenkinsWebhook(branch, status, log_url)
        .catch((error) => {
            logger.error(`Webhook handling error: ${error}`);
        });

    res.status(200).json({ received: true });
});
