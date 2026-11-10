import { prisma } from '../../config/db';
import { NotFoundError, BadRequestError } from '../../utils/errors';
import { ActivityAction } from '@prisma/client';

export class DevelopmentService {
  async listRepositories(projectId: string) {
    return prisma.repository.findMany({
      where: { projectId },
      include: {
        branches: { orderBy: { isDefault: 'desc' } },
        commits: { orderBy: { committedAt: 'desc' }, take: 10 },
        pullRequests: { orderBy: { createdAt: 'desc' } },
        pipelineRuns: { orderBy: { startedAt: 'desc' }, take: 5 }
      },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }]
    });
  }

  async createRepository(userId: string, data: {
    projectId: string;
    name: string;
    url: string;
    provider?: string;
    defaultBranch?: string;
    isPrimary?: boolean;
    visibility?: string;
    owner?: string;
  }) {
    if (data.isPrimary) {
      await prisma.repository.updateMany({
        where: { projectId: data.projectId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    const defaultBranch = data.defaultBranch || 'main';
    const repoUrl = data.url || (data as any).repositoryUrl || `https://github.com/org/${data.name}`;
    const repo = await prisma.repository.create({
      data: {
        projectId: data.projectId,
        name: data.name,
        url: repoUrl,
        provider: data.provider || 'GITHUB',
        defaultBranch,
        isPrimary: data.isPrimary ?? false,
        visibility: data.visibility || 'PUBLIC',
        owner: data.owner || data.name.split('/')[0] || 'acme',
        isConnected: true,
        syncStatus: 'SYNCED',
        lastSyncAt: new Date(),
        webhookUrl: `http://localhost:4000/api/v1/integrations/webhooks/${(data.provider || 'github').toLowerCase()}`
      }
    });

    // Create default branch
    await prisma.repositoryBranch.create({
      data: {
        repositoryId: repo.id,
        name: defaultBranch,
        isDefault: true,
        lastCommitSha: 'a1b2c3d',
        lastCommitMessage: 'Initial repository commit and README setup',
        lastCommitAuthor: 'Core Engineering'
      }
    });

    // Create initial commit
    await prisma.gitCommit.create({
      data: {
        repositoryId: repo.id,
        sha: 'a1b2c3d',
        message: 'Initial repository commit and README setup',
        authorName: 'Core Engineering',
        branch: defaultBranch,
        additions: 45,
        deletions: 0
      }
    });

    // Activity log
    const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: data.projectId,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'Repository',
          metadata: JSON.stringify({ repoName: repo.name, provider: repo.provider })
        }
      });
    }

    return repo;
  }

  async updateRepository(id: string, data: {
    name?: string;
    url?: string;
    provider?: string;
    defaultBranch?: string;
    isPrimary?: boolean;
    visibility?: string;
    owner?: string;
    isConnected?: boolean;
  }) {
    const existing = await prisma.repository.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Repository not found');

    if (data.isPrimary) {
      await prisma.repository.updateMany({
        where: { projectId: existing.projectId, isPrimary: true },
        data: { isPrimary: false }
      });
    }

    return prisma.repository.update({
      where: { id },
      data
    });
  }

  async deleteRepository(id: string) {
    const existing = await prisma.repository.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Repository not found');

    await prisma.repository.delete({ where: { id } });
    return { message: 'Repository removed successfully' };
  }

  async syncRepository(id: string) {
    const existing = await prisma.repository.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Repository not found');

    // Generate fresh commit simulation on sync
    const randomSha = Math.random().toString(16).substring(2, 9);
    await prisma.gitCommit.create({
      data: {
        repositoryId: id,
        sha: randomSha,
        message: `chore(sync): automated repository sync update (${new Date().toLocaleTimeString()})`,
        authorName: 'CI Sync Bot',
        branch: existing.defaultBranch,
        additions: Math.floor(Math.random() * 20) + 1,
        deletions: Math.floor(Math.random() * 5)
      }
    });

    return prisma.repository.update({
      where: { id },
      data: {
        lastSyncAt: new Date(),
        syncStatus: 'SYNCED',
        isConnected: true
      },
      include: {
        branches: true,
        commits: { orderBy: { committedAt: 'desc' }, take: 5 },
        pullRequests: true,
        pipelineRuns: { orderBy: { startedAt: 'desc' }, take: 5 }
      }
    });
  }

  async listPullRequests(projectId: string, repositoryId?: string) {
    const where: any = { projectId };
    if (repositoryId) where.repositoryId = repositoryId;

    return prisma.pullRequest.findMany({
      where,
      include: {
        repository: { select: { id: true, name: true, provider: true } },
        task: { select: { id: true, taskIdentifier: true, title: true, status: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }

  async createPullRequest(userId: string, data: {
    projectId: string;
    repositoryId: string;
    taskId?: string;
    title: string;
    description?: string;
    sourceBranch: string;
    targetBranch?: string;
  }) {
    const repo = await prisma.repository.findUnique({ where: { id: data.repositoryId } });
    if (!repo) throw new NotFoundError('Repository not found');

    const prCount = await prisma.pullRequest.count({ where: { repositoryId: data.repositoryId } });
    const prNumber = prCount + 101;

    const pr = await prisma.pullRequest.create({
      data: {
        repositoryId: data.repositoryId,
        projectId: data.projectId,
        taskId: data.taskId,
        prNumber,
        title: data.title,
        description: data.description,
        author: 'Lead Engineer',
        sourceBranch: data.sourceBranch,
        targetBranch: data.targetBranch || repo.defaultBranch,
        status: 'OPEN',
        reviewStatus: 'PENDING',
        url: `${repo.url}/pull/${prNumber}`
      },
      include: {
        repository: true,
        task: true
      }
    });

    const project = await prisma.project.findUnique({ where: { id: data.projectId }, select: { workspaceId: true } });
    if (project) {
      await prisma.activityLog.create({
        data: {
          workspaceId: project.workspaceId,
          projectId: data.projectId,
          userId,
          action: ActivityAction.CREATED,
          entityType: 'PullRequest',
          metadata: JSON.stringify({ prNumber, title: pr.title })
        }
      });
    }

    return pr;
  }

  async updatePullRequestStatus(id: string, data: { status?: string; reviewStatus?: string }) {
    const existing = await prisma.pullRequest.findUnique({ where: { id } });
    if (!existing) throw new NotFoundError('Pull request not found');

    const updateData: any = { ...data };
    if (data.status === 'MERGED' && !existing.mergedAt) {
      updateData.mergedAt = new Date();
    }

    return prisma.pullRequest.update({
      where: { id },
      data: updateData,
      include: { repository: true, task: true }
    });
  }

  async listPipelines(projectId: string, repositoryId?: string) {
    const where: any = { projectId };
    if (repositoryId) where.repositoryId = repositoryId;

    return prisma.pipelineRun.findMany({
      where,
      include: { repository: { select: { id: true, name: true, provider: true } } },
      orderBy: { startedAt: 'desc' }
    });
  }

  async triggerPipeline(userId: string, data: { repositoryId: string; branch?: string }) {
    const repo = await prisma.repository.findUnique({ where: { id: data.repositoryId } });
    if (!repo) throw new NotFoundError('Repository not found');

    const branch = data.branch || repo.defaultBranch;
    const count = await prisma.pipelineRun.count({ where: { repositoryId: repo.id } });
    const pipelineNumber = count + 201;
    const commitSha = Math.random().toString(16).substring(2, 9);

    const pipeline = await prisma.pipelineRun.create({
      data: {
        repositoryId: repo.id,
        projectId: repo.projectId,
        pipelineNumber,
        workflowName: 'CI/CD Automated Test & Staging Gate',
        provider: repo.provider === 'GITLAB' ? 'GITLAB_CI' : repo.provider === 'BITBUCKET' ? 'BITBUCKET_PIPELINES' : 'GITHUB_ACTIONS',
        status: 'SUCCESS',
        branch,
        commitSha,
        commitMessage: `Triggered manual test run on ${branch}`,
        durationSeconds: 48,
        testsPassed: 65,
        testsFailed: 0,
        testsTotal: 65,
        deploymentStatus: 'DEPLOYED',
        url: `${repo.url}/actions/runs/${pipelineNumber}`,
        startedAt: new Date(),
        completedAt: new Date(Date.now() + 48000)
      },
      include: { repository: true }
    });

    return pipeline;
  }

  async getDevelopmentStats(projectId: string) {
    const repos = await prisma.repository.findMany({
      where: { projectId },
      include: {
        commits: { orderBy: { committedAt: 'desc' }, take: 10 },
        pullRequests: true,
        pipelineRuns: { orderBy: { startedAt: 'desc' }, take: 5 }
      }
    });

    const totalRepos = repos.length;
    const connectedRepos = repos.filter((r) => r.isConnected).length;
    const allCommits = repos.flatMap((r) => r.commits);
    const allPRs = repos.flatMap((r) => r.pullRequests);
    const openPRs = allPRs.filter((pr) => pr.status === 'OPEN').length;
    const mergedPRs = allPRs.filter((pr) => pr.status === 'MERGED').length;
    const allPipelines = repos.flatMap((r) => r.pipelineRuns);
    const failedPipelines = allPipelines.filter((p) => p.status === 'FAILED').length;
    const latestSync = repos.reduce((latest: Date | null, r) => {
      if (!r.lastSyncAt) return latest;
      if (!latest || r.lastSyncAt > latest) return r.lastSyncAt;
      return latest;
    }, null);

    return {
      totalRepos,
      totalRepositories: totalRepos,
      connectedRepos,
      connectedRepositories: connectedRepos,
      totalCommits: allCommits.length,
      recentCommits: allCommits.slice(0, 5),
      openPRs,
      mergedPRs,
      failedPipelines,
      latestSync: latestSync?.toISOString() || null
    };
  }
}

export const developmentService = new DevelopmentService();
