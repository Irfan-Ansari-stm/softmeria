import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const testingTemplates: SeedTemplateDoc[] = [
  {
    id: '10-testing-strategy',
    fileName: 'TESTING-STRATEGY.md',
    relativePath: 'docs/10-testing/TESTING-STRATEGY.md',
    title: 'Comprehensive Quality Assurance & Testing Strategy',
    description: 'Testing pyramid, coverage thresholds, and pipeline quality gates.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'qa', 'strategy'],
    version: '1.0.0',
    content: `# Quality Assurance & Testing Strategy: [PROJECT_NAME]

---

## 1. The Testing Pyramid

\`\`\`mermaid
flowchart TD
    E2E["E2E Tests (10% - Critical User Journeys via Playwright)"]
    Integration["Integration Tests (30% - API Endpoints via Supertest)"]
    Unit["Unit Tests (60% - Business Logic & Components via Vitest)"]
    
    E2E --> Integration --> Unit
\`\`\`

- **Target Code Coverage:** >= 80% line and branch coverage across core business services.
- **Pre-Merge Enforcement:** All pull requests must pass automated test runs in CI before merge approval.
`
  },
  {
    id: '10-unit-testing',
    fileName: 'UNIT-TESTING.md',
    relativePath: 'docs/10-testing/UNIT-TESTING.md',
    title: 'Unit Testing Guidelines (Vitest)',
    description: 'Unit testing conventions, mock strategies, and assertions.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'vitest', 'unit'],
    version: '1.0.0',
    content: `# Unit Testing Guidelines (Vitest)

- Test files reside alongside source files (e.g. \`seed-service.test.ts\`).
- Test pure functions, state stores, and calculation formulas with isolated unit tests without spinning up databases.
`
  },
  {
    id: '10-integration-testing',
    fileName: 'INTEGRATION-TESTING.md',
    relativePath: 'docs/10-testing/INTEGRATION-TESTING.md',
    title: 'API Integration Testing (Supertest)',
    description: 'Testing HTTP routes, payload validation, and database interactions.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'integration', 'supertest'],
    version: '1.0.0',
    content: `# API Integration Testing (Supertest)

API routes are tested using Supertest against a test PostgreSQL database, validating response codes, error envelopes, and database state persistence.
`
  },
  {
    id: '10-e2e-testing',
    fileName: 'E2E-TESTING.md',
    relativePath: 'docs/10-testing/E2E-TESTING.md',
    title: 'End-to-End Testing (Playwright)',
    description: 'Browser automation, user journeys, project creation, and markdown workflows.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'e2e', 'playwright'],
    version: '1.0.0',
    content: `# End-to-End Testing (Playwright)

Automated browser test suites execute against staging instances to verify:
- Registration and login
- Project creation with Full Enterprise Blueprint
- Document authoring and autosaving
- ZIP file export and verification
`
  },
  {
    id: '10-ui-testing',
    fileName: 'UI-TESTING.md',
    relativePath: 'docs/10-testing/UI-TESTING.md',
    title: 'UI & Component Visual Regression',
    description: 'Storybook interaction testing, visual snapshots, and DOM element verification.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'ui', 'storybook'],
    version: '1.0.0',
    content: `# UI & Component Visual Regression

Visual regression snapshots ensure that layout adjustments, typography changes, or theme customizations do not accidentally cause visual defects or element overlap.
`
  },
  {
    id: '10-accessibility-testing',
    fileName: 'ACCESSIBILITY-TESTING.md',
    relativePath: 'docs/10-testing/ACCESSIBILITY-TESTING.md',
    title: 'Automated Accessibility Auditing',
    description: 'axe-core automated checks, keyboard trap detection, and screen reader tests.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['testing', 'a11y', 'axe'],
    version: '1.0.0',
    content: `# Automated Accessibility Auditing

Automated accessibility tests run via \`@axe-core/playwright\` on all primary routes to flag missing ARIA attributes, low contrast, and focus management violations.
`
  },
  {
    id: '10-performance-testing',
    fileName: 'PERFORMANCE-TESTING.md',
    relativePath: 'docs/10-testing/PERFORMANCE-TESTING.md',
    title: 'Load & Performance Testing (k6)',
    description: 'Throughput thresholds, concurrency testing, and latency benchmarks.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'performance', 'k6', 'load'],
    version: '1.0.0',
    content: `# Load & Performance Testing (k6)

k6 scripts simulate concurrent users reading and editing documentation blueprints:
- Target: 100 concurrent virtual users maintaining P95 < 200ms.
- Breaking point stress tests execute prior to major release versions.
`
  },
  {
    id: '10-security-testing',
    fileName: 'SECURITY-TESTING.md',
    relativePath: 'docs/10-testing/SECURITY-TESTING.md',
    title: 'Static Security Analysis & Dependency Audits',
    description: 'SAST scanners, npm audit pipeline gates, and vulnerability assessments.',
    categorySlug: '10-testing',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'security', 'sast'],
    version: '1.0.0',
    content: `# Static Security Analysis & Dependency Audits

- \`npm audit\` runs on every pull request; blocks merge if high or critical CVEs are present.
- CodeQL analysis scans for insecure regexes, prototype pollution, and path traversal vulnerabilities.
`
  }
];
