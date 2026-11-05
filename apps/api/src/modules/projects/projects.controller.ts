import { Request, Response, NextFunction } from 'express';
import { projectService } from './projects.service';
import { sendSuccess } from '../../utils/response';
import { ProjectStatus } from '@prisma/client';

export class ProjectController {
  async listProjects(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || req.params.workspaceId;
      const status = req.query.status as ProjectStatus | undefined;
      const type = req.query.type as string | undefined;
      const search = req.query.search as string | undefined;
      const includeArchived = req.query.includeArchived === 'true';

      const projects = await projectService.listProjects(workspaceId, {
        status,
        type,
        search,
        includeArchived
      });

      return sendSuccess(res, projects, 'Projects retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.getProject(req.params.projectId);
      return sendSuccess(res, project, 'Project retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.createProject(req.user!.id, req.body);
      return sendSuccess(res, project, 'Project created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.updateProject(req.params.projectId, req.body);
      return sendSuccess(res, project, 'Project updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async duplicateProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.duplicateProject(req.params.projectId, req.user!.id);
      return sendSuccess(res, project, 'Project duplicated successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async archiveProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.archiveProject(req.params.projectId);
      return sendSuccess(res, project, 'Project archived successfully');
    } catch (error) {
      return next(error);
    }
  }

  async restoreProject(req: Request, res: Response, next: NextFunction) {
    try {
      const project = await projectService.restoreProject(req.params.projectId);
      return sendSuccess(res, project, 'Project restored successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteProject(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await projectService.deleteProject(req.params.projectId);
      return sendSuccess(res, result, 'Project deleted successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const projectController = new ProjectController();

