import { Request, Response, NextFunction } from 'express';
import { dashboardService } from './dashboard.service';
import { sendSuccess } from '../../utils/response';

export class DashboardController {
  async getDashboard(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const stats = await dashboardService.getDashboardStats(workspaceId);
      return sendSuccess(res, stats, 'Dashboard metrics retrieved');
    } catch (error) {
      return next(error);
    }
  }
}

export const dashboardController = new DashboardController();

