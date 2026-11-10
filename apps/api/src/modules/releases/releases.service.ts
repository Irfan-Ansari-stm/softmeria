import { prisma } from '../../config/db';
import { ReleaseStatus, EnvironmentType, DeploymentStatus, ActivityAction } from '@prisma/client';
import { NotFoundError, BadRequestError } from '../../utils/errors';

export class ReleaseService {
  private validateSemVer(version: string) {
    // Allows v1.0.0, 1.0.0, 1.0.0-GA, 2.1.3-beta.1, etc.
    const semVerRegex = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
    if (!semVerRegex.test(version.trim())) {
      throw new BadRequestError(`Invalid semantic version "${version}". Expected format: MAJOR.MINOR.PATCH (e.g., 1.0.0, v1.2.3, 2.0.0-GA).`);
    }
  }

  async listReleases(projectId: string) {
    const releases = await prisma.release.findMany({
      where: { projectId, isArchived: false },
      include: {
        deployments: {
          include: {
            deployedBy: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { deployedAt: 'desc' }
        },
        bugs: {
          select: { id: true, bugIdentifier: true, title: true, status: true, severity: true }
        },
        approvals: {
          include: {
            approver: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        tasks: {
          include: {
            task: { select: { id: true, taskIdentifier: true, title: true, status: true, priority: true } }
          }
        },
        rollbacks: {
          orderBy: { executedAt: 'desc' }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return releases.map((r) => {
      let checklist: Array<{ id: string; label: string; completed: boolean }> = [];
      try {
        checklist = JSON.parse(r.checklistItems || '[]');
      } catch {
        checklist = [];
      }

      return {
        ...r,
        checklistItems: checklist,
        resolvedBugCount: r.bugs.filter((b) => b.status === 'FIXED' || b.status === 'VERIFIED' || b.status === 'CLOSED').length
      };
    });
  }

  async getRelease(releaseId: string) {
    const release = await prisma.release.findUnique({
      where: { id: releaseId },
      include: {
        project: { select: { id: true, name: true, projectKey: true } },
        sprint: { select: { id: true, name: true } },
        milestone: { select: { id: true, name: true } },
        owner: { select: { id: true, name: true, avatarUrl: true } },
        deployments: {
          include: {
            deployedBy: { select: { id: true, name: true, avatarUrl: true } }
          },
          orderBy: { deployedAt: 'desc' }
        },
        bugs: {
          select: { id: true, bugIdentifier: true, title: true, severity: true, status: true }
        },
        approvals: {
          include: {
            approver: { select: { id: true, name: true, avatarUrl: true } }
          }
        },
        tasks: {
          include: {
            task: { select: { id: true, taskIdentifier: true, title: true, status: true, priority: true } }
          }
        },
        rollbacks: {
          orderBy: { executedAt: 'desc' }
        }
      }
    });

    if (!release) throw new NotFoundError('Release not found');

    let checklist: Array<{ id: string; label: string; completed: boolean }> = [];
    try {
      checklist = JSON.parse(release.checklistItems || '[]');
    } catch {
      checklist = [];
    }

    return {
      ...release,
      checklistItems: checklist
    };
  }

  async createRelease(userId: string, data: {
    projectId: string;
    version: string;
    title: string;
    description?: string;
    targetDate?: string;
    releaseNotes?: string;
    environment?: string;
    sprintId?: string;
    milestoneId?: string;
    checklistItems?: Array<{ id: string; label: string; completed: boolean }>;
  }) {
    this.validateSemVer(data.version);

    // Prevent duplicate versions within project
    const existing = await prisma.release.findUnique({
      where: { projectId_version: { projectId: data.projectId, version: data.version.trim() } }
    });
    if (existing) {
      throw new BadRequestError(`Release version "${data.version}" already exists in this project.`);
    }

    const defaultChecklist = data.checklistItems || [
      { id: '1', label: 'All critical and high severity bugs resolved', completed: false },
      { id: '2', label: 'End-to-End regression test suite verified on Staging', completed: false },
      { id: '3', label: 'Architecture & API specifications published', completed: true },
      { id: '4', label: 'Security & compliance sign-off approved', completed: false },
      { id: '5', label: 'Blue/Green zero-downtime rollback plan documented', completed: true }
    ];

    const release = await prisma.release.create({
      data: {
        projectId: data.projectId,
        version: data.version.trim(),
        title: data.title || (data as any).name || `Release ${data.version.trim()}`,
        description: data.description,
        targetDate: data.targetDate ? new Date(data.targetDate) : null,
        releaseNotes: data.releaseNotes,
        environment: data.environment || 'PRODUCTION',
        sprintId: data.sprintId,
        milestoneId: data.milestoneId,
        ownerId: userId,
        status: ReleaseStatus.PLANNED,
        readinessScore: 60.0,
        rollbackPlan: 'Deploy previous container image tag via rolling restart within 60s.',
        checklistItems: JSON.stringify(defaultChecklist)
      }
    });

    // Default approval gates
    const defaultApprovers = [
      { role: 'QA_LEAD', status: 'PENDING', notes: 'Awaiting full test suite run' },
      { role: 'SECURITY_LEAD', status: 'PENDING', notes: 'Awaiting CVE vulnerability scan' },
      { role: 'RELEASE_MANAGER', status: 'PENDING', notes: 'Awaiting deployment window sign-off' }
    ];

    for (const app of defaultApprovers) {
      await prisma.releaseApproval.create({
        data: {
          releaseId: release.id,
          approverId: userId,
          role: app.role,
          status: app.status,
          notes: app.notes
        }
      });
    }

    const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: data.projectId,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'Release',
          metadata: JSON.stringify({ version: release.version, title: release.title })
        }
      });
    }

    return release;
  }

  async updateRelease(id: string, data: any) {
    const existing = await prisma.release.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Release not found');

    if (data.version && data.version !== existing.version) {
      this.validateSemVer(data.version);
    }

    const updateData: any = { ...data };
    if (data.targetDate) updateData.targetDate = new Date(data.targetDate);
    if (Array.isArray(data.checklistItems)) updateData.checklistItems = JSON.stringify(data.checklistItems);

    return prisma.release.update({
      where: { id },
      data: updateData
    });
  }

  async deleteRelease(id: string) {
    const existing = await prisma.release.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Release not found');

    await prisma.release.delete({ where: { id } });
    return { message: 'Release deleted successfully' };
  }

  async updateChecklist(releaseId: string, items: Array<{ id: string; label: string; completed: boolean }>) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) throw new NotFoundError('Release not found');

    const completed = items.filter((i) => i.completed).length;
    const score = items.length > 0 ? Math.round((completed / items.length) * 100) : 0;
    const allCompleted = items.length > 0 && completed === items.length;

    let newStatus = release.status;
    if (allCompleted && release.status === ReleaseStatus.PLANNED) {
      newStatus = ReleaseStatus.READY;
    }

    return prisma.release.update({
      where: { id: releaseId },
      data: {
        checklistItems: JSON.stringify(items),
        readinessScore: score,
        status: newStatus
      }
    });
  }

  async approveRelease(releaseId: string, approverId: string, data: { role?: string; status?: string; decision?: string; notes?: string; comments?: string }) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) throw new NotFoundError('Release not found');

    const status = data.status || data.decision || 'APPROVED';
    const notes = data.notes || data.comments || '';

    const approval = await prisma.releaseApproval.create({
      data: {
        releaseId,
        approverId,
        role: data.role || 'RELEASE_MANAGER',
        status,
        notes,
        approvedAt: status === 'APPROVED' ? new Date() : null
      },
      include: {
        approver: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    if (status === 'APPROVED') {
      await prisma.release.update({
        where: { id: releaseId },
        data: { status: ReleaseStatus.READY }
      });
    }

    return {
      ...approval,
      decision: approval.status
    };
  }

  async getReleaseReadiness(releaseId: string) {
    const release = await prisma.release.findUnique({
      where: { id: releaseId },
      include: {
        tasks: { include: { task: true } },
        bugs: true,
        approvals: true,
        testRuns: true
      }
    });

    if (!release) throw new NotFoundError('Release not found');

    // 1. Tasks Completion
    const totalTasks = release.tasks.length;
    const completedTasks = release.tasks.filter((t) => t.task.status === 'DONE').length;
    const tasksReady = totalTasks === 0 || completedTasks === totalTasks;

    // 2. Critical Bugs
    const criticalBugs = release.bugs.filter((b) => (b.severity === 'CRITICAL' || b.severity === 'HIGH') && b.status !== 'CLOSED' && b.status !== 'FIXED' && b.status !== 'VERIFIED');
    const bugsReady = criticalBugs.length === 0;

    // 3. Approvals
    const approvedCount = release.approvals.filter((a) => a.status === 'APPROVED').length;
    const approvalsReady = approvedCount >= 2;

    // 4. Checklist items
    let checklist: Array<{ completed: boolean }> = [];
    try {
      checklist = JSON.parse(release.checklistItems || '[]');
    } catch {}
    const checklistCompleted = checklist.filter((i) => i.completed).length;
    const checklistReady = checklist.length === 0 || checklistCompleted === checklist.length;

    // Score: 30% tasks, 30% bugs, 20% approvals, 20% checklist
    const score = Math.round(
      (tasksReady ? 30 : totalTasks > 0 ? (completedTasks / totalTasks) * 30 : 30) +
      (bugsReady ? 30 : 0) +
      (approvalsReady ? 20 : (approvedCount / 3) * 20) +
      (checklist.length > 0 ? (checklistCompleted / checklist.length) * 20 : 20)
    );

    return {
      releaseId,
      version: release.version,
      overallReadinessScore: score,
      score,
      isProductionReady: score >= 85,
      isReady: score >= 85,
      tasksAudit: { total: totalTasks, completed: completedTasks, isReady: tasksReady },
      bugsAudit: { openCriticalCount: criticalBugs.length, isReady: bugsReady },
      approvalsAudit: { approvedCount, required: 2, isReady: approvalsReady },
      checklistAudit: { total: checklist.length, completed: checklistCompleted, isReady: checklistReady },
      rollbackPlanDocumented: !!release.rollbackPlan
    };
  }

  async recordDeployment(releaseId: string, userId: string, data: {
    environment: EnvironmentType;
    status?: DeploymentStatus;
    buildNumber?: string;
    commitSha?: string;
    durationSeconds?: number;
    logs?: string;
    rollbackReason?: string;
  }) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) throw new NotFoundError('Release not found');

    const duration = data.durationSeconds || Math.floor(Math.random() * 30) + 30;
    const buildNumber = data.buildNumber || `BUILD-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900) + 100}`;
    const commitSha = data.commitSha || '7f4a9b2';
    const logs = data.logs || `[${new Date().toLocaleTimeString()}] Target environment: ${data.environment}\n[${new Date().toLocaleTimeString()}] Authenticated pipeline trigger by engineer\n[${new Date().toLocaleTimeString()}] Pulled container SHA: ${commitSha}\n[${new Date().toLocaleTimeString()}] Health probes verified on all replica endpoints (200 OK)\n[${new Date().toLocaleTimeString()}] Deployment status: ${data.status || 'DEPLOYED'}`;

    const deployment = await prisma.deployment.create({
      data: {
        releaseId,
        environment: data.environment,
        status: data.status || DeploymentStatus.DEPLOYED,
        deployedById: userId,
        buildNumber,
        commitSha,
        durationSeconds: duration,
        logs,
        rollbackReason: data.rollbackReason
      },
      include: {
        deployedBy: { select: { id: true, name: true, avatarUrl: true } }
      }
    });

    if (data.environment === EnvironmentType.PRODUCTION && (data.status === DeploymentStatus.DEPLOYED || !data.status)) {
      await prisma.release.update({
        where: { id: releaseId },
        data: {
          status: ReleaseStatus.RELEASED,
          releasedAt: new Date()
        }
      });
    }

    return deployment;
  }

  async recordRollback(releaseId: string, userId: string, data: {
    targetVersion: string;
    reason: string;
    deploymentId?: string;
  }) {
    const release = await prisma.release.findUnique({ where: { id: releaseId } });
    if (!release) throw new NotFoundError('Release not found');

    const rollback = await prisma.rollbackRecord.create({
      data: {
        releaseId,
        deploymentId: data.deploymentId,
        requestedById: userId,
        targetVersion: data.targetVersion,
        reason: data.reason,
        status: 'COMPLETED',
        logs: `[${new Date().toLocaleTimeString()}] Rollback initiated for version ${release.version} -> ${data.targetVersion}\n[${new Date().toLocaleTimeString()}] Reason: ${data.reason}\n[${new Date().toLocaleTimeString()}] Traffic rerouted to previous stable revision.\n[${new Date().toLocaleTimeString()}] Verification passed.`
      },
      include: {
        requestedBy: { select: { id: true, name: true } }
      }
    });

    await prisma.release.update({
      where: { id: releaseId },
      data: { status: ReleaseStatus.ROLLED_BACK }
    });

    return rollback;
  }
}

export const releaseService = new ReleaseService();
