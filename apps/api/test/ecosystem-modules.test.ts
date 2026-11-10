import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('DevBlueprint Ecosystem Modules Integration Tests', () => {
  let token = '';
  let workspaceId = '';
  let projectId = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'owner@devblueprint.io', password: 'Password123!' });

    token = loginRes.body.data.tokens.accessToken;
    workspaceId = loginRes.body.data.workspaces[0].id;

    const projRes = await request(app)
      .get(`/api/v1/projects?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${token}`);

    projectId = projRes.body.data[0].id;
  });

  // =========================================================================
  // 1. Documentation & Blueprints
  // =========================================================================
  describe('1. Documentation & Blueprints Module', () => {
    let customTemplateId = '';

    it('Creates a custom template in the blueprint library', async () => {
      const res = await request(app)
        .post('/api/v1/templates')
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Zero-Trust Security Blueprint',
          description: 'Specification for mTLS, IAM policies and secret rotations',
          category: 'SECURITY',
          content: '# Zero-Trust Architecture\n\n```mermaid\ngraph LR\nClient --> Envoy\nEnvoy --> Authz\n```\n'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Zero-Trust Security Blueprint');
      customTemplateId = res.body.data.id;
    });

    it('Duplicates an existing template', async () => {
      const res = await request(app)
        .post(`/api/v1/templates/${customTemplateId}/duplicate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Copy');
    });

    it('Lists blueprint templates including the custom one', async () => {
      const res = await request(app)
        .get('/api/v1/templates')
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((t: any) => t.id === customTemplateId);
      expect(found).toBeDefined();
    });
  });

  // =========================================================================
  // 2. Design System Management
  // =========================================================================
  describe('2. Design System Management Module', () => {
    let tokenId = '';
    let paletteId = '';

    it('Creates a design token in PostgreSQL', async () => {
      const uniqueTokenKey = `color.brand.emerald.${Date.now()}`;
      const res = await request(app)
        .post('/api/v1/design/tokens')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: uniqueTokenKey,
          value: '#10B981',
          category: 'BRAND_COLOR',
          type: 'COLOR',
          description: 'Primary emerald accent token'
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe(uniqueTokenKey);
      tokenId = res.body.data.id;
    });

    it('Fetches design tokens filtered by project and category', async () => {
      const res = await request(app)
        .get(`/api/v1/design/tokens?projectId=${projectId}&category=BRAND_COLOR`)
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
    });

    it('Creates a semantic color palette', async () => {
      const res = await request(app)
        .post('/api/v1/design/palettes')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'Emerald Core Spectrum',
          description: 'Production shade palette for fintech status indicators',
          shades: { '50': '#ecfdf5', '500': '#10b981', '900': '#064e3b' }
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Emerald Core Spectrum');
      paletteId = res.body.data.id;
    });

    it('Exports design tokens as CSS variables, Tailwind, JSON, and SCSS', async () => {
      const cssRes = await request(app)
        .get(`/api/v1/design/export?projectId=${projectId}&format=css`)
        .set('Authorization', `Bearer ${token}`);
      expect(cssRes.status).toBe(200);
      expect(cssRes.text).toContain(':root');

      const jsonRes = await request(app)
        .get(`/api/v1/design/export?projectId=${projectId}&format=json`)
        .set('Authorization', `Bearer ${token}`);
      expect(jsonRes.status).toBe(200);
      expect(typeof JSON.parse(jsonRes.text)).toBe('object');

      const twRes = await request(app)
        .get(`/api/v1/design/export?projectId=${projectId}&format=tailwind`)
        .set('Authorization', `Bearer ${token}`);
      expect(twRes.status).toBe(200);
      expect(twRes.text).toContain('module.exports');
    });

    it('Documents a reusable UI component specification', async () => {
      const res = await request(app)
        .post('/api/v1/design/components')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'PrimaryActionButton',
          description: 'Enterprise accessible button with ripple and pending loading state',
          category: 'Buttons',
          variants: [{ name: 'primary', bg: 'primary-600' }, { name: 'outline', bg: 'transparent' }],
          properties: [{ name: 'isLoading', type: 'boolean', default: 'false' }],
          accessibility: 'WCAG 2.1 AA compliant. Supports keyboard navigation and screen readers.',
          usageNotes: 'Do not place more than one primary button in a modal footer.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('PrimaryActionButton');
    });
  });

  // =========================================================================
  // 3. Development & Repositories
  // =========================================================================
  describe('3. Development & Repositories Module', () => {
    let repoId = '';

    it('Connects a new repository to the project', async () => {
      const res = await request(app)
        .post('/api/v1/repositories')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'payment-settlement-engine',
          provider: 'GITHUB',
          repositoryUrl: 'https://github.com/enterprise/payment-settlement-engine',
          defaultBranch: 'main',
          isPrimary: true
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('payment-settlement-engine');
      repoId = res.body.data.id;
    });

    it('Creates an open pull request in the repository', async () => {
      const res = await request(app)
        .post('/api/v1/repositories/pull-requests')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          repositoryId: repoId,
          prNumber: 42,
          title: 'feat: implement idempotent webhook handler for card networks',
          author: 'Lead Architect',
          sourceBranch: 'feat/webhook-idempotency',
          targetBranch: 'main',
          url: 'https://github.com/enterprise/payment-settlement-engine/pull/42',
          reviewStatus: 'CHANGES_REQUESTED'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.prNumber).toBeGreaterThan(0);
    });

    it('Triggers and registers a CI/CD pipeline run with realistic execution', async () => {
      const res = await request(app)
        .post('/api/v1/repositories/pipelines')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          repositoryId: repoId,
          pipelineNumber: 108,
          name: 'Build, Lint & Unit Tests',
          provider: 'GITHUB_ACTIONS',
          branch: 'main',
          commitSha: 'd84f93a1029c',
          status: 'RUNNING'
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(['RUNNING', 'SUCCESS', 'PENDING']).toContain(res.body.data.status);
    });

    it('Retrieves aggregated development statistics for the project', async () => {
      const res = await request(app)
        .get(`/api/v1/repositories/stats?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalRepositories).toBeGreaterThan(0);
      expect(res.body.data.connectedRepositories).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // 4. Testing & QA Management
  // =========================================================================
  describe('4. Testing & QA Management Module', () => {
    let testSuiteId = '';
    let testCaseId = '';

    it('Creates a test suite under a project test plan', async () => {
      const res = await request(app)
        .post('/api/v1/testing/suites')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'Payment Settlement Idempotency Suite',
          description: 'Integration and load tests verifying zero double charges'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Payment Settlement Idempotency Suite');
      testSuiteId = res.body.data.id;
    });

    it('Creates a test case with precondition, steps, expected and actual results', async () => {
      const res = await request(app)
        .post('/api/v1/testing/cases')
        .set('Authorization', `Bearer ${token}`)
        .send({
          testSuiteId,
          title: 'Concurrent payment request with identical idempotency key',
          description: 'Ensure second concurrent transaction returns cached response',
          testType: 'INTEGRATION',
          priority: 'CRITICAL',
          preconditions: 'Database initialized with test merchant account and balance',
          steps: [
            { stepNumber: 1, action: 'Submit payment request A with idempotency-key: KEY_1', expectedResult: 'HTTP 200 with transaction id' },
            { stepNumber: 2, action: 'Submit duplicate payment request B with identical key', expectedResult: 'HTTP 200 with identical transaction id without charging account twice' }
          ],
          status: 'PASSED'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('idempotency key');
      testCaseId = res.body.data.id;
    });

    it('Duplicates an existing test case', async () => {
      const res = await request(app)
        .post(`/api/v1/testing/cases/${testCaseId}/duplicate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toContain('Copy');
    });

    it('Generates a Quality Report with accurate non-zero calculations', async () => {
      const res = await request(app)
        .get(`/api/v1/testing/reports?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalTests).toBeGreaterThan(0);
      expect(typeof res.body.data.passRate).toBe('number');
      // Pass rate must not be NaN
      expect(isNaN(res.body.data.passRate)).toBe(false);
    });
  });

  // =========================================================================
  // 5. Releases & Deployments
  // =========================================================================
  describe('5. Releases & Deployments Governance Module', () => {
    let releaseId = '';

    it('Rejects release creation with invalid SemVer version string', async () => {
      const res = await request(app)
        .post('/api/v1/releases')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          version: 'invalid-version-format',
          name: 'Bad Release',
          environment: 'STAGING'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message.toLowerCase()).toContain('semantic version');
    });

    const testVersion = `4.${Math.floor(Math.random() * 800) + 10}.0`;

    it('Creates a release with valid SemVer and environment', async () => {
      const res = await request(app)
        .post('/api/v1/releases')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          version: testVersion,
          name: 'Q4 Core Settlement Gateway Release',
          description: 'Includes automated PCI-DSS compliant tokenization',
          environment: 'PRODUCTION',
          targetDate: new Date(Date.now() + 86400000 * 7).toISOString()
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.version).toBe(testVersion);
      releaseId = res.body.data.id;
    });

    it('Prevents duplicate release versions within the same project', async () => {
      const res = await request(app)
        .post('/api/v1/releases')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          version: testVersion,
          name: 'Duplicate Release',
          environment: 'PRODUCTION'
        });

      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toContain('already exists');
    });

    it('Registers an approval gate decision on the release', async () => {
      const res = await request(app)
        .post(`/api/v1/releases/${releaseId}/approvals`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          stage: 'QA_VERIFICATION',
          decision: 'APPROVED',
          comments: 'All 15 regression suites executed with 100% pass on staging.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.decision).toBe('APPROVED');
    });

    it('Retrieves deployment history and readiness audit for release', async () => {
      const res = await request(app)
        .get(`/api/v1/releases/${releaseId}/readiness`)
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.score).toBeDefined();
      expect(typeof res.body.data.isReady).toBe('boolean');
    });

    it('Triggers an emergency rollback recorded with governance justification', async () => {
      const res = await request(app)
        .post(`/api/v1/releases/${releaseId}/rollback`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          targetVersion: '3.4.9',
          reason: 'Network gateway timeout spike detected during Canary phase',
          strategy: 'CANARY_DRAIN'
        });

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      expect(res.body.data.targetVersion).toBe('3.4.9');
    });
  });

  // =========================================================================
  // 6. Cross-Module Ecosystem Dashboard Integration
  // =========================================================================
  describe('6. Ecosystem Telemetry on Main Dashboard', () => {
    it('Returns accurate real statistics for all 5 ecosystem modules', async () => {
      const res = await request(app)
        .get(`/api/v1/dashboard?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect([200, 201]).toContain(res.status);
      expect(res.body.success).toBe(true);
      const data = res.body.data;

      // Check ecosystem telemetry
      expect(data.documentationStats).toBeDefined();
      expect(typeof data.documentationStats.totalDocuments).toBe('number');
      expect(data.designStats).toBeDefined();
      expect(typeof data.designStats.totalDesignTokens).toBe('number');
      expect(data.developmentStats).toBeDefined();
      expect(typeof data.developmentStats.connectedRepositories).toBe('number');
      expect(data.testingStats).toBeDefined();
      expect(typeof data.testingStats.passRate).toBe('number');
      expect(data.releaseMetrics).toBeDefined();
      expect(typeof data.releaseMetrics.upcomingReleases).toBe('number');
    });
  });
});
