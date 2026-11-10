import { PrismaClient, RiskLevel, RiskStatus } from '@prisma/client';
import { PROJECT_IDS, USER_IDS } from './seed-config';

export async function seedRisks(prisma: PrismaClient) {
  console.log('Seeding 3x3 risk matrix and registers for all 4 projects...');

  const risksPerProject: Record<string, Array<{
    title: string;
    cat: string;
    prob: RiskLevel;
    impact: RiskLevel;
    severity: RiskLevel;
    mitigation: string;
    contingency: string;
    status: RiskStatus;
  }>> = {
    [PROJECT_IDS.SCRATCHPAD]: [
      {
        title: 'Next.js App Router server action payload size limit on large imports',
        cat: 'TECHNICAL',
        prob: RiskLevel.MEDIUM,
        impact: RiskLevel.HIGH,
        severity: RiskLevel.HIGH,
        mitigation: 'Implement streaming multipart file uploads directly to S3 pre-signed URLs.',
        contingency: 'Chunk larger blueprint uploads into 5MB client-side batches.',
        status: RiskStatus.MITIGATING
      },
      {
        title: 'Browser local storage quota exhaustion from offline document caching',
        cat: 'OPERATIONAL',
        prob: RiskLevel.LOW,
        impact: RiskLevel.MEDIUM,
        severity: RiskLevel.LOW,
        mitigation: 'Implement LRU eviction policy keeping maximum 10 recently accessed documents.',
        contingency: 'Fallback to indexedDB for persistent offline storage.',
        status: RiskStatus.IDENTIFIED
      },
      {
        title: 'Session hijacking vulnerability from non-HTTP-only authentication tokens',
        cat: 'SECURITY',
        prob: RiskLevel.LOW,
        impact: RiskLevel.CRITICAL,
        severity: RiskLevel.MEDIUM,
        mitigation: 'Enforce Secure, HttpOnly, SameSite=Strict cookie flags for all refresh tokens.',
        contingency: 'Immediate global session invalidation endpoint triggered on anomaly.',
        status: RiskStatus.MITIGATING
      }
    ],
    [PROJECT_IDS.MICROSERVICE]: [
      {
        title: 'RabbitMQ broker network split leading to message loss or duplication',
        cat: 'TECHNICAL',
        prob: RiskLevel.HIGH,
        impact: RiskLevel.HIGH,
        severity: RiskLevel.CRITICAL,
        mitigation: 'Configure quorum queues with Raft consensus and at-least-once consumer idempotency.',
        contingency: 'Manual dead-letter exchange reprocessing script and publisher ledger reconciliation.',
        status: RiskStatus.MITIGATING
      },
      {
        title: 'Service cascade failure from unthrottled inter-service synchronous calls',
        cat: 'TECHNICAL',
        prob: RiskLevel.MEDIUM,
        impact: RiskLevel.HIGH,
        severity: RiskLevel.HIGH,
        mitigation: 'Enforce Opossum circuit breakers and asynchronous event notifications.',
        contingency: 'Fast-fail gateway responses returning cached read-only representations.',
        status: RiskStatus.IDENTIFIED
      },
      {
        title: 'Cross-service database consistency drift during multi-service transactions',
        cat: 'OPERATIONAL',
        prob: RiskLevel.MEDIUM,
        impact: RiskLevel.MEDIUM,
        severity: RiskLevel.MEDIUM,
        mitigation: 'Implement Saga choreography with automated compensating transactions.',
        contingency: 'Automated nightly reconciliation cron job flagging orphaned state.',
        status: RiskStatus.MITIGATING
      }
    ],
    [PROJECT_IDS.AUTOMATION]: [
      {
        title: 'Infinite workflow execution recursion from cyclic dynamic conditional nodes',
        cat: 'TECHNICAL',
        prob: RiskLevel.MEDIUM,
        impact: RiskLevel.CRITICAL,
        severity: RiskLevel.CRITICAL,
        mitigation: 'Static topological sort validator on save + runtime hard ceiling of 100 iterations.',
        contingency: 'Automatic worker circuit break and alerts to workflow owner on loop detection.',
        status: RiskStatus.MITIGATING
      },
      {
        title: 'BullMQ Redis memory exhaustion under high-throughput job spikes',
        cat: 'OPERATIONAL',
        prob: RiskLevel.HIGH,
        impact: RiskLevel.MEDIUM,
        severity: RiskLevel.HIGH,
        mitigation: 'Auto-prune completed job logs after 24h and configure maxmemory volatile-lru.',
        contingency: 'Horizontal autoscaling of Redis read replicas and worker queue rate limits.',
        status: RiskStatus.MITIGATING
      },
      {
        title: 'Unauthorized workflow privilege escalation via script node evaluation',
        cat: 'SECURITY',
        prob: RiskLevel.LOW,
        impact: RiskLevel.CRITICAL,
        severity: RiskLevel.MEDIUM,
        mitigation: 'Execute dynamic expressions inside isolated V8 sandbox with zero OS/network access.',
        contingency: 'Immediate termination of sandbox process and security audit alert.',
        status: RiskStatus.IDENTIFIED
      }
    ],
    [PROJECT_IDS.FINTECH]: [
      {
        title: 'Payment gateway API rate limit or outage during peak commercial traffic',
        cat: 'TECHNICAL',
        prob: RiskLevel.HIGH,
        impact: RiskLevel.CRITICAL,
        severity: RiskLevel.CRITICAL,
        mitigation: 'Real-time multi-gateway dynamic failover switch between Stripe, Adyen, and Checkout.com.',
        contingency: 'Instant 100% traffic reroute to secondary payment rails within 200ms.',
        status: RiskStatus.MITIGATING
      },
      {
        title: 'PCI-DSS cardholder data scope breach from unmasked application logs',
        cat: 'REGULATORY',
        prob: RiskLevel.LOW,
        impact: RiskLevel.CRITICAL,
        severity: RiskLevel.CRITICAL,
        mitigation: 'Zero-trust HSM tokenization before request leaves network edge; regex scrubbing.',
        contingency: 'Immediate security disclosure, key rotation, and forensic memory snapshot.',
        status: RiskStatus.IDENTIFIED
      },
      {
        title: 'Financial ledger variance between recorded authorizations and bank settlement',
        cat: 'FINANCIAL',
        prob: RiskLevel.MEDIUM,
        impact: RiskLevel.HIGH,
        severity: RiskLevel.HIGH,
        mitigation: 'Automated daily CAMT.053 settlement file matching against double-entry ledger.',
        contingency: 'Automated treasury reconciliation hold flag on accounts with variance > $10.00.',
        status: RiskStatus.MITIGATING
      }
    ]
  };

  for (const [projectId, risks] of Object.entries(risksPerProject)) {
    for (const r of risks) {
      const existing = await prisma.risk.findFirst({
        where: { projectId, title: r.title }
      });

      if (!existing) {
        await prisma.risk.create({
          data: {
            projectId,
            title: r.title,
            description: r.title,
            category: r.cat,
            probability: r.prob,
            impact: r.impact,
            severity: r.severity,
            mitigationPlan: r.mitigation,
            contingencyPlan: r.contingency,
            status: r.status,
            riskOwnerId: USER_IDS.SECURITY_LEAD
          }
        });
      } else {
        await prisma.risk.update({
          where: { id: existing.id },
          data: {
            description: r.title,
            category: r.cat,
            probability: r.prob,
            impact: r.impact,
            severity: r.severity,
            mitigationPlan: r.mitigation,
            contingencyPlan: r.contingency,
            status: r.status
          }
        });
      }
    }
  }

  console.log('✓ Seeded 3x3 risk registers across all 4 projects.');
}
