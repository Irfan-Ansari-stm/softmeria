'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Code2,
  GitBranch,
  GitPullRequest,
  GitCommit,
  ExternalLink,
  Plus,
  RefreshCw,
  Play,
  CheckCircle2,
  XCircle,
  Clock,
  Trash2,
  FolderKanban,
  ShieldCheck,
  Activity,
  Layers,
  ArrowUpRight,
  GitFork
} from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';

interface DevelopmentViewProps {
  projectId: string;
}

export function DevelopmentView({ projectId }: DevelopmentViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'repositories' | 'prs' | 'pipelines' | 'commits'>('repositories');

  // Modals
  const [isAddRepoOpen, setIsAddRepoOpen] = useState(false);
  const [isAddPROpen, setIsAddPROpen] = useState(false);
  const [isTriggerPipelineOpen, setIsTriggerPipelineOpen] = useState(false);
  const [selectedRepoId, setSelectedRepoId] = useState<string>('');

  // Form State: Repo
  const [repoName, setRepoName] = useState('');
  const [repoUrl, setRepoUrl] = useState('');
  const [repoProvider, setRepoProvider] = useState('GITHUB');
  const [repoBranch, setRepoBranch] = useState('main');
  const [repoVisibility, setRepoVisibility] = useState('PUBLIC');

  // Form State: PR
  const [prTitle, setPrTitle] = useState('');
  const [prSource, setPrSource] = useState('feat/new-endpoint');
  const [prTarget, setPrTarget] = useState('main');
  const [prDesc, setPrDesc] = useState('');

  // Form State: Pipeline
  const [pipelineBranch, setPipelineBranch] = useState('main');

  // Queries
  const { data: repos = [], isLoading: isReposLoading } = useQuery({
    queryKey: ['repositories', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/repositories?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const { data: stats } = useQuery({
    queryKey: ['development-stats', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/development/stats?projectId=${projectId}`);
      return res.data;
    }
  });

  const { data: pullRequests = [] } = useQuery({
    queryKey: ['pull-requests', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/pull-requests?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const { data: pipelines = [] } = useQuery({
    queryKey: ['pipelines', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/pipelines?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Mutations
  const createRepoMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/repositories', {
        projectId,
        name: repoName,
        url: repoUrl,
        provider: repoProvider,
        defaultBranch: repoBranch,
        visibility: repoVisibility,
        isPrimary: repos.length === 0
      });
      return res.data;
    },
    onSuccess: () => {
      setIsAddRepoOpen(false);
      setRepoName('');
      setRepoUrl('');
      queryClient.invalidateQueries({ queryKey: ['repositories', projectId] });
      queryClient.invalidateQueries({ queryKey: ['development-stats', projectId] });
    }
  });

  const syncRepoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/repositories/${id}/sync`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', projectId] });
      queryClient.invalidateQueries({ queryKey: ['development-stats', projectId] });
      queryClient.invalidateQueries({ queryKey: ['pull-requests', projectId] });
      queryClient.invalidateQueries({ queryKey: ['pipelines', projectId] });
    }
  });

  const deleteRepoMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/repositories/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['repositories', projectId] });
      queryClient.invalidateQueries({ queryKey: ['development-stats', projectId] });
    }
  });

  const createPRMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/pull-requests', {
        projectId,
        repositoryId: selectedRepoId || repos[0]?.id,
        title: prTitle,
        sourceBranch: prSource,
        targetBranch: prTarget,
        description: prDesc
      });
      return res.data;
    },
    onSuccess: () => {
      setIsAddPROpen(false);
      setPrTitle('');
      setPrDesc('');
      queryClient.invalidateQueries({ queryKey: ['pull-requests', projectId] });
      queryClient.invalidateQueries({ queryKey: ['development-stats', projectId] });
    }
  });

  const triggerPipelineMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/pipelines/trigger', {
        repositoryId: selectedRepoId || repos[0]?.id,
        branch: pipelineBranch
      });
      return res.data;
    },
    onSuccess: () => {
      setIsTriggerPipelineOpen(false);
      queryClient.invalidateQueries({ queryKey: ['pipelines', projectId] });
      queryClient.invalidateQueries({ queryKey: ['development-stats', projectId] });
    }
  });

  // Collect all commits across repositories
  const allCommits = repos.flatMap((r: any) =>
    (r.commits || []).map((c: any) => ({ ...c, repoName: r.name }))
  );

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Connected Repos</span>
          <div className="text-xl font-bold text-foreground">{stats?.connectedRepos ?? repos.length}</div>
          <span className="text-[10px] text-success flex items-center gap-1">
            <CheckCircle2 className="h-3 w-3" /> Live Synced
          </span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Weekly Commits</span>
          <div className="text-xl font-bold text-foreground">{stats?.totalCommits ?? allCommits.length}</div>
          <span className="text-[10px] text-foreground-muted">Active branches</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Open PRs</span>
          <div className="text-xl font-bold text-primary">{stats?.openPRs ?? pullRequests.filter((p: any) => p.status === 'OPEN').length}</div>
          <span className="text-[10px] text-foreground-muted">Awaiting review</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Merged PRs</span>
          <div className="text-xl font-bold text-success">{stats?.mergedPRs ?? pullRequests.filter((p: any) => p.status === 'MERGED').length}</div>
          <span className="text-[10px] text-foreground-muted">Sprint velocity</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">CI/CD Pipelines</span>
          <div className="text-xl font-bold text-foreground">{pipelines.length}</div>
          <span className="text-[10px] text-foreground-muted">{pipelines.filter((p: any) => p.status === 'SUCCESS').length} passed</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Latest Sync</span>
          <div className="text-xs font-mono font-bold text-foreground truncate mt-1">
            {stats?.latestSync ? new Date(stats.latestSync).toLocaleTimeString() : 'Just now'}
          </div>
          <span className="text-[10px] text-success flex items-center gap-1">
            <Activity className="h-3 w-3" /> Webhooks active
          </span>
        </Card>
      </div>

      {/* Tabs and Actions Header */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1">
          {[
            { id: 'repositories', label: 'Repositories', icon: Code2, count: repos.length },
            { id: 'prs', label: 'Pull Requests', icon: GitPullRequest, count: pullRequests.length },
            { id: 'pipelines', label: 'CI/CD Pipelines', icon: Play, count: pipelines.length },
            { id: 'commits', label: 'Recent Commits', icon: GitCommit, count: allCommits.length }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background-tertiary text-foreground-muted'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'repositories' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddRepoOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Connect Repository</span>
            </Button>
          )}

          {activeTab === 'prs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedRepoId(repos[0]?.id || '');
                setIsAddPROpen(true);
              }}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Pull Request</span>
            </Button>
          )}

          {activeTab === 'pipelines' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setSelectedRepoId(repos[0]?.id || '');
                setIsTriggerPipelineOpen(true);
              }}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Trigger Pipeline</span>
            </Button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: CONNECTED REPOSITORIES */}
      {/* =================================================================== */}
      {activeTab === 'repositories' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {repos.map((repo: any) => (
            <Card key={repo.id} className="p-5 space-y-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-foreground flex items-center gap-2">
                      <Code2 className="h-4 w-4 text-primary" />
                      <span>{repo.name}</span>
                    </h3>
                    {repo.isPrimary && (
                      <Badge variant="default" className="text-[9px]">
                        Primary
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-3 text-xs text-foreground-muted font-mono">
                    <span className="flex items-center gap-1">
                      <GitBranch className="h-3 w-3" />
                      {repo.defaultBranch}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{repo.provider}</span>
                    <span>•</span>
                    <span className="uppercase">{repo.visibility}</span>
                  </div>
                </div>

                <Badge variant="outline" className="text-[10px] text-success border-success/30 bg-success/5">
                  <CheckCircle2 className="h-3 w-3 mr-1 inline" />
                  Live Synced
                </Badge>
              </div>

              {/* Branches Pill */}
              <div className="p-3 rounded-lg bg-background-secondary/70 border border-border/70 text-xs space-y-2">
                <div className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider flex items-center justify-between">
                  <span>Branches ({(repo.branches || []).length})</span>
                  <span className="text-[10px] font-mono text-foreground-muted">Last sync: {new Date(repo.lastSyncAt || repo.updatedAt).toLocaleTimeString()}</span>
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {(repo.branches || []).map((b: any) => (
                    <span key={b.id} className="px-2 py-0.5 rounded bg-card border border-border text-[11px] font-mono text-foreground flex items-center gap-1 shadow-xs">
                      <GitBranch className="h-2.5 w-2.5 text-primary" />
                      <span>{b.name}</span>
                      {b.isDefault && <span className="text-[9px] text-foreground-muted">(default)</span>}
                    </span>
                  ))}
                </div>
              </div>

              {/* Card Actions */}
              <div className="pt-2 border-t border-border flex items-center justify-between">
                <button
                  onClick={() => deleteRepoMutation.mutate(repo.id)}
                  className="text-xs text-foreground-muted hover:text-destructive transition-colors flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Remove</span>
                </button>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => syncRepoMutation.mutate(repo.id)}
                    isLoading={syncRepoMutation.isPending}
                    className="text-xs gap-1.5 h-8"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Sync Git</span>
                  </Button>

                  <a href={repo.url} target="_blank" rel="noopener noreferrer">
                    <Button variant="ghost" size="sm" className="text-xs gap-1.5 h-8">
                      <span>Open Provider</span>
                      <ExternalLink className="h-3 w-3" />
                    </Button>
                  </a>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: PULL REQUESTS */}
      {/* =================================================================== */}
      {activeTab === 'prs' && (
        <Card className="overflow-hidden shadow-xs">
          <div className="divide-y divide-border">
            {pullRequests.map((pr: any) => (
              <div key={pr.id} className="p-4 flex items-center justify-between hover:bg-background-secondary/50 transition-colors">
                <div className="flex items-start gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${pr.status === 'MERGED' ? 'bg-purple-500/10 text-purple-600' : 'bg-success/10 text-success'}`}>
                    <GitPullRequest className="h-4 w-4" />
                  </div>
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-semibold text-foreground-muted">#{pr.prNumber}</span>
                      <h4 className="text-xs font-semibold text-foreground truncate">{pr.title}</h4>
                      {pr.task && (
                        <Badge variant="outline" className="text-[10px] font-mono">
                          {pr.task.taskIdentifier}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-foreground-muted font-mono">
                      <span>by {pr.author}</span>
                      <span>•</span>
                      <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                      <span>•</span>
                      <span>{new Date(pr.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={pr.reviewStatus === 'APPROVED' ? 'success' : pr.reviewStatus === 'CHANGES_REQUESTED' ? 'destructive' : 'warning'} className="text-[10px]">
                    {pr.reviewStatus}
                  </Badge>
                  <Badge variant={pr.status === 'MERGED' ? 'default' : 'outline'} className="text-[10px]">
                    {pr.status}
                  </Badge>
                  {pr.url && (
                    <a href={pr.url} target="_blank" rel="noopener noreferrer" className="p-1 text-foreground-muted hover:text-foreground">
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 3: CI/CD PIPELINES */}
      {/* =================================================================== */}
      {activeTab === 'pipelines' && (
        <Card className="overflow-hidden shadow-xs">
          <div className="divide-y divide-border">
            {pipelines.map((pipe: any) => (
              <div key={pipe.id} className="p-4 flex items-center justify-between hover:bg-background-secondary/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${pipe.status === 'SUCCESS' ? 'bg-success/10 text-success' : pipe.status === 'FAILED' ? 'bg-destructive/10 text-destructive' : 'bg-primary/10 text-primary'}`}>
                    {pipe.status === 'SUCCESS' ? <CheckCircle2 className="h-4 w-4" /> : pipe.status === 'FAILED' ? <XCircle className="h-4 w-4" /> : <Play className="h-4 w-4" />}
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-foreground">#{pipe.pipelineNumber}</span>
                      <h4 className="text-xs font-semibold text-foreground truncate">{pipe.workflowName}</h4>
                      <Badge variant="outline" className="text-[9px] uppercase font-mono">
                        {pipe.provider}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-foreground-muted font-mono">
                      <span>branch: {pipe.branch}</span>
                      <span>•</span>
                      <span>commit: {pipe.commitSha}</span>
                      <span>•</span>
                      <span>{pipe.durationSeconds}s duration</span>
                      <span>•</span>
                      <span>{pipe.testsPassed}/{pipe.testsTotal} tests passed</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={pipe.status === 'SUCCESS' ? 'success' : pipe.status === 'FAILED' ? 'destructive' : 'warning'} className="text-[10px]">
                    {pipe.status}
                  </Badge>
                  {pipe.deploymentStatus && (
                    <Badge variant="outline" className="text-[10px]">
                      {pipe.deploymentStatus}
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 4: RECENT COMMITS */}
      {/* =================================================================== */}
      {activeTab === 'commits' && (
        <Card className="overflow-hidden shadow-xs">
          <div className="divide-y divide-border">
            {allCommits.map((c: any) => (
              <div key={c.id || c.sha} className="p-3.5 flex items-center justify-between hover:bg-background-secondary/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <GitCommit className="h-4 w-4 text-primary shrink-0" />
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <code className="text-xs font-mono font-bold text-primary">{c.sha}</code>
                      <span className="text-xs font-medium text-foreground truncate">{c.message}</span>
                    </div>
                    <div className="text-[11px] text-foreground-muted font-mono">
                      {c.authorName} • committed {new Date(c.committedAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 font-mono text-xs shrink-0">
                  <span className="text-success font-semibold">+{c.additions}</span>
                  <span className="text-destructive font-semibold">-{c.deletions}</span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Connect Repository Dialog */}
      {isAddRepoOpen && (
        <Dialog
          isOpen={isAddRepoOpen}
          onClose={() => setIsAddRepoOpen(false)}
          title="Connect Git Repository"
          description="Link an external GitHub, GitLab, or Bitbucket repository."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createRepoMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Repository Name *"
              value={repoName}
              onChange={(e) => setRepoName(e.target.value)}
              placeholder="e.g. acme/payment-orchestrator"
              required
            />
            <Input
              label="Repository URL *"
              value={repoUrl}
              onChange={(e) => setRepoUrl(e.target.value)}
              placeholder="https://github.com/acme/payment-orchestrator"
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Git Provider *</label>
              <select
                value={repoProvider}
                onChange={(e) => setRepoProvider(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                <option value="GITHUB">GitHub</option>
                <option value="GITLAB">GitLab</option>
                <option value="BITBUCKET">Bitbucket</option>
              </select>
            </div>
            <Input
              label="Default Branch *"
              value={repoBranch}
              onChange={(e) => setRepoBranch(e.target.value)}
              placeholder="main"
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Visibility</label>
              <select
                value={repoVisibility}
                onChange={(e) => setRepoVisibility(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                <option value="PUBLIC">Public</option>
                <option value="PRIVATE">Private</option>
                <option value="INTERNAL">Internal</option>
              </select>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddRepoOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createRepoMutation.isPending}>
                Connect Repository
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Create Pull Request Dialog */}
      {isAddPROpen && (
        <Dialog
          isOpen={isAddPROpen}
          onClose={() => setIsAddPROpen(false)}
          title="Create Pull Request"
          description="Open a new code review request linked to this project."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createPRMutation.mutate();
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Repository *</label>
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                {repos.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="PR Title *"
              value={prTitle}
              onChange={(e) => setPrTitle(e.target.value)}
              placeholder="e.g. feat: add automated idempotency keys"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                label="Source Branch *"
                value={prSource}
                onChange={(e) => setPrSource(e.target.value)}
                placeholder="feat/idempotency"
                required
              />
              <Input
                label="Target Branch *"
                value={prTarget}
                onChange={(e) => setPrTarget(e.target.value)}
                placeholder="main"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddPROpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createPRMutation.isPending}>
                Create PR
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Trigger Pipeline Dialog */}
      {isTriggerPipelineOpen && (
        <Dialog
          isOpen={isTriggerPipelineOpen}
          onClose={() => setIsTriggerPipelineOpen(false)}
          title="Trigger CI/CD Pipeline Run"
          description="Dispatch an automated build and test runner against target branch."
          maxWidth="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              triggerPipelineMutation.mutate();
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Repository</label>
              <select
                value={selectedRepoId}
                onChange={(e) => setSelectedRepoId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                {repos.map((r: any) => (
                  <option key={r.id} value={r.id}>
                    {r.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Branch Name"
              value={pipelineBranch}
              onChange={(e) => setPipelineBranch(e.target.value)}
              placeholder="main"
              required
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTriggerPipelineOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={triggerPipelineMutation.isPending}>
                Dispatch Run
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
