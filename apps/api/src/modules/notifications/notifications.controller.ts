import { Request, Response, NextFunction } from 'express';
import { notificationsService } from './notifications.service';
import { sendSuccess } from '../../utils/response';

export class NotificationsController {
  async getNotifications(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await notificationsService.getUserNotifications(userId);
      return sendSuccess(res, data, 'Notifications retrieved');
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const { id } = req.params;
      const data = await notificationsService.markAsRead(id, userId);
      return sendSuccess(res, data, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.id;
      const data = await notificationsService.markAllAsRead(userId);
      return sendSuccess(res, data, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}

export const notificationsController = new NotificationsController();
