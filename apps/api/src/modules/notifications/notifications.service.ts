import { prisma } from '../../config/db';

export class NotificationsService {
  async getUserNotifications(userId: string) {
    const [notifications, unreadCount] = await Promise.all([
      prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: 50
      }),
      prisma.notification.count({
        where: { userId, isRead: false }
      })
    ]);

    return {
      notifications,
      unreadCount
    };
  }

  async markAsRead(notificationId: string, userId: string) {
    const updated = await prisma.notification.updateMany({
      where: { id: notificationId, userId },
      data: { isRead: true }
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, isRead: false }
    });

    return { success: updated.count > 0, unreadCount };
  }

  async markAllAsRead(userId: string) {
    await prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true }
    });

    return { success: true, unreadCount: 0 };
  }

  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    link?: string;
    type?: string;
  }) {
    return prisma.notification.create({
      data: {
        userId: data.userId,
        title: data.title,
        message: data.message,
        link: data.link,
        type: data.type || 'info'
      }
    });
  }
}

export const notificationsService = new NotificationsService();
