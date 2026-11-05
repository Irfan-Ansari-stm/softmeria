import { Router } from 'express';
import { commentController } from './comments.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createCommentSchema, updateCommentSchema } from './comments.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createCommentSchema), (req, res, next) =>
  commentController.createComment(req, res, next)
);

router.put('/:commentId/resolve', (req, res, next) =>
  commentController.resolveComment(req, res, next)
);

router.delete('/:commentId', (req, res, next) =>
  commentController.deleteComment(req, res, next)
);

export const commentRoutes = router;

