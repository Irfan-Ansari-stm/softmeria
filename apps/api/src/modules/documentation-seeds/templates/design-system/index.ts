import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const designSystemTemplates: SeedTemplateDoc[] = [
  {
    id: '03-design-system',
    fileName: 'DESIGN-SYSTEM.md',
    relativePath: 'docs/03-design-system/DESIGN-SYSTEM.md',
    title: 'Design System Overview & Governance',
    description: 'Foundational design system architecture, token hierarchy, and contribution rules.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['design-system', 'tokens', 'ui'],
    version: '1.0.0',
    content: `# Design System Overview & Governance

The [PROJECT_NAME] Design System is an enterprise design language engineered for speed, accessible contrast, and developer ergonomics across light and dark themes.

## 1. System Layers
1. **Primitive Tokens:** Raw values (hex codes, pixel dimensions, timing functions).
2. **Semantic Tokens:** Contextual tokens mapped to primitives (\`--color-surface-primary\`, \`--color-text-muted\`).
3. **Component Primitives:** Headless and styled components consuming semantic tokens.
4. **Pattern Compositions:** Complete page templates and dashboard layouts.

## 2. Token Delivery Pipeline
Tokens are authored in JSON / CSS Custom Properties and made available through Tailwind CSS theme extensions.
`
  },
  {
    id: '03-design-principles',
    fileName: 'DESIGN-PRINCIPLES.md',
    relativePath: 'docs/03-design-system/DESIGN-PRINCIPLES.md',
    title: 'Core Design Principles',
    description: 'Guiding philosophies: Clarity, Efficiency, Predictability, and Inclusivity.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['principles', 'ux', 'philosophy'],
    version: '1.0.0',
    content: `# Core Design Principles

1. **Clarity Over Novelty:** Standard UI conventions outperform decorative surprises.
2. **High-Density Utility:** Enterprise workflows require dense, readable typography with minimal extraneous padding.
3. **Instant Feedback:** Every click, keystroke, and asynchronous mutation must exhibit immediate, clear visual feedback.
4. **Accessibility First:** WCAG 2.1 AA is the non-negotiable minimum baseline for contrast, navigation, and screen reader labels.
`
  },
  {
    id: '03-color-palette',
    fileName: 'COLOR-PALETTE.md',
    relativePath: 'docs/03-design-system/COLOR-PALETTE.md',
    title: 'Brand & Functional Color Palette',
    description: 'Complete specification of brand, neutral, and semantic color scales.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['colors', 'palette', 'swatches'],
    version: '1.0.0',
    content: `# Brand & Functional Color Palette

## 1. Primary Brand Scale (Blue)
- **Blue 500:** \`#3B82F6\` — Primary action focus
- **Blue 600:** \`#2563EB\` — Primary action base button
- **Blue 700:** \`#1D4ED8\` — Primary action active/hover

## 2. Semantic Feedback Colors
- **Success (Emerald):** \`#10B981\` (Base) / \`#059669\` (Darker)
- **Warning (Amber):** \`#F59E0B\` (Base) / \`#D97706\` (Darker)
- **Destructive (Rose/Red):** \`#EF4444\` (Base) / \`#DC2626\` (Darker)
- **Information (Cyan):** \`#06B6D4\` (Base) / \`#0891B2\` (Darker)

## 3. Neutral Grayscale
- **Slate 50 to Slate 950:** Form the foundation for light and dark mode surfaces and borders.
`
  },
  {
    id: '03-color-tokens',
    fileName: 'COLOR-TOKENS.md',
    relativePath: 'docs/03-design-system/COLOR-TOKENS.md',
    title: 'Semantic Color Tokens',
    description: 'CSS custom properties and contextual color tokens for UI mapping.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['tokens', 'css-variables', 'theme'],
    version: '1.0.0',
    content: `# Semantic Color Tokens

| Semantic Token | Light Mode Value | Dark Mode Value | Usage Context |
|---|---|---|---|
| \`--background\` | \`#FFFFFF\` | \`#09090B\` | Main document viewport background |
| \`--background-secondary\` | \`#F4F4F5\` | \`#18181B\` | Sidebar and secondary panels |
| \`--card\` | \`#FFFFFF\` | \`#121215\` | Surface cards and modal dialogs |
| \`--border\` | \`#E4E4E7\` | \`#27272A\` | Subtle dividers and component outlines |
| \`--foreground\` | \`#09090B\` | \`#FAFAFA\` | High-contrast body and heading text |
| \`--foreground-muted\` | \`#71717A\` | \`#A1A1AA\` | Secondary descriptions and metadata labels |
`
  },
  {
    id: '03-typography',
    fileName: 'TYPOGRAPHY.md',
    relativePath: 'docs/03-design-system/TYPOGRAPHY.md',
    title: 'Typography System & Scale',
    description: 'Type scales, modular ratios, font sizes, line heights, and weights.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['typography', 'fonts', 'scale'],
    version: '1.0.0',
    content: `# Typography System & Modular Scale

## 1. Type Scale Hierarchy
- **Display 1:** \`36px\` / line-height: \`44px\` (font-extrabold)
- **Heading 1 (h1):** \`24px\` / line-height: \`32px\` (font-bold)
- **Heading 2 (h2):** \`20px\` / line-height: \`28px\` (font-semibold)
- **Heading 3 (h3):** \`16px\` / line-height: \`24px\` (font-semibold)
- **Body Large:** \`14px\` / line-height: \`20px\` (font-normal)
- **Body Default:** \`13px\` / line-height: \`18px\` (font-normal)
- **Caption / Meta:** \`11px\` / line-height: \`16px\` (font-medium)
- **Micro Badge:** \`9px - 10px\` / line-height: \`12px\` (font-mono)
`
  },
  {
    id: '03-font-families',
    fileName: 'FONT-FAMILIES.md',
    relativePath: 'docs/03-design-system/FONT-FAMILIES.md',
    title: 'Font Family Definitions',
    description: 'Primary UI font stack, monospace code stack, and fallback fallbacks.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['fonts', 'sans', 'mono'],
    version: '1.0.0',
    content: `# Font Family Definitions

- **Sans Stack (UI):** \`Inter\`, \`-apple-system\`, \`BlinkMacSystemFont\`, \`"Segoe UI"\`, \`Roboto\`, \`sans-serif\`
- **Mono Stack (Code & Tokens):** \`"JetBrains Mono"\`, \`"Fira Code"\`, \`Consolas\`, \`monospace\`
`
  },
  {
    id: '03-spacing-system',
    fileName: 'SPACING-SYSTEM.md',
    relativePath: 'docs/03-design-system/SPACING-SYSTEM.md',
    title: '4px / 8px Spacing System',
    description: 'Consistent spacing grid and spatial relationship tokens.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['spacing', 'layout', 'grid'],
    version: '1.0.0',
    content: `# Spacing System

All padding, margins, and gaps must align to the **4px / 8px baseline grid scale**:
- \`0.5\` = \`2px\` (hairline micro spacing)
- \`1\` = \`4px\` (chip gap, tight icons)
- \`2\` = \`8px\` (standard button padding, item gaps)
- \`3\` = \`12px\` (card padding tight)
- \`4\` = \`16px\` (standard card padding)
- \`6\` = \`24px\` (view padding, section gap)
- \`8\` = \`32px\` (major layout grid spacing)
`
  },
  {
    id: '03-grid-system',
    fileName: 'GRID-SYSTEM.md',
    relativePath: 'docs/03-design-system/GRID-SYSTEM.md',
    title: 'Responsive Grid System',
    description: '12-column responsive layout grids, breakpoints, and container max-widths.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['grid', 'responsive', 'layout'],
    version: '1.0.0',
    content: `# Responsive Grid System

Breakpoints:
- \`sm\`: \`640px\` (Mobile landscape)
- \`md\`: \`768px\` (Tablet)
- \`lg\`: \`1024px\` (Small laptop / Desktop sidebar layout)
- \`xl\`: \`1280px\` (Full desktop)
- \`2xl\`: \`1536px\` (Large displays)
`
  },
  {
    id: '03-border-radius',
    fileName: 'BORDER-RADIUS.md',
    relativePath: 'docs/03-design-system/BORDER-RADIUS.md',
    title: 'Border Radius Scale',
    description: 'Corner rounding rules across buttons, cards, modals, and tags.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['radius', 'borders', 'styling'],
    version: '1.0.0',
    content: `# Border Radius Scale

- \`rounded-sm\` (\`4px\`): Small badges, code pills
- \`rounded-md\` (\`6px\`): Buttons, input fields, dropdown menus
- \`rounded-lg\` (\`8px\`): Standard cards, modal dialogs
- \`rounded-xl\` (\`12px\`): Major dashboard widgets
- \`rounded-full\`: User avatars, circular status dots
`
  },
  {
    id: '03-shadows',
    fileName: 'SHADOWS.md',
    relativePath: 'docs/03-design-system/SHADOWS.md',
    title: 'Elevation & Shadow Hierarchy',
    description: 'Drop shadow specifications for elevation levels in light and dark mode.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['shadows', 'elevation', 'depth'],
    version: '1.0.0',
    content: `# Elevation & Shadow Hierarchy

- **Elevation 0:** Border only, 0 shadow.
- **Elevation 1 (Card):** \`0 1px 2px 0 rgb(0 0 0 / 0.05)\`
- **Elevation 2 (Dropdown):** \`0 4px 6px -1px rgb(0 0 0 / 0.1)\`
- **Elevation 3 (Modal Dialog):** \`0 20px 25px -5px rgb(0 0 0 / 0.1)\`
`
  },
  {
    id: '03-iconography',
    fileName: 'ICONOGRAPHY.md',
    relativePath: 'docs/03-design-system/ICONOGRAPHY.md',
    title: 'Iconography Guidelines',
    description: 'Standard icon library, stroke weights, optical balance, and sizing.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['icons', 'lucide', 'graphics'],
    version: '1.0.0',
    content: `# Iconography Guidelines

Using **Lucide Icons**:
- Stroke width: default \`1.5px\` or \`2px\`.
- Sizing tokens: \`h-3.5 w-3.5\` (14px inline), \`h-4 w-4\` (16px button), \`h-5 w-5\` (20px header).
`
  },
  {
    id: '03-illustrations',
    fileName: 'ILLUSTRATIONS.md',
    relativePath: 'docs/03-design-system/ILLUSTRATIONS.md',
    title: 'Illustration & Empty State Visuals',
    description: 'SVG asset guidelines, style rules, and empty-state graphics.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['illustrations', 'svg', 'empty-state'],
    version: '1.0.0',
    content: `# Illustration & Empty State Visuals

Empty states use lightweight, monochrome SVG line illustrations with subtle accent highlights, conveying actionable guidance rather than visual noise.
`
  },
  {
    id: '03-design-tokens',
    fileName: 'DESIGN-TOKENS.md',
    relativePath: 'docs/03-design-system/DESIGN-TOKENS.md',
    title: 'Design Tokens Architecture',
    description: 'Machine-readable token structure, sync pipelines, and platform transforms.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['tokens', 'json', 'style-dictionary'],
    version: '1.0.0',
    content: `# Design Tokens Architecture

Design tokens represent the atomic source of truth for all styling choices. They are defined in code and consumed by web styling libraries.
`
  },
  {
    id: '03-theme-configuration',
    fileName: 'THEME-CONFIGURATION.md',
    relativePath: 'docs/03-design-system/THEME-CONFIGURATION.md',
    title: 'Theme Provider & Switching',
    description: 'Runtime theme provider, local storage persistence, and CSS class toggling.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['theme', 'dark-mode', 'provider'],
    version: '1.0.0',
    content: `# Theme Provider & Runtime Configuration

Themes are controlled via a \`useThemeStore\` Zustand store and applied as a \`dark\` or \`light\` class on the document root \`<html>\` element.
`
  },
  {
    id: '03-dark-mode',
    fileName: 'DARK-MODE.md',
    relativePath: 'docs/03-design-system/DARK-MODE.md',
    title: 'Dark Theme Design Guidelines',
    description: 'Contrast thresholds, surface tinting, and dark mode readability rules.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['dark-mode', 'contrast', 'accessibility'],
    version: '1.0.0',
    content: `# Dark Theme Design Guidelines

Dark mode uses deep zinc surfaces (\`#09090b\` / \`#18181b\`) rather than pitch black, avoiding eye fatigue while maintaining 4.5:1 text contrast ratios.
`
  },
  {
    id: '03-light-mode',
    fileName: 'LIGHT-MODE.md',
    relativePath: 'docs/03-design-system/LIGHT-MODE.md',
    title: 'Light Theme Design Guidelines',
    description: 'Clean whites, subtle border hierarchy, and bright background aesthetics.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['light-mode', 'contrast', 'ui'],
    version: '1.0.0',
    content: `# Light Theme Design Guidelines

Light mode emphasizes subtle zinc borders and soft secondary background fills (\`#F4F4F5\`) to distinguish sidebars and cards from main viewports.
`
  },
  {
    id: '03-animations',
    fileName: 'ANIMATIONS.md',
    relativePath: 'docs/03-design-system/ANIMATIONS.md',
    title: 'Motion & Animation Standards',
    description: 'Duration curves, easing functions, and reduced-motion user preferences.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['motion', 'animation', 'easing'],
    version: '1.0.0',
    content: `# Motion & Animation Standards

- Fast (150ms): Button hover, tooltip fade.
- Medium (250ms): Modal pop, dropdown scale.
- Easing: \`cubic-bezier(0.16, 1, 0.3, 1)\`
`
  },
  {
    id: '03-transitions',
    fileName: 'TRANSITIONS.md',
    relativePath: 'docs/03-design-system/TRANSITIONS.md',
    title: 'Micro-Interactions & Transitions',
    description: 'Hover states, focus rings, and smooth layout resizing transitions.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['transitions', 'micro-interactions', 'focus'],
    version: '1.0.0',
    content: `# Micro-Interactions & Transitions

All interactive components must feature hardware-accelerated transitions on \`opacity\` and \`transform\`, with visible accessible focus rings (\`ring-2 ring-primary\`).
`
  },
  {
    id: '03-accessibility',
    fileName: 'ACCESSIBILITY.md',
    relativePath: 'docs/03-design-system/ACCESSIBILITY.md',
    title: 'Accessibility & WCAG 2.1 AA Standards',
    description: 'Compliance matrix, screen reader considerations, and keyboard navigation rules.',
    categorySlug: '03-design-system',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['a11y', 'wcag', 'compliance'],
    version: '1.0.0',
    content: `# Accessibility & WCAG 2.1 AA Standards

1. **Color Contrast:** All body text must maintain a minimum contrast ratio of 4.5:1 against its background.
2. **Keyboard Navigation:** Every actionable element must be focusable and operable via \`Tab\`, \`Enter\`, and \`Space\`.
3. **Screen Readers:** All icon-only buttons must provide explicit \`aria-label\` attributes.
`
  }
];
