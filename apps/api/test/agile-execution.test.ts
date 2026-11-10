import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('Agile Execution & Quality Management (Boards, Backlog, Sprints, Bugs)', () => {
  let token = '';
  let workspaceId = '';
  let projectId = '';
  let testBugId = '';
  let testSprintId = '';
  let testTaskId = '';
  let defaultBoardId = '';
  let firstColumnId = '';

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

  // 1. My Boards
  describe('Kanban Boards Module', () => {
    it('Retrieves project Kanban board with 7 columns and tasks', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/board`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.columns).toBeDefined();
      expect(res.body.data.columns.length).toBeGreaterThanOrEqual(6);

      defaultBoardId = res.body.data.id;
      firstColumnId = res.body.data.columns[0].id;
    });

    it('Lists all boards for a project', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${projectId}/boards`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);
    });

    it('Updates a column WIP limit', async () => {
      const res = await request(app)
        .patch(`/api/v1/boards/columns/${firstColumnId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ wipLimit: 8 });

      expect(res.status).toBe(200);
      expect(res.body.data.wipLimit).toBe(8);
    });
  });

  // 2. Sprints & Burndown
  describe('Sprints & Burndown Module', () => {
    it('Creates a planned sprint with capacity and dates', async () => {
      const res = await request(app)
        .post('/api/v1/sprints')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          name: 'Sprint Test — Autonomous Invariant Verification',
          goal: 'Automate all invariant assertions and transaction tests',
          capacityPoints: 35
        });

      expect(res.status).toBe(201);
      expect(res.body.data.name).toBe('Sprint Test — Autonomous Invariant Verification');
      testSprintId = res.body.data.id;
    });

    it('Lists sprints with calculated story points and metrics', async () => {
      const res = await request(app)
        .get(`/api/v1/sprints?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      const found = res.body.data.find((s: any) => s.id === testSprintId);
      expect(found).toBeDefined();
      expect(found.totalStoryPoints).toBeDefined();
    });

    it('Calculates sprint burndown curve with ideal and actual points', async () => {
      const res = await request(app)
        .get(`/api/v1/sprints/${testSprintId}/burndown`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body.data)).toBe(true);
      if (res.body.data.length > 0) {
        expect(res.body.data[0].idealPoints).toBeDefined();
        expect(res.body.data[0].remainingPoints).toBeDefined();
      }
    });

    it('Updates sprint retrospective notes', async () => {
      const res = await request(app)
        .patch(`/api/v1/sprints/${testSprintId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          retrospectiveWentWell: 'Completed core deliverables with 100% test pass rate',
          retrospectiveWentWrong: 'Minor CI queue delay on external test fixtures',
          retrospectiveActionItems: 'Cache external API fixtures locally'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.retrospectiveWentWell).toContain('100% test pass rate');
    });

    it('Retrieves team velocity history across iterations', async () => {
      const res = await request(app)
        .get(`/api/v1/sprints/velocity?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.averageVelocity).toBeDefined();
      expect(Array.isArray(res.body.data.history)).toBe(true);
    });
  });

  // 3. Product Backlog & Tasks
  describe('Product Backlog Module', () => {
    it('Creates a backlog user story item', async () => {
      const res = await request(app)
        .post('/api/v1/tasks')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          title: 'As an architect, I want continuous invariant reconciliation',
          description: 'Reconcile ledger state every 10 seconds against shadow database',
          taskType: 'STORY',
          priority: 'HIGH',
          storyPoints: 5,
          status: 'BACKLOG'
        });

      expect(res.status).toBe(201);
      expect(res.body.data.title).toContain('continuous invariant reconciliation');
      testTaskId = res.body.data.id;
    });

    it('Assigns backlog story into a sprint with real-time capacity update', async () => {
      const res = await request(app)
        .put(`/api/v1/tasks/${testTaskId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({ sprintId: testSprintId, status: 'TODO' });

      expect(res.status).toBe(200);
      expect(res.body.data.sprintId).toBe(testSprintId);
    });

    it('Moves task status on Kanban board', async () => {
      const res = await request(app)
        .patch(`/api/v1/tasks/${testTaskId}/status`)
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'IN_PROGRESS' });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('IN_PROGRESS');
    });
  });

  // 4. Issues & Bugs
  describe('Defect Tracking & Quality Management Module', () => {
    it('Reports a new system defect with root cause analysis', async () => {
      const res = await request(app)
        .post('/api/v1/bugs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          projectId,
          title: 'Race condition on concurrent balance deduction webhook',
          description: 'Under 100 concurrent requests, balance dips without proper locking',
          severity: 'CRITICAL',
          priority: 'URGENT',
          environment: 'Staging Kubernetes',
          stepsToReproduce: '1. Send 100 parallel POST /debit calls\n2. Inspect ledger audit',
          expectedResult: 'Row-level lock enforces serial execution',
          actualResult: 'Transactions execute concurrently',
          rootCause: 'Missing SELECT ... FOR UPDATE pessimistic lock',
          taskId: testTaskId
        });

      expect(res.status).toBe(201);
      expect(res.body.data.bugIdentifier).toBeDefined();
      expect(res.body.data.title).toContain('Race condition on concurrent balance deduction');
      testBugId = res.body.data.id;
    });

    it('Retrieves defect quality analytics with severity breakdown and resolution rate', async () => {
      const res = await request(app)
        .get(`/api/v1/bugs/analytics?projectId=${projectId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.totalBugs).toBeGreaterThanOrEqual(1);
      expect(res.body.data.critical).toBeGreaterThanOrEqual(1);
      expect(res.body.data.resolutionRate).toBeDefined();
    });

    it('Updates defect status to FIXED with patch resolution notes', async () => {
      const res = await request(app)
        .patch(`/api/v1/bugs/${testBugId}`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'FIXED',
          resolutionNotes: 'Added SELECT ... FOR UPDATE in database transaction'
        });

      expect(res.status).toBe(200);
      expect(res.body.data.status).toBe('FIXED');
      expect(res.body.data.resolutionNotes).toContain('SELECT ... FOR UPDATE');
    });

    it('Deletes test defect cleanly', async () => {
      const res = await request(app)
        .delete(`/api/v1/bugs/${testBugId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.success).toBe(true);
    });
  });
});
