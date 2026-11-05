import { z } from 'zod';

export const createReviewRequestSchema = z.object({
  body: z.object({
    documentId: z.string().uuid(),
    notes: z.string().optional()
  })
});

export const submitReviewSchema = z.object({
  body: z.object({
    status: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
    comment: z.string().optional()
  })
});

