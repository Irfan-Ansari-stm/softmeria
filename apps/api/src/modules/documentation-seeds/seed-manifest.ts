import { SeedCategory, SeedTemplateDoc, ProjectSeedOptions, BlueprintOption } from './types/seed.types';
import { rootTemplates } from './templates/root';
import { projectTemplates } from './templates/project';
import { architectureTemplates } from './templates/architecture';
import { designSystemTemplates } from './templates/design-system';
import { uiComponentTemplates } from './templates/ui-components';
import { pageDesignTemplates } from './templates/page-design';
import { frontendTemplates } from './templates/frontend';
import { backendTemplates } from './templates/backend';
import { databaseTemplates } from './templates/database';
import { securityTemplates } from './templates/security';
import { testingTemplates } from './templates/testing';
import { devopsTemplates } from './templates/devops';
import { maintenanceTemplates } from './templates/maintenance';

export const BLUEPRINT_VERSION = '1.0.0';

export const SEED_CATEGORIES: SeedCategory[] = [
  {
    name: 'Project Root',
    slug: 'root',
    folderName: '',
    description: 'Root-level project documentation, onboarding, agent guardrails, and changelog.',
    sortOrder: 0
  },
  {
    name: '01. Project Management & Requirements',
    slug: '01-project',
    folderName: '01-project',
    description: 'Requirements, user stories, acceptance criteria, and roadmap.',
    sortOrder: 1
  },
  {
    name: '02. System Architecture & Decisions',
    slug: '02-architecture',
    folderName: '02-architecture',
    description: 'System components, data flows, ADRs, and structural diagrams.',
    sortOrder: 2
  },
  {
    name: '03. Design System & Tokens',
    slug: '03-design-system',
    folderName: '03-design-system',
    description: 'Color tokens, typography, spacing, themes, and accessibility.',
    sortOrder: 3
  },
  {
    name: '04. UI Component Library',
    slug: '04-ui-components',
    folderName: '04-ui-components',
    description: 'Reusable interface component specifications and guidelines.',
    sortOrder: 4
  },
  {
    name: '05. Page Designs & Views',
    slug: '05-page-design',
    folderName: '05-page-design',
    description: 'Page layouts, dashboard designs, auth flows, and error views.',
    sortOrder: 5
  },
  {
    name: '06. Frontend Architecture & Standards',
    slug: '06-frontend',
    folderName: '06-frontend',
    description: 'Client routing, state management, forms, and performance.',
    sortOrder: 6
  },
  {
    name: '07. Backend Architecture & Services',
    slug: '07-backend',
    folderName: '07-backend',
    description: 'Server standards, API design, authentication, and error handling.',
    sortOrder: 7
  },
  {
    name: '08. Database Schema & Data Models',
    slug: '08-database',
    folderName: '08-database',
    description: 'PostgreSQL schema, ER diagrams, indexing, and migration runbooks.',
    sortOrder: 8
  },
  {
    name: '09. Security Policies & Hardening',
    slug: '09-security',
    folderName: '09-security',
    description: 'OWASP checklist, authentication security, and secrets management.',
    sortOrder: 9
  },
  {
    name: '10. Testing Strategy & Quality Assurance',
    slug: '10-testing',
    folderName: '10-testing',
    description: 'Unit, integration, E2E, accessibility, and performance testing.',
    sortOrder: 10
  },
  {
    name: '11. DevOps, CI/CD & Cloud Infrastructure',
    slug: '11-devops',
    folderName: '11-devops',
    description: 'CI/CD pipelines, Docker, Kubernetes, and deployment runbooks.',
    sortOrder: 11
  },
  {
    name: '12. Maintenance, Monitoring & Operations',
    slug: '12-maintenance',
    folderName: '12-maintenance',
    description: 'Health monitoring, APM alerts, incident response, and tech debt.',
    sortOrder: 12
  }
];

export const ALL_SEED_DOCUMENTS: SeedTemplateDoc[] = [
  ...rootTemplates,
  ...projectTemplates,
  ...architectureTemplates,
  ...designSystemTemplates,
  ...uiComponentTemplates,
  ...pageDesignTemplates,
  ...frontendTemplates,
  ...backendTemplates,
  ...databaseTemplates,
  ...securityTemplates,
  ...testingTemplates,
  ...devopsTemplates,
  ...maintenanceTemplates
];

// Essential document IDs for Minimal Blueprint option (~16 key docs)
export const MINIMAL_BLUEPRINT_DOC_IDS = new Set([
  'root-readme',
  'root-agents',
  'root-contributing',
  'root-project-overview',
  '01-project-requirements',
  '01-acceptance-criteria',
  '02-system-architecture',
  '02-frontend-architecture',
  '02-backend-architecture',
  '02-database-architecture',
  '03-design-system',
  '06-frontend-guidelines',
  '07-backend-guidelines',
  '07-api-design',
  '08-database-schema',
  '09-security-policy',
  '10-testing-strategy',
  '11-ci-cd-pipeline'
]);

export function substitutePlaceholders(content: string, options?: ProjectSeedOptions): string {
  const name = options?.projectName || 'Project Workspace';
  const type = options?.projectType || 'Web Application';
  const tech = (options?.techStack || []).join(', ') || 'Next.js, TypeScript, PostgreSQL, Express';

  return content
    .replace(/\[PROJECT_NAME\]/g, name)
    .replace(/\[PROJECT_TYPE\]/g, type)
    .replace(/\[TECH_STACK\]/g, tech)
    .replace(/\[PROJECT_DATABASE\]/g, 'PostgreSQL')
    .replace(/\[FRONTEND_FRAMEWORK\]/g, 'Next.js / React (TypeScript)')
    .replace(/\[BACKEND_FRAMEWORK\]/g, 'Node.js / Express')
    .replace(/\[DEPLOYMENT_PROVIDER\]/g, 'Docker / Cloud Provider')
    .replace(/\[PRIMARY_BUSINESS_OBJECTIVE\]/g, 'streamlining developer engineering workflows and documentation standards')
    .replace(/\[PRIMARY_BUSINESS_VALUE\]/g, 'standardized, verifiable engineering documentation and architecture blueprints');
}

export function getManifestForOption(
  option: BlueprintOption = 'FULL',
  options?: ProjectSeedOptions
): { categories: SeedCategory[]; documents: SeedTemplateDoc[] } {
  if (option === 'BLANK') {
    return { categories: [], documents: [] };
  }

  if (option === 'MINIMAL') {
    const docs = ALL_SEED_DOCUMENTS.filter((d) => MINIMAL_BLUEPRINT_DOC_IDS.has(d.id)).map((d) => ({
      ...d,
      content: substitutePlaceholders(d.content, options)
    }));

    const activeCatSlugs = new Set(docs.map((d) => d.categorySlug));
    const categories = SEED_CATEGORIES.filter((c) => activeCatSlugs.has(c.slug));

    return { categories, documents: docs };
  }

  if (option === 'CUSTOM') {
    const selectedSlugs = new Set(options?.selectedCategories || []);
    const selectedDocIds = options?.selectedDocumentIds ? new Set(options.selectedDocumentIds) : null;

    const docs = ALL_SEED_DOCUMENTS.filter((d) => {
      if (selectedDocIds) return selectedDocIds.has(d.id);
      return selectedSlugs.has(d.categorySlug);
    }).map((d) => ({
      ...d,
      content: substitutePlaceholders(d.content, options)
    }));

    const activeCatSlugs = new Set(docs.map((d) => d.categorySlug));
    const categories = SEED_CATEGORIES.filter((c) => activeCatSlugs.has(c.slug));

    return { categories, documents: docs };
  }

  // Default: FULL
  const docs = ALL_SEED_DOCUMENTS.map((d) => ({
    ...d,
    content: substitutePlaceholders(d.content, options)
  }));

  return { categories: SEED_CATEGORIES, documents: docs };
}
