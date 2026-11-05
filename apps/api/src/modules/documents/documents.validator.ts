import { z } from 'zod';
import { DOCUMENT_STATUSES } from '@devblueprint/shared';

export const createDocumentSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
    categoryId: z.string().uuid(),
    title: z.string().min(1, 'Title is required'),
    fileName: z.string().optional(),
    description: z.string().optional(),
    content: z.string().default(''),
    status: z.enum(DOCUMENT_STATUSES).default('NOT_STARTED'),
    isOptional: z.boolean().default(false),
    sortOrder: z.number().int().optional(),
    tags: z.array(z.string()).default([])
  })
});

export const updateDocumentSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    fileName: z.string().optional(),
    description: z.string().nullable().optional(),
    content: z.string().optional(),
    status: z.enum(DOCUMENT_STATUSES).optional(),
    isOptional: z.boolean().optional(),
    changeSummary: z.string().optional(),
    expectedVersion: z.number().int().optional(),
    tags: z.array(z.string()).optional()
  })
});

export const moveDocumentSchema = z.object({
  body: z.object({
    categoryId: z.string().uuid(),
    sortOrder: z.number().int().optional()
  })
});

export const restoreVersionSchema = z.object({
  body: z.object({
    versionNumber: z.number().int().positive()
  })
});

