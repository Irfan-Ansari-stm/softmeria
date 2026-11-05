import { Router } from 'express';
import { searchController } from './search.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => searchController.search(req, res, next));

export const searchRoutes = router;

