import { prisma } from '../../config/db';
import { NotFoundError, ConflictError } from '../../utils/errors';
import { slugify, sanitizeFileName } from '@devblueprint/shared';
import { DocumentStatus, ActivityAction } from '@prisma/client';

export class DocumentService {
  async getDocument(documentId: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        category: {
          select: { id: true, name: true, slug: true }
        },
        createdBy: {
          select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
        },
        updatedBy: {
          select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
        },
        documentTags: {
          include: { tag: true }
        },
        versions: {
          orderBy: { versionNumber: 'desc' },
          select: {
            id: true,
            versionNumber: true,
            title: true,
            changeSummary: true,
            createdAt: true,
            author: {
              select: { id: true, name: true }
            }
          }
        },
        comments: {
          where: { parentId: null },
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
            },
            replies: {
              orderBy: { createdAt: 'asc' },
              include: {
                user: {
                  select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
                }
              }
            }
          }
        },
        reviewRequests: {
          orderBy: { createdAt: 'desc' },
          include: {
            requester: {
              select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
            },
            approvals: {
              include: {
                reviewer: {
                  select: { id: true, name: true, email: true, avatarUrl: true, createdAt: true }
                }
              }
            }
          }
        }
      }
    });

    if (!document) {
      throw new NotFoundError('Document not found');
    }

    return {
      id: document.id,
      projectId: document.projectId,
      categoryId: document.categoryId,
      categoryName: document.category.name,
      title: document.title,
      fileName: document.fileName,
      slug: document.slug,
      description: document.description,
      content: document.content,
      status: document.status,
      isOptional: document.isOptional,
      sortOrder: document.sortOrder,
      versionNumber: document.versionNumber,
      isArchived: document.isArchived,
      tags: document.documentTags.map((dt) => dt.tag.name),
      createdBy: document.createdBy,
      updatedBy: document.updatedBy,
      versions: document.versions.map((v) => ({
        id: v.id,
        versionNumber: v.versionNumber,
        title: v.title,
        changeSummary: v.changeSummary,
        authorId: v.author.id,
        authorName: v.author.name,
        createdAt: v.createdAt.toISOString()
      })),
      comments: document.comments.map((c) => ({
        id: c.id,
        documentId: c.documentId,
        userId: c.userId,
        user: c.user,
        content: c.content,
        isResolved: c.isResolved,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
        replies: c.replies.map((r) => ({
          id: r.id,
          documentId: r.documentId,
          userId: r.userId,
          user: r.user,
          content: r.content,
          isResolved: r.isResolved,
          createdAt: r.createdAt.toISOString(),
          updatedAt: r.updatedAt.toISOString()
        }))
      })),
      reviewRequests: document.reviewRequests.map((rr) => ({
        id: rr.id,
        documentId: rr.documentId,
        requesterId: rr.requesterId,
        requester: rr.requester,
        status: rr.status,
        notes: rr.notes,
        createdAt: rr.createdAt.toISOString(),
        approvals: rr.approvals.map((a) => ({
          id: a.id,
          reviewRequestId: a.reviewRequestId,
          reviewerId: a.reviewerId,
          reviewer: a.reviewer,
          status: a.status,
          comment: a.comment,
          createdAt: a.createdAt.toISOString()
        }))
      })),
      createdAt: document.createdAt.toISOString(),
      updatedAt: document.updatedAt.toISOString()
    };
  }

  async createDocument(
    userId: string,
    data: {
      projectId: string;
      categoryId: string;
      title: string;
      fileName?: string;
      description?: string;
      content?: string;
      status?: DocumentStatus;
      isOptional?: boolean;
      sortOrder?: number;
      tags?: string[];
    }
  ) {
    const slug = slugify(data.title);
    const fileName =
      data.fileName || `${slug.toUpperCase().replace(/-/g, '_')}.md`;

    let sortOrder = data.sortOrder;
    if (sortOrder === undefined) {
      const maxDoc = await prisma.document.findFirst({
        where: { categoryId: data.categoryId },
        orderBy: { sortOrder: 'desc' },
        select: { sortOrder: true }
      });
      sortOrder = (maxDoc?.sortOrder ?? 0) + 1;
    }

    const project = await prisma.project.findUnique({
      where: { id: data.projectId },
      select: { workspaceId: true }
    });

    return await prisma.$transaction(async (tx) => {
      const document = await tx.document.create({
        data: {
          projectId: data.projectId,
          categoryId: data.categoryId,
          title: data.title,
          fileName,
          slug,
          description: data.description,
          content: data.content || '',
          status: data.status || DocumentStatus.NOT_STARTED,
          isOptional: data.isOptional ?? false,
          sortOrder,
          versionNumber: 1,
          createdById: userId,
          updatedById: userId
        }
      });

      // Initial version snapshot
      await tx.documentVersion.create({
        data: {
          documentId: document.id,
          versionNumber: 1,
          title: document.title,
          content: document.content,
          changeSummary: 'Document created',
          authorId: userId
        }
      });

      // Add tags if specified
      if (data.tags && data.tags.length > 0 && project) {
        for (const tagName of data.tags) {
          const tag = await tx.tag.upsert({
            where: {
              workspaceId_name: {
                workspaceId: project.workspaceId,
                name: tagName
              }
            },
            create: {
              workspaceId: project.workspaceId,
              name: tagName
            },
            update: {}
          });

          await tx.documentTag.create({
            data: {
              documentId: document.id,
              tagId: tag.id
            }
          });
        }
      }

      if (project) {
        await tx.activityLog.create({
          data: {
            workspaceId: project.workspaceId,
            projectId: data.projectId,
            documentId: document.id,
            userId,
            action: ActivityAction.CREATED,
            entityType: 'DOCUMENT',
            metadata: JSON.stringify({ documentTitle: document.title })
          }
        });
      }

      return document;
    });
  }

  async updateDocument(
    documentId: string,
    userId: string,
    data: {
      title?: string;
      fileName?: string;
      description?: string | null;
      content?: string;
      status?: DocumentStatus;
      isOptional?: boolean;
      changeSummary?: string;
      expectedVersion?: number;
      tags?: string[];
    }
  ) {
    const existing = await prisma.document.findUnique({
      where: { id: documentId },
      include: {
        project: { select: { workspaceId: true } }
      }
    });

    if (!existing) {
      throw new NotFoundError('Document not found');
    }

    // Optimistic concurrency control check
    if (data.expectedVersion !== undefined && existing.versionNumber !== data.expectedVersion) {
      throw new ConflictError(
        `Document was modified by another session (expected v${data.expectedVersion}, but server has v${existing.versionNumber}). Please review latest version before overwriting.`,
        { currentVersion: existing.versionNumber, serverContent: existing.content }
      );
    }

    const contentChanged = data.content !== undefined && data.content !== existing.content;
    const titleChanged = data.title !== undefined && data.title !== existing.title;
    const shouldCreateVersion = contentChanged || titleChanged;
    const newVersionNumber = shouldCreateVersion ? existing.versionNumber + 1 : existing.versionNumber;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          ...(data.title ? { title: data.title, slug: slugify(data.title) } : {}),
          ...(data.fileName ? { fileName: sanitizeFileName(data.fileName) } : {}),
          ...(data.description !== undefined ? { description: data.description } : {}),
          ...(data.content !== undefined ? { content: data.content } : {}),
          ...(data.status ? { status: data.status } : {}),
          ...(data.isOptional !== undefined ? { isOptional: data.isOptional } : {}),
          versionNumber: newVersionNumber,
          updatedById: userId
        }
      });

      if (shouldCreateVersion) {
        await tx.documentVersion.create({
          data: {
            documentId,
            versionNumber: newVersionNumber,
            title: updated.title,
            content: updated.content,
            changeSummary: data.changeSummary || 'Updated content',
            authorId: userId
          }
        });

        await tx.activityLog.create({
          data: {
            workspaceId: existing.project.workspaceId,
            projectId: existing.projectId,
            documentId,
            userId,
            action: ActivityAction.UPDATED,
            entityType: 'DOCUMENT',
            metadata: JSON.stringify({
              documentTitle: updated.title,
              version: newVersionNumber,
              status: updated.status
            })
          }
        });
      }

      // Sync tags if passed
      if (data.tags !== undefined) {
        await tx.documentTag.deleteMany({ where: { documentId } });
        for (const tagName of data.tags) {
          const tag = await tx.tag.upsert({
            where: {
              workspaceId_name: {
                workspaceId: existing.project.workspaceId,
                name: tagName
              }
            },
            create: {
              workspaceId: existing.project.workspaceId,
              name: tagName
            },
            update: {}
          });

          await tx.documentTag.create({
            data: {
              documentId,
              tagId: tag.id
            }
          });
        }
      }

      return updated;
    });
  }

  async duplicateDocument(documentId: string, userId: string) {
    const original = await prisma.document.findUnique({
      where: { id: documentId }
    });

    if (!original) throw new NotFoundError('Document not found');

    const newTitle = `${original.title} (Copy)`;
    const newSlug = `${original.slug}-copy`;
    const newFileName = `${newSlug.toUpperCase().replace(/-/g, '_')}.md`;

    const duplicated = await prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          projectId: original.projectId,
          categoryId: original.categoryId,
          title: newTitle,
          fileName: newFileName,
          slug: newSlug,
          description: original.description,
          content: original.content,
          status: DocumentStatus.DRAFT,
          isOptional: original.isOptional,
          sortOrder: original.sortOrder + 1,
          versionNumber: 1,
          createdById: userId,
          updatedById: userId
        }
      });

      await tx.documentVersion.create({
        data: {
          documentId: doc.id,
          versionNumber: 1,
          title: doc.title,
          content: doc.content,
          changeSummary: 'Duplicated from ' + original.title,
          authorId: userId
        }
      });

      return doc;
    });

    return duplicated;
  }

  async moveDocument(documentId: string, newCategoryId: string, sortOrder?: number) {
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: {
        categoryId: newCategoryId,
        ...(sortOrder !== undefined ? { sortOrder } : {})
      }
    });

    return updated;
  }

  async archiveDocument(documentId: string) {
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { isArchived: true, status: DocumentStatus.ARCHIVED }
    });
    return updated;
  }

  async restoreDocument(documentId: string) {
    const updated = await prisma.document.update({
      where: { id: documentId },
      data: { isArchived: false, status: DocumentStatus.DRAFT }
    });
    return updated;
  }

  async deleteDocument(documentId: string) {
    await prisma.document.delete({
      where: { id: documentId }
    });
    return { message: 'Document permanently deleted' };
  }

  async listVersions(documentId: string) {
    const versions = await prisma.documentVersion.findMany({
      where: { documentId },
      orderBy: { versionNumber: 'desc' },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return versions.map((v) => ({
      id: v.id,
      documentId: v.documentId,
      versionNumber: v.versionNumber,
      title: v.title,
      changeSummary: v.changeSummary,
      content: v.content,
      author: v.author,
      createdAt: v.createdAt.toISOString()
    }));
  }

  async getVersion(documentId: string, versionNumber: number) {
    const version = await prisma.documentVersion.findUnique({
      where: {
        documentId_versionNumber: {
          documentId,
          versionNumber
        }
      },
      include: {
        author: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    if (!version) throw new NotFoundError('Version not found');

    return {
      id: version.id,
      documentId: version.documentId,
      versionNumber: version.versionNumber,
      title: version.title,
      changeSummary: version.changeSummary,
      content: version.content,
      author: version.author,
      createdAt: version.createdAt.toISOString()
    };
  }

  async restoreVersion(documentId: string, versionNumber: number, userId: string) {
    const versionToRestore = await prisma.documentVersion.findUnique({
      where: {
        documentId_versionNumber: {
          documentId,
          versionNumber
        }
      }
    });

    if (!versionToRestore) {
      throw new NotFoundError(`Version ${versionNumber} not found`);
    }

    const currentDoc = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { select: { workspaceId: true } } }
    });

    if (!currentDoc) {
      throw new NotFoundError('Document not found');
    }

    const newVersionNumber = currentDoc.versionNumber + 1;

    return await prisma.$transaction(async (tx) => {
      const updated = await tx.document.update({
        where: { id: documentId },
        data: {
          title: versionToRestore.title,
          content: versionToRestore.content,
          versionNumber: newVersionNumber,
          updatedById: userId
        }
      });

      await tx.documentVersion.create({
        data: {
          documentId,
          versionNumber: newVersionNumber,
          title: versionToRestore.title,
          content: versionToRestore.content,
          changeSummary: `Restored from version ${versionNumber}`,
          authorId: userId
        }
      });

      await tx.activityLog.create({
        data: {
          workspaceId: currentDoc.project.workspaceId,
          projectId: currentDoc.projectId,
          documentId,
          userId,
          action: ActivityAction.RESTORED,
          entityType: 'DOCUMENT',
          metadata: JSON.stringify({
            documentTitle: updated.title,
            restoredFromVersion: versionNumber,
            newVersion: newVersionNumber
          })
        }
      });

      return updated;
    });
  }
}

export const documentService = new DocumentService();

