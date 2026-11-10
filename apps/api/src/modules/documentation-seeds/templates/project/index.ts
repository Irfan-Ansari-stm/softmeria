import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const projectTemplates: SeedTemplateDoc[] = [
  {
    id: '01-project-requirements',
    fileName: 'PROJECT-REQUIREMENTS.md',
    relativePath: 'docs/01-project/PROJECT-REQUIREMENTS.md',
    title: 'Project Requirements Specification',
    description: 'Functional, non-functional, business, and operational requirements.',
    categorySlug: '01-project',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['requirements', 'scope', 'spec'],
    version: '1.0.0',
    content: `# Project Requirements Specification: [PROJECT_NAME]

---

## 1. Document Purpose & Scope

This document defines the functional and non-functional requirements for **[PROJECT_NAME]**. It serves as the authoritative baseline for engineering implementation, quality assurance test matrices, and stakeholder acceptance sign-offs.

---

## 2. Business Objectives

- **BO-1:** Provide a centralized platform that reduces developer onboarding time from weeks to under 3 days.
- **BO-2:** Standardize architectural decision records (ADRs) to eliminate technical debt drift.
- **BO-3:** Guarantee 99.9% platform availability with disaster recovery RTO < 1 hour and RPO < 15 minutes.

---

## 3. Functional Requirements (FR)

| ID | Module | Requirement Description | Priority |
|---|---|---|---|
| **FR-101** | Auth | Users can register, log in, manage sessions, and reset credentials via secure tokens. | Critical |
| **FR-102** | Multi-Tenancy | Workspaces enforce strict tenant isolation with zero cross-tenant query contamination. | Critical |
| **FR-103** | Blueprint | Projects can provision 12 predefined categories with all structured markdown documents. | Critical |
| **FR-104** | Editor | Markdown workspace supports split-view editing, live preview, and AST outline generation. | High |
| **FR-105** | Snapshots | Creating or updating documents stores immutable version history with rollback support. | High |
| **FR-106** | Export | Full project workspaces can be exported as clean, standard ZIP archives preserving directory tree. | High |
| **FR-107** | Search | Global search indexed across project titles, tags, content, and file names with Ctrl+K shortcut. | Medium |
| **FR-108** | Review | Team members can submit review requests, leave comments, and record approvals. | Medium |

---

## 4. Non-Functional Requirements (NFR)

### 4.1 Performance & Latency
- API endpoint P95 latency must remain **below 150ms** under normal load.
- Markdown editor autosave must debounce at 1,000ms with zero perceptible UI blocking.

### 4.2 Security & Compliance
- Passwords must be hashed using **bcrypt** (cost 10+) or **Argon2id**.
- JWT access tokens must expire within **15 minutes**; refresh tokens must be stored in \`HttpOnly\`, \`SameSite=Lax\` cookies with database revocation tracking.
- All input fields must be validated with strict Zod schemas against injection attacks.

### 4.3 Reliability & Scalability
- System must support stateless horizontal scaling behind a reverse proxy / load balancer.
- PostgreSQL database connections must be pooled with max pool limits configured.

---

## 5. Technical Constraints & Dependencies

- **Database:** Must utilize [PROJECT_DATABASE] with foreign key relational integrity.
- **Node Runtime:** Node.js 20.x LTS or higher.
- **Client Support:** Modern evergreen browsers (Chrome, Firefox, Safari, Edge). IE11 not supported.

---

## 6. Open Questions & Confirmation Items

- [ ] *[PROJECT_DATABASE] Version Confirmation:* Verify cloud managed provider (AWS Aurora vs Neon vs Supabase vs Self-Hosted).
- [ ] *Search Indexing Engine:* Determine if native PostgreSQL full-text search is sufficient for V1 or if MeiliSearch / Elastic is needed for V2.
`
  },
  {
    id: '01-feature-specification',
    fileName: 'FEATURE-SPECIFICATION.md',
    relativePath: 'docs/01-project/FEATURE-SPECIFICATION.md',
    title: 'Feature Specification Matrix',
    description: 'Detailed feature descriptions, user flows, and technical dependencies.',
    categorySlug: '01-project',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['features', 'spec', 'ux'],
    version: '1.0.0',
    content: `# Feature Specification Matrix: [PROJECT_NAME]

---

## 1. Feature Prioritization (MoSCoW Framework)

### Must Have (P0)
- User Authentication (Email/Password, Session Revocation)
- Workspace Management (Multi-tenant isolation, Role Assignment)
- Project Creation with Automated Blueprint Seeding
- Full-Featured Markdown Editor with Live Preview
- Document Hierarchy & Category Tree Management
- Lossless ZIP Export & Import

### Should Have (P1)
- Document Version History & Visual Diff Comparison
- Global Command Palette / Search (Ctrl+K)
- Dark / Light Theme System with CSS Custom Properties
- Team Activity Feed & Audit Logging

### Could Have (P2)
- Real-time Collaborative Editing via WebSockets (Yjs / CRDT)
- AI Document Generation Assistant
- Third-Party Webhook Notifications (Slack, Discord)

### Won't Have (V1 Out of Scope)
- Native Mobile App (iOS / Android)
- Enterprise SAML / Okta SSO (Scheduled for V2)

---

## 2. Core User Flows

\`\`\`mermaid
flowchart TD
    Start["User Logs In"] --> Dash["Workspace Dashboard"]
    Dash --> CreateProj["Click 'Create Project'"]
    CreateProj --> ChooseBlueprint["Select 'Full Enterprise Blueprint'"]
    ChooseBlueprint --> SeedEngine["Provision 12 Categories & 130 Docs"]
    SeedEngine --> ProjWorkspace["Redirect to Project Workspace"]
    ProjWorkspace --> EditDoc["Select & Edit Document in Markdown"]
    EditDoc --> Autosave["Debounced Autosave & Snapshot Created"]
\`\`\`

---

## 3. Edge Cases & Error Handling

1. **Duplicate Slugs:** Project and document slugs must automatically append incremental numeric suffixes (\`-1\`, \`-2\`) when colliding within a tenant.
2. **Offline Resilience:** If network connectivity drops during active document editing, local unsaved buffer must persist in browser storage until connection is re-established.
3. **Zip Slip Protection:** File import extraction must normalize paths and reject directory traversal sequences (\`..\`).
`
  },
  {
    id: '01-user-stories',
    fileName: 'USER-STORIES.md',
    relativePath: 'docs/01-project/USER-STORIES.md',
    title: 'User Stories & Epics',
    description: 'Agile persona-driven user stories with acceptance criteria references.',
    categorySlug: '01-project',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['agile', 'stories', 'epics'],
    version: '1.0.0',
    content: `# User Stories & Epics: [PROJECT_NAME]

---

## Epic 1: Project Setup & Automated Blueprinting

### US-101: Full Enterprise Blueprint Generation
> **As an** Engineering Lead,  
> **I want to** initialize a project with a pre-configured 12-category enterprise documentation blueprint,  
> **So that** my entire team immediately has a standardized structure for architecture, APIs, design systems, and DevOps.

- **Story Points:** 5
- **Priority:** Critical (P0)
- **Acceptance Criteria:** Given a new project creation request with "Full Blueprint" selected, all 12 categories and 130 structured files are generated within a database transaction.

### US-102: Minimal Blueprint Generation
> **As a** Developer building a quick microservice,  
> **I want to** select a minimal documentation blueprint,  
> **So that** I only seed core requirements, architecture, and deployment files without unnecessary overhead.

---

## Epic 2: Living Document Authoring

### US-201: Live Split Markdown Editor
> **As a** Technical Writer or Developer,  
> **I want to** author documentation in a split-screen editor with synchronized scrolling,  
> **So that** I can preview formatting, syntax-highlighted code blocks, and diagrams in real time.

### US-202: Document Versioning & Change Logs
> **As an** Architect,  
> **I want to** view previous versions of an architecture document and understand who made what changes,  
> **So that** we maintain full governance and can revert regressions if needed.

---

## Epic 3: Portability & Interoperability

### US-301: Full Workspace Export
> **As a** DevOps Engineer,  
> **I want to** export the entire project documentation as a standard ZIP archive,  
> **So that** I can commit it directly into a Git repository or publish it to static documentation sites.
`
  },
  {
    id: '01-acceptance-criteria',
    fileName: 'ACCEPTANCE-CRITERIA.md',
    relativePath: 'docs/01-project/ACCEPTANCE-CRITERIA.md',
    title: 'Acceptance Criteria & Test Scenarios',
    description: 'Given-When-Then criteria for automated testing and QA validation.',
    categorySlug: '01-project',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['qa', 'testing', 'acceptance'],
    version: '1.0.0',
    content: `# Acceptance Criteria (Gherkin Scenarios): [PROJECT_NAME]

---

## Scenario 1: Provisioning Enterprise Documentation Blueprint

\`\`\`gherkin
Feature: Enterprise Documentation Seed Generation

  Scenario: Creating a new project with Full Enterprise Blueprint
    Given an authenticated user Sarah with role "OWNER" in workspace "Acme Engineering"
    When Sarah submits a new project with name "Fintech Core" and blueprintOption "FULL"
    Then the system creates the project "Fintech Core"
    And creates 13 categories (1 Root + 12 Engineering categories)
    And creates exactly 130 document records with status "DRAFT" or "NOT_STARTED"
    And creates initial version snapshots (v1) for all 130 documents
    And logs a "PROJECT_CREATED" activity log
    And returns the project with completionPercentage equal to 0
\`\`\`

---

## Scenario 2: Documentation Progress Calculation

\`\`\`gherkin
Feature: Documentation Progress Calculation

  Scenario: Calculating completion percentage based on required documents
    Given a project with 10 required documents and 5 optional documents
    When 5 required documents have status "COMPLETED"
    And 2 optional documents have status "COMPLETED"
    Then the total required count is 10
    And the completed required count is 5
    And the completionPercentage is calculated as 50%
    And optional completed documents do not inflate or deflate the percentage
\`\`\`

---

## Scenario 3: Idempotent Seed Execution

\`\`\`gherkin
Feature: Seed Idempotency

  Scenario: Re-running blueprint seed on an existing project
    Given an existing project with already seeded documentation
    And the user has modified "docs/02-architecture/SYSTEM-ARCHITECTURE.md"
    When the seed service is executed again on the same project
    Then no duplicate categories or documents are created
    And the user's customized content in "SYSTEM-ARCHITECTURE.md" is preserved without overwrite
\`\`\`
`
  },
  {
    id: '01-product-roadmap',
    fileName: 'PRODUCT-ROADMAP.md',
    relativePath: 'docs/01-project/PRODUCT-ROADMAP.md',
    title: 'Product Roadmap & Engineering Milestones',
    description: 'Quarterly milestones, feature deliverables, and strategic horizons.',
    categorySlug: '01-project',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['roadmap', 'milestones', 'planning'],
    version: '1.0.0',
    content: `# Product Roadmap & Milestones: [PROJECT_NAME]

---

## 1. Roadmap Timeline

\`\`\`mermaid
gantt
    title [PROJECT_NAME] Engineering Delivery Schedule
    dateFormat  YYYY-MM-DD
    section Phase 1: Core Foundation
    Auth & Workspace Multi-Tenancy  :done, 2026-10-01, 2026-10-20
    Enterprise Blueprint Engine     :active, 2026-10-21, 2026-11-10
    Markdown Editor & Split View   :done, 2026-10-25, 2026-11-05
    section Phase 2: Collaboration
    Review Requests & Approvals    :2026-11-11, 2026-11-25
    Document Version Diffs & Revert:2026-11-20, 2026-12-05
    Global Search & AST Indexing   :2026-12-01, 2026-12-15
    section Phase 3: Scale & Automations
    CI/CD Git Sync Integration    :2026-12-16, 2027-01-15
    AI Documentation Copilot       :2027-01-10, 2027-02-15
\`\`\`

---

## 2. Release Milestones

### Milestone 1.0 (MVP Platform Release)
- Multi-tenant tenant workspace isolation.
- Full 12-category documentation generator with 130 templates.
- Markdown workspace with syntax highlighting and table of contents.
- Lossless ZIP export and import.

### Milestone 1.1 (Governance & Reviews)
- Peer review workflows with formal sign-off approvals.
- Visual side-by-side markdown version diff comparisons.
- Full workspace audit trail.

### Milestone 2.0 (Ecosystem Sync)
- Bi-directional GitHub / GitLab repository synchronization.
- Automated static site deployment pipeline (Starlight / Nextra).
`
  }
];
