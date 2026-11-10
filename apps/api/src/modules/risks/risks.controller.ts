import { Request, Response, NextFunction } from 'express';
import { riskService } from './risks.service';
import { sendSuccess } from '../../utils/response';

export class RiskController {
  async listRisks(req: Request, res: Response, next: NextFunction) {
    try {
      const risks = await riskService.listRisks({
        workspaceId: req.query.workspaceId as string,
        projectId: (req.query.projectId as string) || req.params.projectId,
        category: req.query.category as string,
        status: req.query.status as string,
        severity: req.query.severity as string,
        probability: req.query.probability as string,
        impact: req.query.impact as string,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string
      });
      return sendSuccess(res, risks, 'Risks retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const risk = await riskService.getRisk(req.params.id);
      return sendSuccess(res, risk, 'Risk retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getRiskMatrix(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const projectId = req.query.projectId as string;
      const matrix = await riskService.getRiskMatrix({ workspaceId, projectId });
      return sendSuccess(res, matrix, 'Risk matrix and statistics retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const risk = await riskService.createRisk(req.body, userId);
      return sendSuccess(res, risk, 'Risk registered', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const risk = await riskService.updateRisk(req.params.id, req.body, userId);
      return sendSuccess(res, risk, 'Risk updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteRisk(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const deleted = await riskService.deleteRisk(req.params.id, userId);
      return sendSuccess(res, deleted, 'Risk deleted');
    } catch (error) {
      return next(error);
    }
  }

  // Mitigations
  async addMitigation(req: Request, res: Response, next: NextFunction) {
    try {
      const mitigation = await riskService.addMitigation(req.params.id, req.body);
      return sendSuccess(res, mitigation, 'Mitigation action recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateMitigation(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await riskService.updateMitigation(req.params.mitigationId, req.body);
      return sendSuccess(res, updated, 'Mitigation updated');
    } catch (error) {
      return next(error);
    }
  }

  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const comment = await riskService.addRiskComment(req.params.id, userId, req.body.content);
      return sendSuccess(res, comment, 'Comment added', 201);
    } catch (error) {
      return next(error);
    }
  }

  // Dependencies
  async listDependencies(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const projectId = req.query.projectId as string;
      const status = req.query.status as string;
      const dependencyType = req.query.dependencyType as string;

      const deps = await riskService.listDependencies({ workspaceId, projectId, status, dependencyType });
      return sendSuccess(res, deps, 'Dependencies retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const dep = await riskService.createDependency(req.body);
      return sendSuccess(res, dep, 'Dependency created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await riskService.updateDependency(req.params.depId, req.body);
      return sendSuccess(res, updated, 'Dependency updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteDependency(req: Request, res: Response, next: NextFunction) {
    try {
      const deleted = await riskService.deleteDependency(req.params.depId);
      return sendSuccess(res, deleted, 'Dependency deleted');
    } catch (error) {
      return next(error);
    }
  }

  // CSV Export
  async exportRisksCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const projectId = req.query.projectId as string;
      const csv = await riskService.exportRisksCSV({ workspaceId, projectId });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="risk-register-${Date.now()}.csv"`);
      return res.send(csv);
    } catch (error) {
      return next(error);
    }
  }

  async exportDependenciesCSV(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const projectId = req.query.projectId as string;
      const csv = await riskService.exportDependenciesCSV({ workspaceId, projectId });

      res.setHeader('Content-Type', 'text/csv');
      res.setHeader('Content-Disposition', `attachment; filename="dependency-register-${Date.now()}.csv"`);
      return res.send(csv);
    } catch (error) {
      return next(error);
    }
  }
}

export const riskController = new RiskController();
