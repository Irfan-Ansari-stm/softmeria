import { PrismaClient, MilestoneStatus } from '@prisma/client';
import { PROJECT_IDS } from './seed-config';

export async function seedRoadmaps(prisma: PrismaClient) {
  console.log('Seeding roadmaps and 2026 milestones for all four projects...');

  const milestonesPerProject: Record<string, Array<{ name: string; description: string; dueDate: Date; status: MilestoneStatus }>> = {
    [PROJECT_IDS.SCRATCHPAD]: [
      {
        name: 'M1: System Architecture & Wireframes Signoff',
        description: 'Comprehensive UI/UX design tokens, routing architecture, and data flow specifications completed.',
        dueDate: new Date('2026-02-15'),
        status: MilestoneStatus.COMPLETED
      },
      {
        name: 'M2: Core Next.js Application Shell',
        description: 'Responsive desktop layout, dark mode persistence, and resizable layout panels verified.',
        dueDate: new Date('2026-03-30'),
        status: MilestoneStatus.IN_PROGRESS
      },
      {
        name: 'M3: State Management & Optimistic UI',
        description: 'Zustand-powered state machines and TanStack Query optimistic synchronization.',
        dueDate: new Date('2026-05-15'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M4: Production Hardening & Lighthouse 95+',
        description: 'Core Web Vitals optimization, bundle splitting, and automated accessibility verification.',
        dueDate: new Date('2026-07-20'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M5: General Availability v1.0 Launch',
        description: 'Public production deployment on edge network with automated CI/CD pipeline.',
        dueDate: new Date('2026-08-30'),
        status: MilestoneStatus.PLANNED
      }
    ],
    [PROJECT_IDS.MICROSERVICE]: [
      {
        name: 'M1: Containerization & Local Dev Cluster',
        description: 'Docker Compose orchestration and independent PostgreSQL container instances operational.',
        dueDate: new Date('2026-02-20'),
        status: MilestoneStatus.COMPLETED
      },
      {
        name: 'M2: RabbitMQ Pub/Sub Event Backbone',
        description: 'Reliable event broker with dead-letter exchange policies and consumer backoff retries.',
        dueDate: new Date('2026-04-10'),
        status: MilestoneStatus.IN_PROGRESS
      },
      {
        name: 'M3: Unified API Gateway & Auth Guard',
        description: 'Reverse proxy gateway with JWT token verification and Redis sliding window rate limiting.',
        dueDate: new Date('2026-06-05'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M4: OpenTelemetry Distributed Tracing',
        description: 'Distributed trace propagation across all service boundaries with Jaeger visualization.',
        dueDate: new Date('2026-08-15'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M5: Multi-Region Kubernetes Deployment',
        description: 'Production EKS cluster deployment with automated Horizontal Pod Autoscaling (HPA).',
        dueDate: new Date('2026-10-15'),
        status: MilestoneStatus.PLANNED
      }
    ],
    [PROJECT_IDS.AUTOMATION]: [
      {
        name: 'M1: Workflow DAG Engine Specification',
        description: 'JSON-driven directed acyclic graph parser with cycle detection algorithms.',
        dueDate: new Date('2026-02-10'),
        status: MilestoneStatus.COMPLETED
      },
      {
        name: 'M2: BullMQ Distributed Worker Fleet',
        description: 'High-concurrency worker cluster processing job queues with Redis clustering.',
        dueDate: new Date('2026-03-25'),
        status: MilestoneStatus.IN_PROGRESS
      },
      {
        name: 'M3: Human-in-the-Loop Approval Hierarchy',
        description: 'Multi-tiered managerial approval routing with auto-escalation timeouts.',
        dueDate: new Date('2026-05-30'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M4: Visual Drag-and-Drop Workflow Canvas',
        description: 'Interactive low-code workflow designer with real-time dry-run execution simulator.',
        dueDate: new Date('2026-08-20'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M5: Enterprise SOC2 & Audit Logging Compliance',
        description: 'Cryptographically verified audit trail and role-based privilege access certification.',
        dueDate: new Date('2026-11-15'),
        status: MilestoneStatus.PLANNED
      }
    ],
    [PROJECT_IDS.FINTECH]: [
      {
        name: 'M1: Switch Architecture & ISO 20022 Ingestion',
        description: 'High-speed payment switch foundation supporting ISO 20022 XML/JSON schema validation.',
        dueDate: new Date('2026-01-30'),
        status: MilestoneStatus.COMPLETED
      },
      {
        name: 'M2: PCI-DSS Zero-Trust Card Tokenization',
        description: 'FIPS 140-2 Level 3 HSM tokenization engine with sub-50ms cryptographic latency.',
        dueDate: new Date('2026-03-15'),
        status: MilestoneStatus.IN_PROGRESS
      },
      {
        name: 'M3: Multi-Gateway Dynamic Failover',
        description: 'Real-time gateway health telemetry with automated circuit breaker failover to secondary rails.',
        dueDate: new Date('2026-06-01'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M4: Double-Entry Ledger Balancing Engine',
        description: 'Real-time financial accounting ledger with ACID consistency and immutable audit history.',
        dueDate: new Date('2026-09-15'),
        status: MilestoneStatus.PLANNED
      },
      {
        name: 'M5: Automated Bank Settlement Reconciliation',
        description: 'Daily automated clearing house (ACH) and SWIFT settlement file ingestion and recon.',
        dueDate: new Date('2026-12-15'),
        status: MilestoneStatus.PLANNED
      }
    ]
  };

  for (const [projectId, milestones] of Object.entries(milestonesPerProject)) {
    // Ensure roadmap
    await prisma.roadmap.upsert({
      where: { id: `roadmap-${projectId}` },
      update: { name: '2026 Engineering Delivery Roadmap' },
      create: {
        id: `roadmap-${projectId}`,
        projectId,
        name: '2026 Engineering Delivery Roadmap',
        status: 'ACTIVE'
      }
    });

    for (const m of milestones) {
      const existing = await prisma.milestone.findFirst({
        where: { projectId, name: m.name }
      });

      if (!existing) {
        await prisma.milestone.create({
          data: {
            projectId,
            name: m.name,
            description: m.description,
            targetDate: m.dueDate,
            status: m.status
          }
        });
      } else {
        await prisma.milestone.update({
          where: { id: existing.id },
          data: {
            description: m.description,
            targetDate: m.dueDate,
            status: m.status
          }
        });
      }
    }
  }

  console.log('✓ Seeded roadmaps and 5 strategic milestones per project.');
}
