import { Request, Response, NextFunction } from 'express';
import { searchService } from './search.service';
import { sendSuccess } from '../../utils/response';
import { DocumentStatus } from '@prisma/client';

export class SearchController {
  async search(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const q = (req.query.q as string) || '';
      const projectId = req.query.projectId as string | undefined;
      const categoryId = req.query.categoryId as string | undefined;
      const status = req.query.status as DocumentStatus | undefined;
      const tag = req.query.tag as string | undefined;
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 25;

      const results = await searchService.globalSearch(workspaceId, {
        q,
        projectId,
        categoryId,
        status,
        tag,
        limit
      });

      return sendSuccess(res, results, 'Search results');
    } catch (error) {
      return next(error);
    }
  }
}

export const searchController = new SearchController();

