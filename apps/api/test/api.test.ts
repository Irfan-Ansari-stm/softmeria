import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';

describe('DevBlueprint API Integration Tests', () => {
  let ownerToken = '';
  let workspaceId = '';
  let projectId = '';
  let documentId = '';

  it('Health Check responds with 200 and status ok', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
  });

  it('Login with seeded owner account', async () => {
    const res = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'owner@devblueprint.io',
        password: 'Password123!'
      });

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.tokens.accessToken).toBeDefined();
    ownerToken = res.body.data.tokens.accessToken;
    expect(res.body.data.workspaces.length).toBeGreaterThan(0);
    workspaceId = res.body.data.workspaces[0].id;
  });

  it('Fetch Current User Profile', async () => {
    const res = await request(app)
      .get('/api/v1/auth/me')
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.email).toBe('owner@devblueprint.io');
  });

  it('List Projects for Workspace', async () => {
    const res = await request(app)
      .get(`/api/v1/projects?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
    const flagshipProject = res.body.data.find((p: any) => p.name.includes('DevBlueprint')) || res.body.data[0];
    projectId = flagshipProject.id;
  });

  it('Get Project Categories Tree with Documents', async () => {
    const res = await request(app)
      .get(`/api/v1/projects/${projectId}/categories`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBeGreaterThanOrEqual(8);
    const firstCat = res.body.data[0];
    expect(firstCat.documents.length).toBeGreaterThan(0);
    documentId = firstCat.documents[0].id;
  });

  it('Get Document Detail and Content', async () => {
    const res = await request(app)
      .get(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(documentId);
    expect(res.body.data.content).toBeDefined();
    expect(res.body.data.versionNumber).toBeGreaterThanOrEqual(1);
  });

  it('Update Document with Auto-save Concurrency check', async () => {
    const currentDoc = await request(app)
      .get(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    const currentVersion = currentDoc.body.data.versionNumber;
    const updateRes = await request(app)
      .put(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        content: '# Updated Specification\n\nVerified by automated test suite.',
        expectedVersion: currentVersion,
        changeSummary: 'Automated test suite update'
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.data.versionNumber).toBe(currentVersion + 1);
  });

  it('Reject Stale Document Update (Optimistic Concurrency Control)', async () => {
    const staleRes = await request(app)
      .put(`/api/v1/documents/${documentId}`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({
        content: '# Stale edit collision',
        expectedVersion: 1 // Old version
      });

    expect(staleRes.status).toBe(409);
    expect(staleRes.body.success).toBe(false);
  });

  it('Fetch Document Versions and Restore Previous Version', async () => {
    const versionsRes = await request(app)
      .get(`/api/v1/documents/${documentId}/versions`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(versionsRes.status).toBe(200);
    expect(versionsRes.body.data.length).toBeGreaterThanOrEqual(2);

    const restoreRes = await request(app)
      .post(`/api/v1/documents/${documentId}/versions/restore`)
      .set('Authorization', `Bearer ${ownerToken}`)
      .send({ versionNumber: 1 });

    expect(restoreRes.status).toBe(200);
    expect(restoreRes.body.data.versionNumber).toBeGreaterThan(versionsRes.body.data[0].versionNumber);
  });

  it('Export Single Document as Markdown', async () => {
    const res = await request(app)
      .get(`/api/v1/documents/${documentId}/export`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.headers['content-type']).toContain('text/markdown');
  });

  it('Global Search Across Documents and Projects', async () => {
    const res = await request(app)
      .get(`/api/v1/search?workspaceId=${workspaceId}&q=Architecture`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.documents.length).toBeGreaterThan(0);
  });

  it('Dashboard Metrics from Real Database', async () => {
    const res = await request(app)
      .get(`/api/v1/dashboard?workspaceId=${workspaceId}`)
      .set('Authorization', `Bearer ${ownerToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.totalProjects).toBeGreaterThanOrEqual(2);
    expect(res.body.data.totalDocuments).toBeGreaterThanOrEqual(40);
    expect(res.body.data.overallCompletionPercentage).toBeGreaterThan(0);
    expect(res.body.data.recentActivities.length).toBeGreaterThan(0);
  });

  it('Unauthorized request rejected with 401', async () => {
    const res = await request(app).get(`/api/v1/projects?workspaceId=${workspaceId}`);
    expect(res.status).toBe(401);
  });
});
