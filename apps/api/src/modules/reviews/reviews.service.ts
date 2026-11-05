import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { ReviewStatus, DocumentStatus, ActivityAction } from '@prisma/client';

export class ReviewService {
  async createReviewRequest(userId: string, documentId: string, notes?: string) {
    const document = await prisma.document.findUnique({
      where: { id: documentId },
      include: { project: { select: { workspaceId: true } } }
    });

    if (!document) throw new NotFoundError('Document not found');

    return await prisma.$transaction(async (tx) => {
      const reviewRequest = await tx.reviewRequest.create({
        data: {
          documentId,
          requesterId: userId,
          status: ReviewStatus.PENDING,
          notes
        },
        include: {
          requester: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        }
      });

      await tx.document.update({
        where: { id: documentId },
        data: { status: DocumentStatus.IN_REVIEW }
      });

      await tx.activityLog.create({
        data: {
          workspaceId: document.project.workspaceId,
          projectId: document.projectId,
          documentId: document.id,
          userId,
          action: ActivityAction.REVIEW_REQUESTED,
          entityType: 'REVIEW',
          metadata: JSON.stringify({
            documentTitle: document.title,
            requestId: reviewRequest.id
          })
        }
      });

      return reviewRequest;
    });
  }

  async submitReview(
    reviewerId: string,
    reviewRequestId: string,
    status: ReviewStatus,
    comment?: string
  ) {
    const reviewRequest = await prisma.reviewRequest.findUnique({
      where: { id: reviewRequestId },
      include: {
        document: {
          include: { project: { select: { workspaceId: true } } }
        }
      }
    });

    if (!reviewRequest) throw new NotFoundError('Review request not found');

    return await prisma.$transaction(async (tx) => {
      const approval = await tx.reviewApproval.upsert({
        where: {
          reviewRequestId_reviewerId: {
            reviewRequestId,
            reviewerId
          }
        },
        create: {
          reviewRequestId,
          reviewerId,
          status,
          comment
        },
        update: {
          status,
          comment
        },
        include: {
          reviewer: {
            select: { id: true, name: true, email: true, avatarUrl: true }
          }
        }
      });

      await tx.reviewRequest.update({
        where: { id: reviewRequestId },
        data: { status }
      });

      const newDocStatus =
        status === ReviewStatus.APPROVED
          ? DocumentStatus.APPROVED
          : DocumentStatus.IN_PROGRESS;

      await tx.document.update({
        where: { id: reviewRequest.documentId },
        data: { status: newDocStatus }
      });

      await tx.activityLog.create({
        data: {
          workspaceId: reviewRequest.document.project.workspaceId,
          projectId: reviewRequest.document.projectId,
          documentId: reviewRequest.documentId,
          userId: reviewerId,
          action: ActivityAction.REVIEW_APPROVED,
          entityType: 'REVIEW',
          metadata: JSON.stringify({
            documentTitle: reviewRequest.document.title,
            reviewStatus: status
          })
        }
      });

      return approval;
    });
  }
}

export const reviewService = new ReviewService();

