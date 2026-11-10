import { prisma } from '../../config/db';
import { BugSeverity, BugStatus, TaskPriority } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';

export class BugService {
  async listBugs(projectId: string, filters: {
    status?: BugStatus;
    severity?: BugSeverity;
    priority?: TaskPriority;
    assigneeId?: string;
    environment?: string;
  } = {}) {
    const where: any = { projectId };
    if (filters.status) where.status = filters.status;
    if (filters.severity) where.severity = filters.severity;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.environment) where.environment = filters.environment;

    return prisma.bug.findMany({
      where,
      include: {
        reporter: { select: { id: true, name: true, avatarUrl: true, email: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true, email: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        relatedRelease: { select: { id: true, version: true, title: true } }
      },
      orderBy: [{ severity: 'desc' }, { createdAt: 'desc' }]
    });
  }

  async getBug(bugId: string) {
    const bug = await prisma.bug.findUnique({
      where: { id: bugId },
      include: {
        project: { select: { id: true, name: true, projectKey: true } },
        reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        relatedRelease: { select: { id: true, version: true, title: true } },
        testCases: { select: { id: true, caseIdentifier: true, title: true, status: true } }
      }
    });

    if (!bug) throw new NotFoundError('Bug not found');
    return bug;
  }

  async getQualityAnalytics(projectId: string) {
    const bugs = await prisma.bug.findMany({
      where: { projectId },
      select: {
        id: true,
        severity: true,
        status: true,
        environment: true,
        createdAt: true,
        updatedAt: true
      }
    });

    const totalBugs = bugs.length;
    const critical = bugs.filter((b) => b.severity === BugSeverity.CRITICAL).length;
    const high = bugs.filter((b) => b.severity === BugSeverity.HIGH).length;
    const medium = bugs.filter((b) => b.severity === BugSeverity.MEDIUM).length;
    const low = bugs.filter((b) => b.severity === BugSeverity.LOW).length;

    const openBugs = bugs.filter((b) => ['OPEN', 'CONFIRMED', 'IN_PROGRESS', 'REOPENED'].includes(b.status)).length;
    const resolvedBugs = bugs.filter((b) => ['FIXED', 'READY_FOR_TESTING', 'VERIFIED', 'CLOSED'].includes(b.status)).length;

    // Breakdown by environment
    const environments: Record<string, number> = {};
    bugs.forEach((b) => {
      const env = b.environment || 'Staging';
      environments[env] = (environments[env] || 0) + 1;
    });

    // Breakdown by status
    const statusCounts: Record<string, number> = {};
    bugs.forEach((b) => {
      statusCounts[b.status] = (statusCounts[b.status] || 0) + 1;
    });

    const resolutionRate = totalBugs > 0 ? Math.round((resolvedBugs / totalBugs) * 100) : 100;

    return {
      totalBugs,
      openBugs,
      resolvedBugs,
      critical,
      high,
      medium,
      low,
      resolutionRate,
      environments,
      statusCounts
    };
  }

  async createBug(userId: string, data: {
    projectId: string;
    title: string;
    description: string;
    severity?: BugSeverity;
    priority?: TaskPriority;
    environment?: string;
    browser?: string;
    device?: string;
    stepsToReproduce?: string;
    expectedResult?: string;
    actualResult?: string;
    rootCause?: string;
    resolutionNotes?: string;
    assigneeId?: string;
    taskId?: string;
    relatedReleaseId?: string;
  }) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { projectKey: true }
    });

    const count = await prisma.bug.count({ where: { projectId: data.projectId } });
    const pKey = project?.projectKey || 'BUG';
    const bugIdentifier = `${pKey}-BUG-${count + 101}`;

    return prisma.bug.create({
      data: {
        projectId: data.projectId,
        bugIdentifier,
        title: data.title,
        description: data.description,
        severity: data.severity || BugSeverity.MEDIUM,
        priority: data.priority || TaskPriority.MEDIUM,
        status: BugStatus.OPEN,
        environment: data.environment || 'Staging',
        browser: data.browser || 'Chrome 122',
        device: data.device || 'Desktop macOS',
        stepsToReproduce: data.stepsToReproduce,
        expectedResult: data.expectedResult,
        actualResult: data.actualResult,
        rootCause: data.rootCause,
        resolutionNotes: data.resolutionNotes,
        reporterId: userId,
        assigneeId: data.assigneeId,
        taskId: data.taskId,
        relatedReleaseId: data.relatedReleaseId
      },
      include: {
        reporter: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } }
      }
    });
  }

  async updateBug(bugId: string, data: any) {
    const existing = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!existing) throw new NotFoundError('Bug not found');

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.severity !== undefined) updatePayload.severity = data.severity;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.environment !== undefined) updatePayload.environment = data.environment;
    if (data.browser !== undefined) updatePayload.browser = data.browser;
    if (data.device !== undefined) updatePayload.device = data.device;
    if (data.stepsToReproduce !== undefined) updatePayload.stepsToReproduce = data.stepsToReproduce;
    if (data.expectedResult !== undefined) updatePayload.expectedResult = data.expectedResult;
    if (data.actualResult !== undefined) updatePayload.actualResult = data.actualResult;
    if (data.rootCause !== undefined) updatePayload.rootCause = data.rootCause;
    if (data.resolutionNotes !== undefined) updatePayload.resolutionNotes = data.resolutionNotes;
    if (data.assigneeId !== undefined) updatePayload.assigneeId = data.assigneeId ? data.assigneeId : null;
    if (data.taskId !== undefined) updatePayload.taskId = data.taskId ? data.taskId : null;
    if (data.relatedReleaseId !== undefined) updatePayload.relatedReleaseId = data.relatedReleaseId ? data.relatedReleaseId : null;

    return prisma.bug.update({
      where: { id: bugId },
      data: updatePayload,
      include: {
        reporter: { select: { id: true, name: true, avatarUrl: true } },
        assignee: { select: { id: true, name: true, avatarUrl: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } }
      }
    });
  }

  async deleteBug(bugId: string) {
    const existing = await prisma.bug.findUnique({ where: { id: bugId } });
    if (!existing) throw new NotFoundError('Bug not found');
    await prisma.bug.delete({ where: { id: bugId } });
    return { success: true, id: bugId };
  }
}

export const bugService = new BugService();
