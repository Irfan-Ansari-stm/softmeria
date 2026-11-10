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
  'Internal tools',
  'Infrastructure',
  'Research and development',
  'Other'
] as const;

export const PROJECT_VISIBILITIES = ['PUBLIC', 'PRIVATE', 'INTERNAL'] as const;

export const PROJECT_STATUSES = [
  'PLANNING',
  'ACTIVE',
  'ARCHIVED',
  'COMPLETED',
  'ON_HOLD',
  'AT_RISK',
  'CANCELLED'
] as const;

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

// Task & Agile Constants
export const TASK_TYPES = [
  'EPIC',
  'FEATURE',
  'STORY',
  'TASK',
  'SUBTASK',
  'BUG',
  'IMPROVEMENT',
  'RESEARCH',
  'TECH_DEBT'
] as const;

export const TASK_STATUSES = [
  'BACKLOG',
  'TODO',
  'IN_PROGRESS',
  'IN_REVIEW',
  'TESTING',
  'BLOCKED',
  'DONE',
  'CANCELLED'
] as const;

export const TASK_PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const SPRINT_STATUSES = ['PLANNED', 'ACTIVE', 'COMPLETED', 'CANCELLED'] as const;

export const FEATURE_STATUSES = [
  'PROPOSED',
  'UNDER_REVIEW',
  'PLANNED',
  'IN_DEVELOPMENT',
  'TESTING',
  'RELEASED',
  'DEPRECATED'
] as const;

export const BUG_SEVERITIES = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'] as const;

export const BUG_STATUSES = [
  'OPEN',
  'CONFIRMED',
  'IN_PROGRESS',
  'FIXED',
  'READY_FOR_TESTING',
  'VERIFIED',
  'REOPENED',
  'CLOSED'
] as const;

export const TEST_CASE_STATUSES = ['PASSED', 'FAILED', 'BLOCKED', 'SKIPPED', 'NOT_RUN'] as const;

export const RELEASE_STATUSES = [
  'PLANNED',
  'IN_PROGRESS',
  'READY',
  'RELEASED',
  'ROLLED_BACK'
] as const;

export const ENVIRONMENTS = ['DEVELOPMENT', 'TESTING', 'STAGING', 'PRODUCTION'] as const;

export const RISK_LEVELS = ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] as const;

export const RISK_STATUSES = [
  'IDENTIFIED',
  'MITIGATING',
  'ACCEPTED',
  'RESOLVED',
  'CLOSED'
] as const;

export const INTEGRATION_PROVIDERS = [
  'GITHUB',
  'GITLAB',
  'BITBUCKET',
  'FIGMA',
  'SLACK',
  'TEAMS',
  'JIRA',
  'WEBHOOK'
] as const;

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
