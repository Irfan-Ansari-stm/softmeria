import { SeedTemplateDoc } from '../../types/seed.types';
import { DocumentStatus } from '@prisma/client';

export const securityTemplates: SeedTemplateDoc[] = [
  {
    id: '09-security-policy',
    fileName: 'SECURITY-POLICY.md',
    relativePath: 'docs/09-security/SECURITY-POLICY.md',
    title: 'Organizational Security Policy',
    description: 'Vulnerability disclosure policy, reporting channels, and response SLAs.',
    categorySlug: '09-security',
    initialStatus: DocumentStatus.APPROVED,
    isRequired: true,
    tags: ['security', 'policy', 'compliance'],
    version: '1.0.0',
    content: `# Organizational Security Policy: [PROJECT_NAME]

---

## 1. Vulnerability Reporting
If you discover a security vulnerability, please report it immediately to \`security@example.com\`. Do not open public GitHub issues.

## 2. Response SLAs
- **Critical (RCE, Auth Bypass):** Initial response within 4 hours, patch within 24 hours.
- **High (Data Leak):** Initial response within 12 hours, patch within 48 hours.
- **Medium (CSRF, XSS):** Patch within 7 business days.
`
  },
  {
    id: '09-owasp-checklist',
    fileName: 'OWASP-CHECKLIST.md',
    relativePath: 'docs/09-security/OWASP-CHECKLIST.md',
    title: 'OWASP Top 10 Security Checklist',
    description: 'Audit verification against the OWASP Top 10 web application vulnerabilities.',
    categorySlug: '09-security',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['security', 'owasp', 'audit'],
    version: '1.0.0',
    content: `# OWASP Top 10 Security Checklist

- [x] **A01: Broken Access Control:** Enforced via RBAC middleware on every mutating API endpoint.
- [x] **A02: Cryptographic Failures:** Passwords hashed with bcrypt (cost 10); HTTPS required in production.
- [x] **A03: Injection:** SQL injection eliminated through parameterized Prisma queries; markdown sanitized.
- [x] **A04: Insecure Design:** Multi-tenancy isolated by design with composite workspace constraints.
- [x] **A05: Security Misconfiguration:** Helmet middleware sets CSP, HSTS, and frame protection.
- [x] **A07: Identification and Authentication Failures:** Rate limiting on login and refresh endpoints.
`
  },
  {
    id: '09-auth-security',
    fileName: 'AUTH-SECURITY.md',
    relativePath: 'docs/09-security/AUTH-SECURITY.md',
    title: 'Authentication Security & Hardening',
    description: 'Password policies, brute-force lockout, and cookie security flags.',
    categorySlug: '09-security',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['security', 'auth', 'hardening'],
    version: '1.0.0',
    content: `# Authentication Security & Hardening

- Password requirements: minimum 8 characters, at least 1 uppercase letter, 1 number, and 1 symbol.
- Brute-force protection: 5 consecutive failed attempts trigger a 15-minute temporary lockout.
- Cookies configured with \`HttpOnly\`, \`Secure\`, \`SameSite=Lax\`.
`
  },
  {
    id: '09-data-privacy',
    fileName: 'DATA-PRIVACY.md',
    relativePath: 'docs/09-security/DATA-PRIVACY.md',
    title: 'Data Privacy & Compliance (GDPR / CCPA)',
    description: 'Data protection policies, user deletion workflows, and encryption standards.',
    categorySlug: '09-security',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['security', 'privacy', 'gdpr'],
    version: '1.0.0',
    content: `# Data Privacy & Compliance (GDPR / CCPA)

- **Right to Erasure:** Deleting an account anonymizes activity logs and deletes personal records.
- **Data in Transit:** TLS 1.3 enforced for all client and internal communications.
- **Data at Rest:** Encrypted volumes (AES-256) used on all database servers.
`
  },
  {
    id: '09-secrets-management',
    fileName: 'SECRETS-MANAGEMENT.md',
    relativePath: 'docs/09-security/SECRETS-MANAGEMENT.md',
    title: 'Secrets Management & Key Rotation',
    description: 'Environment variable handling, secret scanners, and credential rotation.',
    categorySlug: '09-security',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['security', 'secrets', 'credentials'],
    version: '1.0.0',
    content: `# Secrets Management & Key Rotation

- Secrets are never committed to version control; \`.env\` files are in \`.gitignore\`.
- Pre-commit hooks run secret scanners (GitGuardian / TruffleHog) on all staged commits.
- JWT signing keys rotated every 90 days.
`
  },
  {
    id: '09-rate-limiting',
    fileName: 'RATE-LIMITING.md',
    relativePath: 'docs/09-security/RATE-LIMITING.md',
    title: 'Rate Limiting & Abuse Prevention',
    description: 'Sliding window rate limiters for auth endpoints and public APIs.',
    categorySlug: '09-security',
    initialStatus: DocumentStatus.DRAFT,
    isRequired: true,
    tags: ['security', 'rate-limiting', 'ddos'],
    version: '1.0.0',
    content: `# Rate Limiting & Abuse Prevention

- **Auth Endpoints (\`/api/v1/auth/*\`):** 10 requests per minute per IP.
- **General API Endpoints:** 200 requests per minute per authenticated user token.
- Returns HTTP \`429 Too Many Requests\` with \`Retry-After\` header when limits are exceeded.
`
  }
];
