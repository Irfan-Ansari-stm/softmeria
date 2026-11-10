import { z } from 'zod';
import { WORKSPACE_ROLES } from '@devblueprint/shared';

export const createWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Workspace name must be at least 2 characters'),
    slug: z.string().optional(),
    logoUrl: z.string().url().nullable().optional()
  })
});

export const updateWorkspaceSchema = z.object({
  body: z.object({
    name: z.string().min(2).optional(),
    logoUrl: z.string().url().nullable().optional(),
    themePreference: z.enum(['light', 'dark', 'system']).optional(),
    notifyOnComment: z.boolean().optional(),
    notifyOnReview: z.boolean().optional(),
    companyName: z.string().optional(),
    website: z.string().optional(),
    industry: z.string().optional(),
    timezone: z.string().optional(),
    defaultVisibility: z.string().optional(),
    emailNotifications: z.boolean().optional(),
    inAppNotifications: z.boolean().optional(),
    projectUpdates: z.boolean().optional(),
    taskAssignments: z.boolean().optional(),
    bugAlerts: z.boolean().optional(),
    releaseApprovals: z.boolean().optional(),
    securityAlerts: z.boolean().optional()
  })
});

export const inviteMemberSchema = z.object({
  body: z.object({
    email: z.string().email('Invalid email address'),
    role: z.enum(WORKSPACE_ROLES).default('EDITOR')
  })
});

export const updateMemberRoleSchema = z.object({
  body: z.object({
    role: z.enum(WORKSPACE_ROLES)
  })
});

