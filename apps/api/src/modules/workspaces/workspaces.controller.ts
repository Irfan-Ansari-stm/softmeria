import { Request, Response, NextFunction } from 'express';
import { workspaceService } from './workspaces.service';
import { sendSuccess } from '../../utils/response';

export class WorkspaceController {
  async listUserWorkspaces(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaces = await workspaceService.listUserWorkspaces(req.user!.id);
      return sendSuccess(res, workspaces, 'Workspaces retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async getWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.getWorkspace(req.params.workspaceId, req.user!.id);
      return sendSuccess(res, workspace, 'Workspace details retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async createWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.createWorkspace(req.user!.id, req.body);
      return sendSuccess(res, workspace, 'Workspace created successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const workspace = await workspaceService.updateWorkspace(req.params.workspaceId, req.body);
      return sendSuccess(res, workspace, 'Workspace updated successfully');
    } catch (error) {
      return next(error);
    }
  }

  async deleteWorkspace(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.deleteWorkspace(req.params.workspaceId, req.user!.id);
      return sendSuccess(res, result, 'Workspace deleted successfully');
    } catch (error) {
      return next(error);
    }
  }

  async listMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await workspaceService.listMembers(req.params.workspaceId);
      return sendSuccess(res, members, 'Workspace members retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async inviteMember(req: Request, res: Response, next: NextFunction) {
    try {
      const invitedById = (req as any).user.id;
      const member = await workspaceService.inviteMember(
        req.params.workspaceId,
        invitedById,
        req.body.email,
        req.body.role
      );
      return sendSuccess(res, member, 'Member invited successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async updateMemberStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.updateMemberStatus(
        req.params.workspaceId,
        req.params.memberId,
        req.body.status,
        (req as any).user.id
      );
      return sendSuccess(res, result, 'Member status updated');
    } catch (error) {
      return next(error);
    }
  }

  async listInvitations(req: Request, res: Response, next: NextFunction) {
    try {
      const invitations = await workspaceService.listInvitations(req.params.workspaceId);
      return sendSuccess(res, invitations, 'Workspace invitations retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async cancelInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.cancelInvitation(req.params.workspaceId, req.params.invitationId);
      return sendSuccess(res, result, 'Invitation cancelled');
    } catch (error) {
      return next(error);
    }
  }

  async resendInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.resendInvitation(req.params.workspaceId, req.params.invitationId);
      return sendSuccess(res, result, 'Invitation resent');
    } catch (error) {
      return next(error);
    }
  }

  async acceptInvitation(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const member = await workspaceService.acceptInvitation(req.body.token, userId);
      return sendSuccess(res, member, 'Invitation accepted successfully', 201);
    } catch (error) {
      return next(error);
    }
  }

  async listProjectMembers(req: Request, res: Response, next: NextFunction) {
    try {
      const members = await workspaceService.listProjectMembers(req.params.projectId);
      return sendSuccess(res, members, 'Project members retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async assignProjectMember(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await workspaceService.assignProjectMember(
        req.params.projectId,
        req.body.userId,
        req.body.role
      );
      return sendSuccess(res, member, 'Project member assigned', 201);
    } catch (error) {
      return next(error);
    }
  }

  async removeProjectMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.removeProjectMember(req.params.projectId, req.params.userId);
      return sendSuccess(res, result, 'Project member removed');
    } catch (error) {
      return next(error);
    }
  }

  async getTeamStats(req: Request, res: Response, next: NextFunction) {
    try {
      const stats = await workspaceService.getTeamStats(req.params.workspaceId);
      return sendSuccess(res, stats, 'Team telemetry retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async updateMemberRole(req: Request, res: Response, next: NextFunction) {
    try {
      const member = await workspaceService.updateMemberRole(
        req.params.workspaceId,
        req.params.memberId,
        req.body.role,
        req.user!.id
      );
      return sendSuccess(res, member, 'Member role updated');
    } catch (error) {
      return next(error);
    }
  }

  async removeMember(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await workspaceService.removeMember(
        req.params.workspaceId,
        req.params.memberId
      );
      return sendSuccess(res, result, 'Member removed');
    } catch (error) {
      return next(error);
    }
  }
}

export const workspaceController = new WorkspaceController();

