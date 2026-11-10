'use client';

import React, { useState } from 'react';
import {
  Users,
  UserPlus,
  Shield,
  Trash2,
  Mail,
  CheckCircle2,
  Clock,
  Ban,
  RotateCcw,
  Copy,
  Check,
  FolderKanban,
  Search,
  Filter,
  UserCheck,
  Building,
  Briefcase,
  AlertTriangle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { WORKSPACE_ROLES } from '@devblueprint/shared';

export function TeamManagementView() {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useAuthStore();
  const workspaceId = currentWorkspace?.id;

  // Active Tab
  const [activeTab, setActiveTab] = useState<'members' | 'invitations' | 'projects'>('members');

  // Search & Filters
  const [searchMember, setSearchMember] = useState('');
  const [roleFilter, setRoleFilter] = useState('ALL');
  const [selectedProjectId, setSelectedProjectId] = useState<string>('');

  // Dialog State
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EDITOR');
  const [inviteTitle, setInviteTitle] = useState('');
  const [inviteDepartment, setInviteDepartment] = useState('');
  const [inviteError, setInviteError] = useState<string | null>(null);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Assign to project modal
  const [isAssignOpen, setIsAssignOpen] = useState(false);
  const [assignUserId, setAssignUserId] = useState('');
  const [assignProjectRole, setAssignProjectRole] = useState('CONTRIBUTOR');

  // 1. Fetch Workspace Members
  const {
    data: members = [],
    isLoading: isMembersLoading,
    refetch: refetchMembers
  } = useQuery({
    queryKey: ['workspace-members', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get<any[]>(`/workspaces/${workspaceId}/members`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // 2. Fetch Team Stats
  const { data: teamStats } = useQuery({
    queryKey: ['workspace-team-stats', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const res = await api.get<any>(`/workspaces/${workspaceId}/team-stats`);
      return res.data;
    },
    enabled: !!workspaceId
  });

  // 3. Fetch Invitations
  const {
    data: invitations = [],
    isLoading: isInvitationsLoading,
    refetch: refetchInvitations
  } = useQuery({
    queryKey: ['workspace-invitations', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get<any[]>(`/workspaces/${workspaceId}/invitations`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // 4. Fetch Projects
  const { data: projects = [] } = useQuery({
    queryKey: ['workspace-projects-team', workspaceId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const res = await api.get<any>(`/projects?workspaceId=${workspaceId}`);
      return res.data?.projects || res.data || [];
    },
    enabled: !!workspaceId
  });

  // Active Project Selection helper
  const currentProject = projects.find((p: any) => p.id === (selectedProjectId || projects[0]?.id));

  // 5. Fetch Project Members
  const activeProjectId = currentProject?.id;
  const { data: projectMembers = [], refetch: refetchProjectMembers } = useQuery({
    queryKey: ['project-members', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return [];
      const res = await api.get<any[]>(`/workspaces/${workspaceId}/projects/${activeProjectId}/members`);
      return res.data || [];
    },
    enabled: !!activeProjectId && !!workspaceId
  });

  // Mutations
  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/workspaces/${workspaceId}/members`, {
        email: inviteEmail.trim(),
        role: inviteRole,
        title: inviteTitle.trim() || undefined,
        department: inviteDepartment.trim() || undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setInviteEmail('');
      setInviteTitle('');
      setInviteDepartment('');
      setIsInviteOpen(false);
      setInviteError(null);
      refetchMembers();
      refetchInvitations();
      queryClient.invalidateQueries({ queryKey: ['workspace-team-stats'] });
    },
    onError: (err: any) => {
      setInviteError(err.message || 'Failed to send workspace invitation');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await api.put(`/workspaces/${workspaceId}/members/${memberId}`, { role });
      return res.data;
    },
    onSuccess: () => {
      refetchMembers();
      queryClient.invalidateQueries({ queryKey: ['workspace-team-stats'] });
    }
  });

  const toggleStatusMutation = useMutation({
    mutationFn: async ({ memberId, status }: { memberId: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
      const res = await api.patch(`/workspaces/${workspaceId}/members/${memberId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      refetchMembers();
      queryClient.invalidateQueries({ queryKey: ['workspace-team-stats'] });
    }
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await api.delete(`/workspaces/${workspaceId}/members/${memberId}`);
      return res.data;
    },
    onSuccess: () => {
      refetchMembers();
      queryClient.invalidateQueries({ queryKey: ['workspace-team-stats'] });
    }
  });

  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.delete(`/workspaces/${workspaceId}/invitations/${invitationId}`);
      return res.data;
    },
    onSuccess: () => {
      refetchInvitations();
      queryClient.invalidateQueries({ queryKey: ['workspace-team-stats'] });
    }
  });

  const resendInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      const res = await api.post(`/workspaces/${workspaceId}/invitations/${invitationId}/resend`, {});
      return res.data;
    },
    onSuccess: () => refetchInvitations()
  });

  const assignProjectMemberMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/workspaces/${workspaceId}/projects/${activeProjectId}/members`, {
        userId: assignUserId,
        role: assignProjectRole
      });
      return res.data;
    },
    onSuccess: () => {
      setIsAssignOpen(false);
      refetchProjectMembers();
      refetchMembers();
    }
  });

  const removeProjectMemberMutation = useMutation({
    mutationFn: async (userId: string) => {
      const res = await api.delete(`/workspaces/${workspaceId}/projects/${activeProjectId}/members/${userId}`);
      return res.data;
    },
    onSuccess: () => {
      refetchProjectMembers();
      refetchMembers();
    }
  });

  // Filtered members
  const filteredMembers = members.filter((m: any) => {
    const matchesSearch =
      m.name?.toLowerCase().includes(searchMember.toLowerCase()) ||
      m.email?.toLowerCase().includes(searchMember.toLowerCase());
    const matchesRole = roleFilter === 'ALL' || m.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCopyInviteLink = (token: string) => {
    const inviteUrl = `${window.location.origin}/invite?token=${token}`;
    navigator.clipboard.writeText(inviteUrl);
    setCopiedToken(token);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 min-w-0">
      {/* 1. Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Users className="h-6 w-6 text-primary" />
            <span>Workspace Team & Access Control</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage engineering permissions, assign project roles, and track invitation lifecycles.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          className="text-xs gap-1.5 shadow-sm"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Invite Team Member</span>
        </Button>
      </div>

      {/* 2. Team Telemetry Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Total Members
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                {teamStats?.totalMembers ?? members.length}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Across {projects.length} workspace projects
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Users className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Active Seats
              </p>
              <h3 className="text-2xl font-bold text-success mt-1 font-mono">
                {teamStats?.activeMembers ?? members.filter((m: any) => m.status === 'ACTIVE').length}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {teamStats?.suspendedMembers ?? 0} suspended accounts
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 shadow-xs">
              <UserCheck className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Pending Invites
              </p>
              <h3 className="text-2xl font-bold text-amber-500 mt-1 font-mono">
                {teamStats?.pendingInvitations ?? invitations.filter((i: any) => i.status === 'PENDING').length}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Tokens valid for 7 days
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
              <Mail className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Role Governance
              </p>
              <div className="flex items-center gap-1.5 mt-2 flex-wrap">
                <Badge variant="destructive" className="text-[10px] font-mono">
                  {teamStats?.roleDistribution?.owners ?? 1} Owner
                </Badge>
                <Badge variant="warning" className="text-[10px] font-mono">
                  {teamStats?.roleDistribution?.admins ?? 1} Admin
                </Badge>
                <Badge variant="info" className="text-[10px] font-mono">
                  {teamStats?.roleDistribution?.editors ?? 7} Editors
                </Badge>
              </div>
            </div>
            <div className="h-10 w-10 rounded-xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500 shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('members')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'members'
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <Users className="h-4 w-4" />
          <span>Active Roster ({members.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('invitations')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'invitations'
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <Mail className="h-4 w-4" />
          <span>Invitations ({invitations.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('projects')}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
            activeTab === 'projects'
              ? 'bg-primary text-white shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <FolderKanban className="h-4 w-4" />
          <span>Project Assignments</span>
        </button>
      </div>

      {/* 4. TAB 1: Members Roster */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="relative w-full sm:w-72">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <Input
                value={searchMember}
                onChange={(e) => setSearchMember(e.target.value)}
                placeholder="Search by name or email..."
                className="pl-8 h-8 text-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
              >
                <option value="ALL">All Roles</option>
                {WORKSPACE_ROLES.map((r) => (
                  <option key={r} value={r}>
                    {r}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">
                Active Members ({isMembersLoading ? 'Loading...' : filteredMembers.length})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {isMembersLoading ? (
                <div className="p-8 text-center text-xs text-foreground-muted">
                  <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                  <span>Loading team roster...</span>
                </div>
              ) : filteredMembers.length === 0 ? (
                <div className="p-12 text-center text-xs text-foreground-muted">
                  No matching team members found.
                </div>
              ) : (
                filteredMembers.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-background-secondary/40 transition-colors"
                  >
                    {/* User profile */}
                    <div className="flex items-center gap-3">
                      {m.avatarUrl ? (
                        <img
                          src={m.avatarUrl}
                          alt={m.name}
                          className="h-10 w-10 rounded-full object-cover border border-border shadow-xs shrink-0"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-xs shrink-0">
                          {m.name?.charAt(0) || 'U'}
                        </div>
                      )}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-foreground">{m.name}</span>
                          {m.userId === user?.id && (
                            <Badge variant="outline" className="text-[9px] py-0">
                              You
                            </Badge>
                          )}
                          <Badge
                            variant={m.status === 'ACTIVE' ? 'success' : 'destructive'}
                            className="text-[9px] py-0"
                          >
                            {m.status || 'ACTIVE'}
                          </Badge>
                        </div>
                        <p className="text-[11px] text-foreground-muted font-mono flex items-center gap-1.5 mt-0.5">
                          <Mail className="h-3 w-3 text-foreground-muted" />
                          <span>{m.email}</span>
                        </p>
                        <div className="flex items-center gap-3 text-[10px] text-foreground-muted mt-1">
                          <span>{m.assignedProjectCount ?? 4} Projects</span>
                          <span>•</span>
                          <span>{m.assignedTaskCount ?? 0} Tasks Assigned</span>
                          {m.department && (
                            <>
                              <span>•</span>
                              <span>{m.department}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Role & Actions */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <select
                        value={m.role}
                        onChange={(e) =>
                          updateRoleMutation.mutate({
                            memberId: m.id,
                            role: e.target.value
                          })
                        }
                        disabled={m.role === 'OWNER' || m.userId === user?.id}
                        className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground font-medium focus:ring-1 focus:ring-primary disabled:opacity-50 shadow-xs"
                      >
                        {WORKSPACE_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {r}
                          </option>
                        ))}
                      </select>

                      {m.role !== 'OWNER' && m.userId !== user?.id && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() =>
                              toggleStatusMutation.mutate({
                                memberId: m.id,
                                status: m.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE'
                              })
                            }
                            className={`h-8 text-xs ${
                              m.status === 'ACTIVE' ? 'hover:text-destructive' : 'text-emerald-500'
                            }`}
                            title={m.status === 'ACTIVE' ? 'Suspend Seat' : 'Reactivate Seat'}
                          >
                            {m.status === 'ACTIVE' ? <Ban className="h-3.5 w-3.5" /> : <RotateCcw className="h-3.5 w-3.5" />}
                          </Button>

                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => removeMemberMutation.mutate(m.id)}
                            className="h-8 text-xs text-destructive hover:bg-destructive/10"
                            title="Remove Member"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* 5. TAB 2: Invitations */}
      {activeTab === 'invitations' && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Workspace Invitations ({invitations.length})
              </CardTitle>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Track pending invites, share direct onboarding links, and cancel revoked offers.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsInviteOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Send New Invite</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {isInvitationsLoading ? (
              <div className="p-8 text-center text-xs text-foreground-muted">
                <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                <span>Loading invitations...</span>
              </div>
            ) : invitations.length === 0 ? (
              <div className="p-12 text-center text-xs text-foreground-muted space-y-2">
                <Mail className="h-8 w-8 text-foreground-muted mx-auto opacity-50" />
                <p>No active or pending invitations.</p>
              </div>
            ) : (
              invitations.map((inv: any) => (
                <div
                  key={inv.id}
                  className="p-4 flex items-center justify-between hover:bg-background-secondary/40 transition-colors text-xs"
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-foreground">{inv.email}</span>
                      <Badge variant="info" className="text-[10px]">
                        {inv.role}
                      </Badge>
                      <Badge
                        variant={
                          inv.status === 'PENDING'
                            ? 'warning'
                            : inv.status === 'ACCEPTED'
                            ? 'success'
                            : 'destructive'
                        }
                        className="text-[10px]"
                      >
                        {inv.status}
                      </Badge>
                    </div>
                    <p className="text-[11px] text-foreground-muted mt-0.5">
                      Invited {new Date(inv.createdAt).toLocaleDateString()} by{' '}
                      {inv.invitedBy?.name || 'Administrator'} • Expires{' '}
                      {new Date(inv.expiresAt).toLocaleDateString()}
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                    {inv.status === 'PENDING' && (
                      <>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleCopyInviteLink(inv.token)}
                          className="h-8 text-xs gap-1.5"
                        >
                          {copiedToken === inv.token ? (
                            <>
                              <Check className="h-3.5 w-3.5 text-emerald-500" />
                              <span>Copied Link!</span>
                            </>
                          ) : (
                            <>
                              <Copy className="h-3.5 w-3.5" />
                              <span>Copy Link</span>
                            </>
                          )}
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => resendInvitationMutation.mutate(inv.id)}
                          className="h-8 text-xs"
                          title="Resend Invite"
                        >
                          <RotateCcw className="h-3.5 w-3.5" />
                        </Button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => cancelInvitationMutation.mutate(inv.id)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10"
                          title="Cancel Invite"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. TAB 3: Project Permissions & Roster */}
      {activeTab === 'projects' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4 bg-card p-4 rounded-xl border border-border shadow-xs">
            <div className="flex items-center gap-3">
              <FolderKanban className="h-5 w-5 text-primary" />
              <div>
                <span className="text-xs font-semibold text-foreground">Select Project:</span>
                <select
                  value={activeProjectId}
                  onChange={(e) => setSelectedProjectId(e.target.value)}
                  className="ml-2 px-2.5 py-1 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
                >
                  {projects.map((p: any) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAssignOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <UserPlus className="h-3.5 w-3.5" />
              <span>Assign Member to Project</span>
            </Button>
          </div>

          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border">
              <CardTitle className="text-sm font-semibold text-foreground">
                Project Team ({projectMembers.length} Members in {currentProject?.name})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {projectMembers.length === 0 ? (
                <div className="p-12 text-center text-xs text-foreground-muted">
                  No dedicated members explicitly assigned to this project yet.
                </div>
              ) : (
                projectMembers.map((pm: any) => (
                  <div
                    key={pm.id}
                    className="p-4 flex items-center justify-between hover:bg-background-secondary/40 transition-colors text-xs"
                  >
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shadow-xs">
                        {pm.user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div>
                        <span className="font-bold text-foreground">{pm.user?.fullName}</span>
                        <p className="text-[11px] text-foreground-muted font-mono">{pm.user?.email}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Badge variant="outline" className="text-[10px]">
                        {pm.role}
                      </Badge>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeProjectMemberMutation.mutate(pm.userId)}
                        className="h-8 text-xs text-destructive hover:bg-destructive/10"
                        title="Remove from project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* DIALOG 1: Invite Member Modal */}
      <Dialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Member to Workspace"
        description="Send an invitation with a secure token to onboard an engineer or collaborator."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Email Address
            </label>
            <Input
              type="email"
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="engineer@devblueprint.io"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
            >
              {WORKSPACE_ROLES.map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Job Title (Optional)
              </label>
              <Input
                value={inviteTitle}
                onChange={(e) => setInviteTitle(e.target.value)}
                placeholder="Senior Architect"
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Department (Optional)
              </label>
              <Input
                value={inviteDepartment}
                onChange={(e) => setInviteDepartment(e.target.value)}
                placeholder="Infrastructure"
                className="h-8 text-xs"
              />
            </div>
          </div>

          {inviteError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{inviteError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => inviteMutation.mutate()}
              disabled={!inviteEmail.trim()}
              className="text-xs shadow-xs"
            >
              Send Invitation
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 2: Assign Project Member Modal */}
      <Dialog
        isOpen={isAssignOpen}
        onClose={() => setIsAssignOpen(false)}
        title="Assign Member to Project"
        description={`Add an existing workspace member to ${currentProject?.name}`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Select Member
            </label>
            <select
              value={assignUserId}
              onChange={(e) => setAssignUserId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
            >
              <option value="">Select team member...</option>
              {members.map((m: any) => (
                <option key={m.userId} value={m.userId}>
                  {m.name} ({m.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Project Role
            </label>
            <select
              value={assignProjectRole}
              onChange={(e) => setAssignProjectRole(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
            >
              <option value="MAINTAINER">Maintainer</option>
              <option value="CONTRIBUTOR">Contributor</option>
              <option value="REVIEWER">Reviewer</option>
              <option value="OBSERVER">Observer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAssignOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => assignProjectMemberMutation.mutate()}
              disabled={!assignUserId}
              className="text-xs"
            >
              Assign to Project
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
