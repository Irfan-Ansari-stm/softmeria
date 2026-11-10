import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const frontendTemplates: SeedTemplateDoc[] = [
  {
    id: '06-frontend-guidelines',
    fileName: 'FRONTEND-GUIDELINES.md',
    relativePath: 'docs/06-frontend/FRONTEND-GUIDELINES.md',
    title: 'Frontend Engineering Guidelines',
    description: 'TypeScript standards, React patterns, component conventions, and hygiene rules.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'react', 'guidelines'],
    version: '1.0.0',
    content: `# Frontend Engineering Guidelines

- **Strict TypeScript:** \`noImplicitAny: true\`, zero usage of \`any\` or \`@ts-ignore\` without documented justification.
- **Component File Structure:** One component per file, named export matching file name.
- **Functional Components Only:** Modern React hooks; no class components.
- **Immutability:** Always treat state and props as strictly immutable.
`
  },
  {
    id: '06-project-structure',
    fileName: 'PROJECT-STRUCTURE.md',
    relativePath: 'docs/06-frontend/PROJECT-STRUCTURE.md',
    title: 'Frontend Directory & Module Structure',
    description: 'Detailed explanation of app router, features, components, and lib directories.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'structure', 'architecture'],
    version: '1.0.0',
    content: `# Frontend Directory & Module Structure

Directory architecture under \`apps/web/src/\`:
- \`app/\`: File-based routes and nested layouts.
- \`components/ui/\`: Shared atomic UI design system primitives.
- \`components/layout/\`: Top-level application layout shells (Header, Sidebar).
- \`features/\`: Feature slices containing UI and domain logic for specific routes.
- \`stores/\`: Client-side state stores (Zustand).
- \`lib/\`: API client, utilities, and parsers.
`
  },
  {
    id: '06-routing',
    fileName: 'ROUTING.md',
    relativePath: 'docs/06-frontend/ROUTING.md',
    title: 'Routing & Navigation Architecture',
    description: 'App router conventions, route groups, dynamic parameters, and query parameters.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'routing', 'nextjs'],
    version: '1.0.0',
    content: `# Routing & Navigation Architecture

- Route groups: \`(auth)\` for public pages, \`(dashboard)\` for authenticated pages.
- Dynamic routes: \`/projects/[projectId]\`, \`/projects/[projectId]/docs/[docId]\`.
- Deep linking: Query parameters control active actions (e.g. \`?action=new-project\`).
`
  },
  {
    id: '06-state-management',
    fileName: 'STATE-MANAGEMENT.md',
    relativePath: 'docs/06-frontend/STATE-MANAGEMENT.md',
    title: 'State Management Architecture',
    description: 'TanStack React Query for server cache, Zustand for client state, URL state.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'state', 'zustand', 'react-query'],
    version: '1.0.0',
    content: `# State Management Architecture

1. **Server State (TanStack Query):** Handles data fetching, caching, deduplication, and invalidation for all API resources.
2. **Global Client State (Zustand):** Lightweight stores for session data (\`useAuthStore\`) and layout preferences (\`useLayoutStore\`).
3. **Local State (React useState):** Kept minimal and confined to specific UI components.
`
  },
  {
    id: '06-api-integration',
    fileName: 'API-INTEGRATION.md',
    relativePath: 'docs/06-frontend/API-INTEGRATION.md',
    title: 'API Client & Data Fetching Integration',
    description: 'ApiClient class, token refresh interceptors, error handling, and type safety.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'api', 'fetch'],
    version: '1.0.0',
    content: `# API Client & Data Fetching Integration

The custom \`ApiClient\` in \`lib/api.ts\` encapsulates:
- Automatic \`Authorization: Bearer <token>\` injection.
- Seamless transparent token refreshing on 401 Unauthorized responses.
- Automatic JSON serialization and FormData handling.
`
  },
  {
    id: '06-form-handling',
    fileName: 'FORM-HANDLING.md',
    relativePath: 'docs/06-frontend/FORM-HANDLING.md',
    title: 'Form Handling Standards',
    description: 'Form submission workflows, dirty state tracking, and error messaging.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'forms', 'validation'],
    version: '1.0.0',
    content: `# Form Handling Standards

All forms must:
- Prevent default event bubbling.
- Disable submit buttons during pending mutations.
- Display server validation errors in clear alert banners or field-level annotations.
`
  },
  {
    id: '06-validation',
    fileName: 'VALIDATION.md',
    relativePath: 'docs/06-frontend/VALIDATION.md',
    title: 'Client-Side Data Validation',
    description: 'Zod schema validation, real-time validation, and sanitization.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'zod', 'validation'],
    version: '1.0.0',
    content: `# Client-Side Data Validation

Zod schemas validate inputs prior to dispatching network requests, preventing avoidable network round-trips for invalid data.
`
  },
  {
    id: '06-responsive-design',
    fileName: 'RESPONSIVE-DESIGN.md',
    relativePath: 'docs/06-frontend/RESPONSIVE-DESIGN.md',
    title: 'Responsive Design Standards',
    description: 'Fluid layouts, dynamic grid column limits, and viewport responsiveness.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'responsive', 'css'],
    version: '1.0.0',
    content: `# Responsive Design Standards

- Use dynamic CSS Grid \`grid-cols-[repeat(auto-fill,minmax(320px,1fr))]\` instead of fixed column counts to account for sidebar widths.
- Ensure all interactive buttons have \`whitespace-nowrap shrink-0\` to prevent text wrapping.
`
  },
  {
    id: '06-mobile-first',
    fileName: 'MOBILE-FIRST.md',
    relativePath: 'docs/06-frontend/MOBILE-FIRST.md',
    title: 'Mobile-First Adaptation Rules',
    description: 'Touch gestures, mobile drawer sidebars, and viewport considerations.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'mobile', 'touch'],
    version: '1.0.0',
    content: `# Mobile-First Adaptation Rules

On viewports below \`md\` (768px):
- Persistent sidebars convert to sliding off-canvas drawers.
- Breadcrumbs truncate gracefully.
- Touch targets expand to at least 44x44px.
`
  },
  {
    id: '06-performance',
    fileName: 'PERFORMANCE.md',
    relativePath: 'docs/06-frontend/PERFORMANCE.md',
    title: 'Frontend Performance & Core Web Vitals',
    description: 'LCP, INP, CLS benchmarks, code splitting, and memoization guidelines.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['frontend', 'performance', 'vitals'],
    version: '1.0.0',
    content: `# Frontend Performance & Core Web Vitals

- **LCP Target:** < 2.0s
- **INP Target:** < 100ms
- **CLS Target:** < 0.05
- Heavy libraries (Mermaid, Prism, Monaco) must be dynamically loaded only when rendered.
`
  },
  {
    id: '06-accessibility',
    fileName: 'ACCESSIBILITY.md',
    relativePath: 'docs/06-frontend/ACCESSIBILITY.md',
    title: 'Frontend Accessibility Implementation',
    description: 'Keyboard navigation, ARIA attributes, focus rings, and screen reader audits.',
    categorySlug: '06-frontend',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['frontend', 'accessibility', 'a11y'],
    version: '1.0.0',
    content: `# Frontend Accessibility Implementation

- Modal dialogues trap focus within container using \`aria-modal="true"\`.
- All forms connect \`aria-describedby\` to validation error text.
- Navigation links highlight current active page with \`aria-current="page"\`.
`
  }
];
