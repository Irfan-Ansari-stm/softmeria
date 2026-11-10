import { PrismaClient, DocumentStatus } from '@prisma/client';
import { documentationSeedService } from '../../apps/api/src/modules/documentation-seeds/seed-service';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedDocumentation(prisma: PrismaClient) {
  console.log('Seeding Complete 139-Document Blueprint for all four projects...');

  const projectConfigs = [
    {
      id: PROJECT_IDS.SCRATCHPAD,
      name: 'Blank Scratchpad Project',
      description: 'Starter full-stack web application blueprint with Next.js 15, Tailwind CSS, and PostgreSQL.',
      repo: 'https://github.com/acme/scratchpad-webapp',
      db: 'PostgreSQL 16 with Prisma ORM and Connection Pooling',
      cache: 'Redis 7.2 In-Memory Key-Value Store for Session Caching',
      queue: 'Redis-backed Lightweight Background Queue',
      backend: 'Next.js Server Actions & Express.js REST API',
      frontend: 'Next.js 15 App Router, React 19, Tailwind CSS v4',
      auth: 'JWT HTTP-Only Cookies with Role-Based Access Control'
    },
    {
      id: PROJECT_IDS.MICROSERVICE,
      name: 'Minimal Microservice Project',
      description: 'Distributed microservice mesh with API Gateway and RabbitMQ event streaming.',
      repo: 'https://github.com/acme/microservice-mesh',
      db: 'PostgreSQL Database-per-Service Architecture',
      cache: 'Redis 7.2 Cache Cluster for Service Caching',
      queue: 'RabbitMQ 3.12 Message Broker with Dead-Letter Exchanges',
      backend: 'Node.js Express + TypeScript Microservices Architecture',
      frontend: 'Next.js Internal Operations Portal',
      auth: 'Centralized OAuth2 / OpenID Connect Token Introspection'
    },
    {
      id: PROJECT_IDS.AUTOMATION,
      name: 'Automated Enterprise Project',
      description: 'Enterprise workflow automation engine with DAG execution and BullMQ queues.',
      repo: 'https://github.com/acme/workflow-automation-engine',
      db: 'PostgreSQL 16 Enterprise with JSONB Workflow State Storage',
      cache: 'Redis 7.2 High-Availability Cluster for BullMQ Queues',
      queue: 'BullMQ Distributed Job Engine with Exponential Backoff Retries',
      backend: 'Node.js Express TypeScript Workflow Runner',
      frontend: 'Next.js 15 Visual Workflow Builder with React Flow',
      auth: 'Enterprise SAML / SSO & Multi-Tenant Role Hierarchies'
    },
    {
      id: PROJECT_IDS.FINTECH,
      name: 'FinTech Payment Orchestrator',
      description: 'High-throughput payment orchestration switch with ISO 20022 and card tokenization.',
      repo: 'https://github.com/acme/payment-orchestrator',
      db: 'PostgreSQL 16 Enterprise with TimescaleDB & pgvector',
      cache: 'Redis 7.2 Cluster with Sentinel HA',
      queue: 'Apache Kafka 3.6 Event Stream Engine',
      backend: 'Go & Node.js Express Dual-Engine High-Throughput Switch',
      frontend: 'Next.js 15 Enterprise Treasury & Operations Dashboard',
      auth: 'Mutual TLS (mTLS) + RS256 JWT with FIPS 140-2 HSM Tokenization'
    }
  ];

  for (const cfg of projectConfigs) {
    console.log(`- Seeding blueprint documents for: ${cfg.name}...`);

    await documentationSeedService.seedProjectDocumentation(
      cfg.id,
      USER_IDS.ADMIN,
      {
        blueprintOption: 'FULL',
        customVariables: {
          PROJECT_NAME: cfg.name,
          PROJECT_DESCRIPTION: cfg.description,
          PROJECT_REPOSITORY: cfg.repo,
          PROJECT_DATABASE: cfg.db,
          PROJECT_CACHE: cfg.cache,
          PROJECT_QUEUE: cfg.queue,
          PROJECT_BACKEND_FRAMEWORK: cfg.backend,
          PROJECT_FRONTEND_FRAMEWORK: cfg.frontend,
          PROJECT_AUTH_METHOD: cfg.auth
        }
      }
    );

    // Set all documents in this project to APPROVED or COMPLETED to satisfy 100% required documentation completion
    await prisma.document.updateMany({
      where: { projectId: cfg.id },
      data: {
        status: DocumentStatus.APPROVED,
        isOptional: false
      }
    });

    const docCount = await prisma.document.count({ where: { projectId: cfg.id } });
    console.log(`  ✓ ${cfg.name}: ${docCount} documents verified and set to APPROVED (100% completion).`);
  }
}
