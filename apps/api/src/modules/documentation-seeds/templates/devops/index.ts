import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const devopsTemplates: SeedTemplateDoc[] = [
  {
    id: '11-ci-cd-pipeline',
    fileName: 'CI-CD-PIPELINE.md',
    relativePath: 'docs/11-devops/CI-CD-PIPELINE.md',
    title: 'CI/CD Pipeline Architecture & Stages',
    description: 'Automated continuous integration and deployment stages from pull request to production.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'ci-cd', 'automation'],
    version: '1.0.0',
    content: `# CI/CD Pipeline Architecture: [PROJECT_NAME]

---

## 1. Pipeline Stages

\`\`\`mermaid
flowchart LR
    Commit["Git Push / PR"] --> Lint["1. Lint & Typecheck"]
    Lint --> Test["2. Unit & Integration Tests"]
    Test --> Build["3. Build Next.js & API"]
    Build --> Scan["4. Container Vulnerability Scan"]
    Scan --> Deploy["5. Zero-Downtime Rollout ([DEPLOYMENT_PROVIDER])"]
\`\`\`

All branches must pass stages 1 through 3. Main branch automatically triggers staging deployment and production promotion upon manual approval.
`
  },
  {
    id: '11-github-actions',
    fileName: 'GITHUB-ACTIONS.md',
    relativePath: 'docs/11-devops/GITHUB-ACTIONS.md',
    title: 'GitHub Actions Workflows',
    description: 'Workflow YAML specifications, caching strategies, and environment secrets.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'github-actions', 'workflows'],
    version: '1.0.0',
    content: `# GitHub Actions Workflows

Workflows located in \`.github/workflows/\`:
- \`ci.yml\`: Runs on every push/PR to validate formatting, TypeScript types, and test suites.
- \`deploy.yml\`: Deploys production images on new semantic version tags.
`
  },
  {
    id: '11-docker-setup',
    fileName: 'DOCKER-SETUP.md',
    relativePath: 'docs/11-devops/DOCKER-SETUP.md',
    title: 'Production Docker Containerization',
    description: 'Multi-stage Dockerfiles for Next.js web application and Express API service.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'docker', 'containers'],
    version: '1.0.0',
    content: `# Production Docker Containerization

Multi-stage Docker builds:
1. **Deps Stage:** Installs cached production dependencies.
2. **Build Stage:** Compiles TypeScript and Next.js static assets.
3. **Runner Stage:** Minimal Alpine/Debian-slim image running as non-root \`nodejs\` user.
`
  },
  {
    id: '11-docker-compose',
    fileName: 'DOCKER-COMPOSE.md',
    relativePath: 'docs/11-devops/DOCKER-COMPOSE.md',
    title: 'Local Development with Docker Compose',
    description: 'Local multi-service development setup: PostgreSQL, Redis, API, and Web.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'docker-compose', 'local-dev'],
    version: '1.0.0',
    content: `# Local Development with Docker Compose

\`docker-compose.yml\` provisions:
- \`postgres\`: PostgreSQL 15 on port 5432 with persistent volume.
- \`redis\`: Redis 7 on port 6379 for session and task queues.
`
  },
  {
    id: '11-environment-configuration',
    fileName: 'ENVIRONMENT-CONFIGURATION.md',
    relativePath: 'docs/11-devops/ENVIRONMENT-CONFIGURATION.md',
    title: 'Environment Variables & Configuration Matrix',
    description: 'Specification of all environment variables across Local, Staging, and Production.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'env', 'config'],
    version: '1.0.0',
    content: `# Environment Variables & Configuration Matrix

| Variable | Description | Required in Prod? |
|---|---|---|
| \`DATABASE_URL\` | Relational connection string to [PROJECT_DATABASE] | Yes |
| \`JWT_SECRET\` | High-entropy secret for signing access tokens | Yes |
| \`NEXT_PUBLIC_API_URL\` | Public API domain accessible by web clients | Yes |
| \`CORS_ORIGIN\` | Permitted frontend origins | Yes |
`
  },
  {
    id: '11-deployment-guide',
    fileName: 'DEPLOYMENT-GUIDE.md',
    relativePath: 'docs/11-devops/DEPLOYMENT-GUIDE.md',
    title: 'Production Deployment Runbook',
    description: 'Step-by-step production rollout guide, health check gates, and DNS cutover.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['devops', 'deployment', 'runbook'],
    version: '1.0.0',
    content: `# Production Deployment Runbook

1. Verify all pre-merge tests pass in CI.
2. Execute database migrations (\`npx prisma migrate deploy\`).
3. Deploy new container tasks to [DEPLOYMENT_PROVIDER].
4. Verify \`/health\` endpoint returns 200 OK before routing production traffic.
`
  },
  {
    id: '11-infrastructure',
    fileName: 'INFRASTRUCTURE.md',
    relativePath: 'docs/11-devops/INFRASTRUCTURE.md',
    title: 'Infrastructure as Code & Cloud Topology',
    description: 'VPC network topology, subnets, load balancing, and managed cloud services.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'infrastructure', 'cloud'],
    version: '1.0.0',
    content: `# Infrastructure as Code & Cloud Topology

Infrastructure managed via Terraform / Pulumi:
- Private subnets for database and cache instances.
- Public subnets for load balancers.
- Web Application Firewall (WAF) blocking common malicious bots and rate abusers.
`
  },
  {
    id: '11-release-management',
    fileName: 'RELEASE-MANAGEMENT.md',
    relativePath: 'docs/11-devops/RELEASE-MANAGEMENT.md',
    title: 'Release Management & Semantic Versioning',
    description: 'SemVer release cadence, release notes generation, and Git tagging conventions.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['devops', 'releases', 'semver'],
    version: '1.0.0',
    content: `# Release Management & Semantic Versioning

- Releases follow Semantic Versioning (\`v<Major>.<Minor>.<Patch>\`).
- Automated changelog extraction from conventional commit history.
`
  },
  {
    id: '11-rollback-strategy',
    fileName: 'ROLLBACK-STRATEGY.md',
    relativePath: 'docs/11-devops/ROLLBACK-STRATEGY.md',
    title: 'Emergency Rollback Procedures',
    description: 'Step-by-step incident rollbacks for application containers and database schemas.',
    categorySlug: '11-devops',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['devops', 'rollback', 'emergency'],
    version: '1.0.0',
    content: `# Emergency Rollback Procedures

If a critical issue is discovered post-deployment:
1. Revert container task definition in [DEPLOYMENT_PROVIDER] to previous known good image tag.
2. If database migration was applied, follow backward-compatible migration reversal steps.
3. Notify team in incident response channel.
`
  }
];
