import { Router } from 'express';
import { sprintController } from './sprints.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => sprintController.listSprints(req, res, next));
router.post('/', (req, res, next) => sprintController.createSprint(req, res, next));
router.get('/velocity', (req, res, next) => sprintController.getVelocity(req, res, next));
router.get('/:sprintId', (req, res, next) => sprintController.getSprint(req, res, next));
router.patch('/:sprintId', (req, res, next) => sprintController.updateSprint(req, res, next));
router.delete('/:sprintId', (req, res, next) => sprintController.deleteSprint(req, res, next));
router.get('/:sprintId/burndown', (req, res, next) => sprintController.getBurndown(req, res, next));
router.post('/:sprintId/start', (req, res, next) => sprintController.startSprint(req, res, next));
router.post('/:sprintId/complete', (req, res, next) => sprintController.completeSprint(req, res, next));
router.post('/:sprintId/cancel', (req, res, next) => sprintController.cancelSprint(req, res, next));

export const sprintRoutes = router;
