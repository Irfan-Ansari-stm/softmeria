export * from './defaultBlueprints';
export * from './templates';

export const PROJECT_TYPES = [
  'Web application',
  'Mobile application',
  'SaaS platform',
  'Enterprise software',
  'API service',
  'Desktop application',
  'Microservices',
  'Other'
] as const;

export const PROJECT_VISIBILITIES = ['PUBLIC', 'PRIVATE', 'INTERNAL'] as const;

export const PROJECT_STATUSES = ['PLANNING', 'ACTIVE', 'ARCHIVED', 'COMPLETED'] as const;

export const DOCUMENT_STATUSES = [
  'NOT_STARTED',
  'DRAFT',
  'IN_PROGRESS',
  'IN_REVIEW',
  'APPROVED',
  'COMPLETED',
  'ARCHIVED'
] as const;

export const WORKSPACE_ROLES = ['OWNER', 'ADMIN', 'EDITOR', 'VIEWER'] as const;

export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

export function sanitizeFileName(name: string): string {
  return name.replace(/[^a-zA-Z0-9._-]/g, '_');
}

