import { Request, Response, NextFunction } from 'express';
import { documentService } from './documents.service';
import { sendSuccess } from '../../utils/response';

export class DocumentController {
  async getDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.getDocument(req.params.documentId);
      return sendSuccess(res, doc, 'Document retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.createDocument(
        req.user!.id,
        req.body
      );
      return sendSuccess(res, doc, 'Document created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.updateDocument(
        req.params.documentId,
        req.user!.id,
        req.body
      );
      return sendSuccess(res, doc, 'Document updated');
    } catch (error) {
      return next(error);
    }
  }

  async duplicateDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.duplicateDocument(
        req.params.documentId,
        req.user!.id
      );
      return sendSuccess(res, doc, 'Document duplicated', 201);
    } catch (error) {
      return next(error);
    }
  }

  async moveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.moveDocument(
        req.params.documentId,
        req.body.categoryId,
        req.body.sortOrder
      );
      return sendSuccess(res, doc, 'Document moved');
    } catch (error) {
      return next(error);
    }
  }

  async archiveDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.archiveDocument(req.params.documentId);
      return sendSuccess(res, doc, 'Document archived');
    } catch (error) {
      return next(error);
    }
  }

  async restoreDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.restoreDocument(req.params.documentId);
      return sendSuccess(res, doc, 'Document restored');
    } catch (error) {
      return next(error);
    }
  }

  async deleteDocument(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await documentService.deleteDocument(req.params.documentId);
      return sendSuccess(res, result, 'Document permanently deleted');
    } catch (error) {
      return next(error);
    }
  }

  async listVersions(req: Request, res: Response, next: NextFunction) {
    try {
      const versions = await documentService.listVersions(req.params.documentId);
      return sendSuccess(res, versions, 'Document versions retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const version = await documentService.getVersion(
        req.params.documentId,
        parseInt(req.params.versionNumber, 10)
      );
      return sendSuccess(res, version, 'Document version retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async restoreVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const doc = await documentService.restoreVersion(
        req.params.documentId,
        req.body.versionNumber,
        req.user!.id
      );
      return sendSuccess(res, doc, 'Version restored successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const documentController = new DocumentController();

