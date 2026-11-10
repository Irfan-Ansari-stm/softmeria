import { Router } from 'express';
import { calendarController } from './calendar.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/events', (req, res, next) => calendarController.listEvents(req, res, next));
router.post('/events', (req, res, next) => calendarController.createEvent(req, res, next));
router.get('/events/:eventId', (req, res, next) => calendarController.getEvent(req, res, next));
router.put('/events/:eventId', (req, res, next) => calendarController.updateEvent(req, res, next));
router.patch('/events/:eventId', (req, res, next) => calendarController.updateEvent(req, res, next));
router.delete('/events/:eventId', (req, res, next) => calendarController.deleteEvent(req, res, next));

export const calendarRoutes = router;
