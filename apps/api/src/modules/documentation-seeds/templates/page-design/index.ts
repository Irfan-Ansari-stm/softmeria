import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const pageDesignTemplates: SeedTemplateDoc[] = [
  {
    id: '05-landing-page',
    fileName: 'LANDING-PAGE.md',
    relativePath: 'docs/05-page-design/LANDING-PAGE.md',
    title: 'Landing Page Specification',
    description: 'Marketing homepage layout, hero section, feature grid, and conversion flows.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'landing', 'marketing'],
    version: '1.0.0',
    content: `# Landing Page Specification: [PROJECT_NAME]

---

## 1. Page Objectives & Key Performance Indicators (KPIs)
- **Primary Goal:** Convert engineering decision-makers and developers into registered workspace users.
- **Target Conversion Rate:** >= 4.5% visitor-to-signup.

---

## 2. Page Section Wireframe Layout

\`\`\`mermaid
flowchart TD
    Hero["Hero Section (Headline, Value Prop, CTA Buttons, Interactive Demo)"]
    SocialProof["Social Proof & Enterprise Customer Logos"]
    FeatureGrid["Core Capabilities (12-Category Blueprints, Living Markdown, Team Governance)"]
    ArchitectureDiagram["Interactive Blueprint Visualizer"]
    Testimonials["Architect & Developer Quotes"]
    Pricing["Transparent Tier Comparison Table"]
    Footer["Footer Navigation, Legal, Social, Status Links"]
    
    Hero --> SocialProof --> FeatureGrid --> ArchitectureDiagram --> Testimonials --> Pricing --> Footer
\`\`\`
`
  },
  {
    id: '05-dashboard',
    fileName: 'DASHBOARD.md',
    relativePath: 'docs/05-page-design/DASHBOARD.md',
    title: 'Workspace Dashboard Specification',
    description: 'Main dashboard view, KPI metrics, recent activity, and quick shortcuts.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'dashboard', 'analytics'],
    version: '1.0.0',
    content: `# Workspace Dashboard Specification

---

## 1. Layout & Grid Architecture

The main workspace dashboard renders in a responsive container with:
1. **Welcome Header:** Personalized developer greeting and quick action buttons (Create Project, Browse Templates, Import).
2. **Metrics Row:** 4 KPI cards (Total Projects, Total Documents, Completed Docs, Documentation Rate).
3. **Active Projects Grid:** 2-column auto-filling grid of active projects with progress bars and tech tags.
4. **Recent Documents Feed:** Quick-access list of the 5 most recently updated documents.
5. **Activity Stream:** Chronological timeline of team events.
`
  },
  {
    id: '05-login-page',
    fileName: 'LOGIN-PAGE.md',
    relativePath: 'docs/05-page-design/LOGIN-PAGE.md',
    title: 'Login Page Specification',
    description: 'User authentication view, password input, remember-me, and recovery links.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'auth', 'login'],
    version: '1.0.0',
    content: `# Login Page Specification

Centered card layout containing:
- Application branding logo and tagline
- Email and password inputs with inline validation
- "Remember me" session duration checkbox
- "Forgot password?" reset flow trigger
- Submit button with loading state
- Quick link to registration view
`
  },
  {
    id: '05-register-page',
    fileName: 'REGISTER-PAGE.md',
    relativePath: 'docs/05-page-design/REGISTER-PAGE.md',
    title: 'User Registration Specification',
    description: 'Account creation flow, password strength validation, and initial onboarding.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'auth', 'register'],
    version: '1.0.0',
    content: `# User Registration Specification

Multi-step onboarding collecting:
1. User full name and email
2. Secure password with dynamic visual strength indicator
3. Terms of service acceptance checkbox
4. Initial workspace creation (Workspace name and slug)
`
  },
  {
    id: '05-profile-page',
    fileName: 'PROFILE-PAGE.md',
    relativePath: 'docs/05-page-design/PROFILE-PAGE.md',
    title: 'User Profile & Security Page',
    description: 'Personal details, avatar image upload, and credential management.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'profile', 'user'],
    version: '1.0.0',
    content: `# User Profile & Security Page

Allows developers to manage:
- Display name and email address
- Profile avatar upload (JPEG/PNG up to 2MB)
- Password update with current password confirmation
- Active login sessions with revoke-all capability
`
  },
  {
    id: '05-settings-page',
    fileName: 'SETTINGS-PAGE.md',
    relativePath: 'docs/05-page-design/SETTINGS-PAGE.md',
    title: 'Workspace Settings Specification',
    description: 'Team member invitations, role management, and workspace preferences.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'settings', 'admin'],
    version: '1.0.0',
    content: `# Workspace Settings Specification

Tabbed configuration interface:
- **General:** Workspace name, slug, branding logo.
- **Team Members:** Member list, role dropdown (Owner, Admin, Editor, Viewer), invite modal.
- **Notifications:** Email and in-app alert toggles.
- **Danger Zone:** Workspace deletion with confirmation dialogue.
`
  },
  {
    id: '05-admin-panel',
    fileName: 'ADMIN-PANEL.md',
    relativePath: 'docs/05-page-design/ADMIN-PANEL.md',
    title: 'System Administration Console',
    description: 'Tenant administration, audit logs, and system health telemetry.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'admin', 'telemetry'],
    version: '1.0.0',
    content: `# System Administration Console

Reserved for global super-admins:
- Tenant workspace directory
- Real-time audit log streaming
- System health metrics (CPU, Memory, DB connection pool)
- Global feature flag toggles
`
  },
  {
    id: '05-error-pages',
    fileName: 'ERROR-PAGES.md',
    relativePath: 'docs/05-page-design/ERROR-PAGES.md',
    title: 'Error Pages Specification (404, 403, 500)',
    description: 'Clean error states, diagnostic codes, and user recovery actions.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'errors', '404'],
    version: '1.0.0',
    content: `# Error Pages Specification (404, 403, 500)

- **401 Unauthorized:** Prompts user to log in or renew session.
- **403 Forbidden:** Clarifies missing workspace role permissions.
- **404 Not Found:** Suggests navigation back to project dashboard.
- **500 Server Error:** Displays correlation ID for support debugging.
`
  },
  {
    id: '05-page-layouts',
    fileName: 'PAGE-LAYOUTS.md',
    relativePath: 'docs/05-page-design/PAGE-LAYOUTS.md',
    title: 'Page Layout Templates & Shells',
    description: 'Responsive shell templates: dashboard shell, document editor shell, auth shell.',
    categorySlug: '05-page-design',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pages', 'layout', 'shell'],
    version: '1.0.0',
    content: `# Page Layout Templates & Shells

- **Dashboard Shell:** Sidebar (collapsible) + Header (sticky) + Scrollable Main Content.
- **Editor Shell:** Full-bleed workspace, split editor/preview panels, draggable center divider.
- **Auth Shell:** Minimalist centered card on ambient gradient background.
`
  }
];
