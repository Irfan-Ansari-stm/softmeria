import { Request, Response, NextFunction } from 'express';
import { milestoneService } from './milestones.service';
import { sendSuccess } from '../../utils/response';

export class MilestoneController {
  async listMilestones(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const workspaceId = req.query.workspaceId as string;
      const status = req.query.status as any;
      const milestones = await milestoneService.listMilestones({ projectId, workspaceId, status });
      return sendSuccess(res, milestones, 'Milestones retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const milestone = await milestoneService.getMilestone(req.params.milestoneId);
      return sendSuccess(res, milestone, 'Milestone details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const milestone = await milestoneService.createMilestone(req.body);
      return sendSuccess(res, milestone, 'Milestone created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const milestone = await milestoneService.updateMilestone(req.params.milestoneId, req.body);
      return sendSuccess(res, milestone, 'Milestone updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteMilestone(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await milestoneService.deleteMilestone(req.params.milestoneId);
      return sendSuccess(res, result, 'Milestone deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async linkTask(req: Request, res: Response, next: NextFunction) {
    try {
      const milestone = await milestoneService.linkTask(req.params.milestoneId, req.body.taskId);
      return sendSuccess(res, milestone, 'Task linked to milestone');
    } catch (error) {
      return next(error);
    }
  }

  async unlinkTask(req: Request, res: Response, next: NextFunction) {
    try {
      const milestone = await milestoneService.unlinkTask(req.params.milestoneId, req.params.taskId);
      return sendSuccess(res, milestone, 'Task unlinked from milestone');
    } catch (error) {
      return next(error);
    }
  }

  async getRoadmap(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const roadmap = await milestoneService.getRoadmap(projectId);
      return sendSuccess(res, roadmap, 'Roadmap retrieved successfully');
    } catch (error) {
      return next(error);
    }
  }

  async createRoadmapItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await milestoneService.createRoadmapItem(req.body);
      return sendSuccess(res, item, 'Roadmap item created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateRoadmapItem(req: Request, res: Response, next: NextFunction) {
    try {
      const item = await milestoneService.updateRoadmapItem(req.params.itemId, req.body);
      return sendSuccess(res, item, 'Roadmap item updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteRoadmapItem(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await milestoneService.deleteRoadmapItem(req.params.itemId);
      return sendSuccess(res, result, 'Roadmap item deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const milestoneController = new MilestoneController();
