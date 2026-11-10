import { Request, Response, NextFunction } from 'express';
import { calendarService } from './calendar.service';
import { sendSuccess } from '../../utils/response';

export class CalendarController {
  async listEvents(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req.user as any)?.currentWorkspaceId;
      const projectId = req.query.projectId as string;
      const startDate = req.query.startDate as string;
      const endDate = req.query.endDate as string;
      const eventTypes = req.query.types ? (req.query.types as string).split(',') : undefined;

      const events = await calendarService.listEvents({
        workspaceId,
        projectId,
        startDate,
        endDate,
        eventTypes
      });

      return sendSuccess(res, events, 'Calendar events retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await calendarService.getEvent(req.params.eventId);
      return sendSuccess(res, event, 'Calendar event retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await calendarService.createEvent(req.user!.id, req.body);
      return sendSuccess(res, event, 'Calendar event created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const event = await calendarService.updateEvent(req.params.eventId, req.body);
      return sendSuccess(res, event, 'Calendar event updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteEvent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await calendarService.deleteEvent(req.params.eventId);
      return sendSuccess(res, result, 'Calendar event deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const calendarController = new CalendarController();
