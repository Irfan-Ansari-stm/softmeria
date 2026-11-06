import {
  PrismaClient,
  UserRole,
  ProjectVisibility,
  ProjectStatus,
  DocumentStatus,
  ReviewStatus,
  ActivityAction
} from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BUILTIN_TEMPLATES } from '../packages/shared/src';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DevBlueprint database with Flagship Enterprise Project...');

  // 1. Clean existing data in reverse relational order
  await prisma.activityLog.deleteMany();
  await prisma.documentTag.deleteMany();
  await prisma.tag.deleteMany();
  await prisma.reviewApproval.deleteMany();
  await prisma.reviewRequest.deleteMany();
  await prisma.comment.deleteMany();
  await prisma.documentVersion.deleteMany();
  await prisma.document.deleteMany();
  await prisma.category.deleteMany();
  await prisma.projectMember.deleteMany();
  await prisma.project.deleteMany();
  await prisma.workspaceMember.deleteMany();
  await prisma.workspaceSetting.deleteMany();
  await prisma.template.deleteMany();
  await prisma.session.deleteMany();
  await prisma.workspace.deleteMany();
  await prisma.user.deleteMany();

  const passwordHash = await bcrypt.hash('Password123!', 10);

  // 2. Create Users
  const owner = await prisma.user.create({
    data: {
      name: 'Sarah Connor (Architect)',
      email: 'owner@devblueprint.io',
      passwordHash,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150'
    }
  });

  const admin = await prisma.user.create({
    data: {
      name: 'Alex Rivera (DevOps Lead)',
      email: 'admin@devblueprint.io',
      passwordHash,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
    }
  });

  const editor = await prisma.user.create({
    data: {
      name: 'Elena Rostova (Full-Stack Dev)',
      email: 'editor@devblueprint.io',
      passwordHash,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
    }
  });

  const viewer = await prisma.user.create({
    data: {
      name: 'Marcus Vance (Stakeholder)',
      email: 'viewer@devblueprint.io',
      passwordHash,
      isEmailVerified: true,
      avatarUrl: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150'
    }
  });

  console.log('Created enterprise team: owner, admin, editor, viewer');

  // 3. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Cloud Engineering',
      slug: 'acme-cloud-engineering',
      ownerId: owner.id,
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme',
      settings: {
        create: {
          themePreference: 'light',
          notifyOnComment: true,
          notifyOnReview: true
        }
      }
    }
  });

  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: owner.id, role: UserRole.OWNER },
      { workspaceId: workspace.id, userId: admin.id, role: UserRole.ADMIN },
      { workspaceId: workspace.id, userId: editor.id, role: UserRole.EDITOR },
      { workspaceId: workspace.id, userId: viewer.id, role: UserRole.VIEWER }
    ]
  });

  // 4. Create Builtin Templates
  for (const t of BUILTIN_TEMPLATES) {
    await prisma.template.create({
      data: {
        title: t.title,
        slug: t.slug,
        category: t.category,
        description: t.description,
        purpose: t.purpose,
        recommendedSections: JSON.stringify(t.recommendedSections),
        content: t.content,
        isBuiltin: true,
        workspaceId: workspace.id,
        createdById: owner.id
      }
    });
  }

  // 5. Create Tags
  const archTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'Architecture', color: '#6366f1' }
  });
  const securityTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'PCI-DSS', color: '#ef4444' }
  });
  const isoTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'ISO20022', color: '#06b6d4' }
  });
  const kafkaTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'Kafka', color: '#f59e0b' }
  });
  const ledgerTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'Ledger', color: '#10b981' }
  });

  // 6. Create Exactly ONE Flagship Enterprise Project: FinTech Payment Orchestrator
  const project = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'FinTech Payment Orchestrator',
      slug: 'fintech-payment-orchestrator',
      description: 'Distributed payment gateway router with ISO20022 compliance and fraud scoring.',
      projectType: 'Microservices',
      category: 'Financial Engineering',
      techStack: JSON.stringify(['Node.js', 'Go', 'Kafka', 'PostgreSQL', 'Redis', 'Docker']),
      repositoryUrl: 'https://github.com/acme/payment-orchestrator',
      icon: 'credit-card',
      color: '#10b981',
      visibility: ProjectVisibility.PRIVATE,
      status: ProjectStatus.ACTIVE,
      createdById: admin.id
    }
  });

  await prisma.projectMember.createMany({
    data: [
      { projectId: project.id, userId: owner.id, role: UserRole.OWNER },
      { projectId: project.id, userId: admin.id, role: UserRole.ADMIN },
      { projectId: project.id, userId: editor.id, role: UserRole.EDITOR },
      { projectId: project.id, userId: viewer.id, role: UserRole.VIEWER }
    ]
  });

  // 7. Define Exact 7 Categories and 17 Markdown Documents
  const categoriesDefinition = [
    {
      name: '01. Product & Regulatory Blueprint',
      slug: '01-product-regulatory',
      description: 'High-level business specifications, compliance obligations, and role permissions.',
      sortOrder: 1,
      documents: [
        {
          title: 'Product Overview & Payment Topology',
          fileName: 'PRODUCT_OVERVIEW.md',
          slug: 'product-overview',
          description: 'High-level payment router topology, multi-acquirer fallback, and cost optimization rules.',
          status: DocumentStatus.COMPLETED,
          isOptional: false,
          tags: [archTag, isoTag],
          content: `# Product Overview & Payment Orchestration Topology

## 1. Executive Summary
The **FinTech Payment Orchestrator** is an enterprise-grade multi-acquirer routing platform that dynamically dispatches card authorizations, SEPA instant transfers, and cross-border remittances across 12 tier-1 global banking partners.

## 2. Core Architectural Objectives
- **Sub-50ms Routing Decisions:** Dynamic lowest-cost routing (LCR) engine evaluating interchange plus fees in real-time.
- **High Throughput Capacity:** Designed for 10,000 transactions per second (TPS) peak capacity with horizontal scaling.
- **Zero-Loss Idempotency:** Cryptographic client idempotency keys enforce exactly-once execution.
- **Regulatory Strictness:** Built-in PCI-DSS Level 1 compliance and ISO20022 pacs.008 message validation.

## 3. High-Level System Architecture
\`\`\`text
[ Client Checkout ]
        │ (TLS 1.3 mTLS)
        ▼
[ API Gateway (Go) ] ────► [ Fraud Scoring (Redis + ML) ]
        │
        ▼
[ Payment Orchestrator ] ───► [ Acquirer Engine: Stripe / Adyen / Chase ]
        │
        ▼
[ Kafka Event Log ] ────► [ Immutable Double-Entry Ledger (Postgres) ]
\`\`\`
`
        },
        {
          title: 'Regulatory & Compliance Blueprint',
          fileName: 'REGULATORY_REQUIREMENTS.md',
          slug: 'regulatory-requirements',
          description: 'Regulatory mandates including PSD2 Strong Customer Authentication (SCA) and ISO20022.',
          status: DocumentStatus.COMPLETED,
          isOptional: false,
          tags: [securityTag, isoTag],
          content: `# Regulatory & Compliance Blueprint

## 1. Regulatory Scope
This service operates under financial licensing in the EU (EBA), United Kingdom (FCA), and United States (FinCEN).

## 2. PSD2 & 3D-Secure 2.2 Protocols
- **Frictionless Flow:** Automatic 3DS exemption requests for low-value payments (< €30) and recurring subscriptions.
- **Challenge Flow:** Dynamic step-up authentication when fraud risk score exceeds 45/100.
- **Liability Shift:** All card transactions verified with 3DS shift fraud chargeback liability to the issuing institution.

## 3. ISO20022 Financial Messaging Matrix
| Message Definition | Semantic Purpose | Processing SLA |
| :--- | :--- | :--- |
| \`pain.001.001.09\` | Customer Credit Transfer Initiation | < 100ms |
| \`pacs.008.001.08\` | Interbank Financial Institution Credit Transfer | < 250ms |
| \`pacs.002.001.10\` | Real-time Payment Status Report | Instant |
| \`camt.053.001.08\` | End-of-Day Bank Statement Reconciliation | Daily 02:00 UTC |
`
        },
        {
          title: 'User Roles & Access Control Model',
          fileName: 'USER_ROLES_PERMISSIONS.md',
          slug: 'user-roles-permissions',
          description: 'Role-Based Access Control (RBAC) matrix defining permissions across operators and merchants.',
          status: DocumentStatus.COMPLETED,
          isOptional: false,
          tags: [securityTag],
          content: `# User Roles & Access Control Model

## 1. Access Hierarchy
The orchestrator enforces strict segregation of duties (SoD) following the principle of least privilege (PoLP).

### Roles Matrix
- **Platform Owner:** Master workspace administrative controls, billing, and organizational policies.
- **Security Officer:** HSM key ceremonies, audit log inspections, and compliance certifications.
- **DevOps Engineer:** Kubernetes manifests, Kafka partitions, and deployment pipelines.
- **Financial Controller:** Daily bank reconciliations, ledger balance adjustments, and dispute sign-offs.
- **Merchant Viewer:** Read-only access to merchant analytics and transaction status.

## 2. Dual-Control Authorizations
All balance adjustments exceeding $10,000 require four-eyes sign-off (initiated by Financial Controller, approved by Platform Owner).
`
        }
      ]
    },
    {
      name: '02. Security & Tokenization Architecture',
      slug: '02-security-tokenization',
      description: 'PCI-DSS Cardholder Data Environment isolation, token vaulting, and cryptographic ceremonies.',
      sortOrder: 2,
      documents: [
        {
          title: 'Zero-PAN Tokenization Vault Architecture',
          fileName: 'PCI_DSS_TOKENIZATION_VAULT.md',
          slug: 'pci-dss-tokenization-vault',
          description: 'Isolated Cardholder Data Environment (CDE) with format-preserving AES-256 encryption.',
          status: DocumentStatus.APPROVED,
          isOptional: false,
          tags: [securityTag],
          content: `# Zero-PAN Tokenization Vault Architecture

## 1. Zero-PAN Principle
The main application cluster and microservices **NEVER** receive or store raw Primary Account Numbers (PANs). All browser checkouts tokenize client-side directly against our physically isolated Token Vault.

## 2. Vault Security Boundary
\`\`\`text
Browser Checkout ────(Raw PAN)────► [ Token Vault Cluster ] (Isolated CDE VPC)
                                           │
                                     (Stores AES-256)
                                           │
Browser Checkout ◄──(uuid token)───────────┘
       │
 (uuid token only)
       ▼
[ Application Cluster ]
\`\`\`

## 3. Cryptographic Implementation
- **Algorithm:** AES-256-GCM Format-Preserving Encryption (FPE BPS mode).
- **Key Storage:** Thales Luna PCIe Hardware Security Module (FIPS 140-2 Level 3).
- **Token Format:** Cryptographically secure 128-bit UUID v4 with preserved BIN (first 6 digits) and last 4 digits.
`
        },
        {
          title: 'HSM Cryptographic Key Ceremony Protocols',
          fileName: 'HSM_KEY_CEREMONY_PROTOCOLS.md',
          slug: 'hsm-key-ceremony-protocols',
          description: 'Split-knowledge, dual-control procedures for Zone Master Keys and DUKPT derivations.',
          status: DocumentStatus.APPROVED,
          isOptional: false,
          tags: [securityTag],
          content: `# HSM Cryptographic Key Ceremony Protocols

## 1. Key Ceremony Objectives
Establish and rotate the Zone Master Key (ZMK) and Terminal Base Derivation Keys (BDK) using Shamir Secret Sharing.

## 2. Quorum Requirements
- **Custodian Quorum:** 3 of 5 authorized key custodians must be physically present.
- **Smart Cards:** Keys are split across 5 cryptographic smart cards requiring individual PIN codes.
- **Witnesses:** Independent external PCI Qualified Security Assessor (QSA) must observe all ceremonies.

## 3. Rotation Schedule
- **Zone Master Key (ZMK):** Annually or immediately upon suspected custodian compromise.
- **Data Encryption Keys (DEK):** Automated 90-day rotation managed via KMS envelope encryption.
`
        }
      ]
    },
    {
      name: '03. Microservices & API Architecture',
      slug: '03-microservices-api',
      description: 'Distributed microservices decomposition, REST/gRPC interfaces, and transaction state machine.',
      sortOrder: 3,
      documents: [
        {
          title: 'Distributed Microservices Topology',
          fileName: 'MICROSERVICES_TOPOLOGY.md',
          slug: 'microservices-topology',
          description: 'Service boundaries, Go API Gateway, and resilient connector adapters.',
          status: DocumentStatus.APPROVED,
          isOptional: false,
          tags: [archTag],
          content: `# Distributed Microservices Topology

## 1. Service Boundaries
1. **API Gateway (Go):** Ingress rate limiting, token validation, and mTLS termination.
2. **Routing & Orchestration Service (Go):** Acquirer latency scoring, smart fallbacks, and circuit breaking.
3. **Ledger Service (Node.js/TypeScript):** Real-time accounting journal writes and balance verification.
4. **Acquirer Connectors (Go):** Pluggable adapters for Stripe, Adyen, Worldpay, and Barclays.
5. **Webhook Dispatcher (Node.js):** Reliable at-least-once webhook deliveries with exponential backoff.

## 2. Inter-Service Communication
- **Synchronous Ingress:** HTTP/2 REST with OpenAPI 3.1 contracts.
- **Inter-Service Internal:** gRPC over HTTP/2 with Protocol Buffers v3.
- **Asynchronous Events:** Apache Kafka topics partitioned by \`merchant_id\`.
`
        },
        {
          title: 'REST & gRPC Idempotent Gateway APIs',
          fileName: 'API_SPECIFICATIONS_CONTRACTS.md',
          slug: 'api-specifications-contracts',
          description: 'Cryptographic idempotency keys, rate limits, and JSON schemas for payment mutations.',
          status: DocumentStatus.IN_REVIEW,
          isOptional: false,
          tags: [archTag],
          content: `# REST & gRPC Gateway API Specifications

## 1. Idempotency Specification
All mutating requests (\`POST\`, \`PATCH\`) require an \`Idempotency-Key\` header containing a UUID v4.

### Execution Flow:
\`\`\`text
Client Request (Idempotency-Key: <uuid>)
  ├── 1. Redis SETNX lock on key: "idemp:<merchantId>:<key>" (TTL: 120s)
  │      └── If key exists and status = PROCESSING: Return 409 Conflict
  │      └── If key exists and status = COMPLETED: Return cached response immediately
  ├── 2. Process transaction through pipeline
  └── 3. Cache response payload in Redis (TTL: 24h) and release distributed lock
\`\`\`

## 2. Core Endpoints
- \`POST /v1/payments/authorize\` - Authorize credit card or alternative payment method
- \`POST /v1/payments/:id/capture\` - Capture previously authorized fund reserve
- \`POST /v1/payments/:id/refund\` - Issue partial or full balance refund
- \`POST /v1/payments/:id/void\` - Cancel active pre-authorization
`
        },
        {
          title: 'Two-Phase Transaction State Machine',
          fileName: 'TRANSACTION_STATE_MACHINE.md',
          slug: 'transaction-state-machine',
          description: 'Deterministic state transitions and transactional invariants.',
          status: DocumentStatus.IN_REVIEW,
          isOptional: false,
          tags: [archTag, ledgerTag],
          content: `# Two-Phase Transaction State Machine

## 1. State Lifecycle Diagram
\`\`\`text
[ INITIATED ] ───► [ RISK_CHECKING ] ───► [ AUTHORIZED ] ───► [ CAPTURING ] ───► [ SETTLED ]
                          │                       │                  │
                          ▼                       ▼                  ▼
                     [ DECLINED ]            [ VOIDED ]         [ REFUNDED ]
\`\`\`

## 2. Invariant Rules
1. A transaction in \`CAPTURING\` state **cannot** transition to \`VOIDED\`; it must issue a \`REFUND\`.
2. Every state transition emits an immutable Kafka event to \`payments.events\`.
3. Balance mutations only execute when entering \`CAPTURED\` or \`REFUNDED\` states.
`
        }
      ]
    },
    {
      name: '04. Data Architecture & Ledger Design',
      slug: '04-data-ledger',
      description: 'Double-entry immutable bookkeeping ledger, PostgreSQL partitioning, and Kafka CDC.',
      sortOrder: 4,
      documents: [
        {
          title: 'Strict Double-Entry Immutable Accounting Ledger',
          fileName: 'DOUBLE_ENTRY_LEDGER.md',
          slug: 'double-entry-ledger',
          description: 'Relational tables for Accounts, Journal Entries, and Postings with sum-zero checks.',
          status: DocumentStatus.IN_PROGRESS,
          isOptional: false,
          tags: [ledgerTag],
          content: `# Strict Double-Entry Immutable Accounting Ledger

## 1. Fundamental Bookkeeping Invariant
$$\\sum \\text{Debits} = \\sum \\text{Credits}$$

Every financial transfer creates a single **Journal Entry** containing at least two **Posting Legs** that must strictly sum to zero before committing the PostgreSQL transaction.

## 2. Relational Schema
\`\`\`sql
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  merchant_id UUID NOT NULL,
  currency VARCHAR(3) NOT NULL,
  account_type VARCHAR(32) NOT NULL, -- ASSET, LIABILITY, EQUITY, REVENUE, EXPENSE
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL,
  description TEXT NOT NULL,
  posted_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE postings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  journal_entry_id UUID REFERENCES journal_entries(id),
  account_id UUID REFERENCES accounts(id),
  amount_cents BIGINT NOT NULL, -- Positive = Debit, Negative = Credit
  created_at TIMESTAMPTZ DEFAULT now()
);
\`\`\`
`
        },
        {
          title: 'Kafka Event Sourcing & Debezium CDC Pipeline',
          fileName: 'EVENT_SOURCING_POSTGRES_CDC.md',
          slug: 'event-sourcing-postgres-cdc',
          description: 'Change Data Capture streaming database WAL logs directly into Kafka analytics pipelines.',
          status: DocumentStatus.IN_PROGRESS,
          isOptional: false,
          tags: [kafkaTag],
          content: `# Kafka Event Sourcing & Debezium CDC Pipeline

## 1. Architecture Flow
\`\`\`text
PostgreSQL WAL ───► [ Debezium CDC Connector ] ───► [ Kafka Cluster ] ───► [ Snowflake / BigQuery ]
                                                           │
                                                           └──► [ Real-Time Fraud Monitor ]
\`\`\`

## 2. Topic Configuration
- \`cdc.payments.transactions\` (Partitions: 32, Replication: 3, Retention: 14 days)
- \`cdc.payments.postings\` (Partitions: 32, Replication: 3, Retention: 30 days)
- Key: \`merchant_id\` guarantees in-order event sequencing per merchant.
`
        }
      ]
    },
    {
      name: '05. Infrastructure, Kafka & High Availability',
      slug: '05-infrastructure-ha',
      description: 'Active-Active multi-region Kubernetes clusters, Kafka KRaft broker topologies, and DNS routing.',
      sortOrder: 5,
      documents: [
        {
          title: 'Active-Active Multi-Region EKS Deployment',
          fileName: 'KUBERNETES_MULTI_REGION_DEPLOYMENT.md',
          slug: 'kubernetes-multi-region-deployment',
          description: 'AWS EKS deployment across us-east-1 and eu-central-1 with Cloudflare Magic Transit.',
          status: DocumentStatus.IN_PROGRESS,
          isOptional: false,
          tags: [archTag],
          content: `# Active-Active Multi-Region EKS Deployment

## 1. Regional Footprint
- **Region Primary 1:** AWS \`us-east-1\` (Northern Virginia)
- **Region Primary 2:** AWS \`eu-central-1\` (Frankfurt)
- **Global Ingress:** Cloudflare Magic Transit DDoS scrubbing with Anycast BGP routing.

## 2. High-Availability Targets
- **Availability SLA:** 99.999% uptime (< 5.26 minutes unplanned downtime / year).
- **Auto-Scaling:** KEDA scaling based on Kafka consumer lag and CPU utilization (> 65%).
`
        },
        {
          title: 'KRaft Kafka High-Throughput Cluster Architecture',
          fileName: 'KAFKA_STREAMING_CLUSTER.md',
          slug: 'kafka-streaming-cluster',
          description: 'Dedicated 5-node KRaft Kafka cluster utilizing local NVMe SSD storage.',
          status: DocumentStatus.DRAFT,
          isOptional: true, // Optional Document 1
          tags: [kafkaTag],
          content: `# KRaft Kafka High-Throughput Cluster Architecture

## 1. Cluster Sizing
- **Node Type:** 5x AWS \`i3en.2xlarge\` instances with 2.5 TB NVMe SSD direct-attached storage.
- **KRaft Mode:** ZooKeeper eliminated; Raft metadata quorum managed across 3 controller nodes.
- **Producer Configuration:** \`acks=all\`, \`enable.idempotence=true\`, \`max.in.flight.requests.per.connection=5\`.
`
        }
      ]
    },
    {
      name: '06. Quality Assurance & Chaos Engineering',
      slug: '06-quality-chaos',
      description: 'Chaos Mesh simulated acquirer dropouts, automated load testing benchmarks, and regression suites.',
      sortOrder: 6,
      documents: [
        {
          title: 'Chaos Mesh Simulated Acquirer Outages & Fallbacks',
          fileName: 'CHAOS_ENGINEERING_DRILLS.md',
          slug: 'chaos-engineering-drills',
          description: 'Automated chaos engineering injecting network latency and sudden gateway connection drops.',
          status: DocumentStatus.DRAFT,
          isOptional: false,
          tags: [archTag],
          content: `# Chaos Mesh Simulated Acquirer Outages & Fallbacks

## 1. Automated Scenarios Tested in CI/CD
1. **Acquirer Latency Degradation (3,000ms delay):** Circuit breaker trips to OPEN within 200ms; router immediately re-dispatches traffic to secondary acquirer.
2. **Kafka Broker Partition Loss:** Zero message loss; producers retry transparently using memory buffer.
3. **Aurora Database Regional Failover:** Standby promoted in < 25 seconds without dropping authenticated sessions.
`
        },
        {
          title: 'k6 10,000 TPS Performance & Latency Benchmarks',
          fileName: 'LOAD_TESTING_BENCHMARKS.md',
          slug: 'load-testing-benchmarks',
          description: 'k6 load test scripts demonstrating sustained high-throughput under 45ms P99 latency.',
          status: DocumentStatus.DRAFT,
          isOptional: true, // Optional Document 2
          tags: [archTag],
          content: `# k6 10,000 TPS Performance & Latency Benchmarks

## 1. Performance Target Metrics
- **Target Sustained Throughput:** 10,000 TPS.
- **Peak Burst Throughput:** 14,000 TPS.
- **Latency SLAs:** P50 < 15ms, P95 < 32ms, P99 < 48ms.
- **Error Rate Target:** < 0.001% non-network errors.
`
        }
      ]
    },
    {
      name: '07. Operations, Reconciliation & Governance',
      slug: '07-operations-governance',
      description: 'Daily automated bank reconciliation runbooks, 15-minute RTO disaster recovery, and audit trails.',
      sortOrder: 7,
      documents: [
        {
          title: 'Automated EOD Bank Reconciliation Runbook',
          fileName: 'DAILY_BANK_RECONCILIATION.md',
          slug: 'daily-bank-reconciliation',
          description: 'Daily automated matching of bank camt.053 settlement files against internal ledger balances.',
          status: DocumentStatus.APPROVED,
          isOptional: false,
          tags: [ledgerTag, isoTag],
          content: `# Automated EOD Bank Reconciliation Runbook

## 1. Execution Schedule
Daily execution at **02:00 UTC** triggered by Kubernetes CronJob.

## 2. Automated Runbook Steps
1. Ingest \`camt.053\` bank statement files via mutual-TLS SFTP from 12 partner banks.
2. Match acquirer batch payout IDs with internal ledger postings.
3. Automatically clear matching records with zero delta.
4. Flag all balance variances exceeding $0.01 for automated Slack / PagerDuty alerts.
5. Generate cryptographically signed GPG daily reconciliation certificate.
`
        },
        {
          title: '15-Minute RTO Regional Failover Runbook',
          fileName: 'DISASTER_RECOVERY_RUNBOOK.md',
          slug: 'disaster-recovery-runbook',
          description: 'Emergency step-by-step procedures for complete regional cloud provider outages.',
          status: DocumentStatus.IN_PROGRESS,
          isOptional: false,
          tags: [archTag],
          content: `# 15-Minute RTO Regional Failover Runbook

## 1. Disaster Recovery Objectives
- **Recovery Point Objective (RPO):** 0 seconds (synchronous replication across Availability Zones).
- **Recovery Time Objective (RTO):** < 15 minutes for complete inter-region failover.

## 2. Emergency Escalation Procedure
1. Confirm primary region degradation via 3 independent telemetry probes.
2. Rotate Cloudflare Anycast traffic route weights to secondary region (instant DNS cutover).
3. Promote Aurora Global Database replica in secondary region to standalone writer.
4. Verify Kafka consumer offsets and resume background payment processor workers.
`
        },
        {
          title: 'Immutable Audit Logging & Dispute Arbitration',
          fileName: 'SECURITY_AUDIT_LOGGING.md',
          slug: 'security-audit-logging',
          description: 'WORM storage compliance for 7-year dispute retention and legal compliance.',
          status: DocumentStatus.DRAFT,
          isOptional: true, // Optional Document 3
          tags: [securityTag],
          content: `# Immutable Audit Logging & Dispute Arbitration

## 1. Compliance Mandate
Financial regulatory compliance requires non-rewritable, non-erasable (WORM) storage for all transaction receipts for a minimum of 7 years.

## 2. Architecture Specification
- **Storage Tier:** AWS S3 Object Lock in Compliance Mode.
- **Encryption:** KMS with customer-managed keys (CMK) and CloudTrail audit verification.
- **Export Formats:** Cryptographically hashed JSON-LD and signed PDF receipts for chargeback representment.
`
        }
      ]
    }
  ];

  let docCounter = 0;
  let firstDocId = '';

  for (const catDef of categoriesDefinition) {
    const category = await prisma.category.create({
      data: {
        projectId: project.id,
        name: catDef.name,
        slug: catDef.slug,
        description: catDef.description,
        sortOrder: catDef.sortOrder,
        isCustom: false
      }
    });

    for (let i = 0; i < catDef.documents.length; i++) {
      const docDef = catDef.documents[i];

      const doc = await prisma.document.create({
        data: {
          projectId: project.id,
          categoryId: category.id,
          title: docDef.title,
          fileName: docDef.fileName,
          slug: docDef.slug,
          description: docDef.description,
          content: docDef.content,
          status: docDef.status,
          sortOrder: i + 1,
          versionNumber: 3,
          isOptional: docDef.isOptional,
          createdById: admin.id,
          updatedById: owner.id
        }
      });

      if (!firstDocId) firstDocId = doc.id;

      // Create Version 1
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          title: docDef.title,
          content: `# ${docDef.title}\n\n*Initial architectural draft specification.*`,
          changeSummary: 'Initial document draft created from engineering blueprint',
          authorId: admin.id,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        }
      });

      // Create Version 2
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 2,
          title: docDef.title,
          content: `${docDef.content}\n\n*Updated with PCI-DSS & ISO20022 guardrails.*`,
          changeSummary: 'Refined requirements, state machine invariants, and security rules',
          authorId: editor.id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      });

      // Create Version 3
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 3,
          title: docDef.title,
          content: docDef.content,
          changeSummary: 'Final production sign-off by Lead Software Architect',
          authorId: owner.id,
          createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
        }
      });

      // Associate Tags
      for (const t of docDef.tags) {
        await prisma.documentTag.create({
          data: { documentId: doc.id, tagId: t.id }
        });
      }

      // Add comments on key documents
      if (docDef.slug === 'product-overview' || docDef.slug === 'pci-dss-tokenization-vault') {
        const comment1 = await prisma.comment.create({
          data: {
            documentId: doc.id,
            userId: admin.id,
            content: 'Verified that the tokenization vault isolation passes PCI-DSS 4.0 RoC requirements with zero PAN storage.'
          }
        });
        await prisma.comment.create({
          data: {
            documentId: doc.id,
            userId: owner.id,
            parentId: comment1.id,
            content: 'Confirmed by InfoSec. Approved for production blueprint architecture.'
          }
        });

        const rev = await prisma.reviewRequest.create({
          data: {
            documentId: doc.id,
            requesterId: admin.id,
            status: ReviewStatus.APPROVED,
            notes: 'Architecture blueprint verified and signed off for production release.'
          }
        });

        await prisma.reviewApproval.create({
          data: {
            reviewRequestId: rev.id,
            reviewerId: owner.id,
            status: ReviewStatus.APPROVED,
            comment: 'Fully approved. Complete production specification ready.'
          }
        });
      }

      docCounter++;
    }
  }

  // 8. Create Realistic Activity Logs
  await prisma.activityLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId: project.id,
        userId: admin.id,
        action: ActivityAction.CREATED,
        entityType: 'PROJECT',
        metadata: JSON.stringify({ projectName: project.name })
      },
      {
        workspaceId: workspace.id,
        projectId: project.id,
        userId: owner.id,
        action: ActivityAction.REVIEW_APPROVED,
        entityType: 'REVIEW',
        metadata: JSON.stringify({ documentTitle: 'Product Overview & Payment Topology' })
      },
      {
        workspaceId: workspace.id,
        projectId: project.id,
        userId: owner.id,
        action: ActivityAction.REVIEW_APPROVED,
        entityType: 'REVIEW',
        metadata: JSON.stringify({ documentTitle: 'Zero-PAN Tokenization Vault Architecture' })
      },
      {
        workspaceId: workspace.id,
        projectId: project.id,
        userId: editor.id,
        action: ActivityAction.UPDATED,
        entityType: 'DOCUMENT',
        metadata: JSON.stringify({ documentTitle: 'Two-Phase Transaction State Machine' })
      }
    ]
  });

  console.log(`\n======================================================`);
  console.log(`SUCCESSFULLY SEEDED DEVBLUEPRINT:`);
  console.log(`  Project: ${project.name} (1 Active Project)`);
  console.log(`  Categories: ${categoriesDefinition.length} Structured Categories`);
  console.log(`  Documents: ${docCounter} Realistic Technical Documents`);
  console.log(`======================================================\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
