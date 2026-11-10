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
            themePreference: 'light'
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
      companyName?: string;
      website?: string;
      industry?: string;
      timezone?: string;
      defaultVisibility?: string;
      emailNotifications?: boolean;
      inAppNotifications?: boolean;
      projectUpdates?: boolean;
      taskAssignments?: boolean;
      bugAlerts?: boolean;
      releaseApprovals?: boolean;
      securityAlerts?: boolean;
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
              themePreference: data.themePreference || 'light',
              notifyOnComment: data.notifyOnComment ?? true,
              notifyOnReview: data.notifyOnReview ?? true,
              companyName: data.companyName,
              website: data.website,
              industry: data.industry,
              timezone: data.timezone || 'UTC',
              defaultVisibility: data.defaultVisibility || 'INTERNAL',
              emailNotifications: data.emailNotifications ?? true,
              inAppNotifications: data.inAppNotifications ?? true,
              projectUpdates: data.projectUpdates ?? true,
              taskAssignments: data.taskAssignments ?? true,
              bugAlerts: data.bugAlerts ?? true,
              releaseApprovals: data.releaseApprovals ?? true,
              securityAlerts: data.securityAlerts ?? true
            },
            update: {
              ...(data.themePreference ? { themePreference: data.themePreference } : {}),
              ...(data.notifyOnComment !== undefined ? { notifyOnComment: data.notifyOnComment } : {}),
              ...(data.notifyOnReview !== undefined ? { notifyOnReview: data.notifyOnReview } : {}),
              ...(data.companyName !== undefined ? { companyName: data.companyName } : {}),
              ...(data.website !== undefined ? { website: data.website } : {}),
              ...(data.industry !== undefined ? { industry: data.industry } : {}),
              ...(data.timezone !== undefined ? { timezone: data.timezone } : {}),
              ...(data.defaultVisibility !== undefined ? { defaultVisibility: data.defaultVisibility } : {}),
              ...(data.emailNotifications !== undefined ? { emailNotifications: data.emailNotifications } : {}),
              ...(data.inAppNotifications !== undefined ? { inAppNotifications: data.inAppNotifications } : {}),
              ...(data.projectUpdates !== undefined ? { projectUpdates: data.projectUpdates } : {}),
              ...(data.taskAssignments !== undefined ? { taskAssignments: data.taskAssignments } : {}),
              ...(data.bugAlerts !== undefined ? { bugAlerts: data.bugAlerts } : {}),
              ...(data.releaseApprovals !== undefined ? { releaseApprovals: data.releaseApprovals } : {}),
              ...(data.securityAlerts !== undefined ? { securityAlerts: data.securityAlerts } : {})
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

    // Gather project and task assignments counts
    const memberStats = await Promise.all(
      members.map(async (m) => {
        const assignedProjects = await prisma.projectMember.count({
          where: { userId: m.userId, project: { workspaceId } }
        });
        const assignedTasks = await prisma.task.count({
          where: { assigneeId: m.userId, project: { workspaceId } }
        });

        return {
          id: m.id,
          workspaceId: m.workspaceId,
          userId: m.user.id,
          name: m.user.name,
          email: m.user.email,
          avatarUrl: m.user.avatarUrl,
          role: m.role,
          status: m.status || 'ACTIVE',
          title: m.title || null,
          department: m.department || null,
          joinedAt: m.joinedAt.toISOString(),
          assignedProjectCount: assignedProjects,
          assignedTaskCount: assignedTasks
        };
      })
    );

    return memberStats;
  }

  async updateMemberStatus(workspaceId: string, memberId: string, status: string, currentUserId: string) {
    const member = await prisma.workspaceMember.findUnique({
      where: { id: memberId },
      include: { workspace: true }
    });
    if (!member || member.workspaceId !== workspaceId) {
      throw new NotFoundError('Member not found in this workspace');
    }
    if (member.role === UserRole.OWNER && status === 'SUSPENDED') {
      throw new BadRequestError('Cannot suspend the workspace owner');
    }

    return prisma.workspaceMember.update({
      where: { id: memberId },
      data: { status }
    });
  }

  async inviteMember(workspaceId: string, invitedById: string, email: string, role: UserRole) {
    const cleanEmail = email.toLowerCase().trim();

    // Check if email already a member
    const existingUser = await prisma.user.findUnique({ where: { email: cleanEmail } });
    if (existingUser) {
      const existingMember = await prisma.workspaceMember.findUnique({
        where: { workspaceId_userId: { workspaceId, userId: existingUser.id } }
      });
      if (existingMember) {
        throw new ConflictError('User is already a member of this workspace');
      }
    }

    // Check existing pending invitation
    const crypto = await import('crypto');
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

    const invitation = await prisma.workspaceInvitation.upsert({
      where: { workspaceId_email: { workspaceId, email: cleanEmail } },
      create: {
        workspaceId,
        email: cleanEmail,
        role: role || UserRole.EDITOR,
        invitedById,
        token,
        status: 'PENDING',
        expiresAt
      },
      update: {
        role: role || UserRole.EDITOR,
        invitedById,
        token,
        status: 'PENDING',
        expiresAt
      },
      include: {
        invitedBy: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // If user exists in system, send notification
    if (existingUser) {
      const ws = await prisma.workspace.findUnique({ where: { id: workspaceId }, select: { name: true } });
      await prisma.notification.create({
        data: {
          userId: existingUser.id,
          title: 'Workspace Invitation',
          message: `You have been invited to join "${ws?.name}" as ${invitation.role}.`,
          type: 'info',
          link: `/team?invitation=${invitation.token}`
        }
      });
    }

    return invitation;
  }

  async listInvitations(workspaceId: string) {
    return prisma.workspaceInvitation.findMany({
      where: { workspaceId },
      include: {
        invitedBy: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async cancelInvitation(workspaceId: string, invitationId: string) {
    const inv = await prisma.workspaceInvitation.findUnique({ where: { id: invitationId } });
    if (!inv || inv.workspaceId !== workspaceId) throw new NotFoundError('Invitation not found');

    return prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: { status: 'CANCELLED' }
    });
  }

  async resendInvitation(workspaceId: string, invitationId: string) {
    const inv = await prisma.workspaceInvitation.findUnique({ where: { id: invitationId } });
    if (!inv || inv.workspaceId !== workspaceId) throw new NotFoundError('Invitation not found');

    const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    return prisma.workspaceInvitation.update({
      where: { id: invitationId },
      data: {
        status: 'PENDING',
        expiresAt
      },
      include: { invitedBy: { select: { id: true, name: true } } }
    });
  }

  async acceptInvitation(token: string, userId: string) {
    const inv = await prisma.workspaceInvitation.findUnique({ where: { token } });
    if (!inv) throw new NotFoundError('Invalid invitation token');
    if (inv.status !== 'PENDING') throw new BadRequestError(`Invitation is already ${inv.status.toLowerCase()}`);
    if (inv.expiresAt < new Date()) {
      await prisma.workspaceInvitation.update({ where: { id: inv.id }, data: { status: 'EXPIRED' } });
      throw new BadRequestError('Invitation has expired');
    }

    // Create or reactivate member
    const member = await prisma.workspaceMember.upsert({
      where: { workspaceId_userId: { workspaceId: inv.workspaceId, userId } },
      create: {
        workspaceId: inv.workspaceId,
        userId,
        role: inv.role,
        status: 'ACTIVE'
      },
      update: {
        role: inv.role,
        status: 'ACTIVE'
      }
    });

    await prisma.workspaceInvitation.update({
      where: { id: inv.id },
      data: { status: 'ACCEPTED', acceptedAt: new Date() }
    });

    return member;
  }

  // -------------------------------------------------------------------------
  // PROJECT MEMBERS
  // -------------------------------------------------------------------------
  async listProjectMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: { projectId },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'asc' }
    });
  }

  async assignProjectMember(projectId: string, userId: string, role?: UserRole) {
    return prisma.projectMember.upsert({
      where: { projectId_userId: { projectId, userId } },
      create: {
        projectId,
        userId,
        role: role || UserRole.EDITOR
      },
      update: {
        role: role || UserRole.EDITOR
      },
      include: {
        user: { select: { id: true, name: true, email: true, avatarUrl: true } }
      }
    });
  }

  async removeProjectMember(projectId: string, userId: string) {
    return prisma.projectMember.delete({
      where: { projectId_userId: { projectId, userId } }
    });
  }

  // -------------------------------------------------------------------------
  // TEAM DASHBOARD STATS
  // -------------------------------------------------------------------------
  async getTeamStats(workspaceId: string) {
    const members = await prisma.workspaceMember.findMany({
      where: { workspaceId },
      include: { user: true }
    });

    const invitations = await prisma.workspaceInvitation.findMany({
      where: { workspaceId, status: 'PENDING' }
    });

    const activeMembers = members.filter((m) => m.status !== 'SUSPENDED').length;
    const suspendedMembers = members.filter((m) => m.status === 'SUSPENDED').length;

    const roleDistribution = {
      owners: members.filter((m) => m.role === UserRole.OWNER).length,
      admins: members.filter((m) => m.role === UserRole.ADMIN).length,
      editors: members.filter((m) => m.role === UserRole.EDITOR).length,
      viewers: members.filter((m) => m.role === UserRole.VIEWER).length
    };

    const recentActivities = await prisma.activityLog.findMany({
      where: { workspaceId },
      include: {
        user: { select: { id: true, name: true } },
        project: { select: { id: true, name: true } }
      },
      orderBy: { createdAt: 'desc' },
      take: 8
    });

    return {
      totalMembers: members.length,
      activeMembers,
      pendingInvitations: invitations.length,
      suspendedMembers,
      roleDistribution,
      recentActivities: recentActivities.map((a) => ({
        id: a.id,
        workspaceId: a.workspaceId,
        projectId: a.projectId,
        projectName: a.project?.name,
        userId: a.userId,
        userName: a.user.name,
        action: a.action,
        entityType: a.entityType,
        createdAt: a.createdAt.toISOString()
      }))
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

