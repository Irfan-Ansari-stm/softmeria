import { prisma } from '../../config/db';
import { DocumentStatus } from '@prisma/client';

export class DashboardService {
  async getDashboardStats(workspaceId: string) {
    // 1. Projects stats
    const totalProjects = await prisma.project.count({
      where: { workspaceId, isArchived: false }
    });

    const activeProjects = await prisma.project.count({
      where: { workspaceId, status: 'ACTIVE', isArchived: false }
    });

    // 2. Documents stats
    const totalDocuments = await prisma.document.count({
      where: {
        project: { workspaceId, isArchived: false },
        isArchived: false
      }
    });

    const completedDocuments = await prisma.document.count({
      where: {
        project: { workspaceId, isArchived: false },
        isArchived: false,
        status: { in: [DocumentStatus.COMPLETED, DocumentStatus.APPROVED] }
      }
    });

    const inReviewDocuments = await prisma.document.count({
      where: {
        project: { workspaceId, isArchived: false },
        isArchived: false,
        status: DocumentStatus.IN_REVIEW
      }
    });

    const nonOptionalDocs = await prisma.document.count({
      where: {
        project: { workspaceId, isArchived: false },
        isArchived: false,
        isOptional: false
      }
    });

    const completedNonOptional = await prisma.document.count({
      where: {
        project: { workspaceId, isArchived: false },
        isArchived: false,
        isOptional: false,
        status: { in: [DocumentStatus.COMPLETED, DocumentStatus.APPROVED] }
      }
    });

    const pendingDocuments = Math.max(0, totalDocuments - completedDocuments);
    const overallCompletionPercentage =
      nonOptionalDocs > 0 ? Math.round((completedNonOptional / nonOptionalDocs) * 100) : 0;

    // 3. Recently updated documents
    const recentlyUpdatedDocs = await prisma.document.findMany({
      where: {
        project: { workspaceId, isArchived: false },
        isArchived: false
      },
      take: 5,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        projectId: true,
        categoryId: true,
        title: true,
        fileName: true,
        slug: true,
        status: true,
        isOptional: true,
        sortOrder: true,
        versionNumber: true,
        createdAt: true,
        updatedAt: true
      }
    });

    // 4. Recently accessed projects
    const recentProjects = await prisma.project.findMany({
      where: { workspaceId, isArchived: false },
      take: 4,
      orderBy: { updatedAt: 'desc' },
      include: {
        documents: {
          select: {
            id: true,
            status: true,
            isOptional: true
          }
        }
      }
    });

    const formattedProjects = recentProjects.map((p) => {
      const nonOpt = p.documents.filter((d) => !d.isOptional);
      const comp = nonOpt.filter(
        (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
      ).length;
      const progress = nonOpt.length > 0 ? Math.round((comp / nonOpt.length) * 100) : 0;

      let tech: string[] = [];
      try {
        tech = JSON.parse(p.techStack);
      } catch {
        tech = [];
      }

      return {
        id: p.id,
        workspaceId: p.workspaceId,
        name: p.name,
        slug: p.slug,
        description: p.description,
        projectType: p.projectType,
        category: p.category,
        techStack: tech,
        repositoryUrl: p.repositoryUrl,
        icon: p.icon,
        color: p.color,
        visibility: p.visibility,
        status: p.status,
        totalDocuments: p.documents.length,
        completedDocuments: comp,
        completionPercentage: progress,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      };
    });

    // 5. Recent activity logs
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId },
      take: 10,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { id: true, name: true, avatarUrl: true }
        },
        project: {
          select: { id: true, name: true }
        },
        document: {
          select: { id: true, title: true }
        }
      }
    });

    const formattedActivities = activities.map((a) => {
      let meta: any = null;
      try {
        meta = a.metadata ? JSON.parse(a.metadata) : null;
      } catch {
        meta = null;
      }

      return {
        id: a.id,
        workspaceId: a.workspaceId,
        projectId: a.projectId,
        projectName: a.project?.name,
        documentId: a.documentId,
        documentTitle: a.document?.title,
        userId: a.userId,
        userName: a.user.name,
        action: a.action,
        entityType: a.entityType,
        metadata: meta,
        createdAt: a.createdAt.toISOString()
      };
    });

    return {
      totalProjects,
      activeProjects,
      totalDocuments,
      completedDocuments,
      pendingDocuments,
      inReviewDocuments,
      overallCompletionPercentage,
      recentlyUpdatedDocs: recentlyUpdatedDocs.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString()
      })),
      recentlyAccessedProjects: formattedProjects,
      recentActivities: formattedActivities
    };
  }
}

export const dashboardService = new DashboardService();

