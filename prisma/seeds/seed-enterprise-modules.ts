import { prisma } from '../../apps/api/src/config/db';

async function main() {
  const workspaceId = 'fe139f92-9c12-4354-8f4d-4d615efd8816'; // Acme Cloud Engineering
  const owner = await prisma.user.findFirst({ where: { email: 'owner@devblueprint.io' } });
  const ownerId = owner?.id;

  console.log('Seeding Enterprise Modules for Workspace:', workspaceId);

  // 1. Portfolios
  const portfolio1 = await prisma.portfolio.upsert({
    where: { workspaceId_slug: { workspaceId, slug: 'core-banking-cloud' } },
    update: {
      name: 'Core Banking & Payment Orchestration',
      description: 'High-throughput transactional infrastructure, multi-region ledger replication, and real-time fraud mitigation.',
      category: 'Strategic Initiatives',
      budget: 1450000,
      status: 'ACTIVE',
      health: 'ON_TRACK',
      color: '#4f46e5',
      managerId: ownerId,
      startDate: new Date('2026-01-01'),
      targetDate: new Date('2026-12-31')
    },
    create: {
      workspaceId,
      name: 'Core Banking & Payment Orchestration',
      slug: 'core-banking-cloud',
      description: 'High-throughput transactional infrastructure, multi-region ledger replication, and real-time fraud mitigation.',
      category: 'Strategic Initiatives',
      budget: 1450000,
      status: 'ACTIVE',
      health: 'ON_TRACK',
      color: '#4f46e5',
      managerId: ownerId,
      startDate: new Date('2026-01-01'),
      targetDate: new Date('2026-12-31')
    }
  });

  const portfolio2 = await prisma.portfolio.upsert({
    where: { workspaceId_slug: { workspaceId, slug: 'enterprise-automation' } },
    update: {
      name: 'Enterprise Workflow Automation',
      description: 'End-to-end business process digitization, compliance audit pipelines, and low-latency API integration grid.',
      category: 'Operational Excellence',
      budget: 920000,
      status: 'ACTIVE',
      health: 'ON_TRACK',
      color: '#0ea5e9',
      managerId: ownerId,
      startDate: new Date('2026-01-15'),
      targetDate: new Date('2026-11-30')
    },
    create: {
      workspaceId,
      name: 'Enterprise Workflow Automation',
      slug: 'enterprise-automation',
      description: 'End-to-end business process digitization, compliance audit pipelines, and low-latency API integration grid.',
      category: 'Operational Excellence',
      budget: 920000,
      status: 'ACTIVE',
      health: 'ON_TRACK',
      color: '#0ea5e9',
      managerId: ownerId,
      startDate: new Date('2026-01-15'),
      targetDate: new Date('2026-11-30')
    }
  });

  const portfolio3 = await prisma.portfolio.upsert({
    where: { workspaceId_slug: { workspaceId, slug: 'microservices-modernization' } },
    update: {
      name: 'Distributed Platform Modernization',
      description: 'Microservice decoupling, Kubernetes ingress mesh, and distributed tracing across hybrid cloud environments.',
      category: 'Infrastructure & Platform',
      budget: 680000,
      status: 'ACTIVE',
      health: 'AT_RISK',
      color: '#10b981',
      managerId: ownerId,
      startDate: new Date('2026-02-01'),
      targetDate: new Date('2026-10-15')
    },
    create: {
      workspaceId,
      name: 'Distributed Platform Modernization',
      slug: 'microservices-modernization',
      description: 'Microservice decoupling, Kubernetes ingress mesh, and distributed tracing across hybrid cloud environments.',
      category: 'Infrastructure & Platform',
      budget: 680000,
      status: 'ACTIVE',
      health: 'AT_RISK',
      color: '#10b981',
      managerId: ownerId,
      startDate: new Date('2026-02-01'),
      targetDate: new Date('2026-10-15')
    }
  });

  // Link Projects to Portfolios
  // Project 4 (FinTech Payment Orchestrator) -> Portfolio 1
  await prisma.project.update({
    where: { id: '3ed8c194-f44d-475a-bde1-67dcc210d955' },
    data: { portfolioId: portfolio1.id }
  });

  // Project 2 (Minimal Microservice) -> Portfolio 1
  await prisma.project.update({
    where: { id: 'b31b21d1-5ac7-4ebc-b2b5-d08ecfd440be' },
    data: { portfolioId: portfolio1.id }
  });

  // Project 3 (Automated Enterprise Project) -> Portfolio 2
  await prisma.project.update({
    where: { id: '0d158d6f-fb97-4b37-9338-4e5f2121fd7c' },
    data: { portfolioId: portfolio2.id }
  });

  // Project 1 (Blank Scratchpad Project) -> Portfolio 3
  await prisma.project.update({
    where: { id: '9d8ee1fa-f2e3-48d6-93d5-fa419106b707' },
    data: { portfolioId: portfolio3.id }
  });

  // Seed Portfolio Objectives
  await prisma.portfolioObjective.deleteMany({
    where: { portfolioId: { in: [portfolio1.id, portfolio2.id, portfolio3.id] } }
  });

  await prisma.portfolioObjective.createMany({
    data: [
      {
        portfolioId: portfolio1.id,
        title: 'Attain 99.999% Payment Gateway Availability under 5,000 TPS load',
        description: 'Implement multi-region active-active clustering and automatic failover within 250ms.',
        progress: 85,
        status: 'IN_PROGRESS',
        targetDate: new Date('2026-06-30')
      },
      {
        portfolioId: portfolio1.id,
        title: 'Complete SOC2 Type II & PCI-DSS Level 1 Certification',
        description: 'Complete third-party cryptographic hardware security module (HSM) key rotation validation.',
        progress: 100,
        status: 'COMPLETED',
        targetDate: new Date('2026-03-31')
      },
      {
        portfolioId: portfolio1.id,
        title: 'Achieve sub-50ms p99 settlement reconciliation latency',
        description: 'Migrate batch settlement processing to real-time Apache Flink stream pipelines.',
        progress: 60,
        status: 'IN_PROGRESS',
        targetDate: new Date('2026-09-30')
      },
      {
        portfolioId: portfolio2.id,
        title: 'Digitize 100% of Enterprise Purchase Order & Contract Approvals',
        description: 'Eliminate manual PDF signatures and route all approvals via automated event ledger.',
        progress: 75,
        status: 'IN_PROGRESS',
        targetDate: new Date('2026-08-31')
      },
      {
        portfolioId: portfolio2.id,
        title: 'Deploy Zero-Trust RBAC across 14 Corporate Subsystems',
        description: 'Integrate Okta SCIM v2 user provisioning and time-bound privilege escalation.',
        progress: 90,
        status: 'IN_PROGRESS',
        targetDate: new Date('2026-05-15')
      },
      {
        portfolioId: portfolio3.id,
        title: 'Standardize Container Build & OpenTelemetry Ingestion across 8 microservices',
        description: 'Enforce unified Docker multi-stage builds, Distroless runtime images, and Datadog APM tracing.',
        progress: 40,
        status: 'IN_PROGRESS',
        targetDate: new Date('2026-07-31')
      }
    ]
  });

  // 2. Seed Roadmap Items for All Projects
  const projects = await prisma.project.findMany({
    where: { workspaceId },
    include: { roadmaps: true, milestones: true }
  });

  for (const project of projects) {
    let roadmap = project.roadmaps[0];
    if (!roadmap) {
      roadmap = await prisma.roadmap.create({
        data: {
          projectId: project.id,
          name: `${project.name} Strategic Roadmap 2026`,
          timeframe: 'QUARTERLY',
          status: 'ACTIVE'
        }
      });
    }

    // Clean existing items
    await prisma.roadmapItem.deleteMany({ where: { roadmapId: roadmap.id } });

    // Link milestone IDs if available
    const m1 = project.milestones[0];
    const m2 = project.milestones[1];
    const m3 = project.milestones[2];
    const m4 = project.milestones[3];

    await prisma.roadmapItem.createMany({
      data: [
        {
          roadmapId: roadmap.id,
          milestoneId: m1?.id || null,
          title: 'Q1: Core Domain Modelling & Architectural Baseline',
          description: 'Establish domain boundaries, schema validation rules, and automated CI test suites.',
          startDate: new Date('2026-01-05'),
          endDate: new Date('2026-03-27'),
          progress: 100,
          color: '#10b981',
          status: 'COMPLETED',
          priority: 'URGENT'
        },
        {
          roadmapId: roadmap.id,
          milestoneId: m2?.id || null,
          title: 'Q2: Resilience, Circuit Breakers & Distributed Event Mesh',
          description: 'Integrate resilient fallback queues, dead-letter storage, and rate-limiting middleware.',
          startDate: new Date('2026-04-01'),
          endDate: new Date('2026-06-30'),
          progress: 75,
          color: '#3b82f6',
          status: 'IN_PROGRESS',
          priority: 'HIGH'
        },
        {
          roadmapId: roadmap.id,
          milestoneId: m3?.id || null,
          title: 'Q3: High-Throughput Load Testing & Horizontal Scaling',
          description: 'Validate horizontal pod autoscaling under simulated peak transactional bursts.',
          startDate: new Date('2026-07-01'),
          endDate: new Date('2026-09-30'),
          progress: 30,
          color: '#f59e0b',
          status: 'PLANNED',
          priority: 'MEDIUM'
        },
        {
          roadmapId: roadmap.id,
          milestoneId: m4?.id || null,
          title: 'Q4: Global Multi-Region Deployment & Enterprise Sign-Off',
          description: 'Final security penetration audits, disaster recovery drill, and executive sign-off.',
          startDate: new Date('2026-10-01'),
          endDate: new Date('2026-12-18'),
          progress: 0,
          color: '#8b5cf6',
          status: 'PLANNED',
          priority: 'URGENT'
        }
      ]
    });
  }

  // 3. Seed Calendar Events
  await prisma.calendarEvent.deleteMany({ where: { workspaceId } });

  await prisma.calendarEvent.createMany({
    data: [
      {
        workspaceId,
        projectId: '3ed8c194-f44d-475a-bde1-67dcc210d955',
        title: 'Architecture Review Board: Multi-Region Ledger Replication',
        description: 'Review CockroachDB distributed consensus replication latency across us-east and eu-west.',
        eventType: 'MEETING',
        startDate: new Date('2026-11-10T14:00:00Z'),
        endDate: new Date('2026-11-10T15:30:00Z'),
        allDay: false,
        priority: 'URGENT',
        color: '#4f46e5',
        location: 'Executive Briefing Room A',
        meetingUrl: 'https://meet.devblueprint.io/arch-review-ledger',
        createdById: ownerId
      },
      {
        workspaceId,
        projectId: '3ed8c194-f44d-475a-bde1-67dcc210d955',
        title: 'PCI-DSS v4.0 Annual Penetration Test Window',
        description: 'External security audit firm conducting whitebox API penetration testing against Staging cluster.',
        eventType: 'DEPLOYMENT',
        startDate: new Date('2026-11-14T09:00:00Z'),
        endDate: new Date('2026-11-16T18:00:00Z'),
        allDay: true,
        priority: 'URGENT',
        color: '#ef4444',
        location: 'Virtual Security Sandbox',
        createdById: ownerId
      },
      {
        workspaceId,
        projectId: '0d158d6f-fb97-4b37-9338-4e5f2121fd7c',
        title: 'Sprint 4 Planning & Capacity Allocation',
        description: 'Estimate user stories for dynamic SLA calculation engine and auto-escalation workers.',
        eventType: 'MEETING',
        startDate: new Date('2026-11-12T10:00:00Z'),
        endDate: new Date('2026-11-12T11:00:00Z'),
        allDay: false,
        priority: 'MEDIUM',
        color: '#0ea5e9',
        meetingUrl: 'https://meet.devblueprint.io/sprint-planning-4',
        createdById: ownerId
      },
      {
        workspaceId,
        projectId: 'b31b21d1-5ac7-4ebc-b2b5-d08ecfd440be',
        title: 'Production Deployment Freeze Window (Black Friday Preparation)',
        description: 'Code freeze across all microservices; only P0 critical hotfixes permitted with VP approval.',
        eventType: 'DEPLOYMENT',
        startDate: new Date('2026-11-20T00:00:00Z'),
        endDate: new Date('2026-11-30T23:59:59Z'),
        allDay: true,
        priority: 'HIGH',
        color: '#f59e0b',
        location: 'Production AWS VPC',
        createdById: ownerId
      },
      {
        workspaceId,
        projectId: '9d8ee1fa-f2e3-48d6-93d5-fa419106b707',
        title: 'Frontend Design System Sync & Accessibility Review',
        description: 'Audit WCAG 2.1 AA compliance for contrast ratios, keyboard navigation, and screen reader labels.',
        eventType: 'REVIEW',
        startDate: new Date('2026-11-18T15:00:00Z'),
        endDate: new Date('2026-11-18T16:00:00Z'),
        allDay: false,
        priority: 'LOW',
        color: '#10b981',
        meetingUrl: 'https://meet.devblueprint.io/design-system-a11y',
        createdById: ownerId
      }
    ]
  });

  console.log('Enterprise Modules Seed Complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
