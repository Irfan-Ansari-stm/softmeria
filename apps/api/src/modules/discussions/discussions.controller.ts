import { Request, Response, NextFunction } from 'express';
import { discussionService } from './discussions.service';
import { sendSuccess } from '../../utils/response';
import { BadRequestError } from '../../utils/errors';

export class DiscussionController {
  // Discussions
  async listDiscussions(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = (req.query.projectId as string) || req.params.projectId;
      const workspaceId = req.query.workspaceId as string;
      const category = req.query.category as string;
      const status = req.query.status as string;
      const search = req.query.search as string;

      const discussions = await discussionService.listDiscussions({
        projectId,
        workspaceId,
        category,
        status,
        search
      });
      return sendSuccess(res, discussions, 'Discussions retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getDiscussion(req: Request, res: Response, next: NextFunction) {
    try {
      const discussion = await discussionService.getDiscussion(req.params.id);
      return sendSuccess(res, discussion, 'Discussion details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createDiscussion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const discussion = await discussionService.createDiscussion(userId, req.body);
      return sendSuccess(res, discussion, 'Discussion created', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateDiscussion(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await discussionService.updateDiscussion(req.params.id, req.body);
      return sendSuccess(res, updated, 'Discussion updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteDiscussion(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await discussionService.deleteDiscussion(req.params.id);
      return sendSuccess(res, result, 'Discussion deleted');
    } catch (error) {
      return next(error);
    }
  }

  async resolveDiscussion(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await discussionService.resolveDiscussion(req.params.id, userId);
      return sendSuccess(res, result, 'Discussion marked as resolved/decision made');
    } catch (error) {
      return next(error);
    }
  }

  // Comments
  async addComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const comment = await discussionService.addComment(req.params.id || req.params.discussionId, userId, req.body);
      return sendSuccess(res, comment, 'Comment posted', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const comment = await discussionService.updateComment(req.params.commentId, userId, req.body.content);
      return sendSuccess(res, comment, 'Comment updated');
    } catch (error) {
      return next(error);
    }
  }

  async deleteComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await discussionService.deleteComment(req.params.commentId, userId);
      return sendSuccess(res, result, 'Comment deleted');
    } catch (error) {
      return next(error);
    }
  }

  async reactToComment(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await discussionService.reactToComment(req.params.commentId, userId, req.body.emoji);
      return sendSuccess(res, result, 'Reaction updated');
    } catch (error) {
      return next(error);
    }
  }

  // RFCs
  async listRFCs(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      if (!workspaceId) throw new BadRequestError('Workspace ID is required');

      const rfcs = await discussionService.listRFCs({
        workspaceId,
        projectId: req.query.projectId as string,
        status: req.query.status as string,
        category: req.query.category as string,
        search: req.query.search as string
      });
      return sendSuccess(res, rfcs, 'RFC records retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getRFC(req: Request, res: Response, next: NextFunction) {
    try {
      const rfc = await discussionService.getRFC(req.params.id);
      return sendSuccess(res, rfc, 'RFC details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createRFC(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const rfc = await discussionService.createRFC(userId, req.body);
      return sendSuccess(res, rfc, 'RFC submitted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateRFC(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await discussionService.updateRFC(req.params.id, req.body);
      return sendSuccess(res, updated, 'RFC updated');
    } catch (error) {
      return next(error);
    }
  }

  async voteRFC(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const vote = await discussionService.voteRFC(req.params.id, userId, req.body.vote);
      return sendSuccess(res, vote, 'RFC vote recorded', 201);
    } catch (error) {
      return next(error);
    }
  }

  async reviewRFC(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const review = await discussionService.reviewRFC(req.params.id, userId, req.body);
      return sendSuccess(res, review, 'RFC review submitted', 201);
    } catch (error) {
      return next(error);
    }
  }

  // ADR (Architecture Decisions)
  async listDecisions(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = req.query.workspaceId as string;
      if (!workspaceId) throw new BadRequestError('Workspace ID is required');

      const decisions = await discussionService.listDecisions(workspaceId, req.query.projectId as string);
      return sendSuccess(res, decisions, 'Architecture decisions retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createDecision(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const decision = await discussionService.createDecision(userId, req.body);
      return sendSuccess(res, decision, 'Architecture decision recorded', 201);
    } catch (error) {
      return next(error);
    }
  }
}

export const discussionController = new DiscussionController();
