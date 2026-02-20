import { Router } from 'express';
import { triggerRun } from '../controllers/agent.controller';

const router = Router();

router.post('/run', triggerRun);

export default router;
