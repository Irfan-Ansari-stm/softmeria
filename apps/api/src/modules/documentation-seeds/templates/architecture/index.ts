import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const architectureTemplates: SeedTemplateDoc[] = [
  {
    id: '02-system-architecture',
    fileName: 'SYSTEM-ARCHITECTURE.md',
    relativePath: 'docs/02-architecture/SYSTEM-ARCHITECTURE.md',
    title: 'System Architecture Specification',
    description: 'High-level architectural design, system boundaries, components, and communication protocols.',
    categorySlug: '02-architecture',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['architecture', 'system', 'design'],
    version: '1.0.0',
    content: `# System Architecture Specification: [PROJECT_NAME]

---

## 1. Architectural Style & Principles

[PROJECT_NAME] is architected as a **Modular Monolith** transitioning to **Event-Driven Services** at scale. This balances rapid development velocity and type safety with clear physical and logical module boundaries.

### Core Architectural Principles
1. **Stateless Core:** The API application tier carries zero in-memory session state, allowing instant horizontal scaling.
2. **Database as Single Source of Truth:** Relational integrity, foreign keys, and transactions are strictly enforced in [PROJECT_DATABASE].
3. **Defense in Depth:** Validation and authorization checks occur at both network, transport, controller, and service boundaries.
4. **Idempotent Operations:** State-mutating APIs support idempotency tokens to handle network retries safely.

---

## 2. Component Diagram

\`\`\`mermaid
graph TD
    User["End User (Browser / API Client)"] --> Ingress["Ingress / Reverse Proxy (Nginx / Cloudflare)"]
    
    subgraph Frontend Layer
        Ingress --> NextWeb["Web Application ([FRONTEND_FRAMEWORK])"]
    end
    
    subgraph API & Application Layer
        Ingress --> ExpressAPI["Core REST API ([BACKEND_FRAMEWORK])"]
        ExpressAPI --> AuthModule["Auth & Identity Module"]
        ExpressAPI --> ProjectModule["Project & Blueprint Module"]
        ExpressAPI --> DocModule["Document & Version Engine"]
        ExpressAPI --> ExportModule["Import / Export Pipeline"]
    end
    
    subgraph Persistence Layer
        ExpressAPI --> DB[("[PROJECT_DATABASE]")]
        ExpressAPI --> RedisCache[("Redis Cache & Pub/Sub")]
        ExportModule --> TempStorage["Ephemeral Storage (Buffer / FS)"]
    end
\`\`\`

---

## 3. Communication Protocols

| Channel | Protocol | Payload Format | Usage |
|---|---|---|---|
| **Client to API** | HTTPS / HTTP/2 | JSON | Primary REST communication |
| **API to Database** | TCP (Pooled) | Binary Wire Protocol | Relational queries and transactional mutations |
| **API to Cache** | TCP | Redis RESP | Session tokens, rate limit counters, transient data |
| **File Export** | HTTPS Streaming | Application/Zip | Large workspace export downloads |

---

## 4. Scalability & Resilience

- **Horizontal Scaling:** API instances run in Docker containers managed by [DEPLOYMENT_PROVIDER].
- **Connection Management:** Connection pooling handled via Prisma and PgBouncer.
- **Failover:** Automated health probes at \`/health\` with automated container recreation.
`
  },
  {
    id: '02-frontend-architecture',
    fileName: 'FRONTEND-ARCHITECTURE.md',
    relativePath: 'docs/02-architecture/FRONTEND-ARCHITECTURE.md',
    title: 'Frontend Architecture Specification',
    description: 'Client architecture, state management hierarchy, routing, and styling pipeline.',
    categorySlug: '02-architecture',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'react', 'nextjs'],
    version: '1.0.0',
    content: `# Frontend Architecture Specification: [PROJECT_NAME]

---

## 1. Client Technology Foundation

The frontend application is constructed using **[FRONTEND_FRAMEWORK]** with TypeScript in strict mode.

- **Routing:** Next.js App Router with Route Groups and Nested Layouts.
- **Styling:** Tailwind CSS with CSS Variables for theme switching.
- **Iconography:** Lucide Icons.
- **Rendering Strategy:** Server Components for static shells, Client Components for interactive editors and modals.

---

## 2. State Management Hierarchy

\`\`\`mermaid
flowchart TD
    URLState["1. URL & Search Param State (Nuqs / Next Navigation)"] --> Router["Deep linkable filters, active tabs, action modals"]
    ServerState["2. Server Cache State (TanStack React Query)"] --> QueryCache["Projects, documents, categories, team members"]
    GlobalClient["3. Ephemeral Global State (Zustand)"] --> LocalStore["Auth session, theme, layout widths, mobile drawers"]
    ComponentState["4. Local Component State (useState / useReducer)"] --> FormState["Form inputs, dropdown open states, hover tools"]
\`\`\`

---

## 3. Directory Layout

\`\`\`text
apps/web/src/
├── app/                  # Next.js App Router pages and layouts
│   ├── (auth)/           # Authentication route group (login, register)
│   └── (dashboard)/      # Protected dashboard shell (sidebar, header)
├── components/           # Atomic UI design system primitives
│   ├── ui/               # Button, Card, Badge, Dialog, Input, Progress
│   └── layout/           # AppHeader, AppSidebar, ResizeHandle
├── features/             # Domain-specific feature modules
│   ├── projects/         # ProjectsListView, ProjectDetailView, Modals
│   ├── markdown-editor/  # MarkdownWorkspace, EditorToolbar, SplitPane
│   ├── templates/        # TemplatesLibraryView, BlueprintPreviewModal
│   └── collaboration/    # TeamManagementView, ReviewDrawer
├── stores/               # Zustand global state slices (useAuthStore, useLayoutStore)
└── lib/                  # ApiClient, Markdown AST parsers, formatting utils
\`\`\`

---

## 4. Performance & Bundle Optimization

1. **Code Splitting:** Heavy markdown rendering and Monaco/CodeMirror editors are dynamically loaded via \`next/dynamic\`.
2. **Debounced Network Calls:** Autosave updates are debounced by 1000ms with dirty-state tracking.
3. **Layout Stability:** Fixed and clamped container widths prevent cumulative layout shift (CLS).
`
  },
  {
    id: '02-backend-architecture',
    fileName: 'BACKEND-ARCHITECTURE.md',
    relativePath: 'docs/02-architecture/BACKEND-ARCHITECTURE.md',
    title: 'Backend Architecture Specification',
    description: 'Server design, layered architecture, middleware pipelines, and error boundaries.',
    categorySlug: '02-architecture',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'api', 'express'],
    version: '1.0.0',
    content: `# Backend Architecture Specification: [PROJECT_NAME]

---

## 1. Architectural Model: Layered Clean Architecture

The backend application is implemented with **[BACKEND_FRAMEWORK]** running in Node.js 20+ LTS, structured in strict domain layers:

\`\`\`mermaid
flowchart LR
    Request["HTTP Request"] --> Router["Routes & Validation"]
    Router --> Controller["Controllers (HTTP Transport Layer)"]
    Controller --> Service["Services (Pure Business Logic)"]
    Service --> DAL["Data Access Layer (Prisma ORM)"]
    DAL --> DB[("[PROJECT_DATABASE]")]
\`\`\`

### Separation of Concerns
1. **Controllers:** Extract request params, headers, and query strings. Never execute raw business logic or direct database queries.
2. **Validators:** Zod schemas validate payload contracts before controller execution.
3. **Services:** House business logic, transactions, authorization checks, and orchestrations.
4. **Data Layer:** Prisma models define relational constraints, migrations, and query operations.

---

## 2. Middleware Execution Pipeline

1. **Helmet:** Injects security headers (XSS filter, frameguard, HSTS).
2. **CORS:** Restricts origins to configured frontend domains.
3. **Morgan / Logger:** Outputs structured JSON access logs with request execution duration.
4. **Cookie Parser & Body Parser:** Parses cookies and JSON payloads up to 10MB limits.
5. **Auth Middleware:** Verifies Bearer JWT tokens, injects \`req.user\`.
6. **Error Handler:** Catches thrown exceptions and maps them to standard JSON error envelopes.

---

## 3. Transaction Strategy

Multi-entity operations (such as project creation with 130 blueprint documents) must run inside \`prisma.$transaction\` blocks. If any operation fails, the entire transaction rolls back cleanly with zero orphaned rows.
`
  },
  {
    id: '02-database-architecture',
    fileName: 'DATABASE-ARCHITECTURE.md',
    relativePath: 'docs/02-architecture/DATABASE-ARCHITECTURE.md',
    title: 'Database Architecture & Topology',
    description: 'Database engine configuration, connection pooling, isolation levels, and multi-tenancy.',
    categorySlug: '02-architecture',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'postgres', 'pooling'],
    version: '1.0.0',
    content: `# Database Architecture & Topology: [PROJECT_NAME]

---

## 1. Database Engine & Specifications

- **Engine:** [PROJECT_DATABASE] (version 15+ for PostgreSQL)
- **Primary Schema Tool:** Prisma ORM
- **Collation:** UTF-8 / C.UTF-8
- **Transactional Isolation:** Read Committed (PostgreSQL default) with repeatable read for snapshot generation

---

## 2. Multi-Tenancy Strategy

[PROJECT_NAME] implements **Row-Level Shared Database Multi-Tenancy**:

- Every project, template, and activity record contains a required \`workspaceId\` foreign key.
- All service queries explicitly inject \`where: { workspaceId }\` to guarantee tenant isolation.
- Unique constraints enforce per-tenant uniqueness (e.g. \`@@unique([workspaceId, slug])\`).

---

## 3. Connection Pooling Topology

\`\`\`mermaid
graph TD
    API_1["API Pod 1"] --> Pooler["Connection Pooler (PgBouncer)"]
    API_2["API Pod 2"] --> Pooler
    API_3["API Pod 3"] --> Pooler
    Pooler --> PrimaryDB["Primary PostgreSQL (Write / Read)"]
    PrimaryDB -.-> ReadReplica["Optional Read Replica"]
\`\`\`

- **Pool Size:** 10 connections per API worker instance.
- **Idle Timeout:** 10,000ms.
- **Connection Timeout:** 5,000ms.
`
  },
  {
    id: '02-data-flow',
    fileName: 'DATA-FLOW.md',
    relativePath: 'docs/02-architecture/DATA-FLOW.md',
    title: 'System Data Flow & Sequence Diagrams',
    description: 'End-to-end data sequence diagrams for core engineering workflows.',
    categorySlug: '02-architecture',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['sequence', 'dataflow', 'diagrams'],
    version: '1.0.0',
    content: `# System Data Flow & Sequence Diagrams: [PROJECT_NAME]

---

## 1. Authentication & Session Rotation Flow

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor User
    participant Browser
    participant API
    participant DB as [PROJECT_DATABASE]

    User->>Browser: Enter credentials
    Browser->>API: POST /api/v1/auth/login
    API->>DB: Query user by email & verify password hash
    API->>DB: Store hashed refreshToken in Session table
    API-->>Browser: Return accessToken (JSON) + refreshToken (HttpOnly Cookie)
    Browser->>Browser: Store accessToken in memory / localStorage
    Note over Browser,API: Subsequent requests attach Bearer Access Token
\`\`\`

---

## 2. Document Edit & Version Snapshotting Flow

\`\`\`mermaid
sequenceDiagram
    autonumber
    actor Dev as Developer
    participant Editor as Web Editor
    participant API as API Server
    participant DB as [PROJECT_DATABASE]

    Dev->>Editor: Types Markdown content
    Editor->>Editor: Debounce timer 1000ms
    Editor->>API: PUT /api/v1/documents/:id { content, title }
    API->>DB: Update Document row (content, versionNumber + 1)
    API->>DB: Insert new DocumentVersion snapshot row
    API->>DB: Insert ActivityLog (UPDATED)
    API-->>Editor: 200 OK with updated document metadata
    Editor-->>Dev: Display "Saved" status indicator
\`\`\`
`
  },
  {
    id: '02-architecture-decisions',
    fileName: 'ARCHITECTURE-DECISIONS.md',
    relativePath: 'docs/02-architecture/ARCHITECTURE-DECISIONS.md',
    title: 'Architecture Decision Records (ADR)',
    description: 'Chronological record of key architectural decisions, rationale, and tradeoffs.',
    categorySlug: '02-architecture',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['adr', 'decisions', 'governance'],
    version: '1.0.0',
    content: `# Architecture Decision Records (ADRs)

---

## ADR-001: Selection of Monorepo Structure with pnpm Workspaces
- **Date:** 2026-10-15
- **Status:** **Accepted**
- **Context:** The platform consists of a web frontend, REST API backend, shared type definitions, and shared utilities. Managing multiple isolated repositories creates version synchronization friction.
- **Decision:** Use a **pnpm monorepo** with shared packages (\`@devblueprint/shared\`, \`@devblueprint/types\`).
- **Consequences:** Atomic cross-package commits, zero npm publish delays for internal types, and unified lint/test commands.

---

## ADR-002: Modular Monolith vs Microservices
- **Date:** 2026-10-18
- **Status:** **Accepted**
- **Context:** Deciding on deployment topology for the initial platform lifecycle.
- **Decision:** Implement a **Modular Monolith** with clean boundaries between \`auth\`, \`projects\`, \`documents\`, \`categories\`, and \`templates\`.
- **Consequences:** Low operational complexity, instant transactional guarantees, and straightforward future extraction into microservices if scaling demands dictate.

---

## ADR-003: Deterministic 12-Category Enterprise Blueprint System
- **Date:** 2026-10-25
- **Status:** **Accepted**
- **Context:** Software projects frequently suffer from incomplete or unstructured documentation.
- **Decision:** Codify a deterministic 12-category documentation manifest containing 130 pre-configured Markdown specifications.
- **Consequences:** Instant comprehensive documentation coverage upon project creation; reliable progress tracking formulas.
`
  }
];
