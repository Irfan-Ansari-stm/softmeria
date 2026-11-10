import { Request, Response, NextFunction } from 'express';
import { timeTrackingService } from './time-tracking.service';
import { sendSuccess } from '../../utils/response';

export class TimeTrackingController {
  async listTimeEntries(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || req.params.workspaceId;
      const result = await timeTrackingService.listTimeEntries(workspaceId, {
        projectId: req.query.projectId as string,
        userId: req.query.userId as string,
        startDate: req.query.startDate as string,
        endDate: req.query.endDate as string
      });
      return sendSuccess(res, result, 'Time entries retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createTimeEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await timeTrackingService.createTimeEntry(req.user!.id, req.body);
      return sendSuccess(res, entry, 'Time entry recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateTimeEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const entry = await timeTrackingService.updateTimeEntry(req.params.entryId, req.body);
      return sendSuccess(res, entry, 'Time entry updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteTimeEntry(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await timeTrackingService.deleteTimeEntry(req.params.entryId);
      return sendSuccess(res, result, 'Time entry deleted');
    } catch (error) {
      return next(error);
    }
  }
}

export const timeTrackingController = new TimeTrackingController();
