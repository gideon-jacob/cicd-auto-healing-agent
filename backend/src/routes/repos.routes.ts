import { Router } from 'express';
import { listRepos, listBuilds } from '../controllers/repo.controller';

const router = Router();

router.get('/', listRepos);
router.get('/:repo_name/builds', listBuilds);

export default router;
