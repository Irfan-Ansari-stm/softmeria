import { Request, Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { sendSuccess } from '../../utils/response';

export class AuthController {
  async register(req: Request, res: Response, next: NextFunction) {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      const result = await authService.register(req.body, userAgent, ipAddress);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, result, 'Registration successful', 201);
    } catch (error) {
      return next(error);
    }
  }

  async login(req: Request, res: Response, next: NextFunction) {
    try {
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;
      const result = await authService.login(req.body, userAgent, ipAddress);

      res.cookie('refreshToken', result.tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, result, 'Login successful');
    } catch (error) {
      return next(error);
    }
  }

  async refresh(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      const userAgent = req.headers['user-agent'];
      const ipAddress = req.ip;

      const tokens = await authService.refreshTokens(refreshToken, userAgent, ipAddress);

      res.cookie('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60 * 1000
      });

      return sendSuccess(res, tokens, 'Token refreshed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async logout(req: Request, res: Response, next: NextFunction) {
    try {
      const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
      await authService.logout(refreshToken);
      res.clearCookie('refreshToken');
      return sendSuccess(res, null, 'Logged out successfully');
    } catch (error) {
      return next(error);
    }
  }

  async getMe(req: Request, res: Response, next: NextFunction) {
    try {
      const profile = await authService.getProfile(req.user!.id);
      return sendSuccess(res, profile, 'Profile retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async updateProfile(req: Request, res: Response, next: NextFunction) {
    try {
      const updated = await authService.updateProfile(req.user!.id, req.body);
      return sendSuccess(res, updated, 'Profile updated');
    } catch (error) {
      return next(error);
    }
  }

  async changePassword(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await authService.changePassword(req.user!.id, req.body);
      res.clearCookie('refreshToken');
      return sendSuccess(res, result, 'Password changed successfully');
    } catch (error) {
      return next(error);
    }
  }

  async listSessions(req: Request, res: Response, next: NextFunction) {
    try {
      const sessions = await authService.listSessions(req.user!.id);
      return sendSuccess(res, sessions, 'Active sessions retrieved');
    } catch (error) {
      return next(error);
    }
  }

  async revokeSession(req: Request, res: Response, next: NextFunction) {
    try {
      await authService.revokeSession(req.user!.id, req.params.sessionId);
      return sendSuccess(res, null, 'Session revoked successfully');
    } catch (error) {
      return next(error);
    }
  }
}

export const authController = new AuthController();

