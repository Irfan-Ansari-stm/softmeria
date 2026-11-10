import { Request, Response, NextFunction } from 'express';
import { auditLogService } from './audit-logs.service';
import { sendSuccess } from '../../utils/response';

export class AuditLogController {
  async listAuditLogs(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const projectId = req.query.projectId as string | undefined;
      const category = req.query.category as string | undefined;
      const userId = req.query.userId as string | undefined;
      const search = req.query.search as string | undefined;
      const status = req.query.status as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;
      const page = req.query.page ? Number(req.query.page) : 1;
      const limit = req.query.limit ? Number(req.query.limit) : 25;

      const result = await auditLogService.listAuditLogs({
        workspaceId,
        projectId,
        category,
        userId,
        search,
        status,
        startDate,
        endDate,
        page,
        limit
      });

      return sendSuccess(res, { events: result.events, pagination: result.pagination }, 'Audit logs retrieved', 200, result.pagination);
    } catch (error) {
      return next(error);
    }
  }

  async getAuditLog(req: Request, res: Response, next: NextFunction) {
    try {
      const log = await auditLogService.getAuditLog(req.params.id);
      return sendSuccess(res, log, 'Audit log details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async exportAuditLogsCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const projectId = req.query.projectId as string | undefined;

      const csv = await auditLogService.exportAuditLogsCSV({ workspaceId, projectId });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="audit-logs-${Date.now()}.csv"`);
      return res.send(csv);
    } catch (error) {
      return next(error);
    }
  }
}

export const auditLogController = new AuditLogController();
