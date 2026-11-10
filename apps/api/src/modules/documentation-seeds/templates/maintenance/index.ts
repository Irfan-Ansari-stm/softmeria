import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const maintenanceTemplates: SeedTemplateDoc[] = [
  {
    id: '12-monitoring',
    fileName: 'MONITORING.md',
    relativePath: 'docs/12-maintenance/MONITORING.md',
    title: 'Application Health & Uptime Monitoring',
    description: 'Prometheus metrics, health check probes, uptime alarms, and alerting thresholds.',
    categorySlug: '12-maintenance',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['monitoring', 'metrics', 'uptime'],
    version: '1.0.0',
    content: `# Application Health & Uptime Monitoring: [PROJECT_NAME]

---

## 1. Health Probe Specifications
- **Liveness Probe (\`/health\`):** Validates the Node.js process is responsive.
- **Readiness Probe (\`/api/v1/health\`):** Checks database and Redis connectivity before accepting live traffic.

## 2. Metric Thresholds & Alerting
- **P95 Latency > 300ms for 3m:** PagerDuty warning.
- **5xx Error Rate > 1% for 2m:** PagerDuty critical incident.
- **Database Connection Pool > 85% capacity:** Warning alert to DevOps lead.
`
  },
  {
    id: '12-logging-strategy',
    fileName: 'LOGGING-STRATEGY.md',
    relativePath: 'docs/12-maintenance/LOGGING-STRATEGY.md',
    title: 'Log Aggregation & Retention Policies',
    description: 'Centralized log shipping, log parsing, indexing, and compliance retention.',
    categorySlug: '12-maintenance',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['logging', 'retention', 'compliance'],
    version: '1.0.0',
    content: `# Log Aggregation & Retention Policies

- Production logs shipped to centralized logging platform (Elasticsearch / CloudWatch / Datadog).
- Retention policy: 30 days hot storage, 365 days cold archive for regulatory auditing.
`
  },
  {
    id: '12-incident-response',
    fileName: 'INCIDENT-RESPONSE.md',
    relativePath: 'docs/12-maintenance/INCIDENT-RESPONSE.md',
    title: 'Incident Response Playbook (SEV-1 to SEV-4)',
    description: 'Incident severity classification, commander roles, communication channels, and post-mortems.',
    categorySlug: '12-maintenance',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['incident', 'playbook', 'oncall'],
    version: '1.0.0',
    content: `# Incident Response Playbook

---

## 1. Severity Classifications
- **SEV-1 (Critical Outage):** Core service completely down or data loss. SLA: 15min triage, continuous war room.
- **SEV-2 (Major Degradation):** Key functionality impaired for subset of users. SLA: 30min triage.
- **SEV-3 (Minor Defect):** Workaround available; addressed within business hours.
- **SEV-4 (Cosmetic):** Handled in standard sprint planning.

---

## 2. Post-Mortem Guidelines
Every SEV-1 and SEV-2 requires a blameless post-mortem published within 48 hours detailing root cause, timeline, impact, and preventive action items.
`
  },
  {
    id: '12-troubleshooting',
    fileName: 'TROUBLESHOOTING.md',
    relativePath: 'docs/12-maintenance/TROUBLESHOOTING.md',
    title: 'Operational Troubleshooting Runbook',
    description: 'Diagnostic guides and recovery steps for common failure scenarios.',
    categorySlug: '12-maintenance',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['troubleshooting', 'runbook', 'operations'],
    version: '1.0.0',
    content: `# Operational Troubleshooting Runbook

## 1. Database Connection Exhaustion
- **Symptom:** API logs \`PrismaClientInitializationError: Timed out fetching a connection\`.
- **Mitigation:** Inspect active queries with \`SELECT * FROM pg_stat_activity;\` and kill stuck long-running queries; scale PgBouncer pool limits.

## 2. Memory Leak in Node.js Process
- **Symptom:** Container restarts with exit code 137 (OOM).
- **Mitigation:** Inspect heap dumps with Chrome DevTools or inspect large unbounded file upload buffers.
`
  },
  {
    id: '12-performance-monitoring',
    fileName: 'PERFORMANCE-MONITORING.md',
    relativePath: 'docs/12-maintenance/PERFORMANCE-MONITORING.md',
    title: 'Continuous Performance Monitoring & Profiling',
    description: 'APM tracing, slow query tracking, and memory profiling procedures.',
    categorySlug: '12-maintenance',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['performance', 'apm', 'profiling'],
    version: '1.0.0',
    content: `# Continuous Performance Monitoring & Profiling

- Distributed tracing with OpenTelemetry / Datadog APM tracking request waterfall across services and database queries.
- Slow queries exceeding 200ms logged automatically to alert channels.
`
  },
  {
    id: '12-technical-debt',
    fileName: 'TECHNICAL-DEBT.md',
    relativePath: 'docs/12-maintenance/TECHNICAL-DEBT.md',
    title: 'Technical Debt Registry & Remediation',
    description: 'Registry of acknowledged technical debt, architectural spikes, and deprecation timelines.',
    categorySlug: '12-maintenance',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['tech-debt', 'refactoring', 'roadmap'],
    version: '1.0.0',
    content: `# Technical Debt Registry & Remediation

| ID | Item Description | Impact | Target Remediation Sprint |
|---|---|---|---|
| **TD-01** | Replace local in-memory rate limiting with Redis cluster | Scalability across multi-region pods | Sprint 14 |
| **TD-02** | Upgrade to streaming Markdown parser for massive 100k+ word documents | Editor performance | Sprint 16 |
`
  }
];
