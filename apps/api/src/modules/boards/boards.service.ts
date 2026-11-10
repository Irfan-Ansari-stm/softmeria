import { prisma } from '../../config/db';
import { TaskStatus } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class BoardService {
  async listProjectBoards(projectId: string) {
    return prisma.board.findMany({
      where: { projectId },
      include: {
        _count: { select: { columns: true } }
      },
      orderBy: [{ isDefault: 'desc' }, { createdAt: 'asc' }]
    });
  }

  async getProjectBoard(projectId: string, options: { boardId?: string; sprintId?: string } = {}) {
    let board: any = null;

    if (options.boardId) {
      board = await prisma.board.findUnique({
        where: { id: options.boardId },
        include: {
          columns: { orderBy: { sortOrder: 'asc' } }
        }
      });
    }

    if (!board) {
      board = await prisma.board.findFirst({
        where: { projectId, isDefault: true },
        include: {
          columns: { orderBy: { sortOrder: 'asc' } }
        }
      });
    }

    if (!board) {
      board = await prisma.board.findFirst({
        where: { projectId },
        include: {
          columns: { orderBy: { sortOrder: 'asc' } }
        }
      });
    }

    if (!board) {
      // Create default Kanban board with standard 7 columns
      board = await prisma.board.create({
        data: {
          projectId,
          name: 'Kanban Board',
          isDefault: true,
          columns: {
            create: [
              { name: 'Backlog', statusValue: TaskStatus.BACKLOG, sortOrder: 0, wipLimit: 0 },
              { name: 'To Do', statusValue: TaskStatus.TODO, sortOrder: 1, wipLimit: 12 },
              { name: 'In Progress', statusValue: TaskStatus.IN_PROGRESS, sortOrder: 2, wipLimit: 6 },
              { name: 'In Review', statusValue: TaskStatus.IN_REVIEW, sortOrder: 3, wipLimit: 5 },
              { name: 'Testing', statusValue: TaskStatus.TESTING, sortOrder: 4, wipLimit: 5 },
              { name: 'Blocked', statusValue: TaskStatus.BLOCKED, sortOrder: 5, wipLimit: 4 },
              { name: 'Done', statusValue: TaskStatus.DONE, sortOrder: 6, wipLimit: 0 }
            ]
          }
        },
        include: {
          columns: { orderBy: { sortOrder: 'asc' } }
        }
      });
    }

    // Build task filter
    const taskWhere: any = { projectId };
    if (options.sprintId) {
      if (options.sprintId === 'BACKLOG') {
        taskWhere.sprintId = null;
      } else if (options.sprintId !== 'ALL') {
        taskWhere.sprintId = options.sprintId;
      }
    }

    // Fetch tasks grouped by column status
    const tasks = await prisma.task.findMany({
      where: taskWhere,
      include: {
        assignee: { select: { id: true, name: true, avatarUrl: true, email: true } },
        sprint: { select: { id: true, name: true, status: true } },
        labelAssignments: { include: { label: true } },
        subtasks: { select: { id: true, status: true, title: true } },
        dependencies: { select: { id: true, dependencyType: true } }
      },
      orderBy: [{ sortOrder: 'asc' }, { updatedAt: 'desc' }]
    });

    const columnsWithTasks = board.columns.map((col: any) => {
      const colTasks = tasks
        .filter((t) => t.status === col.statusValue)
        .map((t) => ({
          ...t,
          labels: t.labelAssignments.map((la) => la.label),
          subtaskCount: t.subtasks.length,
          completedSubtasks: t.subtasks.filter((s) => s.status === TaskStatus.DONE).length,
          hasBlockers: t.dependencies.some((d) => d.dependencyType === 'BLOCKS')
        }));

      return {
        ...col,
        tasks: colTasks,
        taskCount: colTasks.length,
        isWipExceeded: col.wipLimit && col.wipLimit > 0 ? colTasks.length > col.wipLimit : false
      };
    });

    return {
      ...board,
      columns: columnsWithTasks,
      totalTasks: tasks.length
    };
  }

  async createBoard(projectId: string, name: string) {
    const existing = await prisma.board.findFirst({ where: { projectId } });
    const isDefault = !existing;

    return prisma.board.create({
      data: {
        projectId,
        name: name || 'Custom Kanban Board',
        isDefault,
        columns: {
          create: [
            { name: 'Backlog', statusValue: TaskStatus.BACKLOG, sortOrder: 0, wipLimit: 0 },
            { name: 'To Do', statusValue: TaskStatus.TODO, sortOrder: 1, wipLimit: 12 },
            { name: 'In Progress', statusValue: TaskStatus.IN_PROGRESS, sortOrder: 2, wipLimit: 6 },
            { name: 'In Review', statusValue: TaskStatus.IN_REVIEW, sortOrder: 3, wipLimit: 5 },
            { name: 'Testing', statusValue: TaskStatus.TESTING, sortOrder: 4, wipLimit: 5 },
            { name: 'Blocked', statusValue: TaskStatus.BLOCKED, sortOrder: 5, wipLimit: 4 },
            { name: 'Done', statusValue: TaskStatus.DONE, sortOrder: 6, wipLimit: 0 }
          ]
        }
      },
      include: {
        columns: { orderBy: { sortOrder: 'asc' } }
      }
    });
  }

  async updateBoard(boardId: string, data: { name?: string; isDefault?: boolean }) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board not found');

    if (data.isDefault) {
      await prisma.board.updateMany({
        where: { projectId: board.projectId, id: { not: boardId } },
        data: { isDefault: false }
      });
    }

    return prisma.board.update({
      where: { id: boardId },
      data: {
        name: data.name !== undefined ? data.name : board.name,
        isDefault: data.isDefault !== undefined ? data.isDefault : board.isDefault
      },
      include: {
        columns: { orderBy: { sortOrder: 'asc' } }
      }
    });
  }

  async deleteBoard(boardId: string) {
    const board = await prisma.board.findUnique({ where: { id: boardId } });
    if (!board) throw new NotFoundError('Board not found');

    const count = await prisma.board.count({ where: { projectId: board.projectId } });
    if (count <= 1) {
      throw new BadRequestError('Cannot delete the last remaining board of this project');
    }

    await prisma.board.delete({ where: { id: boardId } });
    return { success: true, id: boardId };
  }

  async addColumn(boardId: string, data: { name: string; statusValue: TaskStatus; wipLimit?: number; sortOrder?: number }) {
    const board = await prisma.board.findUnique({ where: { id: boardId }, include: { columns: true } });
    if (!board) throw new NotFoundError('Board not found');

    const sortOrder = data.sortOrder !== undefined ? data.sortOrder : board.columns.length;

    return prisma.boardColumn.create({
      data: {
        boardId,
        name: data.name,
        statusValue: data.statusValue,
        wipLimit: data.wipLimit !== undefined ? data.wipLimit : 0,
        sortOrder
      }
    });
  }

  async updateColumn(columnId: string, data: { name?: string; wipLimit?: number; sortOrder?: number; statusValue?: TaskStatus }) {
    const column = await prisma.boardColumn.findUnique({ where: { id: columnId } });
    if (!column) throw new NotFoundError('Column not found');

    return prisma.boardColumn.update({
      where: { id: columnId },
      data: {
        name: data.name !== undefined ? data.name : column.name,
        wipLimit: data.wipLimit !== undefined ? data.wipLimit : column.wipLimit,
        sortOrder: data.sortOrder !== undefined ? data.sortOrder : column.sortOrder,
        statusValue: data.statusValue !== undefined ? data.statusValue : column.statusValue
      }
    });
  }

  async deleteColumn(columnId: string) {
    const column = await prisma.boardColumn.findUnique({ where: { id: columnId } });
    if (!column) throw new NotFoundError('Column not found');

    await prisma.boardColumn.delete({ where: { id: columnId } });
    return { success: true, id: columnId };
  }
}

export const boardService = new BoardService();
