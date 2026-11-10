import { PrismaClient, BugSeverity, BugStatus } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedBugs(prisma: PrismaClient) {
  console.log('Seeding domain-specific bugs & QA defects for all 4 projects...');

  const bugsPerProject: Record<string, Array<{
    key: string;
    title: string;
    desc: string;
    severity: BugSeverity;
    status: BugStatus;
    steps: string;
    expected: string;
    actual: string;
    env: string;
    assigneeId: string;
  }>> = {
    [PROJECT_IDS.SCRATCHPAD]: [
      {
        key: 'BSP-BUG-01',
        title: 'Authentication redirect loop when JWT refresh cookie expires',
        desc: 'Browser enters infinite redirect loop between /login and /dashboard when the refresh token cookie has expired.',
        severity: BugSeverity.HIGH,
        status: BugStatus.FIXING,
        steps: '1. Log in to dashboard\n2. Manually clear devblueprint_token in localStorage\n3. Wait for refresh cookie expiration\n4. Trigger page reload',
        expected: 'User is cleanly redirected to /login with session expired toast alert',
        actual: 'Repeated 401 redirect loop in browser history',
        env: 'Local Dev & Vercel Preview',
        assigneeId: USER_IDS.FRONTEND_DEV
      },
      {
        key: 'BSP-BUG-02',
        title: 'Resizable panel handle jumps 40px on initial touch dragging on tablet',
        desc: 'Touch pointer events register offset from parent viewport instead of container bounding rect.',
        severity: BugSeverity.MEDIUM,
        status: BugStatus.OPEN,
        steps: '1. Open workspace on iPad Safari\n2. Touch drag sidebar resize handle',
        expected: 'Smooth tracking following finger touch coordinates',
        actual: 'Panel jumps 40px rightward on touchstart',
        env: 'iPadOS Safari 17.4',
        assigneeId: USER_IDS.FRONTEND_DEV
      },
      {
        key: 'BSP-BUG-03',
        title: 'Form validation error tooltip clipped inside overflow-hidden card',
        desc: 'Zod validation error popover is cut off by the parent card overflow container.',
        severity: BugSeverity.LOW,
        status: BugStatus.RESOLVED,
        steps: '1. Open create project dialog\n2. Submit empty name input',
        expected: 'Floating tooltip rendered via Portal outside container bounds',
        actual: 'Error text truncated and scrollbar appears inside dialog',
        env: 'Production Web App',
        assigneeId: USER_IDS.FRONTEND_DEV
      }
    ],
    [PROJECT_IDS.MICROSERVICE]: [
      {
        key: 'MMP-BUG-01',
        title: 'RabbitMQ unacknowledged message buildup on consumer worker panic',
        desc: 'When Order Service encounters an unhandled JSON parse error, messages remain unacked in the queue, stalling processing.',
        severity: BugSeverity.CRITICAL,
        status: BugStatus.INVESTIGATING,
        steps: '1. Publish malformed JSON to order-events exchange\n2. Observe rabbitmqadmin list queues output',
        expected: 'Message rejected with dead-letter exchange routing to order-events.dlx',
        actual: 'Queue accumulates unacknowledged messages indefinitely',
        env: 'Staging Kubernetes Cluster',
        assigneeId: USER_IDS.BACKEND_DEV
      },
      {
        key: 'MMP-BUG-02',
        title: 'API Gateway 504 Gateway Timeout during service mesh rolling restarts',
        desc: 'Reverse proxy attempts sending requests to terminating pod IPs before DNS cache invalidates.',
        severity: BugSeverity.HIGH,
        status: BugStatus.FIXING,
        steps: '1. Execute kubectl rollout restart deployment/user-service\n2. Run concurrent k6 traffic test to /api/v1/users',
        expected: 'Zero dropped requests with graceful pod termination preStop hooks',
        actual: '0.4% HTTP 504 Gateway Timeout errors observed over 30 seconds',
        env: 'AWS EKS Staging us-east-1',
        assigneeId: USER_IDS.DEVOPS_ENGINEER
      },
      {
        key: 'MMP-BUG-03',
        title: 'Duplicate event processing on network partition reconnect',
        desc: 'When RabbitMQ reconnects after a 10s network flap, in-flight messages are redelivered without idempotency suppression.',
        severity: BugSeverity.HIGH,
        status: BugStatus.VERIFYING,
        steps: '1. Simulate network drop via iptables\n2. Restore network while consumer is processing',
        expected: 'Redis idempotency key suppresses duplicate database insert',
        actual: 'Duplicate inventory decrement logged in database',
        env: 'Docker Compose Local Mesh',
        assigneeId: USER_IDS.BACKEND_DEV
      }
    ],
    [PROJECT_IDS.AUTOMATION]: [
      {
        key: 'AEP-BUG-01',
        title: 'BullMQ worker stalls and loses lock during 60s external HTTP webhooks',
        desc: 'Long-running third-party synchronization tasks exceed the default lockDuration, causing BullMQ to reschedule duplicate jobs.',
        severity: BugSeverity.CRITICAL,
        status: BugStatus.INVESTIGATING,
        steps: '1. Enqueue job with simulated 65s external API latency\n2. Monitor bullmq worker log output',
        expected: 'Worker automatically extends lock every 15s via renewLock()',
        actual: 'Job marked stalled and second worker begins executing in parallel',
        env: 'Staging BullMQ Cluster',
        assigneeId: USER_IDS.BACKEND_DEV
      },
      {
        key: 'AEP-BUG-02',
        title: 'Approval notification email template drops custom JSON payload parameters',
        desc: 'Handlebars compiler throws undefined reference when payload contains nested array properties.',
        severity: BugSeverity.MEDIUM,
        status: BugStatus.FIXING,
        steps: '1. Trigger workflow with payload { items: [{ name: "item1" }] }\n2. Inspect rendered approval email HTML',
        expected: 'All line items rendered cleanly in email table',
        actual: 'Email body renders empty brackets and error logged',
        env: 'Staging Environment',
        assigneeId: USER_IDS.EDITOR
      },
      {
        key: 'AEP-BUG-03',
        title: 'Workflow DAG cycle detection fails on self-referential dynamic conditional nodes',
        desc: 'When a conditional node references its own output key as fallback, execution enters an infinite processing loop.',
        severity: BugSeverity.HIGH,
        status: BugStatus.RESOLVED,
        steps: '1. Create workflow with Node A -> Node A condition\n2. Submit execution request',
        expected: '400 Bad Request with "Cyclic dependency detected at Node A"',
        actual: 'Infinite execution loop until memory limit exceeded',
        env: 'Production Workflow Engine',
        assigneeId: USER_IDS.BACKEND_DEV
      }
    ],
    [PROJECT_IDS.FINTECH]: [
      {
        key: 'FPO-BUG-01',
        title: 'Idempotency key race condition under 5,000 req/sec stress test',
        desc: 'Duplicate charge requests with identical idempotency keys submitted within 5ms both pass before Redis write completes.',
        severity: BugSeverity.CRITICAL,
        status: BugStatus.INVESTIGATING,
        steps: '1. Send concurrent POST /payments with identical Idempotency-Key header\n2. Observe payment switch responses',
        expected: 'First request proceeds with HTTP 200; second request returns HTTP 409 Conflict',
        actual: 'Both requests hit external gateway and generate duplicate authorizations',
        env: 'Load Testing Kubernetes Cluster',
        assigneeId: USER_IDS.BACKEND_DEV
      },
      {
        key: 'FPO-BUG-02',
        title: 'Stripe gateway circuit breaker fails to trip on 503 Service Unavailable',
        desc: 'Health monitor was counting only network timeouts (ECONNRESET) instead of 5xx HTTP response statuses.',
        severity: BugSeverity.HIGH,
        status: BugStatus.RESOLVED,
        steps: '1. Configure mock Stripe endpoint with 100% HTTP 503 response\n2. Send 20 test payments',
        expected: 'Circuit breaker trips to OPEN after 5 failures and routes to Adyen',
        actual: 'All 20 requests fail against Stripe without failover',
        env: 'Staging Environment',
        assigneeId: USER_IDS.BACKEND_DEV
      },
      {
        key: 'FPO-BUG-03',
        title: 'Ledger transaction rounding variance on JPY/KRW zero-decimal currencies',
        desc: 'Floating point rounding division produces 0.01 currency unit imbalance on zero-decimal currency settlement files.',
        severity: BugSeverity.HIGH,
        status: BugStatus.VERIFYING,
        steps: '1. Execute payment in JPY currency\n2. Ingest bank settlement statement',
        expected: 'Ledger debits exactly match credits with zero decimal scaling',
        actual: 'Variance alert triggered with 0.01 fractional yen discrepancy',
        env: 'Staging Treasury Sandbox',
        assigneeId: USER_IDS.OWNER
      }
    ]
  };

  for (const [projectId, bugs] of Object.entries(bugsPerProject)) {
    for (const b of bugs) {
      const existing = await prisma.bug.findFirst({
        where: { projectId, bugIdentifier: b.key }
      });

      if (!existing) {
        await prisma.bug.create({
          data: {
            projectId,
            bugIdentifier: b.key,
            title: b.title,
            description: b.desc,
            severity: b.severity,
            status: b.status,
            priority: 'HIGH',
            environment: b.env,
            stepsToReproduce: b.steps,
            expectedResult: b.expected,
            actualResult: b.actual,
            reporterId: USER_IDS.QA_LEAD,
            assigneeId: b.assigneeId
          }
        });
      } else {
        await prisma.bug.update({
          where: { id: existing.id },
          data: {
            title: b.title,
            description: b.desc,
            severity: b.severity,
            status: b.status,
            environment: b.env,
            stepsToReproduce: b.steps,
            expectedResult: b.expected,
            actualResult: b.actual,
            assigneeId: b.assigneeId
          }
        });
      }
    }
  }

  console.log('✓ Seeded realistic domain-specific bugs for all 4 projects.');
}
