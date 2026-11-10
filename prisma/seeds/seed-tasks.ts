import {
  PrismaClient,
  TaskType,
  TaskStatus,
  TaskPriority,
  FeatureStatus,
  RequirementType
} from '@prisma/client';
import { PROJECT_IDS, USER_IDS, WORKSPACE_ID } from './seed-config';

export async function seedTasks(prisma: PrismaClient, sprintsMap: Record<string, any[]>) {
  console.log('Seeding products, features, user stories, tasks & subtasks for all 4 projects...');

  // Ensure workspace task labels
  const labelFrontend = await prisma.taskLabel.upsert({
    where: {
      workspaceId_name: {
        workspaceId: WORKSPACE_ID,
        name: 'Frontend'
      }
    },
    update: {},
    create: { workspaceId: WORKSPACE_ID, name: 'Frontend', color: '#3B82F6' }
  });
  const labelBackend = await prisma.taskLabel.upsert({
    where: {
      workspaceId_name: {
        workspaceId: WORKSPACE_ID,
        name: 'Backend'
      }
    },
    update: {},
    create: { workspaceId: WORKSPACE_ID, name: 'Backend', color: '#10B981' }
  });
  const labelSecurity = await prisma.taskLabel.upsert({
    where: {
      workspaceId_name: {
        workspaceId: WORKSPACE_ID,
        name: 'Security'
      }
    },
    update: {},
    create: { workspaceId: WORKSPACE_ID, name: 'Security', color: '#EF4444' }
  });
  const labelDevOps = await prisma.taskLabel.upsert({
    where: {
      workspaceId_name: {
        workspaceId: WORKSPACE_ID,
        name: 'DevOps'
      }
    },
    update: {},
    create: { workspaceId: WORKSPACE_ID, name: 'DevOps', color: '#8B5CF6' }
  });

  const projectDefinitions: Record<string, {
    productName: string;
    productDesc: string;
    features: Array<{
      name: string;
      desc: string;
      stories: Array<{ title: string; criteria: string }>;
    }>;
    tasks: Array<{
      key: string;
      title: string;
      desc: string;
      type: TaskType;
      status: TaskStatus;
      priority: TaskPriority;
      points: number;
      sprintIdx: number; // 0: completed, 1: active, 2: planned
      assigneeId: string;
      labelIds: string[];
      subtasks?: string[];
    }>;
  }> = {
    [PROJECT_IDS.SCRATCHPAD]: {
      productName: 'Scratchpad Core Web Platform',
      productDesc: 'Modern Next.js 15 full-stack web application starter platform with Tailwind CSS design tokens.',
      features: [
        {
          name: 'Application Shell & Layout Architecture',
          desc: 'Flexible multi-panel layout with hardware-accelerated resizing and dark mode.',
          stories: [
            { title: 'As a user, I want smooth panel resizing so that I can customize my workspace', criteria: 'Divider has 8-12px hit zone and zero lag' },
            { title: 'As an engineer, I want persisted theme settings so that my dark mode preference is preserved', criteria: 'Stored in localStorage and database' }
          ]
        },
        {
          name: 'Authentication & Session Handling',
          desc: 'JWT HTTP-only secure cookie authentication with session refresh rotation.',
          stories: [
            { title: 'As a developer, I want token refresh rotation so that my session is continuous', criteria: 'Automatic silent token refresh on 401' }
          ]
        },
        {
          name: 'Form Validation & Optimistic Mutations',
          desc: 'React Hook Form integration with Zod schemas and TanStack Query optimistic updates.',
          stories: [
            { title: 'As a user, I want immediate UI feedback so that forms feel instantaneous', criteria: 'Optimistic state rollbacks on network failure' }
          ]
        }
      ],
      tasks: [
        { key: 'BSP-101', title: 'Initialize Next.js 15 App Router and Tailwind CSS v4 tokens', desc: 'Configure font tokens, color palette CSS variables, and layout boundaries.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] },
        { key: 'BSP-102', title: 'Implement multi-tenant workspace switcher header', desc: 'Create dropdown selector supporting multiple organizations and user role badges.', type: TaskType.STORY, status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, points: 3, sprintIdx: 0, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] },
        { key: 'BSP-103', title: 'Build JWT session refresh rotation middleware', desc: 'Handle expired access tokens transparently using HTTP-only refresh cookies.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id, labelSecurity.id] },
        { key: 'BSP-104', title: 'Implement hardware-accelerated 4-panel workspace resizing', desc: 'Optimize requestAnimationFrame pointer capture on divider drag.', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, points: 8, sprintIdx: 1, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id], subtasks: ['Capture pointer events', 'Prevent text selection lag', 'Debounce dimension persistence'] },
        { key: 'BSP-105', title: 'Integrate React Hook Form with Zod runtime validators', desc: 'Create reusable FormField components with inline error alerts and accessibility.', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.EDITOR, labelIds: [labelFrontend.id] },
        { key: 'BSP-106', title: 'Design dark mode high-contrast palette tokens', desc: 'Refine border contrast and secondary card surfaces for WCAG AAA accessibility.', type: TaskType.STORY, status: TaskStatus.IN_REVIEW, priority: TaskPriority.MEDIUM, points: 3, sprintIdx: 1, assigneeId: USER_IDS.UIUX_DESIGNER, labelIds: [labelFrontend.id] },
        { key: 'BSP-107', title: 'Implement optimistic UI mutations for task updates', desc: 'Cache invalidation and rollback handling on server error responses.', type: TaskType.TASK, status: TaskStatus.TESTING, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.QA_LEAD, labelIds: [labelFrontend.id] },
        { key: 'BSP-108', title: 'Fix SSR hydration mismatch on initial theme mount', desc: 'Suppress hydration warning on HTML root element with inline theme script.', type: TaskType.BUG, status: TaskStatus.BLOCKED, priority: TaskPriority.HIGH, points: 3, sprintIdx: 1, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] },
        { key: 'BSP-109', title: 'Configure Vitest and Playwright end-to-end test suite', desc: 'Add GitHub Actions workflow running headless Chromium tests on PR push.', type: TaskType.TASK, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.QA_LEAD, labelIds: [labelDevOps.id] },
        { key: 'BSP-110', title: 'Implement full-text fuzzy search for workspace entities', desc: 'Add client-side indexing with keyboard shortcut (Cmd+K) navigation modal.', type: TaskType.STORY, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.EDITOR, labelIds: [labelFrontend.id] },
        { key: 'BSP-111', title: 'Automate Docker multi-stage production container build', desc: 'Optimize standalone Next.js image size below 120MB with Alpine Linux.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.LOW, points: 3, sprintIdx: 2, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id] },
        { key: 'BSP-112', title: 'Audit bundle size and implement dynamic code splitting', desc: 'Lazy load heavy markdown rendering libraries and chart visualization widgets.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 2, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] }
      ]
    },
    [PROJECT_IDS.MICROSERVICE]: {
      productName: 'Distributed Microservices Mesh',
      productDesc: 'High-availability microservice architecture with API gateway, independent service databases, and RabbitMQ.',
      features: [
        {
          name: 'API Gateway & Reverse Proxy',
          desc: 'Central entrypoint routing traffic with token validation and rate limiting.',
          stories: [
            { title: 'As an API consumer, I want a single gateway endpoint so that internal service topology is hidden', criteria: 'All requests route via /api/v1/*' }
          ]
        },
        {
          name: 'RabbitMQ Event Bus & Dead-Letter Queues',
          desc: 'Asynchronous event propagation with exponential backoff retry and DLQ routing.',
          stories: [
            { title: 'As a backend service, I want guaranteed event delivery so that data consistency is maintained', criteria: 'At-least-once delivery with deduplication' }
          ]
        },
        {
          name: 'Service Health Telemetry & OpenTelemetry',
          desc: 'Distributed tracing across services with automated health check probes.',
          stories: [
            { title: 'As an SRE, I want distributed traces so that cross-service bottlenecks are easily identified', criteria: 'W3C TraceContext propagation' }
          ]
        }
      ],
      tasks: [
        { key: 'MMP-201', title: 'Define Protocol Buffer contracts for inter-service communication', desc: 'Generate TypeScript and Go types for User, Order, and Inventory services.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'MMP-202', title: 'Deploy RabbitMQ cluster with management interface in Docker', desc: 'Configure topic exchanges, durable queues, and consumer prefetch counts.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id, labelBackend.id] },
        { key: 'MMP-203', title: 'Implement database-per-service isolation in PostgreSQL', desc: 'Create separate schemas and database connection pools for each microservice.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, points: 3, sprintIdx: 0, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'MMP-204', title: 'Build API Gateway routing and JWT signature verification', desc: 'Intercept incoming requests, validate claims, and inject X-User-Id header.', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, points: 8, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id, labelSecurity.id], subtasks: ['Implement reverse proxy', 'Add JWT verify cache in Redis', 'Inject trace headers'] },
        { key: 'MMP-205', title: 'Implement idempotency consumer in Order Service', desc: 'Use Redis keys with TTL to prevent duplicate processing of OrderCreated events.', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'MMP-206', title: 'Implement circuit breaker pattern with Opossum on HTTP calls', desc: 'Open circuit after 5 consecutive failures; fallback to cached stale data.', type: TaskType.STORY, status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'MMP-207', title: 'Configure OpenTelemetry NodeSDK for distributed spans', desc: 'Propagate W3C traceparent headers across HTTP and RabbitMQ messaging.', type: TaskType.TASK, status: TaskStatus.TESTING, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.QA_LEAD, labelIds: [labelDevOps.id] },
        { key: 'MMP-208', title: 'Fix RabbitMQ unacknowledged message leak on worker panic', desc: 'Wrap consumer handlers in try/catch to always nack or reject on uncaught errors.', type: TaskType.BUG, status: TaskStatus.BLOCKED, priority: TaskPriority.CRITICAL, points: 5, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'MMP-209', title: 'Implement Redis sliding window rate limiting on API gateway', desc: 'Enforce 100 requests per minute per IP address with 429 Retry-After header.', type: TaskType.TASK, status: TaskStatus.TODO, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.SECURITY_LEAD, labelIds: [labelSecurity.id, labelBackend.id] },
        { key: 'MMP-210', title: 'Add Kubernetes manifest templates with Helm charts', desc: 'Define Deployment, Service, ConfigMap, and Ingress resources per microservice.', type: TaskType.TASK, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id] },
        { key: 'MMP-211', title: 'Implement automated canary deployments with Flagger', desc: 'Gradually shift 10% traffic to new service revisions based on error rate metrics.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.LOW, points: 8, sprintIdx: 2, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id] },
        { key: 'MMP-212', title: 'Benchmark inter-service gRPC vs REST latency throughput', desc: 'Conduct load testing with k6 measuring p95 and p99 under 5,000 req/sec.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 2, assigneeId: USER_IDS.QA_LEAD, labelIds: [labelBackend.id] }
      ]
    },
    [PROJECT_IDS.AUTOMATION]: {
      productName: 'Enterprise Workflow Automation Engine',
      productDesc: 'Scalable business process automation platform with directed acyclic graph (DAG) execution and BullMQ queues.',
      features: [
        {
          name: 'Workflow DAG Execution Engine',
          desc: 'Parses complex multi-branch workflows with conditional nodes and parallel execution.',
          stories: [
            { title: 'As a workflow architect, I want DAG validation so that circular dependencies are rejected', criteria: 'Topological sort validation on save' }
          ]
        },
        {
          name: 'BullMQ Distributed Job Queues',
          desc: 'High-throughput asynchronous job workers with real-time progress events.',
          stories: [
            { title: 'As a system operator, I want automatic job retries so that transient failures recover automatically', criteria: 'Exponential backoff up to 5 attempts' }
          ]
        },
        {
          name: 'Multi-Level Approval Hierarchy',
          desc: 'Managerial sign-off gates with automated timeout escalation policies.',
          stories: [
            { title: 'As an executive, I want approval notifications via webhook and email so that reviews happen promptly', criteria: 'Instant notification on task trigger' }
          ]
        }
      ],
      tasks: [
        { key: 'AEP-301', title: 'Implement JSON schema validator for workflow DAG definitions', desc: 'Detect cycles using Tarjan algorithm and validate node input/output type contracts.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'AEP-302', title: 'Configure BullMQ Redis queue connection with Sentinel clustering', desc: 'Set up worker concurrency of 20 jobs per container with Redis master failover.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id, labelBackend.id] },
        { key: 'AEP-303', title: 'Implement workflow execution state persistence in PostgreSQL', desc: 'Save intermediate step payloads in JSONB column with transition timestamps.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 0, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'AEP-304', title: 'Build multi-step conditional branch evaluator', desc: 'Support expression syntax for payload evaluation (e.g. data.amount > 10000).', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, points: 8, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id], subtasks: ['Parse AST expressions', 'Sandbox code execution', 'Emit branching telemetry'] },
        { key: 'AEP-305', title: 'Implement human approval gate with auto-escalation timer', desc: 'Pause workflow execution until authorized user submits signature or timeout expires.', type: TaskType.STORY, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.EDITOR, labelIds: [labelBackend.id, labelFrontend.id] },
        { key: 'AEP-306', title: 'Create visual workflow canvas with React Flow', desc: 'Drag-and-drop nodes for triggers, actions, conditionals, and webhooks.', type: TaskType.STORY, status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, points: 8, sprintIdx: 1, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] },
        { key: 'AEP-307', title: 'Implement cryptographically hashed audit log for every step execution', desc: 'Generate SHA-256 hash chains of execution inputs, outputs, and executor IDs.', type: TaskType.TASK, status: TaskStatus.TESTING, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.SECURITY_LEAD, labelIds: [labelSecurity.id] },
        { key: 'AEP-308', title: 'Fix BullMQ worker memory leak on stalled job lock extension', desc: 'Correct lock renewal interval logic when processing long-running third-party syncs.', type: TaskType.BUG, status: TaskStatus.BLOCKED, priority: TaskPriority.CRITICAL, points: 5, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'AEP-309', title: 'Add webhook notification dispatcher with signature headers', desc: 'Deliver HMAC-SHA256 signed payloads to external customer endpoints on workflow completion.', type: TaskType.TASK, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id, labelSecurity.id] },
        { key: 'AEP-310', title: 'Build live execution telemetry stream via WebSocket', desc: 'Broadcast step-by-step progress to browser UI in real time.', type: TaskType.STORY, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] },
        { key: 'AEP-311', title: 'Implement rate limiting and backpressure on incoming trigger webhooks', desc: 'Buffer high-frequency webhook bursts in Redis queue to prevent database starvation.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 2, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id] },
        { key: 'AEP-312', title: 'Create automated export and import of workflow templates (JSON/YAML)', desc: 'Support version-controlled workflow definitions across staging and production.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.LOW, points: 3, sprintIdx: 2, assigneeId: USER_IDS.EDITOR, labelIds: [labelFrontend.id] }
      ]
    },
    [PROJECT_IDS.FINTECH]: {
      productName: 'FinTech Payment Switch & Ledger',
      productDesc: 'PCI-DSS Level 1 payment orchestration platform with ISO 20022 messaging, zero-trust tokenization, and ledger balancing.',
      features: [
        {
          name: 'Payment Gateway Dynamic Router',
          desc: 'Real-time routing switch between primary and secondary payment gateways with zero downtime.',
          stories: [
            { title: 'As a merchant, I want automatic gateway failover so that payments never fail when a provider is down', criteria: 'Sub-200ms circuit trip' }
          ]
        },
        {
          name: 'PCI-DSS Zero-Trust Card Tokenization',
          desc: 'High-speed card PAN tokenization utilizing FIPS 140-2 Level 3 cryptographic hardware.',
          stories: [
            { title: 'As a customer, I want my credit card encrypted securely so that raw PAN is never stored', criteria: 'AES-256 GCM tokenization' }
          ]
        },
        {
          name: 'Double-Entry Financial Accounting Ledger',
          desc: 'Immutable double-entry ledger ensuring debit and credit balance equality at all times.',
          stories: [
            { title: 'As a treasury auditor, I want strict ledger balancing so that financial reconciliation is 100% accurate', criteria: 'Debit = Credit check constraint' }
          ]
        }
      ],
      tasks: [
        { key: 'FPO-401', title: 'Implement ISO 20022 PACS.008 credit transfer message parser', desc: 'Support XML and JSON representations with automated schema validation.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'FPO-402', title: 'Deploy Kafka 3.6 event stream cluster with 3 broker replicas', desc: 'Create partitioned topics for transaction-events, fraud-alerts, and settlement.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.HIGH, points: 5, sprintIdx: 0, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id] },
        { key: 'FPO-403', title: 'Build FIPS 140-2 AES-256 GCM card tokenization microservice', desc: 'Generate single-use payment tokens with sub-50ms cryptographic turnaround.', type: TaskType.TASK, status: TaskStatus.DONE, priority: TaskPriority.CRITICAL, points: 8, sprintIdx: 0, assigneeId: USER_IDS.SECURITY_LEAD, labelIds: [labelSecurity.id] },
        { key: 'FPO-404', title: 'Implement dynamic circuit breaker routing for Stripe and Adyen', desc: 'Automatically failover traffic on HTTP 503 or latency spikes exceeding 1,500ms.', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.URGENT, points: 8, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id], subtasks: ['Track error rate sliding window', 'Trip circuit on 5% error threshold', 'Route to secondary gateway'] },
        { key: 'FPO-405', title: 'Implement double-entry financial ledger schema and ACID balance validator', desc: 'Enforce database check constraint: SUM(debit) MUST equal SUM(credit).', type: TaskType.TASK, status: TaskStatus.IN_PROGRESS, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.OWNER, labelIds: [labelBackend.id] },
        { key: 'FPO-406', title: 'Build 3D Secure 2.2 frictionless authentication challenge flow', desc: 'Support biometric frictionless evaluation and fallback challenge iframe modal.', type: TaskType.STORY, status: TaskStatus.IN_REVIEW, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id, labelSecurity.id] },
        { key: 'FPO-407', title: 'Conduct automated PCI-DSS Level 1 compliance security scan', desc: 'Verify zero plaintext cardholder data (PAN) in logs, cache, or database columns.', type: TaskType.TASK, status: TaskStatus.TESTING, priority: TaskPriority.CRITICAL, points: 5, sprintIdx: 1, assigneeId: USER_IDS.SECURITY_LEAD, labelIds: [labelSecurity.id] },
        { key: 'FPO-408', title: 'Resolve idempotency key race condition under 5,000 req/sec stress test', desc: 'Fix Redis distributed redlock acquisition timing on duplicate payment submissions.', type: TaskType.BUG, status: TaskStatus.BLOCKED, priority: TaskPriority.CRITICAL, points: 8, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'FPO-409', title: 'Implement automated bank settlement file ingestion (ACH & SWIFT)', desc: 'Parse daily MT940 and CAMT.053 settlement records with variance highlighting.', type: TaskType.TASK, status: TaskStatus.TODO, priority: TaskPriority.HIGH, points: 5, sprintIdx: 1, assigneeId: USER_IDS.BACKEND_DEV, labelIds: [labelBackend.id] },
        { key: 'FPO-410', title: 'Build treasury reconciliation dashboard with variance audit logs', desc: 'Provide financial analysts with side-by-side transaction vs settlement comparison.', type: TaskType.STORY, status: TaskStatus.TODO, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 1, assigneeId: USER_IDS.FRONTEND_DEV, labelIds: [labelFrontend.id] },
        { key: 'FPO-411', title: 'Configure Kafka consumer lag monitoring and Prometheus alerts', desc: 'Trigger alert when consumer group lag exceeds 10,000 unread messages.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.MEDIUM, points: 5, sprintIdx: 2, assigneeId: USER_IDS.DEVOPS_ENGINEER, labelIds: [labelDevOps.id] },
        { key: 'FPO-412', title: 'Implement fraud scoring engine with real-time velocity rules', desc: 'Evaluate card velocity, geolocation distance, and risk score prior to auth request.', type: TaskType.TASK, status: TaskStatus.BACKLOG, priority: TaskPriority.HIGH, points: 8, sprintIdx: 2, assigneeId: USER_IDS.SECURITY_LEAD, labelIds: [labelSecurity.id] }
      ]
    }
  };

  for (const [projectId, def] of Object.entries(projectDefinitions)) {
    // 1. Create Product
    const product = await prisma.product.upsert({
      where: { id: `product-${projectId}` },
      update: { name: def.productName, vision: def.productDesc },
      create: {
        id: `product-${projectId}`,
        projectId,
        name: def.productName,
        vision: def.productDesc
      }
    });

    // 2. Create Features, Requirements & User Stories
    for (let fIdx = 0; fIdx < def.features.length; fIdx++) {
      const feat = def.features[fIdx];
      const feature = await prisma.feature.upsert({
        where: { id: `feat-${projectId}-${fIdx}` },
        update: { title: feat.name, description: feat.desc },
        create: {
          id: `feat-${projectId}-${fIdx}`,
          projectId,
          productId: product.id,
          title: feat.name,
          description: feat.desc,
          status: FeatureStatus.IN_DEVELOPMENT,
          priority: 'HIGH'
        }
      });

      for (let sIdx = 0; sIdx < feat.stories.length; sIdx++) {
        const story = feat.stories[sIdx];
        await prisma.userStory.upsert({
          where: { id: `story-${projectId}-${fIdx}-${sIdx}` },
          update: { title: story.title, acceptanceCriteria: story.criteria },
          create: {
            id: `story-${projectId}-${fIdx}-${sIdx}`,
            projectId,
            featureId: feature.id,
            title: story.title,
            asA: 'software engineer',
            iWant: story.title,
            soThat: story.criteria,
            acceptanceCriteria: story.criteria,
            priority: 'HIGH'
          }
        });
      }
    }

    // 3. Upsert Tasks
    const projectSprints = sprintsMap[projectId] || [];

    for (const t of def.tasks) {
      const sprint = projectSprints[t.sprintIdx] || projectSprints[0];

      let task = await prisma.task.findFirst({
        where: { projectId, taskIdentifier: t.key }
      });

      if (!task) {
        task = await prisma.task.create({
          data: {
            projectId,
            sprintId: sprint ? sprint.id : undefined,
            taskIdentifier: t.key,
            title: t.title,
            description: t.desc,
            taskType: t.type,
            status: t.status,
            priority: t.priority,
            storyPoints: t.points,
            estimatedHours: t.points * 4,
            actualHours: t.status === TaskStatus.DONE ? t.points * 4 : Math.floor(t.points * 2),
            assigneeId: t.assigneeId,
            reporterId: USER_IDS.OWNER,
            startDate: new Date('2026-01-20'),
            dueDate: new Date('2026-02-15')
          }
        });
      } else {
        task = await prisma.task.update({
          where: { id: task.id },
          data: {
            sprintId: sprint ? sprint.id : undefined,
            title: t.title,
            description: t.desc,
            taskType: t.type,
            status: t.status,
            priority: t.priority,
            storyPoints: t.points,
            assigneeId: t.assigneeId
          }
        });
      }

      // Link task labels
      for (const labelId of t.labelIds) {
        await prisma.taskLabelAssignment.upsert({
          where: {
            taskId_labelId: {
              taskId: task.id,
              labelId
            }
          },
          update: {},
          create: {
            taskId: task.id,
            labelId
          }
        });
      }

      // Seed subtasks if specified
      if (t.subtasks && t.subtasks.length > 0) {
        for (let subIdx = 0; subIdx < t.subtasks.length; subIdx++) {
          const subTitle = t.subtasks[subIdx];
          const subKey = `${t.key}-${subIdx + 1}`;

          const existingSub = await prisma.task.findFirst({
            where: { projectId, taskIdentifier: subKey }
          });

          if (!existingSub) {
            await prisma.task.create({
              data: {
                projectId,
                parentTaskId: task.id,
                sprintId: sprint ? sprint.id : undefined,
                taskIdentifier: subKey,
                title: subTitle,
                description: `Subtask under ${t.key}: ${t.title}`,
                taskType: TaskType.TASK,
                status: t.status === TaskStatus.DONE ? TaskStatus.DONE : TaskStatus.IN_PROGRESS,
                priority: t.priority,
                storyPoints: 2,
                assigneeId: t.assigneeId,
                reporterId: USER_IDS.OWNER
              }
            });
          }
        }
      }
    }
  }

  console.log('✓ Seeded complete task trees, epics, features, user stories, and subtasks for all 4 projects.');
}
