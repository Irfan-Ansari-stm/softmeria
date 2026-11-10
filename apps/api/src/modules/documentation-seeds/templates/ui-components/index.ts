import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const uiComponentTemplates: SeedTemplateDoc[] = [
  {
    id: '04-component-guidelines',
    fileName: 'COMPONENT-GUIDELINES.md',
    relativePath: 'docs/04-ui-components/COMPONENT-GUIDELINES.md',
    title: 'UI Component Authoring Guidelines',
    description: 'Props conventions, composition patterns, and testing standards for UI components.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['components', 'guidelines', 'authoring'],
    version: '1.0.0',
    content: `# UI Component Authoring Guidelines

Every component in the design system must follow strict conventions:
1. Export clean TypeScript interfaces for all props extending native HTML attributes.
2. Accept a \`className\` prop merged cleanly with \`clsx\` / \`tailwind-merge\`.
3. Support controlled and uncontrolled usage where applicable.
4. Support keyboard navigation and ARIA attributes out of the box.
`
  },
  {
    id: '04-component-architecture',
    fileName: 'COMPONENT-ARCHITECTURE.md',
    relativePath: 'docs/04-ui-components/COMPONENT-ARCHITECTURE.md',
    title: 'Component Architecture & Primitives',
    description: 'Headless abstractions, styling layers, and atomic component structure.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['architecture', 'primitives', 'headless'],
    version: '1.0.0',
    content: `# Component Architecture & Primitives

Components are organized into three layers:
1. **Primitives:** Foundational building blocks (Button, Input, Badge) located in \`components/ui/\`.
2. **Compound Layouts:** Specialized structures (CardHeader, DialogContent) that compose primitives.
3. **Domain Features:** Business-specific compositions (ProjectsListView, MarkdownWorkspace) in \`features/\`.
`
  },
  {
    id: '04-component-reusability',
    fileName: 'COMPONENT-REUSABILITY.md',
    relativePath: 'docs/04-ui-components/COMPONENT-REUSABILITY.md',
    title: 'Component Reusability & Inversion of Control',
    description: 'Avoiding prop drilling, utilizing slots and compound patterns.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['reusability', 'patterns', 'composition'],
    version: '1.0.0',
    content: `# Component Reusability & Inversion of Control

Rather than creating monolithic components with dozens of Boolean flags, favor component composition via slots (e.g. \`header\`, \`footer\`, \`actions\`) and compound components (\`Card.Header\`, \`Card.Content\`).
`
  },
  {
    id: '04-buttons',
    fileName: 'BUTTONS.md',
    relativePath: 'docs/04-ui-components/BUTTONS.md',
    title: 'Button Component Specification',
    description: 'Button variants, loading states, sizing tokens, and accessibility.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['button', 'inputs', 'actions'],
    version: '1.0.0',
    content: `# Button Component Specification

- **Variants:** \`primary\`, \`secondary\`, \`outline\`, \`ghost\`, \`destructive\`, \`link\`
- **Sizes:** \`sm\` (h-8 px-2.5), \`md\` (h-9 px-4), \`lg\` (h-10 px-6)
- **States:** Default, Hover, Focus, Disabled, Loading (with spinner and disabled clicks)
`
  },
  {
    id: '04-icon-buttons',
    fileName: 'ICON-BUTTONS.md',
    relativePath: 'docs/04-ui-components/ICON-BUTTONS.md',
    title: 'Icon Button Specification',
    description: 'Compact icon-only triggers with required accessibility labels.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['button', 'icon-button', 'a11y'],
    version: '1.0.0',
    content: `# Icon Button Specification

Icon buttons require an explicit \`aria-label\` or visible tooltip. Minimum touch hit target is 36px desktop / 44px mobile.
`
  },
  {
    id: '04-inputs',
    fileName: 'INPUTS.md',
    relativePath: 'docs/04-ui-components/INPUTS.md',
    title: 'Text Input Component Specification',
    description: 'Single-line text inputs, labels, validation states, and helper text.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['forms', 'inputs', 'text'],
    version: '1.0.0',
    content: `# Text Input Component Specification

Supports leading/trailing icons, error text, helper text, and clear states. Always connects \`label\` to \`id\` via \`htmlFor\`.
`
  },
  {
    id: '04-textareas',
    fileName: 'TEXTAREAS.md',
    relativePath: 'docs/04-ui-components/TEXTAREAS.md',
    title: 'Textarea Component Specification',
    description: 'Multi-line text inputs, auto-resizing, and character limits.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['forms', 'textarea', 'multiline'],
    version: '1.0.0',
    content: `# Textarea Component Specification

Supports flexible row sizing, character counters, and integration with Markdown editors.
`
  },
  {
    id: '04-selects',
    fileName: 'SELECTS.md',
    relativePath: 'docs/04-ui-components/SELECTS.md',
    title: 'Select & Combobox Specification',
    description: 'Dropdown select menus, searchable comboboxes, and multi-select.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['select', 'dropdown', 'combobox'],
    version: '1.0.0',
    content: `# Select & Combobox Specification

Native HTML selects for simple cases; accessible comboboxes with keyboard search for large datasets.
`
  },
  {
    id: '04-checkboxes',
    fileName: 'CHECKBOXES.md',
    relativePath: 'docs/04-ui-components/CHECKBOXES.md',
    title: 'Checkbox Component Specification',
    description: 'Boolean selection inputs with indeterminate states and labels.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['checkbox', 'forms', 'selection'],
    version: '1.0.0',
    content: `# Checkbox Component Specification

Custom styled checkbox with support for \`checked\`, \`unchecked\`, and \`indeterminate\` states.
`
  },
  {
    id: '04-radio-buttons',
    fileName: 'RADIO-BUTTONS.md',
    relativePath: 'docs/04-ui-components/RADIO-BUTTONS.md',
    title: 'Radio Button Group Specification',
    description: 'Mutually exclusive option selection with roving tabindex.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['radio', 'forms', 'options'],
    version: '1.0.0',
    content: `# Radio Button Group Specification

Radio groups manage mutual exclusivity and support arrow-key navigation between options.
`
  },
  {
    id: '04-switches',
    fileName: 'SWITCHES.md',
    relativePath: 'docs/04-ui-components/SWITCHES.md',
    title: 'Toggle Switch Specification',
    description: 'Instant on/off setting toggles with smooth sliding indicators.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['switch', 'toggle', 'settings'],
    version: '1.0.0',
    content: `# Toggle Switch Specification

Used for instant state changes (e.g. notifications toggle, theme toggle). Uses \`role="switch"\`.
`
  },
  {
    id: '04-dropdowns',
    fileName: 'DROPDOWNS.md',
    relativePath: 'docs/04-ui-components/DROPDOWNS.md',
    title: 'Dropdown Menu Specification',
    description: 'Context menus, action menus, and user profile popover navigation.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['dropdown', 'menu', 'popover'],
    version: '1.0.0',
    content: `# Dropdown Menu Specification

Positioned floating menus with collision detection, item dividers, and keyboard navigation.
`
  },
  {
    id: '04-cards',
    fileName: 'CARDS.md',
    relativePath: 'docs/04-ui-components/CARDS.md',
    title: 'Card Component Specification',
    description: 'Surface containers, CardHeader, CardContent, and CardFooter.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['card', 'surface', 'container'],
    version: '1.0.0',
    content: `# Card Component Specification

Primary content container with subtle border, background surface token, and hover state transitions.
`
  },
  {
    id: '04-badges',
    fileName: 'BADGES.md',
    relativePath: 'docs/04-ui-components/BADGES.md',
    title: 'Badge & Tag Component Specification',
    description: 'Status badges, version pills, and categorical metadata tags.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['badge', 'status', 'tag'],
    version: '1.0.0',
    content: `# Badge & Tag Component Specification

- **Variants:** \`default\`, \`secondary\`, \`outline\`, \`success\`, \`warning\`, \`destructive\`
- **Usage:** Document statuses, tech stack chips, version numbers.
`
  },
  {
    id: '04-avatars',
    fileName: 'AVATARS.md',
    relativePath: 'docs/04-ui-components/AVATARS.md',
    title: 'Avatar Component Specification',
    description: 'User avatar images, fallback initials, and avatar groups.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['avatar', 'user', 'profile'],
    version: '1.0.0',
    content: `# Avatar Component Specification

Displays user profile image or computes two-letter initials from full name when image fails to load.
`
  },
  {
    id: '04-tooltips',
    fileName: 'TOOLTIPS.md',
    relativePath: 'docs/04-ui-components/TOOLTIPS.md',
    title: 'Tooltip Component Specification',
    description: 'Informational hover/focus labels with micro delay timing.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['tooltip', 'popover', 'hint'],
    version: '1.0.0',
    content: `# Tooltip Component Specification

Provides brief contextual assistance. Displays on hover or focus with 300ms delay.
`
  },
  {
    id: '04-popovers',
    fileName: 'POPOVERS.md',
    relativePath: 'docs/04-ui-components/POPOVERS.md',
    title: 'Popover Component Specification',
    description: 'Interactive rich content overlays with focus management.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['popover', 'floating', 'overlay'],
    version: '1.0.0',
    content: `# Popover Component Specification

Used for richer interactive overlays (e.g. date pickers, workspace switchers) that trap focus and dismiss on outside click.
`
  },
  {
    id: '04-modals',
    fileName: 'MODALS.md',
    relativePath: 'docs/04-ui-components/MODALS.md',
    title: 'Modal Dialog Component Specification',
    description: 'Full modal dialog overlays, backdrops, and focus trapping.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['modal', 'dialog', 'overlay'],
    version: '1.0.0',
    content: `# Modal Dialog Component Specification

Provides centered dialog sheets with backdrop blur, keyboard Escape closure, and accessibility focus trapping.
`
  },
  {
    id: '04-dialogs',
    fileName: 'DIALOGS.md',
    relativePath: 'docs/04-ui-components/DIALOGS.md',
    title: 'Confirmation Dialog Specification',
    description: 'Destructive action alerts, confirmation gates, and prompt dialogs.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['dialog', 'alert', 'confirm'],
    version: '1.0.0',
    content: `# Confirmation Dialog Specification

Specialized dialog for irreversible operations (document deletion, workspace removal) requiring explicit confirmation.
`
  },
  {
    id: '04-drawers',
    fileName: 'DRAWERS.md',
    relativePath: 'docs/04-ui-components/DRAWERS.md',
    title: 'Drawer & Sheet Specification',
    description: 'Off-canvas sliding panels for mobile navigation and inspector panes.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['drawer', 'sheet', 'panel'],
    version: '1.0.0',
    content: `# Drawer & Sheet Specification

Sliding off-canvas panels used for mobile sidebar navigation and right-hand document metadata inspection.
`
  },
  {
    id: '04-tabs',
    fileName: 'TABS.md',
    relativePath: 'docs/04-ui-components/TABS.md',
    title: 'Tabs Component Specification',
    description: 'Tab navigation bars, active indicators, and tab panel switching.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['tabs', 'navigation', 'panels'],
    version: '1.0.0',
    content: `# Tabs Component Specification

Organizes content into multiple views within a single container. Supports horizontal and vertical orientations.
`
  },
  {
    id: '04-accordions',
    fileName: 'ACCORDIONS.md',
    relativePath: 'docs/04-ui-components/ACCORDIONS.md',
    title: 'Accordion Component Specification',
    description: 'Collapsible sections for documentation hierarchies and FAQs.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['accordion', 'collapse', 'tree'],
    version: '1.0.0',
    content: `# Accordion Component Specification

Used in the documentation sidebar tree for category node collapsing and expanding with smooth animated transitions.
`
  },
  {
    id: '04-tables',
    fileName: 'TABLES.md',
    relativePath: 'docs/04-ui-components/TABLES.md',
    title: 'Table Component Specification',
    description: 'Responsive tabular data presentation, sorting headers, and row hover states.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['table', 'data', 'grid'],
    version: '1.0.0',
    content: `# Table Component Specification

Accessible tabular data layout with sticky headers, sorting arrows, striped rows, and row selection checkboxes.
`
  },
  {
    id: '04-data-grid',
    fileName: 'DATA-GRID.md',
    relativePath: 'docs/04-ui-components/DATA-GRID.md',
    title: 'Data Grid Component Specification',
    description: 'High-density virtualized data grids with filtering and column resizing.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['grid', 'virtualization', 'table'],
    version: '1.0.0',
    content: `# Data Grid Component Specification

Advanced virtualized grid for massive document collections, rendering only visible viewport rows.
`
  },
  {
    id: '04-navbar',
    fileName: 'NAVBAR.md',
    relativePath: 'docs/04-ui-components/NAVBAR.md',
    title: 'Application Header & Navbar',
    description: 'Top navigation bar layout, breadcrumbs, search trigger, and user menu.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['navbar', 'header', 'navigation'],
    version: '1.0.0',
    content: `# Application Header & Navbar

The top navigation shell integrates breadcrumbs, global search modal trigger, quick actions, theme toggle, and profile options.
`
  },
  {
    id: '04-sidebar',
    fileName: 'SIDEBAR.md',
    relativePath: 'docs/04-ui-components/SIDEBAR.md',
    title: 'Application Sidebar & Resize Handle',
    description: 'Collapsible navigation rail, category document tree, and draggable resizer.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['sidebar', 'navigation', 'resizer'],
    version: '1.0.0',
    content: `# Application Sidebar & Resize Handle

Features a standard width (256px), collapsible icon rail (56px), draggable resize handle (220px to 360px), and mobile drawer sheet.
`
  },
  {
    id: '04-breadcrumbs',
    fileName: 'BREADCRUMBS.md',
    relativePath: 'docs/04-ui-components/BREADCRUMBS.md',
    title: 'Breadcrumb Navigation Specification',
    description: 'Hierarchical navigation trails, truncation, and route linking.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['breadcrumbs', 'navigation', 'routes'],
    version: '1.0.0',
    content: `# Breadcrumb Navigation Specification

Displays current position in the project hierarchy (e.g. \`DevBlueprint / Projects / Fintech Core / Architecture\`).
`
  },
  {
    id: '04-pagination',
    fileName: 'PAGINATION.md',
    relativePath: 'docs/04-ui-components/PAGINATION.md',
    title: 'Pagination Component Specification',
    description: 'Page selector controls, page size dropdowns, and count summaries.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['pagination', 'navigation', 'paging'],
    version: '1.0.0',
    content: `# Pagination Component Specification

Enables navigation across large paged datasets with first/previous/next/last buttons and customizable page sizes.
`
  },
  {
    id: '04-alerts',
    fileName: 'ALERTS.md',
    relativePath: 'docs/04-ui-components/ALERTS.md',
    title: 'Alert Banner Specification',
    description: 'Contextual notification banners: info, warning, error, success.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['alert', 'banner', 'feedback'],
    version: '1.0.0',
    content: `# Alert Banner Specification

Inline contextual feedback banners with associated icon and optional dismiss button.
`
  },
  {
    id: '04-toasts',
    fileName: 'TOASTS.md',
    relativePath: 'docs/04-ui-components/TOASTS.md',
    title: 'Toast Notification Specification',
    description: 'Floating transient notifications, queue management, and auto-dismissal.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['toast', 'notification', 'feedback'],
    version: '1.0.0',
    content: `# Toast Notification Specification

Non-blocking floating messages in bottom-right viewport corner. Auto-dismisses after 4 seconds.
`
  },
  {
    id: '04-progress-bars',
    fileName: 'PROGRESS-BARS.md',
    relativePath: 'docs/04-ui-components/PROGRESS-BARS.md',
    title: 'Progress Bar Specification',
    description: 'Linear progress indicators, completion gauges, and size scales.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['progress', 'gauge', 'meter'],
    version: '1.0.0',
    content: `# Progress Bar Specification

Displays numeric completion percentages with animated fills. Color shifts dynamically from amber to emerald at 100%.
`
  },
  {
    id: '04-spinners',
    fileName: 'SPINNERS.md',
    relativePath: 'docs/04-ui-components/SPINNERS.md',
    title: 'Loading Spinner Specification',
    description: 'Circular activity indicators with accessibility labels.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['spinner', 'loading', 'activity'],
    version: '1.0.0',
    content: `# Loading Spinner Specification

Provides rotating circular feedback during asynchronous mutations. Includes screen-reader-only text \`Loading...\`.
`
  },
  {
    id: '04-skeleton-loaders',
    fileName: 'SKELETON-LOADERS.md',
    relativePath: 'docs/04-ui-components/SKELETON-LOADERS.md',
    title: 'Skeleton Placeholder Specification',
    description: 'Perceived performance placeholders with animated shimmer effects.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['skeleton', 'placeholder', 'loading'],
    version: '1.0.0',
    content: `# Skeleton Placeholder Specification

Mimics layout shapes while data is fetching, preventing layout shifts and enhancing perceived responsiveness.
`
  },
  {
    id: '04-empty-states',
    fileName: 'EMPTY-STATES.md',
    relativePath: 'docs/04-ui-components/EMPTY-STATES.md',
    title: 'Empty State Pattern Specification',
    description: 'First-time user onboarding screens and zero-data states.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['empty-state', 'zero-state', 'onboarding'],
    version: '1.0.0',
    content: `# Empty State Pattern Specification

Combines an icon, descriptive heading, explanation, and primary call-to-action button to guide users.
`
  },
  {
    id: '04-error-states',
    fileName: 'ERROR-STATES.md',
    relativePath: 'docs/04-ui-components/ERROR-STATES.md',
    title: 'Error Presentation Pattern',
    description: 'Visual treatment for network errors, missing items, and failed requests.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['errors', 'failure', 'recovery'],
    version: '1.0.0',
    content: `# Error Presentation Pattern

Presents user-friendly error messages accompanied by actionable retry buttons.
`
  },
  {
    id: '04-charts',
    fileName: 'CHARTS.md',
    relativePath: 'docs/04-ui-components/CHARTS.md',
    title: 'Data Visualization & Charts',
    description: 'Bar, line, and doughnut charts for velocity and documentation metrics.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['charts', 'metrics', 'visualization'],
    version: '1.0.0',
    content: `# Data Visualization & Charts

Integrates accessible SVG charts with dynamic color token mapping for documentation velocity tracking.
`
  },
  {
    id: '04-component-testing',
    fileName: 'COMPONENT-TESTING.md',
    relativePath: 'docs/04-ui-components/COMPONENT-TESTING.md',
    title: 'Component Testing Standards',
    description: 'Unit testing guidelines using React Testing Library and Vitest.',
    categorySlug: '04-ui-components',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['testing', 'vitest', 'rtl'],
    version: '1.0.0',
    content: `# Component Testing Standards

Components must have tests verifying default rendering, user interaction events, accessibility attributes, and disabled states.
`
  }
];
