import { Router } from 'express';
import { notificationsController } from './notifications.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => notificationsController.getNotifications(req, res, next));
router.put('/read-all', (req, res, next) => notificationsController.markAllAsRead(req, res, next));
router.put('/:id/read', (req, res, next) => notificationsController.markAsRead(req, res, next));

export const notificationRoutes = router;
