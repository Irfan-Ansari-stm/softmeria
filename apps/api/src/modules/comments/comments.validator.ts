import { z } from 'zod';

export const createCommentSchema = z.object({
  body: z.object({
    documentId: z.string().uuid(),
    content: z.string().min(1, 'Comment cannot be empty'),
    parentId: z.string().uuid().nullable().optional()
  })
});

export const updateCommentSchema = z.object({
  body: z.object({
    content: z.string().min(1).optional(),
    isResolved: z.boolean().optional()
  })
});

