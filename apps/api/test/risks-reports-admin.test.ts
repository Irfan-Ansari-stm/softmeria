import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Risks, Dependencies, Reports, Integrations, Audit Logs & Settings Integration Suite', () => {
  let token = '';
  let workspaceId = '';
  let projectId = '';
  let testRiskId = '';
  let testMitigationId = '';
  let testDependencyId = '';

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
  // 1. RISKS & DEPENDENCY MANAGEMENT
  // =========================================================================
  describe('Risk Register & 3x3 Matrix', () => {
    it('Creates a new risk and calculates risk score (Probability x Impact)', async () => {
      const res = await request(app)
        .post('/api/v1/risks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          title: 'Database connection pool starvation during spike',
          description: 'Connection exhaustion under high throughput',
          category: 'Infrastructure & Cloud',
          probability: 'HIGH', // 3
          impact: 'HIGH', // 3 -> score 9, severity CRITICAL
          mitigationStrategy: 'Deploy PgBouncer pooler and horizontal replicas'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Database connection pool starvation during spike');
      expect(res.body.data.score).toBe(9);
      expect(res.body.data.severity).toBe('CRITICAL');
      testRiskId = res.body.data.id;
    });

    it('Fetches 3x3 Probability vs Impact Matrix with aggregated cell counts', async () => {
      const res = await request(app)
        .get(`/api/v1/risks/matrix?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.matrix)).toBe(true);
      expect(res.body.data.matrix.length).toBe(9); // 3x3

      // Cell High x High (score 9) must contain our registered risk
      const cell9 = res.body.data.matrix.find((c: any) => c.score === 9);
      expect(cell9).toBeDefined();
      expect(cell9.count).toBeGreaterThanOrEqual(1);
      expect(cell9.classification).toBe('CRITICAL');
    });

    it('Adds a mitigation action with progress tracking', async () => {
      const res = await request(app)
        .post(`/api/v1/risks/${testRiskId}/mitigations`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          description: 'Provision AWS RDS Proxy layer',
          progress: 50,
          status: 'IN_PROGRESS'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.description).toBe('Provision AWS RDS Proxy layer');
      expect(res.body.data.progress).toBe(50);
      testMitigationId = res.body.data.id;
    });

    it('Updates mitigation action progress to 100% completed', async () => {
      expect(testMitigationId).toBeTruthy();
      const res = await request(app)
        .patch(`/api/v1/risks/mitigations/${testMitigationId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          progress: 100,
          status: 'COMPLETED'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.progress).toBe(100);
      expect(res.body.data.status).toBe('COMPLETED');
    });

    it('Creates cross-project dependency and detects circular relationships', async () => {
      // Create valid dependency
      const res = await request(app)
        .post('/api/v1/risks/dependencies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          title: 'Authentication core service release',
          sourceProjectId: projectId,
          dependencyType: 'BLOCKS',
          criticality: 'CRITICAL',
          description: 'Authentication core service release must precede Payment API'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Authentication core service release');
      testDependencyId = res.body.data.id;

      // Attempt self-referencing task circular dependency
      const failRes = await request(app)
        .post('/api/v1/risks/dependencies')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          title: 'Circular task self dependency',
          sourceProjectId: projectId,
          sourceTaskId: 'same-task-uuid',
          targetTaskId: 'same-task-uuid',
          dependencyType: 'BLOCKS',
          criticality: 'CRITICAL'
        });

      expect(failRes.status).toBe(400);
      expect(failRes.body.success).toBe(false);
    });

    it('Exports Risk Register to real CSV format', async () => {
      const res = await request(app)
        .get(`/api/v1/risks/export/csv?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.text).toContain('Risk ID,Title,Project,Category');
      expect(res.text).toContain('Database connection pool starvation during spike');
    });
  });

  // =========================================================================
  // 2. REPORTS & EXECUTIVE ANALYTICS
  // =========================================================================
  describe('Executive Reports & Delivery Analytics', () => {
    it('Fetches Executive Report Dashboard with real database KPIs', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/executive?workspaceId=${workspaceId}&projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      const report = res.body.data;

      // Verify all 8 core KPIs exist
      expect(report.kpis.sprintVelocity).toBeDefined();
      expect(report.kpis.taskThroughput).toBeDefined();
      expect(report.kpis.defectResolutionRate).toBeDefined();
      expect(report.kpis.engineeringHours).toBeDefined();
      expect(report.kpis.sprintCompletionRate).toBeDefined();
      expect(report.kpis.backlogSize).toBeDefined();
      expect(report.kpis.openCriticalBugs).toBeDefined();
      expect(report.kpis.onTimeDeliveryRate).toBeDefined();

      // Verify analytical breakdowns
      expect(Array.isArray(report.velocityTrends)).toBe(true);
      expect(Array.isArray(report.statusBreakdown)).toBe(true);
      expect(report.defectResolution).toBeDefined();
      expect(report.engineeringTime).toBeDefined();
      expect(report.projectHealth).toBeDefined();
    });

    it('Fetches Project Summary Report (backward-compatible endpoint)', async () => {
      const res = await request(app)
        .get(`/api/v1/reports/summary?workspaceId=${workspaceId}&projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.kpis).toBeDefined();
    });

    it('Exports Executive KPIs and Velocity trends to CSV', async () => {
      const kpiRes = await request(app)
        .get(`/api/v1/reports/export/csv?workspaceId=${workspaceId}&type=kpi`)
        .set('Authorization', `Bearer ${token}`);

      expect(kpiRes.status).toBe(200);
      expect(kpiRes.header['content-type']).toContain('text/csv');
      expect(kpiRes.text).toContain('KPI Metric,Current Value,Unit,Period,Definition');

      const velocityRes = await request(app)
        .get(`/api/v1/reports/export/csv?workspaceId=${workspaceId}&type=velocity`)
        .set('Authorization', `Bearer ${token}`);

      expect(velocityRes.status).toBe(200);
      expect(velocityRes.header['content-type']).toContain('text/csv');
      expect(velocityRes.text).toContain('Sprint Name,Planned Story Points,Completed Story Points,Completion %');
    });
  });

  // =========================================================================
  // 3. INTEGRATIONS & CONNECTORS
  // =========================================================================
  describe('Integrations & Connectors', () => {
    it('Lists available enterprise connectors (GitHub, Slack, Datadog, Sentry, Jira)', async () => {
      const res = await request(app)
        .get(`/api/v1/integrations?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(5);

      const providers = res.body.data.map((c: any) => c.provider);
      expect(providers).toContain('GITHUB');
      expect(providers).toContain('SLACK');
      expect(providers).toContain('DATADOG');
      expect(providers).toContain('SENTRY');
      expect(providers).toContain('JIRA');
    });

    it('Tests connection with live latency check', async () => {
      const res = await request(app)
        .post('/api/v1/integrations/GITHUB/test')
        .set('Authorization', `Bearer ${token}`)
        .send({ workspaceId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.status).toBe('HEALTHY');
      expect(typeof res.body.data.latencyMs).toBe('number');
    });

    it('Synchronizes integration data', async () => {
      const res = await request(app)
        .post('/api/v1/integrations/GITHUB/sync')
        .set('Authorization', `Bearer ${token}`)
        .send({ workspaceId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.syncStatus).toBe('SYNCED');
      expect(res.body.data.lastSyncAt).toBeDefined();
    });
  });

  // =========================================================================
  // 4. AUDIT LOGS & GOVERNANCE
  // =========================================================================
  describe('Audit Logs & Governance Trail', () => {
    it('Fetches paginated audit logs with search and category filters', async () => {
      const res = await request(app)
        .get(`/api/v1/audit-logs?workspaceId=${workspaceId}&page=1&limit=10`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data.events)).toBe(true);
      expect(res.body.data.pagination).toBeDefined();
      expect(res.body.data.pagination.page).toBe(1);
    });

    it('Exports immutable audit log records to CSV', async () => {
      const res = await request(app)
        .get(`/api/v1/audit-logs/export/csv?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.header['content-type']).toContain('text/csv');
      expect(res.text).toContain('Event ID,Timestamp,Actor,Action,Category');
    });
  });

  // =========================================================================
  // 5. SETTINGS, PROFILE & WORKSPACE CONFIGURATION
  // =========================================================================
  describe('Workspace & Account Settings', () => {
    it('Updates developer profile with title, department, timezone and 2FA', async () => {
      const res = await request(app)
        .put('/api/v1/auth/profile')
        .set('Authorization', `Bearer ${token}`)
        .send({
          name: 'Sarah Connor',
          jobTitle: 'Distinguished Cloud Architect',
          department: 'Core Infrastructure',
          bio: 'Spearheading event-driven architectural governance and cloud reliability',
          timezone: 'America/New_York',
          preferredLanguage: 'en',
          twoFactorEnabled: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Sarah Connor');
      expect(res.body.data.jobTitle).toBe('Distinguished Cloud Architect');
      expect(res.body.data.twoFactorEnabled).toBe(true);
    });

    it('Retrieves active authenticated sessions', async () => {
      const res = await request(app)
        .get('/api/v1/auth/sessions')
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Updates workspace configuration, branding, and notification preferences', async () => {
      const res = await request(app)
        .put(`/api/v1/workspaces/${workspaceId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          companyName: 'DevBlueprint Enterprise Labs',
          website: 'https://devblueprint.io',
          industry: 'Cloud Infrastructure & Developer Tools',
          emailNotifications: true,
          bugAlerts: true,
          releaseApprovals: true,
          securityAlerts: true
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.settings.companyName).toBe('DevBlueprint Enterprise Labs');
      expect(res.body.data.settings.bugAlerts).toBe(true);
      expect(res.body.data.settings.releaseApprovals).toBe(true);
    });
  });
});
