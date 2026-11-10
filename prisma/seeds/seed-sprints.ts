import { PrismaClient, SprintStatus } from '@prisma/client';
import { PROJECT_IDS } from './seed-config';

export async function seedSprints(prisma: PrismaClient) {
  console.log('Seeding historical and active sprints for all four projects...');

  const sprintsPerProject: Record<string, Array<{ name: string; goal: string; status: SprintStatus; startDate: Date; endDate: Date }>> = {
    [PROJECT_IDS.SCRATCHPAD]: [
      {
        name: 'Sprint 1 — Discovery & Next.js Foundation',
        goal: 'Establish repository structure, Tailwind design system tokens, and initial authentication shell.',
        status: SprintStatus.COMPLETED,
        startDate: new Date('2026-01-12'),
        endDate: new Date('2026-01-26')
      },
      {
        name: 'Sprint 2 — App Router & Component Library',
        goal: 'Build core application layout, resizable panels, and dynamic state management store.',
        status: SprintStatus.ACTIVE,
        startDate: new Date('2026-01-27'),
        endDate: new Date('2026-02-10')
      },
      {
        name: 'Sprint 3 — API Integration & SSR Caching',
        goal: 'Integrate backend Express endpoints, implement optimistic UI mutations and SSR hydration.',
        status: SprintStatus.PLANNED,
        startDate: new Date('2026-02-11'),
        endDate: new Date('2026-02-25')
      }
    ],
    [PROJECT_IDS.MICROSERVICE]: [
      {
        name: 'Sprint 1 — Microservice Skeleton & Docker Swarm',
        goal: 'Initialize independent service containers, Docker Compose environment, and PostgreSQL schemas.',
        status: SprintStatus.COMPLETED,
        startDate: new Date('2026-01-15'),
        endDate: new Date('2026-01-29')
      },
      {
        name: 'Sprint 2 — RabbitMQ Pub/Sub & Event Bus',
        goal: 'Implement event-driven order and inventory synchronization with dead-letter exchange retries.',
        status: SprintStatus.ACTIVE,
        startDate: new Date('2026-01-30'),
        endDate: new Date('2026-02-13')
      },
      {
        name: 'Sprint 3 — API Gateway & Distributed Tracing',
        goal: 'Deploy unified API gateway with rate limiting, JWT token verification, and OpenTelemetry spans.',
        status: SprintStatus.PLANNED,
        startDate: new Date('2026-02-14'),
        endDate: new Date('2026-02-28')
      }
    ],
    [PROJECT_IDS.AUTOMATION]: [
      {
        name: 'Sprint 1 — Workflow Core & DAG Parser',
        goal: 'Architect directed acyclic graph (DAG) workflow model and validator for conditional branching.',
        status: SprintStatus.COMPLETED,
        startDate: new Date('2026-01-08'),
        endDate: new Date('2026-01-22')
      },
      {
        name: 'Sprint 2 — BullMQ Worker Cluster & Job Queues',
        goal: 'Deploy Redis BullMQ queue workers, implement exponential backoff retries, and job state listeners.',
        status: SprintStatus.ACTIVE,
        startDate: new Date('2026-01-23'),
        endDate: new Date('2026-02-06')
      },
      {
        name: 'Sprint 3 — Approval Escalation & Audit Trail',
        goal: 'Build multi-level human approval triggers, email/webhook alerts, and immutable execution logs.',
        status: SprintStatus.PLANNED,
        startDate: new Date('2026-02-07'),
        endDate: new Date('2026-02-21')
      }
    ],
    [PROJECT_IDS.FINTECH]: [
      {
        name: 'Sprint 1 — Switch Core & ISO 20022 Schema',
        goal: 'Deploy transaction ingestion switch, ISO 20022 message parsers, and idempotency cache.',
        status: SprintStatus.COMPLETED,
        startDate: new Date('2026-01-05'),
        endDate: new Date('2026-01-19')
      },
      {
        name: 'Sprint 2 — Gateway Fallback & Tokenization',
        goal: 'Implement dynamic smart routing between Stripe and Adyen with sub-50ms PCI card tokenization.',
        status: SprintStatus.ACTIVE,
        startDate: new Date('2026-01-20'),
        endDate: new Date('2026-02-03')
      },
      {
        name: 'Sprint 3 — Double-Entry Ledger & Recon',
        goal: 'Integrate financial ledger balancing engine with automated settlement file reconciliation.',
        status: SprintStatus.PLANNED,
        startDate: new Date('2026-02-04'),
        endDate: new Date('2026-02-18')
      }
    ]
  };

  const createdSprintsMap: Record<string, any[]> = {};

  for (const [projectId, sprints] of Object.entries(sprintsPerProject)) {
    createdSprintsMap[projectId] = [];
    for (const s of sprints) {
      let sprint = await prisma.sprint.findFirst({
        where: { projectId, name: s.name }
      });

      if (!sprint) {
        sprint = await prisma.sprint.create({
          data: {
            projectId,
            name: s.name,
            goal: s.goal,
            status: s.status,
            startDate: s.startDate,
            endDate: s.endDate
          }
        });
      } else {
        sprint = await prisma.sprint.update({
          where: { id: sprint.id },
          data: {
            goal: s.goal,
            status: s.status,
            startDate: s.startDate,
            endDate: s.endDate
          }
        });
      }
      createdSprintsMap[projectId].push(sprint);
    }
  }

  console.log('✓ Seeded 3 sprints per project across all 4 projects.');
  return createdSprintsMap;
}
