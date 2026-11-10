import { Router } from 'express';
import { bugController } from './bugs.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => bugController.listBugs(req, res, next));
router.post('/', (req, res, next) => bugController.createBug(req, res, next));
router.get('/analytics', (req, res, next) => bugController.getAnalytics(req, res, next));
router.get('/:bugId', (req, res, next) => bugController.getBug(req, res, next));
router.put('/:bugId', (req, res, next) => bugController.updateBug(req, res, next));
router.patch('/:bugId', (req, res, next) => bugController.updateBug(req, res, next));
router.delete('/:bugId', (req, res, next) => bugController.deleteBug(req, res, next));

export const bugRoutes = router;
