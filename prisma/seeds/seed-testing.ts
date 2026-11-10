import { PrismaClient, TestCaseStatus } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedTesting(prisma: PrismaClient) {
  console.log('Seeding QA test plans, suites, test cases & executions for all 4 projects...');

  const testingConfigs: Record<string, {
    planName: string;
    planDesc: string;
    suites: Array<{
      name: string;
      desc: string;
      cases: Array<{
        key: string;
        title: string;
        type: string;
        priority: string;
        status: TestCaseStatus;
        preconditions: string;
        steps: string;
        expected: string;
      }>;
    }>;
  }> = {
    [PROJECT_IDS.SCRATCHPAD]: {
      planName: 'Next.js Web App Master Test Plan',
      planDesc: 'Comprehensive functional, UI responsive, performance, and accessibility test verification.',
      suites: [
        {
          name: 'Core Application Shell & Resizing',
          desc: 'Verify desktop layout, panel resizing performance, and viewport responsiveness.',
          cases: [
            {
              key: 'BSP-TC-01',
              title: 'Verify smooth panel resizing with mouse drag and pointer capture',
              type: 'E2E',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'Desktop viewport 1440x900, logged in',
              steps: '1. Hover over sidebar resize handle\n2. Drag handle left 50px\n3. Release mouse pointer',
              expected: 'Sidebar width updates smoothly to 270px without layout shifts or text selection'
            },
            {
              key: 'BSP-TC-02',
              title: 'Verify dark mode toggle persistence across browser reloads',
              type: 'INTEGRATION',
              priority: 'MEDIUM',
              status: TestCaseStatus.PASSED,
              preconditions: 'Default light mode active',
              steps: '1. Click theme toggle button\n2. Verify dark class on html root\n3. Refresh browser window',
              expected: 'Dark mode remains active immediately without flash of unstyled content'
            }
          ]
        },
        {
          name: 'Authentication & Session Security',
          desc: 'Verify token expiration handling, RBAC route guards, and CSRF protection.',
          cases: [
            {
              key: 'BSP-TC-03',
              title: 'Verify silent token refresh on HTTP 401 Unauthorized API response',
              type: 'INTEGRATION',
              priority: 'CRITICAL',
              status: TestCaseStatus.PASSED,
              preconditions: 'Valid refresh cookie in browser, access token expired',
              steps: '1. Dispatch API request to /api/v1/projects\n2. Intercept 401 response\n3. Execute POST /auth/refresh',
              expected: 'New access token stored in localStorage and original request retried seamlessly'
            },
            {
              key: 'BSP-TC-04',
              title: 'Verify form input validation rejects XSS script injection payloads',
              type: 'SECURITY',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'User creation form open',
              steps: '1. Enter <script>alert(1)</script> in project name\n2. Submit form',
              expected: 'Input sanitization strips executable tags and displays invalid character alert'
            }
          ]
        }
      ]
    },
    [PROJECT_IDS.MICROSERVICE]: {
      planName: 'Distributed Microservice Mesh Test Plan',
      planDesc: 'End-to-end event flow, message queue delivery guarantees, and API gateway routing verification.',
      suites: [
        {
          name: 'RabbitMQ Message Broker & Delivery',
          desc: 'Test message durability, dead-letter routing, and consumer backoff retries.',
          cases: [
            {
              key: 'MMP-TC-01',
              title: 'Verify RabbitMQ dead-letter exchange (DLX) routing on persistent poison pill message',
              type: 'INTEGRATION',
              priority: 'CRITICAL',
              status: TestCaseStatus.FAILED,
              preconditions: 'Order service consumer running with maxRetries=3',
              steps: '1. Publish payload with unparseable binary structure\n2. Observe consumer nack count\n3. Inspect DLX queue',
              expected: 'Message moved to order-events.dlx queue after exactly 3 failed attempts'
            },
            {
              key: 'MMP-TC-02',
              title: 'Verify idempotency consumer suppresses duplicate event processing',
              type: 'INTEGRATION',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'OrderCreated event published once to exchange',
              steps: '1. Re-publish identical OrderCreated event with same event_id\n2. Assert inventory ledger',
              expected: 'Second event ignored by consumer; inventory decremented only once'
            }
          ]
        },
        {
          name: 'API Gateway & Rate Limiting',
          desc: 'Verify reverse proxy routing, JWT token introspection, and Redis rate limiters.',
          cases: [
            {
              key: 'MMP-TC-03',
              title: 'Verify API Gateway rate limiter returns HTTP 429 when threshold exceeded',
              type: 'PERFORMANCE',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'Client rate limit configured at 100 req/min',
              steps: '1. Send 105 rapid GET requests from same IP\n2. Inspect response headers on request 101',
              expected: 'HTTP 429 Too Many Requests returned with Retry-After header present'
            },
            {
              key: 'MMP-TC-04',
              title: 'Verify circuit breaker trips to OPEN state after 5 consecutive service timeouts',
              type: 'INTEGRATION',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'User service simulated with 100% 5000ms delay',
              steps: '1. Send 6 consecutive requests through gateway\n2. Verify fallback response',
              expected: 'Circuit breaker trips on request 5; request 6 immediately returns cached fallback without delay'
            }
          ]
        }
      ]
    },
    [PROJECT_IDS.AUTOMATION]: {
      planName: 'Enterprise Workflow Engine Test Plan',
      planDesc: 'Validation of DAG branch execution, BullMQ worker queue processing, and approval hierarchies.',
      suites: [
        {
          name: 'Workflow DAG Execution & Cycle Detection',
          desc: 'Test topological sorting, conditional evaluation, and step state transitions.',
          cases: [
            {
              key: 'AEP-TC-01',
              title: 'Verify Tarjan cycle detection rejects self-referential and cyclic DAG workflows',
              type: 'UNIT',
              priority: 'CRITICAL',
              status: TestCaseStatus.PASSED,
              preconditions: 'Workflow editor initialized',
              steps: '1. Construct cyclic graph A -> B -> C -> A\n2. Trigger workflow validation API',
              expected: 'Validation error returned: "Cyclic dependency detected: Node A -> Node B -> Node C -> Node A"'
            },
            {
              key: 'AEP-TC-02',
              title: 'Verify BullMQ worker job lock extension prevents duplicate job execution',
              type: 'INTEGRATION',
              priority: 'CRITICAL',
              status: TestCaseStatus.BLOCKED,
              preconditions: 'Task configured with 70s external sync step',
              steps: '1. Enqueue job to workflow-jobs queue\n2. Monitor active worker count in Redis',
              expected: 'Worker renews lock every 15s; no secondary worker attempts to pick up job'
            }
          ]
        },
        {
          name: 'Approval Gates & Audit Trails',
          desc: 'Verify human-in-the-loop signoff mechanisms, timeout escalation, and cryptographic logs.',
          cases: [
            {
              key: 'AEP-TC-03',
              title: 'Verify human approval task halts execution until manager signoff received',
              type: 'E2E',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'Workflow with Approval Node triggered',
              steps: '1. Execute workflow up to approval gate\n2. Verify state is WAITING_APPROVAL\n3. Submit approve action',
              expected: 'Workflow state transitions to RUNNING and downstream tasks resume execution'
            },
            {
              key: 'AEP-TC-04',
              title: 'Verify SHA-256 hash chain integrity in audit event log table',
              type: 'SECURITY',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: 'Workflow execution completed with 5 steps',
              steps: '1. Query audit_events table\n2. Compute hash of current event + previous_hash\n3. Compare computed vs stored',
              expected: 'All 5 events match cryptographic hash chain without tampering'
            }
          ]
        }
      ]
    },
    [PROJECT_IDS.FINTECH]: {
      planName: 'FinTech Switch & Compliance QA Test Plan',
      planDesc: 'PCI-DSS Level 1 security verification, dynamic gateway failover, and double-entry ledger balancing.',
      suites: [
        {
          name: 'Payment Ingestion & Gateway Fallback',
          desc: 'Verify multi-gateway resilience, circuit breaker switching, and sub-second authorization.',
          cases: [
            {
              key: 'FPO-TC-01',
              title: 'Verify automatic failover from Stripe to Adyen on HTTP 503 gateway outage',
              type: 'INTEGRATION',
              priority: 'CRITICAL',
              status: TestCaseStatus.PASSED,
              preconditions: 'Primary gateway (Stripe) simulated down with 503 responses',
              steps: '1. Send payment request to /api/v1/payments\n2. Assert circuit breaker state\n3. Verify response rail',
              expected: 'Payment completes successfully via Adyen secondary gateway; merchant sees zero downtime'
            },
            {
              key: 'FPO-TC-02',
              title: 'Verify distributed idempotency key prevents duplicate charges under high concurrency',
              type: 'INTEGRATION',
              priority: 'CRITICAL',
              status: TestCaseStatus.FAILED,
              preconditions: 'Concurrent k6 load script configured with duplicate keys',
              steps: '1. Send 10 identical charge requests within 5ms\n2. Check external gateway ledger',
              expected: 'Exactly 1 authorization created; remaining 9 requests return cached transaction payload'
            }
          ]
        },
        {
          name: 'Zero-Trust Tokenization & Ledger Integrity',
          desc: 'Verify PAN data exclusion, cryptographic tokenization, and debit/credit ledger equality.',
          cases: [
            {
              key: 'FPO-TC-03',
              title: 'Verify zero plaintext credit card PAN numbers stored in database or application logs',
              type: 'SECURITY',
              priority: 'CRITICAL',
              status: TestCaseStatus.PASSED,
              preconditions: '1,000 credit card payments executed through switch',
              steps: '1. Perform grep regex search across all log files\n2. Run SQL query on transactions table',
              expected: 'Zero matches for Luhn-valid card numbers; all card data stored as vault tokens'
            },
            {
              key: 'FPO-TC-04',
              title: 'Verify double-entry ledger database constraint: SUM(debit) MUST equal SUM(credit)',
              type: 'INTEGRATION',
              priority: 'HIGH',
              status: TestCaseStatus.PASSED,
              preconditions: '50 settlement entries posted to general ledger',
              steps: '1. Execute balance query: SELECT SUM(amount) FROM ledger_entries WHERE type="DEBIT"\n2. Compare with CREDIT',
              expected: 'Net variance equals exactly 0.00 currency units across all accounts'
            }
          ]
        }
      ]
    }
  };

  for (const [projectId, cfg] of Object.entries(testingConfigs)) {
    // 1. Create Test Plan
    const testPlan = await prisma.testPlan.upsert({
      where: { id: `testplan-${projectId}` },
      update: { name: cfg.planName, description: cfg.planDesc },
      create: {
        id: `testplan-${projectId}`,
        projectId,
        name: cfg.planName,
        description: cfg.planDesc,
        status: 'ACTIVE'
      }
    });

    // 2. Create Test Suites & Cases
    for (let sIdx = 0; sIdx < cfg.suites.length; sIdx++) {
      const suiteDef = cfg.suites[sIdx];
      const suite = await prisma.testSuite.upsert({
        where: { id: `suite-${projectId}-${sIdx}` },
        update: { name: suiteDef.name, description: suiteDef.desc },
        create: {
          id: `suite-${projectId}-${sIdx}`,
          testPlanId: testPlan.id,
          name: suiteDef.name,
          description: suiteDef.desc
        }
      });

      for (const tc of suiteDef.cases) {
        const testCase = await prisma.testCase.upsert({
          where: { id: `tc-${projectId}-${tc.key}` },
          update: {
            title: tc.title,
            priority: 'HIGH',
            status: tc.status,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expectedResult: tc.expected
          },
          create: {
            id: `tc-${projectId}-${tc.key}`,
            testSuiteId: suite.id,
            caseIdentifier: tc.key,
            title: tc.title,
            priority: 'HIGH',
            status: tc.status,
            preconditions: tc.preconditions,
            steps: tc.steps,
            expectedResult: tc.expected,
            assignedTesterId: USER_IDS.QA_LEAD
          }
        });

        // Add execution record
        await prisma.testExecution.create({
          data: {
            testPlanId: testPlan.id,
            passedCount: tc.status === TestCaseStatus.PASSED ? 1 : 0,
            failedCount: tc.status === TestCaseStatus.FAILED ? 1 : 0,
            blockedCount: tc.status === TestCaseStatus.BLOCKED ? 1 : 0,
            executedById: USER_IDS.QA_LEAD,
            notes: `Automated test runner execution for ${tc.key} at ${new Date().toISOString()}`
          }
        });
      }
    }
  }

  console.log('✓ Seeded complete test plans, suites, test cases and execution runs for all 4 projects.');
}
