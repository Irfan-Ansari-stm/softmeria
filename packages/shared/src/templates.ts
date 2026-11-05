import { DocumentationTemplate } from '@devblueprint/types';

export const BUILTIN_TEMPLATES: DocumentationTemplate[] = [
  {
    id: 'tmpl-product-overview',
    title: 'Product Overview Template',
    slug: 'product-overview-template',
    category: 'Product',
    description: 'Comprehensive blueprint for defining project vision, value propositions, and scope.',
    purpose: 'Align product managers, architects, and engineering leadership on what is being built and why.',
    recommendedSections: [
      'Executive Summary',
      'Target Audience & Personas',
      'Core Problem Statement',
      'Key Value Propositions',
      'MVP Scope vs Future Roadmap'
    ],
    content: `# Product Overview

## 1. Executive Summary
*Provide a concise 2-3 paragraph summary of the product initiative.*

## 2. Problem Statement
*Detail the primary user frictions and market inefficiencies being resolved.*
- **Problem 1:**
- **Problem 2:**

## 3. Goals & Success Metrics
| Goal | Target Metric | Measurement Method |
|---|---|---|
| User Adoption | 1,000 MAU within 3 months | Analytics Dashboard |
| Efficiency Gain | 40% reduction in setup time | User Survey / Telemetry |

## 4. User Personas
### Primary Persona: Lead Software Architect
- **Needs:** Consistent documentation, architectural guardrails, automated blueprint exports.
- **Frustrations:** Disorganized Markdown files scattered across repositories.

## 5. Scope Matrix
- **In Scope for V1:** Core CRUD, RBAC, Markdown preview, ZIP export.
- **Deferred to V2:** Real-time multi-cursor collaboration, AI blueprint generation.
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-product-requirements',
    title: 'Product Requirements Document (PRD)',
    slug: 'product-requirements-template',
    category: 'Product',
    description: 'Structured functional and non-functional requirements specification.',
    purpose: 'Define technical expectations, business rules, and acceptance criteria for engineering sprints.',
    recommendedSections: [
      'Feature Overview',
      'Functional Requirements',
      'Non-Functional Requirements',
      'Edge Cases',
      'Acceptance Criteria'
    ],
    content: `# Product Requirements Document (PRD)

## 1. Feature Breakdown
List all key capabilities categorized by priority (Must-Have, Should-Have, Nice-to-Have).

### Must-Have
- [ ] User authentication with JWT & refresh token rotation.
- [ ] Markdown editor with auto-save and version history.
- [ ] ZIP export of complete project documentation.

## 2. Non-Functional Specifications
- **Performance:** Page render time under 1 second.
- **Security:** OWASP compliance, zero XSS vulnerability in Markdown preview.
- **Reliability:** 99.9% availability SLA.

## 3. Acceptance Criteria
\`\`\`gherkin
Scenario: Developer edits document and navigates away
  Given the developer makes changes in the Markdown editor
  When 1000ms passes without typing
  Then the changes are automatically persisted to the database
  And a "Saved" indicator is shown in the toolbar
\`\`\`
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-frontend-architecture',
    title: 'Frontend Architecture Blueprint',
    slug: 'frontend-architecture-template',
    category: 'Frontend',
    description: 'Framework, state management, routing, component hierarchy, and build pipeline.',
    purpose: 'Standardize client-side conventions and architecture across development teams.',
    recommendedSections: [
      'Architecture Diagram',
      'Component Design',
      'State Management Strategy',
      'Data Fetching & Caching',
      'Performance Optimizations'
    ],
    content: `# Frontend Architecture Blueprint

## 1. High-Level Architecture
- **Framework:** Next.js with App Router
- **Language:** TypeScript 5.x
- **CSS Engine:** Tailwind CSS + Radix UI primitives
- **Query Management:** TanStack React Query

## 2. State Management Boundaries
| State Type | Solution | Example |
|---|---|---|
| Server Cache | TanStack Query | Projects, documents, categories |
| Global UI | Zustand | Sidebar collapse, active theme |
| Form State | React Hook Form + Zod | Create project form, doc metadata |
| Ephemeral | React useState | Dropdown open state, tooltip triggers |

## 3. Directory Conventions
Follow feature-first colocation: components, hooks, queries, and types reside within their domain folder.
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-backend-architecture',
    title: 'Backend Architecture Blueprint',
    slug: 'backend-architecture-template',
    category: 'Backend',
    description: 'Modular monolithic Express backend with database access, middleware, and domain services.',
    purpose: 'Provide a blueprint for API routes, controller logic, database abstraction, and error boundaries.',
    recommendedSections: [
      'Layered Architecture',
      'Controller & Service Contracts',
      'Authentication Middleware',
      'Transaction Boundaries',
      'Error Handling Strategy'
    ],
    content: `# Backend Architecture Blueprint

## 1. Architectural Philosophy
Modular Monolith: Separation of concerns between HTTP transport (controllers), business rules (services), and data persistence (Prisma repositories).

## 2. Request Lifecycle
1. Incoming HTTP request matches Route definition.
2. Route applies \`authenticateUser\` and \`validateBody(zodSchema)\`.
3. Controller delegates to Domain Service.
4. Domain Service executes business logic and database queries inside transaction if necessary.
5. Standardized JSON response envelope is dispatched.

## 3. Resilience & Rate Limiting
- Rate limiting configured per IP and authenticated user token.
- Centralized exception filter converts errors into uniform status payloads.
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-database-schema',
    title: 'Database Schema & Relational Design',
    slug: 'database-schema-template',
    category: 'Backend',
    description: 'PostgreSQL schema definitions, indexes, relations, and migration procedures.',
    purpose: 'Document table schemas, foreign key constraints, indexes, and normalization rules.',
    recommendedSections: [
      'Entity Relationship Model',
      'Table Definitions',
      'Index Strategy',
      'Data Integrity Rules',
      'Migration Strategy'
    ],
    content: `# Database Schema Blueprint

## 1. Core Relational Entities
- **Users & Sessions:** Identity management and refresh token rotation.
- **Workspaces & Members:** Tenant boundaries and RBAC permissions.
- **Projects & Categories:** Hierarchical document container structure.
- **Documents & DocumentVersions:** Immutable version snapshots and markdown content.

## 2. Index Optimization
- Composite index on \`(projectId, categoryId, sortOrder)\` for instant tree navigation.
- Unique index on \`(workspaceId, slug)\` for clean URL routing.

## 3. Migration Protocol
All schema adjustments must be scripted via Prisma Migrations and validated on staging prior to deployment.
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-api-standards',
    title: 'REST API Standards & Specifications',
    slug: 'api-standards-template',
    category: 'Backend',
    description: 'RESTful guidelines, payload conventions, pagination formats, and status codes.',
    purpose: 'Ensure every API endpoint adheres to enterprise standards and predictable design.',
    recommendedSections: [
      'Endpoint Structure',
      'Standard Response Envelope',
      'Error Handling Format',
      'Pagination Format',
      'Versioning Rules'
    ],
    content: `# REST API Standards

## 1. URL Conventions
- Resource collections: Plural nouns (\`/api/v1/projects\`)
- Specific items: UUID identifier (\`/api/v1/projects/:id\`)
- Nested sub-resources: (\`/api/v1/projects/:projectId/documents\`)

## 2. Standard Response Format
\`\`\`json
{
  "success": true,
  "message": "Documents retrieved successfully",
  "data": [ ... ],
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 45,
    "totalPages": 3
  }
}
\`\`\`
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-security-standards',
    title: 'Security & Compliance Blueprint',
    slug: 'security-standards-template',
    category: 'Quality & Security',
    description: 'Authentication, cryptographic standards, data isolation, and vulnerability mitigation.',
    purpose: 'Specify mandatory security controls to protect user data and maintain enterprise compliance.',
    recommendedSections: [
      'Authentication & Session Management',
      'Data Isolation & Multi-Tenancy',
      'Input Validation & Sanitization',
      'Cryptographic Standards',
      'Incident Response'
    ],
    content: `# Security Standards Blueprint

## 1. Authentication Security
- Argon2id / bcrypt hashing with unique cryptographically secure salts.
- Refresh tokens hashed with SHA-256 before database storage.
- Session invalidation on password change or explicit logout.

## 2. XSS & Injection Mitigation
- DOMPurify sanitization before rendering Markdown HTML.
- ORM parameterized queries preventing SQL injection.
- Strict path sanitization during ZIP file extraction preventing directory traversal.
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-testing-strategy',
    title: 'Testing Strategy & Quality Gates',
    slug: 'testing-strategy-template',
    category: 'Quality & Security',
    description: 'Unit testing, integration testing, end-to-end testing, and automated CI pipelines.',
    purpose: 'Define test coverage thresholds, toolsets, and quality gates for software releases.',
    recommendedSections: [
      'Testing Pyramid',
      'Unit Testing Standards',
      'API Integration Testing',
      'End-to-End Testing Workflows',
      'Coverage Requirements'
    ],
    content: `# Testing Strategy Blueprint

## 1. Testing Pyramid
- **Unit Tests:** Fast, isolated tests for utilities, validations, and state reducers.
- **Integration Tests:** Supertest API tests verifying database interactions and RBAC guards.
- **End-to-End (E2E) Tests:** Playwright scenarios verifying full browser user journeys.

## 2. Mandatory Verification Workflows
1. User registration, login, and workspace creation.
2. Markdown editing, auto-save validation, and version snapshot restore.
3. ZIP project export and file integrity check.
`,
    isBuiltin: true
  },
  {
    id: 'tmpl-deployment-strategy',
    title: 'Deployment & DevOps Blueprint',
    slug: 'deployment-strategy-template',
    category: 'Infrastructure',
    description: 'Docker containerization, CI/CD stages, blue-green deployment, and rollback plans.',
    purpose: 'Guide automated deployment and operations across development, staging, and production.',
    recommendedSections: [
      'Containerization Architecture',
      'Continuous Delivery Pipeline',
      'Health Probes & Readiness',
      'Zero-Downtime Migration',
      'Disaster Recovery'
    ],
    content: `# Deployment & DevOps Blueprint

## 1. Docker Multi-Stage Builds
Build images with minimized footprints:
- Build stage installs build dependencies and compiles TypeScript.
- Production stage copies only compiled artifacts and production node_modules.

## 2. Health Monitoring
API service exposes:
- \`GET /health\` for container orchestrator readiness checks.
`,
    isBuiltin: true
  }
];

