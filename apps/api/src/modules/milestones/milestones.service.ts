import { prisma } from '../../config/db';
import { MilestoneStatus, TaskStatus } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';

export class MilestoneService {
  async listMilestones(options: { projectId?: string; workspaceId?: string; status?: MilestoneStatus }) {
    const where: any = {};
    if (options.projectId) {
      where.projectId = options.projectId;
    } else if (options.workspaceId) {
      where.project = { workspaceId: options.workspaceId };
    }
    if (options.status) {
      where.status = options.status;
    }

    const milestones = await prisma.milestone.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, slug: true, projectKey: true } },
        portfolio: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        tasks: {
          select: {
            id: true,
            taskIdentifier: true,
            title: true,
            status: true,
            priority: true,
            storyPoints: true,
            assignee: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        roadmapItems: {
          select: { id: true, title: true, startDate: true, endDate: true, progress: true }
        }
      },
      orderBy: [{ targetDate: 'asc' }, { createdAt: 'desc' }]
    });

    const now = new Date();
    return milestones.map((m) => {
      const taskCount = m.tasks.length;
      const completedTaskCount = m.tasks.filter((t) => t.status === TaskStatus.DONE).length;
      const calculatedProgress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : m.completionPercentage;
      const isOverdue = m.targetDate ? new Date(m.targetDate) < now && m.status !== 'COMPLETED' : false;

      return {
        ...m,
        taskCount,
        completedTaskCount,
        completionPercentage: calculatedProgress,
        isOverdue
      };
    });
  }

  async getMilestone(milestoneId: string) {
    const milestone = await prisma.milestone.findUnique({
      where: { id: milestoneId },
      include: {
        project: { select: { id: true, name: true, slug: true, projectKey: true } },
        portfolio: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, email: true, avatarUrl: true } },
        tasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        roadmap: { select: { id: true, name: true } },
        roadmapItems: true
      }
    });

    if (!milestone) throw new NotFoundError('Milestone not found');

    const taskCount = milestone.tasks.length;
    const completedTaskCount = milestone.tasks.filter((t) => t.status === TaskStatus.DONE).length;
    const calculatedProgress = taskCount > 0 ? Math.round((completedTaskCount / taskCount) * 100) : milestone.completionPercentage;

    return {
      ...milestone,
      taskCount,
      completedTaskCount,
      completionPercentage: calculatedProgress
    };
  }

  async createMilestone(data: {
    projectId: string;
    name: string;
    description?: string;
    ownerId?: string;
    startDate?: string;
    targetDate?: string;
    priority?: string;
    status?: MilestoneStatus;
    portfolioId?: string;
    roadmapId?: string;
    taskIds?: string[];
  }) {
    const milestone = await prisma.milestone.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        description: data.description,
        ownerId: data.ownerId || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        priority: data.priority || 'MEDIUM',
        status: data.status || MilestoneStatus.PLANNED,
        portfolioId: data.portfolioId || null,
        roadmapId: data.roadmapId || null,
        completionPercentage: 0
      },
      include: {
        project: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    if (data.taskIds && data.taskIds.length > 0) {
      await prisma.task.updateMany({
        where: { id: { in: data.taskIds } },
        data: { milestoneId: milestone.id }
      });
    }

    return this.getMilestone(milestone.id);
  }

  async updateMilestone(milestoneId: string, data: any) {
    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) throw new NotFoundError('Milestone not found');

    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.ownerId !== undefined) updateData.ownerId = data.ownerId || null;
    if (data.startDate !== undefined) updateData.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.targetDate !== undefined) updateData.targetDate = data.targetDate ? new Date(data.targetDate) : null;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.portfolioId !== undefined) updateData.portfolioId = data.portfolioId || null;
    if (data.roadmapId !== undefined) updateData.roadmapId = data.roadmapId || null;
    if (data.completionPercentage !== undefined) updateData.completionPercentage = Number(data.completionPercentage);

    await prisma.milestone.update({
      where: { id: milestoneId },
      data: updateData
    });

    if (data.taskIds && Array.isArray(data.taskIds)) {
      // Disassociate unselected
      await prisma.task.updateMany({
        where: { milestoneId, id: { notIn: data.taskIds } },
        data: { milestoneId: null }
      });
      // Associate selected
      if (data.taskIds.length > 0) {
        await prisma.task.updateMany({
          where: { id: { in: data.taskIds } },
          data: { milestoneId }
        });
      }
    }

    return this.getMilestone(milestoneId);
  }

  async deleteMilestone(milestoneId: string) {
    const existing = await prisma.milestone.findUnique({ where: { id: milestoneId } });
    if (!existing) throw new NotFoundError('Milestone not found');

    // Unlink tasks
    await prisma.task.updateMany({
      where: { milestoneId },
      data: { milestoneId: null }
    });

    await prisma.milestone.delete({ where: { id: milestoneId } });
    return { success: true, id: milestoneId };
  }

  async linkTask(milestoneId: string, taskId: string) {
    await prisma.task.update({
      where: { id: taskId },
      data: { milestoneId }
    });
    return this.getMilestone(milestoneId);
  }

  async unlinkTask(milestoneId: string, taskId: string) {
    await prisma.task.update({
      where: { id: taskId, milestoneId },
      data: { milestoneId: null }
    });
    return this.getMilestone(milestoneId);
  }

  async getRoadmap(projectId: string) {
    let roadmap = await prisma.roadmap.findFirst({
      where: { projectId },
      include: {
        items: {
          include: {
            milestone: { select: { id: true, name: true, status: true, completionPercentage: true } }
          },
          orderBy: { startDate: 'asc' }
        }
      }
    });

    if (!roadmap) {
      roadmap = await prisma.roadmap.create({
        data: {
          projectId,
          name: 'Primary Product Roadmap',
          timeframe: 'QUARTERLY',
          status: 'ACTIVE'
        },
        include: {
          items: {
            include: {
              milestone: { select: { id: true, name: true, status: true, completionPercentage: true } }
            }
          }
        }
      });
    }

    const milestones = await this.listMilestones({ projectId });

    return {
      ...roadmap,
      milestones
    };
  }

  async createRoadmapItem(data: {
    roadmapId: string;
    milestoneId?: string;
    title: string;
    description?: string;
    startDate: string;
    endDate: string;
    progress?: number;
    color?: string;
    status?: string;
    priority?: string;
  }) {
    return prisma.roadmapItem.create({
      data: {
        roadmapId: data.roadmapId,
        milestoneId: data.milestoneId || null,
        title: data.title,
        description: data.description,
        startDate: new Date(data.startDate),
        endDate: new Date(data.endDate),
        progress: data.progress || 0,
        color: data.color || '#3b82f6',
        status: data.status || 'PLANNED',
        priority: data.priority || 'MEDIUM'
      },
      include: {
        milestone: { select: { id: true, name: true, status: true } }
      }
    });
  }

  async updateRoadmapItem(itemId: string, data: any) {
    const updateData: any = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;
    if (data.startDate !== undefined) updateData.startDate = new Date(data.startDate);
    if (data.endDate !== undefined) updateData.endDate = new Date(data.endDate);
    if (data.progress !== undefined) updateData.progress = Number(data.progress);
    if (data.color !== undefined) updateData.color = data.color;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.milestoneId !== undefined) updateData.milestoneId = data.milestoneId || null;

    return prisma.roadmapItem.update({
      where: { id: itemId },
      data: updateData,
      include: {
        milestone: { select: { id: true, name: true, status: true } }
      }
    });
  }

  async deleteRoadmapItem(itemId: string) {
    await prisma.roadmapItem.delete({ where: { id: itemId } });
    return { success: true, id: itemId };
  }
}

export const milestoneService = new MilestoneService();
