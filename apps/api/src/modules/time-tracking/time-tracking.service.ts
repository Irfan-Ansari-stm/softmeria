import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';

export class TimeTrackingService {
  async listTimeEntries(workspaceId?: string, filters: {
    projectId?: string;
    userId?: string;
    startDate?: string;
    endDate?: string;
  } = {}) {
    const where: any = {};
    if (workspaceId) where.workspaceId = workspaceId;
    if (filters.projectId) where.projectId = filters.projectId;
    if (filters.userId) where.userId = filters.userId;
    if (filters.startDate || filters.endDate) {
      where.date = {};
      if (filters.startDate) where.date.gte = new Date(filters.startDate);
      if (filters.endDate) where.date.lte = new Date(filters.endDate);
    }

    const entries = await prisma.timeEntry.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        user: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { date: 'desc' }
    });

    const totalHours = entries.reduce((sum, e) => sum + e.hours, 0);
    const billableHours = entries.filter((e) => e.isBillable).reduce((sum, e) => sum + e.hours, 0);

    return {
      entries: entries.map((e) => ({
        ...e,
        durationMinutes: Math.round(e.hours * 60),
        projectName: e.project.name,
        taskTitle: e.task?.title
      })),
      totalHours: Number(totalHours.toFixed(1)),
      billableHours: Number(billableHours.toFixed(1)),
      nonBillableHours: Number((totalHours - billableHours).toFixed(1))
    };
  }

  async createTimeEntry(userId: string, data: {
    workspaceId?: string;
    projectId: string;
    taskId?: string;
    hours?: number;
    durationMinutes?: number;
    date?: string;
    description?: string;
    isBillable?: boolean;
  }) {
    let workspaceId = data.workspaceId;
    if (!workspaceId && data.projectId) {
      const proj = await prisma.project.findUnique({
        where: { id: data.projectId },
        select: { workspaceId: true }
      });
      workspaceId = proj?.workspaceId;
    }

    if (!workspaceId) {
      const firstWs = await prisma.workspace.findFirst({ select: { id: true } });
      workspaceId = firstWs?.id || '';
    }

    const calculatedHours = data.hours ?? (data.durationMinutes ? data.durationMinutes / 60 : 1);

    const entry = await prisma.timeEntry.create({
      data: {
        workspaceId,
        projectId: data.projectId,
        taskId: data.taskId || undefined,
        userId,
        hours: calculatedHours,
        date: data.date ? new Date(data.date) : new Date(),
        description: data.description,
        isBillable: data.isBillable !== undefined ? data.isBillable : true,
        isApproved: true
      },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Update actual hours on task if linked
    if (data.taskId) {
      const task = await prisma.task.findUnique({ where: { id: data.taskId } });
      if (task) {
        await prisma.task.update({
          where: { id: data.taskId },
          data: { actualHours: (task.actualHours || 0) + calculatedHours }
        });
      }
    }

    return {
      ...entry,
      durationMinutes: Math.round(entry.hours * 60),
      projectName: entry.project.name,
      taskTitle: entry.task?.title
    };
  }

  async updateTimeEntry(id: string, data: {
    hours?: number;
    durationMinutes?: number;
    description?: string;
    isBillable?: boolean;
    date?: string;
  }) {
    const existing = await prisma.timeEntry.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Time entry not found');

    const calculatedHours = data.hours ?? (data.durationMinutes ? data.durationMinutes / 60 : existing.hours);

    const updated = await prisma.timeEntry.update({
      where: { id },
      data: {
        hours: calculatedHours,
        description: data.description !== undefined ? data.description : existing.description,
        isBillable: data.isBillable !== undefined ? data.isBillable : existing.isBillable,
        date: data.date ? new Date(data.date) : existing.date
      },
      include: {
        project: { select: { id: true, name: true } },
        task: { select: { id: true, taskIdentifier: true, title: true } },
        user: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    return {
      ...updated,
      durationMinutes: Math.round(updated.hours * 60),
      projectName: updated.project.name,
      taskTitle: updated.task?.title
    };
  }

  async deleteTimeEntry(id: string) {
    const entry = await prisma.timeEntry.findUnique({ where: { id } });
    if (!entry) throw new NotFoundError('Time entry not found');

    if (entry.taskId) {
      const task = await prisma.task.findUnique({ where: { id: entry.taskId } });
      if (task) {
        await prisma.task.update({
          where: { id: entry.taskId },
          data: { actualHours: Math.max(0, (task.actualHours || 0) - entry.hours) }
        });
      }
    }

    await prisma.timeEntry.delete({ where: { id } });
    return { success: true, id };
  }
}

export const timeTrackingService = new TimeTrackingService();
