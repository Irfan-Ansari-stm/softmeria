import { PrismaClient } from '@prisma/client';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

async function seedFilesAndRFCs() {
  console.log('Seeding enterprise RFCs, ADRs, file folders and initial assets...');
  const workspace = await prisma.workspace.findFirst();
  if (!workspace) {
    console.log('No workspace found, exiting seed.');
    return;
  }
  const workspaceId = workspace.id;

  const users = await prisma.user.findMany();
  const ownerUser = users.find(u => u.email === 'owner@devblueprint.io') || users[0];
  const adminUser = users.find(u => u.email === 'admin@devblueprint.io') || users[1] || users[0];
  const editorUser = users.find(u => u.email === 'editor@devblueprint.io') || users[2] || users[0];
  const qaUser = users.find(u => u.email === 'qa@devblueprint.io') || users[3] || users[0];

  const projects = await prisma.project.findMany({ where: { workspaceId } });
  const p1 = projects[0]?.id;
  const p2 = projects[1]?.id;

  // 1. Seed RFC Proposals
  const rfcCount = await prisma.rFC.count({ where: { workspaceId } });
  if (rfcCount === 0) {
    const rfc1 = await prisma.rFC.create({
      data: {
        workspaceId,
        projectId: p1,
        authorId: ownerUser.id,
        rfcNumber: 101,
        title: 'RFC 101: Zero-Trust mTLS & Service Mesh Architecture for Enterprise Workloads',
        category: 'SECURITY',
        problemStatement: 'Currently, inter-service communications rely on perimeter firewalling without cryptographic mutual identity verification between microservices.',
        motivation: 'Mandated by SOC-2 Type II audit and zero-trust guidelines to ensure all east-west communications are encrypted and identity-verified.',
        proposedSolution: 'Deploy Linkerd service mesh with automatic sidecar injection and HashiCorp Vault X.509 certificate rotation every 24 hours.',
        technicalArchitecture: 'Linkerd lightweight Rust proxies handling mTLS handshakes with Envoy ingress gateways and TLS 1.3 ECDHE cipher suites.',
        securityConsiderations: 'Zero-trust verification; automated cert revocation; cryptographic non-repudiation.',
        performanceConsiderations: 'p99 latency overhead < 1.2ms; memory overhead < 35MB per pod replica.',
        implementationPlan: 'Phase 1: Ingress proxy setup. Phase 2: Canary mesh injection in staging. Phase 3: Enforce strict mTLS cluster-wide.',
        status: 'UNDER_REVIEW',
        version: 1,
        reviews: {
          create: [
            { reviewerId: adminUser.id, status: 'APPROVED', comments: 'Infrastructure team has reviewed the Envoy proxy memory overhead in staging. Ready for production rollout.' },
            { reviewerId: qaUser.id, status: 'PENDING', comments: 'Performing automated chaos engineering injection to verify failover.' }
          ]
        },
        votes: {
          create: [
            { voterId: ownerUser.id, vote: 'APPROVE' },
            { voterId: adminUser.id, vote: 'APPROVE' },
            { voterId: editorUser.id, vote: 'APPROVE' }
          ]
        }
      }
    });

    const rfc2 = await prisma.rFC.create({
      data: {
        workspaceId,
        projectId: p2 || p1,
        authorId: editorUser.id,
        rfcNumber: 102,
        title: 'RFC 102: Event Sourcing & CQRS Pattern for Payment Ledger Auditability',
        category: 'DATABASE_DESIGN',
        problemStatement: 'Synchronous relational mutations make auditing retroactive financial transaction history challenging.',
        motivation: 'Guarantees an immutable audit trail and point-in-time state reconstruction for high-throughput ISO 20022 payments.',
        proposedSolution: 'Store domain state transitions as an append-only event stream in PostgreSQL event_journal with Kafka CDC broadcasting to Redis read projections.',
        technicalArchitecture: 'Event Store + Debezium CDC + Kafka topic partitioning + Materialized View projection builders.',
        securityConsiderations: 'Append-only storage with cryptographic hash chaining ensures tamper-proof audit trails.',
        performanceConsiderations: 'Separation of read and write paths optimizes write throughput up to 12,000 TPS.',
        status: 'ACCEPTED',
        version: 2,
        reviews: {
          create: [
            { reviewerId: ownerUser.id, status: 'APPROVED', comments: 'Excellent writeup. Invariant validation logic must remain completely deterministic.' }
          ]
        },
        votes: {
          create: [
            { voterId: ownerUser.id, vote: 'APPROVE' },
            { voterId: adminUser.id, vote: 'APPROVE' },
            { voterId: editorUser.id, vote: 'APPROVE' }
          ]
        }
      }
    });

    const rfc3 = await prisma.rFC.create({
      data: {
        workspaceId,
        projectId: p1,
        authorId: adminUser.id,
        rfcNumber: 103,
        title: 'RFC 103: Automated Canary Deployments with ArgoCD and Prometheus Metrics',
        category: 'INFRASTRUCTURE',
        problemStatement: 'Manual deployment rollouts risk service degradation affecting all active users simultaneously.',
        motivation: 'Automate zero-downtime canary traffic shifting based on real-time error rate telemetry.',
        proposedSolution: 'Implement Argo Rollouts with automated step-wise traffic shifting (5% -> 25% -> 50% -> 100%) governed by Prometheus 5xx error thresholds.',
        technicalArchitecture: 'Argo Rollouts controller + Prometheus metrics provider + Traefik weighted ingress routing.',
        status: 'SUBMITTED',
        version: 1,
        reviews: {
          create: [
            { reviewerId: qaUser.id, status: 'PENDING' }
          ]
        }
      }
    });

    console.log(`Created 3 RFC proposals: #${rfc1.rfcNumber}, #${rfc2.rfcNumber}, #${rfc3.rfcNumber}`);

    // Seed Architecture Decision Records (ADR)
    await prisma.architectureDecision.create({
      data: {
        workspaceId,
        projectId: p1,
        rfcId: rfc2.id,
        decisionNumber: 1,
        title: 'ADR-001: Adoption of Kafka Event Sourcing for Core Payment Ledger',
        status: 'ACCEPTED',
        context: 'We require non-repudiation and replay capability for high-value financial transactions governed by PCI-DSS and SOC2 regulations.',
        decision: 'Adopt append-only PostgreSQL journal tables with Kafka stream replication to update read models.',
        alternativesConsidered: 'Direct CRUD database row updates; MongoDB document snapshots; DynamoDB Streams.',
        consequences: 'Increased system operational complexity; ultimate consistency for read projections; zero possibility of retroactive balance alteration.',
        approvedById: ownerUser.id
      }
    });

    await prisma.architectureDecision.create({
      data: {
        workspaceId,
        projectId: p1,
        rfcId: rfc1.id,
        decisionNumber: 2,
        title: 'ADR-002: Linkerd Service Mesh for Zero-Trust Inter-Service Security',
        status: 'ACCEPTED',
        context: 'Perimeter-only firewalling fails zero-trust compliance standards.',
        decision: 'Enforce mTLS on all pod-to-pod communications via Linkerd lightweight Rust proxies.',
        alternativesConsidered: 'Istio (heavier resource footprint); Consul Connect; application-level manual TLS handshakes.',
        consequences: '100% encrypted internal traffic; seamless automatic cert renewal; minimal CPU overhead (~15m core/pod).',
        approvedById: ownerUser.id
      }
    });
    console.log('Created 2 Architecture Decision Records (ADRs).');
  }

  // 2. Seed File Folders & Enterprise Assets
  let f1 = await prisma.fileFolder.findFirst({ where: { workspaceId, name: 'Architecture & System Blueprints' } });
  let f2 = await prisma.fileFolder.findFirst({ where: { workspaceId, name: 'Security & Compliance Specifications' } });
  let fSub = await prisma.fileFolder.findFirst({ where: { workspaceId, name: 'Cloud Infrastructure Topologies' } });

  if (!f1) {
    f1 = await prisma.fileFolder.create({
      data: { workspaceId, projectId: p1, name: 'Architecture & System Blueprints', color: '#2563eb' }
    });
  }
  if (!f2) {
    f2 = await prisma.fileFolder.create({
      data: { workspaceId, projectId: p1, name: 'Security & Compliance Specifications', color: '#16a34a' }
    });
  }
  if (!fSub) {
    fSub = await prisma.fileFolder.create({
      data: { workspaceId, projectId: p1, parentId: f1.id, name: 'Cloud Infrastructure Topologies', color: '#0284c7' }
    });
  }

  const fileCount = await prisma.fileItem.count({ where: { workspaceId } });
  if (fileCount === 0) {

    // Ensure uploads directory exists
    const uploadsDir = path.resolve(process.cwd(), 'uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }

    // Sample file 1: System Architecture Diagram (SVG)
    const svgPath = path.join(uploadsDir, 'system-architecture.svg');
    const svgContent = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 400" width="800" height="400">
      <rect width="800" height="400" fill="#0f172a" rx="12"/>
      <text x="400" y="45" fill="#f8fafc" font-size="20" font-family="sans-serif" font-weight="bold" text-anchor="middle">DevBlueprint Enterprise Cloud Topology</text>
      <rect x="50" y="80" width="180" height="90" fill="#1e293b" stroke="#3b82f6" stroke-width="2" rx="8"/>
      <text x="140" y="120" fill="#93c5fd" font-size="14" font-weight="bold" text-anchor="middle">Cloudflare Edge</text>
      <text x="140" y="145" fill="#94a3b8" font-size="11" text-anchor="middle">WAF &amp; Global Anycast CDN</text>
      <rect x="310" y="80" width="180" height="90" fill="#1e293b" stroke="#10b981" stroke-width="2" rx="8"/>
      <text x="400" y="120" fill="#6ee7b7" font-size="14" font-weight="bold" text-anchor="middle">Kubernetes Ingress</text>
      <text x="400" y="145" fill="#94a3b8" font-size="11" text-anchor="middle">Traefik + mTLS Sidecars</text>
      <rect x="570" y="80" width="180" height="90" fill="#1e293b" stroke="#a855f7" stroke-width="2" rx="8"/>
      <text x="660" y="120" fill="#d8b4fe" font-size="14" font-weight="bold" text-anchor="middle">PostgreSQL HA Cluster</text>
      <text x="660" y="145" fill="#94a3b8" font-size="11" text-anchor="middle">Patroni Streaming Replica</text>
      <line x1="230" y1="125" x2="310" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4"/>
      <line x1="490" y1="125" x2="570" y2="125" stroke="#64748b" stroke-width="2" stroke-dasharray="4"/>
    </svg>`;
    fs.writeFileSync(svgPath, svgContent, 'utf-8');

    // Sample file 2: SOC-2 Compliance Matrix (Markdown)
    const mdPath = path.join(uploadsDir, 'soc2-compliance-matrix.md');
    const mdContent = `# SOC-2 Type II Trust Services Criteria Matrix

| Control Ref | Principle | Mechanism | Status | Automated Test |
|---|---|---|---|---|
| CC6.1 | Logical Access | Okta SAML 2.0 + MFA enforcement | PASS | \`npm run test:auth\` |
| CC6.6 | Encryption In-Transit | TLS 1.3 Strict ECDHE-RSA-AES256-GCM | PASS | Qualys SSL Grade A+ |
| CC6.7 | Encryption At-Rest | AWS KMS AES-256 Envelope Key | PASS | Terraform Sentinel |
| CC7.2 | Vulnerability Scanning | Trivy + Snyk Container Scan on CI | PASS | GitHub Actions PR Gate |
| CC8.1 | Change Management | 2-approver branch protection rules | PASS | Branch Policy Audit |
`;
    fs.writeFileSync(mdPath, mdContent, 'utf-8');

    // Sample file 3: API Specification (JSON)
    const jsonPath = path.join(uploadsDir, 'openapi-v3-spec.json');
    const jsonContent = JSON.stringify({
      openapi: '3.0.3',
      info: { title: 'DevBlueprint Enterprise Core API', version: '2.5.0' },
      servers: [{ url: 'https://api.devblueprint.io/v1' }],
      paths: {
        '/health': { get: { summary: 'System Health Check', responses: { '200': { description: 'Healthy' } } } }
      }
    }, null, 2);
    fs.writeFileSync(jsonPath, jsonContent, 'utf-8');

    // Create FileItem records in DB
    const file1 = await prisma.fileItem.create({
      data: {
        workspaceId,
        projectId: p1,
        folderId: f1.id,
        uploaderId: ownerUser.id,
        name: 'System-Architecture-Topology-v2.svg',
        originalName: 'system-architecture.svg',
        mimeType: 'image/svg+xml',
        extension: 'svg',
        sizeBytes: Buffer.byteLength(svgContent),
        storagePath: svgPath,
        storageType: 'LOCAL'
      }
    });

    const file2 = await prisma.fileItem.create({
      data: {
        workspaceId,
        projectId: p1,
        folderId: f2.id,
        uploaderId: adminUser.id,
        name: 'SOC2-Type-II-Compliance-Matrix.md',
        originalName: 'soc2-compliance-matrix.md',
        mimeType: 'text/markdown',
        extension: 'md',
        sizeBytes: Buffer.byteLength(mdContent),
        storagePath: mdPath,
        storageType: 'LOCAL'
      }
    });

    const file3 = await prisma.fileItem.create({
      data: {
        workspaceId,
        projectId: p1,
        folderId: fSub.id,
        uploaderId: editorUser.id,
        name: 'OpenAPI-v3-Specifications.json',
        originalName: 'openapi-v3-spec.json',
        mimeType: 'application/json',
        extension: 'json',
        sizeBytes: Buffer.byteLength(jsonContent),
        storagePath: jsonPath,
        storageType: 'LOCAL'
      }
    });

    console.log(`Created 4 folders and 3 files: ${file1.name}, ${file2.name}, ${file3.name}`);
  }

  console.log('Seeding of Files and RFCs completed successfully.');
}

seedFilesAndRFCs()
  .then(() => process.exit(0))
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });
