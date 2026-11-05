import { z } from 'zod';
import { PROJECT_TYPES, PROJECT_VISIBILITIES, PROJECT_STATUSES } from '@devblueprint/shared';

export const createProjectSchema = z.object({
  body: z.object({
    workspaceId: z.string().uuid(),
    name: z.string().min(2, 'Project name must be at least 2 characters'),
    slug: z.string().optional(),
    description: z.string().optional(),
    projectType: z.enum(PROJECT_TYPES).default('Web application'),
    category: z.string().default('Engineering'),
    techStack: z.array(z.string()).default([]),
    repositoryUrl: z.string().url().nullable().optional(),
    icon: z.string().default('folder'),
    color: z.string().default('#4f46e5'),
    visibility: z.enum(PROJECT_VISIBILITIES).default('PRIVATE'),
    status: z.enum(PROJECT_STATUSES).default('ACTIVE'),
    initDefaultCategories: z.boolean().default(true)
  })
});

export const updateProjectSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    description: z.string().nullable().optional(),
    projectType: z.enum(PROJECT_TYPES).optional(),
    category: z.string().optional(),
    techStack: z.array(z.string()).optional(),
    repositoryUrl: z.string().url().nullable().optional(),
    icon: z.string().optional(),
    color: z.string().optional(),
    visibility: z.enum(PROJECT_VISIBILITIES).optional(),
    status: z.enum(PROJECT_STATUSES).optional()
  })
});

