import { Router, Request, Response } from 'express';
import agentRoutes from './agent.routes';
import runsRoutes from './runs.routes';
import reposRoutes from './repos.routes';
import webhookRoutes from './webhook.routes';

const router = Router();

// Health check
router.get('/health', (_req: Request, res: Response) => {
    res.json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        version: '1.0.0',
    });
});

// API routes
router.use('/agent', agentRoutes);
router.use('/runs', runsRoutes);
router.use('/repos', reposRoutes);
router.use('/webhooks', webhookRoutes);

export default router;
