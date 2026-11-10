import fs from 'fs';
import path from 'path';
import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ActivityAction } from '@prisma/client';

const UPLOAD_ROOT = path.resolve(process.cwd(), 'uploads');
if (!fs.existsSync(UPLOAD_ROOT)) {
  fs.mkdirSync(UPLOAD_ROOT, { recursive: true });
}

export class FilesService {
  // -------------------------------------------------------------------------
  // FOLDERS
  // -------------------------------------------------------------------------
  async listFolders(workspaceId: string, projectId?: string) {
    const where: any = { workspaceId };
    if (projectId) where.projectId = projectId;

    const folders = await prisma.fileFolder.findMany({
      where,
      include: {
        children: true,
        _count: { select: { files: { where: { isDeleted: false } } } }
      },
      orderBy: { name: 'asc' }
    });

    return folders.map((f) => ({
      ...f,
      fileCount: f._count.files
    }));
  }

  async createFolder(userId: string, data: {
    workspaceId: string;
    projectId?: string;
    parentId?: string;
    name: string;
    color?: string;
  }) {
    if (!data.name || !data.name.trim()) {
      throw new BadRequestError('Folder name is required');
    }

    const folder = await prisma.fileFolder.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        parentId: data.parentId,
        name: data.name.trim(),
        color: data.color || '#3b82f6'
      }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId,
        userId,
        action: ActivityAction.CREATED,
        entityType: 'FileFolder',
        metadata: JSON.stringify({ folderId: folder.id, name: folder.name })
      }
    });

    return folder;
  }

  async updateFolder(folderId: string, data: { name?: string; color?: string; parentId?: string }) {
    const existing = await prisma.fileFolder.findUnique({ where: { id: folderId } });
    if (!existing) throw new NotFoundError('Folder not found');

    return prisma.fileFolder.update({
      where: { id: folderId },
      data: {
        name: data.name?.trim() || existing.name,
        color: data.color || existing.color,
        parentId: data.parentId !== undefined ? data.parentId : existing.parentId
      }
    });
  }

  async deleteFolder(folderId: string) {
    const existing = await prisma.fileFolder.findUnique({ where: { id: folderId } });
    if (!existing) throw new NotFoundError('Folder not found');

    return prisma.fileFolder.delete({ where: { id: folderId } });
  }

  // -------------------------------------------------------------------------
  // FILES
  // -------------------------------------------------------------------------
  async saveUploadedFile(
    userId: string,
    workspaceId: string,
    projectId: string | undefined,
    folderId: string | undefined,
    file: Express.Multer.File,
    metadata?: { documentId?: string; taskId?: string; bugId?: string; rfcId?: string }
  ) {
    const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
    const cleanOriginalName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}-${cleanOriginalName}`;
    const destinationPath = path.join(UPLOAD_ROOT, diskFileName);

    // Write file to disk storage if memory storage or copy from temp
    if (file.buffer) {
      fs.writeFileSync(destinationPath, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, destinationPath);
    }

    const fileRecord = await prisma.fileItem.create({
      data: {
        workspaceId,
        projectId: projectId || null,
        folderId: folderId || null,
        uploaderId: userId,
        name: cleanOriginalName,
        originalName: file.originalname,
        mimeType: file.mimetype || 'application/octet-stream',
        extension: ext || 'bin',
        sizeBytes: file.size,
        storagePath: destinationPath,
        storageType: 'LOCAL',
        version: 1,
        documentId: metadata?.documentId,
        taskId: metadata?.taskId,
        bugId: metadata?.bugId,
        rfcId: metadata?.rfcId
      },
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
        folder: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      }
    });

    // Create initial version entry
    await prisma.fileVersion.create({
      data: {
        fileId: fileRecord.id,
        versionNumber: 1,
        sizeBytes: file.size,
        storagePath: destinationPath,
        uploaderId: userId,
        changeNotes: 'Initial upload'
      }
    });

    // Activity log
    await prisma.activityLog.create({
      data: {
        workspaceId,
        projectId: projectId || null,
        userId,
        action: ActivityAction.CREATED,
        entityType: 'FileItem',
        metadata: JSON.stringify({ fileId: fileRecord.id, name: fileRecord.name, size: file.size })
      }
    });

    return fileRecord;
  }

  async listFiles(query: {
    workspaceId: string;
    projectId?: string;
    folderId?: string;
    type?: string;
    search?: string;
    uploaderId?: string;
    includeDeleted?: boolean;
    sortBy?: string;
  }) {
    const where: any = {
      workspaceId: query.workspaceId,
      isDeleted: query.includeDeleted ? undefined : false
    };

    if (query.projectId) where.projectId = query.projectId;
    if (query.folderId !== undefined) {
      where.folderId = query.folderId === 'root' || query.folderId === '' ? null : query.folderId;
    }
    if (query.uploaderId) where.uploaderId = query.uploaderId;

    if (query.type && query.type !== 'ALL') {
      const typeLower = query.type.toLowerCase();
      if (typeLower === 'documents') {
        where.extension = { in: ['pdf', 'doc', 'docx', 'txt', 'md'] };
      } else if (typeLower === 'images') {
        where.extension = { in: ['png', 'jpg', 'jpeg', 'svg', 'webp', 'gif'] };
      } else if (typeLower === 'data') {
        where.extension = { in: ['json', 'csv', 'xlsx', 'xml', 'yaml', 'yml', 'sql'] };
      } else if (typeLower === 'archives') {
        where.extension = { in: ['zip', 'tar', 'gz', 'rar'] };
      } else {
        where.extension = typeLower;
      }
    }

    if (query.search) {
      where.OR = [
        { name: { contains: query.search, mode: 'insensitive' } },
        { originalName: { contains: query.search, mode: 'insensitive' } },
        { extension: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    let orderBy: any = { createdAt: 'desc' };
    if (query.sortBy === 'name') orderBy = { name: 'asc' };
    else if (query.sortBy === 'size') orderBy = { sizeBytes: 'desc' };
    else if (query.sortBy === 'oldest') orderBy = { createdAt: 'asc' };

    return prisma.fileItem.findMany({
      where,
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
        folder: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } },
        versions: {
          orderBy: { versionNumber: 'desc' },
          take: 5
        }
      },
      orderBy
    });
  }

  async getFile(fileId: string) {
    const file = await prisma.fileItem.findUnique({
      where: { id: fileId },
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
        folder: true,
        project: { select: { id: true, name: true } },
        versions: {
          include: { uploader: { select: { id: true, name: true } } },
          orderBy: { versionNumber: 'desc' }
        },
        attachments: true
      }
    });

    if (!file) throw new NotFoundError('File not found');
    return file;
  }

  async renameFile(fileId: string, newName: string) {
    if (!newName || !newName.trim()) throw new BadRequestError('File name is required');
    const existing = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!existing) throw new NotFoundError('File not found');

    const clean = newName.trim().replace(/[^a-zA-Z0-9._-]/g, '_');
    return prisma.fileItem.update({
      where: { id: fileId },
      data: { name: clean }
    });
  }

  async moveFile(fileId: string, folderId: string | null) {
    const existing = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!existing) throw new NotFoundError('File not found');

    return prisma.fileItem.update({
      where: { id: fileId },
      data: { folderId }
    });
  }

  async copyFile(fileId: string, userId: string, targetFolderId?: string) {
    const existing = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!existing) throw new NotFoundError('File not found');

    const copyDiskName = `${Date.now()}-copy-${existing.name}`;
    const copyPath = path.join(UPLOAD_ROOT, copyDiskName);

    if (fs.existsSync(existing.storagePath)) {
      fs.copyFileSync(existing.storagePath, copyPath);
    }

    return prisma.fileItem.create({
      data: {
        workspaceId: existing.workspaceId,
        projectId: existing.projectId,
        folderId: targetFolderId !== undefined ? targetFolderId : existing.folderId,
        uploaderId: userId,
        name: `Copy of ${existing.name}`,
        originalName: existing.originalName,
        mimeType: existing.mimeType,
        extension: existing.extension,
        sizeBytes: existing.sizeBytes,
        storagePath: copyPath,
        storageType: existing.storageType,
        version: 1
      },
      include: {
        uploader: { select: { id: true, name: true, avatarUrl: true } },
        folder: { select: { id: true, name: true } }
      }
    });
  }

  async deleteFile(fileId: string, permanent: boolean = false) {
    const existing = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!existing) throw new NotFoundError('File not found');

    if (permanent) {
      if (fs.existsSync(existing.storagePath)) {
        try { fs.unlinkSync(existing.storagePath); } catch {}
      }
      return prisma.fileItem.delete({ where: { id: fileId } });
    }

    return prisma.fileItem.update({
      where: { id: fileId },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  async restoreFile(fileId: string) {
    const existing = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!existing) throw new NotFoundError('File not found');

    return prisma.fileItem.update({
      where: { id: fileId },
      data: { isDeleted: false, deletedAt: null }
    });
  }

  async bulkDelete(fileIds: string[], permanent: boolean = false) {
    if (permanent) {
      return prisma.fileItem.deleteMany({ where: { id: { in: fileIds } } });
    }
    return prisma.fileItem.updateMany({
      where: { id: { in: fileIds } },
      data: { isDeleted: true, deletedAt: new Date() }
    });
  }

  async bulkMove(fileIds: string[], targetFolderId: string | null) {
    return prisma.fileItem.updateMany({
      where: { id: { in: fileIds } },
      data: { folderId: targetFolderId }
    });
  }

  async createFileVersion(fileId: string, userId: string, file: Express.Multer.File, changeNotes?: string) {
    const existing = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!existing) throw new NotFoundError('File not found');

    const cleanName = path.basename(file.originalname).replace(/[^a-zA-Z0-9._-]/g, '_');
    const diskFileName = `${Date.now()}-v${existing.version + 1}-${cleanName}`;
    const destinationPath = path.join(UPLOAD_ROOT, diskFileName);

    if (file.buffer) {
      fs.writeFileSync(destinationPath, file.buffer);
    } else if (file.path && fs.existsSync(file.path)) {
      fs.copyFileSync(file.path, destinationPath);
    }

    const newVersionNumber = existing.version + 1;

    await prisma.fileVersion.create({
      data: {
        fileId: existing.id,
        versionNumber: newVersionNumber,
        sizeBytes: file.size,
        storagePath: destinationPath,
        uploaderId: userId,
        changeNotes: changeNotes || `Uploaded version ${newVersionNumber}`
      }
    });

    return prisma.fileItem.update({
      where: { id: fileId },
      data: {
        version: newVersionNumber,
        sizeBytes: file.size,
        storagePath: destinationPath,
        updatedAt: new Date()
      },
      include: {
        versions: { orderBy: { versionNumber: 'desc' } },
        uploader: true
      }
    });
  }

  async attachFile(fileId: string, userId: string, data: { entityType: string; entityId: string }) {
    const file = await prisma.fileItem.findUnique({ where: { id: fileId } });
    if (!file) throw new NotFoundError('File not found');

    return prisma.fileAttachment.create({
      data: {
        fileId,
        entityType: data.entityType,
        entityId: data.entityId,
        attachedById: userId
      },
      include: { file: true }
    });
  }

  async detachFile(attachmentId: string) {
    return prisma.fileAttachment.delete({ where: { id: attachmentId } });
  }

  async getStorageStats(workspaceId: string, projectId?: string) {
    const where: any = { workspaceId, isDeleted: false };
    if (projectId) where.projectId = projectId;

    const files = await prisma.fileItem.findMany({
      where,
      include: {
        project: { select: { id: true, name: true } }
      }
    });

    const totalFiles = files.length;
    const totalStorageBytes = files.reduce((acc, f) => acc + f.sizeBytes, 0);
    const storageLimitBytes = 50 * 1024 * 1024 * 1024; // 50 GB enterprise quota
    const usedPercentage = storageLimitBytes > 0 ? Math.round((totalStorageBytes / storageLimitBytes) * 10000) / 100 : 0;

    // Breakdown by extension/type
    const filesByType: Record<string, { count: number; bytes: number }> = {};
    for (const f of files) {
      const ext = (f.extension || 'other').toUpperCase();
      if (!filesByType[ext]) filesByType[ext] = { count: 0, bytes: 0 };
      filesByType[ext].count += 1;
      filesByType[ext].bytes += f.sizeBytes;
    }

    // Breakdown by project
    const projectMap: Record<string, { projectName: string; count: number; bytes: number }> = {};
    for (const f of files) {
      const pid = f.projectId || 'unassigned';
      const pname = f.project?.name || 'Workspace Root';
      if (!projectMap[pid]) projectMap[pid] = { projectName: pname, count: 0, bytes: 0 };
      projectMap[pid].count += 1;
      projectMap[pid].bytes += f.sizeBytes;
    }

    const filesByProject = Object.entries(projectMap).map(([projectId, info]) => ({
      projectId,
      projectName: info.projectName,
      count: info.count,
      bytes: info.bytes
    }));

    const sortedByDate = [...files].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    const sortedBySize = [...files].sort((a, b) => b.sizeBytes - a.sizeBytes);

    return {
      totalFiles,
      totalStorageBytes,
      storageLimitBytes,
      usedPercentage,
      filesByType,
      filesByProject,
      recentUploads: sortedByDate.slice(0, 5),
      largestFiles: sortedBySize.slice(0, 5)
    };
  }
}

export const filesService = new FilesService();
