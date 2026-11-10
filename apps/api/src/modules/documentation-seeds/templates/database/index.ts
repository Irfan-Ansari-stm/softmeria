import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const databaseTemplates: SeedTemplateDoc[] = [
  {
    id: '08-database-schema',
    fileName: 'DATABASE-SCHEMA.md',
    relativePath: 'docs/08-database/DATABASE-SCHEMA.md',
    title: 'Database Schema & Entity-Relationship Model',
    description: 'Relational database schema, entity definitions, and complete Mermaid ER diagram.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'schema', 'er-diagram', 'prisma'],
    version: '1.0.0',
    content: `# Database Schema & Entity-Relationship Model: [PROJECT_NAME]

---

## 1. Entity-Relationship Diagram

\`\`\`mermaid
erDiagram
    User ||--o{ Workspace : owns
    User ||--o{ WorkspaceMember : belongs_to
    User ||--o{ Project : creates
    User ||--o{ Document : authors
    User ||--o{ DocumentVersion : snapshots
    
    Workspace ||--o{ WorkspaceMember : contains
    Workspace ||--o{ Project : isolates
    Workspace ||--o{ Template : registers
    
    Project ||--o{ Category : groups
    Project ||--o{ Document : contains
    Project ||--o{ ProjectMember : assigns
    
    Category ||--o{ Document : organizes
    Category ||--o{ Category : nests
    
    Document ||--o{ DocumentVersion : archives
    Document ||--o{ Comment : receives
    Document ||--o{ ReviewRequest : requests
\`\`\`

---

## 2. Core Tables Overview

- **User:** Authentication credentials, profile name, email, avatar URL.
- **Workspace:** Multi-tenant organization boundaries, slug, owner.
- **Project:** Software development workspaces containing blueprints.
- **Category:** Numbered hierarchical categories organizing project documents.
- **Document:** Markdown content, current version, status, sort order.
- **DocumentVersion:** Historical snapshot history of edited documents.
`
  },
  {
    id: '08-data-models',
    fileName: 'DATA-MODELS.md',
    relativePath: 'docs/08-database/DATA-MODELS.md',
    title: 'Data Model Specifications',
    description: 'Field-level definitions, types, default values, and column constraints.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'models', 'types'],
    version: '1.0.0',
    content: `# Data Model Specifications

Detailed field specifications for all Prisma models:
- **UUIDs:** Primary keys are generated as UUIDv4 strings.
- **Timestamps:** Every model includes \`createdAt\` and \`updatedAt\` tracking.
- **Enums:** Status fields utilize database-level ENUM types (\`DocumentStatus\`, \`ProjectStatus\`, \`UserRole\`).
`
  },
  {
    id: '08-relationships',
    fileName: 'RELATIONSHIPS.md',
    relativePath: 'docs/08-database/RELATIONSHIPS.md',
    title: 'Relational Cardinality & Cascade Rules',
    description: 'Foreign key constraints, one-to-many mappings, and cascading deletion policies.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'relations', 'cascade'],
    version: '1.0.0',
    content: `# Relational Cardinality & Cascade Rules

- **Workspace Deletion:** Cascades to all child Projects, Categories, Documents, and Members.
- **Project Deletion:** Cascades to all child Categories and Documents.
- **User Deletion:** Restricted if user owns active workspaces; reassignment required prior to deletion.
`
  },
  {
    id: '08-migrations',
    fileName: 'MIGRATIONS.md',
    relativePath: 'docs/08-database/MIGRATIONS.md',
    title: 'Database Migration Runbook',
    description: 'Prisma migration workflow, zero-downtime deployment, and rollback safety.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'migrations', 'deployments'],
    version: '1.0.0',
    content: `# Database Migration Runbook

1. **Development:** Generate migrations using \`npx prisma migrate dev --name <migration_name>\`.
2. **Production Deploy:** Apply pending migrations via \`npx prisma migrate deploy\` during the release pipeline.
3. **Zero-Downtime Rule:** Always use the expand-and-contract pattern when renaming or removing columns.
`
  },
  {
    id: '08-indexing',
    fileName: 'INDEXING.md',
    relativePath: 'docs/08-database/INDEXING.md',
    title: 'Database Indexing Strategy',
    description: 'B-tree index configuration, multi-tenant composite keys, and query paths.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'indexes', 'performance'],
    version: '1.0.0',
    content: `# Database Indexing Strategy

Critical composite indexes:
- \`Project(workspaceId, slug)\`: Fast project routing.
- \`Document(projectId, sortOrder)\`: Fast sidebar tree ordering.
- \`Document(status, isOptional)\`: Fast progress calculation queries.
`
  },
  {
    id: '08-query-optimization',
    fileName: 'QUERY-OPTIMIZATION.md',
    relativePath: 'docs/08-database/QUERY-OPTIMIZATION.md',
    title: 'Query Optimization & N+1 Prevention',
    description: 'Prisma relation fetching patterns, select pruning, and connection pooling.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['database', 'queries', 'optimization'],
    version: '1.0.0',
    content: `# Query Optimization & N+1 Prevention

- Always specify explicit \`select\` or \`include\` clauses to prevent over-fetching large text content fields when listing summaries.
- Use \`count\` queries with indexed criteria rather than fetching full arrays into memory for tally calculations.
`
  },
  {
    id: '08-backup-restore',
    fileName: 'BACKUP-RESTORE.md',
    relativePath: 'docs/08-database/BACKUP-RESTORE.md',
    title: 'Database Backup & Disaster Recovery',
    description: 'Automated pg_dump snapshots, point-in-time recovery (PITR), and restore drill procedures.',
    categorySlug: '08-database',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['database', 'backup', 'dr', 'recovery'],
    version: '1.0.0',
    content: `# Database Backup & Disaster Recovery

- **Snapshots:** Daily automated backups stored in encrypted object storage with 30-day retention.
- **RTO / RPO:** Target RTO < 1 hour, target RPO < 15 minutes.
- **Restore Drills:** Bi-monthly automated restoration verification in staging environments.
`
  }
];
