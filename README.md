# DevBlueprint: Enterprise Documentation & Engineering Blueprint Platform

DevBlueprint is a production-oriented, full-stack centralized documentation and engineering blueprint management platform. It allows software architects, engineering managers, and development teams to plan, define, organize, maintain, and export all project documentation before writing application code.

---

## 🌟 Key Features

1. **Multi-Tenant Workspaces & Role-Based Access Control (RBAC):**
   - Full user authentication with short-lived JWTs and secure Refresh Token rotation in PostgreSQL.
   - Strict workspace data isolation with granular roles: `Owner`, `Admin`, `Editor`, and `Viewer`.

2. **Standard 8-Category Architectural Blueprint Structure:**
   - Every project can automatically provision 8 industry-standard blueprint categories:
     - `01-product/`: Product Overview, Requirements, User Roles, Business Rules
     - `02-design/`: Design System, Colors, Typography, Spacing, Design Tokens, Components, UI Patterns, Accessibility
     - `03-frontend/`: Frontend Architecture, Project Structure, Component Architecture, State Management, Routing, API Integration, Coding Standards
     - `04-backend/`: Backend Architecture, API Standards, Database Design, Authentication, Authorization, Business Logic, Error Handling, Backend Security
     - `05-infrastructure/`: Deployment, Environment Variables, CI/CD, Docker, Cloud Infrastructure, Monitoring & Logging
     - `06-quality-and-security/`: Testing Strategy, Code Quality, Performance, Security Standards, Accessibility Verification
     - `07-data-and-integrations/`: Data Management, Integration Standards, Event-Driven Architecture
     - `08-operations-and-governance/`: Monitoring & Observability, Incident Management, Backup & Recovery, Dev Workflow, Git Workflow, Changelog
   - Custom categories, nested folders, reordering, and custom document creation.

3. **High-Performance Markdown Workspace:**
   - Dual split-view editor and real-time live preview with GitHub Flavored Markdown (GFM).
   - Markdown toolbar (headings, bold, italic, code blocks, tables, checklists, blockquotes, links).
   - Reliable auto-save debounced at 1000ms with visual status badges (`Saving...`, `Saved`, `Unsaved`, `Conflict`).
   - Optimistic concurrency control preventing overwrite collisions.
   - Live metrics (lines, words, character count).
   - Full-screen distraction-free mode.

4. **Immutable Version Control & Snapshot Comparison:**
   - Every save automatically records an immutable `DocumentVersion` snapshot.
   - Side-by-side git-like visual diff viewer highlighting additions and deletions.
   - One-click version restoration that creates a clean new incremental version rather than destroying history.

5. **Live Progress Tracking & Completion Metrics:**
   - Dynamic formula: `Completed Non-Optional Docs / Total Non-Optional Docs * 100%`.
   - Toggle documents as `Optional` so auxiliary guides do not penalize required engineering progress.
   - Project-level and category-level progress breakdown.

6. **Global Search:**
   - Instant search across projects, document titles, file names, markdown text contents, and tags.
   - Snippet previews with context matching. Keyboard shortcut: `Ctrl + K` / `Cmd + K`.

7. **Collaboration, Reviews & Comments:**
   - Threaded document comments with replies and resolution toggles.
   - Formal architecture review workflow (Request Review -> Approve or Request Changes with notes).

8. **Enterprise Import & Export:**
   - Single document download as `.md`.
   - Category archive export as `.zip`.
   - Complete project export as `.zip` preserving the folder hierarchy and auto-generating an `INDEX.md` blueprint catalog.
   - Safe Markdown and ZIP archive import with path-traversal sanitization (Zip-Slip mitigation).

---

## 🛠 Technology Stack

- **Monorepo Architecture:** `pnpm` workspaces (`apps/web`, `apps/api`, `packages/shared`, `packages/types`)
- **Frontend:** Next.js 15 (App Router), React 19, TypeScript, Tailwind CSS, Lucide React, TanStack Query, Zustand, React Hook Form, Zod
- **Backend:** Node.js, Express.js, TypeScript, Prisma ORM, JWT, BcryptJS, Helmet, CORS, Morgan, Multer, Archiver, AdmZip
- **Database:** PostgreSQL 16/18 with UUID primary keys and relational integrity
- **Testing:** Vitest and Supertest
- **Containerization:** Docker and Docker Compose

---

## 🚀 Quick Start Guide

### Prerequisites
- Node.js >= 20.x
- PostgreSQL running locally on port 5432 (or via Docker)
- pnpm >= 9.x (`npm install -g pnpm`)

### 1. Clone & Install Dependencies
```bash
git clone <repo-url> devblueprint
cd devblueprint
pnpm install
```

### 2. Environment Configuration
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Ensure your `DATABASE_URL` is set:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/devblueprint?schema=public"
JWT_SECRET="devblueprint-production-grade-jwt-secret-key-at-least-32-chars-long"
JWT_REFRESH_SECRET="devblueprint-production-grade-refresh-secret-key-at-least-32-chars-long"
PORT=4000
NEXT_PUBLIC_API_URL="http://localhost:4000/api/v1"
```

### 3. Database Migration & Seed
Run Prisma database sync and populate sample projects, 47 blueprint documents, built-in templates, and test users:
```bash
pnpm db:push
pnpm db:seed
```

### 4. Run Development Stack
Start both Express API (Port 4000) and Next.js Frontend (Port 3000) concurrently:
```bash
pnpm dev:api
pnpm dev:web
```
- Web Application: **http://localhost:3000**
- API Service: **http://localhost:4000/api/v1**
- Health Probe: **http://localhost:4000/health**

---

## 🔑 Pre-Seeded Test Credentials

| Role | Email | Password |
|---|---|---|
| **Owner** | `owner@devblueprint.io` | `Password123!` |
| **Admin** | `admin@devblueprint.io` | `Password123!` |
| **Editor** | `editor@devblueprint.io` | `Password123!` |
| **Viewer** | `viewer@devblueprint.io` | `Password123!` |

*(Quick-fill sign-in buttons are also provided directly on the login page for instant access)*

---

## 🧪 Automated Testing

Run the integration and unit test suite verifying database transactions, authentication, optimistic concurrency, and markdown exports:
```bash
pnpm --filter @devblueprint/api test
```

---

## 🐳 Running with Docker Compose

Run the entire isolated container stack (PostgreSQL + Express API + Next.js):
```bash
docker-compose up --build
```
