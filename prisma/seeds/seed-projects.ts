import { PrismaClient, ProjectVisibility, ProjectStatus } from '@prisma/client';
import { WORKSPACE_ID, PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedProjects(prisma: PrismaClient, portfolioId: string) {
  console.log('Seeding all four existing projects with enterprise metadata...');

  const projectsData = [
    {
      id: PROJECT_IDS.SCRATCHPAD,
      name: 'Blank Scratchpad Project',
      slug: 'blank-scratchpad-project',
      projectKey: 'BSP',
      description: 'Modular enterprise starter web application for modern full-stack product discovery, UI/UX architecture, authentication, and rapid engineering iterations.',
      projectType: 'Web Application',
      category: 'Product Discovery & Web Apps',
      techStack: JSON.stringify(['Next.js', 'React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'Express.js', 'PostgreSQL']),
      repositoryUrl: 'https://github.com/acme/scratchpad-webapp',
      icon: 'layout',
      color: '#3B82F6',
      visibility: ProjectVisibility.PRIVATE,
      status: ProjectStatus.ACTIVE,
      priority: 'HIGH',
      startDate: new Date('2026-01-10'),
      targetDate: new Date('2026-08-30'),
      budget: 320000.0,
      goals: JSON.stringify([
        'Deliver modular Next.js 15 app shell with Tailwind CSS v4 design system',
        'Establish robust multi-tenant authentication with JWT & RBAC',
        'Achieve sub-100ms Core Web Vitals on high-traffic landing experiences'
      ]),
      createdById: USER_IDS.OWNER
    },
    {
      id: PROJECT_IDS.MICROSERVICE,
      name: 'Minimal Microservice Project',
      slug: 'minimal-microservice-project',
      projectKey: 'MMP',
      description: 'Distributed microservices mesh featuring an API gateway, independent service databases, event-driven RabbitMQ pub/sub, and containerized Docker orchestration.',
      projectType: 'Microservices',
      category: 'Cloud & Distributed Systems',
      techStack: JSON.stringify(['Node.js', 'TypeScript', 'Express.js', 'PostgreSQL', 'Redis', 'Docker', 'REST APIs', 'RabbitMQ']),
      repositoryUrl: 'https://github.com/acme/microservice-mesh',
      icon: 'layers',
      color: '#8B5CF6',
      visibility: ProjectVisibility.PRIVATE,
      status: ProjectStatus.ACTIVE,
      priority: 'HIGH',
      startDate: new Date('2026-01-15'),
      targetDate: new Date('2026-10-15'),
      budget: 540000.0,
      goals: JSON.stringify([
        'Decouple monolithic endpoints into resilient, containerized microservices',
        'Implement resilient RabbitMQ messaging with dead-letter exchange handling',
        'Enforce database-per-service boundaries with unified API gateway routing'
      ]),
      createdById: USER_IDS.ADMIN
    },
    {
      id: PROJECT_IDS.AUTOMATION,
      name: 'Automated Enterprise Project',
      slug: 'automated-enterprise-test-project',
      projectKey: 'AEP',
      description: 'Enterprise workflow automation and process orchestration platform with dynamic DAG execution, BullMQ queue workers, and multi-level approval hierarchies.',
      projectType: 'Enterprise Automation Platform',
      category: 'Workflow & Process Automation',
      techStack: JSON.stringify(['Next.js', 'TypeScript', 'Node.js', 'Express.js', 'PostgreSQL', 'Redis', 'BullMQ', 'Docker']),
      repositoryUrl: 'https://github.com/acme/workflow-automation-engine',
      icon: 'cpu',
      color: '#F59E0B',
      visibility: ProjectVisibility.PRIVATE,
      status: ProjectStatus.ACTIVE,
      priority: 'CRITICAL',
      startDate: new Date('2026-01-05'),
      targetDate: new Date('2026-11-15'),
      budget: 680000.0,
      goals: JSON.stringify([
        'Scale BullMQ distributed worker fleet to process 50,000 background jobs per minute',
        'Support dynamic conditional DAG workflows with automated approval escalation',
        'Provide immutable audit logs and real-time execution telemetry'
      ]),
      createdById: USER_IDS.ADMIN
    },
    {
      id: PROJECT_IDS.FINTECH,
      name: 'FinTech Payment Orchestrator',
      slug: 'fintech-payment-orchestrator',
      projectKey: 'FPO',
      description: 'High-throughput payment orchestration switch with ISO 20022 messaging, zero-trust card tokenization, and double-entry ledger reconciliation.',
      projectType: 'FinTech / Microservices',
      category: 'Financial Engineering',
      techStack: JSON.stringify(['Node.js', 'Go', 'Kafka', 'PostgreSQL', 'Redis', 'Docker', 'Microservices', 'REST and gRPC']),
      repositoryUrl: 'https://github.com/acme/payment-orchestrator',
      icon: 'credit-card',
      color: '#10B981',
      visibility: ProjectVisibility.PRIVATE,
      status: ProjectStatus.ACTIVE,
      priority: 'CRITICAL',
      startDate: new Date('2026-01-01'),
      targetDate: new Date('2026-12-15'),
      budget: 850000.0,
      goals: JSON.stringify([
        'Process 5,000 transactions per second with sub-50ms tokenization',
        'Achieve 99.999% uptime with automated multi-gateway fallback routing',
        'Maintain full PCI-DSS Level 1 compliance and auditable immutable ledgers'
      ]),
      createdById: USER_IDS.OWNER
    }
  ];

  for (const p of projectsData) {
    await prisma.project.upsert({
      where: { id: p.id },
      update: {
        name: p.name,
        slug: p.slug,
        projectKey: p.projectKey,
        description: p.description,
        projectType: p.projectType,
        category: p.category,
        techStack: p.techStack,
        repositoryUrl: p.repositoryUrl,
        icon: p.icon,
        color: p.color,
        visibility: p.visibility,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate,
        targetDate: p.targetDate,
        budget: p.budget,
        goals: p.goals,
        portfolioId
      },
      create: {
        id: p.id,
        workspaceId: WORKSPACE_ID,
        portfolioId,
        name: p.name,
        slug: p.slug,
        projectKey: p.projectKey,
        description: p.description,
        projectType: p.projectType,
        category: p.category,
        techStack: p.techStack,
        repositoryUrl: p.repositoryUrl,
        icon: p.icon,
        color: p.color,
        visibility: p.visibility,
        status: p.status,
        priority: p.priority,
        startDate: p.startDate,
        targetDate: p.targetDate,
        budget: p.budget,
        goals: p.goals,
        createdById: p.createdById
      }
    });
  }

  console.log(`✓ Upserted all 4 enterprise projects.`);
}
