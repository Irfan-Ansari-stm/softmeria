import { Request, Response, NextFunction } from 'express';
import { templateService } from './templates.service';
import { sendSuccess } from '../../utils/response';

export class TemplateController {
  async listTemplates(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string | undefined;
      const category = req.query.category as string | undefined;
      const search = req.query.search as string | undefined;

      const templates = await templateService.listTemplates({ workspaceId, category, search });
      return sendSuccess(res, templates, 'Templates retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.getTemplate(req.params.templateId);
      return sendSuccess(res, template, 'Template retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.createTemplate(req.user!.id, req.body);
      return sendSuccess(res, template, 'Template created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const template = await templateService.updateTemplate(req.params.templateId || req.params.id, req.body);
      return sendSuccess(res, template, 'Template updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await templateService.deleteTemplate(req.params.templateId || req.params.id);
      return sendSuccess(res, result, 'Template deleted');
    } catch (error) {
      return next(error);
    }
  }

  async duplicateTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const copy = await templateService.duplicateTemplate(userId, req.params.templateId || req.params.id);
      return sendSuccess(res, copy, 'Template duplicated', 201);
    } catch (error) {
      return next(error);
    }
  }

  async applyTemplate(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await templateService.applyTemplate(
        req.params.templateId,
        req.body.projectId,
        req.body.categoryId,
        req.body.title,
        req.user!.id
      );
      return sendSuccess(res, doc, 'Template applied to new document', 201);
    } catch (error) {
      return next(error);
    }
  }
}

export const templateController = new TemplateController();

