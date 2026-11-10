import { z } from 'zod';

export const createTemplateSchema = z.object({
  body: z.object({
    workspaceId: z.string().uuid().optional(),
    title: z.string().min(1, 'Title is required'),
    category: z.string().min(1, 'Category is required'),
    description: z.string().min(1, 'Description is required'),
    purpose: z.string().optional().default(''),
    recommendedSections: z.array(z.string()).default([]),
    content: z.string().default('')
  })
});

export const applyTemplateSchema = z.object({
  body: z.object({
    projectId: z.string().uuid(),
    categoryId: z.string().uuid(),
    title: z.string().min(1, 'Title is required')
  })
});

