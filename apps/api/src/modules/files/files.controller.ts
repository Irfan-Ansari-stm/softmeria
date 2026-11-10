import { Request, Response, NextFunction } from 'express';
import fs from 'fs';
import path from 'path';
import { filesService } from './files.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError, NotFoundError } from '../../utils/errors';

export class FilesController {
  // Folders
  async listFolders(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const projectId = req.query.projectId as string | undefined;
      if (!workspaceId) throw new BadRequestError('Workspace ID is required');

      const folders = await filesService.listFolders(workspaceId, projectId);
      return sendSuccess(res, folders, 'Folders retrieved');
    } catch (err) {
      next(err);
    }
  }

  async createFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const folder = await filesService.createFolder(userId, req.body);
      return sendSuccess(res, folder, 'Folder created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const folder = await filesService.updateFolder(req.params.id, req.body);
      return sendSuccess(res, folder, 'Folder updated');
    } catch (err) {
      next(err);
    }
  }

  async deleteFolder(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await filesService.deleteFolder(req.params.id);
      return sendSuccess(res, result, 'Folder deleted');
    } catch (err) {
      next(err);
    }
  }

  // Files
  async listFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      if (!workspaceId) throw new BadRequestError('Workspace ID is required');

      const files = await filesService.listFiles({
        workspaceId,
        projectId: req.query.projectId as string,
        folderId: req.query.folderId as string,
        type: req.query.type as string,
        search: req.query.search as string,
        uploaderId: req.query.uploaderId as string,
        includeDeleted: req.query.includeDeleted === 'true',
        sortBy: req.query.sortBy as string
      });

      return sendSuccess(res, files, 'Files retrieved');
    } catch (err) {
      next(err);
    }
  }

  async uploadFiles(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const workspaceId = req.body.workspaceId || (req.query.workspaceId as string);
      const projectId = req.body.projectId || (req.query.projectId as string);
      const folderId = req.body.folderId || (req.query.folderId as string);

      if (!workspaceId) throw new BadRequestError('Workspace ID is required');

      const files = (req.files as Express.Multer.File[]) || (req.file ? [req.file] : []);
      if (files.length === 0) throw new BadRequestError('No files uploaded');

      const uploadedResults = [];
      for (const file of files) {
        const record = await filesService.saveUploadedFile(
          userId,
          workspaceId,
          projectId,
          folderId,
          file,
          {
            documentId: req.body.documentId,
            taskId: req.body.taskId,
            bugId: req.body.bugId,
            rfcId: req.body.rfcId
          }
        );
        uploadedResults.push(record);
      }

      return sendSuccess(res, uploadedResults, `${uploadedResults.length} file(s) uploaded successfully`, 201);
    } catch (err) {
      next(err);
    }
  }

  async getFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.getFile(req.params.id);
      return sendSuccess(res, file, 'File details retrieved');
    } catch (err) {
      next(err);
    }
  }

  async downloadFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.getFile(req.params.id);
      if (!fs.existsSync(file.storagePath)) {
        throw new NotFoundError('File binary not found on storage server');
      }

      res.setHeader('Content-Disposition', `attachment; filename="${file.originalName}"`);
      res.setHeader('Content-Type', file.mimeType);
      const stream = fs.createReadStream(file.storagePath);
      stream.pipe(res);
    } catch (err) {
      next(err);
    }
  }

  async previewFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.getFile(req.params.id);
      if (!fs.existsSync(file.storagePath)) {
        throw new NotFoundError('File binary not found on storage server');
      }

      // If text/markdown/json/csv/xml/yaml, return content as text in JSON or stream inline
      if (req.query.raw === 'true') {
        res.setHeader('Content-Type', file.mimeType);
        res.setHeader('Content-Disposition', `inline; filename="${file.originalName}"`);
        return fs.createReadStream(file.storagePath).pipe(res);
      }

      // Check if text-previewable
      const isText = ['txt', 'md', 'json', 'csv', 'xml', 'yaml', 'yml', 'sql', 'svg'].includes(file.extension.toLowerCase());
      if (isText && file.sizeBytes < 5 * 1024 * 1024) {
        const textContent = fs.readFileSync(file.storagePath, 'utf8');
        return sendSuccess(res, { ...file, textContent, content: textContent, previewType: 'TEXT' });
      }

      return sendSuccess(res, {
        ...file,
        previewType: ['png', 'jpg', 'jpeg', 'webp', 'gif', 'svg'].includes(file.extension.toLowerCase())
          ? 'IMAGE'
          : file.extension.toLowerCase() === 'pdf'
          ? 'PDF'
          : 'DOWNLOAD_ONLY'
      });
    } catch (err) {
      next(err);
    }
  }

  async renameFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.renameFile(req.params.id, req.body.name);
      return sendSuccess(res, file, 'File renamed');
    } catch (err) {
      next(err);
    }
  }

  async moveFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.moveFile(req.params.id, req.body.folderId || null);
      return sendSuccess(res, file, 'File moved');
    } catch (err) {
      next(err);
    }
  }

  async copyFile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const file = await filesService.copyFile(req.params.id, userId, req.body.folderId);
      return sendSuccess(res, file, 'File copied', 201);
    } catch (err) {
      next(err);
    }
  }

  async deleteFile(req: Request, res: Response, next: NextFunction) {
    try {
      const permanent = req.query.permanent === 'true';
      const file = await filesService.deleteFile(req.params.id, permanent);
      return sendSuccess(res, file, permanent ? 'File permanently deleted' : 'File moved to trash');
    } catch (err) {
      next(err);
    }
  }

  async restoreFile(req: Request, res: Response, next: NextFunction) {
    try {
      const file = await filesService.restoreFile(req.params.id);
      return sendSuccess(res, file, 'File restored');
    } catch (err) {
      next(err);
    }
  }

  async bulkDelete(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileIds, permanent } = req.body;
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        throw new BadRequestError('fileIds array is required');
      }
      const result = await filesService.bulkDelete(fileIds, !!permanent);
      return sendSuccess(res, result, `${fileIds.length} file(s) deleted`);
    } catch (err) {
      next(err);
    }
  }

  async bulkMove(req: Request, res: Response, next: NextFunction) {
    try {
      const { fileIds, targetFolderId } = req.body;
      if (!Array.isArray(fileIds) || fileIds.length === 0) {
        throw new BadRequestError('fileIds array is required');
      }
      const result = await filesService.bulkMove(fileIds, targetFolderId || null);
      return sendSuccess(res, result, `${fileIds.length} file(s) moved`);
    } catch (err) {
      next(err);
    }
  }

  async createFileVersion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      if (!req.file) throw new BadRequestError('No file provided for new version');

      const updated = await filesService.createFileVersion(
        req.params.id,
        userId,
        req.file,
        req.body.changeNotes
      );
      return sendSuccess(res, updated, 'New file version created', 201);
    } catch (err) {
      next(err);
    }
  }

  async attachFile(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const attachment = await filesService.attachFile(req.params.id, userId, req.body);
      return sendSuccess(res, attachment, 'File attached', 201);
    } catch (err) {
      next(err);
    }
  }

  async detachFile(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await filesService.detachFile(req.params.attachmentId);
      return sendSuccess(res, result, 'File detached');
    } catch (err) {
      next(err);
    }
  }

  async getStorageStats(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      const projectId = req.query.projectId as string | undefined;
      if (!workspaceId) throw new BadRequestError('Workspace ID is required');

      const stats = await filesService.getStorageStats(workspaceId, projectId);
      return sendSuccess(res, stats, 'Storage telemetry retrieved');
    } catch (err) {
      next(err);
    }
  }
}

export const filesController = new FilesController();
