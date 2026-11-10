import { Request, Response, NextFunction } from 'express';
import { sprintService } from './sprints.service';
import { sendSuccess } from '../../utils/response';

export class SprintController {
  async listSprints(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const sprints = await sprintService.listSprints(projectId);
      return sendSuccess(res, sprints, 'Sprints list retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.getSprint(req.params.sprintId);
      return sendSuccess(res, sprint, 'Sprint retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getBurndown(req: Request, res: Response, next: NextFunction) {
    try {
      const burndown = await sprintService.getBurndown(req.params.sprintId);
      return sendSuccess(res, burndown, 'Burndown chart retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getVelocity(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const velocity = await sprintService.getVelocity(projectId);
      return sendSuccess(res, velocity, 'Velocity history retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.createSprint(req.body);
      return sendSuccess(res, sprint, 'Sprint created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.updateSprint(req.params.sprintId, req.body);
      return sendSuccess(res, sprint, 'Sprint updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async startSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.startSprint(req.params.sprintId);
      return sendSuccess(res, sprint, 'Sprint started successfully');
    } catch (error) {
      return next(error);
    }
  }

  async completeSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.completeSprint(req.params.sprintId);
      return sendSuccess(res, sprint, 'Sprint completed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async cancelSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const sprint = await sprintService.cancelSprint(req.params.sprintId);
      return sendSuccess(res, sprint, 'Sprint cancelled');
    } catch (error) {
      return next(error);
    }
  }

  async deleteSprint(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await sprintService.deleteSprint(req.params.sprintId);
      return sendSuccess(res, result, 'Sprint deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const sprintController = new SprintController();
