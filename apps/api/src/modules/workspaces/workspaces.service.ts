import { prisma } from '../../config/db';
import { NotFoundError, ForbiddenError, ConflictError, BadRequestError } from '../../utils/errors';
import { slugify, BUILTIN_TEMPLATES } from '@devblueprint/shared';
import { UserRole } from '@prisma/client';

export class WorkspaceService {
  async listUserWorkspaces(userId: string) {
    const memberships = await prisma.workspaceMember.findMany({
      where: { userId },
      include: {
        workspace: {
          include: {
            _count: {
              select: {
                members: true,
                projects: {
                  where: { isArchived: false }
                }
              }
            }
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    return memberships.map((m) => ({
      id: m.workspace.id,
      name: m.workspace.name,
      slug: m.workspace.slug,
      logoUrl: m.workspace.logoUrl,
      ownerId: m.workspace.ownerId,
      role: m.role,
      memberCount: m.workspace._count.members,
      projectCount: m.workspace._count.projects,
      createdAt: m.workspace.createdAt.toISOString()
    }));
  }

  async getWorkspace(workspaceId: string, userId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId
        }
      },
      include: {
        workspace: {
          include: {
            settings: true,
            _count: {
              select: {
                members: true,
                projects: true
              }
            }
          }
        }
      }
    });

    if (!member) {
      throw new NotFoundError('Workspace not found or access denied');
    }

    return {
      id: member.workspace.id,
      name: member.workspace.name,
      slug: member.workspace.slug,
      logoUrl: member.workspace.logoUrl,
      ownerId: member.workspace.ownerId,
      role: member.role,
      settings: member.workspace.settings,
      memberCount: member.workspace._count.members,
      projectCount: member.workspace._count.projects,
      createdAt: member.workspace.createdAt.toISOString()
    };
  }

  async createWorkspace(userId: string, data: { name: string; slug?: string; logoUrl?: string | null }) {
    const baseSlug = slugify(data.slug || data.name) || 'workspace';
    let slug = baseSlug;
    let counter = 1;

    while (await prisma.workspace.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${counter}`;
      counter++;
    }

    const workspace = await prisma.workspace.create({
      data: {
        name: data.name,
        slug,
        logoUrl: data.logoUrl,
        ownerId: userId,
        members: {
          create: {
            userId,
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

    // Populate default templates in workspace
    for (const t of BUILTIN_TEMPLATES) {
      await prisma.template.create({
        data: {
          workspaceId: workspace.id,
          title: t.title,
          slug: t.slug,
          category: t.category,
          description: t.description,
          purpose: t.purpose,
          recommendedSections: JSON.stringify(t.recommendedSections),
          content: t.content,
          isBuiltin: true,
          createdById: userId
        }
      });
    }

    return workspace;
  }

  async updateWorkspace(
    workspaceId: string,
    data: {
      name?: string;
      logoUrl?: string | null;
      themePreference?: string;
      notifyOnComment?: boolean;
      notifyOnReview?: boolean;
    }
  ) {
    const updated = await prisma.workspace.update({
      where: { id: workspaceId },
      data: {
        ...(data.name ? { name: data.name } : {}),
        ...(data.logoUrl !== undefined ? { logoUrl: data.logoUrl } : {}),
        settings: {
          upsert: {
            create: {
              themePreference: data.themePreference || 'system',
              notifyOnComment: data.notifyOnComment ?? true,
              notifyOnReview: data.notifyOnReview ?? true
            },
            update: {
              ...(data.themePreference ? { themePreference: data.themePreference } : {}),
              ...(data.notifyOnComment !== undefined ? { notifyOnComment: data.notifyOnComment } : {}),
              ...(data.notifyOnReview !== undefined ? { notifyOnReview: data.notifyOnReview } : {})
            }
          }
        }
      },
      include: {
        settings: true
      }
    });

    return updated;
  }

  async deleteWorkspace(workspaceId: string, userId: string) {
    const workspace = await prisma.workspace.findUnique({
      where: { id: workspaceId }
    });

    if (!workspace) {
      throw new NotFoundError('Workspace not found');
    }

    if (workspace.ownerId !== userId) {
      throw new ForbiddenError('Only the workspace owner can delete this workspace');
    }

    await prisma.workspace.delete({
      where: { id: workspaceId }
    });

    return { message: 'Workspace deleted successfully' };
  }

  async listMembers(workspaceId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      },
      orderBy: { joinedAt: 'asc' }
    });

    return members.map((m) => ({
      id: m.id,
      userId: m.user.id,
      name: m.user.name,
      email: m.user.email,
      avatarUrl: m.user.avatarUrl,
      role: m.role,
      joinedAt: m.joinedAt.toISOString()
    }));
  }

  async inviteMember(workspaceId: string, email: string, role: UserRole) {
    let user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (!user) {
      throw new NotFoundError(
        'User not found. Please ask them to create an account first or provide an existing user email.'
      );
    }

    const existingMember = await prisma.workspaceMember.findUnique({
      where: {
        workspaceId_userId: {
          workspaceId,
          userId: user.id
        }
      }
    });

    if (existingMember) {
      throw new ConflictError('User is already a member of this workspace');
    }

    const member = await prisma.workspaceMember.create({
      data: {
        workspaceId,
        userId: user.id,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return {
      id: member.id,
      userId: member.user.id,
      name: member.user.name,
      email: member.user.email,
      avatarUrl: member.user.avatarUrl,
      role: member.role,
      joinedAt: member.joinedAt.toISOString()
    };
  }

  async updateMemberRole(workspaceId: string, memberId: string, role: UserRole, currentUserId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: { workspace: true }
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundError('Member not found in this workspace');
    }

    if (member.role === UserRole.OWNER && member.userId === member.workspace.ownerId) {
      throw new BadRequestError('Cannot change role of workspace owner');
    }

    const updated = await prisma.workspaceMember.update({
      where: { id: memberId },
      data: { role },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true
          }
        }
      }
    });

    return {
      id: updated.id,
      userId: updated.user.id,
      name: updated.user.name,
      email: updated.user.email,
      avatarUrl: updated.user.avatarUrl,
      role: updated.role,
      joinedAt: updated.joinedAt.toISOString()
    };
  }

  async removeMember(workspaceId: string, memberId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: { workspace: true }
    });

    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundError('Member not found');
    }

    if (member.role === UserRole.OWNER || member.userId === member.workspace.ownerId) {
      throw new BadRequestError('Cannot remove workspace owner');
    }

    await prisma.workspaceMember.delete({
      where: { id: memberId }
    });

    return { message: 'Member removed successfully' };
  }
}

export const workspaceService = new WorkspaceService();

