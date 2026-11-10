import { PrismaClient, ReleaseStatus, EnvironmentType, DeploymentStatus } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedReleases(prisma: PrismaClient) {
  console.log('Seeding release versions and cloud deployments for all 4 projects...');

  const releasesPerProject: Record<string, Array<{
    version: string;
    name: string;
    desc: string;
    status: ReleaseStatus;
    date: Date;
    deployments: Array<{
      env: EnvironmentType;
      commit: string;
      status: DeploymentStatus;
      deployedAt: Date;
    }>;
  }>> = {
    [PROJECT_IDS.SCRATCHPAD]: [
      {
        version: 'v0.1.0',
        name: 'Initial Foundation & Design System',
        desc: 'Core Next.js application shell, Tailwind CSS tokens, and initial navigation rails.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-01-20'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: 'a1b2c3d', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-20T14:30:00Z') },
          { env: EnvironmentType.STAGING, commit: 'a1b2c3d', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-19T18:00:00Z') }
        ]
      },
      {
        version: 'v0.5.0',
        name: 'Workspace Shell & Resizable Layout',
        desc: 'Four-panel IDE layout with smooth hardware-accelerated pointer drag handling and dark mode.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-02-01'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: '4e5f6a7', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-01T16:15:00Z') },
          { env: EnvironmentType.STAGING, commit: '4e5f6a7', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-31T11:45:00Z') }
        ]
      },
      {
        version: 'v1.0.0-GA',
        name: 'General Availability Web Release',
        desc: 'Production release with full blueprint documentation, optimistic UI forms, and multi-tenant auth.',
        status: ReleaseStatus.IN_PROGRESS,
        date: new Date('2026-03-01'),
        deployments: [
          { env: EnvironmentType.STAGING, commit: '8b9c0d1', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-05T09:20:00Z') }
        ]
      }
    ],
    [PROJECT_IDS.MICROSERVICE]: [
      {
        version: 'v0.1.0',
        name: 'Service Mesh Skeleton',
        desc: 'Independent Docker containers for User, Order, and Inventory services with PostgreSQL databases.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-01-22'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: 'f1e2d3c', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-22T12:00:00Z') },
          { env: EnvironmentType.STAGING, commit: 'f1e2d3c', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-21T15:30:00Z') }
        ]
      },
      {
        version: 'v0.5.0',
        name: 'RabbitMQ Pub/Sub Backbone',
        desc: 'Event bus deployment with dead-letter exchange policies and consumer backoff retry mechanisms.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-02-02'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: 'b4a5c6d', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-02T18:40:00Z') },
          { env: EnvironmentType.STAGING, commit: 'b4a5c6d', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-01T20:10:00Z') }
        ]
      },
      {
        version: 'v1.0.0-GA',
        name: 'API Gateway & Distributed Tracing Release',
        desc: 'Unified reverse proxy gateway with JWT token verification and OpenTelemetry distributed spans.',
        status: ReleaseStatus.IN_PROGRESS,
        date: new Date('2026-03-10'),
        deployments: [
          { env: EnvironmentType.STAGING, commit: '7e8f9a0', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-06T14:00:00Z') }
        ]
      }
    ],
    [PROJECT_IDS.AUTOMATION]: [
      {
        version: 'v0.1.0',
        name: 'Workflow Core Foundation',
        desc: 'JSON DAG workflow specification parser with cycle detection and database state storage.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-01-18'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: 'c3d4e5f', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-18T10:30:00Z') },
          { env: EnvironmentType.STAGING, commit: 'c3d4e5f', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-17T16:45:00Z') }
        ]
      },
      {
        version: 'v0.5.0',
        name: 'BullMQ Distributed Worker Fleet',
        desc: 'Scalable Redis BullMQ worker cluster processing up to 20 concurrent jobs per container.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-01-30'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: '9a0b1c2', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-30T17:15:00Z') },
          { env: EnvironmentType.STAGING, commit: '9a0b1c2', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-29T21:00:00Z') }
        ]
      },
      {
        version: 'v1.0.0-GA',
        name: 'Approval Gates & Audit Trail Release',
        desc: 'Human-in-the-loop managerial approvals, auto-escalation, and SHA-256 cryptographic audit logs.',
        status: ReleaseStatus.IN_PROGRESS,
        date: new Date('2026-03-05'),
        deployments: [
          { env: EnvironmentType.STAGING, commit: '3d4e5f6', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-04T13:30:00Z') }
        ]
      }
    ],
    [PROJECT_IDS.FINTECH]: [
      {
        version: 'v0.1.0',
        name: 'Switch Core & ISO 20022 Parser',
        desc: 'Transaction ingestion switch with ISO 20022 schema validation and Kafka event streams.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-01-15'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: '7f4a9b2', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-15T08:00:00Z') },
          { env: EnvironmentType.STAGING, commit: '7f4a9b2', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-14T19:00:00Z') }
        ]
      },
      {
        version: 'v0.5.0',
        name: 'Zero-Trust Tokenization & Dynamic Fallback',
        desc: 'FIPS 140-2 card tokenization and dynamic circuit breaker switching between Stripe and Adyen.',
        status: ReleaseStatus.RELEASED,
        date: new Date('2026-01-28'),
        deployments: [
          { env: EnvironmentType.PRODUCTION, commit: 'e5d6c7b', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-28T11:20:00Z') },
          { env: EnvironmentType.STAGING, commit: 'e5d6c7b', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-01-27T14:10:00Z') }
        ]
      },
      {
        version: 'v1.0.0-GA',
        name: 'General Availability Financial Engine',
        desc: 'Production rollout of double-entry ledger balancing and automated bank settlement reconciliation.',
        status: ReleaseStatus.IN_PROGRESS,
        date: new Date('2026-02-28'),
        deployments: [
          { env: EnvironmentType.STAGING, commit: '9a8b7c6', status: DeploymentStatus.DEPLOYED, deployedAt: new Date('2026-02-03T17:00:00Z') }
        ]
      }
    ]
  };

  for (const [projectId, releases] of Object.entries(releasesPerProject)) {
    for (const rel of releases) {
      let release = await prisma.release.findFirst({
        where: { projectId, version: rel.version }
      });

      if (!release) {
        release = await prisma.release.create({
          data: {
            projectId,
            version: rel.version,
            title: rel.name,
            description: rel.desc,
            status: rel.status,
            targetDate: rel.date
          }
        });
      } else {
        release = await prisma.release.update({
          where: { id: release.id },
          data: {
            title: rel.name,
            description: rel.desc,
            status: rel.status,
            targetDate: rel.date
          }
        });
      }

      for (const dep of rel.deployments) {
        const existingDep = await prisma.deployment.findFirst({
          where: { releaseId: release.id, environment: dep.env }
        });

        if (!existingDep) {
          await prisma.deployment.create({
            data: {
              releaseId: release.id,
              environment: dep.env,
              status: DeploymentStatus.DEPLOYED,
              deployedAt: dep.deployedAt,
              deployedById: USER_IDS.DEVOPS_ENGINEER
            }
          });
        }
      }
    }
  }

  console.log('✓ Seeded releases and deployment records for all 4 projects.');
}
