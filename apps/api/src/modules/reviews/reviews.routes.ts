import { Router } from 'express';
import { reviewController } from './reviews.controller';
import { authenticate } from '../../middleware/auth';
import { validate } from '../../middleware/validate';
import { createReviewRequestSchema, submitReviewSchema } from './reviews.validator';

const router = Router();

router.use(authenticate);

router.post('/', validate(createReviewRequestSchema), (req, res, next) =>
  reviewController.createReviewRequest(req, res, next)
);

router.post('/:reviewRequestId/approval', validate(submitReviewSchema), (req, res, next) =>
  reviewController.submitReview(req, res, next)
);

export const reviewRoutes = router;

