import { prisma } from '../../config/db';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { slugify } from '@devblueprint/shared';
import { ProjectStatus, ProjectVisibility, DocumentStatus, ActivityAction } from '@prisma/client';
import { documentationSeedService } from '../documentation-seeds/seed-service';
import { BlueprintOption } from '../documentation-seeds/types/seed.types';

export class ProjectService {
  async listProjects(
    workspaceId: string,
    query: {
      status?: ProjectStatus;
      type?: string;
      search?: string;
      includeArchived?: boolean;
    }
  ) {
    const where: any = {
      workspaceId,
      isArchived: query.includeArchived ? undefined : false
    };

    if (query.status) {
      where.status = query.status;
    }

    if (query.type) {
      where.projectType = query.type;
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { category: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const projects = await prisma.project.findMany({
      where,
      include: {
        documents: {
          select: {
            id: true,
            status: true,
            isOptional: true
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    });

    return projects.map((p) => {
      const nonOptionalDocs = p.documents.filter(
        (d) => !d.isOptional && d.status !== DocumentStatus.ARCHIVED
      );
      const totalDocs = nonOptionalDocs.length;
      const completedDocs = nonOptionalDocs.filter(
        (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
      ).length;

      const completionPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

      let techStack: string[] = [];
      try {
        techStack = JSON.parse(p.techStack);
      } catch {
        techStack = [];
      }

      return {
        id: p.id,
        workspaceId: p.workspaceId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        projectType: p.projectType,
        category: p.category,
        techStack,
        repositoryUrl: p.repositoryUrl,
        icon: p.icon,
        color: p.color,
        visibility: p.visibility,
        status: p.status,
        isArchived: p.isArchived,
        totalDocuments: p.documents.length,
        completedDocuments: completedDocs,
        completionPercentage,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      };
    });
  }

  async getProject(projectId: string) {
    const project = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        },
        members: {
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true }
            }
          }
        },
        documents: {
          select: {
            id: true,
            status: true,
            isOptional: true
          }
        }
      }
    });

    if (!project) {
      throw new NotFoundError('Project not found');
    }

    const nonOptionalDocs = project.documents.filter(
      (d) => !d.isOptional && d.status !== DocumentStatus.ARCHIVED
    );
    const totalDocs = nonOptionalDocs.length;
    const completedDocs = nonOptionalDocs.filter(
      (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
    ).length;
    const completionPercentage = totalDocs > 0 ? Math.round((completedDocs / totalDocs) * 100) : 0;

    let techStack: string[] = [];
    try {
      techStack = JSON.parse(project.techStack);
    } catch {
      techStack = [];
    }

    return {
      id: project.id,
      workspaceId: project.workspaceId,
      name: project.name,
      slug: project.slug,
      description: project.description,
      projectType: project.projectType,
      category: project.category,
      techStack,
      repositoryUrl: project.repositoryUrl,
      icon: project.icon,
      color: project.color,
      visibility: project.visibility,
      status: project.status,
      isArchived: project.isArchived,
      totalDocuments: project.documents.length,
      completedDocuments: completedDocs,
      completionPercentage,
      createdBy: project.createdBy,
      members: project.members.map((m) => ({
        id: m.id,
        user: m.user,
        role: m.role
      })),
      createdAt: project.createdAt.toISOString(),
      updatedAt: project.updatedAt.toISOString()
    };
  }

  async createProject(
    userId: string,
    data: {
      workspaceId: string;
      name: string;
      slug?: string;
      description?: string;
      projectType?: string;
      category?: string;
      techStack?: string[];
      repositoryUrl?: string | null;
      icon?: string;
      color?: string;
      visibility?: ProjectVisibility;
      status?: ProjectStatus;
      initDefaultCategories?: boolean;
      blueprintOption?: BlueprintOption;
      selectedCategories?: string[];
      selectedDocumentIds?: string[];
    }
  ) {
    const baseSlug = slugify(data.slug || data.name) || 'project';
    let slug = baseSlug;
    let count = 1;

    while (
      await prisma.project.findUnique({
        where: {
          workspaceId_slug: {
            workspaceId: data.workspaceId,
            slug
          }
        }
      })
    ) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    const blueprintOption: BlueprintOption =
      data.blueprintOption || (data.initDefaultCategories === false ? 'BLANK' : 'FULL');

    const project = await prisma.$transaction(async (tx) => {
      const p = await tx.project.create({
        data: {
          workspaceId: data.workspaceId,
          name: data.name,
          slug,
          description: data.description,
          projectType: data.projectType || 'Web application',
          category: data.category || 'Engineering',
          techStack: JSON.stringify(data.techStack || []),
          repositoryUrl: data.repositoryUrl,
          icon: data.icon || 'folder',
          color: data.color || '#4f46e5',
          visibility: data.visibility || ProjectVisibility.PRIVATE,
          status: data.status || ProjectStatus.ACTIVE,
          createdById: userId
        }
      });

      await tx.activityLog.create({
        data: {
          workspaceId: data.workspaceId,
          projectId: p.id,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'PROJECT',
          metadata: JSON.stringify({ projectName: p.name, blueprintOption })
        }
      });

      return p;
    });

    // Automatically seed enterprise documentation blueprint
    if (blueprintOption !== 'BLANK') {
      await documentationSeedService.seedProjectDocumentation(project.id, userId, {
        projectName: project.name,
        projectType: project.projectType,
        techStack: data.techStack,
        blueprintOption,
        selectedCategories: data.selectedCategories,
        selectedDocumentIds: data.selectedDocumentIds
      });
    }

    return project;
  }

  async updateProject(
    projectId: string,
    data: {
      name?: string;
      description?: string | null;
      projectType?: string;
      category?: string;
      techStack?: string[];
      repositoryUrl?: string | null;
      icon?: string;
      color?: string;
      visibility?: ProjectVisibility;
      status?: ProjectStatus;
    }
  ) {
    const existing = await prisma.project.findUnique({ where: { id: projectId } });
    if (!existing) throw new NotFoundError('Project not found');

    const updated = await prisma.project.update({
      where: { id: projectId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.description !== undefined ? { description: data.description } : {}),
        ...(data.projectType ? { projectType: data.projectType } : {}),
        ...(data.category ? { category: data.category } : {}),
        ...(data.techStack ? { techStack: JSON.stringify(data.techStack) } : {}),
        ...(data.repositoryUrl !== undefined ? { repositoryUrl: data.repositoryUrl } : {}),
        ...(data.icon ? { icon: data.icon } : {}),
        ...(data.color ? { color: data.color } : {}),
        ...(data.visibility ? { visibility: data.visibility } : {}),
        ...(data.status ? { status: data.status } : {})
      }
    });

    return updated;
  }

  async duplicateProject(projectId: string, userId: string) {
    const original = await prisma.project.findUnique({
      where: { id: projectId },
      include: {
        categories: {
          include: {
            documents: true
          }
        }
      }
    });

    if (!original) throw new NotFoundError('Project not found');

    const newName = `${original.name} (Copy)`;
    const baseSlug = `${original.slug}-copy`;
    let slug = baseSlug;
    let count = 1;

    while (
      await prisma.project.findUnique({
        where: {
          workspaceId_slug: {
            workspaceId: original.workspaceId,
            slug
          }
        }
      })
    ) {
      slug = `${baseSlug}-${count}`;
      count++;
    }

    return await prisma.$transaction(async (tx) => {
      const duplicated = await tx.project.create({
        data: {
          workspaceId: original.workspaceId,
          name: newName,
          slug,
          description: original.description,
          projectType: original.projectType,
          category: original.category,
          techStack: original.techStack,
          repositoryUrl: original.repositoryUrl,
          icon: original.icon,
          color: original.color,
          visibility: original.visibility,
          status: ProjectStatus.PLANNING,
          createdById: userId
        }
      });

      for (const cat of original.categories) {
        const newCat = await tx.category.create({
          data: {
            projectId: duplicated.id,
            name: cat.name,
            slug: cat.slug,
            description: cat.description,
            sortOrder: cat.sortOrder,
            isCustom: cat.isCustom
          }
        });

        for (const doc of cat.documents) {
          const newDoc = await tx.document.create({
            data: {
              projectId: duplicated.id,
              categoryId: newCat.id,
              title: doc.title,
              fileName: doc.fileName,
              slug: doc.slug,
              description: doc.description,
              content: doc.content,
              status: DocumentStatus.DRAFT,
              isOptional: doc.isOptional,
              sortOrder: doc.sortOrder,
              versionNumber: 1,
              createdById: userId
            }
          });

          await tx.documentVersion.create({
            data: {
              documentId: newDoc.id,
              versionNumber: 1,
              title: newDoc.title,
              content: newDoc.content,
              changeSummary: 'Duplicated from ' + original.name,
              authorId: userId
            }
          });
        }
      }

      return duplicated;
    });
  }

  async archiveProject(projectId: string) {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isArchived: true, status: ProjectStatus.ARCHIVED }
    });
    return updated;
  }

  async restoreProject(projectId: string) {
    const updated = await prisma.project.update({
      where: { id: projectId },
      data: { isArchived: false, status: ProjectStatus.ACTIVE }
    });
    return updated;
  }

  async deleteProject(projectId: string) {
    await prisma.project.delete({
      where: { id: projectId }
    });
    return { message: 'Project deleted successfully' };
  }
}

export const projectService = new ProjectService();

