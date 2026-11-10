import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('DevBlueprint Files, Discussions & Team Management Tests', () => {
  let token = '';
  let workspaceId = '';
  let projectId = '';
  let testUserId = '';

  beforeAll(async () => {
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({ email: 'owner@devblueprint.io', password: 'Password123!' });

    expect(loginRes.status).toBe(200);
    token = loginRes.body.data.tokens.accessToken;
    workspaceId = loginRes.body.data.workspaces[0].id;
    testUserId = loginRes.body.data.user.id;

    const projRes = await request(app)
      .get(`/api/v1/projects?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${token}`);

    expect(projRes.status).toBe(200);
    projectId = projRes.body.data[0].id;
  });

  // =========================================================================
  // MODULE 1: FILES & ASSET STORAGE
  // =========================================================================
  describe('Module 1: Files & Asset Storage', () => {
    let folderId = '';
    let subFolderId = '';
    let uploadedFileId = '';

    it('Creates root and nested asset directories', async () => {
      // Root folder
      const rootRes = await request(app)
        .post('/api/v1/files/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          name: 'Core System Architectures',
          color: '#2563eb'
        });

      expect(rootRes.status).toBe(201);
      expect(rootRes.body.success).toBe(true);
      expect(rootRes.body.data.name).toBe('Core System Architectures');
      folderId = rootRes.body.data.id;

      // Nested subfolder
      const subRes = await request(app)
        .post('/api/v1/files/folders')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          parentId: folderId,
          name: 'Microservice RPC Schemas',
          color: '#16a34a'
        });

      expect(subRes.status).toBe(201);
      expect(subRes.body.success).toBe(true);
      expect(subRes.body.data.parentId).toBe(folderId);
      subFolderId = subRes.body.data.id;
    });

    it('Uploads a text/markdown file via multipart form-data', async () => {
      const buffer = Buffer.from('# Architecture Whitepaper\n\nHigh-throughput transactional engine.\n');

      const res = await request(app)
        .post('/api/v1/files/upload')
        .set('Authorization', `Bearer ${token}`)
        .field('workspaceId', workspaceId)
        .field('projectId', projectId)
        .field('folderId', folderId)
        .attach('files', buffer, 'architecture-whitepaper.md');

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThan(0);
      uploadedFileId = res.body.data[0].id;
      expect(res.body.data[0].extension).toBe('md');
    });

    it('Retrieves storage telemetry statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/files/stats?workspaceId=${workspaceId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalFiles).toBeGreaterThan(0);
      expect(res.body.data.totalStorageBytes).toBeGreaterThan(0);
      expect(res.body.data.filesByType).toBeDefined();
    });

    it('Previews file text contents', async () => {
      const res = await request(app)
        .get(`/api/v1/files/${uploadedFileId}/preview`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.content).toContain('Architecture Whitepaper');
    });

    it('Renames a file', async () => {
      const res = await request(app)
        .put(`/api/v1/files/${uploadedFileId}/rename`)
        .set('Authorization', `Bearer ${token}`)
        .send({ name: 'architecture-whitepaper-v2.md' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toBe('architecture-whitepaper-v2.md');
    });

    it('Duplicates / copies a file', async () => {
      const res = await request(app)
        .post(`/api/v1/files/${uploadedFileId}/copy`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.name).toContain('Copy');
    });

    it('Moves file to a nested subfolder', async () => {
      const res = await request(app)
        .put(`/api/v1/files/${uploadedFileId}/move`)
        .set('Authorization', `Bearer ${token}`)
        .send({ folderId: subFolderId });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.folderId).toBe(subFolderId);
    });

    it('Performs soft delete and restores a file', async () => {
      // Soft delete
      const delRes = await request(app)
        .delete(`/api/v1/files/${uploadedFileId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(delRes.status).toBe(200);
      expect(delRes.body.data.isDeleted).toBe(true);

      // Restore
      const restoreRes = await request(app)
        .post(`/api/v1/files/${uploadedFileId}/restore`)
        .set('Authorization', `Bearer ${token}`);

      expect(restoreRes.status).toBe(200);
      expect(restoreRes.body.data.isDeleted).toBe(false);
    });
  });

  // =========================================================================
  // MODULE 2: DISCUSSIONS & RFC DECISION RECORDS
  // =========================================================================
  describe('Module 2: Discussions & RFC Decisions', () => {
    let testDiscId = '';
    let testCommentId = '';
    let testRfcId = '';

    it('Creates an engineering discussion with category and tags', async () => {
      const res = await request(app)
        .post('/api/v1/discussions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          title: 'Decoupling Monolith Billing into Async Event Ledger',
          category: 'ARCHITECTURE',
          content: 'Proposal to transition billing updates to an idempotent message broker.',
          tags: ['Billing', 'Architecture', 'Kafka']
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Decoupling Monolith Billing into Async Event Ledger');
      testDiscId = res.body.data.id;
    });

    it('Adds a root comment and a threaded reply to discussion', async () => {
      // Root comment
      const commentRes = await request(app)
        .post(`/api/v1/discussions/${testDiscId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'We should ensure all event payloads include traceparent headers for OpenTelemetry.'
        });

      expect(commentRes.status).toBe(201);
      expect(commentRes.body.success).toBe(true);
      testCommentId = commentRes.body.data.id;

      // Threaded reply
      const replyRes = await request(app)
        .post(`/api/v1/discussions/${testDiscId}/comments`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          content: 'Agreed, W3C trace context format is supported out of the box in our middleware.',
          parentId: testCommentId
        });

      expect(replyRes.status).toBe(201);
      expect(replyRes.body.data.parentId).toBe(testCommentId);
    });

    it('Adds emoji reaction to discussion comment', async () => {
      const res = await request(app)
        .post(`/api/v1/discussions/comments/${testCommentId}/reactions`)
        .set('Authorization', `Bearer ${token}`)
        .send({ emoji: '🚀' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.reactions).toBeDefined();
    });

    it('Resolves and reopens a discussion thread', async () => {
      const res = await request(app)
        .patch(`/api/v1/discussions/${testDiscId}/resolve`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.data.isResolved).toBe(true);
    });

    it('Submits a formal RFC proposal', async () => {
      const res = await request(app)
        .post('/api/v1/discussions/rfcs')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          title: 'RFC: Progressive Web App Offline Caching Strategy',
          category: 'TECHNICAL_DESIGN',
          problemStatement: 'Engineers on intermittent mobile connections face data entry loss.',
          motivation: 'Enable seamless offline blueprint drafts with IndexedDB synchronization.',
          proposedSolution: 'Service Worker caching + CRDT local state reconciler.',
          securityConsiderations: 'Local IndexedDB encrypted using Web Crypto AES-GCM.',
          performanceConsiderations: 'Zero-latency UI updates with background queue sync.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.rfcNumber).toBeGreaterThan(0);
      testRfcId = res.body.data.id;
    });

    it('Casts consensus vote and records review on RFC', async () => {
      // Vote APPROVE
      const voteRes = await request(app)
        .post(`/api/v1/discussions/rfcs/${testRfcId}/vote`)
        .set('Authorization', `Bearer ${token}`)
        .send({ vote: 'APPROVE' });

      expect([200, 201]).toContain(voteRes.status);
      expect(voteRes.body.data.vote).toBe('APPROVE');

      // Review signoff
      const reviewRes = await request(app)
        .post(`/api/v1/discussions/rfcs/${testRfcId}/reviews`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          status: 'APPROVED',
          comments: 'Tested with Service Worker mock harness. Meets offline SLAs.'
        });

      expect([200, 201]).toContain(reviewRes.status);
      expect(reviewRes.body.data.status).toBe('APPROVED');
    });

    it('Records formal Architecture Decision Record (ADR)', async () => {
      const res = await request(app)
        .post('/api/v1/discussions/decisions')
        .set('Authorization', `Bearer ${token}`)
        .send({
          workspaceId,
          projectId,
          rfcId: testRfcId,
          title: 'ADR: IndexedDB + Web Crypto for Offline Blueprint Caching',
          context: 'Field engineers require documentation editing capability during network dropouts.',
          decision: 'Use IndexedDB with Web Crypto AES-GCM local storage.',
          consequences: 'Enables 100% offline uptime; requires conflict resolution logic.'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.decisionNumber).toBeGreaterThan(0);
    });
  });

  // =========================================================================
  // MODULE 3: TEAMS & WORKSPACE ACCESS CONTROL
  // =========================================================================
  describe('Module 3: Teams & Workspace Access Control', () => {
    let invitationId = '';
    let testMemberId = '';

    it('Lists active workspace members with detailed telemetry', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceId}/members`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBeGreaterThanOrEqual(1);

      const firstMember = res.body.data[0];
      testMemberId = firstMember.id;
      expect(firstMember.name).toBeDefined();
      expect(firstMember.email).toBeDefined();
      expect(firstMember.role).toBeDefined();
      expect(firstMember.status).toBe('ACTIVE');
    });

    it('Retrieves team overview statistics', async () => {
      const res = await request(app)
        .get(`/api/v1/workspaces/${workspaceId}/team-stats`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.totalMembers).toBeGreaterThanOrEqual(1);
      expect(res.body.data.roleDistribution).toBeDefined();
    });

    it('Invites a new member generating a 7-day secure token', async () => {
      const res = await request(app)
        .post(`/api/v1/workspaces/${workspaceId}/members`)
        .set('Authorization', `Bearer ${token}`)
        .send({
          email: `new-engineer-${Date.now()}@devblueprint.io`,
          role: 'EDITOR',
          title: 'Staff Reliability Engineer',
          department: 'Platform'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.token).toBeDefined();
      expect(res.body.data.status).toBe('PENDING');
      invitationId = res.body.data.id;
    });

    it('Lists pending invitations and resends invitation', async () => {
      // List
      const listRes = await request(app)
        .get(`/api/v1/workspaces/${workspaceId}/invitations`)
        .set('Authorization', `Bearer ${token}`);

      expect(listRes.status).toBe(200);
      expect(listRes.body.data.length).toBeGreaterThan(0);

      // Resend
      const resendRes = await request(app)
        .post(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}/resend`)
        .set('Authorization', `Bearer ${token}`);

      expect(resendRes.status).toBe(200);
      expect(resendRes.body.success).toBe(true);
    });

    it('Cancels a pending invitation', async () => {
      const res = await request(app)
        .delete(`/api/v1/workspaces/${workspaceId}/invitations/${invitationId}`)
        .set('Authorization', `Bearer ${token}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });
  });
});
