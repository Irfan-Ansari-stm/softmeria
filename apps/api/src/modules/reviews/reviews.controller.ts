import { Request, Response, NextFunction } from 'express';
import { reviewService } from './reviews.service';
import { sendSuccess } from '../../utils/response';
import { ReviewStatus } from '@prisma/client';

export class ReviewController {
  async createReviewRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const reviewReq = await reviewService.createReviewRequest(
        req.user!.id,
        req.body.documentId,
        req.body.notes
      );
      return sendSuccess(res, reviewReq, 'Review requested', 201);
    } catch (error) {
      return next(error);
    }
  }

  async submitReview(req: Request, res: Response, next: NextFunction) {
    try {
      const approval = await reviewService.submitReview(
        req.user!.id,
        req.params.reviewRequestId,
        req.body.status as ReviewStatus,
        req.body.comment
      );
      return sendSuccess(res, approval, 'Review submitted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const reviewController = new ReviewController();

