import { prisma } from '../../config/db';
import { NotFoundError, ForbiddenError } from '../../utils/errors';
import { ActivityAction } from '@prisma/client';

export class CommentService {
  async createComment(
    userId: string,
    data: { documentId: string; content: string; parentId?: string | null }
  ) {
    const document = await prisma.document.findUnique({
      where: { id: data.documentId },
      include: { project: { select: { workspaceId: true } } }
    });

    if (!document) throw new NotFoundError('Document not found');

    const comment = await prisma.comment.create({
      data: {
        documentId: data.documentId,
        userId,
        content: data.content,
        parentId: data.parentId
      },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: document.project.workspaceId,
        projectId: document.projectId,
        documentId: document.id,
        userId,
        action: ActivityAction.COMMENTED,
        entityType: 'COMMENT',
        metadata: JSON.stringify({
          documentTitle: document.title,
          commentId: comment.id
        })
      }
    });

    return comment;
  }

  async resolveComment(commentId: string, isResolved = true) {
    const comment = await prisma.comment.update({
      where: { id: commentId },
      data: { isResolved },
      include: {
        user: {
          select: { id: true, name: true, email: true, avatarUrl: true }
        }
      }
    });

    return comment;
  }

  async deleteComment(commentId: string, userId: string) {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId }
    });

    if (!comment) throw new NotFoundError('Comment not found');
    if (comment.userId !== userId) {
      throw new ForbiddenError('Only the author can delete their comment');
    }

    await prisma.comment.delete({
      where: { id: commentId }
    });

    return { message: 'Comment deleted' };
  }
}

export const commentService = new CommentService();

