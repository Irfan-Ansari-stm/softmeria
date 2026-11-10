import { Router } from 'express';
import { timeTrackingController } from './time-tracking.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => timeTrackingController.listTimeEntries(req, res, next));
router.post('/', (req, res, next) => timeTrackingController.createTimeEntry(req, res, next));
router.put('/:entryId', (req, res, next) => timeTrackingController.updateTimeEntry(req, res, next));
router.delete('/:entryId', (req, res, next) => timeTrackingController.deleteTimeEntry(req, res, next));

export const timeTrackingRoutes = router;
