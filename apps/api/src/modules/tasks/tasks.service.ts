import { prisma } from '../../config/db';
import { TaskStatus, TaskType, TaskPriority, DependencyType } from '@prisma/client';
import { NotFoundError } from '../../utils/errors';

export class TaskService {
  async listTasks(projectId: string, filters: {
    status?: TaskStatus;
    taskType?: TaskType;
    priority?: TaskPriority;
    assigneeId?: string;
    sprintId?: string;
    milestoneId?: string;
    search?: string;
  } = {}) {
    const where: any = { projectId };

    if (filters.status) where.status = filters.status;
    if (filters.taskType) where.taskType = filters.taskType;
    if (filters.priority) where.priority = filters.priority;
    if (filters.assigneeId) where.assigneeId = filters.assigneeId;
    if (filters.sprintId) where.sprintId = filters.sprintId;
    if (filters.milestoneId) where.milestoneId = filters.milestoneId;
    if (filters.search) {
      where.OR = [
        { title: { contains: filters.search, mode: 'insensitive' } },
        { taskIdentifier: { contains: filters.search, mode: 'insensitive' } },
        { description: { contains: filters.search, mode: 'insensitive' } }
      ];
    }

    const tasks = await prisma.task.findMany({
      where,
      include: {
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
        sprint: { select: { id: true, name: true } },
        milestone: { select: { id: true, name: true } },
        feature: { select: { id: true, title: true } },
        document: { select: { id: true, title: true } },
        labelAssignments: {
          include: {
            label: true
          }
        },
        subtasks: {
          select: { id: true, taskIdentifier: true, title: true, status: true }
        },
        dependencies: {
          include: {
            dependsOnTask: { select: { id: true, taskIdentifier: true, title: true } }
          }
        }
      },
      orderBy: [{ sortOrder: 'asc' }, { createdAt: 'desc' }]
    });

    return tasks.map((t) => ({
      ...t,
      labels: t.labelAssignments.map((la) => la.label),
      subtaskCount: t.subtasks.length,
      completedSubtasks: t.subtasks.filter((s) => s.status === TaskStatus.DONE).length,
      dependencies: t.dependencies.map((d) => ({
        id: d.id,
        taskIdentifier: d.dependsOnTask.taskIdentifier,
        title: d.dependsOnTask.title,
        type: d.dependencyType
      }))
    }));
  }

  async getTask(taskId: string) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      include: {
        project: { select: { id: true, name: true, slug: true, projectKey: true } },
        assignee: { select: { id: true, name: true, email: true, avatarUrl: true } },
        reporter: { select: { id: true, name: true, email: true, avatarUrl: true } },
        sprint: { select: { id: true, name: true, status: true } },
        milestone: { select: { id: true, name: true, status: true } },
        feature: { select: { id: true, title: true, status: true } },
        document: { select: { id: true, title: true, fileName: true } },
        subtasks: {
          include: {
            assignee: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        dependencies: {
          include: {
            dependsOnTask: { select: { id: true, taskIdentifier: true, title: true, status: true } }
          }
        },
        dependedOnBy: {
          include: {
            task: { select: { id: true, taskIdentifier: true, title: true, status: true } }
          }
        },
        labelAssignments: {
          include: {
            label: true
          }
        },
        timeEntries: {
          include: {
            user: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { date: 'desc' }
        },
        bugs: {
          select: { id: true, bugIdentifier: true, title: true, severity: true, status: true }
        }
      }
    });

    if (!task) throw new NotFoundError('Task not found');

    return {
      ...task,
      labels: task.labelAssignments.map((la) => la.label),
      dependencies: task.dependencies.map((d) => ({
        id: d.id,
        taskId: d.dependsOnTask.id,
        taskIdentifier: d.dependsOnTask.taskIdentifier,
        title: d.dependsOnTask.title,
        status: d.dependsOnTask.status,
        type: d.dependencyType
      })),
      dependedOnBy: task.dependedOnBy.map((d) => ({
        id: d.id,
        taskId: d.task.id,
        taskIdentifier: d.task.taskIdentifier,
        title: d.task.title,
        status: d.task.status,
        type: d.dependencyType
      }))
    };
  }

  async createTask(userId: string, data: {
    projectId: string;
    title: string;
    description?: string;
    taskType?: TaskType;
    status?: TaskStatus;
    priority?: TaskPriority;
    parentTaskId?: string;
    assigneeId?: string;
    sprintId?: string;
    milestoneId?: string;
    featureId?: string;
    documentId?: string;
    startDate?: string;
    dueDate?: string;
    estimatedHours?: number;
    storyPoints?: number;
    labelIds?: string[];
  }) {
    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { id: true, projectKey: true }
    });

    if (!project) throw new NotFoundError('Project not found');

    const count = await prisma.task.count({ where: { projectId: data.projectId } });
    const taskIdentifier = `${project.projectKey || 'TASK'}-${count + 101}`;

    const task = await prisma.task.create({
      data: {
        projectId: data.projectId,
        taskIdentifier,
        title: data.title,
        description: data.description,
        taskType: data.taskType || TaskType.TASK,
        status: data.status || TaskStatus.TODO,
        priority: data.priority || TaskPriority.MEDIUM,
        parentTaskId: data.parentTaskId || null,
        assigneeId: data.assigneeId || null,
        reporterId: userId,
        sprintId: data.sprintId || null,
        milestoneId: data.milestoneId || null,
        featureId: data.featureId || null,
        documentId: data.documentId || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        estimatedHours: data.estimatedHours || 0,
        storyPoints: data.storyPoints || 1
      }
    });

    if (data.labelIds && data.labelIds.length > 0) {
      await prisma.taskLabelAssignment.createMany({
        data: data.labelIds.map((labelId) => ({
          taskId: task.id,
          labelId
        }))
      });
    }

    return this.getTask(task.id);
  }

  async updateTask(taskId: string, data: any) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw new NotFoundError('Task not found');

    const updatePayload: any = {};
    if (data.title !== undefined) updatePayload.title = data.title;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.priority !== undefined) updatePayload.priority = data.priority;
    if (data.taskType !== undefined) updatePayload.taskType = data.taskType;
    if (data.assigneeId !== undefined) updatePayload.assigneeId = data.assigneeId ? data.assigneeId : null;
    if (data.sprintId !== undefined) updatePayload.sprintId = data.sprintId ? data.sprintId : null;
    if (data.milestoneId !== undefined) updatePayload.milestoneId = data.milestoneId ? data.milestoneId : null;
    if (data.featureId !== undefined) updatePayload.featureId = data.featureId ? data.featureId : null;
    if (data.documentId !== undefined) updatePayload.documentId = data.documentId ? data.documentId : null;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.dueDate !== undefined) updatePayload.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.estimatedHours !== undefined) updatePayload.estimatedHours = data.estimatedHours;
    if (data.actualHours !== undefined) updatePayload.actualHours = data.actualHours;
    if (data.storyPoints !== undefined) updatePayload.storyPoints = data.storyPoints;
    if (data.sortOrder !== undefined) updatePayload.sortOrder = data.sortOrder;

    await prisma.task.update({
      where: { id: taskId },
      data: updatePayload
    });

    if (data.labelIds) {
      await prisma.taskLabelAssignment.deleteMany({ where: { taskId } });
      if (data.labelIds.length > 0) {
        await prisma.taskLabelAssignment.createMany({
          data: data.labelIds.map((labelId: string) => ({
            taskId,
            labelId
          }))
        });
      }
    }

    return this.getTask(taskId);
  }

  async updateTaskStatus(taskId: string, status: TaskStatus) {
    return this.updateTask(taskId, { status });
  }

  async deleteTask(taskId: string) {
    const existing = await prisma.task.findUnique({ where: { id: taskId } });
    if (!existing) throw new NotFoundError('Task not found');
    await prisma.task.delete({ where: { id: taskId } });
    return { success: true, id: taskId };
  }
}

export const taskService = new TaskService();
