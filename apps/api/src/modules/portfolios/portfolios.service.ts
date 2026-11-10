import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';
import { slugify } from '@devblueprint/shared';

export class PortfolioService {
  async listPortfolios(workspaceId: string) {
    const portfolios = await prisma.portfolio.findMany({
      where: { workspaceId },
      include: {
        manager: { select: { id: true, name: true, email: true, avatarUrl: true } },
        projects: {
          select: {
            id: true,
            name: true,
            slug: true,
            status: true,
            budget: true,
            targetDate: true,
            tasks: {
              select: { id: true, status: true, storyPoints: true }
            },
            milestones: {
              select: { id: true, status: true, targetDate: true }
            },
            risks: {
              select: { id: true, severity: true }
            }
          }
        },
        objectives: true
      },
      orderBy: { createdAt: 'desc' }
    });

    return portfolios.map((p) => {
      const projectCount = p.projects.length;
      const completedProjectCount = p.projects.filter((pr) => pr.status === 'COMPLETED').length;
      const activeProjectCount = p.projects.filter((pr) => pr.status === 'ACTIVE' || pr.status === 'PLANNING').length;
      const delayedProjectCount = p.projects.filter((pr) => (pr.status as string) === 'ON_HOLD' || (pr.status as string) === 'DELAYED' || (pr.status as string) === 'AT_RISK').length;

      const allTasks = p.projects.flatMap((pr) => pr.tasks);
      const totalTasks = allTasks.length;
      const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
      const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

      const totalBudget = p.budget > 0 ? p.budget : p.projects.reduce((acc, pr) => acc + (pr.budget || 0), 0);
      const projectsBudget = p.projects.reduce((acc, pr) => acc + (pr.budget || 0), 0);
      const budgetUtilization = totalBudget > 0 ? Math.min(100, Math.round((projectsBudget / totalBudget) * 100)) : 0;

      const allMilestones = p.projects.flatMap((pr) => pr.milestones);
      const now = new Date();
      const upcomingMilestones = allMilestones.filter((m) => m.targetDate && new Date(m.targetDate) >= now && m.status !== 'COMPLETED').length;

      return {
        ...p,
        projectCount,
        activeProjectCount,
        completedProjectCount,
        delayedProjectCount,
        totalTasks,
        completedTasks,
        completionPercentage,
        totalBudget,
        projectsBudget,
        budgetUtilization,
        upcomingMilestones,
        objectivesCount: p.objectives.length,
        completedObjectivesCount: p.objectives.filter((o) => o.status === 'COMPLETED').length
      };
    });
  }

  async getPortfolio(portfolioId: string) {
    const portfolio = await prisma.portfolio.findUnique({
      where: { id: portfolioId },
      include: {
        manager: { select: { id: true, name: true, email: true, avatarUrl: true } },
        projects: {
          include: {
            members: {
              include: { user: { select: { id: true, name: true, email: true, avatarUrl: true } } }
            },
            tasks: {
              select: { id: true, taskIdentifier: true, title: true, status: true, priority: true, storyPoints: true }
            },
            milestones: {
              select: { id: true, name: true, status: true, targetDate: true, completionPercentage: true }
            },
            risks: {
              select: { id: true, title: true, severity: true, probability: true, status: true }
            }
          }
        },
        objectives: {
          orderBy: { createdAt: 'asc' }
        }
      }
    });

    if (!portfolio) throw new NotFoundError('Portfolio not found');

    const projectsWithMetrics = portfolio.projects.map((pr) => {
      const totalTasks = pr.tasks.length;
      const completedTasks = pr.tasks.filter((t) => t.status === 'DONE').length;
      const progress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const highRisks = pr.risks.filter((r) => r.severity === 'HIGH' || r.severity === 'CRITICAL').length;

      return {
        ...pr,
        totalTasks,
        completedTasks,
        progress,
        highRisks
      };
    });

    // Aggregates
    const allTasks = portfolio.projects.flatMap((pr) => pr.tasks);
    const totalTasks = allTasks.length;
    const completedTasks = allTasks.filter((t) => t.status === 'DONE').length;
    const completionPercentage = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const totalBudget = portfolio.budget > 0 ? portfolio.budget : portfolio.projects.reduce((acc, pr) => acc + (pr.budget || 0), 0);
    const projectsBudget = portfolio.projects.reduce((acc, pr) => acc + (pr.budget || 0), 0);
    const budgetUtilization = totalBudget > 0 ? Math.min(100, Math.round((projectsBudget / totalBudget) * 100)) : 0;

    // Unique members
    const membersMap = new Map<string, any>();
    portfolio.projects.forEach((pr) => {
      pr.members.forEach((m) => {
        if (!membersMap.has(m.userId)) {
          membersMap.set(m.userId, {
            id: m.userId,
            name: m.user.name,
            email: m.user.email,
            avatarUrl: m.user.avatarUrl,
            role: m.role,
            projects: [pr.name]
          });
        } else {
          const existing = membersMap.get(m.userId);
          if (!existing.projects.includes(pr.name)) {
            existing.projects.push(pr.name);
          }
        }
      });
    });

    // Aggregated milestones
    const aggregatedMilestones = portfolio.projects.flatMap((pr) =>
      pr.milestones.map((m) => ({
        ...m,
        projectName: pr.name,
        projectId: pr.id
      }))
    );

    // Aggregated risks
    const aggregatedRisks = portfolio.projects.flatMap((pr) =>
      pr.risks.map((r) => ({
        ...r,
        projectName: pr.name,
        projectId: pr.id
      }))
    );

    return {
      ...portfolio,
      projects: projectsWithMetrics,
      projectCount: portfolio.projects.length,
      totalTasks,
      completedTasks,
      completionPercentage,
      totalBudget,
      projectsBudget,
      budgetUtilization,
      teamMembers: Array.from(membersMap.values()),
      milestones: aggregatedMilestones,
      risks: aggregatedRisks
    };
  }

  async createPortfolio(data: {
    workspaceId: string;
    name: string;
    description?: string;
    category?: string;
    budget?: number;
    status?: string;
    health?: string;
    color?: string;
    managerId?: string;
    startDate?: string;
    targetDate?: string;
    projectIds?: string[];
  }) {
    const slug = `${slugify(data.name)}-${Date.now().toString().slice(-4)}`;
    const portfolio = await prisma.portfolio.create({
      data: {
        workspaceId: data.workspaceId,
        name: data.name,
        slug,
        description: data.description,
        category: data.category || 'Strategic Initiatives',
        budget: data.budget ? Number(data.budget) : 0,
        status: data.status || 'ACTIVE',
        health: data.health || 'ON_TRACK',
        color: data.color || '#4f46e5',
        managerId: data.managerId || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null
      }
    });

    if (data.projectIds && data.projectIds.length > 0) {
      await prisma.project.updateMany({
        where: { id: { in: data.projectIds } },
        data: { portfolioId: portfolio.id }
      });
    }

    return this.getPortfolio(portfolio.id);
  }

  async updatePortfolio(portfolioId: string, data: any) {
    const existing = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
    if (!existing) throw new NotFoundError('Portfolio not found');

    const updatePayload: any = {};
    if (data.name !== undefined) updatePayload.name = data.name;
    if (data.description !== undefined) updatePayload.description = data.description;
    if (data.category !== undefined) updatePayload.category = data.category;
    if (data.budget !== undefined) updatePayload.budget = Number(data.budget) || 0;
    if (data.status !== undefined) updatePayload.status = data.status;
    if (data.health !== undefined) updatePayload.health = data.health;
    if (data.color !== undefined) updatePayload.color = data.color;
    if (data.managerId !== undefined) updatePayload.managerId = data.managerId || null;
    if (data.startDate !== undefined) updatePayload.startDate = data.startDate ? new Date(data.startDate) : null;
    if (data.targetDate !== undefined) updatePayload.targetDate = data.targetDate ? new Date(data.targetDate) : null;

    await prisma.portfolio.update({
      where: { id: portfolioId },
      data: updatePayload
    });

    if (data.projectIds && Array.isArray(data.projectIds)) {
      // Disassociate removed projects
      await prisma.project.updateMany({
        where: { portfolioId, id: { notIn: data.projectIds } },
        data: { portfolioId: null }
      });
      // Associate newly added projects
      if (data.projectIds.length > 0) {
        await prisma.project.updateMany({
          where: { id: { in: data.projectIds } },
          data: { portfolioId }
        });
      }
    }

    return this.getPortfolio(portfolioId);
  }

  async deletePortfolio(portfolioId: string) {
    const existing = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
    if (!existing) throw new NotFoundError('Portfolio not found');

    // Unlink projects first
    await prisma.project.updateMany({
      where: { portfolioId },
      data: { portfolioId: null }
    });

    await prisma.portfolio.delete({ where: { id: portfolioId } });
    return { success: true, id: portfolioId };
  }

  async archivePortfolio(portfolioId: string) {
    return this.updatePortfolio(portfolioId, { status: 'ARCHIVED' });
  }

  async duplicatePortfolio(portfolioId: string) {
    const existing = await this.getPortfolio(portfolioId);
    return this.createPortfolio({
      workspaceId: existing.workspaceId,
      name: `${existing.name} (Copy)`,
      description: existing.description || undefined,
      category: existing.category,
      budget: existing.budget,
      status: 'PLANNING',
      health: 'ON_TRACK',
      color: existing.color,
      managerId: existing.managerId || undefined,
      projectIds: existing.projects.map((p) => p.id)
    });
  }

  async addProjectToPortfolio(portfolioId: string, projectId: string) {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
    if (!portfolio) throw new NotFoundError('Portfolio not found');

    await prisma.project.update({
      where: { id: projectId },
      data: { portfolioId }
    });

    return this.getPortfolio(portfolioId);
  }

  async removeProjectFromPortfolio(portfolioId: string, projectId: string) {
    await prisma.project.update({
      where: { id: projectId },
      data: { portfolioId: null }
    });

    return this.getPortfolio(portfolioId);
  }

  async addObjective(portfolioId: string, data: { title: string; description?: string; targetDate?: string }) {
    const portfolio = await prisma.portfolio.findUnique({ where: { id: portfolioId } });
    if (!portfolio) throw new NotFoundError('Portfolio not found');

    const objective = await prisma.portfolioObjective.create({
      data: {
        portfolioId,
        title: data.title,
        description: data.description,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: 'IN_PROGRESS',
        progress: 0
      }
    });

    return objective;
  }

  async updateObjective(objectiveId: string, data: any) {
    const objective = await prisma.portfolioObjective.update({
      where: { id: objectiveId },
      data: {
        ...(data.title !== undefined && { title: data.title }),
        ...(data.description !== undefined && { description: data.description }),
        ...(data.status !== undefined && { status: data.status }),
        ...(data.progress !== undefined && { progress: Number(data.progress) }),
        ...(data.targetDate !== undefined && { targetDate: data.targetDate ? new Date(data.targetDate) : null })
      }
    });

    return objective;
  }

  async deleteObjective(objectiveId: string) {
    await prisma.portfolioObjective.delete({ where: { id: objectiveId } });
    return { success: true, id: objectiveId };
  }
}

export const portfolioService = new PortfolioService();
