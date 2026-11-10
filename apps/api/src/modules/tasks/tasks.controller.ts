import { Request, Response, NextFunction } from 'express';
import { taskService } from './tasks.service';
import { sendSuccess } from '../../utils/response';

export class TaskController {
  async listTasks(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const tasks = await taskService.listTasks(projectId, {
        status: req.query.status as any,
        taskType: req.query.taskType as any,
        priority: req.query.priority as any,
        assigneeId: req.query.assigneeId as string,
        sprintId: req.query.sprintId as string,
        milestoneId: req.query.milestoneId as string,
        search: req.query.search as string
      });
      return sendSuccess(res, tasks, 'Tasks retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.getTask(req.params.taskId);
      return sendSuccess(res, task, 'Task details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.createTask(req.user!.id, req.body);
      return sendSuccess(res, task, 'Task created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateTask(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTask(req.params.taskId, req.body);
      return sendSuccess(res, task, 'Task updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async updateStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const task = await taskService.updateTaskStatus(req.params.taskId, req.body.status);
      return sendSuccess(res, task, 'Task status updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteTask(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await taskService.deleteTask(req.params.taskId);
      return sendSuccess(res, result, 'Task deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const taskController = new TaskController();
