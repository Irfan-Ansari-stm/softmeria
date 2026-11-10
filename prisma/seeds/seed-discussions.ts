import { PrismaClient } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedDiscussions(prisma: PrismaClient) {
  console.log('Seeding engineering discussions & RFC decision records for all 4 projects...');

  const discussionsPerProject: Record<string, Array<{
    title: string;
    cat: string;
    content: string;
    pinned: boolean;
    authorId: string;
    comments: Array<{ authorId: string; content: string }>;
  }>> = {
    [PROJECT_IDS.SCRATCHPAD]: [
      {
        title: 'RFC 001: Next.js 15 App Router vs Pages Router Architecture Decision',
        cat: 'ARCHITECTURE',
        content: 'We need to formally adopt the Next.js 15 App Router with React Server Components (RSC) for all new application routes to leverage streaming SSR and modern React 19 compiler features.',
        pinned: true,
        authorId: USER_IDS.OWNER,
        comments: [
          { authorId: USER_IDS.FRONTEND_DEV, content: 'Fully support this. The streaming suspense boundaries significantly improve perceived page load on slower connections.' },
          { authorId: USER_IDS.QA_LEAD, content: 'Verified with Playwright that SSR hydration mismatches are minimized when using suppressHydrationWarning on html tag.' }
        ]
      },
      {
        title: 'RFC 002: Tailwind CSS v4 CSS Variable Tokens and Dark Mode Theme Persistence',
        cat: 'DESIGN_SYSTEM',
        content: 'Proposal to migrate theme tokens to modern CSS variables (@theme directive) for zero-runtime dark mode switching and seamless Tailwind-merge utility support.',
        pinned: false,
        authorId: USER_IDS.UIUX_DESIGNER,
        comments: [
          { authorId: USER_IDS.FRONTEND_DEV, content: 'Tested with useLayoutStore. The contrast ratios in dark mode now satisfy WCAG AAA standards across all workspace panels.' }
        ]
      }
    ],
    [PROJECT_IDS.MICROSERVICE]: [
      {
        title: 'RFC 010: Inter-Service Communication — gRPC vs HTTP REST Tradeoffs',
        cat: 'ARCHITECTURE',
        content: 'Analyzing latency benchmarks for synchronous inter-service calls. Proposing gRPC with Protocol Buffers for high-throughput internal RPCs while exposing REST via the API Gateway.',
        pinned: true,
        authorId: USER_IDS.BACKEND_DEV,
        comments: [
          { authorId: USER_IDS.OWNER, content: 'Agreed for internal service-to-service communication. Let us ensure the API Gateway continues providing clean OpenAPI JSON contracts to public consumers.' },
          { authorId: USER_IDS.DEVOPS_ENGINEER, content: 'We can configure Envoy / Traefik in Kubernetes to route gRPC payloads with HTTP/2 multiplexing.' }
        ]
      },
      {
        title: 'RFC 011: RabbitMQ Quorum Queues vs Classic Mirrored Queues for High Availability',
        cat: 'INFRASTRUCTURE',
        content: 'Classic mirrored queues are deprecated in modern RabbitMQ. We must migrate all production durable queues to Quorum Queues utilizing Raft consensus.',
        pinned: false,
        authorId: USER_IDS.DEVOPS_ENGINEER,
        comments: [
          { authorId: USER_IDS.BACKEND_DEV, content: 'Verified that quorum queues prevent data loss during single-broker node reboots in Docker swarm.' }
        ]
      }
    ],
    [PROJECT_IDS.AUTOMATION]: [
      {
        title: 'RFC 020: Workflow DAG Execution Engine — Topological Sorting & Cycle Detection',
        cat: 'ARCHITECTURE',
        content: 'Specifying the core DAG resolution algorithm. Using Kahn algorithm for topological sorting during compile time to validate execution order and reject circular branches.',
        pinned: true,
        authorId: USER_IDS.BACKEND_DEV,
        comments: [
          { authorId: USER_IDS.OWNER, content: 'Make sure to emit a structured validation report identifying the exact node IDs that formed the circular loop.' },
          { authorId: USER_IDS.EDITOR, content: 'The visual React Flow editor can highlight the looping edges in red when validation fails.' }
        ]
      },
      {
        title: 'RFC 021: BullMQ Queue Partitioning by Priority and Worker Pool Concurrency',
        cat: 'PERFORMANCE',
        content: 'Separating high-priority transactional workflows from bulk data exports into separate Redis BullMQ queue instances to guarantee sub-second SLA on interactive jobs.',
        pinned: false,
        authorId: USER_IDS.DEVOPS_ENGINEER,
        comments: [
          { authorId: USER_IDS.BACKEND_DEV, content: 'Benchmark results show a 4x reduction in p99 latency when isolating the priority-jobs queue.' }
        ]
      }
    ],
    [PROJECT_IDS.FINTECH]: [
      {
        title: 'RFC 030: ISO 20022 PACS.008 Payment Initiation Schema Compliance & XML Validation',
        cat: 'REGULATORY',
        content: 'Formalizing the adoption of ISO 20022 messaging standards. All outbound credit transfer payloads must validate against official ISO XML schemas prior to gateway dispatch.',
        pinned: true,
        authorId: USER_IDS.OWNER,
        comments: [
          { authorId: USER_IDS.BACKEND_DEV, content: 'Libxml2-based pre-compiled XSD schemas achieve 2ms validation throughput per message in Go.' },
          { authorId: USER_IDS.SECURITY_LEAD, content: 'Audit logging requirements mandate storing the SHA-256 hash of the normalized XML payload.' }
        ]
      },
      {
        title: 'RFC 031: Multi-Gateway Dynamic Failover Logic — Stripe vs Adyen Circuit Breaker',
        cat: 'RESILIENCE',
        content: 'Defining the automated failover criteria. When Stripe error rate exceeds 5% over a 30-second window, switch 100% of new authorizations to Adyen with automated 5-minute canary probe recovery.',
        pinned: false,
        authorId: USER_IDS.BACKEND_DEV,
        comments: [
          { authorId: USER_IDS.QA_LEAD, content: 'Automated chaos test demonstrated zero lost transactions during a 60-second simulated Stripe outage.' }
        ]
      }
    ]
  };

  for (const [projectId, discussions] of Object.entries(discussionsPerProject)) {
    for (const d of discussions) {
      const existing = await prisma.discussion.findFirst({
        where: { projectId, title: d.title }
      });

      let discussionId = existing?.id;

      if (!existing) {
        const created = await prisma.discussion.create({
          data: {
            projectId,
            title: d.title,
            content: d.content,
            isPinned: d.pinned,
            authorId: d.authorId
          }
        });
        discussionId = created.id;
      }

      if (discussionId) {
        for (const c of d.comments) {
          const commentExisting = await prisma.discussionComment.findFirst({
            where: { discussionId, content: c.content }
          });

          if (!commentExisting) {
            await prisma.discussionComment.create({
              data: {
                discussionId,
                authorId: c.authorId,
                content: c.content
              }
            });
          }
        }
      }
    }
  }

  console.log('✓ Seeded discussions and comments across all 4 projects.');
}
