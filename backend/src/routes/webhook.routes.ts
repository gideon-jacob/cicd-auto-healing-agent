import { Router } from 'express';
import { handleJenkins } from '../controllers/webhook.controller';

const router = Router();

router.post('/jenkins', handleJenkins);

export default router;
