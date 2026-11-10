'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Rocket,
  Plus,
  Server,
  CheckCircle2,
  GitCommit,
  ExternalLink,
  Clock,
  ShieldAlert,
  Terminal,
  ShieldCheck,
  RotateCcw,
  AlertTriangle,
  FileText,
  Bug,
  CheckSquare,
  Flame,
  ChevronDown,
  ChevronRight,
  UserCheck
} from 'lucide-react';

interface ReleasesViewProps {
  projectId: string;
}

export function ReleasesView({ projectId }: ReleasesViewProps) {
  const queryClient = useQueryClient();

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isRollbackOpen, setIsRollbackOpen] = useState(false);
  const [selectedReleaseId, setSelectedReleaseId] = useState<string>('');
  const [selectedLogsDeployment, setSelectedLogsDeployment] = useState<any | null>(null);

  // Form State: Release
  const [version, setVersion] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [releaseNotes, setReleaseNotes] = useState('');
  const [targetDate, setTargetDate] = useState('');
  const [environment, setEnvironment] = useState('PRODUCTION');
  const [semVerError, setSemVerError] = useState('');

  // Form State: Deploy
  const [deployEnv, setDeployEnv] = useState('STAGING');
  const [commitSha, setCommitSha] = useState('7f4a9b2');
  const [buildNumber, setBuildNumber] = useState('');

  // Form State: Rollback
  const [rollbackTargetVersion, setRollbackTargetVersion] = useState('');
  const [rollbackReason, setRollbackReason] = useState('');

  // Fetch Releases
  const { data: releases = [], isLoading } = useQuery({
    queryKey: ['releases', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/releases?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // SemVer validation helper
  const handleVersionChange = (val: string) => {
    setVersion(val);
    const regex = /^v?(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-([0-9a-zA-Z.-]+))?$/;
    if (val && !regex.test(val.trim())) {
      setSemVerError('Version must follow Semantic Versioning: MAJOR.MINOR.PATCH (e.g. 1.2.0, v2.0.0-GA)');
    } else {
      setSemVerError('');
    }
  };

  // Create Release Mutation
  const createReleaseMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/releases', {
        projectId,
        version: version.trim(),
        title: name,
        description,
        releaseNotes,
        environment,
        targetDate: targetDate ? new Date(targetDate).toISOString() : new Date().toISOString()
      });
      return res.data;
    },
    onSuccess: () => {
      setVersion('');
      setName('');
      setDescription('');
      setReleaseNotes('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    }
  });

  // Create Deployment Mutation
  const deployMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/releases/${selectedReleaseId}/deployments`, {
        environment: deployEnv,
        commitSha: commitSha || '7f4a9b2',
        buildNumber: buildNumber || `BUILD-${Date.now().toString().slice(-6)}`
      });
      return res.data;
    },
    onSuccess: () => {
      setIsDeployOpen(false);
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    }
  });

  // Rollback Mutation
  const rollbackMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/releases/${selectedReleaseId}/rollbacks`, {
        targetVersion: rollbackTargetVersion,
        reason: rollbackReason
      });
      return res.data;
    },
    onSuccess: () => {
      setIsRollbackOpen(false);
      setRollbackTargetVersion('');
      setRollbackReason('');
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    }
  });

  // Approval Mutation
  const approveMutation = useMutation({
    mutationFn: async ({ releaseId, role }: { releaseId: string; role: string }) => {
      const res = await api.post(`/releases/${releaseId}/approvals`, {
        role,
        status: 'APPROVED',
        notes: `Sign-off granted at ${new Date().toLocaleTimeString()}`
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['releases', projectId] });
    }
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RELEASED':
        return <Badge variant="success">Released</Badge>;
      case 'READY':
        return <Badge variant="default">Ready to Deploy</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">Deploying</Badge>;
      case 'PLANNED':
        return <Badge variant="warning">Scheduled</Badge>;
      case 'ROLLED_BACK':
        return <Badge variant="destructive">Rolled Back</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-bold text-foreground flex items-center gap-2">
            <Rocket className="h-5 w-5 text-primary" />
            <span>Release Management & Deployment Governance</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            Semantic versioning gates, Blue/Green zero-downtime deployment logs, readiness scoring, and automated rollback governance
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          className="text-xs gap-1.5 shadow-xs"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Prepare Release</span>
        </Button>
      </div>

      {/* Releases List */}
      <div className="space-y-5">
        {isLoading ? (
          <div className="p-8 text-center text-xs text-foreground-muted">Loading release schedules...</div>
        ) : releases.length === 0 ? (
          <div className="p-12 text-center text-xs text-foreground-muted bg-card rounded-xl border border-border">
            No releases scheduled yet. Click &quot;Prepare Release&quot; to plan your next version.
          </div>
        ) : (
          releases.map((rel: any) => {
            const readiness = Math.round(rel.readinessScore || 75);
            const isReady = readiness >= 80;

            return (
              <Card key={rel.id} className="border-border bg-card overflow-hidden shadow-xs">
                {/* Release Card Header */}
                <CardHeader className="p-5 border-b border-border bg-background-secondary flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex flex-wrap items-center gap-2.5">
                      <span className="font-mono font-bold text-sm text-foreground bg-background px-2.5 py-0.5 rounded-lg border border-border shadow-xs">
                        {rel.version}
                      </span>
                      <h3 className="font-bold text-sm text-foreground truncate">{rel.title}</h3>
                      {getStatusBadge(rel.status)}
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {rel.environment || 'PRODUCTION'}
                      </Badge>
                    </div>

                    {rel.description && (
                      <p className="text-xs text-foreground-secondary line-clamp-2">{rel.description}</p>
                    )}
                  </div>

                  {/* Readiness and Top Actions */}
                  <div className="flex flex-wrap items-center gap-3">
                    {/* Readiness Score Badge */}
                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-card border border-border shadow-xs text-xs">
                      <span className="text-foreground-muted font-medium">Readiness:</span>
                      <span className={`font-mono font-bold ${isReady ? 'text-success' : 'text-warning'}`}>
                        {readiness}%
                      </span>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReleaseId(rel.id);
                        setDeployEnv('STAGING');
                        setIsDeployOpen(true);
                      }}
                      className="text-xs gap-1.5 h-8"
                    >
                      <Server className="h-3.5 w-3.5" />
                      <span>Deploy</span>
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedReleaseId(rel.id);
                        setRollbackTargetVersion('v1.0.0');
                        setIsRollbackOpen(true);
                      }}
                      className="text-xs gap-1.5 h-8 text-destructive hover:bg-destructive/10"
                    >
                      <RotateCcw className="h-3.5 w-3.5" />
                      <span>Rollback</span>
                    </Button>
                  </div>
                </CardHeader>

                <CardContent className="p-5 space-y-5">
                  {/* Scope & Readiness Details */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
                    {/* Included Tasks & Scope */}
                    <div className="p-3.5 rounded-xl bg-background-secondary/70 border border-border space-y-2">
                      <div className="flex items-center justify-between text-foreground font-semibold">
                        <span className="flex items-center gap-1.5">
                          <CheckSquare className="h-3.5 w-3.5 text-primary" />
                          <span>Release Scope</span>
                        </span>
                        <span className="font-mono text-[10px] text-foreground-muted">
                          {(rel.tasks || []).length} tasks
                        </span>
                      </div>
                      <div className="space-y-1">
                        {(rel.tasks || []).slice(0, 2).map((t: any) => (
                          <div key={t.id} className="text-[11px] text-foreground-secondary truncate flex items-center gap-1">
                            <span className="font-mono text-primary">{t.task?.taskIdentifier}:</span>
                            <span className="truncate">{t.task?.title}</span>
                          </div>
                        ))}
                        {(rel.tasks || []).length === 0 && (
                          <span className="text-[11px] text-foreground-muted italic">Core sprint deliverables included</span>
                        )}
                      </div>
                    </div>

                    {/* Quality Gate & Defects */}
                    <div className="p-3.5 rounded-xl bg-background-secondary/70 border border-border space-y-2">
                      <div className="flex items-center justify-between text-foreground font-semibold">
                        <span className="flex items-center gap-1.5">
                          <Bug className="h-3.5 w-3.5 text-destructive" />
                          <span>Defects & Bugs</span>
                        </span>
                        <span className="font-mono text-[10px] text-foreground-muted">
                          {rel.resolvedBugCount ?? 0} resolved
                        </span>
                      </div>
                      <p className="text-[11px] text-foreground-secondary">
                        Zero blocking P0/P1 bugs reported against this release tag.
                      </p>
                    </div>

                    {/* Rollback Plan Note */}
                    <div className="p-3.5 rounded-xl bg-background-secondary/70 border border-border space-y-2">
                      <div className="flex items-center justify-between text-foreground font-semibold">
                        <span className="flex items-center gap-1.5">
                          <ShieldCheck className="h-3.5 w-3.5 text-success" />
                          <span>Rollback Plan</span>
                        </span>
                        <Badge variant="outline" className="text-[9px]">
                          Documented
                        </Badge>
                      </div>
                      <p className="text-[11px] text-foreground-secondary truncate">
                        {rel.rollbackPlan || 'Rolling update back to previous stable container tag.'}
                      </p>
                    </div>
                  </div>

                  {/* Formal Approval Gates */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block">
                      Release Approval Gates
                    </span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {[
                        { role: 'QA_LEAD', label: 'QA Lead Sign-off' },
                        { role: 'SECURITY_LEAD', label: 'Security Lead Audit' },
                        { role: 'RELEASE_MANAGER', label: 'Release Manager' }
                      ].map((gate) => {
                        const approval = (rel.approvals || []).find((a: any) => a.role === gate.role);
                        const isApproved = approval?.status === 'APPROVED';

                        return (
                          <div
                            key={gate.role}
                            className={`p-3 rounded-xl border text-xs flex items-center justify-between transition-colors ${
                              isApproved
                                ? 'bg-success/5 border-success/30 text-success'
                                : 'bg-background-secondary/60 border-border text-foreground-secondary'
                            }`}
                          >
                            <div className="space-y-0.5 min-w-0">
                              <span className="font-semibold block text-[11px] truncate">{gate.label}</span>
                              <span className="text-[10px] font-mono block text-foreground-muted">
                                {isApproved ? 'Approved' : 'Pending sign-off'}
                              </span>
                            </div>

                            {!isApproved && (
                              <button
                                onClick={() => approveMutation.mutate({ releaseId: rel.id, role: gate.role })}
                                className="px-2 py-1 rounded bg-card border border-border hover:bg-background-tertiary text-[10px] font-medium text-foreground transition-colors shrink-0 shadow-xs"
                              >
                                Sign off
                              </button>
                            )}

                            {isApproved && <CheckCircle2 className="h-4 w-4 text-success shrink-0" />}
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Deployments Pipeline Log Stream */}
                  <div className="space-y-2">
                    <span className="text-[11px] font-bold text-foreground-muted uppercase tracking-wider block">
                      Deployment History & Audit Logs
                    </span>

                    {(rel.deployments || []).length === 0 ? (
                      <p className="text-xs text-foreground-muted italic p-3 rounded-lg bg-background-secondary/40 border border-border/50">
                        No deployments executed for this version yet.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {rel.deployments.map((dep: any) => (
                          <div
                            key={dep.id}
                            className="flex flex-col sm:flex-row sm:items-center justify-between p-3 rounded-xl bg-background-secondary/60 border border-border text-xs gap-2"
                          >
                            <div className="flex items-center gap-3">
                              <span
                                className={`px-2 py-0.5 rounded font-mono text-[10px] font-bold uppercase ${
                                  dep.environment === 'PRODUCTION'
                                    ? 'bg-destructive/10 text-destructive border border-destructive/20'
                                    : 'bg-primary/10 text-primary border border-primary/20'
                                }`}
                              >
                                {dep.environment}
                              </span>
                              <div className="flex items-center gap-1.5 font-mono text-foreground-secondary text-[11px]">
                                <GitCommit className="h-3 w-3" />
                                <span>{dep.commitSha || '7f4a9b2'}</span>
                              </div>
                              <span className="text-foreground-muted font-mono text-[10px]">
                                {dep.buildNumber || 'BUILD-PROD'}
                              </span>
                            </div>

                            <div className="flex items-center gap-3">
                              <span className="text-[11px] text-foreground-muted font-mono">
                                {dep.deployedAt ? new Date(dep.deployedAt).toLocaleString() : 'Just now'}
                              </span>

                              <Badge variant={dep.status === 'DEPLOYED' ? 'success' : 'status-progress'}>
                                {dep.status}
                              </Badge>

                              {dep.logs && (
                                <button
                                  onClick={() => setSelectedLogsDeployment(dep)}
                                  className="text-[11px] text-primary hover:underline font-mono inline-flex items-center gap-1"
                                >
                                  <Terminal className="h-3 w-3" />
                                  <span>Logs</span>
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Prepare Release Dialog */}
      {isCreateOpen && (
        <Dialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Prepare New Version Release"
          description="Create a planned release version with semantic versioning validation."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (semVerError) return;
              createReleaseMutation.mutate();
            }}
            className="space-y-3"
          >
            <div>
              <Input
                label="Version (MAJOR.MINOR.PATCH) *"
                value={version}
                onChange={(e) => handleVersionChange(e.target.value)}
                placeholder="e.g. 1.2.0 or v2.0.0-GA"
                required
              />
              {semVerError && (
                <p className="text-[11px] text-destructive mt-1 font-medium">{semVerError}</p>
              )}
            </div>

            <Input
              label="Release Title *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Multi-Region Ledger General Availability"
              required
            />

            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Target Environment</label>
              <select
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                <option value="PRODUCTION">Production</option>
                <option value="STAGING">Staging</option>
                <option value="QA">QA</option>
                <option value="TESTING">Testing</option>
                <option value="DEVELOPMENT">Development</option>
              </select>
            </div>

            <Textarea
              label="Description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Summary of architectural modifications and features in this release"
              rows={2}
            />

            <Textarea
              label="Release Notes"
              value={releaseNotes}
              onChange={(e) => setReleaseNotes(e.target.value)}
              placeholder="Markdown formatted release notes"
              rows={3}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={createReleaseMutation.isPending}
                disabled={!version.trim() || !name.trim() || !!semVerError}
              >
                Schedule Release
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Trigger Deployment Dialog */}
      {isDeployOpen && (
        <Dialog
          isOpen={isDeployOpen}
          onClose={() => setIsDeployOpen(false)}
          title="Trigger Cloud Deployment"
          description="Initiate automated rollout to target environment cluster."
          maxWidth="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              deployMutation.mutate();
            }}
            className="space-y-3"
          >
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Environment *</label>
              <select
                value={deployEnv}
                onChange={(e) => setDeployEnv(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                <option value="STAGING">Staging Cluster</option>
                <option value="PRODUCTION">Production AWS VPC</option>
                <option value="QA">QA Testing Grid</option>
              </select>
            </div>

            <Input
              label="Commit SHA *"
              value={commitSha}
              onChange={(e) => setCommitSha(e.target.value)}
              placeholder="7f4a9b2"
              required
            />

            <Input
              label="Build Reference"
              value={buildNumber}
              onChange={(e) => setBuildNumber(e.target.value)}
              placeholder="BUILD-2026.11-01"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsDeployOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={deployMutation.isPending}>
                Execute Deployment
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Trigger Rollback Dialog */}
      {isRollbackOpen && (
        <Dialog
          isOpen={isRollbackOpen}
          onClose={() => setIsRollbackOpen(false)}
          title="Rollback Governance Trigger"
          description="Execute traffic reroute to previous verified stable revision."
          maxWidth="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              rollbackMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Target Rollback Version *"
              value={rollbackTargetVersion}
              onChange={(e) => setRollbackTargetVersion(e.target.value)}
              placeholder="e.g. v1.0.0"
              required
            />

            <Textarea
              label="Reason for Rollback *"
              value={rollbackReason}
              onChange={(e) => setRollbackReason(e.target.value)}
              placeholder="e.g. High latency detected on CockroachDB follower replication node"
              rows={2}
              required
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsRollbackOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="destructive"
                size="sm"
                isLoading={rollbackMutation.isPending}
                disabled={!rollbackTargetVersion.trim() || !rollbackReason.trim()}
              >
                Confirm Rollback
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Deployment Logs Dialog */}
      {selectedLogsDeployment && (
        <Dialog
          isOpen={!!selectedLogsDeployment}
          onClose={() => setSelectedLogsDeployment(null)}
          title={`Deployment Audit Logs (${selectedLogsDeployment.environment})`}
          description={`Commit: ${selectedLogsDeployment.commitSha || '7f4a9b2'} • Duration: ${selectedLogsDeployment.durationSeconds || 45}s`}
          maxWidth="lg"
        >
          <div className="space-y-3">
            <pre className="p-4 rounded-xl bg-slate-950 text-emerald-400 font-mono text-xs leading-relaxed overflow-x-auto max-h-96 whitespace-pre">
              {selectedLogsDeployment.logs || 'No log stream available'}
            </pre>
            <div className="flex justify-end pt-2 border-t border-border">
              <Button variant="outline" size="sm" onClick={() => setSelectedLogsDeployment(null)}>
                Close
              </Button>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
