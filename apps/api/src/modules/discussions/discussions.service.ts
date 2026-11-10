import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ActivityAction } from '@prisma/client';

export class DiscussionService {
  // -------------------------------------------------------------------------
  // DISCUSSIONS
  // -------------------------------------------------------------------------
  async listDiscussions(query: {
    projectId?: string;
    workspaceId?: string;
    category?: string;
    status?: string;
    search?: string;
  }) {
    const where: any = {};

    if (query.projectId) {
      where.projectId = query.projectId;
    } else if (query.workspaceId) {
      where.OR = [
        { workspaceId: query.workspaceId },
        { project: { workspaceId: query.workspaceId } }
      ];
    }

    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.search) {
      where.AND = [
        {
          OR: [
            { title: { contains: query.search, mode: 'insensitive' } },
            { content: { contains: query.search, mode: 'insensitive' } }
          ]
        }
      ];
    }

    const discussions = await prisma.discussion.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        comments: {
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            replies: {
              include: { author: { select: { id: true, name: true, avatarUrl: true } } }
            }
          },
          orderBy: { createdAt: 'asc' }
        }
      },
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }]
    });

    return discussions.map((d) => ({
      ...d,
      tags: d.tags ? JSON.parse(d.tags) : [],
      commentCount: d.comments.length
    }));
  }

  async getDiscussion(id: string) {
    const discussion = await prisma.discussion.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        comments: {
          where: { parentId: null }, // Top-level comments
          include: {
            author: { select: { id: true, name: true, avatarUrl: true } },
            replies: {
              include: { author: { select: { id: true, name: true, avatarUrl: true } } },
              orderBy: { createdAt: 'asc' }
            }
          },
          orderBy: [{ isPinned: 'desc' }, { createdAt: 'asc' }]
        }
      }
    });

    if (!discussion) throw new NotFoundError('Discussion not found');

    return {
      ...discussion,
      tags: discussion.tags ? JSON.parse(discussion.tags) : [],
      comments: discussion.comments.map((c) => ({
        ...c,
        reactions: c.reactions ? JSON.parse(c.reactions) : {}
      }))
    };
  }

  async createDiscussion(userId: string, data: {
    projectId?: string;
    workspaceId?: string;
    title: string;
    content: string;
    category?: string;
    priority?: string;
    tags?: string[];
    isPinned?: boolean;
    documentId?: string;
    taskId?: string;
  }) {
    if (!data.title?.trim()) throw new BadRequestError('Discussion title is required');
    if (!data.content?.trim()) throw new BadRequestError('Discussion content is required');

    // If projectId is provided, resolve workspaceId if not set
    let workspaceId = data.workspaceId;
    if (data.projectId && !workspaceId) {
      const proj = await prisma.project.findUnique({ where: { id: data.projectId }, select: { workspaceId: true } });
      workspaceId = proj?.workspaceId;
    }

    const discussion = await prisma.discussion.create({
      data: {
        projectId: data.projectId || null,
        workspaceId: workspaceId || null,
        authorId: userId,
        title: data.title.trim(),
        content: data.content.trim(),
        category: data.category || 'ARCHITECTURE',
        priority: data.priority || 'MEDIUM',
        tags: data.tags ? JSON.stringify(data.tags) : '[]',
        isPinned: !!data.isPinned,
        documentId: data.documentId || null,
        taskId: data.taskId || null
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        comments: true
      }
    });

    if (workspaceId) {
      await prisma.activityLog.create({
        data: {
          workspaceId,
          projectId: data.projectId || null,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'Discussion',
          metadata: JSON.stringify({ discussionId: discussion.id, title: discussion.title })
        }
      });
    }

    return {
      ...discussion,
      tags: data.tags || []
    };
  }

  async updateDiscussion(id: string, data: {
    title?: string;
    content?: string;
    category?: string;
    status?: string;
    priority?: string;
    tags?: string[];
    isPinned?: boolean;
  }) {
    const existing = await prisma.discussion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Discussion not found');

    const updated = await prisma.discussion.update({
      where: { id },
      data: {
        title: data.title !== undefined ? data.title.trim() : existing.title,
        content: data.content !== undefined ? data.content.trim() : existing.content,
        category: data.category || existing.category,
        status: data.status || existing.status,
        priority: data.priority || existing.priority,
        tags: data.tags ? JSON.stringify(data.tags) : existing.tags,
        isPinned: data.isPinned !== undefined ? data.isPinned : existing.isPinned
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } }
      }
    });

    return {
      ...updated,
      tags: updated.tags ? JSON.parse(updated.tags) : []
    };
  }

  async deleteDiscussion(id: string) {
    const existing = await prisma.discussion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Discussion not found');

    return prisma.discussion.delete({ where: { id } });
  }

  async resolveDiscussion(id: string, userId: string) {
    const existing = await prisma.discussion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Discussion not found');

    return prisma.discussion.update({
      where: { id },
      data: {
        isResolved: true,
        resolvedAt: new Date(),
        resolvedById: userId,
        status: 'DECISION_MADE'
      }
    });
  }

  // -------------------------------------------------------------------------
  // THREADED COMMENTS
  // -------------------------------------------------------------------------
  async addComment(discussionId: string, userId: string, data: { content: string; parentId?: string }) {
    if (!data.content?.trim()) throw new BadRequestError('Comment content is required');
    const disc = await prisma.discussion.findUnique({ where: { id: discussionId } });
    if (!disc) throw new NotFoundError('Discussion not found');

    const comment = await prisma.discussionComment.create({
      data: {
        discussionId,
        authorId: userId,
        parentId: data.parentId || null,
        content: data.content.trim()
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Notify author if not commenting on own discussion
    if (disc.authorId !== userId) {
      await prisma.notification.create({
        data: {
          userId: disc.authorId,
          title: 'New response on your discussion',
          message: `${comment.author.name} commented on "${disc.title}"`,
          type: 'info',
          link: `/discussions?selected=${disc.id}`
        }
      });
    }

    return comment;
  }

  async updateComment(commentId: string, userId: string, content: string) {
    if (!content?.trim()) throw new BadRequestError('Comment content is required');
    const existing = await prisma.discussionComment.findUnique({ where: { id: commentId } });
    if (!existing) throw new NotFoundError('Comment not found');
    if (existing.authorId !== userId) throw new BadRequestError('Cannot edit someone else comment');

    return prisma.discussionComment.update({
      where: { id: commentId },
      data: {
        content: content.trim(),
        isEdited: true
      },
      include: { author: { select: { id: true, name: true, avatarUrl: true } } }
    });
  }

  async deleteComment(commentId: string, userId: string) {
    const existing = await prisma.discussionComment.findUnique({ where: { id: commentId } });
    if (!existing) throw new NotFoundError('Comment not found');
    if (existing.authorId !== userId) throw new BadRequestError('Cannot delete someone else comment');

    return prisma.discussionComment.delete({ where: { id: commentId } });
  }

  async reactToComment(commentId: string, userId: string, emoji: string) {
    const existing = await prisma.discussionComment.findUnique({ where: { id: commentId } });
    if (!existing) throw new NotFoundError('Comment not found');

    const reactions: Record<string, string[]> = existing.reactions ? JSON.parse(existing.reactions) : {};
    if (!reactions[emoji]) reactions[emoji] = [];

    const userIndex = reactions[emoji].indexOf(userId);
    if (userIndex > -1) {
      reactions[emoji].splice(userIndex, 1);
      if (reactions[emoji].length === 0) delete reactions[emoji];
    } else {
      reactions[emoji].push(userId);
    }

    return prisma.discussionComment.update({
      where: { id: commentId },
      data: { reactions: JSON.stringify(reactions) }
    });
  }

  // -------------------------------------------------------------------------
  // RFCS (REQUEST FOR COMMENTS)
  // -------------------------------------------------------------------------
  async listRFCs(query: {
    workspaceId: string;
    projectId?: string;
    status?: string;
    category?: string;
    search?: string;
  }) {
    const where: any = { workspaceId: query.workspaceId };
    if (query.projectId) where.projectId = query.projectId;
    if (query.status && query.status !== 'ALL') where.status = query.status;
    if (query.category && query.category !== 'ALL') where.category = query.category;

    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { problemStatement: { contains: query.search, mode: 'insensitive' } },
        { proposedSolution: { contains: query.search, mode: 'insensitive' } }
      ];
    }

    const rfcs = await prisma.rFC.findMany({
      where,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        reviews: { include: { reviewer: { select: { id: true, name: true } } } },
        votes: true,
        decisions: true
      },
      orderBy: { rfcNumber: 'desc' }
    });

    return rfcs.map((r) => {
      const votes = r.votes || [];
      const approve = votes.filter((v) => v.vote === 'APPROVE').length;
      const reject = votes.filter((v) => v.vote === 'REJECT').length;
      const abstain = votes.filter((v) => v.vote === 'ABSTAIN').length;
      const total = votes.length;

      let consensus = 'NO_VOTES';
      if (total > 0) {
        if (approve / total >= 0.75) consensus = 'STRONG_CONSENSUS';
        else if (approve > reject) consensus = 'MAJORITY_SUPPORT';
        else consensus = 'CONTROVERSIAL';
      }

      return {
        ...r,
        reviewers: r.reviewers ? JSON.parse(r.reviewers) : [],
        voteTallies: { total, approve, reject, abstain, consensus }
      };
    });
  }

  async getRFC(id: string) {
    const rfc = await prisma.rFC.findUnique({
      where: { id },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        reviews: {
          include: { reviewer: { select: { id: true, name: true, avatarUrl: true } } }
        },
        votes: {
          include: { voter: { select: { id: true, name: true, avatarUrl: true } } }
        },
        decisions: {
          include: { approvedBy: { select: { id: true, name: true } } }
        }
      }
    });

    if (!rfc) throw new NotFoundError('RFC not found');

    const votes = rfc.votes || [];
    const approve = votes.filter((v) => v.vote === 'APPROVE').length;
    const reject = votes.filter((v) => v.vote === 'REJECT').length;
    const abstain = votes.filter((v) => v.vote === 'ABSTAIN').length;
    const total = votes.length;

    let consensus = 'NO_VOTES';
    if (total > 0) {
      if (approve / total >= 0.75) consensus = 'STRONG_CONSENSUS';
      else if (approve > reject) consensus = 'MAJORITY_SUPPORT';
      else consensus = 'CONTROVERSIAL';
    }

    return {
      ...rfc,
      reviewers: rfc.reviewers ? JSON.parse(rfc.reviewers) : [],
      voteTallies: { total, approve, reject, abstain, consensus }
    };
  }

  async createRFC(userId: string, data: {
    workspaceId: string;
    projectId?: string;
    title: string;
    category?: string;
    problemStatement: string;
    motivation: string;
    proposedSolution: string;
    alternativeSolutions?: string;
    technicalArchitecture?: string;
    securityConsiderations?: string;
    performanceConsiderations?: string;
    implementationPlan?: string;
    migrationPlan?: string;
    risks?: string;
    dependencies?: string;
    reviewers?: string[];
    decisionDeadline?: string;
  }) {
    if (!data.title?.trim()) throw new BadRequestError('RFC title is required');
    if (!data.problemStatement?.trim()) throw new BadRequestError('Problem statement is required');
    if (!data.proposedSolution?.trim()) throw new BadRequestError('Proposed solution is required');

    // Calculate incremental RFC Number
    const highestRFC = await prisma.rFC.findFirst({
      where: { workspaceId: data.workspaceId },
      orderBy: { rfcNumber: 'desc' },
      select: { rfcNumber: true }
    });
    const nextNumber = (highestRFC?.rfcNumber || 0) + 1;

    const rfc = await prisma.rFC.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        rfcNumber: nextNumber,
        title: data.title.trim(),
        authorId: userId,
        category: data.category || 'ARCHITECTURE',
        status: 'SUBMITTED',
        problemStatement: data.problemStatement,
        motivation: data.motivation || '',
        proposedSolution: data.proposedSolution,
        alternativeSolutions: data.alternativeSolutions,
        technicalArchitecture: data.technicalArchitecture,
        securityConsiderations: data.securityConsiderations,
        performanceConsiderations: data.performanceConsiderations,
        implementationPlan: data.implementationPlan,
        migrationPlan: data.migrationPlan,
        risks: data.risks,
        dependencies: data.dependencies,
        reviewers: data.reviewers ? JSON.stringify(data.reviewers) : '[]',
        decisionDeadline: data.decisionDeadline ? new Date(data.decisionDeadline) : null
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        userId,
        action: ActivityAction.CREATED,
        entityType: 'RFC',
        metadata: JSON.stringify({ rfcId: rfc.id, rfcNumber: rfc.rfcNumber, title: rfc.title })
      }
    });

    return {
      ...rfc,
      reviewers: data.reviewers || []
    };
  }

  async updateRFC(id: string, data: any) {
    const existing = await prisma.rFC.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('RFC not found');

    const updateData: any = { ...data };
    if (data.reviewers && Array.isArray(data.reviewers)) {
      updateData.reviewers = JSON.stringify(data.reviewers);
    }
    if (data.decisionDeadline) {
      updateData.decisionDeadline = new Date(data.decisionDeadline);
    }

    return prisma.rFC.update({
      where: { id },
      data: updateData,
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } }
      }
    });
  }

  async voteRFC(rfcId: string, userId: string, vote: 'APPROVE' | 'REJECT' | 'ABSTAIN') {
    const rfc = await prisma.rFC.findUnique({ where: { id: rfcId } });
    if (!rfc) throw new NotFoundError('RFC not found');

    const existingVote = await prisma.rFCVote.findUnique({
      where: { rfcId_voterId: { rfcId, voterId: userId } }
    });

    if (existingVote) {
      return prisma.rFCVote.update({
        where: { id: existingVote.id },
        data: { vote }
      });
    }

    return prisma.rFCVote.create({
      data: {
        rfcId,
        voterId: userId,
        vote
      }
    });
  }

  async reviewRFC(rfcId: string, reviewerId: string, data: { status: string; comments?: string }) {
    const rfc = await prisma.rFC.findUnique({ where: { id: rfcId } });
    if (!rfc) throw new NotFoundError('RFC not found');

    const review = await prisma.rFCReview.create({
      data: {
        rfcId,
        reviewerId,
        status: data.status,
        comments: data.comments,
        reviewedAt: new Date()
      },
      include: { reviewer: { select: { id: true, name: true } } }
    });

    if (data.status === 'APPROVED') {
      await prisma.rFC.update({
        where: { id: rfcId },
        data: { status: 'ACCEPTED' }
      });
    }

    return review;
  }

  // -------------------------------------------------------------------------
  // ARCHITECTURE DECISION RECORDS (ADR)
  // -------------------------------------------------------------------------
  async listDecisions(workspaceId: string, projectId?: string) {
    const where: any = { workspaceId };
    if (projectId) where.projectId = projectId;

    return prisma.architectureDecision.findMany({
      where,
      include: {
        approvedBy: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        rfc: { select: { id: true, rfcNumber: true, title: true } }
      },
      orderBy: { decisionNumber: 'desc' }
    });
  }

  async createDecision(userId: string, data: {
    workspaceId: string;
    projectId?: string;
    rfcId?: string;
    title: string;
    status?: string;
    context: string;
    decision: string;
    alternativesConsidered?: string;
    consequences: string;
    documentId?: string;
  }) {
    if (!data.title?.trim()) throw new BadRequestError('Decision title is required');
    if (!data.decision?.trim()) throw new BadRequestError('Decision statement is required');

    const highest = await prisma.architectureDecision.findFirst({
      where: { workspaceId: data.workspaceId },
      orderBy: { decisionNumber: 'desc' },
      select: { decisionNumber: true }
    });
    const nextNumber = (highest?.decisionNumber || 0) + 1;

    const adr = await prisma.architectureDecision.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        rfcId: data.rfcId || null,
        decisionNumber: nextNumber,
        title: data.title.trim(),
        status: data.status || 'ACCEPTED',
        context: data.context || '',
        decision: data.decision.trim(),
        alternativesConsidered: data.alternativesConsidered,
        consequences: data.consequences || '',
        approvedById: userId,
        documentId: data.documentId || null
      },
      include: {
        approvedBy: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        rfc: { select: { id: true, rfcNumber: true, title: true } }
      }
    });

    await prisma.activityLog.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        userId,
        action: ActivityAction.CREATED,
        entityType: 'ArchitectureDecision',
        metadata: JSON.stringify({ decisionId: adr.id, decisionNumber: adr.decisionNumber, title: adr.title })
      }
    });

    return adr;
  }
}

export const discussionService = new DiscussionService();
