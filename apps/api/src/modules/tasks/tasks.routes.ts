import { Router } from 'express';
import { taskController } from './tasks.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

router.get('/', (req, res, next) => taskController.listTasks(req, res, next));
router.post('/', (req, res, next) => taskController.createTask(req, res, next));
router.get('/:taskId', (req, res, next) => taskController.getTask(req, res, next));
router.put('/:taskId', (req, res, next) => taskController.updateTask(req, res, next));
router.patch('/:taskId/status', (req, res, next) => taskController.updateStatus(req, res, next));
router.delete('/:taskId', (req, res, next) => taskController.deleteTask(req, res, next));

export const taskRoutes = router;
