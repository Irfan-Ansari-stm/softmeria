import { prisma } from '../../config/db';
import { RiskLevel, RiskStatus } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class RiskService {
  // Helper to map probability and impact to score and severity classification
  private calculateRiskScore(probability: RiskLevel | string, impact: RiskLevel | string) {
    const levelScoreMap: Record<string, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 3
    };

    const pScore = levelScoreMap[probability] || 2;
    const iScore = levelScoreMap[impact] || 2;
    const score = pScore * iScore; // 1, 2, 3, 4, 6, 9

    let severity: RiskLevel = RiskLevel.MEDIUM;
    let priority = 'MEDIUM';

    if (score >= 9) {
      severity = RiskLevel.CRITICAL;
      priority = 'URGENT';
    } else if (score >= 6) {
      severity = RiskLevel.HIGH;
      priority = 'HIGH';
    } else if (score >= 3) {
      severity = RiskLevel.MEDIUM;
      priority = 'MEDIUM';
    } else {
      severity = RiskLevel.LOW;
      priority = 'LOW';
    }

    return { score, severity, priority };
  }

  async listRisks(query: {
    workspaceId?: string;
    projectId?: string;
    category?: string;
    status?: string;
    severity?: string;
    probability?: string;
    impact?: string;
    search?: string;
    sortBy?: string;
  }) {
    const where: any = {};

    if (query.projectId && query.projectId !== 'ALL') {
      where.projectId = query.projectId;
    } else if (query.workspaceId) {
      where.OR = [
        { workspaceId: query.workspaceId },
        { project: { workspaceId: query.workspaceId } }
      ];
    }

    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status as any;
    }

    if (query.severity && query.severity !== 'ALL') {
      where.severity = query.severity as any;
    }

    if (query.probability && query.probability !== 'ALL') {
      where.probability = query.probability as any;
    }

    if (query.impact && query.impact !== 'ALL') {
      where.impact = query.impact as any;
    }

    if (query.search?.trim()) {
      where.OR = [
        { title: { contains: query.search.trim(), mode: 'insensitive' } },
        { description: { contains: query.search.trim(), mode: 'insensitive' } },
        { category: { contains: query.search.trim(), mode: 'insensitive' } }
      ];
    }

    let orderBy: any = [{ score: 'desc' }, { createdAt: 'desc' }];
    if (query.sortBy === 'oldest') orderBy = { createdAt: 'asc' };
    else if (query.sortBy === 'title') orderBy = { title: 'asc' };
    else if (query.sortBy === 'targetDate') orderBy = { targetDate: 'asc' };

    return prisma.risk.findMany({
      where,
      include: {
        project: { select: { id: true, name: true, projectKey: true } },
        owner: { select: { id: true, name: true, avatarUrl: true, email: true } },
        mitigations: {
          include: { owner: { select: { id: true, name: true } } },
          orderBy: { dueDate: 'asc' }
        },
        _count: { select: { mitigations: true, comments: true } }
      },
      orderBy
    });
  }

  async getRisk(riskId: string) {
    const risk = await prisma.risk.findUnique({
      where: { id: riskId },
      include: {
        project: { select: { id: true, name: true, projectKey: true, workspaceId: true } },
        owner: { select: { id: true, name: true, avatarUrl: true, email: true } },
        mitigations: {
          include: { owner: { select: { id: true, name: true } } },
          orderBy: { dueDate: 'asc' }
        },
        history: {
          include: { changedBy: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { changedAt: 'desc' }
        },
        comments: {
          include: { author: { select: { id: true, name: true, avatarUrl: true } } },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!risk) throw new NotFoundError('Risk not found');
    return risk;
  }

  async createRisk(data: {
    projectId: string;
    workspaceId?: string;
    title: string;
    description: string;
    category?: string;
    probability: RiskLevel | string;
    impact: RiskLevel | string;
    riskOwnerId?: string;
    mitigationPlan?: string;
    contingencyPlan?: string;
    targetDate?: string;
    relatedTaskId?: string;
    relatedBugId?: string;
  }, userId?: string) {
    if (!data.title?.trim()) throw new BadRequestError('Risk title is required');
    if (!data.projectId) throw new BadRequestError('Project ID is required');

    const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { workspaceId: true } });
    const workspaceId = data.workspaceId || project?.workspaceId;

    const { score, severity, priority } = this.calculateRiskScore(data.probability, data.impact);

    const risk = await prisma.risk.create({
      data: {
        projectId: data.projectId,
        workspaceId,
        title: data.title.trim(),
        description: data.description?.trim() || '',
        category: data.category || 'Technical Architecture',
        probability: data.probability as RiskLevel,
        impact: data.impact as RiskLevel,
        severity,
        score,
        priority,
        riskOwnerId: data.riskOwnerId || null,
        mitigationPlan: data.mitigationPlan || null,
        contingencyPlan: data.contingencyPlan || null,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        status: RiskStatus.IDENTIFIED,
        relatedTaskId: data.relatedTaskId || null,
        relatedBugId: data.relatedBugId || null
      },
      include: {
        project: { select: { id: true, name: true, projectKey: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    // Record initial history
    if (userId) {
      await prisma.riskHistory.create({
        data: {
          riskId: risk.id,
          previousStatus: 'NONE',
          newStatus: 'IDENTIFIED',
          changedById: userId,
          reason: 'Initial risk registration'
        }
      });

      // Audit Log
      await prisma.auditEvent.create({
        data: {
          workspaceId: workspaceId || '',
          projectId: data.projectId,
          userId,
          action: 'REGISTERED_RISK',
          category: 'RISK_MANAGEMENT',
          entityType: 'Risk',
          entityId: risk.id,
          details: JSON.stringify({ title: risk.title, score: risk.score, severity: risk.severity })
        }
      });
    }

    return risk;
  }

  async updateRisk(riskId: string, data: any, userId?: string) {
    const existing = await prisma.risk.findUnique({
      where: { id: riskId },
      include: { project: { select: { workspaceId: true } } }
    });
    if (!existing) throw new NotFoundError('Risk not found');

    const updateData: any = { ...data };

    // If probability or impact changed, recalculate score
    if (data.probability || data.impact) {
      const prob = data.probability || existing.probability;
      const imp = data.impact || existing.impact;
      const calculated = this.calculateRiskScore(prob, imp);
      updateData.score = calculated.score;
      updateData.severity = calculated.severity;
      updateData.priority = calculated.priority;
    }

    if (data.targetDate) updateData.targetDate = new Date(data.targetDate);
    if (data.resolvedDate) updateData.resolvedDate = new Date(data.resolvedDate);

    // If status changed, record transition history
    if (data.status && data.status !== existing.status && userId) {
      await prisma.riskHistory.create({
        data: {
          riskId,
          previousStatus: existing.status,
          newStatus: data.status,
          changedById: userId,
          reason: data.statusChangeReason || `Status transition to ${data.status}`
        }
      });

      if (data.status === 'RESOLVED' || data.status === 'CLOSED') {
        updateData.resolvedDate = new Date();
      }
    }

    const updated = await prisma.risk.update({
      where: { id: riskId },
      data: updateData,
      include: {
        project: { select: { id: true, name: true, projectKey: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } },
        mitigations: true
      }
    });

    if (userId) {
      await prisma.auditEvent.create({
        data: {
          workspaceId: existing.workspaceId || existing.project.workspaceId,
          projectId: existing.projectId,
          userId,
          action: 'UPDATED_RISK',
          category: 'RISK_MANAGEMENT',
          entityType: 'Risk',
          entityId: riskId,
          details: JSON.stringify({ updatedFields: Object.keys(data), newStatus: data.status })
        }
      });
    }

    return updated;
  }

  async deleteRisk(riskId: string, userId?: string) {
    const existing = await prisma.risk.findUnique({
      where: { id: riskId },
      include: { project: { select: { workspaceId: true } } }
    });
    if (!existing) throw new NotFoundError('Risk not found');

    const deleted = await prisma.risk.delete({ where: { id: riskId } });

    if (userId) {
      await prisma.auditEvent.create({
        data: {
          workspaceId: existing.workspaceId || existing.project.workspaceId,
          projectId: existing.projectId,
          userId,
          action: 'DELETED_RISK',
          category: 'RISK_MANAGEMENT',
          entityType: 'Risk',
          entityId: riskId,
          details: JSON.stringify({ title: existing.title })
        }
      });
    }

    return deleted;
  }

  // 3x3 Probability vs Impact Matrix & Telemetry
  async getRiskMatrix(query: { workspaceId: string; projectId?: string }) {
    const where: any = {};
    if (query.projectId && query.projectId !== 'ALL') {
      where.projectId = query.projectId;
    } else {
      where.OR = [
        { workspaceId: query.workspaceId },
        { project: { workspaceId: query.workspaceId } }
      ];
    }

    const allRisks = await prisma.risk.findMany({
      where,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } },
        project: { select: { id: true, name: true } },
        _count: { select: { mitigations: true } }
      },
      orderBy: [{ score: 'desc' }, { createdAt: 'desc' }]
    });

    const now = new Date();
    const levels: Array<RiskLevel> = [RiskLevel.HIGH, RiskLevel.MEDIUM, RiskLevel.LOW];

    // Build 9 cells (3x3)
    const matrix: any[] = [];
    for (const prob of levels) {
      for (const imp of [RiskLevel.LOW, RiskLevel.MEDIUM, RiskLevel.HIGH]) {
        const { score, severity } = this.calculateRiskScore(prob, imp);
        const cellRisks = allRisks.filter((r) => r.probability === prob && r.impact === imp);

        matrix.push({
          probability: prob,
          impact: imp,
          score,
          classification: severity,
          count: cellRisks.length,
          risks: cellRisks
        });
      }
    }

    // Summary Telemetry Metrics
    const totalRisks = allRisks.length;
    const criticalRisks = allRisks.filter((r) => r.score >= 9).length;
    const highRisks = allRisks.filter((r) => r.score === 6).length;
    const mediumRisks = allRisks.filter((r) => r.score === 3 || r.score === 4).length;
    const lowRisks = allRisks.filter((r) => r.score <= 2).length;
    const openRisks = allRisks.filter((r) => r.status === 'IDENTIFIED' || r.status === 'MITIGATING').length;
    const mitigatedRisks = allRisks.filter((r) => r.status === 'RESOLVED' || r.status === 'CLOSED').length;
    const overdueRisks = allRisks.filter(
      (r) => r.targetDate && new Date(r.targetDate) < now && r.status !== 'CLOSED' && r.status !== 'RESOLVED'
    ).length;
    const unassignedRisks = allRisks.filter((r) => !r.riskOwnerId).length;

    return {
      totalRisks,
      criticalRisks,
      highRisks,
      mediumRisks,
      lowRisks,
      openRisks,
      mitigatedRisks,
      overdueRisks,
      unassignedRisks,
      matrix
    };
  }

  // Mitigation Actions
  async addMitigation(riskId: string, data: {
    description: string;
    ownerId?: string;
    startDate?: string;
    dueDate?: string;
    status?: string;
    progress?: number;
  }) {
    const risk = await prisma.risk.findUnique({ where: { id: riskId } });
    if (!risk) throw new NotFoundError('Risk not found');

    return prisma.riskMitigation.create({
      data: {
        riskId,
        description: data.description,
        ownerId: data.ownerId || null,
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        status: data.status || 'IN_PROGRESS',
        progress: data.progress || 0
      },
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  async updateMitigation(mitigationId: string, data: any) {
    const existing = await prisma.riskMitigation.findUnique({ where: { id: mitigationId } });
    if (!existing) throw new NotFoundError('Mitigation action not found');

    const updateData: any = { ...data };
    if (data.progress === 100 || data.status === 'COMPLETED') {
      updateData.completedAt = new Date();
      updateData.status = 'COMPLETED';
    }

    return prisma.riskMitigation.update({
      where: { id: mitigationId },
      data: updateData,
      include: {
        owner: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  async addRiskComment(riskId: string, authorId: string, content: string) {
    const risk = await prisma.risk.findUnique({ where: { id: riskId } });
    if (!risk) throw new NotFoundError('Risk not found');

    return prisma.riskComment.create({
      data: {
        riskId,
        authorId,
        content: content.trim()
      },
      include: {
        author: { select: { id: true, name: true, avatarUrl: true } }
      }
    });
  }

  // =========================================================================
  // DEPENDENCY MANAGEMENT
  // =========================================================================

  async listDependencies(query: {
    workspaceId: string;
    projectId?: string;
    status?: string;
    dependencyType?: string;
  }) {
    const where: any = { workspaceId: query.workspaceId };

    if (query.projectId && query.projectId !== 'ALL') {
      where.OR = [
        { projectId: query.projectId },
        { sourceProjectId: query.projectId },
        { targetProjectId: query.projectId }
      ];
    }

    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }

    if (query.dependencyType && query.dependencyType !== 'ALL') {
      where.dependencyType = query.dependencyType;
    }

    return prisma.projectDependency.findMany({
      where,
      include: {
        sourceProject: { select: { id: true, name: true } },
        targetProject: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createDependency(data: {
    workspaceId: string;
    projectId?: string;
    title: string;
    description?: string;
    sourceProjectId?: string;
    targetProjectId?: string;
    sourceTaskId?: string;
    targetTaskId?: string;
    ownerId?: string;
    dependencyType?: string;
    priority?: string;
    dueDate?: string;
  }) {
    if (!data.title?.trim()) throw new BadRequestError('Dependency title is required');

    // Circular task dependency prevention
    if (data.sourceTaskId && data.targetTaskId) {
      if (data.sourceTaskId === data.targetTaskId) {
        throw new BadRequestError('A task cannot depend on itself (circular dependency)');
      }

      // Check reverse dependency
      const reverseDep = await prisma.taskDependency.findFirst({
        where: {
          taskId: data.targetTaskId,
          dependsOnTaskId: data.sourceTaskId
        }
      });
      if (reverseDep) {
        throw new BadRequestError('Circular dependency detected between these tasks');
      }

      // Record in TaskDependency as well
      await prisma.taskDependency.upsert({
        where: {
          taskId_dependsOnTaskId: {
            taskId: data.sourceTaskId,
            dependsOnTaskId: data.targetTaskId
          }
        },
        create: {
          taskId: data.sourceTaskId,
          dependsOnTaskId: data.targetTaskId
        },
        update: {}
      });
    }

    return prisma.projectDependency.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || data.sourceProjectId || null,
        title: data.title.trim(),
        description: data.description?.trim() || null,
        sourceProjectId: data.sourceProjectId || null,
        targetProjectId: data.targetProjectId || null,
        sourceTaskId: data.sourceTaskId || null,
        targetTaskId: data.targetTaskId || null,
        ownerId: data.ownerId || null,
        dependencyType: data.dependencyType || 'TECHNICAL',
        priority: data.priority || 'MEDIUM',
        status: 'IDENTIFIED',
        dueDate: data.dueDate ? new Date(data.dueDate) : null
      },
      include: {
        sourceProject: { select: { id: true, name: true } },
        targetProject: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } }
      }
    });
  }

  async updateDependency(dependencyId: string, data: any) {
    const existing = await prisma.projectDependency.findUnique({ where: { id: dependencyId } });
    if (!existing) throw new NotFoundError('Dependency not found');

    const updateData: any = { ...data };
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    return prisma.projectDependency.update({
      where: { id: dependencyId },
      data: updateData,
      include: {
        sourceProject: { select: { id: true, name: true } },
        targetProject: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true } }
      }
    });
  }

  async deleteDependency(dependencyId: string) {
    const existing = await prisma.projectDependency.findUnique({ where: { id: dependencyId } });
    if (!existing) throw new NotFoundError('Dependency not found');

    return prisma.projectDependency.delete({ where: { id: dependencyId } });
  }

  // CSV Export for Risks
  async exportRisksCSV(query: { workspaceId: string; projectId?: string }) {
    const risks = await this.listRisks(query);

    const headers = [
      'Risk ID',
      'Title',
      'Project',
      'Category',
      'Probability',
      'Impact',
      'Score',
      'Severity',
      'Priority',
      'Status',
      'Owner',
      'Target Resolution Date',
      'Mitigations Count'
    ];

    const rows = risks.map((r) => [
      `"${r.id}"`,
      `"${r.title.replace(/"/g, '""')}"`,
      `"${(r.project?.name || '').replace(/"/g, '""')}"`,
      `"${r.category}"`,
      `"${r.probability}"`,
      `"${r.impact}"`,
      r.score,
      `"${r.severity}"`,
      `"${r.priority}"`,
      `"${r.status}"`,
      `"${(r.owner?.name || 'Unassigned').replace(/"/g, '""')}"`,
      r.targetDate ? new Date(r.targetDate).toISOString().split('T')[0] : 'None',
      r._count?.mitigations || 0
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }

  // CSV Export for Dependencies
  async exportDependenciesCSV(query: { workspaceId: string; projectId?: string }) {
    const dependencies = await this.listDependencies(query);

    const headers = [
      'Dependency ID',
      'Title',
      'Dependency Type',
      'Priority',
      'Status',
      'Source Project',
      'Target Project',
      'Owner',
      'Due Date',
      'Resolution Notes'
    ];

    const rows = dependencies.map((d) => [
      `"${d.id}"`,
      `"${d.title.replace(/"/g, '""')}"`,
      `"${d.dependencyType}"`,
      `"${d.priority}"`,
      `"${d.status}"`,
      `"${(d.sourceProject?.name || '').replace(/"/g, '""')}"`,
      `"${(d.targetProject?.name || '').replace(/"/g, '""')}"`,
      `"${(d.owner?.name || 'Unassigned').replace(/"/g, '""')}"`,
      d.dueDate ? new Date(d.dueDate).toISOString().split('T')[0] : 'None',
      `"${(d.resolutionNotes || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');
  }
}

export const riskService = new RiskService();
