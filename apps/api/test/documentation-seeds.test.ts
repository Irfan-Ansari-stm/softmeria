import { describe, it, expect, beforeAll } from 'vitest';
import request from 'supertest';
import { app } from '../src/app';
import { prisma } from '../src/config/db';
import {
  ALL_SEED_DOCUMENTS,
  SEED_CATEGORIES,
  getManifestForOption
} from '../src/modules/documentation-seeds/seed-manifest';
import { documentationSeedService } from '../src/modules/documentation-seeds/seed-service';
import AdmZip from 'adm-zip';

describe('Documentation Blueprint & Seed System Tests', () => {
  let ownerToken = '';
  let workspaceId = '';
  let testProjectId = '';

  beforeAll(async () => {
    // Authenticate with seeded owner account
    const loginRes = await request(app)
      .post('/api/v1/auth/login')
      .send({
        email: 'owner@devblueprint.io',
        password: 'Password123!'
      });

    ownerToken = loginRes.body.data.tokens.accessToken;
    workspaceId = loginRes.body.data.workspaces[0].id;
  });

  describe('1. Manifest & Content Quality Standards', () => {
    it('Manifest contains exactly 13 categories (1 Root + 12 Domain Categories)', () => {
      expect(SEED_CATEGORIES.length).toBe(13);
      expect(SEED_CATEGORIES[0].slug).toBe('root');
      expect(SEED_CATEGORIES[1].slug).toBe('01-project');
      expect(SEED_CATEGORIES[2].slug).toBe('02-architecture');
      expect(SEED_CATEGORIES[3].slug).toBe('03-design-system');
      expect(SEED_CATEGORIES[4].slug).toBe('04-ui-components');
      expect(SEED_CATEGORIES[5].slug).toBe('05-page-design');
      expect(SEED_CATEGORIES[6].slug).toBe('06-frontend');
      expect(SEED_CATEGORIES[7].slug).toBe('07-backend');
      expect(SEED_CATEGORIES[8].slug).toBe('08-database');
      expect(SEED_CATEGORIES[9].slug).toBe('09-security');
      expect(SEED_CATEGORIES[10].slug).toBe('10-testing');
      expect(SEED_CATEGORIES[11].slug).toBe('11-devops');
      expect(SEED_CATEGORIES[12].slug).toBe('12-maintenance');
    });

    it('Manifest contains exactly 139 complete Markdown specifications', () => {
      expect(ALL_SEED_DOCUMENTS.length).toBe(139);
    });

    it('Zero empty documents and zero duplicate file paths in manifest', () => {
      const seenRelativePaths = new Set<string>();
      const seenIds = new Set<string>();

      for (const doc of ALL_SEED_DOCUMENTS) {
        // ID uniqueness
        expect(seenIds.has(doc.id)).toBe(false);
        seenIds.add(doc.id);

        // Relative path uniqueness
        expect(seenRelativePaths.has(doc.relativePath)).toBe(false);
        seenRelativePaths.add(doc.relativePath);

        // Content verification
        expect(doc.content.trim().length).toBeGreaterThan(100);
        expect(doc.title.trim().length).toBeGreaterThan(2);
        expect(doc.fileName.endsWith('.md')).toBe(true);

        // Initial status: MUST be NOT_STARTED, DRAFT, or APPROVED (for policies/ADRs), never COMPLETED
        expect(['NOT_STARTED', 'DRAFT', 'APPROVED']).toContain(doc.initialStatus);
      }
    });

    it('Root category contains exactly 5 governance files', () => {
      const rootDocs = ALL_SEED_DOCUMENTS.filter((d) => d.categorySlug === 'root');
      expect(rootDocs.length).toBe(5);
      const fileNames = rootDocs.map((d) => d.fileName);
      expect(fileNames).toContain('README.md');
      expect(fileNames).toContain('AGENTS.md');
      expect(fileNames).toContain('CONTRIBUTING.md');
      expect(fileNames).toContain('CHANGELOG.md');
      expect(fileNames).toContain('PROJECT-OVERVIEW.md');
    });

    it('Placeholder substitution correctly replaces tokens', () => {
      const manifest = getManifestForOption('FULL', {
        projectName: 'Apex Cloud Banking',
        projectType: 'Microservices Platform'
      });

      const readme = manifest.documents.find((d) => d.fileName === 'README.md');
      expect(readme?.content).toContain('# Apex Cloud Banking');
      expect(readme?.content).not.toContain('[PROJECT_NAME]');
    });
  });

  describe('2. Project Creation & Automated Blueprint Provisioning', () => {
    it('Creates a new project with Full Enterprise Blueprint (139 Docs)', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          workspaceId,
          name: 'Automated Enterprise Test Project',
          description: 'Test project for validating complete 139-doc seed blueprint',
          projectType: 'Web application',
          blueprintOption: 'FULL'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      testProjectId = res.body.data.id;

      // Verify categories in database
      const categories = await prisma.category.findMany({
        where: { projectId: testProjectId },
        orderBy: { sortOrder: 'asc' },
        include: { documents: true }
      });

      expect(categories.length).toBe(13);

      // Verify total documents
      const totalDocs = categories.reduce((sum, c) => sum + c.documents.length, 0);
      expect(totalDocs).toBe(139);

      // Verify initial version snapshots exist for all documents
      const versionsCount = await prisma.documentVersion.count({
        where: { document: { projectId: testProjectId } }
      });
      expect(versionsCount).toBe(139);
    });

    it('Documentation tree endpoint returns all 13 categories with correct document counts', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/categories`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.length).toBe(13);

      const rootCat = res.body.data.find((c: any) => c.slug === 'root');
      expect(rootCat).toBeDefined();
      expect(rootCat.documentCount).toBe(5);

      const uiCompCat = res.body.data.find((c: any) => c.slug === '04-ui-components');
      expect(uiCompCat).toBeDefined();
      expect(uiCompCat.documentCount).toBe(37);
    });

    it('Calculation formula uses required non-archived documents only', async () => {
      const project = await prisma.project.findUnique({
        where: { id: testProjectId },
        include: { documents: true }
      });

      const requiredDocs = project!.documents.filter((d) => !d.isOptional && d.status !== 'ARCHIVED');
      const completedDocs = requiredDocs.filter(
        (d) => d.status === 'COMPLETED' || d.status === 'APPROVED'
      );

      const expectedPct = Math.round((completedDocs.length / requiredDocs.length) * 100);

      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}`)
        .set('Authorization', `Bearer ${ownerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.data.completionPercentage).toBe(expectedPct);
      expect(res.body.data.totalDocuments).toBe(139);
    });
  });

  describe('3. Seed Idempotency & Content Protection', () => {
    it('Rerunning seed on an existing project creates zero duplicates', async () => {
      const seedRes = await request(app)
        .post(`/api/v1/projects/${testProjectId}/seed-blueprint`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ blueprintOption: 'FULL' });

      expect(seedRes.status).toBe(200);
      expect(seedRes.body.data.documentsCreated).toBe(0);
      expect(seedRes.body.data.documentsSkipped).toBe(139);

      // Verify total document count remains exactly 139
      const totalDocs = await prisma.document.count({
        where: { projectId: testProjectId }
      });
      expect(totalDocs).toBe(139);
    });

    it('Rerunning seed does NOT overwrite user-modified document content', async () => {
      // Find a document and modify it
      const doc = await prisma.document.findFirst({
        where: { projectId: testProjectId, fileName: 'SYSTEM-ARCHITECTURE.md' }
      });
      expect(doc).toBeDefined();

      const customContent = '# My Custom Architecture Changes\n\nUser edited this document.';
      await prisma.document.update({
        where: { id: doc!.id },
        data: { content: customContent }
      });

      // Rerun seed
      await request(app)
        .post(`/api/v1/projects/${testProjectId}/seed-blueprint`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({ blueprintOption: 'FULL' });

      // Verify custom content is preserved
      const refreshedDoc = await prisma.document.findUnique({
        where: { id: doc!.id }
      });
      expect(refreshedDoc?.content).toBe(customContent);
    });
  });

  describe('4. Export & Directory Structure Preservation', () => {
    it('Exports ZIP archive preserving exact root and docs/ directory tree', async () => {
      const res = await request(app)
        .get(`/api/v1/projects/${testProjectId}/export`)
        .set('Authorization', `Bearer ${ownerToken}`)
        .responseType('blob');

      expect(res.status).toBe(200);

      const zip = new AdmZip(res.body);
      const entries = zip.getEntries().map((e) => e.entryName);

      // Verify root-level files exist directly at root
      expect(entries).toContain('README.md');
      expect(entries).toContain('AGENTS.md');
      expect(entries).toContain('CONTRIBUTING.md');
      expect(entries).toContain('CHANGELOG.md');
      expect(entries).toContain('PROJECT-OVERVIEW.md');
      expect(entries).toContain('INDEX.md');

      // Verify domain categories exist under docs/
      expect(entries).toContain('docs/01-project/PROJECT-REQUIREMENTS.md');
      expect(entries).toContain('docs/02-architecture/SYSTEM-ARCHITECTURE.md');
      expect(entries).toContain('docs/03-design-system/COLOR-PALETTE.md');
      expect(entries).toContain('docs/04-ui-components/BUTTONS.md');
      expect(entries).toContain('docs/08-database/DATABASE-SCHEMA.md');
      expect(entries).toContain('docs/11-devops/CI-CD-PIPELINE.md');
    });
  });

  describe('5. Minimal & Blank Blueprint Options', () => {
    it('Minimal Blueprint provisions core documents (~18 docs)', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          workspaceId,
          name: 'Minimal Microservice Project',
          blueprintOption: 'MINIMAL'
        });

      expect(res.status).toBe(201);
      const minProjectId = res.body.data.id;

      const docCount = await prisma.document.count({
        where: { projectId: minProjectId }
      });
      expect(docCount).toBe(18);
    });

    it('Blank Project provisions zero documents', async () => {
      const res = await request(app)
        .post('/api/v1/projects')
        .set('Authorization', `Bearer ${ownerToken}`)
        .send({
          workspaceId,
          name: 'Blank Scratchpad Project',
          blueprintOption: 'BLANK'
        });

      expect(res.status).toBe(201);
      const blankProjectId = res.body.data.id;

      const docCount = await prisma.document.count({
        where: { projectId: blankProjectId }
      });
      expect(docCount).toBe(0);
    });
  });
});
