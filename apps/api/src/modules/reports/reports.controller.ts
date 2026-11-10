import { Request, Response, NextFunction } from 'express';
import { reportService } from './reports.service';
import { sendSuccess } from '../../utils/response';

export class ReportController {
  async getExecutiveReport(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const projectId = req.query.projectId as string | undefined;
      const startDate = req.query.startDate as string | undefined;
      const endDate = req.query.endDate as string | undefined;

      const report = await reportService.getExecutiveReport({
        workspaceId,
        projectId,
        startDate,
        endDate
      });
      return sendSuccess(res, report, 'Executive report generated');
    } catch (error) {
      return next(error);
    }
  }

  async getEnterpriseReport(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const projectId = req.query.projectId as string | undefined;
      const report = await reportService.getEnterpriseReport(workspaceId, projectId);
      return sendSuccess(res, report, 'Enterprise report generated');
    } catch (error) {
      return next(error);
    }
  }

  async exportReportCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const projectId = req.query.projectId as string | undefined;
      const type = (req.query.type as string) || 'executive';

      const csv = await reportService.exportReportCSV(type, { workspaceId, projectId });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="${type}-report-${Date.now()}.csv"`);
      return res.send(csv);
    } catch (error) {
      return next(error);
    }
  }
}

export const reportController = new ReportController();
