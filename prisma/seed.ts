import { PrismaClient, UserRole, ProjectVisibility, ProjectStatus, DocumentStatus, ReviewStatus, ActivityAction } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { BUILTIN_TEMPLATES, DEFAULT_BLUEPRINT_CATEGORIES } from '../packages/shared/src';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding DevBlueprint database...');

  // Clean existing data
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

  // 1. Create Users
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

  console.log('Created users: owner, admin, editor, viewer (Password: Password123!)');

  // 2. Create Workspace
  const workspace = await prisma.workspace.create({
    data: {
      name: 'Acme Cloud Engineering',
      slug: 'acme-cloud-engineering',
      ownerId: owner.id,
      logoUrl: 'https://api.dicebear.com/7.x/identicon/svg?seed=acme',
      settings: {
        create: {
          themePreference: 'dark',
          notifyOnComment: true,
          notifyOnReview: true
        }
      }
    }
  });

  // Add members
  await prisma.workspaceMember.createMany({
    data: [
      { workspaceId: workspace.id, userId: owner.id, role: UserRole.OWNER },
      { workspaceId: workspace.id, userId: admin.id, role: UserRole.ADMIN },
      { workspaceId: workspace.id, userId: editor.id, role: UserRole.EDITOR },
      { workspaceId: workspace.id, userId: viewer.id, role: UserRole.VIEWER }
    ]
  });

  // 3. Create Builtin Templates
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

  // 4. Create Tags
  const archTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'Architecture', color: '#6366f1' }
  });
  const securityTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'PCI-DSS', color: '#ef4444' }
  });
  const isoTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'ISO20022', color: '#06b6d4' }
  });
  const mvpTag = await prisma.tag.create({
    data: { workspaceId: workspace.id, name: 'MVP', color: '#10b981' }
  });

  // 5. Create Projects
  const project1 = await prisma.project.create({
    data: {
      workspaceId: workspace.id,
      name: 'DevBlueprint Enterprise Platform',
      slug: 'devblueprint-enterprise-platform',
      description: 'Centralized developer documentation and technical blueprint management system.',
      projectType: 'SaaS platform',
      category: 'Developer Tools',
      techStack: JSON.stringify(['Next.js', 'Express', 'TypeScript', 'PostgreSQL', 'Prisma', 'Tailwind CSS']),
      repositoryUrl: 'https://github.com/acme/devblueprint',
      icon: 'layers',
      color: '#4f46e5',
      visibility: ProjectVisibility.INTERNAL,
      status: ProjectStatus.ACTIVE,
      createdById: owner.id
    }
  });

  const project2 = await prisma.project.create({
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

  console.log('Created projects: DevBlueprint Enterprise Platform and FinTech Payment Orchestrator');

  // 6. Generate Categories & Documents for Project 1 (DevBlueprint)
  for (const catDef of DEFAULT_BLUEPRINT_CATEGORIES) {
    const category = await prisma.category.create({
      data: {
        projectId: project1.id,
        name: catDef.name,
        slug: catDef.slug,
        description: catDef.description,
        sortOrder: catDef.sortOrder,
        isCustom: false
      }
    });

    for (let i = 0; i < catDef.documents.length; i++) {
      const docDef = catDef.documents[i];
      let status: DocumentStatus = DocumentStatus.DRAFT;
      if (catDef.sortOrder === 1) {
        status = DocumentStatus.COMPLETED;
      } else if (catDef.sortOrder === 2 && i < 4) {
        status = DocumentStatus.APPROVED;
      } else if (catDef.sortOrder === 3 && i < 2) {
        status = DocumentStatus.IN_REVIEW;
      } else if (catDef.sortOrder === 4 && i < 2) {
        status = DocumentStatus.IN_PROGRESS;
      } else if (i > 3) {
        status = DocumentStatus.NOT_STARTED;
      }

      const doc = await prisma.document.create({
        data: {
          projectId: project1.id,
          categoryId: category.id,
          title: docDef.title,
          fileName: docDef.fileName,
          slug: docDef.slug,
          description: docDef.description,
          content: docDef.content,
          status,
          sortOrder: i + 1,
          versionNumber: 2,
          createdById: owner.id,
          updatedById: editor.id
        }
      });

      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          title: docDef.title,
          content: `${docDef.content}\n\n*Initial draft initialized by architecture seed.*`,
          changeSummary: 'Initial document draft created from standard engineering blueprint.',
          authorId: owner.id,
          createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
        }
      });

      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 2,
          title: docDef.title,
          content: docDef.content,
          changeSummary: 'Refined requirements and diagrams.',
          authorId: editor.id,
          createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
        }
      });
    }
  }

  // 7. Generate Categories & Documents for Project 2 (FinTech Payment Orchestrator) - 100% COMPLETE!
  const fintechBlueprintCategories = [
    {
      name: '01. Product & Regulatory Blueprint',
      slug: '01-product',
      description: 'Payment orchestration business model, ISO20022 specifications, and transaction lifecycles.',
      sortOrder: 1,
      documents: [
        {
          title: 'Payment Orchestration Overview',
          fileName: 'PAYMENT_ORCHESTRATION_OVERVIEW.md',
          slug: 'payment-orchestration-overview',
          description: 'High-level payment router topology, multi-acquirer fallback, and cost optimization rules.',
          content: `# Payment Orchestration Overview

## 1. Executive Overview
The FinTech Payment Orchestrator routes global electronic card payments, SEPA instant transfers, and cross-border remittances across 12 tier-1 acquiring banks with sub-50ms dynamic routing logic.

## 2. Key Architecture Invariants
- **High Throughput:** 10,000 transactions per second (TPS) peak capacity.
- **Dynamic Routing:** Smart lowest-cost routing (LCR) with automated failover on acquirer timeouts.
- **Idempotency Guarantee:** Cryptographic idempotency keys on every payment mutation.
- **Regulatory Strictness:** Full PCI-DSS Level 1 compliance and ISO20022 pacs.008 message translation.
`
        },
        {
          title: 'ISO20022 Financial Messaging Specifications',
          fileName: 'ISO20022_SPECIFICATIONS.md',
          slug: 'iso20022-specifications',
          description: 'Standardized XML and JSON schemas for pacs.008, pain.001, and camt.053 messages.',
          content: `# ISO20022 Financial Messaging Standards

## Message Types
- **pain.001.001.09:** Customer Credit Transfer Initiation
- **pacs.008.001.08:** Financial Institution Customer Credit Transfer
- **pacs.002.001.10:** Payment Status Report
- **camt.053.001.08:** End-of-Day Bank-to-Customer Statement

## Schema Transformation Pipeline
Inbound REST payload -> Canonical Payment Entity -> Validated XML XMLSec1 Signature -> Outbound MQ Broker.
`
        },
        {
          title: 'Transaction State Machine & Business Rules',
          fileName: 'TRANSACTION_STATE_MACHINE.md',
          slug: 'transaction-state-machine',
          description: 'Deterministic two-phase transaction lifecycle from AUTHORIZED to SETTLED.',
          content: `# Transaction State Machine

\`\`\`text
[INITIATED] -> [RISK_CHECKING] -> [AUTHORIZED] -> [CAPTURING] -> [SETTLED]
                      |                 |              |
                      v                 v              v
                  [DECLINED]       [VOIDED]       [REFUNDED]
\`\`\`

## Invariants
1. A transaction in \`CAPTURING\` state cannot transition to \`VOIDED\`; it must issue a \`REFUND\`.
2. All balance-affecting operations use double-entry ledger bookkeeping entries.
`
        }
      ]
    },
    {
      name: '02. Security & Compliance Architecture',
      slug: '02-security-compliance',
      description: 'PCI-DSS Level 1, HSM Key Ceremony, Tokenization Vault, and TLS 1.3 mTLS.',
      sortOrder: 2,
      documents: [
        {
          title: 'PCI-DSS Level 1 Compliance & Tokenization',
          fileName: 'PCI_DSS_TOKENIZATION.md',
          slug: 'pci-dss-tokenization',
          description: 'PAN storage elimination, format-preserving encryption, and token vaulting.',
          content: `# PCI-DSS Compliance & Cardholder Data Environment (CDE)

## Zero-PAN Principle
The application servers NEVER touch raw Primary Account Numbers (PANs). All browser checkouts tokenize client-side directly against our isolated Token Vault.

## Tokenization Vault
- AES-256-GCM Format-Preserving Encryption (FPE)
- HSM-backed Master Key derivation (Thales Luna HSM)
`
        },
        {
          title: 'HSM Cryptographic Key Ceremony',
          fileName: 'HSM_KEY_CEREMONY.md',
          slug: 'hsm-key-ceremony',
          description: 'Dual-control split-knowledge procedures for Zone Master Keys (ZMK) and BDKs.',
          content: `# Hardware Security Module (HSM) Protocols

- **Key Derivation:** DUKPT (Derived Unique Key Per Transaction) for PIN block encryption.
- **Access Control:** Multi-party quorum (3 of 5 custody officers) required for key rotations.
`
        }
      ]
    },
    {
      name: '03. Microservices & API Architecture',
      slug: '03-microservices-api',
      description: 'Service boundaries, gRPC contracts, Kafka event topologies, and REST routing gateway.',
      sortOrder: 3,
      documents: [
        {
          title: 'Microservices Decomposition & Topology',
          fileName: 'MICROSERVICES_TOPOLOGY.md',
          slug: 'microservices-topology',
          description: 'Decoupled services: Payment Gateway, Risk Engine, Ledger Service, Acquirer Adapters.',
          content: `# Microservices Architecture

## Service Inventory
1. **API Gateway (Go):** Rate limiting, token verification, TLS termination, request validation.
2. **Orchestrator Service (Go):** Dynamic routing, retry loops, fallback acquirer dispatch.
3. **Ledger Service (Node.js + PostgreSQL):** Immutable double-entry financial ledger.
4. **Fraud & Risk Service (Python + Redis):** Real-time ML scoring under 15ms SLA.
5. **Acquirer Adapters:** Pluggable connector pods for Stripe, Adyen, Chase, and Barclays.
`
        },
        {
          title: 'Distributed Idempotency & Concurrency',
          fileName: 'DISTRIBUTED_IDEMPOTENCY.md',
          slug: 'distributed-idempotency',
          description: 'Redis distributed locks and database unique constraints preventing duplicate charges.',
          content: `# Distributed Idempotency Specification

\`\`\`text
Client Request (Idempotency-Key: uuid)
  -> Check Redis Lock (TTL 60s)
  -> If duplicate in-flight: Return HTTP 409 Conflict
  -> If cached response exists: Return cached response immediately
  -> Execute payment -> Save to DB -> Cache in Redis -> Release Lock
\`\`\`
`
        }
      ]
    },
    {
      name: '04. Data Architecture & Ledger Design',
      slug: '04-data-ledger',
      description: 'Double-entry bookkeeping schema, append-only journals, and read-replica scaling.',
      sortOrder: 4,
      documents: [
        {
          title: 'Double-Entry Accounting Ledger Schema',
          fileName: 'DOUBLE_ENTRY_LEDGER.md',
          slug: 'double-entry-ledger',
          description: 'Relational tables for Accounts, Journal Entries, and Postings with strict sum zero balance checks.',
          content: `# Double-Entry Bookkeeping Ledger

## Fundamental Invariant
$$\sum \\text{Debits} = \sum \\text{Credits}$$

Every financial transfer creates a Journal Entry with at least two Posting legs that must strictly sum to zero before committing the PostgreSQL transaction.
`
        },
        {
          title: 'Event Sourcing with Kafka & PostgreSQL CDC',
          fileName: 'EVENT_SOURCING_KAFKA.md',
          slug: 'event-sourcing-kafka',
          description: 'Debezium Change Data Capture, Kafka event partitioning by Merchant ID, and exactly-once semantics.',
          content: `# Event Sourcing Pipeline

- **Kafka Topics:** \`payments.initiated\`, \`payments.authorized\`, \`payments.settled\`, \`payments.failed\`
- **Partition Key:** \`merchant_id\` guarantees strict in-order processing per merchant account.
- **Debezium CDC:** Streams PostgreSQL WAL logs directly to downstream analytics and data lake.
`
        }
      ]
    },
    {
      name: '05. Infrastructure, Kafka & High Availability',
      slug: '05-infrastructure-ha',
      description: 'Multi-region active-active deployment, Kubernetes manifests, and failover runbooks.',
      sortOrder: 5,
      documents: [
        {
          title: 'Multi-Region Kubernetes Cluster Topology',
          fileName: 'KUBERNETES_TOPOLOGY.md',
          slug: 'kubernetes-topology',
          description: 'AWS EKS multi-AZ deployment with horizontal pod autoscaling (HPA) and Istio service mesh.',
          content: `# Multi-Region Kubernetes Topology

- **Ingress:** AWS Route53 Geo-DNS + Cloudflare Magic Transit DDoS scrubbing.
- **Service Mesh:** Istio with mTLS enforced across all microservices.
- **Autoscaling:** KEDA scaling based on Kafka consumer lag and CPU threshold (70%).
`
        },
        {
          title: 'Kafka Streaming Cluster Architecture',
          fileName: 'KAFKA_STREAMING_CLUSTER.md',
          slug: 'kafka-streaming-cluster',
          description: 'Dedicated 5-node KRaft Kafka cluster with NVMe SSDs and 3x replication factor.',
          content: `# Kafka Cluster Infrastructure

- **Brokers:** 5 high-memory c6i.2xlarge instances with EBS gp3 storage.
- **Min In-Sync Replicas (min.insync.replicas):** 2
- **Retention:** 7 days for transaction topics; 30 days for audit logs.
`
        }
      ]
    },
    {
      name: '06. Quality Assurance & Chaos Engineering',
      slug: '06-quality-chaos',
      description: 'Chaos Mesh simulated acquirer dropouts, load testing benchmarks, and contract tests.',
      sortOrder: 6,
      documents: [
        {
          title: 'Chaos Engineering & Acquirer Outage Drills',
          fileName: 'CHAOS_ENGINEERING.md',
          slug: 'chaos-engineering',
          description: 'Automated Chaos Mesh injections testing automatic bank fallback and circuit breakers.',
          content: `# Chaos Engineering & Circuit Breaker Drills

## Scenarios Tested in CI:
1. **Acquirer Latency Spike (3000ms delay):** Circuit breaker trips to OPEN in < 250ms, auto-routing traffic to secondary acquirer.
2. **Kafka Broker Loss:** Zero transaction message loss; producers retry seamlessly with idempotency.
3. **Database Failover:** AWS Aurora regional promotion under 30 seconds.
`
        },
        {
          title: 'Load Testing & Performance Benchmarks',
          fileName: 'PERFORMANCE_BENCHMARKS.md',
          slug: 'performance-benchmarks',
          description: 'k6 load test scripts demonstrating 10,000 TPS under 45ms P99 latency.',
          content: `# Performance Testing Benchmarks

- **Peak Tested TPS:** 12,500 transactions / second.
- **Latency SLAs:** P50 < 12ms, P95 < 28ms, P99 < 45ms.
- **Error Rate:** 0.0001% during 4-hour sustained stress tests.
`
        }
      ]
    },
    {
      name: '07. Operations, Reconciliation & Governance',
      slug: '07-operations-governance',
      description: 'End-of-day bank reconciliation runbook, dispute arbitration, and audit trail retention.',
      sortOrder: 7,
      documents: [
        {
          title: 'Automated EOD Bank Reconciliation Runbook',
          fileName: 'BANK_RECONCILIATION_RUNBOOK.md',
          slug: 'bank-reconciliation-runbook',
          description: 'Parsing SWIFT MT940 and ISO camt.053 files against internal ledger balances.',
          content: `# Daily Bank Reconciliation Operations

## Daily Runbook (02:00 UTC)
1. Download camt.053 statement files via SFTP from partner banks.
2. Match acquirer batch settlement IDs against internal transaction database.
3. Flag discrepancies exceeding $0.01 for automated escalation.
4. Issue automated ledger reconciliation certificate signed with GPG key.
`
        },
        {
          title: 'Disaster Recovery & 15-Minute RTO Failover',
          fileName: 'DISASTER_RECOVERY_PLAN.md',
          slug: 'disaster-recovery-plan',
          description: 'Recovery Point Objective (RPO) = 0 and Recovery Time Objective (RTO) < 15 minutes.',
          content: `# Disaster Recovery & Business Continuity Plan

- **Target RPO:** 0 seconds (synchronous replication across Availability Zones).
- **Target RTO:** < 15 minutes for complete regional disaster failover.
- **Testing Cadence:** Quarterly unannounced failover drills supervised by InfoSec.
`
        }
      ]
    }
  ];

  let p2DocsCount = 0;
  for (const catDef of fintechBlueprintCategories) {
    const category = await prisma.category.create({
      data: {
        projectId: project2.id,
        name: catDef.name,
        slug: catDef.slug,
        description: catDef.description,
        sortOrder: catDef.sortOrder,
        isCustom: false
      }
    });

    for (let i = 0; i < catDef.documents.length; i++) {
      const docDef = catDef.documents[i];

      // ALL DOCUMENTS FOR PROJECT 2 ARE 100% COMPLETED / APPROVED!
      const doc = await prisma.document.create({
        data: {
          projectId: project2.id,
          categoryId: category.id,
          title: docDef.title,
          fileName: docDef.fileName,
          slug: docDef.slug,
          description: docDef.description,
          content: docDef.content,
          status: DocumentStatus.COMPLETED, // 100% Completion!
          sortOrder: i + 1,
          versionNumber: 3,
          isOptional: false,
          createdById: admin.id,
          updatedById: owner.id
        }
      });

      // Version 1
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          title: docDef.title,
          content: `# ${docDef.title}\n\nDraft initial specifications.`,
          changeSummary: 'Initial specification draft initialized by DevOps Lead',
          authorId: admin.id,
          createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000)
        }
      });

      // Version 2
      await prisma.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 2,
          title: docDef.title,
          content: `${docDef.content}\n\n*Updated with PCI-DSS compliance checks.*`,
          changeSummary: 'Added compliance guardrails and architecture invariants',
          authorId: editor.id,
          createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000)
        }
      });

      // Version 3 (Final Approved Version)
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

      // Add tags
      await prisma.documentTag.create({
        data: { documentId: doc.id, tagId: securityTag.id }
      });
      await prisma.documentTag.create({
        data: { documentId: doc.id, tagId: isoTag.id }
      });

      // Add comments & approved review requests
      if (docDef.slug === 'payment-orchestration-overview' || docDef.slug === 'pci-dss-tokenization') {
        const comment = await prisma.comment.create({
          data: {
            documentId: doc.id,
            userId: admin.id,
            content: 'Verified with audit firm that token vault isolation passes PCI DSS 4.0 requirements.'
          }
        });
        await prisma.comment.create({
          data: {
            documentId: doc.id,
            userId: owner.id,
            parentId: comment.id,
            content: 'Approved! Ready for production deployment.'
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
            comment: 'Fully approved. Complete 100% specification ready.'
          }
        });
      }

      p2DocsCount++;
    }
  }

  // 8. Activity logs
  await prisma.activityLog.createMany({
    data: [
      {
        workspaceId: workspace.id,
        projectId: project2.id,
        userId: admin.id,
        action: ActivityAction.CREATED,
        entityType: 'PROJECT',
        metadata: JSON.stringify({ projectName: project2.name })
      },
      {
        workspaceId: workspace.id,
        projectId: project2.id,
        userId: owner.id,
        action: ActivityAction.REVIEW_APPROVED,
        entityType: 'REVIEW',
        metadata: JSON.stringify({ documentTitle: 'Payment Orchestration Overview' })
      },
      {
        workspaceId: workspace.id,
        projectId: project2.id,
        userId: owner.id,
        action: ActivityAction.REVIEW_APPROVED,
        entityType: 'PROJECT',
        metadata: JSON.stringify({
          projectName: project2.name,
          progress: '100% Completed'
        })
      }
    ]
  });

  console.log(`Seeded Project 2 (FinTech Payment Orchestrator) with ${p2DocsCount} documents at 100% completion!`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
