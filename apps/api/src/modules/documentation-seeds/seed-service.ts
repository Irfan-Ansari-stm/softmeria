import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { DocumentStatus, ActivityAction } from '@prisma/client';
import {
  BlueprintOption,
  ProjectSeedOptions,
  SeedResult,
  BlueprintManifestSummary
} from './types/seed.types';
import {
  BLUEPRINT_VERSION,
  SEED_CATEGORIES,
  ALL_SEED_DOCUMENTS,
  getManifestForOption
} from './seed-manifest';
import { slugify } from '@devblueprint/shared';

export class DocumentationSeedService {
  /**
   * Get the blueprint manifest summary for UI previews and template library exploration.
   */
  getManifestSummary(
    option: BlueprintOption = 'FULL',
    options?: ProjectSeedOptions
  ): BlueprintManifestSummary {
    const { categories, documents } = getManifestForOption(option, options);

    const categoriesWithDocs = categories.map((cat) => {
      const catDocs = documents.filter((d) => d.categorySlug === cat.slug);
      return {
        name: cat.name,
        slug: cat.slug,
        folderName: cat.folderName,
        description: cat.description,
        sortOrder: cat.sortOrder,
        documentCount: catDocs.length,
        documents: catDocs.map((d) => ({
          id: d.id,
          fileName: d.fileName,
          relativePath: d.relativePath,
          title: d.title,
          description: d.description,
          isRequired: d.isRequired,
          initialStatus: d.initialStatus,
          tags: d.tags,
          version: d.version
        }))
      };
    });

    return {
      version: BLUEPRINT_VERSION,
      totalCategories: categories.length,
      totalDocuments: documents.length,
      categories: categoriesWithDocs
    };
  }

  /**
   * Seeds documentation blueprint into a project with strict idempotency and transaction safety.
   * If documents already exist, their content is preserved without overwriting.
   */
  async seedProjectDocumentation(
    projectId: string,
    userId: string,
    options?: ProjectSeedOptions
  ): Promise<SeedResult> {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        workspace: true,
        categories: {
          include: {
            documents: true
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundError(`Project with id ${projectId} not found`);
    }

    const blueprintOption = options?.blueprintOption || 'FULL';
    if (blueprintOption === 'BLANK') {
      return {
        projectId,
        categoriesCreated: 0,
        documentsCreated: 0,
        documentsUpdated: 0,
        documentsSkipped: 0,
        blueprintOption: 'BLANK',
        totalDocuments: 0,
        requiredDocuments: 0,
        completedDocuments: 0,
        completionPercentage: 0,
        summary: { categoryCounts: {} }
      };
    }

    const seedOptions: ProjectSeedOptions = {
      projectName: project.name,
      projectType: project.projectType,
      ...options
    };

    const { categories: manifestCategories, documents: manifestDocs } = getManifestForOption(
      blueprintOption,
      seedOptions
    );

    return await prisma.$transaction(async (tx) => {
      let categoriesCreated = 0;
      let documentsCreated = 0;
      let documentsSkipped = 0;
      const categoryCounts: Record<string, number> = {};

      // Map existing categories by slug
      const categoryMap = new Map<string, string>();
      for (const existingCat of project.categories) {
        categoryMap.set(existingCat.slug, existingCat.id);
      }

      // 1. Ensure all required categories exist
      for (const catDef of manifestCategories) {
        let categoryId = categoryMap.get(catDef.slug);

        if (!categoryId) {
          const newCat = await tx.category.create({
            data: {
              projectId,
              name: catDef.name,
              slug: catDef.slug,
              description: catDef.description,
              sortOrder: catDef.sortOrder,
              isCustom: false
            }
          });
          categoryId = newCat.id;
          categoryMap.set(catDef.slug, categoryId);
          categoriesCreated++;
        }
      }

      // Map existing documents by category + fileName (each category can have files like ACCESSIBILITY.md or PROJECT-STRUCTURE.md)
      const existingDocKeys = new Set<string>();
      for (const cat of project.categories) {
        for (const doc of cat.documents) {
          existingDocKeys.add(`${cat.slug}/${doc.fileName}`.toLowerCase());
          existingDocKeys.add(`${cat.id}/${doc.fileName}`.toLowerCase());
        }
      }

      // 2. Provision documents
      let docSortCounter: Record<string, number> = {};

      for (const docDef of manifestDocs) {
        const categoryId = categoryMap.get(docDef.categorySlug);
        if (!categoryId) continue;

        const pathKey = `${docDef.categorySlug}/${docDef.fileName}`.toLowerCase();
        const catDocKey = `${categoryId}/${docDef.fileName}`.toLowerCase();

        categoryCounts[docDef.categorySlug] = (categoryCounts[docDef.categorySlug] || 0) + 1;

        // Idempotency: Check if doc already exists in this category
        if (existingDocKeys.has(pathKey) || existingDocKeys.has(catDocKey)) {
          documentsSkipped++;
          continue;
        }

        docSortCounter[docDef.categorySlug] = (docSortCounter[docDef.categorySlug] || 0) + 1;
        const currentSortOrder = docSortCounter[docDef.categorySlug];

        const createdDoc = await tx.document.create({
          data: {
            projectId,
            categoryId,
            title: docDef.title,
            fileName: docDef.fileName,
            slug: slugify(docDef.title),
            description: docDef.description,
            content: docDef.content,
            status: docDef.initialStatus,
            isOptional: !docDef.isRequired,
            sortOrder: currentSortOrder,
            versionNumber: 1,
            createdById: userId
          }
        });

        // Record initial version snapshot
        await tx.documentVersion.create({
          data: {
            documentId: createdDoc.id,
            versionNumber: 1,
            title: docDef.title,
            content: docDef.content,
            changeSummary: `Seeded from Enterprise Blueprint template v${docDef.version}`,
            authorId: userId
          }
        });

        existingDocKeys.add(pathKey);
        existingDocKeys.add(catDocKey);
        documentsCreated++;
      }

      // Log seed activity
      await tx.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: project.id,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'DOCUMENTATION_BLUEPRINT',
          metadata: JSON.stringify({
            blueprintOption,
            categoriesCreated,
            documentsCreated,
            documentsSkipped,
            version: BLUEPRINT_VERSION
          })
        }
      });

      // Compute actual progress numbers
      const allActiveDocs = await tx.document.findMany({
        where: { projectId, isArchived: false }
      });

      const requiredDocs = allActiveDocs.filter((d) => !d.isOptional && d.status !== DocumentStatus.ARCHIVED);
      const completedDocs = requiredDocs.filter(
        (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
      );

      const completionPercentage =
        requiredDocs.length > 0 ? Math.round((completedDocs.length / requiredDocs.length) * 100) : 0;

      return {
        projectId,
        categoriesCreated,
        documentsCreated,
        documentsUpdated: 0,
        documentsSkipped,
        blueprintOption,
        totalDocuments: allActiveDocs.length,
        requiredDocuments: requiredDocs.length,
        completedDocuments: completedDocs.length,
        completionPercentage,
        summary: {
          categoryCounts
        }
      };
    });
  }

  /**
   * Apply a single blueprint category and its documents to an existing project.
   */
  async applyBlueprintCategory(
    projectId: string,
    categorySlug: string,
    userId: string
  ): Promise<SeedResult> {
    return this.seedProjectDocumentation(projectId, userId, {
      blueprintOption: 'CUSTOM',
      selectedCategories: [categorySlug]
    });
  }
}

export const documentationSeedService = new DocumentationSeedService();
