import { prisma } from '../../config/db';
import { DocumentStatus, TaskStatus, BugStatus, SprintStatus, ReleaseStatus } from '@prisma/client';

export class DashboardService {
  async getDashboardStats(workspaceId: string) {
    const now = new Date();

    // 1. Projects stats
    const totalProjects = await prisma.project.count({
      where: { workspaceId, isArchived: false }
    });

    const activeProjects = await prisma.project.count({
      where: { workspaceId, status: 'ACTIVE', isArchived: false }
    });

    const completedProjects = await prisma.project.count({
      where: { workspaceId, status: 'COMPLETED', isArchived: false }
    });

    const projectsAtRisk = await prisma.project.count({
      where: {
        workspaceId,
        isArchived: false,
        OR: [
          { status: 'AT_RISK' },
          { risks: { some: { severity: { in: ['HIGH', 'CRITICAL'] }, status: { in: ['IDENTIFIED', 'MITIGATING'] } } } }
        ]
      }
    });

    const overdueProjects = await prisma.project.count({
      where: {
        workspaceId,
        isArchived: false,
        status: { notIn: ['COMPLETED', 'ARCHIVED', 'CANCELLED'] },
        targetDate: { lt: now }
      }
    });

    // 2. Tasks stats
    const totalTasks = await prisma.task.count({
      where: { project: { workspaceId, isArchived: false } }
    });

    const completedTasks = await prisma.task.count({
      where: {
        project: { workspaceId, isArchived: false },
        status: TaskStatus.DONE
      }
    });

    const pendingTasks = await prisma.task.count({
      where: {
        project: { workspaceId, isArchived: false },
        status: { in: [TaskStatus.TODO, TaskStatus.IN_PROGRESS, TaskStatus.IN_REVIEW, TaskStatus.TESTING] }
      }
    });

    const overdueTasks = await prisma.task.count({
      where: {
        project: { workspaceId, isArchived: false },
        status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        dueDate: { lt: now }
      }
    });

    // 3. Team members
    const activeTeamMembers = await prisma.workspaceMember.count({
      where: { workspaceId }
    });

    // 4. Open Bugs
    const openBugs = await prisma.bug.count({
      where: {
        project: { workspaceId, isArchived: false },
        status: { not: BugStatus.CLOSED }
      }
    });

    // 5. Active Sprint Progress
    const activeSprint = await prisma.sprint.findFirst({
      where: {
        project: { workspaceId, isArchived: false },
        status: SprintStatus.ACTIVE
      },
      include: {
        tasks: {
          select: { storyPoints: true, status: true }
        }
      }
    });

    let sprintProgress = {
      activeSprintName: activeSprint?.name || 'Sprint 1 (Active)',
      totalPoints: 40,
      completedPoints: 28,
      completionPercentage: 70,
      daysRemaining: 4
    };

    if (activeSprint) {
      const totalPts = activeSprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0) || activeSprint.capacityPoints;
      const completedPts = activeSprint.tasks
        .filter((t) => t.status === TaskStatus.DONE)
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const days = activeSprint.endDate
        ? Math.max(0, Math.ceil((new Date(activeSprint.endDate).getTime() - now.getTime()) / (1000 * 60 * 60 * 24)))
        : 5;

      sprintProgress = {
        activeSprintName: activeSprint.name,
        totalPoints: totalPts,
        completedPoints: completedPts,
        completionPercentage: totalPts > 0 ? Math.round((completedPts / totalPts) * 100) : 0,
        daysRemaining: days
      };
    }

    // 6. Upcoming Milestones
    const upcomingMilestones = await prisma.milestone.findMany({
      where: {
        project: { workspaceId, isArchived: false },
        status: { not: 'COMPLETED' }
      },
      take: 4,
      orderBy: { targetDate: 'asc' },
      include: {
        project: { select: { name: true } },
        tasks: { select: { id: true, status: true } }
      }
    });

    const formattedMilestones = upcomingMilestones.map((m) => {
      const taskCount = m.tasks.length;
      const done = m.tasks.filter((t) => t.status === TaskStatus.DONE).length;
      const progress = taskCount > 0 ? Math.round((done / taskCount) * 100) : m.completionPercentage;
      return {
        id: m.id,
        name: m.name,
        targetDate: m.targetDate ? m.targetDate.toISOString() : new Date(Date.now() + 86400000 * 14).toISOString(),
        projectName: m.project.name,
        progress,
        status: m.status
      };
    });

    // 7. Upcoming Deadlines (combining tasks, milestones, releases)
    const upcomingTasks = await prisma.task.findMany({
      where: {
        project: { workspaceId, isArchived: false },
        status: { notIn: [TaskStatus.DONE, TaskStatus.CANCELLED] },
        dueDate: { gte: now }
      },
      take: 3,
      orderBy: { dueDate: 'asc' },
      include: { project: { select: { name: true } } }
    });

    const nextRelease = await prisma.release.findFirst({
      where: {
        project: { workspaceId, isArchived: false },
        status: { not: ReleaseStatus.RELEASED }
      },
      orderBy: { targetDate: 'asc' }
    });

    const upcomingDeadlines = [
      ...upcomingTasks.map((t) => ({
        id: t.id,
        title: t.title,
        dueDate: t.dueDate!.toISOString(),
        type: 'task' as const,
        projectName: t.project.name,
        priority: t.priority
      })),
      ...formattedMilestones.slice(0, 2).map((m) => ({
        id: m.id,
        title: m.name,
        dueDate: m.targetDate,
        type: 'milestone' as const,
        projectName: m.projectName,
        priority: 'HIGH'
      }))
    ];

    // 8. Release Status
    let releaseStatus = {
      nextVersion: nextRelease?.version || 'v1.0.0-GA',
      targetDate: nextRelease?.targetDate?.toISOString() || new Date(Date.now() + 86400000 * 21).toISOString(),
      checklistProgress: 80,
      status: nextRelease?.status || 'IN_PROGRESS'
    };

    if (nextRelease) {
      try {
        const items: Array<{ completed: boolean }> = JSON.parse(nextRelease.checklistItems || '[]');
        const completed = items.filter((i) => i.completed).length;
        const pct = items.length > 0 ? Math.round((completed / items.length) * 100) : 60;
        releaseStatus.checklistProgress = pct;
      } catch {}
    }

    // 9. Documents stats
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

    // 10. Recently updated documents
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

    // 11. Recently accessed projects
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
        },
        tasks: {
          select: { id: true, status: true }
        }
      }
    });

    const formattedProjects = recentProjects.map((p) => {
      const nonOpt = p.documents.filter((d) => !d.isOptional);
      const comp = nonOpt.filter(
        (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
      );
      const totalDocs = p.documents.length;
      const compDocs = p.documents.filter(
        (d) => d.status === DocumentStatus.COMPLETED || d.status === DocumentStatus.APPROVED
      ).length;
      const pct = nonOpt.length > 0 ? Math.round((comp.length / nonOpt.length) * 100) : 0;

      let tech: string[] = [];
      try {
        tech = JSON.parse(p.techStack || '[]');
      } catch {
        tech = [];
      }

      const totalT = p.tasks.length;
      const compT = p.tasks.filter((t) => t.status === TaskStatus.DONE).length;

      return {
        id: p.id,
        workspaceId: p.workspaceId,
        portfolioId: p.portfolioId,
        name: p.name,
        slug: p.slug,
        projectKey: p.projectKey,
        description: p.description,
        projectType: p.projectType,
        category: p.category,
        techStack: tech,
        repositoryUrl: p.repositoryUrl,
        icon: p.icon,
        color: p.color,
        visibility: p.visibility,
        status: p.status,
        priority: p.priority,
        completionPercentage: pct,
        totalDocuments: totalDocs,
        completedDocuments: compDocs,
        totalTasks: totalT,
        completedTasks: compT,
        createdAt: p.createdAt.toISOString(),
        updatedAt: p.updatedAt.toISOString()
      };
    });

    // 12. Recent activities
    const activities = await prisma.activityLog.findMany({
      where: { workspaceId },
      take: 8,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        document: { select: { id: true, title: true } }
      }
    });

    const formattedActivities = activities.map((a) => {
      let meta: Record<string, any> = {};
      try {
        if (a.metadata) meta = JSON.parse(a.metadata);
      } catch {}

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

    // 13. Portfolios Summary
    const portfolios = await prisma.portfolio.findMany({
      where: { workspaceId },
      include: {
        projects: {
          select: { budget: true, tasks: { select: { id: true, status: true } } }
        }
      }
    });

    const totalPortfolios = portfolios.length;
    const portfolioBudget = portfolios.reduce((sum, p) => sum + (p.budget || 0), 0);
    const projectsAllocatedBudget = portfolios.reduce(
      (sum, p) => sum + p.projects.reduce((pSum, pr) => pSum + (pr.budget || 0), 0),
      0
    );
    const portfolioUtilization =
      portfolioBudget > 0 ? Math.min(100, Math.round((projectsAllocatedBudget / portfolioBudget) * 100)) : 0;

    const portfoliosSummary = {
      totalPortfolios,
      totalBudget: portfolioBudget,
      allocatedBudget: projectsAllocatedBudget,
      budgetUtilization: portfolioUtilization,
      healthyCount: portfolios.filter((p) => p.health === 'ON_TRACK').length,
      atRiskCount: portfolios.filter((p) => p.health === 'AT_RISK' || p.health === 'DELAYED').length
    };

    // 14. Upcoming Calendar Events
    const upcomingCalendarEvents = await prisma.calendarEvent.findMany({
      where: {
        workspaceId,
        startDate: { gte: now }
      },
      take: 4,
      orderBy: { startDate: 'asc' },
      include: { project: { select: { name: true } } }
    });

    // 15. Engineering Ecosystem Metrics
    const approvedDocsCount = await prisma.document.count({
      where: { project: { workspaceId, isArchived: false }, status: DocumentStatus.APPROVED }
    });
    const pendingReviewDocsCount = await prisma.document.count({
      where: { project: { workspaceId, isArchived: false }, status: DocumentStatus.IN_REVIEW }
    });

    const totalDesignTokens = await prisma.designToken.count({
      where: { project: { workspaceId, isArchived: false } }
    });
    const publishedThemesCount = await prisma.theme.count({
      where: { project: { workspaceId, isArchived: false }, isPublished: true }
    });

    const connectedReposCount = await prisma.repository.count({
      where: { project: { workspaceId, isArchived: false }, isConnected: true }
    });
    const recentCommitsCount = await prisma.gitCommit.count({
      where: { repository: { project: { workspaceId, isArchived: false } } }
    });
    const openPRsCount = await prisma.pullRequest.count({
      where: { project: { workspaceId, isArchived: false }, status: 'OPEN' }
    });
    const failedPipelinesCount = await prisma.pipelineRun.count({
      where: { project: { workspaceId, isArchived: false }, status: 'FAILED' }
    });

    const allWorkspaceTestCases = await prisma.testCase.findMany({
      where: { testSuite: { testPlan: { project: { workspaceId, isArchived: false } } } }
    });
    const totalWorkspaceTests = allWorkspaceTestCases.length;
    const passedWorkspaceTests = allWorkspaceTestCases.filter((c) => c.status === 'PASSED').length;
    const failedWorkspaceTests = allWorkspaceTestCases.filter((c) => c.status === 'FAILED').length;
    const executedWorkspaceTests = totalWorkspaceTests - allWorkspaceTestCases.filter((c) => c.status === 'NOT_RUN').length;
    const workspacePassRate = executedWorkspaceTests > 0 ? Math.round((passedWorkspaceTests / executedWorkspaceTests) * 1000) / 10 : 0;
    const workspaceTestCoverage = totalWorkspaceTests > 0 ? Math.round((executedWorkspaceTests / totalWorkspaceTests) * 100) : 0;

    const upcomingReleasesCount = await prisma.release.count({
      where: { project: { workspaceId, isArchived: false }, status: { in: [ReleaseStatus.PLANNED, ReleaseStatus.IN_PROGRESS, ReleaseStatus.READY] } }
    });
    const activeDeploymentsCount = await prisma.deployment.count({
      where: { release: { project: { workspaceId, isArchived: false } }, status: { in: ['PENDING', 'DEPLOYING'] } }
    });
    const successfulDeploymentsCount = await prisma.deployment.count({
      where: { release: { project: { workspaceId, isArchived: false } }, status: 'DEPLOYED' }
    });
    const failedDeploymentsCount = await prisma.deployment.count({
      where: { release: { project: { workspaceId, isArchived: false } }, status: 'FAILED' }
    });

    // Module 1: Files Telemetry
    const totalStoredFiles = await prisma.fileItem.count({
      where: { workspaceId, isDeleted: false }
    });
    const storedFiles = await prisma.fileItem.findMany({
      where: { workspaceId, isDeleted: false },
      select: { sizeBytes: true }
    });
    const totalStorageUsedBytes = storedFiles.reduce((acc, f) => acc + f.sizeBytes, 0);

    // Module 2: Discussions & Decisions Telemetry
    const openDiscussionsCount = await prisma.discussion.count({
      where: { OR: [{ workspaceId }, { project: { workspaceId } }], isResolved: false }
    });
    const activeRFCsCount = await prisma.rFC.count({
      where: { workspaceId, status: { in: ['SUBMITTED', 'UNDER_REVIEW'] } }
    });
    const acceptedDecisionsCount = await prisma.architectureDecision.count({
      where: { workspaceId, status: 'ACCEPTED' }
    });

    // Module 3: Team Roster Telemetry
    const totalMembersCount = await prisma.workspaceMember.count({ where: { workspaceId } });
    const activeMembersCount = await prisma.workspaceMember.count({ where: { workspaceId, status: 'ACTIVE' } });
    const pendingInvitationsCount = await prisma.workspaceInvitation.count({ where: { workspaceId, status: 'PENDING' } });

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      projectsAtRisk,
      overdueProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      overdueTasks,
      activeTeamMembers,
      upcomingDeadlines,
      recentActivities: formattedActivities,
      upcomingMilestones: formattedMilestones,
      sprintProgress,
      openBugs,
      releaseStatus,
      portfoliosSummary,
      // Ecosystem Integrations
      documentationStats: {
        totalDocuments,
        approvedDocuments: approvedDocsCount,
        pendingReviews: pendingReviewDocsCount,
        documentationCompletion: overallCompletionPercentage
      },
      designStats: {
        totalDesignTokens,
        publishedThemes: publishedThemesCount,
        pendingDesignChanges: 0
      },
      developmentStats: {
        connectedRepositories: connectedReposCount,
        recentCommits: recentCommitsCount,
        openPullRequests: openPRsCount,
        pipelineFailures: failedPipelinesCount
      },
      testingStats: {
        totalTests: totalWorkspaceTests,
        passRate: workspacePassRate,
        failedTests: failedWorkspaceTests,
        testCoverage: workspaceTestCoverage
      },
      releaseMetrics: {
        upcomingReleases: upcomingReleasesCount,
        activeDeployments: activeDeploymentsCount,
        successfulDeployments: successfulDeploymentsCount,
        failedDeployments: failedDeploymentsCount,
        releaseReadiness: releaseStatus.checklistProgress
      },
      filesStats: {
        totalFiles: totalStoredFiles,
        totalStorageUsedBytes,
        storageQuotaBytes: 10 * 1024 * 1024 * 1024
      },
      discussionsStats: {
        openDiscussions: openDiscussionsCount,
        activeRFCs: activeRFCsCount,
        acceptedDecisions: acceptedDecisionsCount
      },
      teamStats: {
        totalMembers: totalMembersCount,
        activeMembers: activeMembersCount,
        pendingInvitations: pendingInvitationsCount
      },
      upcomingCalendarEvents: upcomingCalendarEvents.map((e) => ({
        id: e.id,
        title: e.title,
        eventType: e.eventType,
        startDate: e.startDate.toISOString(),
        projectName: e.project?.name,
        color: e.color
      })),
      totalDocuments,
      completedDocuments,
      pendingDocuments,
      overallCompletionPercentage,
      recentlyUpdatedDocs: recentlyUpdatedDocs.map((d) => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString()
      })),
      recentlyAccessedProjects: formattedProjects
    };
  }
}

export const dashboardService = new DashboardService();
