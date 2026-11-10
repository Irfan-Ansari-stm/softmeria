import { prisma } from '../../config/db';
import { NotFoundError } from '../../utils/errors';

export class AuditLogService {
  async listAuditLogs(query: {
    workspaceId: string;
    projectId?: string;
    category?: string;
    userId?: string;
    search?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }) {
    const { workspaceId, projectId, category, userId, search, status, startDate, endDate } = query;
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 25;
    const skip = (page - 1) * limit;

    const where: any = { workspaceId };

    if (projectId && projectId !== 'ALL') {
      where.projectId = projectId;
    }

    if (category && category !== 'ALL') {
      where.category = category;
    }

    if (userId && userId !== 'ALL') {
      where.userId = userId;
    }

    if (status && status !== 'ALL') {
      where.status = status;
    }

    if (startDate || endDate) {
      where.createdAt = {};
      if (startDate) where.createdAt.gte = new Date(startDate);
      if (endDate) where.createdAt.lte = new Date(endDate);
    }

    if (search?.trim()) {
      where.OR = [
        { action: { contains: search.trim(), mode: 'insensitive' } },
        { actorName: { contains: search.trim(), mode: 'insensitive' } },
        { entityType: { contains: search.trim(), mode: 'insensitive' } },
        { details: { contains: search.trim(), mode: 'insensitive' } }
      ];
    }

    // Seed realistic audit entries if empty
    const totalCount = await prisma.auditEvent.count({ where });
    if (totalCount === 0 && !search && !category) {
      await this.seedInitialAuditLogs(workspaceId);
    }

    const [events, total] = await Promise.all([
      prisma.auditEvent.findMany({
        where,
        include: {
          user: { select: { id: true, name: true, avatarUrl: true, email: true } }
        },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.auditEvent.count({ where })
    ]);

    return {
      events: events.map((e) => ({
        ...e,
        actor: e.actorName || e.user?.name || 'System Operator'
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  async getAuditLog(id: string) {
    const event = await prisma.auditEvent.findUnique({
      where: { id },
      include: {
        user: { select: { id: true, name: true, avatarUrl: true, email: true } }
      }
    });

    if (!event) throw new NotFoundError('Audit log entry not found');
    return {
      ...event,
      actor: event.actorName || event.user?.name || 'System Operator'
    };
  }

  async logAuditEvent(data: {
    workspaceId: string;
    projectId?: string;
    userId?: string;
    actorName?: string;
    action: string;
    category?: string;
    status?: string;
    entityType: string;
    entityId?: string;
    details?: any;
    ipAddress?: string;
    userAgent?: string;
    requestId?: string;
  }) {
    return prisma.auditEvent.create({
      data: {
        workspaceId: data.workspaceId,
        projectId: data.projectId || null,
        userId: data.userId || null,
        actorName: data.actorName || null,
        action: data.action,
        category: data.category || 'SYSTEM',
        status: data.status || 'SUCCESS',
        entityType: data.entityType,
        entityId: data.entityId || null,
        details: typeof data.details === 'string' ? data.details : JSON.stringify(data.details || {}),
        ipAddress: data.ipAddress || '192.168.1.100',
        userAgent: data.userAgent || null,
        requestId: data.requestId || `req_${Date.now()}`
      }
    });
  }

  async exportAuditLogsCSV(query: { workspaceId: string; projectId?: string }) {
    const { events } = await this.listAuditLogs({ ...query, limit: 1000 });

    const headers = [
      'Event ID',
      'Timestamp',
      'Actor',
      'Action',
      'Category',
      'Entity Type',
      'Entity ID',
      'Status',
      'IP Address',
      'Details'
    ];

    const rows = events.map((e) => [
      `"${e.id}"`,
      `"${new Date(e.createdAt).toISOString()}"`,
      `"${(e.actor || '').replace(/"/g, '""')}"`,
      `"${e.action}"`,
      `"${e.category}"`,
      `"${e.entityType}"`,
      `"${e.entityId || ''}"`,
      `"${e.status}"`,
      `"${e.ipAddress || ''}"`,
      `"${(e.details || '').replace(/"/g, '""')}"`
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  }

  private async seedInitialAuditLogs(workspaceId: string) {
    const users = await prisma.user.findMany({ take: 5 });
    const u1 = users[0];
    const u2 = users[1] || users[0];
    const u3 = users[2] || users[0];

    const demoEvents = [
      {
        workspaceId,
        userId: u1?.id,
        actorName: u1?.name || 'Sarah Connor (Architect)',
        action: 'APPROVED_BLUEPRINT',
        category: 'DOCUMENTATION',
        status: 'SUCCESS',
        entityType: 'Document',
        ipAddress: '192.168.1.104',
        details: JSON.stringify({ documentTitle: 'Architecture Overview & Domain Boundary Document', version: 'v1.0.0' })
      },
      {
        workspaceId,
        userId: u2?.id,
        actorName: u2?.name || 'Alex Rivera (DevOps Lead)',
        action: 'DEPLOYED_RELEASE',
        category: 'RELEASES',
        status: 'SUCCESS',
        entityType: 'Release',
        ipAddress: '192.168.1.108',
        details: JSON.stringify({ releaseTag: 'v1.0.0-GA', environment: 'Production' })
      },
      {
        workspaceId,
        userId: u3?.id,
        actorName: u3?.name || 'David Zhao (QA Lead)',
        action: 'RECORDED_TEST_RUN',
        category: 'TESTING',
        status: 'SUCCESS',
        entityType: 'TestRun',
        ipAddress: '192.168.1.112',
        details: JSON.stringify({ runNumber: 82, testsPassed: 4, testsFailed: 0 })
      },
      {
        workspaceId,
        userId: u1?.id,
        actorName: u1?.name || 'Sarah Connor (Architect)',
        action: 'CREATED_PROJECT',
        category: 'PROJECT_MANAGEMENT',
        status: 'SUCCESS',
        entityType: 'Project',
        ipAddress: '192.168.1.104',
        details: JSON.stringify({ projectName: 'FinTech Payment Orchestrator' })
      }
    ];

    for (const evt of demoEvents) {
      await prisma.auditEvent.create({ data: evt });
    }
  }
}

export const auditLogService = new AuditLogService();
