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
      const member = await workspaceService.inviteMember(
        req.params.workspaceId,
        req.body.email,
        req.body.role
      );
      return sendSuccess(res, member, 'Member invited successfully', 201);
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

