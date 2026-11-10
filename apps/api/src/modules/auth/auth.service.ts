import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { prisma } from '../../config/db';
import { BadRequestError, UnauthorizedError, ConflictError } from '../../utils/errors';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../../utils/jwt';
import { slugify } from '@devblueprint/shared';
import { UserRole } from '@prisma/client';

export class AuthService {
  async register(data: { name: string; email: string; password: string }, userAgent?: string, ipAddress?: string) {
    const existing = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() }
    });

    if (existing) {
      throw new ConflictError('A user with this email already exists');
    }

    const passwordHash = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        name: data.name,
        email: data.email.toLowerCase(),
        passwordHash,
        isEmailVerified: true
      }
    });

    // Create default workspace for user
    const baseSlug = slugify(data.name) || 'workspace';
    const workspaceSlug = `${baseSlug}-${Math.random().toString(36).substring(2, 7)}`;
    const workspace = await prisma.workspace.create({
      data: {
        name: `${data.name}'s Workspace`,
        slug: workspaceSlug,
        ownerId: user.id,
        members: {
          create: {
            userId: user.id,
            role: UserRole.OWNER
          }
        },
        settings: {
          create: {
            themePreference: 'system'
          }
        }
      }
    });

    const tokens = await this.generateTokens(user.id, user.email, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
      workspace: {
        id: workspace.id,
        name: workspace.name,
        slug: workspace.slug
      },
      tokens
    };
  }

  async login(data: { email: string; password: string }, userAgent?: string, ipAddress?: string) {
    const user = await prisma.user.findUnique({
      where: { email: data.email.toLowerCase() },
      include: {
        workspaceMemberships: {
          include: {
            workspace: {
              include: {
                settings: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const isValid = await bcrypt.compare(data.password, user.passwordHash);
    if (!isValid) {
      throw new UnauthorizedError('Invalid email or password');
    }

    const tokens = await this.generateTokens(user.id, user.email, userAgent, ipAddress);

    return {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatarUrl: user.avatarUrl
      },
      workspaces: user.workspaceMemberships.map((m) => ({
        id: m.workspace.id,
        name: m.workspace.name,
        slug: m.workspace.slug,
        role: m.role,
        settings: (m.workspace as any).settings
      })),
      tokens
    };
  }

  async refreshTokens(refreshToken: string, userAgent?: string, ipAddress?: string) {
    try {
      const payload = verifyRefreshToken(refreshToken);
      const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');

      const session = await prisma.session.findUnique({
        where: { refreshTokenHash: tokenHash }
      });

      if (!session || session.revokedAt || session.expiresAt < new Date()) {
        throw new UnauthorizedError('Invalid or expired refresh token');
      }

      // Revoke old session (token rotation)
      await prisma.session.update({
        where: { id: session.id },
        data: { revokedAt: new Date() }
      });

      const user = await prisma.user.findUnique({
        where: { id: payload.userId }
      });

      if (!user) {
        throw new UnauthorizedError('User no longer exists');
      }

      const tokens = await this.generateTokens(user.id, user.email, userAgent, ipAddress);
      return tokens;
    } catch (err: any) {
      throw new UnauthorizedError('Invalid refresh token');
    }
  }

  async logout(refreshToken?: string) {
    if (!refreshToken) return;
    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    await prisma.session.updateMany({
      where: { refreshTokenHash: tokenHash },
      data: { revokedAt: new Date() }
    });
  }

  async getProfile(userId: string) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        createdAt: true,
        workspaceMemberships: {
          include: {
            workspace: {
              select: {
                id: true,
                name: true,
                slug: true,
                logoUrl: true,
                settings: true
              }
            }
          }
        }
      }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    return user;
  }

  async updateProfile(userId: string, data: {
    name?: string;
    avatarUrl?: string | null;
    jobTitle?: string;
    department?: string;
    bio?: string;
    timezone?: string;
    preferredLanguage?: string;
    twoFactorEnabled?: boolean;
  }) {
    const updateData: any = {};
    if (data.name !== undefined) updateData.name = data.name;
    if (data.avatarUrl !== undefined) updateData.avatarUrl = data.avatarUrl;
    if (data.jobTitle !== undefined) updateData.jobTitle = data.jobTitle;
    if (data.department !== undefined) updateData.department = data.department;
    if (data.bio !== undefined) updateData.bio = data.bio;
    if (data.timezone !== undefined) updateData.timezone = data.timezone;
    if (data.preferredLanguage !== undefined) updateData.preferredLanguage = data.preferredLanguage;
    if (data.twoFactorEnabled !== undefined) updateData.twoFactorEnabled = data.twoFactorEnabled;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        avatarUrl: true,
        jobTitle: true,
        department: true,
        bio: true,
        timezone: true,
        preferredLanguage: true,
        twoFactorEnabled: true,
        createdAt: true
      }
    });

    return user;
  }

  async listSessions(userId: string) {
    return prisma.session.findMany({
      where: { userId, revokedAt: null, expiresAt: { gt: new Date() } },
      select: {
        id: true,
        userAgent: true,
        ipAddress: true,
        createdAt: true,
        expiresAt: true
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async revokeSession(userId: string, sessionId: string) {
    return prisma.session.updateMany({
      where: { id: sessionId, userId },
      data: { revokedAt: new Date() }
    });
  }

  async changePassword(userId: string, data: { currentPassword: string; newPassword: string }) {
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      throw new UnauthorizedError('User not found');
    }

    const isValid = await bcrypt.compare(data.currentPassword, user.passwordHash);
    if (!isValid) {
      throw new BadRequestError('Current password is incorrect');
    }

    const newHash = await bcrypt.hash(data.newPassword, 10);
    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash: newHash }
    });

    // Revoke all existing sessions for security
    await prisma.session.updateMany({
      where: { userId },
      data: { revokedAt: new Date() }
    });

    return { message: 'Password updated successfully' };
  }

  private async generateTokens(userId: string, email: string, userAgent?: string, ipAddress?: string) {
    const payload = { userId, email };
    const accessToken = signAccessToken(payload);
    const refreshToken = signRefreshToken(payload);

    const tokenHash = crypto.createHash('sha256').update(refreshToken).digest('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    await prisma.session.create({
      data: {
        userId,
        refreshTokenHash: tokenHash,
        userAgent,
        ipAddress,
        expiresAt
      }
    });

    return { accessToken, refreshToken };
  }
}

export const authService = new AuthService();

