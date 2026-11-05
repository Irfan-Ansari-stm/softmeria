export interface DefaultDocDefinition {
  title: string;
  fileName: string;
  slug: string;
  description: string;
  content: string;
}

export interface DefaultCategoryDefinition {
  name: string;
  slug: string;
  folderName: string;
  description: string;
  sortOrder: number;
  documents: DefaultDocDefinition[];
}

export const DEFAULT_BLUEPRINT_CATEGORIES: DefaultCategoryDefinition[] = [
  {
    name: 'Product Documentation',
    slug: '01-product',
    folderName: '01-product',
    description: 'Product requirements, user personas, business logic, and high-level vision.',
    sortOrder: 1,
    documents: [
      {
        title: 'Product Overview',
        fileName: 'PRODUCT_OVERVIEW.md',
        slug: 'product-overview',
        description: 'High-level purpose, executive summary, target audience, and key value propositions.',
        content: `# Product Overview

## 1. Executive Summary
Briefly describe the product, who it is for, and why it matters.

## 2. Problem Statement
- **Pain Point 1:** Detail the primary friction users encounter today.
- **Pain Point 2:** Detail secondary bottlenecks in existing solutions.
- **Impact:** What does failing to solve this cost the organization or users?

## 3. Product Vision & Goals
- **Vision:** The long-term aspirational destination of this platform.
- **Primary Goal:** Measurable objective for V1.
- **Secondary Goal:** Operational or user engagement benchmark.

## 4. Key Value Propositions
- **Speed & Efficiency:** How does this accelerate user workflow?
- **Standardization:** How does this ensure uniform quality across teams?
- **Enterprise-Ready:** Reliability, security, and governance by default.

## 5. Scope & Target Audience
- **Target Audience:** Engineering leads, architects, developers, and QA engineers.
- **In-Scope (MVP):** Essential foundation, core CRUD, authentication, and core workflows.
- **Out-of-Scope (MVP):** Advanced AI copilot capabilities, multi-region failover.
`
      },
      {
        title: 'Requirements',
        fileName: 'REQUIREMENTS.md',
        slug: 'requirements',
        description: 'Functional and non-functional requirements with acceptance criteria.',
        content: `# Functional & Non-Functional Requirements

## 1. Functional Requirements (FR)
- [ ] **FR-01 (Authentication):** Users must be able to sign up, log in with password or OAuth, and manage refresh tokens.
- [ ] **FR-02 (Workspace Isolation):** Every resource must strictly belong to a tenant workspace with zero cross-tenant leakage.
- [ ] **FR-03 (Document Management):** Support full Markdown editing, live preview, version snapshots, and auto-saving.
- [ ] **FR-04 (Import & Export):** Single files and entire workspace trees must be downloadable as clean zip archives.
- [ ] **FR-05 (Collaboration):** Team members can comment on documents, submit reviews, and approve blueprints.

## 2. Non-Functional Requirements (NFR)
- **Performance:** P95 response times under 150ms for cached reads; document auto-save debounced at 1000ms.
- **Security:** Strict Argon2id or bcrypt password hashing, HTTP-only SameSite cookies, XSS sanitization for rendered Markdown.
- **Scalability:** Stateless API containers with pooled PostgreSQL connections.
- **Availability:** 99.9% uptime SLA target with automated database backups.
`
      },
      {
        title: 'User Roles & Permissions',
        fileName: 'USER_ROLES.md',
        slug: 'user-roles',
        description: 'Role-based access matrix and permission boundaries.',
        content: `# User Roles & RBAC Matrix

## Role Definitions
1. **Workspace Owner:** Unrestricted root permissions; manages billing, members, and workspace deletion.
2. **Workspace Admin:** Manages projects, members, invitations, and templates.
3. **Editor:** Creates, edits, reviews, and organizes documents and blueprints.
4. **Viewer:** Read-only access to published documents with export capabilities.

## Permission Matrix

| Capability | Owner | Admin | Editor | Viewer |
|---|:---:|:---:|:---:|:---:|
| Manage Workspace Settings | ✅ | ❌ | ❌ | ❌ |
| Invite / Remove Members | ✅ | ✅ | ❌ | ❌ |
| Create / Delete Projects | ✅ | ✅ | ❌ | ❌ |
| Create / Edit Documents | ✅ | ✅ | ✅ | ❌ |
| Submit Review Requests | ✅ | ✅ | ✅ | ❌ |
| Approve Reviews | ✅ | ✅ | ❌ | ❌ |
| Export Workspace / Docs | ✅ | ✅ | ✅ | ✅ |
`
      },
      {
        title: 'Business Rules',
        fileName: 'BUSINESS_RULES.md',
        slug: 'business-rules',
        description: 'Core domain invariants, validation constraints, and workflows.',
        content: `# Core Business Rules & Invariants

## 1. Multi-Tenancy Rules
- Every project must belong to exactly one workspace.
- A user must have an active membership in a workspace before accessing any project within it.

## 2. Document & Versioning Rules
- A document cannot be permanently deleted if it has an active pending review request without confirmation.
- Each manual or major save creates an immutable \`DocumentVersion\` snapshot.
- Restoring an older snapshot creates a new incremental version record rather than rewriting past history.

## 3. Progress Tracking Rules
- \`Documentation Progress\` = (Completed Documents) / (Total Non-Optional Documents) * 100%.
- Documents flagged as \`isOptional: true\` do not penalize total progress calculation.
`
      }
    ]
  },
  {
    name: 'Design Documentation',
    slug: '02-design',
    folderName: '02-design',
    description: 'Design system, color palettes, typography, spacing, and UI components.',
    sortOrder: 2,
    documents: [
      {
        title: 'Design System Overview',
        fileName: 'DESIGN_SYSTEM.md',
        slug: 'design-system',
        description: 'Foundational design principles, tokens, and aesthetic guidelines.',
        content: `# Design System Overview

## Principles
- **Clarity over cleverness:** Developer tools must prioritize information density and crisp contrast.
- **Predictability:** Consistent placement for actions, navigation, and modal dialogues.
- **Accessible by Default:** Full keyboard navigability, WCAG 2.1 AA compliant contrast ratios.

## Token Architecture
Design tokens are synchronized across Tailwind CSS configuration and CSS variables.
`
      },
      {
        title: 'Colors & Theme',
        fileName: 'COLORS.md',
        slug: 'colors',
        description: 'Color palette definition for light and dark modes.',
        content: `# Color Palette Specification

## Neutral Grayscale
- \`slate-950\` / \`#020617\`: Root dark background
- \`slate-900\` / \`#0f172a\`: Dark surface / card background
- \`slate-800\` / \`#1e293b\`: Dark border & divider
- \`slate-100\` / \`#f1f5f9\`: Light surface background
- \`white\` / \`#ffffff\`: Root light background

## Primary Accents
- **Brand Primary:** \`indigo-600\` (\`#4f46e5\`) - primary buttons, active tabs
- **Brand Hover:** \`indigo-500\` (\`#6366f1\`)
- **Success:** \`emerald-500\` (\`#10b981\`) - completed documents, approvals
- **Warning:** \`amber-500\` (\`#f59e0b\`) - in-review status
- **Danger:** \`rose-500\` (\`#f43f5e\`) - destructive actions
`
      },
      {
        title: 'Typography',
        fileName: 'TYPOGRAPHY.md',
        slug: 'typography',
        description: 'Font families, scale, line heights, and weights.',
        content: `# Typography Scale

## Font Families
- **Interface / Sans:** \`Inter\`, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif
- **Code / Monospace:** \`JetBrains Mono\`, "Fira Code", Menlo, monospace

## Type Scale
- **Display 1:** 32px / 2.0rem (Line height 1.25, Font-weight 700)
- **H1:** 24px / 1.5rem (Line height 1.3, Font-weight 600)
- **H2:** 20px / 1.25rem (Line height 1.35, Font-weight 600)
- **H3:** 16px / 1.0rem (Line height 1.4, Font-weight 600)
- **Body Regular:** 14px / 0.875rem (Line height 1.5, Font-weight 400)
- **Body Small:** 12px / 0.75rem (Line height 1.4, Font-weight 400)
- **Code Block:** 13px / 0.8125rem (Line height 1.6, Monospace)
`
      },
      {
        title: 'Spacing and Layout',
        fileName: 'SPACING_AND_LAYOUT.md',
        slug: 'spacing-and-layout',
        description: 'Grid layout, container boundaries, and spacing scale.',
        content: `# Spacing and Layout Standards

## 4px Base Grid
- Spacing units strictly follow standard increments: \`4px\`, \`8px\`, \`12px\`, \`16px\`, \`24px\`, \`32px\`, \`48px\`.

## Application Shell
- **Main Sidebar:** Fixed width 260px (collapsible to 60px icon mode).
- **Workspace Canvas:** Flex-1 responsive container.
- **Contextual Panel:** 320px width for metadata, version history, and comments.
`
      },
      {
        title: 'Design Tokens',
        fileName: 'DESIGN_TOKENS.md',
        slug: 'design-tokens',
        description: 'Variables and design token mappings.',
        content: `# Design Tokens

## Elevation & Shadows
- \`elevation-none\`: 0 0 #0000
- \`elevation-sm\`: 0 1px 2px 0 rgb(0 0 0 / 0.05)
- \`elevation-md\`: 0 4px 6px -1px rgb(0 0 0 / 0.1)

## Border Radii
- \`rounded-sm\`: 4px
- \`rounded-md\`: 6px
- \`rounded-lg\`: 8px
- \`rounded-xl\`: 12px
`
      },
      {
        title: 'Components',
        fileName: 'COMPONENTS.md',
        slug: 'components',
        description: 'Component catalogue and usage guidelines.',
        content: `# UI Component Guidelines

- **Buttons:** \`primary\`, \`secondary\`, \`outline\`, \`ghost\`, \`danger\`
- **Inputs:** Text input, text area, select dropdown, search input with clear trigger
- **Modals & Dialogs:** Accessible Radix-based overlays with backdrop blur
- **Tabs:** Sliding underline indicators for active views
- **Badges:** Status pill indicators (\`Completed\`, \`Draft\`, \`In Review\`)
`
      },
      {
        title: 'UI Patterns',
        fileName: 'UI_PATTERNS.md',
        slug: 'ui-patterns',
        description: 'Common interactive workflows and layout patterns.',
        content: `# Standard UI Patterns

- **Master-Detail Layout:** Left-hand navigation tree with synchronized active detail view.
- **Split-Pane Editor:** Dual-pane Markdown editor with synchronized scrolling.
- **Optimistic Concurrency:** Real-time badge indicators for saving, saved, and conflict states.
`
      },
      {
        title: 'Accessibility Guidelines',
        fileName: 'ACCESSIBILITY.md',
        slug: 'accessibility',
        description: 'WCAG compliance, screen-reader support, and keyboard navigation.',
        content: `# Accessibility (a11y) Standards

- Keyboard focus rings using \`focus-visible:ring-2 focus-visible:ring-offset-2\`
- High contrast ratio (minimum 4.5:1 for body copy)
- Form inputs mapped to associated labels via \`htmlFor\` and \`aria-describedby\`
`
      }
    ]
  },
  {
    name: 'Frontend Documentation',
    slug: '03-frontend',
    folderName: '03-frontend',
    description: 'Frontend architecture, Next.js App Router, state management, and styling.',
    sortOrder: 3,
    documents: [
      {
        title: 'Frontend Architecture',
        fileName: 'FRONTEND_ARCHITECTURE.md',
        slug: 'frontend-architecture',
        description: 'High-level frontend technical design and technology stack.',
        content: `# Frontend Architecture

## Tech Stack
- **Framework:** Next.js (App Router)
- **UI Library:** React with TypeScript
- **Styling:** Tailwind CSS + Radix UI primitives
- **Data Fetching:** TanStack Query (React Query)
- **State Management:** Zustand for client state, React Query for server cache
- **Forms & Validation:** React Hook Form + Zod
`
      },
      {
        title: 'Project Structure',
        fileName: 'PROJECT_STRUCTURE.md',
        slug: 'project-structure',
        description: 'Directory layout and modular conventions for frontend code.',
        content: `# Frontend Project Structure

\`\`\`text
src/
├── app/                  # Next.js App Router pages and route groups
├── components/           # Reusable atomic UI components (Button, Input, Modal, Badge)
├── features/             # Domain-specific modules
│   ├── auth/
│   ├── dashboard/
│   ├── projects/
│   ├── documents/
│   ├── markdown-editor/
│   ├── templates/
│   └── collaboration/
├── hooks/                # Custom React hooks
├── lib/                  # API client, utility functions, formatting
├── stores/               # Zustand state stores
└── types/                # Client-specific TypeScript declarations
\`\`\`
`
      },
      {
        title: 'Component Architecture',
        fileName: 'COMPONENT_ARCHITECTURE.md',
        slug: 'component-architecture',
        description: 'Component hierarchy, composition patterns, and props conventions.',
        content: `# Component Architecture

- **Smart vs. Dumb Components:** Features handle queries and mutations; atomic UI components remain pure and testable.
- **Compound Components:** Complex controls (Tabs, Dropdowns, Dialogs) leverage React Context for declarative ergonomics.
`
      },
      {
        title: 'State Management',
        fileName: 'STATE_MANAGEMENT.md',
        slug: 'state-management',
        description: 'Global state vs server state boundaries.',
        content: `# State Management Strategy

1. **Server State:** Handled exclusively via TanStack Query (\`useQuery\`, \`useMutation\`). Automatic cache invalidation on mutations.
2. **Global Client State:** Minimal Zustand stores for active workspace, sidebar toggles, and editor preferences.
3. **Local Component State:** Standard \`useState\` / \`useReducer\` for ephemeral UI behaviors (dialog open state, local draft buffer).
`
      },
      {
        title: 'Routing Strategy',
        fileName: 'ROUTING.md',
        slug: 'routing',
        description: 'App router structure, dynamic segments, and navigation guards.',
        content: `# Routing Structure

- \`/login\` - Sign in
- \`/register\` - User registration
- \`/dashboard\` - Main dashboard with global stats
- \`/projects\` - Project directory
- \`/projects/[projectId]\` - Project overview and metrics
- \`/projects/[projectId]/docs/[docId]\` - Markdown workspace editor
- \`/templates\` - Template library and preview
- \`/settings\` - Workspace and profile settings
`
      },
      {
        title: 'API Integration',
        fileName: 'API_INTEGRATION.md',
        slug: 'api-integration',
        description: 'Client-side API service, interceptors, and error handling.',
        content: `# API Integration

Centralized Axios / Fetch wrapper with automatic JWT authorization headers, refresh-token rotation on 401 responses, and structured error responses.
`
      },
      {
        title: 'Coding Standards',
        fileName: 'CODING_STANDARDS.md',
        slug: 'coding-standards',
        description: 'ESLint, Prettier, and TypeScript best practices.',
        content: `# Frontend Coding Standards

- Strict TypeScript mode enabled; no \`any\` types in domain code.
- Functional components with explicit props interfaces.
- Standard ESLint rules and Prettier code formatting.
`
      }
    ]
  },
  {
    name: 'Backend Documentation',
    slug: '04-backend',
    folderName: '04-backend',
    description: 'Express.js architecture, REST standards, database design, and auth flow.',
    sortOrder: 4,
    documents: [
      {
        title: 'Backend Architecture',
        fileName: 'BACKEND_ARCHITECTURE.md',
        slug: 'backend-architecture',
        description: 'Modular monolithic Express backend design.',
        content: `# Backend Architecture

## Core Technology
- **Runtime:** Node.js LTS
- **Framework:** Express.js with TypeScript
- **ORM:** Prisma ORM
- **Database:** PostgreSQL
- **Validation:** Zod schemas for all inbound DTOs

## Layered Architecture
- **Routes:** Route definitions and middleware bindings.
- **Controllers:** Request parsing, calling services, returning standardized responses.
- **Services:** Pure business logic, validation, domain transactions.
- **Data Access:** Prisma queries with multi-tenant filtering.
`
      },
      {
        title: 'API Standards',
        fileName: 'API_STANDARDS.md',
        slug: 'api-standards',
        description: 'RESTful URL conventions, HTTP verbs, and response envelopes.',
        content: `# REST API Conventions

## Response Structure
\`\`\`json
{
  "success": true,
  "message": "Resource retrieved successfully",
  "data": {},
  "meta": { "page": 1, "limit": 20, "total": 100 }
}
\`\`\`

## HTTP Status Codes
- \`200 OK\`: Successful fetch or update
- \`201 Created\`: Resource created
- \`400 Bad Request\`: Schema validation failure
- \`401 Unauthorized\`: Missing or expired token
- \`403 Forbidden\`: Insufficient role or workspace boundary breach
- \`404 Not Found\`: Resource does not exist
- \`409 Conflict\`: Version collision or unique constraint failure
`
      },
      {
        title: 'Database Design',
        fileName: 'DATABASE_DESIGN.md',
        slug: 'database-design',
        description: 'Relational entity relationship diagrams and index strategy.',
        content: `# Database Schema Design

## Entities
- \`User\`, \`Session\`, \`Workspace\`, \`WorkspaceMember\`
- \`Project\`, \`ProjectMember\`, \`Category\`, \`Document\`, \`DocumentVersion\`
- \`Template\`, \`Comment\`, \`ReviewRequest\`, \`ReviewApproval\`, \`ActivityLog\`

## Key Indexes
- \`Document(projectId, categoryId, sortOrder)\`
- \`DocumentVersion(documentId, versionNumber)\`
- \`WorkspaceMember(workspaceId, userId)\`
- \`Category(projectId, parentId)\`
`
      },
      {
        title: 'Authentication Flow',
        fileName: 'AUTHENTICATION.md',
        slug: 'authentication',
        description: 'JWT tokens, refresh token rotation, and password hashing.',
        content: `# Authentication Architecture

1. **Password Hashing:** Argon2id / bcrypt with strong salt rounds.
2. **Access Token:** Short-lived JWT (15 minutes).
3. **Refresh Token:** Cryptographically random hash stored in the database with rotation on every refresh call.
4. **Logout:** Immediate revocation of session and refresh token.
`
      },
      {
        title: 'Authorization & RBAC',
        fileName: 'AUTHORIZATION.md',
        slug: 'authorization',
        description: 'Middleware-driven workspace role checks.',
        content: `# Authorization & RBAC

All protected endpoints enforce:
1. \`authenticateUser\`: Validates bearer token or session cookie.
2. \`requireWorkspaceRole(minRole)\`: Verifies user belongs to target workspace with appropriate privileges.
`
      },
      {
        title: 'Business Logic & Services',
        fileName: 'BUSINESS_LOGIC.md',
        slug: 'business-logic',
        description: 'Service module responsibilities and transactions.',
        content: `# Business Logic & Transactions

- Project creation automatically creates the 8 default blueprint categories and starter documents inside a Prisma interactive transaction.
- Document saves automatically calculate diffs and store snapshot versions.
`
      },
      {
        title: 'Error Handling',
        fileName: 'ERROR_HANDLING.md',
        slug: 'error-handling',
        description: 'Centralized error handler and operational error classification.',
        content: `# Error Handling Strategy

Centralized Express error middleware captures \`AppError\` instances and outputs uniform JSON payloads without leaking internal database stack traces in production.
`
      },
      {
        title: 'Backend Security',
        fileName: 'BACKEND_SECURITY.md',
        slug: 'backend-security',
        description: 'Helmet, CORS, rate limiting, and parameter sanitization.',
        content: `# Backend Security Controls

- Helmet security headers (HSTS, CSP, X-Frame-Options)
- Rate limiting on authentication routes (10 requests per minute)
- Safe archive extraction preventing directory traversal attacks (\`../\`)
`
      }
    ]
  },
  {
    name: 'Infrastructure Documentation',
    slug: '05-infrastructure',
    folderName: '05-infrastructure',
    description: 'Docker, CI/CD pipelines, environment configuration, and cloud topology.',
    sortOrder: 5,
    documents: [
      {
        title: 'Deployment Strategy',
        fileName: 'DEPLOYMENT.md',
        slug: 'deployment',
        description: 'Production container deployment and health checks.',
        content: `# Deployment Strategy

Independent multi-stage Docker builds for the Web client and API service with automated database migrations running during deployment startup.
`
      },
      {
        title: 'Environment Variables',
        fileName: 'ENVIRONMENT_VARIABLES.md',
        slug: 'environment-variables',
        description: 'Configuration variables for web and api.',
        content: `# Environment Variables

## API
- \`DATABASE_URL\`: PostgreSQL connection string
- \`JWT_SECRET\`: Secret for signing access tokens
- \`JWT_REFRESH_SECRET\`: Secret for refresh tokens
- \`PORT\`: Default 4000
- \`CORS_ORIGIN\`: Allowed frontend origins

## Web
- \`NEXT_PUBLIC_API_URL\`: http://localhost:4000/api/v1
`
      },
      {
        title: 'CI/CD Pipeline',
        fileName: 'CI_CD.md',
        slug: 'ci-cd',
        description: 'GitHub Actions workflow stages and quality gates.',
        content: `# CI/CD Workflow

1. Linting & formatting check
2. TypeScript compilation check
3. Unit & Integration test execution
4. Container image build and tag
`
      },
      {
        title: 'Docker Configuration',
        fileName: 'DOCKER.md',
        slug: 'docker',
        description: 'Docker Compose and multi-stage Dockerfiles.',
        content: `# Docker Configuration

Docker Compose orchestrates PostgreSQL, the Express API, and the Next.js frontend with isolated internal networking.
`
      },
      {
        title: 'Cloud Infrastructure',
        fileName: 'CLOUD_INFRASTRUCTURE.md',
        slug: 'cloud-infrastructure',
        description: 'Cloud provider recommendations and networking topology.',
        content: `# Cloud Infrastructure

Recommended architecture: Managed PostgreSQL (AWS RDS / Supabase / Neon) paired with container instances (ECS / Fly.io / Railway / Vercel).
`
      },
      {
        title: 'Monitoring & Logging',
        fileName: 'MONITORING_AND_LOGGING.md',
        slug: 'monitoring-and-logging',
        description: 'Log aggregation and health probe endpoints.',
        content: `# Monitoring & Logging

- Structured JSON logs via Winston / Morgan.
- Health probe endpoints at \`/health\` and \`/api/v1/health\`.
`
      }
    ]
  },
  {
    name: 'Quality and Security Documentation',
    slug: '06-quality-and-security',
    folderName: '06-quality-and-security',
    description: 'Testing strategy, code quality metrics, security standards, and QA.',
    sortOrder: 6,
    documents: [
      {
        title: 'Testing Strategy',
        fileName: 'TESTING_STRATEGY.md',
        slug: 'testing-strategy',
        description: 'Unit, integration, and E2E test coverage benchmarks.',
        content: `# Quality Assurance & Testing Strategy

- Unit testing of services and utilities using Vitest.
- API route integration testing using Supertest.
- Component testing for UI primitives and forms.
`
      },
      {
        title: 'Code Quality',
        fileName: 'CODE_QUALITY.md',
        slug: 'code-quality',
        description: 'Linting rules, static analysis, and code review criteria.',
        content: `# Code Quality Guidelines

- Zero compilation warnings in TypeScript strict mode.
- Pull request templates requiring documentation impact assessment.
`
      },
      {
        title: 'Performance Standards',
        fileName: 'PERFORMANCE.md',
        slug: 'performance',
        description: 'Response time SLAs, bundle size limits, and database query budgets.',
        content: `# Performance Standards

- Frontend Core Web Vitals targets: LCP < 2.5s, FID < 100ms, CLS < 0.1.
- Backend database queries must not exceed 50ms under typical loads.
`
      },
      {
        title: 'Security Standards',
        fileName: 'SECURITY_STANDARDS.md',
        slug: 'security-standards',
        description: 'OWASP Top 10 mitigation checklist and vulnerability scanning.',
        content: `# Security Standards & Compliance

- Input sanitization against XSS in Markdown preview.
- Parameterized SQL queries via Prisma to eliminate SQL injection.
- Strict rate limiting and CSRF protections.
`
      },
      {
        title: 'Accessibility Verification',
        fileName: 'ACCESSIBILITY.md',
        slug: 'accessibility-standards',
        description: 'Automated and manual accessibility auditing.',
        content: `# Accessibility Verification

Automated checks with axe-core and keyboard navigation verification across all modal flows.
`
      }
    ]
  },
  {
    name: 'Data and Integrations',
    slug: '07-data-and-integrations',
    folderName: '07-data-and-integrations',
    description: 'Data models, integration guidelines, event schemas, and external systems.',
    sortOrder: 7,
    documents: [
      {
        title: 'Data Management',
        fileName: 'DATA_MANAGEMENT.md',
        slug: 'data-management',
        description: 'Data lifecycle, retention rules, and migration guidelines.',
        content: `# Data Management & Retention

- Soft deletion for critical user entities with 30-day purge grace periods.
- Document versions retained indefinitely for audit trail integrity.
`
      },
      {
        title: 'Integration Standards',
        fileName: 'INTEGRATION_STANDARDS.md',
        slug: 'integration-standards',
        description: 'Third-party webhook standards and external API integrations.',
        content: `# Third-Party Integration Standards

Webhook payloads formatted with ISO timestamps, event type identifiers, and HMAC-SHA256 signature verification.
`
      },
      {
        title: 'Event-Driven Architecture',
        fileName: 'EVENT_DRIVEN_ARCHITECTURE.md',
        slug: 'event-driven-architecture',
        description: 'Internal domain events and activity log pub-sub.',
        content: `# Event-Driven Architecture

Activity logging triggers asynchronous audit records whenever significant mutations occur (document updates, approvals, exports).
`
      }
    ]
  },
  {
    name: 'Operations and Governance',
    slug: '08-operations-and-governance',
    folderName: '08-operations-and-governance',
    description: 'Incident runbooks, backup recovery, Git workflows, and changelog management.',
    sortOrder: 8,
    documents: [
      {
        title: 'Monitoring and Observability',
        fileName: 'MONITORING_AND_OBSERVABILITY.md',
        slug: 'monitoring-and-observability',
        description: 'Metrics, alerts, and tracing setup.',
        content: `# Observability & Alerting

System health indicators, error rate alerting (> 1% over 5m window), and CPU/memory threshold monitors.
`
      },
      {
        title: 'Incident Management',
        fileName: 'INCIDENT_MANAGEMENT.md',
        slug: 'incident-management',
        description: 'Severity matrix, escalation pathways, and post-mortem procedures.',
        content: `# Incident Response Runbook

- **SEV-1 (Critical Outage):** Complete service unavailability. On-call engineer paged within 5 minutes.
- **SEV-2 (Degraded Performance):** Feature impairment with workaround. Response within 30 minutes.
- **SEV-3 (Minor Bug):** Addressed in standard sprint backlog.
`
      },
      {
        title: 'Backup and Recovery',
        fileName: 'BACKUP_AND_RECOVERY.md',
        slug: 'backup-and-recovery',
        description: 'Database snapshots, restore drill procedures, and RTO/RPO targets.',
        content: `# Backup & Disaster Recovery

- Automated daily PostgreSQL database dumps.
- Recovery Point Objective (RPO): < 1 hour.
- Recovery Time Objective (RTO): < 2 hours.
`
      },
      {
        title: 'Development Workflow',
        fileName: 'DEVELOPMENT_WORKFLOW.md',
        slug: 'development-workflow',
        description: 'Local development environment setup and developer onboarding.',
        content: `# Developer Onboarding & Workflow

1. Clone repository
2. Configure \`.env\`
3. Run \`pnpm install\`
4. Run \`pnpm db:push\` and \`pnpm db:seed\`
5. Start local stack: \`pnpm dev\`
`
      },
      {
        title: 'Git Workflow',
        fileName: 'GIT_WORKFLOW.md',
        slug: 'git-workflow',
        description: 'Branching strategy, conventional commits, and release tags.',
        content: `# Git Branching & Conventional Commits

- \`main\`: Production-ready code
- \`develop\`: Integration branch
- \`feature/<ticket-description>\`: Feature branches
- Conventional commit syntax: \`feat:\`, \`fix:\`, \`docs:\`, \`refactor:\`, \`test:\`
`
      },
      {
        title: 'Changelog',
        fileName: 'CHANGELOG.md',
        slug: 'changelog',
        description: 'Version release notes and upgrade migration records.',
        content: `# Changelog

All notable changes to DevBlueprint will be documented in this file following Keep a Changelog standards.

## [1.0.0] - Initial Release
- Multi-tenant workspace architecture
- Full Markdown document editor with auto-save & versioning
- Predefined engineering blueprint structure
- ZIP Import & Export
- Role-based collaboration, comments & reviews
`
      }
    ]
  }
];

