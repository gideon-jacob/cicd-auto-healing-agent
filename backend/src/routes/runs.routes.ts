import { Router } from 'express';
import { getStatus, getFixes, getTimeline, getResults } from '../controllers/run.controller';

const router = Router();

router.get('/:run_id/status', getStatus);
router.get('/:run_id/fixes', getFixes);
router.get('/:run_id/timeline', getTimeline);
router.get('/:run_id/results', getResults);

export default router;
