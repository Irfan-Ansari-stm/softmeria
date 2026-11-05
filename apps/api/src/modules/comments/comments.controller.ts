import { Request, Response, NextFunction } from 'express';
import { commentService } from './comments.service';
import { sendSuccess } from '../../utils/response';

export class CommentController {
  async createComment(req: Request, res: Response, next: NextFunction) {
    try {
      const comment = await commentService.createComment(req.user!.id, req.body);
      return sendSuccess(res, comment, 'Comment posted', 201);
    } catch (error) {
      return next(error);
    }
  }

  async resolveComment(req: Request, res: Response, next: NextFunction) {
    try {
      const isResolved = req.body.isResolved !== undefined ? req.body.isResolved : true;
      const comment = await commentService.resolveComment(req.params.commentId, isResolved);
      return sendSuccess(res, comment, 'Comment updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await commentService.deleteComment(req.params.commentId, req.user!.id);
      return sendSuccess(res, result, 'Comment deleted');
    } catch (error) {
      return next(error);
    }
  }
}

export const commentController = new CommentController();

