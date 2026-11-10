import { Router } from 'express';
import { boardController } from './boards.controller';
import { authenticate } from '../../middleware/auth';

const router = Router();

router.use(authenticate);

// Board list & retrieval
router.get('/projects/:projectId/board', (req, res, next) =>
  boardController.getProjectBoard(req, res, next)
);
router.get('/projects/:projectId/boards', (req, res, next) =>
  boardController.listProjectBoards(req, res, next)
);
router.post('/projects/:projectId/boards', (req, res, next) =>
  boardController.createBoard(req, res, next)
);

// Board operations
router.patch('/:boardId', (req, res, next) => boardController.updateBoard(req, res, next));
router.delete('/:boardId', (req, res, next) => boardController.deleteBoard(req, res, next));

// Column operations
router.post('/:boardId/columns', (req, res, next) => boardController.addColumn(req, res, next));
router.patch('/columns/:columnId', (req, res, next) => boardController.updateColumn(req, res, next));
router.delete('/columns/:columnId', (req, res, next) => boardController.deleteColumn(req, res, next));

export const boardRoutes = router;
