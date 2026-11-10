import { Request, Response, NextFunction } from 'express';
import { portfolioService } from './portfolios.service';
import { sendSuccess } from '../../utils/response';

export class PortfolioController {
  async listPortfolios(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req.user as any)?.currentWorkspaceId;
      const portfolios = await portfolioService.listPortfolios(workspaceId);
      return sendSuccess(res, portfolios, 'Portfolios retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.getPortfolio(req.params.portfolioId);
      return sendSuccess(res, portfolio, 'Portfolio details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createPortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.createPortfolio(req.body);
      return sendSuccess(res, portfolio, 'Portfolio created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updatePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.updatePortfolio(req.params.portfolioId, req.body);
      return sendSuccess(res, portfolio, 'Portfolio updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deletePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await portfolioService.deletePortfolio(req.params.portfolioId);
      return sendSuccess(res, result, 'Portfolio deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async archivePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await portfolioService.archivePortfolio(req.params.portfolioId);
      return sendSuccess(res, result, 'Portfolio archived successfully');
    } catch (error) {
      return next(error);
    }
  }

  async duplicatePortfolio(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.duplicatePortfolio(req.params.portfolioId);
      return sendSuccess(res, portfolio, 'Portfolio duplicated successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async addProject(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.addProjectToPortfolio(req.params.portfolioId, req.body.projectId);
      return sendSuccess(res, portfolio, 'Project added to portfolio');
    } catch (error) {
      return next(error);
    }
  }

  async removeProject(req: Request, res: Response, next: NextFunction) {
    try {
      const portfolio = await portfolioService.removeProjectFromPortfolio(req.params.portfolioId, req.params.projectId);
      return sendSuccess(res, portfolio, 'Project removed from portfolio');
    } catch (error) {
      return next(error);
    }
  }

  async addObjective(req: Request, res: Response, next: NextFunction) {
    try {
      const objective = await portfolioService.addObjective(req.params.portfolioId, req.body);
      return sendSuccess(res, objective, 'Objective added successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateObjective(req: Request, res: Response, next: NextFunction) {
    try {
      const objective = await portfolioService.updateObjective(req.params.objectiveId, req.body);
      return sendSuccess(res, objective, 'Objective updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteObjective(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await portfolioService.deleteObjective(req.params.objectiveId);
      return sendSuccess(res, result, 'Objective deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const portfolioController = new PortfolioController();
