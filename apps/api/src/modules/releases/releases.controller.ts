import { Request, Response, NextFunction } from 'express';
import { releaseService } from './releases.service';
import { sendSuccess } from '../../utils/response';

export class ReleaseController {
  async listReleases(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const releases = await releaseService.listReleases(projectId);
      return sendSuccess(res, releases, 'Releases retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const release = await releaseService.getRelease(req.params.releaseId || req.params.id);
      return sendSuccess(res, release, 'Release details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const release = await releaseService.createRelease(userId, req.body);
      return sendSuccess(res, release, 'Release planned successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const release = await releaseService.updateRelease(req.params.id, req.body);
      return sendSuccess(res, release, 'Release updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await releaseService.deleteRelease(req.params.id);
      return sendSuccess(res, result, 'Release deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async updateChecklist(req: Request, res: Response, next: NextFunction) {
    try {
      const releaseId = req.params.releaseId || req.params.id;
      const release = await releaseService.updateChecklist(releaseId, req.body.checklistItems);
      return sendSuccess(res, release, 'Release checklist updated');
    } catch (error) {
      return next(error);
    }
  }

  async approveRelease(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const releaseId = req.params.releaseId || req.params.id;
      const approval = await releaseService.approveRelease(releaseId, userId, req.body);
      return sendSuccess(res, approval, 'Release approval recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async getReleaseReadiness(req: Request, res: Response, next: NextFunction) {
    try {
      const releaseId = req.params.releaseId || req.params.id;
      const readiness = await releaseService.getReleaseReadiness(releaseId);
      return sendSuccess(res, readiness, 'Release readiness audit computed');
    } catch (error) {
      return next(error);
    }
  }

  async recordDeployment(req: Request, res: Response, next: NextFunction) {
    try {
      const releaseId = req.params.releaseId || req.params.id;
      const deployment = await releaseService.recordDeployment(releaseId, req.user!.id, req.body);
      return sendSuccess(res, deployment, 'Deployment recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async recordRollback(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const releaseId = req.params.releaseId || req.params.id;
      const rollback = await releaseService.recordRollback(releaseId, userId, req.body);
      return sendSuccess(res, rollback, 'Rollback governance executed and recorded', 201);
    } catch (error) {
      return next(error);
    }
  }
}

export const releaseController = new ReleaseController();
