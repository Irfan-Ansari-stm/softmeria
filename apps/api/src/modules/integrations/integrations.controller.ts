import { Request, Response, NextFunction } from 'express';
import { integrationService } from './integrations.service';
import { sendSuccess } from '../../utils/response';

export class IntegrationController {
  async listIntegrations(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const integrations = await integrationService.listIntegrations(workspaceId);
      return sendSuccess(res, integrations, 'Integrations retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async connectIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const workspaceId = req.body.workspaceId || (req as any).user?.workspaces?.[0]?.id;
      const provider = req.params.provider || req.body.provider;
      const config = req.body.config || {};

      const integration = await integrationService.connectIntegration(workspaceId, provider, config, userId);
      return sendSuccess(res, integration, `${provider} integration connected successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async testConnection(req: Request, res: Response, next: NextFunction) {
    try {
      const workspaceId = (req.query.workspaceId as string) || (req as any).user?.workspaces?.[0]?.id;
      const provider = req.params.provider;

      const health = await integrationService.testConnection(workspaceId, provider);
      return sendSuccess(res, health, 'Connection test successful');
    } catch (error) {
      return next(error);
    }
  }

  async syncIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const workspaceId = (req.query.workspaceId as string) || req.body.workspaceId || (req as any).user?.workspaces?.[0]?.id;
      const provider = req.params.provider;

      const synced = await integrationService.syncIntegration(workspaceId, provider, userId);
      return sendSuccess(res, synced, `${provider} synchronized successfully`);
    } catch (error) {
      return next(error);
    }
  }

  async disconnectIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user?.id;
      const workspaceId = (req.query.workspaceId as string) || req.body.workspaceId || (req as any).user?.workspaces?.[0]?.id;
      const provider = req.params.provider;

      const disconnected = await integrationService.disconnectIntegration(workspaceId, provider, userId);
      return sendSuccess(res, disconnected, `${provider} disconnected`);
    } catch (error) {
      return next(error);
    }
  }

  async toggleIntegration(req: Request, res: Response, next: NextFunction) {
    try {
      const integration = await integrationService.toggleIntegration(req.params.integrationId);
      return sendSuccess(res, integration, 'Integration connection toggled');
    } catch (error) {
      return next(error);
    }
  }
}

export const integrationController = new IntegrationController();
