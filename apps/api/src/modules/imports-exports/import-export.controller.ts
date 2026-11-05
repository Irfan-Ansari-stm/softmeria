import { Request, Response, NextFunction } from 'express';
import { importExportService } from './import-export.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';

export class ImportExportController {
  async exportSingleDoc(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileName, content } = await importExportService.getSingleDocExport(
        req.params.documentId
      );

      res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename="${fileName}"`);
      return res.send(content);
    } catch (error) {
      return next(error);
    }
  }

  async exportProjectZip(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="devblueprint-project-${req.params.projectId}.zip"`
      );
      await importExportService.exportProjectZip(req.params.projectId, res);
    } catch (error) {
      return next(error);
    }
  }

  async exportCategoryZip(req: Request, res: Response, next: NextFunction) {
    try {
      res.setHeader('Content-Type', 'application/zip');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="devblueprint-category-${req.params.categoryId}.zip"`
      );
      await importExportService.exportCategoryZip(req.params.categoryId, res);
    } catch (error) {
      return next(error);
    }
  }

  async importFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const files = req.files as Express.Multer.File[];
      const { projectId, categoryId } = req.body;

      if (!files || files.length === 0) {
        throw new BadRequestError('No files uploaded');
      }
      if (!projectId || !categoryId) {
        throw new BadRequestError('projectId and categoryId are required');
      }

      const created = await importExportService.importMarkdownFiles(
        projectId,
        categoryId,
        req.user!.id,
        files.map((f) => ({ originalname: f.originalname, buffer: f.buffer }))
      );

      return sendSuccess(res, created, `Successfully imported ${created.length} documents`, 201);
    } catch (error) {
      return next(error);
    }
  }

  async importZip(req: Request, res: Response, next: NextFunction) {
    try {
      const file = req.file;
      const { projectId } = req.body;

      if (!file) {
        throw new BadRequestError('No ZIP file uploaded');
      }
      if (!projectId) {
        throw new BadRequestError('projectId is required');
      }

      const result = await importExportService.importZipArchive(
        projectId,
        req.user!.id,
        file.buffer
      );

      return sendSuccess(res, result, `Successfully imported ${result.importedCount} documents from ZIP`, 201);
    } catch (error) {
      return next(error);
    }
  }
}

export const importExportController = new ImportExportController();

