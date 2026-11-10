import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const backendTemplates: SeedTemplateDoc[] = [
  {
    id: '07-backend-guidelines',
    fileName: 'BACKEND-GUIDELINES.md',
    relativePath: 'docs/07-backend/BACKEND-GUIDELINES.md',
    title: 'Backend Engineering Standards',
    description: 'Node.js/Express standards, error handling patterns, and service architecture.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'nodejs', 'standards'],
    version: '1.0.0',
    content: `# Backend Engineering Standards: [PROJECT_NAME]

- **Async/Await:** All asynchronous code must use async/await with centralized error handling.
- **Explicit Typings:** All controllers, services, and repository functions must declare parameter and return types.
- **Fail Fast:** Validate payload inputs at the route entry point before invoking services.
`
  },
  {
    id: '07-project-structure',
    fileName: 'PROJECT-STRUCTURE.md',
    relativePath: 'docs/07-backend/PROJECT-STRUCTURE.md',
    title: 'Backend Modular Directory Structure',
    description: 'Feature modules, controllers, services, validators, and route registration.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'structure', 'architecture'],
    version: '1.0.0',
    content: `# Backend Modular Directory Structure

\`\`\`text
apps/api/src/
├── config/       # Environment variables, database client instance
├── middleware/   # Auth, error handling, rate limiting, logging
├── modules/      # Feature modules (auth, projects, documents, etc.)
│   └── [feature]/
│       ├── [feature].controller.ts
│       ├── [feature].service.ts
│       ├── [feature].routes.ts
│       └── [feature].validator.ts
├── routes/       # Central route aggregator (/api/v1)
└── utils/        # Errors, slugify, token generation
\`\`\`
`
  },
  {
    id: '07-api-design',
    fileName: 'API-DESIGN.md',
    relativePath: 'docs/07-backend/API-DESIGN.md',
    title: 'REST API Design & Contract Standards',
    description: 'Endpoint naming, HTTP methods, JSON envelopes, and status code standards.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'api', 'rest'],
    version: '1.0.0',
    content: `# REST API Design & Contract Standards

## 1. Unified Response Envelope
All API responses follow the standard envelope format:

\`\`\`json
{
  "success": true,
  "data": { ... },
  "message": "Optional human-readable description",
  "meta": {
    "page": 1,
    "limit": 20,
    "total": 100
  }
}
\`\`\`

## 2. HTTP Status Code Conventions
- \`200 OK\`: Successful fetch or non-creation mutation.
- \`201 Created\`: Successful resource creation.
- \`400 Bad Request\`: Payload failed schema validation.
- \`401 Unauthorized\`: Missing or expired authentication token.
- \`403 Forbidden\`: Authenticated user lacks permission.
- \`404 Not Found\`: Resource does not exist.
- \`409 Conflict\`: Resource collision (e.g. duplicate slug or email).
- \`500 Internal Server Error\`: Unexpected server exception.
`
  },
  {
    id: '07-api-documentation',
    fileName: 'API-DOCUMENTATION.md',
    relativePath: 'docs/07-backend/API-DOCUMENTATION.md',
    title: 'OpenAPI Specification & Documentation',
    description: 'Swagger/OpenAPI 3.0 generation, endpoint specs, and live documentation.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'openapi', 'swagger'],
    version: '1.0.0',
    content: `# OpenAPI Specification & Documentation

API endpoints are documented using OpenAPI 3.0 standards, documenting request parameters, request body schemas, and response status codes.
`
  },
  {
    id: '07-authentication',
    fileName: 'AUTHENTICATION.md',
    relativePath: 'docs/07-backend/AUTHENTICATION.md',
    title: 'Authentication & Session Architecture',
    description: 'JWT access tokens, refresh token rotation, cookie security, and password hashing.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'auth', 'jwt', 'security'],
    version: '1.0.0',
    content: `# Authentication & Session Architecture

- **Access Tokens:** Short-lived JWT (15 minutes expiry) signed with RS256 / HS256 containing user ID and workspace context.
- **Refresh Tokens:** Long-lived tokens (7-30 days) stored as SHA-256 hashes in the database \`Session\` table, delivered via \`HttpOnly\`, \`Secure\`, \`SameSite=Lax\` cookies.
- **Rotation:** Refreshing an access token automatically invalidates the old refresh token and issues a new one.
`
  },
  {
    id: '07-authorization',
    fileName: 'AUTHORIZATION.md',
    relativePath: 'docs/07-backend/AUTHORIZATION.md',
    title: 'Role-Based Access Control (RBAC)',
    description: 'Permission enforcement matrices across Owner, Admin, Editor, and Viewer roles.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'rbac', 'permissions'],
    version: '1.0.0',
    content: `# Role-Based Access Control (RBAC)

RBAC middleware verifies permissions before controller invocation:
- \`requireWorkspaceRole(UserRole.ADMIN)\`: Ensures user is Owner or Admin in the target workspace.
- \`requireProjectAccess(projectId)\`: Ensures user belongs to the project or parent workspace.
`
  },
  {
    id: '07-middleware',
    fileName: 'MIDDLEWARE.md',
    relativePath: 'docs/07-backend/MIDDLEWARE.md',
    title: 'Middleware Architecture & Pipeline',
    description: 'Execution sequence: Helmet, CORS, Morgan, Body Parser, Auth, Rate Limiter.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'middleware', 'pipeline'],
    version: '1.0.0',
    content: `# Middleware Architecture & Pipeline

Middleware executes sequentially:
1. \`helmet\`: Security headers
2. \`cors\`: Origin validation
3. \`morgan\`: HTTP request logging
4. \`express.json\`: Body parsing with 10MB limit
5. \`cookieParser\`: Cookie parsing
6. \`authMiddleware\`: JWT verification
7. \`errorHandler\`: Centralized error handling
`
  },
  {
    id: '07-business-logic',
    fileName: 'BUSINESS-LOGIC.md',
    relativePath: 'docs/07-backend/BUSINESS-LOGIC.md',
    title: 'Business Logic & Service Layer Patterns',
    description: 'Domain services, transactional integrity, and decoupling from HTTP controllers.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'services', 'domain'],
    version: '1.0.0',
    content: `# Business Logic & Service Layer Patterns

Controllers are thin adapters. All business logic, authorization verification, data mutation, and activity logging must live inside dedicated Service classes.
`
  },
  {
    id: '07-error-handling',
    fileName: 'ERROR-HANDLING.md',
    relativePath: 'docs/07-backend/ERROR-HANDLING.md',
    title: 'Centralized Error Handling Architecture',
    description: 'Custom exception hierarchy (NotFoundError, ConflictError) and error formatting.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'errors', 'exceptions'],
    version: '1.0.0',
    content: `# Centralized Error Handling Architecture

AppError class hierarchy:
- \`BadRequestError\` (400)
- \`UnauthorizedError\` (401)
- \`ForbiddenError\` (403)
- \`NotFoundError\` (404)
- \`ConflictError\` (409)

The global error handler intercepts these classes and converts them into standardized JSON error responses with status codes.
`
  },
  {
    id: '07-logging',
    fileName: 'LOGGING.md',
    relativePath: 'docs/07-backend/LOGGING.md',
    title: 'Structured Logging & Telemetry',
    description: 'JSON log formatting, correlation IDs, log levels, and PII sanitization.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'logging', 'observability'],
    version: '1.0.0',
    content: `# Structured Logging & Telemetry

Logs are output as structured JSON including timestamp, log level (info, warn, error), correlation ID (\`req.id\`), duration in milliseconds, and sanitized metadata. Passwords, tokens, and PII are redacted.
`
  },
  {
    id: '07-background-jobs',
    fileName: 'BACKGROUND-JOBS.md',
    relativePath: 'docs/07-backend/BACKGROUND-JOBS.md',
    title: 'Asynchronous Background Jobs & Queues',
    description: 'Task queues for archive generation, email delivery, and periodic cleanups.',
    categorySlug: '07-backend',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['backend', 'queues', 'background-jobs'],
    version: '1.0.0',
    content: `# Asynchronous Background Jobs & Queues

Heavy workloads (ZIP archive compression, webhook delivery, email dispatch) run asynchronously via task queues (BullMQ / PgBoss) with retry logic and exponential backoff.
`
  }
];
