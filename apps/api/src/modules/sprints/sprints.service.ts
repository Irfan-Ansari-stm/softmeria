import { prisma } from '../../config/db';
import { SprintStatus, TaskStatus } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class SprintService {
  async listSprints(projectId: string) {
    const sprints = await prisma.sprint.findMany({
      where: { projectId },
      include: {
        tasks: {
          select: { id: true, storyPoints: true, status: true, title: true, taskIdentifier: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return sprints.map((s) => {
      const totalStoryPoints = s.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const completedStoryPoints = s.tasks
        .filter((t) => t.status === TaskStatus.DONE)
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      return {
        ...s,
        totalStoryPoints,
        completedStoryPoints,
        taskCount: s.tasks.length,
        completedTaskCount: s.tasks.filter((t) => t.status === TaskStatus.DONE).length
      };
    });
  }

  async getSprint(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        project: { select: { id: true, name: true, projectKey: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true, email: true } },
            labelAssignments: { include: { label: true } }
          },
          orderBy: { sortOrder: 'asc' }
        }
      }
    });

    if (!sprint) throw new NotFoundError('Sprint not found');

    const totalStoryPoints = sprint.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);
    const completedStoryPoints = sprint.tasks
      .filter((t) => t.status === TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    const burndown = this.calculateBurndown(sprint);

    return {
      ...sprint,
      totalStoryPoints,
      completedStoryPoints,
      taskCount: sprint.tasks.length,
      completedTaskCount: sprint.tasks.filter((t) => t.status === TaskStatus.DONE).length,
      burndown
    };
  }

  async getBurndown(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: {
        tasks: {
          select: { id: true, storyPoints: true, status: true, updatedAt: true, createdAt: true }
        }
      }
    });

    if (!sprint) throw new NotFoundError('Sprint not found');
    return this.calculateBurndown(sprint);
  }

  private calculateBurndown(sprint: any) {
    const totalStoryPoints = sprint.tasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);
    const completedTasks = sprint.tasks.filter((t: any) => t.status === TaskStatus.DONE);
    const completedPoints = completedTasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);

    // If dates are not set, synthesize a standard 10-day sprint cycle
    const start = sprint.startDate ? new Date(sprint.startDate) : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = sprint.endDate ? new Date(sprint.endDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    const totalDays = Math.max(5, Math.min(20, Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))));
    const step = totalStoryPoints / totalDays;

    const burndown: Array<{ day: string; date: string; remainingPoints: number; idealPoints: number }> = [];

    // Calculate progression
    for (let i = 0; i <= totalDays; i++) {
      const d = new Date(start.getTime() + i * 24 * 60 * 60 * 1000);
      const ideal = Math.max(0, Math.round((totalStoryPoints - i * step) * 10) / 10);

      // Tasks completed on or before this day
      const ptsCompletedByDay = sprint.tasks
        .filter((t: any) => t.status === TaskStatus.DONE && new Date(t.updatedAt).getTime() <= d.getTime())
        .reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);

      let remaining = Math.max(0, totalStoryPoints - ptsCompletedByDay);

      // If active sprint and day is in future, don't project fake completions beyond today
      const isFuture = d.getTime() > Date.now();
      if (isFuture && sprint.status === SprintStatus.ACTIVE) {
        remaining = Math.max(0, totalStoryPoints - completedPoints);
      }

      burndown.push({
        day: `Day ${i + 1}`,
        date: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        remainingPoints: Math.round(remaining),
        idealPoints: Math.round(ideal)
      });
    }

    return burndown;
  }

  async createSprint(data: {
    projectId: string;
    name: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    capacityPoints?: number;
  }) {
    return prisma.sprint.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        goal: data.goal,
        startDate: data.startDate ? new Date(data.startDate) : new Date(),
        endDate: data.endDate ? new Date(data.endDate) : new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
        capacityPoints: data.capacityPoints || 40,
        status: SprintStatus.PLANNED
      }
    });
  }

  async updateSprint(sprintId: string, data: {
    name?: string;
    goal?: string;
    startDate?: string;
    endDate?: string;
    capacityPoints?: number;
    status?: SprintStatus;
    retrospectiveWentWell?: string;
    retrospectiveWentWrong?: string;
    retrospectiveActionItems?: string;
  }) {
    const existing = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!existing) throw new NotFoundError('Sprint not found');

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.goal !== undefined) updatePayload.goal = data.goal;
    if (data.capacityPoints !== undefined) updatePayload.capacityPoints = Number(data.capacityPoints);
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.endDate !== undefined) updatePayload.endDate = data.endDate ? new Date(data.endDate) : null;
    if (data.retrospectiveWentWell !== undefined) updatePayload.retrospectiveWentWell = data.retrospectiveWentWell;
    if (data.retrospectiveWentWrong !== undefined) updatePayload.retrospectiveWentWrong = data.retrospectiveWentWrong;
    if (data.retrospectiveActionItems !== undefined) updatePayload.retrospectiveActionItems = data.retrospectiveActionItems;

    return prisma.sprint.update({
      where: { id: sprintId },
      data: updatePayload
    });
  }

  async startSprint(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) throw new NotFoundError('Sprint not found');

    return prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.ACTIVE,
        startDate: sprint.startDate || new Date()
      }
    });
  }

  async completeSprint(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({
      where: { id: sprintId },
      include: { tasks: true }
    });
    if (!sprint) throw new NotFoundError('Sprint not found');

    const completedPoints = sprint.tasks
      .filter((t) => t.status === TaskStatus.DONE)
      .reduce((sum, t) => sum + (t.storyPoints || 0), 0);

    return prisma.sprint.update({
      where: { id: sprintId },
      data: {
        status: SprintStatus.COMPLETED,
        velocity: completedPoints,
        endDate: new Date()
      }
    });
  }

  async cancelSprint(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) throw new NotFoundError('Sprint not found');

    return prisma.sprint.update({
      where: { id: sprintId },
      data: { status: SprintStatus.CANCELLED }
    });
  }

  async deleteSprint(sprintId: string) {
    const sprint = await prisma.sprint.findUnique({ where: { id: sprintId } });
    if (!sprint) throw new NotFoundError('Sprint not found');

    // Unassign tasks from this sprint before deleting
    await prisma.task.updateMany({
      where: { sprintId },
      data: { sprintId: null }
    });

    await prisma.sprint.delete({ where: { id: sprintId } });
    return { success: true, id: sprintId };
  }

  async getVelocity(projectId: string) {
    const completedSprints = await prisma.sprint.findMany({
      where: { projectId, status: SprintStatus.COMPLETED },
      include: {
        tasks: {
          select: { storyPoints: true, status: true }
        }
      },
      orderBy: { endDate: 'asc' }
    });

    const sprintVelocities = completedSprints.map((s) => {
      const delivered = s.tasks
        .filter((t) => t.status === TaskStatus.DONE)
        .reduce((sum, t) => sum + (t.storyPoints || 0), 0);
      const committed = s.tasks.reduce((sum, t) => sum + (t.storyPoints || 0), 0);

      return {
        sprintId: s.id,
        sprintName: s.name,
        committedPoints: committed || s.capacityPoints,
        deliveredPoints: delivered || s.velocity || 0
      };
    });

    const totalDelivered = sprintVelocities.reduce((sum, s) => sum + s.deliveredPoints, 0);
    const averageVelocity = sprintVelocities.length > 0 ? Math.round(totalDelivered / sprintVelocities.length) : 0;

    return {
      averageVelocity,
      totalCompletedSprints: sprintVelocities.length,
      history: sprintVelocities
    };
  }
}

export const sprintService = new SprintService();
