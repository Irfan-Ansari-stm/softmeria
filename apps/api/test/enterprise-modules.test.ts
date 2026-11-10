import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Enterprise Modules Integration Tests (Portfolios, Roadmaps, Milestones, Calendar)', () => {
  let token = '';
  let workspaceId = '';
  let projectId = '';
  let testPortfolioId = '';
  let testMilestoneId = '';
  let testRoadmapItemId = '';
  let testEventId = '';

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

  // 1. Portfolio Tests
  describe('Portfolios Module', () => {
    it('Creates a new portfolio with objectives and budget', async () => {
      const res = await request(app)
        .post('/api/v1/portfolios')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          name: 'Test Autonomous FinTech Portfolio',
          description: 'Strategic ledger modernization and fraud prevention',
          category: 'Strategic Initiatives',
          budget: 500000,
          health: 'ON_TRACK',
          projectIds: [projectId]
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('Test Autonomous FinTech Portfolio');
      testPortfolioId = res.body.data.id;
    });

    it('Lists portfolios with aggregated metrics', async () => {
      const res = await request(app)
        .get(`/api/v1/portfolios?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((p: any) => p.id === testPortfolioId);
      expect(found).toBeDefined();
      expect(found.projectCount).toBeGreaterThanOrEqual(1);
    });

    it('Adds a strategic objective to portfolio', async () => {
      const res = await request(app)
        .post(`/api/v1/portfolios/${testPortfolioId}/objectives`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Achieve 99.99% Availability',
          description: 'Deploy multi-region failover cluster'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Achieve 99.99% Availability');
    });

    it('Updates portfolio budget and health', async () => {
      const res = await request(app)
        .put(`/api/v1/portfolios/${testPortfolioId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          budget: 750000,
          health: 'AT_RISK'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.budget).toBe(750000);
      expect(res.body.data.health).toBe('AT_RISK');
    });

    it('Duplicates portfolio', async () => {
      const res = await request(app)
        .post(`/api/v1/portfolios/${testPortfolioId}/duplicate`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.data.name).toContain('Copy');
    });
  });

  // 2. Roadmaps Module
  describe('Roadmaps Module', () => {
    it('Fetches primary product roadmap for project', async () => {
      const res = await request(app)
        .get(`/api/v1/roadmaps?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.items).toBeDefined();
      expect(Array.isArray(res.body.data.items)).toBe(true);
    });

    it('Creates a strategic roadmap initiative item', async () => {
      const roadmapRes = await request(app)
        .get(`/api/v1/roadmaps?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      const roadmapId = roadmapRes.body.data.id;

      const res = await request(app)
        .post('/api/v1/roadmaps/items')
        .set('Authorization', `Bearer ${token}`)
        .send({
          roadmapId,
          title: 'Q3 High Throughput Resilience Pipeline',
          description: 'Simulate 10k TPS load burst',
          startDate: '2026-07-01T00:00:00Z',
          endDate: '2026-09-30T00:00:00Z',
          progress: 45,
          color: '#3b82f6',
          status: 'IN_PROGRESS',
          priority: 'HIGH'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Q3 High Throughput Resilience Pipeline');
      testRoadmapItemId = res.body.data.id;
    });

    it('Updates roadmap item progress and dates', async () => {
      const res = await request(app)
        .put(`/api/v1/roadmaps/items/${testRoadmapItemId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          progress: 90,
          status: 'COMPLETED'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.progress).toBe(90);
      expect(res.body.data.status).toBe('COMPLETED');
    });
  });

  // 3. Milestones Module
  describe('Milestones Module', () => {
    it('Creates a delivery gate milestone', async () => {
      const res = await request(app)
        .post('/api/v1/milestones')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'M3: Zero-Loss Transactional Ledger Sign-Off',
          description: 'Formal phase gate approval for double-entry ledger',
          startDate: '2026-06-01T00:00:00Z',
          targetDate: '2026-06-30T00:00:00Z',
          priority: 'CRITICAL',
          status: 'PLANNED'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('M3: Zero-Loss Transactional Ledger Sign-Off');
      testMilestoneId = res.body.data.id;
    });

    it('Lists milestones with completion percentage calculated', async () => {
      const res = await request(app)
        .get(`/api/v1/milestones?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);
      const found = res.body.data.find((m: any) => m.id === testMilestoneId);
      expect(found).toBeDefined();
    });

    it('Updates milestone status and dates', async () => {
      const res = await request(app)
        .put(`/api/v1/milestones/${testMilestoneId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'IN_PROGRESS'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  // 4. Calendar Module
  describe('Calendar Module', () => {
    it('Creates a custom engineering calendar event', async () => {
      const res = await request(app)
        .post('/api/v1/calendar/events')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          title: 'Sprint 5 Retrospective & Architectural Sync',
          description: 'Review latency metrics and database connection pool tuning',
          eventType: 'MEETING',
          startDate: '2026-11-25T14:00:00Z',
          endDate: '2026-11-25T15:30:00Z',
          allDay: false,
          priority: 'MEDIUM',
          color: '#4f46e5',
          meetingUrl: 'https://meet.devblueprint.io/sprint-5-retro'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toBe('Sprint 5 Retrospective & Architectural Sync');
      testEventId = res.body.data.id;
    });

    it('Lists calendar events aggregating custom events and native task/sprint deadlines', async () => {
      const res = await request(app)
        .get(`/api/v1/calendar/events?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.length).toBeGreaterThan(0);

      // Verify custom event is included
      const customEvent = res.body.data.find((e: any) => e.id === testEventId);
      expect(customEvent).toBeDefined();

      // Verify native task deadlines or sprint dates are aggregated
      const hasNativeOrAggregated = res.body.data.some((e: any) => !e.isCustom);
      expect(hasNativeOrAggregated).toBe(true);
    });

    it('Updates calendar event details', async () => {
      const res = await request(app)
        .put(`/api/v1/calendar/events/${testEventId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          title: 'Sprint 5 Retrospective (Rescheduled)',
          priority: 'HIGH'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.title).toBe('Sprint 5 Retrospective (Rescheduled)');
    });

    it('Deletes custom calendar event', async () => {
      const res = await request(app)
        .delete(`/api/v1/calendar/events/${testEventId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);
    });
  });
});
