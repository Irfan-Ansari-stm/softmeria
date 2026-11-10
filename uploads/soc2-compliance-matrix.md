# SOC-2 Type II Trust Services Criteria Matrix

| Control Ref | Principle | Mechanism | Status | Automated Test |
|---|---|---|---|---|
| CC6.1 | Logical Access | Okta SAML 2.0 + MFA enforcement | PASS | `npm run test:auth` |
| CC6.6 | Encryption In-Transit | TLS 1.3 Strict ECDHE-RSA-AES256-GCM | PASS | Qualys SSL Grade A+ |
| CC6.7 | Encryption At-Rest | AWS KMS AES-256 Envelope Key | PASS | Terraform Sentinel |
| CC7.2 | Vulnerability Scanning | Trivy + Snyk Container Scan on CI | PASS | GitHub Actions PR Gate |
| CC8.1 | Change Management | 2-approver branch protection rules | PASS | Branch Policy Audit |
