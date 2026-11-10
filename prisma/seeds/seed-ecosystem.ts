import { PrismaClient, EnvironmentType, DeploymentStatus, ReleaseStatus } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedEcosystem(prisma: PrismaClient) {
  console.log('Seeding Enterprise Engineering Ecosystem (Design, Repos, Testing, Releases)...');

  const allProjects = [
    PROJECT_IDS.SCRATCHPAD,
    PROJECT_IDS.MICROSERVICE,
    PROJECT_IDS.AUTOMATION,
    PROJECT_IDS.FINTECH
  ];

  // =========================================================================
  // 1. DESIGN SYSTEM TOKENS, PALETTES, THEMES & COMPONENT SPECS
  // =========================================================================
  for (const projectId of allProjects) {
    // A. Color Palettes
    const brandPalette = await prisma.colorPalette.upsert({
      where: { id: `pal-brand-${projectId}` },
      update: {},
      create: {
        id: `pal-brand-${projectId}`,
        projectId,
        name: 'Enterprise Blue Palette',
        description: 'Core brand shades for primary interactions, buttons, and navigation active states.'
      }
    });

    const neutralPalette = await prisma.colorPalette.upsert({
      where: { id: `pal-neutral-${projectId}` },
      update: {},
      create: {
        id: `pal-neutral-${projectId}`,
        projectId,
        name: 'Slate Neutral Palette',
        description: 'Backgrounds, surfaces, borders, and secondary typography.'
      }
    });

    // B. Design Tokens across all 20 categories
    const initialTokens = [
      // 1. Brand Colors
      { name: 'Brand Primary 500', key: 'colors.brand.primary', category: 'BRAND_COLOR', value: '#2563EB', type: 'color', semanticRole: 'PRIMARY', paletteId: brandPalette.id, metadata: JSON.stringify({ hex: '#2563EB', rgb: 'rgb(37, 99, 235)', hsl: 'hsl(221, 83%, 53%)' }) },
      { name: 'Brand Primary 600', key: 'colors.brand.primary-hover', category: 'BRAND_COLOR', value: '#1D4ED8', type: 'color', semanticRole: 'PRIMARY', paletteId: brandPalette.id, metadata: JSON.stringify({ hex: '#1D4ED8', rgb: 'rgb(29, 78, 216)', hsl: 'hsl(224, 76%, 48%)' }) },
      { name: 'Brand Secondary 500', key: 'colors.brand.secondary', category: 'BRAND_COLOR', value: '#64748B', type: 'color', semanticRole: 'SECONDARY', paletteId: neutralPalette.id, metadata: JSON.stringify({ hex: '#64748B', rgb: 'rgb(100, 116, 139)', hsl: 'hsl(215, 16%, 47%)' }) },
      // 2. Semantic Colors
      { name: 'Success Emerald', key: 'colors.semantic.success', category: 'SEMANTIC_COLOR', value: '#10B981', type: 'color', semanticRole: 'SUCCESS', metadata: JSON.stringify({ hex: '#10B981', rgb: 'rgb(16, 185, 129)', hsl: 'hsl(160, 84%, 39%)' }) },
      { name: 'Warning Amber', key: 'colors.semantic.warning', category: 'SEMANTIC_COLOR', value: '#F59E0B', type: 'color', semanticRole: 'WARNING', metadata: JSON.stringify({ hex: '#F59E0B', rgb: 'rgb(245, 158, 11)', hsl: 'hsl(38, 92%, 50%)' }) },
      { name: 'Danger Rose', key: 'colors.semantic.danger', category: 'SEMANTIC_COLOR', value: '#EF4444', type: 'color', semanticRole: 'DANGER', metadata: JSON.stringify({ hex: '#EF4444', rgb: 'rgb(239, 68, 68)', hsl: 'hsl(0, 84%, 60%)' }) },
      { name: 'Info Cyan', key: 'colors.semantic.info', category: 'SEMANTIC_COLOR', value: '#06B6D4', type: 'color', semanticRole: 'INFO', metadata: JSON.stringify({ hex: '#06B6D4', rgb: 'rgb(6, 182, 212)', hsl: 'hsl(189, 94%, 43%)' }) },
      // 3. Background Colors
      { name: 'Background Canvas', key: 'colors.bg.canvas', category: 'BG_COLOR', value: '#F8FAFC', type: 'color', semanticRole: 'BACKGROUND', metadata: JSON.stringify({ hex: '#F8FAFC', rgb: 'rgb(248, 250, 252)', hsl: 'hsl(210, 40%, 98%)' }) },
      { name: 'Background Secondary', key: 'colors.bg.secondary', category: 'BG_COLOR', value: '#F1F5F9', type: 'color', semanticRole: 'BACKGROUND', metadata: JSON.stringify({ hex: '#F1F5F9', rgb: 'rgb(241, 245, 249)', hsl: 'hsl(210, 40%, 96%)' }) },
      // 4. Surface Colors
      { name: 'Surface Card', key: 'colors.surface.card', category: 'SURFACE_COLOR', value: '#FFFFFF', type: 'color', semanticRole: 'SURFACE', metadata: JSON.stringify({ hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', hsl: 'hsl(0, 0%, 100%)' }) },
      { name: 'Surface Elevated Modal', key: 'colors.surface.modal', category: 'SURFACE_COLOR', value: '#FFFFFF', type: 'color', semanticRole: 'SURFACE', metadata: JSON.stringify({ hex: '#FFFFFF', rgb: 'rgb(255, 255, 255)', hsl: 'hsl(0, 0%, 100%)' }) },
      // 5. Typography Font Families
      { name: 'Font Family Primary Sans', key: 'typography.font-family.sans', category: 'FONT_FAMILY', value: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif', type: 'typography', description: 'Primary user interface font stack' },
      { name: 'Font Family Code Mono', key: 'typography.font-family.mono', category: 'FONT_FAMILY', value: '"JetBrains Mono", Fira Code, Consolas, Monaco, monospace', type: 'typography', description: 'Technical code blocks, versions, and commit hashes' },
      // 6. Typography Font Sizes
      { name: 'Font Size XS', key: 'typography.font-size.xs', category: 'FONT_SIZE', value: '11px', type: 'typography' },
      { name: 'Font Size SM', key: 'typography.font-size.sm', category: 'FONT_SIZE', value: '13px', type: 'typography' },
      { name: 'Font Size Base', key: 'typography.font-size.base', category: 'FONT_SIZE', value: '15px', type: 'typography' },
      { name: 'Font Size LG', key: 'typography.font-size.lg', category: 'FONT_SIZE', value: '18px', type: 'typography' },
      { name: 'Font Size XL', key: 'typography.font-size.xl', category: 'FONT_SIZE', value: '24px', type: 'typography' },
      // 7. Typography Font Weights
      { name: 'Font Weight Regular', key: 'typography.weight.regular', category: 'FONT_WEIGHT', value: '400', type: 'typography' },
      { name: 'Font Weight Medium', key: 'typography.weight.medium', category: 'FONT_WEIGHT', value: '500', type: 'typography' },
      { name: 'Font Weight Semibold', key: 'typography.weight.semibold', category: 'FONT_WEIGHT', value: '600', type: 'typography' },
      { name: 'Font Weight Bold', key: 'typography.weight.bold', category: 'FONT_WEIGHT', value: '700', type: 'typography' },
      // 8. Line Heights
      { name: 'Line Height Tight', key: 'typography.line-height.tight', category: 'LINE_HEIGHT', value: '1.25', type: 'typography' },
      { name: 'Line Height Normal', key: 'typography.line-height.normal', category: 'LINE_HEIGHT', value: '1.5', type: 'typography' },
      { name: 'Line Height Relaxed', key: 'typography.line-height.relaxed', category: 'LINE_HEIGHT', value: '1.75', type: 'typography' },
      // 9. Letter Spacing
      { name: 'Letter Spacing Tighter', key: 'typography.letter-spacing.tight', category: 'LETTER_SPACING', value: '-0.02em', type: 'typography' },
      { name: 'Letter Spacing Wide', key: 'typography.letter-spacing.wide', category: 'LETTER_SPACING', value: '0.05em', type: 'typography' },
      // 10. Spacing Scales
      { name: 'Spacing Unit 1 (4px)', key: 'spacing.1', category: 'SPACING', value: '4px', type: 'spacing' },
      { name: 'Spacing Unit 2 (8px)', key: 'spacing.2', category: 'SPACING', value: '8px', type: 'spacing' },
      { name: 'Spacing Unit 4 (16px)', key: 'spacing.4', category: 'SPACING', value: '16px', type: 'spacing' },
      { name: 'Spacing Unit 6 (24px)', key: 'spacing.6', category: 'SPACING', value: '24px', type: 'spacing' },
      { name: 'Spacing Unit 8 (32px)', key: 'spacing.8', category: 'SPACING', value: '32px', type: 'spacing' },
      // 11. Grid Configuration
      { name: 'Grid Columns Desktop', key: 'grid.columns.desktop', category: 'GRID', value: '12', type: 'grid' },
      { name: 'Grid Gutter Desktop', key: 'grid.gutter.desktop', category: 'GRID', value: '24px', type: 'grid' },
      // 12. Border Radius
      { name: 'Radius SM', key: 'border.radius.sm', category: 'BORDER_RADIUS', value: '6px', type: 'border' },
      { name: 'Radius MD', key: 'border.radius.md', category: 'BORDER_RADIUS', value: '10px', type: 'border' },
      { name: 'Radius LG', key: 'border.radius.lg', category: 'BORDER_RADIUS', value: '14px', type: 'border' },
      { name: 'Radius Full', key: 'border.radius.full', category: 'BORDER_RADIUS', value: '9999px', type: 'border' },
      // 13. Border Widths
      { name: 'Border Width Thin', key: 'border.width.thin', category: 'BORDER_WIDTH', value: '1px', type: 'border' },
      { name: 'Border Width Focus Ring', key: 'border.width.focus', category: 'BORDER_WIDTH', value: '2px', type: 'border' },
      // 14. Shadows
      { name: 'Shadow Subtle XS', key: 'shadow.xs', category: 'SHADOW', value: '0 1px 2px 0 rgba(0, 0, 0, 0.05)', type: 'shadow' },
      { name: 'Shadow Card SM', key: 'shadow.sm', category: 'SHADOW', value: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px -1px rgba(0, 0, 0, 0.1)', type: 'shadow' },
      { name: 'Shadow Modal LG', key: 'shadow.lg', category: 'SHADOW', value: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)', type: 'shadow' },
      // 15. Iconography
      { name: 'Icon Stroke Width', key: 'icon.stroke-width', category: 'ICONOGRAPHY', value: '1.75px', type: 'iconography' },
      { name: 'Icon Size Default', key: 'icon.size.default', category: 'ICONOGRAPHY', value: '16px', type: 'iconography' },
      // 16. Animations
      { name: 'Animation Pulse Duration', key: 'animation.pulse.duration', category: 'ANIMATION', value: '2s cubic-bezier(0.4, 0, 0.6, 1)', type: 'animation' },
      // 17. Transitions
      { name: 'Transition Fast', key: 'transition.fast', category: 'TRANSITION', value: '150ms ease-in-out', type: 'transition' },
      { name: 'Transition Normal', key: 'transition.normal', category: 'TRANSITION', value: '250ms cubic-bezier(0.16, 1, 0.3, 1)', type: 'transition' },
      // 18. Breakpoints
      { name: 'Breakpoint Mobile', key: 'breakpoint.sm', category: 'BREAKPOINT', value: '640px', type: 'breakpoint' },
      { name: 'Breakpoint Tablet', key: 'breakpoint.md', category: 'BREAKPOINT', value: '768px', type: 'breakpoint' },
      { name: 'Breakpoint Desktop', key: 'breakpoint.lg', category: 'BREAKPOINT', value: '1024px', type: 'breakpoint' },
      { name: 'Breakpoint Wide', key: 'breakpoint.xl', category: 'BREAKPOINT', value: '1280px', type: 'breakpoint' },
      // 19. Z-Index Layers
      { name: 'Z-Index Dropdown', key: 'z-index.dropdown', category: 'Z_INDEX', value: '1000', type: 'z-index' },
      { name: 'Z-Index Sticky Header', key: 'z-index.sticky', category: 'Z_INDEX', value: '1100', type: 'z-index' },
      { name: 'Z-Index Modal Dialog', key: 'z-index.modal', category: 'Z_INDEX', value: '1300', type: 'z-index' },
      { name: 'Z-Index Toast Notification', key: 'z-index.toast', category: 'Z_INDEX', value: '1500', type: 'z-index' }
    ];

    for (const t of initialTokens) {
      await prisma.designToken.upsert({
        where: { projectId_key: { projectId, key: t.key } },
        update: { value: t.value, category: t.category, description: t.description, semanticRole: t.semanticRole, metadata: t.metadata },
        create: {
          projectId,
          name: t.name,
          key: t.key,
          category: t.category,
          value: t.value,
          type: t.type,
          description: t.description,
          semanticRole: t.semanticRole,
          paletteId: t.paletteId,
          metadata: t.metadata
        }
      });
    }

    // C. Themes
    await prisma.theme.upsert({
      where: { projectId_slug: { projectId, slug: 'default-light' } },
      update: {},
      create: {
        projectId,
        name: 'Enterprise Default Light',
        slug: 'default-light',
        isDefault: true,
        isDark: false,
        isPublished: true,
        version: '1.2.0',
        tokenOverrides: JSON.stringify({
          'colors.bg.canvas': '#F8FAFC',
          'colors.surface.card': '#FFFFFF',
          'colors.brand.primary': '#2563EB'
        })
      }
    });

    await prisma.theme.upsert({
      where: { projectId_slug: { projectId, slug: 'enterprise-dark' } },
      update: {},
      create: {
        projectId,
        name: 'Enterprise Midnight Dark',
        slug: 'enterprise-dark',
        isDefault: false,
        isDark: true,
        isPublished: true,
        version: '1.2.0',
        tokenOverrides: JSON.stringify({
          'colors.bg.canvas': '#0F172A',
          'colors.surface.card': '#1E293B',
          'colors.brand.primary': '#3B82F6'
        })
      }
    });

    // D. Component Specifications
    const componentSpecs = [
      {
        name: 'Button',
        componentType: 'BUTTON',
        description: 'Interactive button component supporting primary, secondary, outline, ghost, and danger variants.',
        status: 'STABLE',
        variants: JSON.stringify(['primary', 'secondary', 'outline', 'ghost', 'destructive']),
        properties: JSON.stringify([
          { name: 'size', type: "'sm' | 'md' | 'lg'", default: "'md'", description: 'Controls button padding and text scale' },
          { name: 'disabled', type: 'boolean', default: 'false', description: 'Prevents click interaction and dims opacity' },
          { name: 'loading', type: 'boolean', default: 'false', description: 'Displays spinner icon and disables clicks' }
        ]),
        accessibility: 'WCAG 2.1 AA compliant. Minimum 4.5:1 text contrast ratio, focus-visible ring outline, role="button".',
        usageExamples: '<Button variant="primary" size="md" onClick={handleSave}>\n  Save Blueprint\n</Button>',
        notes: 'Hardware accelerated CSS transition on active transform: translateY(1px).'
      },
      {
        name: 'Input',
        componentType: 'INPUT',
        description: 'Text input with support for leading/trailing icons, error states, and clear triggers.',
        status: 'STABLE',
        variants: JSON.stringify(['default', 'error', 'filled']),
        properties: JSON.stringify([
          { name: 'placeholder', type: 'string', description: 'Descriptive guidance text' },
          { name: 'error', type: 'string', description: 'Displays red error message and red border ring' }
        ]),
        accessibility: 'Requires associated <label> or aria-label. aria-invalid set to true when error present.',
        usageExamples: '<Input label="Repository URL" placeholder="https://github.com/org/repo" error={errors.url?.message} />',
        notes: 'Autofill background color reset via webkit box shadow override.'
      },
      {
        name: 'Modal Dialog',
        componentType: 'MODAL',
        description: 'Accessible overlay dialog with focus trapping, backdrop blur, and escape key listener.',
        status: 'STABLE',
        variants: JSON.stringify(['default', 'destructive-confirm', 'fullscreen']),
        properties: JSON.stringify([
          { name: 'isOpen', type: 'boolean', description: 'Modal open/closed state' },
          { name: 'onClose', type: '() => void', description: 'Callback invoked on backdrop or close button click' }
        ]),
        accessibility: 'role="dialog", aria-modal="true", traps Tab key focus inside modal container.',
        usageExamples: '<Dialog isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} title="Trigger Staging Deployment">\n  <DeploymentForm />\n</Dialog>',
        notes: 'Renders inside React Portal directly before body closing tag.'
      },
      {
        name: 'Badge',
        componentType: 'BADGE',
        description: 'Compact visual indicator for statuses, counts, tags, and category labels.',
        status: 'STABLE',
        variants: JSON.stringify(['default', 'outline', 'success', 'warning', 'destructive', 'status-progress']),
        properties: JSON.stringify([
          { name: 'variant', type: 'string', default: "'default'", description: 'Visual style palette' }
        ]),
        accessibility: 'Screen readers read badge text in natural flow. For icon-only badges, aria-label is required.',
        usageExamples: '<Badge variant="success">Passed QA Gate</Badge>',
        notes: 'Pill border radius 9999px with font weight 600.'
      }
    ];

    for (const spec of componentSpecs) {
      const existing = await prisma.componentSpecification.findFirst({
        where: { projectId, name: spec.name }
      });
      if (existing) {
        await prisma.componentSpecification.update({
          where: { id: existing.id },
          data: spec
        });
      } else {
        await prisma.componentSpecification.create({
          data: { projectId, ...spec }
        });
      }
    }
  }

  // =========================================================================
  // 2. REPOSITORIES, BRANCHES, COMMITS, PULL REQUESTS & PIPELINES
  // =========================================================================
  const repoConfigs: Record<string, {
    name: string;
    url: string;
    provider: string;
    owner: string;
    branches: Array<{ name: string; isDefault: boolean; lastCommitMessage: string }>;
    commits: Array<{ sha: string; message: string; author: string; additions: number; deletions: number; hoursAgo: number }>;
    pullRequests: Array<{ prNumber: number; title: string; author: string; source: string; target: string; status: string; reviewStatus: string }>;
    pipelines: Array<{ number: number; workflow: string; provider: string; status: string; branch: string; commit: string; duration: number; passed: number; failed: number }>;
  }> = {
    [PROJECT_IDS.FINTECH]: {
      name: 'acme/payment-orchestrator',
      url: 'https://github.com/acme/payment-orchestrator',
      provider: 'GITHUB',
      owner: 'acme',
      branches: [
        { name: 'main', isDefault: true, lastCommitMessage: 'merge: PR #42 PCI-DSS v4.0 tokenization gateway' },
        { name: 'develop', isDefault: false, lastCommitMessage: 'feat(router): multi-region CockroachDB consensus latency optimization' },
        { name: 'feat/iso20022-parser', isDefault: false, lastCommitMessage: 'feat(iso): add XML streaming validator for pacs.008 credit transfer' },
        { name: 'fix/circuit-breaker-retry', isDefault: false, lastCommitMessage: 'fix(resilience): enforce exponential backoff on Visa Direct 503 timeout' }
      ],
      commits: [
        { sha: '7f4a9b2', message: 'feat(pci): enforce AES-256-GCM cardholder data vault encryption', author: 'DevOps Engineer', additions: 142, deletions: 18, hoursAgo: 2 },
        { sha: 'c8e1d4f', message: 'test(qa): add end-to-end idempotency test case for double-spend protection', author: 'QA Lead', additions: 89, deletions: 6, hoursAgo: 5 },
        { sha: '3a5b7c9', message: 'perf(cache): Redis Cluster distributed lock with 500ms auto-release TTL', author: 'Backend Engineer', additions: 215, deletions: 47, hoursAgo: 14 },
        { sha: '1e2d3c4', message: 'refactor(api): standardize ISO 20022 error response envelopes', author: 'Frontend Engineer', additions: 74, deletions: 32, hoursAgo: 28 },
        { sha: '9f8e7d6', message: 'chore(deps): bump PostgreSQL driver to 6.3.0 with connection pooling', author: 'DevOps Engineer', additions: 12, deletions: 12, hoursAgo: 48 }
      ],
      pullRequests: [
        { prNumber: 42, title: 'feat: PCI-DSS v4.0 Tokenization Gateway with zero-knowledge vault', author: 'Backend Engineer', source: 'feat/pci-vault', target: 'main', status: 'MERGED', reviewStatus: 'APPROVED' },
        { prNumber: 43, title: 'perf: Multi-region CockroachDB distributed consensus query batching', author: 'Backend Engineer', source: 'develop', target: 'main', status: 'OPEN', reviewStatus: 'APPROVED' },
        { prNumber: 44, title: 'fix: Circuit breaker fallback to dead-letter queue during gateway outages', author: 'DevOps Engineer', source: 'fix/circuit-breaker-retry', target: 'develop', status: 'OPEN', reviewStatus: 'PENDING' },
        { prNumber: 45, title: 'feat: ISO 20022 real-time streaming validator with pacs.008 mapping', author: 'Frontend Engineer', source: 'feat/iso20022-parser', target: 'develop', status: 'OPEN', reviewStatus: 'CHANGES_REQUESTED' }
      ],
      pipelines: [
        { number: 184, workflow: 'CI/CD Production Deployment & Test Matrix', provider: 'GITHUB_ACTIONS', status: 'SUCCESS', branch: 'main', commit: '7f4a9b2', duration: 185, passed: 142, failed: 0 },
        { number: 183, workflow: 'End-to-End Regression & PCI Verification', provider: 'GITHUB_ACTIONS', status: 'SUCCESS', branch: 'develop', commit: 'c8e1d4f', duration: 310, passed: 210, failed: 0 },
        { number: 182, workflow: 'Integration Test Suite & Security Vulnerability Scan', provider: 'GITHUB_ACTIONS', status: 'FAILED', branch: 'fix/circuit-breaker-retry', commit: '3a5b7c9', duration: 92, passed: 88, failed: 2 },
        { number: 181, workflow: 'Static Analysis & SonarQube Quality Gate', provider: 'GITHUB_ACTIONS', status: 'SUCCESS', branch: 'feat/iso20022-parser', commit: '1e2d3c4', duration: 64, passed: 45, failed: 0 }
      ]
    },
    [PROJECT_IDS.MICROSERVICE]: {
      name: 'acme/microservice-mesh',
      url: 'https://gitlab.com/acme/microservice-mesh',
      provider: 'GITLAB',
      owner: 'acme',
      branches: [
        { name: 'main', isDefault: true, lastCommitMessage: 'release: v0.5.0 RabbitMQ pub/sub event backbone' },
        { name: 'develop', isDefault: false, lastCommitMessage: 'feat(ingress): Envoy proxy rate-limiting filter with Redis backend' }
      ],
      commits: [
        { sha: 'b4a5c6d', message: 'feat(bus): RabbitMQ dead-letter exchange retry with exponential backoff', author: 'Backend Engineer', additions: 178, deletions: 24, hoursAgo: 4 },
        { sha: 'f1e2d3c', message: 'feat(grpc): protobuf contract definition for Order & Inventory RPCs', author: 'Backend Engineer', additions: 210, deletions: 12, hoursAgo: 16 }
      ],
      pullRequests: [
        { prNumber: 19, title: 'feat: Envoy proxy rate-limiting filter and distributed tracing headers', author: 'Backend Engineer', source: 'develop', target: 'main', status: 'OPEN', reviewStatus: 'APPROVED' }
      ],
      pipelines: [
        { number: 94, workflow: 'Kubernetes Pod Deployment & Health Verification', provider: 'GITLAB_CI', status: 'SUCCESS', branch: 'main', commit: 'b4a5c6d', duration: 210, passed: 98, failed: 0 },
        { number: 93, workflow: 'Docker Container Build & Trivy CVE Scan', provider: 'GITLAB_CI', status: 'SUCCESS', branch: 'develop', commit: 'f1e2d3c', duration: 140, passed: 62, failed: 0 }
      ]
    },
    [PROJECT_IDS.AUTOMATION]: {
      name: 'acme/workflow-automation-engine',
      url: 'https://bitbucket.org/acme/workflow-automation-engine',
      provider: 'BITBUCKET',
      owner: 'acme',
      branches: [
        { name: 'main', isDefault: true, lastCommitMessage: 'release: v1.0.0 automated rule triggers and audit webhooks' },
        { name: 'develop', isDefault: false, lastCommitMessage: 'feat(sla): dynamic SLA timer calculation engine with calendar holidays' }
      ],
      commits: [
        { sha: '6d7e8f9', message: 'feat(engine): evaluate JSON-logic condition trees in under 2ms', author: 'Frontend Engineer', additions: 95, deletions: 14, hoursAgo: 6 }
      ],
      pullRequests: [
        { prNumber: 12, title: 'feat: Dynamic SLA calculation engine with business hours calendar', author: 'Frontend Engineer', source: 'develop', target: 'main', status: 'OPEN', reviewStatus: 'APPROVED' }
      ],
      pipelines: [
        { number: 61, workflow: 'Bitbucket Pipelines Staging Integration Test', provider: 'BITBUCKET_PIPELINES', status: 'SUCCESS', branch: 'main', commit: '6d7e8f9', duration: 115, passed: 76, failed: 0 }
      ]
    },
    [PROJECT_IDS.SCRATCHPAD]: {
      name: 'acme/scratchpad-webapp',
      url: 'https://github.com/acme/scratchpad-webapp',
      provider: 'GITHUB',
      owner: 'acme',
      branches: [
        { name: 'main', isDefault: true, lastCommitMessage: 'feat: Next.js 15 App Router with four-panel resizable IDE workspace' },
        { name: 'develop', isDefault: false, lastCommitMessage: 'feat(theme): dark mode theme switching with instant localStorage hydration' }
      ],
      commits: [
        { sha: '8b9c0d1', message: 'feat(ui): smooth panel resize handle with pointer capture and hardware cursor', author: 'UI/UX Designer', additions: 130, deletions: 15, hoursAgo: 8 }
      ],
      pullRequests: [
        { prNumber: 8, title: 'feat: Hardware accelerated resizable pane layout with responsive collapse', author: 'UI/UX Designer', source: 'develop', target: 'main', status: 'OPEN', reviewStatus: 'APPROVED' }
      ],
      pipelines: [
        { number: 45, workflow: 'Vercel Preview Deployment & Playwright Test', provider: 'GITHUB_ACTIONS', status: 'SUCCESS', branch: 'main', commit: '8b9c0d1', duration: 85, passed: 54, failed: 0 }
      ]
    }
  };

  for (const [projectId, config] of Object.entries(repoConfigs)) {
    // 1. Create Repository
    let repo = await prisma.repository.findFirst({
      where: { projectId, name: config.name }
    });

    if (!repo) {
      repo = await prisma.repository.create({
        data: {
          projectId,
          name: config.name,
          url: config.url,
          defaultBranch: 'main',
          provider: config.provider,
          isConnected: true,
          isPrimary: true,
          visibility: 'PUBLIC',
          owner: config.owner,
          lastSyncAt: new Date(),
          syncStatus: 'SYNCED',
          webhookUrl: `http://localhost:4000/api/v1/integrations/webhooks/${config.provider.toLowerCase()}`
        }
      });
    } else {
      repo = await prisma.repository.update({
        where: { id: repo.id },
        data: {
          isPrimary: true,
          visibility: 'PUBLIC',
          owner: config.owner,
          lastSyncAt: new Date(),
          syncStatus: 'SYNCED'
        }
      });
    }

    // 2. Seed Branches
    for (const b of config.branches) {
      await prisma.repositoryBranch.upsert({
        where: { repositoryId_name: { repositoryId: repo.id, name: b.name } },
        update: { lastCommitMessage: b.lastCommitMessage },
        create: {
          repositoryId: repo.id,
          name: b.name,
          isDefault: b.isDefault,
          lastCommitMessage: b.lastCommitMessage,
          lastCommitAuthor: 'Core Engineering Team'
        }
      });
    }

    // 3. Seed Commits
    for (const c of config.commits) {
      const commitDate = new Date(Date.now() - c.hoursAgo * 3600000);
      await prisma.gitCommit.upsert({
        where: { repositoryId_sha: { repositoryId: repo.id, sha: c.sha } },
        update: {},
        create: {
          repositoryId: repo.id,
          sha: c.sha,
          message: c.message,
          authorName: c.author,
          branch: 'main',
          additions: c.additions,
          deletions: c.deletions,
          committedAt: commitDate
        }
      });
    }

    // 4. Seed Pull Requests
    for (const pr of config.pullRequests) {
      await prisma.pullRequest.upsert({
        where: { repositoryId_prNumber: { repositoryId: repo.id, prNumber: pr.prNumber } },
        update: { status: pr.status, reviewStatus: pr.reviewStatus },
        create: {
          repositoryId: repo.id,
          projectId,
          prNumber: pr.prNumber,
          title: pr.title,
          author: pr.author,
          sourceBranch: pr.source,
          targetBranch: pr.target,
          status: pr.status,
          reviewStatus: pr.reviewStatus,
          url: `${config.url}/pull/${pr.prNumber}`,
          createdAt: new Date(Date.now() - 86400000 * 2)
        }
      });
    }

    // 5. Seed Pipeline Runs
    for (const p of config.pipelines) {
      const existing = await prisma.pipelineRun.findFirst({
        where: { repositoryId: repo.id, pipelineNumber: p.number }
      });
      if (!existing) {
        await prisma.pipelineRun.create({
          data: {
            repositoryId: repo.id,
            projectId,
            pipelineNumber: p.number,
            workflowName: p.workflow,
            provider: p.provider,
            status: p.status,
            branch: p.branch,
            commitSha: p.commit,
            durationSeconds: p.duration,
            testsPassed: p.passed,
            testsFailed: p.failed,
            testsTotal: p.passed + p.failed,
            deploymentStatus: p.status === 'SUCCESS' ? 'DEPLOYED' : 'FAILED',
            url: `${config.url}/actions/runs/${p.number}`,
            startedAt: new Date(Date.now() - 3600000 * 4),
            completedAt: new Date(Date.now() - 3600000 * 4 + p.duration * 1000)
          }
        });
      }
    }
  }

  // =========================================================================
  // 3. TESTING RUNS & ATTACHMENTS
  // =========================================================================
  for (const projectId of allProjects) {
    const testPlans = await prisma.testPlan.findMany({
      where: { projectId },
      include: { testSuites: { include: { testCases: true } } }
    });

    for (const plan of testPlans) {
      for (const suite of plan.testSuites) {
        const total = suite.testCases.length;
        const passed = suite.testCases.filter((c) => c.status === 'PASSED').length;
        const failed = suite.testCases.filter((c) => c.status === 'FAILED').length;
        const blocked = suite.testCases.filter((c) => c.status === 'BLOCKED').length;
        const skipped = suite.testCases.filter((c) => c.status === 'SKIPPED').length;
        const executed = total - suite.testCases.filter((c) => c.status === 'NOT_RUN').length;
        const passRate = executed > 0 ? Math.round((passed / executed) * 1000) / 10 : 0;

        const existingRun = await prisma.testRun.findFirst({
          where: { projectId, testSuiteId: suite.id }
        });

        if (!existingRun) {
          await prisma.testRun.create({
            data: {
              projectId,
              testSuiteId: suite.id,
              name: `Automated Execution: ${suite.name}`,
              environment: 'Staging Cluster us-east-1',
              status: 'COMPLETED',
              executedById: USER_IDS.QA_LEAD,
              totalCases: total,
              passedCases: passed,
              failedCases: failed,
              blockedCases: blocked,
              skippedCases: skipped,
              passRate,
              notes: `Executed via Enterprise QA Test Runner with 100% assertion coverage. All critical endpoints verified.`,
              startedAt: new Date(Date.now() - 3600000 * 6),
              completedAt: new Date(Date.now() - 3600000 * 6 + 180000)
            }
          });
        }

        // Attach sample execution evidence to first test case
        const firstCase = suite.testCases[0];
        if (firstCase) {
          const existingAtt = await prisma.testAttachment.findFirst({
            where: { testCaseId: firstCase.id }
          });
          if (!existingAtt) {
            await prisma.testAttachment.create({
              data: {
                testCaseId: firstCase.id,
                fileName: 'assertion-trace-snapshot.png',
                fileUrl: 'https://assets.devblueprint.io/evidence/assertion-trace-snapshot.png',
                fileSize: 245800,
                mimeType: 'image/png'
              }
            });
          }
        }
      }
    }
  }

  // =========================================================================
  // 4. RELEASE APPROVALS, RELEASE TASKS & ROLLBACK RECORDS
  // =========================================================================
  for (const projectId of allProjects) {
    const releases = await prisma.release.findMany({
      where: { projectId },
      include: { deployments: true }
    });

    const projectTasks = await prisma.task.findMany({
      where: { projectId },
      take: 5
    });

    for (const release of releases) {
      // 1. Link tasks to release
      for (const t of projectTasks.slice(0, 3)) {
        await prisma.releaseTask.upsert({
          where: { releaseId_taskId: { releaseId: release.id, taskId: t.id } },
          update: {},
          create: { releaseId: release.id, taskId: t.id }
        });
      }

      // 2. Add formal approvals
      const approvers = [
        { id: USER_IDS.QA_LEAD, role: 'QA_LEAD', status: 'APPROVED', notes: 'All functional regression suites and edge cases passed.' },
        { id: USER_IDS.SECURITY_LEAD, role: 'SECURITY_LEAD', status: 'APPROVED', notes: 'Zero high/critical CVEs. OWASP Top 10 automated scan clean.' },
        { id: USER_IDS.OWNER, role: 'RELEASE_MANAGER', status: release.status === ReleaseStatus.RELEASED ? 'APPROVED' : 'PENDING', notes: 'Production change window scheduled.' }
      ];

      for (const app of approvers) {
        const existing = await prisma.releaseApproval.findFirst({
          where: { releaseId: release.id, approverId: app.id }
        });
        if (!existing) {
          await prisma.releaseApproval.create({
            data: {
              releaseId: release.id,
              approverId: app.id,
              role: app.role,
              status: app.status,
              notes: app.notes,
              approvedAt: app.status === 'APPROVED' ? new Date(Date.now() - 86400000 * 3) : null
            }
          });
        }
      }

      // 3. Update readiness score and rollback plan
      await prisma.release.update({
        where: { id: release.id },
        data: {
          readinessScore: release.status === ReleaseStatus.RELEASED ? 100 : 85,
          rollbackPlan: 'Execute blue/green traffic redirect via AWS Route 53 weighted record to previous stable container tag within 60 seconds.'
        }
      });

      // 4. If any deployment was rolled back or for audit demonstration, add rollback record
      const prodDeployment = release.deployments.find((d) => d.environment === EnvironmentType.PRODUCTION);
      if (prodDeployment) {
        await prisma.deployment.update({
          where: { id: prodDeployment.id },
          data: {
            buildNumber: 'BUILD-2026.11.08-842',
            commitSha: '7f4a9b2',
            durationSeconds: 52,
            logs: `[03:10:01] Initializing blue-green container rollout...\n[03:10:14] Kubernetes replica deployment updated to 12 pods\n[03:10:35] Health probes returned 200 OK on /health\n[03:10:53] Production traffic switch complete. Zero dropped packets.`
          }
        });
      }
    }
  }

  console.log('✓ Enterprise Ecosystem Seeding Complete!');
}
