import { Request, Response, NextFunction } from 'express';
import { developmentService } from './development.service';
import { sendSuccess } from '../../utils/response';

export class DevelopmentController {
  async listRepositories(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const repos = await developmentService.listRepositories(projectId);
      sendSuccess(res, repos);
    } catch (err) {
      next(err);
    }
  }

  async createRepository(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const repo = await developmentService.createRepository(userId, req.body);
      sendSuccess(res, repo, 'Repository created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateRepository(req: Request, res: Response, next: NextFunction) {
    try {
      const repo = await developmentService.updateRepository(req.params.id, req.body);
      sendSuccess(res, repo);
    } catch (err) {
      next(err);
    }
  }

  async deleteRepository(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await developmentService.deleteRepository(req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async syncRepository(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await developmentService.syncRepository(req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async listPullRequests(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const repositoryId = req.query.repositoryId as string;
      const prs = await developmentService.listPullRequests(projectId, repositoryId);
      sendSuccess(res, prs);
    } catch (err) {
      next(err);
    }
  }

  async createPullRequest(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const pr = await developmentService.createPullRequest(userId, req.body);
      sendSuccess(res, pr, 'Pull request created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updatePullRequestStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const pr = await developmentService.updatePullRequestStatus(req.params.id, req.body);
      sendSuccess(res, pr);
    } catch (err) {
      next(err);
    }
  }

  async listPipelines(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const repositoryId = req.query.repositoryId as string;
      const pipelines = await developmentService.listPipelines(projectId, repositoryId);
      sendSuccess(res, pipelines);
    } catch (err) {
      next(err);
    }
  }

  async triggerPipeline(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const pipeline = await developmentService.triggerPipeline(userId, req.body);
      sendSuccess(res, pipeline, 'Pipeline execution triggered', 201);
    } catch (err) {
      next(err);
    }
  }

  async getDevelopmentStats(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const stats = await developmentService.getDevelopmentStats(projectId);
      sendSuccess(res, stats);
    } catch (err) {
      next(err);
    }
  }
}

export const developmentController = new DevelopmentController();
