import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const rootTemplates: SeedTemplateDoc[] = [
  {
    id: 'root-readme',
    fileName: 'README.md',
    relativePath: 'README.md',
    title: 'Project Readme',
    description: 'Master entry point, project vision, setup instructions, and repository guide.',
    categorySlug: 'root',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['core', 'onboarding', 'root'],
    version: '1.0.0',
    content: `# [PROJECT_NAME]

> **[PROJECT_NAME]** — Enterprise software engineering workspace and architectural blueprint specification.

---

## 1. Executive Overview

[PROJECT_NAME] is an enterprise-grade platform designed to solve [PRIMARY_BUSINESS_OBJECTIVE]. This repository houses the source code, architecture specifications, API contracts, and engineering operational runbooks.

- **Status:** In Active Architecture & Development
- **Target Platform:** Web, Cloud Microservices, and Mobile API Clients
- **License:** Proprietary / Enterprise Internal

---

## 2. Technology Stack

| Layer | Primary Technology | Fallback / Alternatives | Purpose |
|---|---|---|---|
| **Frontend Framework** | [FRONTEND_FRAMEWORK] | React / Next.js | Modern, reactive user interface with server rendering |
| **Backend Runtime** | [BACKEND_FRAMEWORK] | Node.js / Express / NestJS | High-throughput, stateless REST & GraphQL services |
| **Primary Database** | [PROJECT_DATABASE] | PostgreSQL / MySQL | Relational data persistence with strict ACID compliance |
| **Cache & Queue** | Redis | KeyDB / Memcached | In-memory session cache and distributed task queues |
| **Cloud Infrastructure** | [DEPLOYMENT_PROVIDER] | AWS / GCP / Kubernetes | Containerized runtime orchestration and edge CDN delivery |
| **CI/CD Pipeline** | GitHub Actions | GitLab CI / ArgoCD | Automated linting, test suites, and zero-downtime deployment |

---

## 3. High-Level Architecture

\`\`\`mermaid
flowchart TD
    Client["Client Devices (Web / Mobile)"] --> CDN["CloudFront / Fastly CDN"]
    CDN --> LB["Application Load Balancer"]
    LB --> Gateway["API Gateway / Reverse Proxy"]
    
    subgraph Core Services
        Gateway --> AuthSvc["Authentication Service"]
        Gateway --> CoreApp["Core Application Service"]
        Gateway --> WorkerSvc["Background Workers"]
    end
    
    subgraph Data Tier
        AuthSvc --> DB[("[PROJECT_DATABASE]")]
        CoreApp --> DB
        CoreApp --> Cache[("Redis Cache")]
        WorkerSvc --> Queue[("Message Broker / BullMQ")]
    end
\`\`\`

---

## 4. Repository Directory Structure

\`\`\`text
project/
├── README.md               # Master repository orientation and documentation index
├── AGENTS.md               # Mandatory operating guardrails for AI coding agents
├── CONTRIBUTING.md         # Engineering guidelines, pull request protocols, and standards
├── CHANGELOG.md            # Semantic version release notes and change logs
├── PROJECT-OVERVIEW.md     # In-depth executive problem statement and system boundary
│
└── docs/                   # 12-Factor engineering documentation blueprint
    ├── 01-project/         # Product requirements, user stories, acceptance criteria
    ├── 02-architecture/    # System architecture, data flow diagrams, ADR records
    ├── 03-design-system/   # Color tokens, typography, spacing, themes, accessibility
    ├── 04-ui-components/   # Component catalog specs, patterns, and guidelines
    ├── 05-page-design/     # Views, layout templates, responsive page blueprints
    ├── 06-frontend/        # Client architecture, routing, state, performance
    ├── 07-backend/         # Server guidelines, API design, middleware, auth
    ├── 08-database/        # Schema diagrams, relations, indexes, migration runbooks
    ├── 09-security/        # OWASP checklist, threat modeling, rate limits, crypto
    ├── 10-testing/         # Unit, integration, E2E, load, and accessibility testing
    ├── 11-devops/          # Docker, Kubernetes, CI/CD pipelines, release procedures
    └── 12-maintenance/     # Monitoring, APM alerts, incident response, technical debt
\`\`\`

---

## 5. Prerequisites & Environment Setup

Ensure you have the following installed locally before launching:

1. **Node.js**: \`>= 20.x LTS\`
2. **Package Manager**: \`pnpm >= 9.x\` or \`npm >= 10.x\`
3. **Database**: [PROJECT_DATABASE] instance running locally or via Docker
4. **Git**: \`>= 2.40\`

\`\`\`bash
# 1. Clone the repository
git clone https://github.com/organization/[PROJECT_NAME].git
cd [PROJECT_NAME]

# 2. Install workspace dependencies
pnpm install

# 3. Configure local environment variables
cp .env.example .env

# 4. Initialize database schema & seed starter data
pnpm db:push
pnpm db:seed

# 5. Start development servers
pnpm dev
\`\`\`

---

## 6. Documentation Navigation & Reading Order

- **New Developers:** Read [PROJECT-OVERVIEW.md](./PROJECT-OVERVIEW.md) first, then [docs/02-architecture/SYSTEM-ARCHITECTURE.md](./docs/02-architecture/SYSTEM-ARCHITECTURE.md).
- **Frontend Engineers:** Review [docs/03-design-system/DESIGN-SYSTEM.md](./docs/03-design-system/DESIGN-SYSTEM.md) and [docs/06-frontend/FRONTEND-GUIDELINES.md](./docs/06-frontend/FRONTEND-GUIDELINES.md).
- **Backend Engineers:** Review [docs/07-backend/API-DESIGN.md](./docs/07-backend/API-DESIGN.md) and [docs/08-database/DATABASE-SCHEMA.md](./docs/08-database/DATABASE-SCHEMA.md).
- **AI Coding Agents:** You **must** comply with all guidelines in [AGENTS.md](./AGENTS.md).
`
  },
  {
    id: 'root-agents',
    fileName: 'AGENTS.md',
    relativePath: 'AGENTS.md',
    title: 'AI Coding Agent Guardrails & Operating Standards',
    description: 'Mandatory rules, architectural boundaries, and pre-flight checklist for AI agents.',
    categorySlug: 'root',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['ai', 'governance', 'standards'],
    version: '1.0.0',
    content: `# AI Coding Agent Operating Guardrails (AGENTS.md)

> **MANDATORY POLICY:** All AI coding assistants, automated agents, Copilots, and LLM code synthesizers must strictly adhere to the guidelines set forth in this document before writing, editing, or refactoring code in this repository.

---

## 1. Prime Directives

1. **Read Before Writing:** Always inspect existing documentation in \`docs/\` and verify current patterns in the codebase before introducing any new code or modifying existing models.
2. **Never Invent Architectural Decisions:** If an architectural choice (e.g. database choice, external payment gateway, caching provider) is represented by a placeholder like \`[PROJECT_DATABASE]\`, do NOT fabricate an unconfirmed technology choice. Ask or adhere to the configured default.
3. **Preserve Documentation Integrity:** When you alter schemas, API contracts, or core interfaces, you **must** update the corresponding Markdown documentation in \`docs/\`.
4. **Zero Unvalidated Assumptions:** Never make speculative assumptions regarding business logic, authorization rules, or security boundaries.

---

## 2. Pre-Flight Checklist for Agents

Before generating any code or executing edits, perform the following verification:

- [ ] Has the relevant architectural documentation in \`docs/02-architecture/\` been reviewed?
- [ ] Are existing UI components in \`docs/04-ui-components/\` being reused instead of creating duplicate primitives?
- [ ] Does the change comply with the database schema in \`docs/08-database/DATABASE-SCHEMA.md\`?
- [ ] Are all security considerations from \`docs/09-security/OWASP-CHECKLIST.md\` respected?
- [ ] Are proper TypeScript types used without reverting to \`any\` or suppressing compiler errors?

---

## 3. Component & Design System Adherence

\`\`\`text
DO NOT:
  ❌ Inject arbitrary hardcoded hex color codes (e.g. #3b82f6) directly into JSX.
  ❌ Re-implement custom buttons, modals, dropdowns, or inputs when shared components exist.
  ❌ Break responsive layout breakpoints or bypass theme tokens.

DO:
  ✅ Use semantic tokens (e.g. text-foreground, bg-background, text-primary).
  ✅ Leverage existing primitives from the shared UI package.
  ✅ Test components in both Light and Dark mode.
\`\`\`

---

## 4. Security & Safety Guardrails

- **Zero Hardcoded Secrets:** Never insert API keys, database credentials, passwords, or JWT secrets in code or commits. Always refer to \`process.env\` validated with Zod/envalid.
- **SQL & Query Injection:** Always use parameterized queries or ORM queries (Prisma/TypeORM). Never concatenate strings into raw SQL queries.
- **Input Sanitization:** All user inputs must be validated at the transport boundary using Zod schemas.
- **Tenant Isolation:** Every database query affecting workspace data must explicitly scope to the authenticated \`workspaceId\` or \`userId\`.

---

## 5. Prohibited Actions

- **Never force-push or bypass branch protection rules.**
- **Never delete or overwrite user documentation without explicit consent.**
- **Never disable ESLint rules, TypeScript checks, or unit test suites to make builds pass.**
- **Never install unauthorized third-party npm packages without validating bundle impact and license.**
`
  },
  {
    id: 'root-contributing',
    fileName: 'CONTRIBUTING.md',
    relativePath: 'CONTRIBUTING.md',
    title: 'Contributor Guidelines & Code Standards',
    description: 'Engineering workflows, git conventions, PR checklists, and review processes.',
    categorySlug: 'root',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['workflow', 'git', 'collaboration'],
    version: '1.0.0',
    content: `# Contributing to [PROJECT_NAME]

Thank you for contributing to [PROJECT_NAME]. To maintain high velocity, architectural consistency, and code quality across our engineering team, all contributors must follow these standards.

---

## 1. Code of Conduct

We are committed to providing a welcoming, inclusive, and harassment-free environment for all contributors regardless of experience level, identity, or background. Treat colleagues with technical respect and constructive collaboration.

---

## 2. Git Branching Strategy

We follow a modified **GitHub Flow** with trunk-based development:

- \`main\` is protected, production-ready, and deployable at all times.
- Feature branches branch directly off \`main\` and merge via squash-and-merge Pull Requests.

### Branch Naming Conventions

| Prefix | Usage | Example |
|---|---|---|
| \`feat/\` | New user-facing or platform functionality | \`feat/workspace-rbac-matrix\` |
| \`fix/\` | Bug fixes and defect remediation | \`fix/markdown-preview-scroll-sync\` |
| \`perf/\` | Performance optimizations | \`perf/virtualized-doc-tree-rendering\` |
| \`refactor/\` | Code restructuring without behavioral change | \`refactor/split-api-client-middleware\` |
| \`docs/\` | Documentation blueprint updates | \`docs/update-architecture-data-flow\` |
| \`test/\` | Adding or correcting test suites | \`test/add-auth-e2e-playwright\` |

---

## 3. Conventional Commits

Commit messages must adhere strictly to the [Conventional Commits v1.0.0](https://www.conventionalcommits.org/) specification:

\`\`\`text
<type>(<optional scope>): <description>

[optional body]

[optional footer(s)]
\`\`\`

**Examples:**
- \`feat(auth): add refresh token rotation and revocation endpoint\`
- \`fix(editor): prevent cursor jump on debounced autosave\`
- \`docs(architecture): update mermaid sequence for two-phase commit\`

---

## 4. Pull Request Requirements

Every pull request must meet the following criteria before being eligible for review:

1. **Title:** Follows conventional commit format.
2. **Description:** Explains the *why* behind the change, not just the *what*.
3. **Tests:** New functionality must include unit or integration test coverage.
4. **Clean CI:** All automated pipelines (lint, typecheck, unit tests, build) must pass green.
5. **No Regressions:** Existing test suites continue to pass without modification unless requirements changed.
6. **Documentation Updated:** Any changed API endpoints or database schemas have matching updates in \`docs/\`.
`
  },
  {
    id: 'root-changelog',
    fileName: 'CHANGELOG.md',
    relativePath: 'CHANGELOG.md',
    title: 'Project Changelog',
    description: 'Chronological record of notable features, fixes, and schema changes.',
    categorySlug: 'root',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['releases', 'versions', 'history'],
    version: '1.0.0',
    content: `# Changelog

All notable changes to **[PROJECT_NAME]** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Added
- Enterprise documentation blueprint structure across 12 engineering categories.
- Real-time markdown workspace with split editor, AST parser, and syntax highlighting.
- Role-based access control (Owner, Admin, Editor, Viewer) for multi-tenant workspaces.
- Document revision snapshot engine with diff comparison and instant rollback.
- Full zip import/export supporting complete nested folder hierarchies.

### Changed
- Standardized API response envelope to unified \`{ success, data, message, meta }\`.
- Clamped responsive sidebar width with persistent user layout preferences.

---

## [0.1.0] - 2026-11-01

### Added
- Initial project scaffolding and modular architecture foundation.
- Database schema definitions for Workspaces, Projects, Categories, Documents, and Versions.
- JWT authentication pipeline with HTTP-only refresh cookie rotation.
- Core UI component primitives (Button, Card, Input, Dialog, Badge, Progress).
`
  },
  {
    id: 'root-project-overview',
    fileName: 'PROJECT-OVERVIEW.md',
    relativePath: 'PROJECT-OVERVIEW.md',
    title: 'Executive Project Overview & Strategy',
    description: 'Executive summary, target audience, core modules, and system boundaries.',
    categorySlug: 'root',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['strategy', 'vision', 'scope'],
    version: '1.0.0',
    content: `# Project Overview & Strategic Blueprint: [PROJECT_NAME]

---

## 1. Executive Summary

[PROJECT_NAME] is an enterprise platform developed to deliver [PRIMARY_BUSINESS_VALUE]. Modern engineering teams face friction when technical specifications, architectural decisions, and operational runbooks are fragmented across disparate wikis, chat threads, and code comments. 

[PROJECT_NAME] centralizes documentation, blueprints, design tokens, and system guidelines into a single authoritative, version-controlled repository directly synchronized with software delivery.

---

## 2. Business Problem & Opportunity

### The Problem
- **Knowledge Fragmentation:** Architectural decisions are lost in transient Slack/Teams messages, leading to repeated mistakes.
- **Onboarding Lag:** New engineers require weeks to understand system architecture, data models, and component guidelines.
- **Drift Between Code & Docs:** Documentation becomes stale within sprints of being written, destroying organizational trust.
- **Compliance & Security Blindspots:** Lack of centralized auditing and security policies delays enterprise customer sign-offs.

### The Solution
- **Code-Adjacent Living Blueprints:** Documentation lives side-by-side with code and is tracked in git.
- **Deterministic 12-Category Hierarchy:** Standardized categorization leaves zero ambiguity on where documentation belongs.
- **AI-Agent Ready Guardrails:** Built-in specifications allow AI coding agents to produce compliant code on first pass.

---

## 3. Target Audience & Personas

| Persona | Primary Goals | Key Friction Solved |
|---|---|---|
| **Lead Architect** | Ensure uniform design patterns, evaluate ADRs, enforce data integrity | No more ad-hoc unvetted database schema changes |
| **Full-Stack Developer** | Quickly reference API contracts, reuse UI components, write code faster | Eliminates guesswork regarding payload formats and design tokens |
| **DevOps / SRE Lead** | Streamline CI/CD, monitor SLAs, ensure reliable incident runbooks | Centralized runbooks with step-by-step mitigation workflows |
| **Engineering Director** | Track documentation completion rates and compliance readiness | Real-time visibility into project documentation velocity |

---

## 4. System Boundaries & Boundary Diagram

\`\`\`mermaid
flowchart LR
    subgraph External Systems
        GitHub["GitHub / GitLab VCS"]
        OAuth["Identity Provider (SSO / OIDC)"]
        S3["Object Storage (S3 / GCS)"]
    end
    
    subgraph Core Platform Boundaries
        API["[PROJECT_NAME] API Tier"]
        UI["[PROJECT_NAME] Web Workspace"]
        Workers["Async Background Workers"]
        DB[("[PROJECT_DATABASE]")]
    end
    
    UI --> API
    API --> DB
    Workers --> DB
    API --> S3
    API --> OAuth
    API --> GitHub
\`\`\`

---

## 5. Core Platform Modules

1. **Workspace & Identity Governance:** Multi-tenant organization isolation, RBAC permissions, and team member management.
2. **Project Blueprint Engine:** Automated provisioning of 12-category documentation structures.
3. **Markdown Engineering Workspace:** Split-view editor, live Markdown preview, AST table of contents, and syntax highlighting.
4. **Document Revision Snapshotting:** Version history with author tracking and change summaries.
5. **Import & Export Pipeline:** Lossless bidirectional export and import of ZIP archives.
`
  }
];
