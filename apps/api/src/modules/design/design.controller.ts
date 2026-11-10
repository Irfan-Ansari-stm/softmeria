import { Request, Response, NextFunction } from 'express';
import { designService } from './design.service';
import { sendSuccess } from '../../utils/response';

export class DesignController {
  async listTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const category = req.query.category as string;
      const tokens = await designService.listTokens(projectId, category);
      sendSuccess(res, tokens);
    } catch (err) {
      next(err);
    }
  }

  async createToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const token = await designService.createToken(userId, req.body);
      sendSuccess(res, token, 'Token created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const token = await designService.updateToken(userId, req.params.id, req.body);
      sendSuccess(res, token);
    } catch (err) {
      next(err);
    }
  }

  async deleteToken(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const result = await designService.deleteToken(userId, req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async listPalettes(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const palettes = await designService.listPalettes(projectId);
      sendSuccess(res, palettes);
    } catch (err) {
      next(err);
    }
  }

  async createPalette(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.body.projectId;
      const palette = await designService.createPalette(projectId, req.body);
      sendSuccess(res, palette, 'Palette created', 201);
    } catch (err) {
      next(err);
    }
  }

  async listThemes(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const themes = await designService.listThemes(projectId);
      sendSuccess(res, themes);
    } catch (err) {
      next(err);
    }
  }

  async createTheme(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.body.projectId;
      const theme = await designService.createTheme(projectId, req.body);
      sendSuccess(res, theme, 'Theme created', 201);
    } catch (err) {
      next(err);
    }
  }

  async publishTheme(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = (req as any).user.id;
      const theme = await designService.publishTheme(userId, req.params.id);
      sendSuccess(res, theme);
    } catch (err) {
      next(err);
    }
  }

  async listComponents(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const components = await designService.listComponents(projectId);
      sendSuccess(res, components);
    } catch (err) {
      next(err);
    }
  }

  async createComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const component = await designService.createComponent(req.body);
      sendSuccess(res, component, 'Component created', 201);
    } catch (err) {
      next(err);
    }
  }

  async updateComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const component = await designService.updateComponent(req.params.id, req.body);
      sendSuccess(res, component);
    } catch (err) {
      next(err);
    }
  }

  async deleteComponent(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await designService.deleteComponent(req.params.id);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }

  async exportTokens(req: Request, res: Response, next: NextFunction) {
    try {
      const projectId = req.query.projectId as string;
      const format = (req.query.format as any) || 'css';
      const result = await designService.exportTokens(projectId, format);
      sendSuccess(res, result);
    } catch (err) {
      next(err);
    }
  }
}

export const designController = new DesignController();
