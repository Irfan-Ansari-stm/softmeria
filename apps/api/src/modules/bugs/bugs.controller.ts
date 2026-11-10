import { Request, Response, NextFunction } from 'express';
import { bugService } from './bugs.service';
import { sendSuccess } from '../../utils/response';

export class BugController {
  async listBugs(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const filters = {
        status: req.query.status as any,
        severity: req.query.severity as any,
        priority: req.query.priority as any,
        assigneeId: req.query.assigneeId as string,
        environment: req.query.environment as string
      };
      const bugs = await bugService.listBugs(projectId, filters);
      return sendSuccess(res, bugs, 'Bugs retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getBug(req: Request, res: Response, next: NextFunction) {
    try {
      const bug = await bugService.getBug(req.params.bugId);
      return sendSuccess(res, bug, 'Bug retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getAnalytics(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const analytics = await bugService.getQualityAnalytics(projectId);
      return sendSuccess(res, analytics, 'Bug analytics retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createBug(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id || 'demo-user-id';
      const bug = await bugService.createBug(userId, req.body);
      return sendSuccess(res, bug, 'Bug reported successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateBug(req: Request, res: Response, next: NextFunction) {
    try {
      const bug = await bugService.updateBug(req.params.bugId, req.body);
      return sendSuccess(res, bug, 'Bug updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteBug(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await bugService.deleteBug(req.params.bugId);
      return sendSuccess(res, result, 'Bug deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const bugController = new BugController();
