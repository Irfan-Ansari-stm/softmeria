'use client';

import React, { useState } from 'react';
import { Users, UserPlus, Shield, Trash2, Mail, CheckCircle } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { WORKSPACE_ROLES } from '@devblueprint/shared';

export function TeamManagementView() {
  const { currentWorkspace, user } = useAuthStore();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('EDITOR');
  const [inviteError, setInviteError] = useState<string | null>(null);

  const { data: members = [], refetch } = useQuery({
    queryKey: ['workspace-members', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any[]>(`/workspaces/${currentWorkspace.id}/members`);
      return res.data || [];
    },
    enabled: !!currentWorkspace?.id
  });

  const inviteMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/workspaces/${currentWorkspace!.id}/members`, {
        email: inviteEmail,
        role: inviteRole
      });
      return res.data;
    },
    onSuccess: () => {
      setInviteEmail('');
      setIsInviteOpen(false);
      setInviteError(null);
      refetch();
    },
    onError: (err: any) => {
      setInviteError(err.message || 'Failed to invite member');
    }
  });

  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const res = await api.put(
        `/workspaces/${currentWorkspace!.id}/members/${memberId}`,
        { role }
      );
      return res.data;
    },
    onSuccess: () => refetch()
  });

  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      const res = await api.delete(
        `/workspaces/${currentWorkspace!.id}/members/${memberId}`
      );
      return res.data;
    },
    onSuccess: () => refetch()
  });

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'OWNER':
        return 'danger';
      case 'ADMIN':
        return 'warning';
      case 'EDITOR':
        return 'info';
      default:
        return 'outline';
    }
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2.5">
            <Users className="h-6 w-6 text-indigo-500" />
            <span>Workspace Team & Access Control</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Manage engineering permissions and collaborate on blueprints across your organization.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          className="text-xs gap-1.5"
        >
          <UserPlus className="h-3.5 w-3.5" />
          <span>Invite Member</span>
        </Button>
      </div>

      {/* Role Explanation Card */}
      <Card className="bg-zinc-900/40 border-zinc-800">
        <CardContent className="p-4 grid grid-cols-2 md:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="font-semibold text-rose-400">Owner</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Root control over billing, security, and workspace deletion.
            </p>
          </div>
          <div>
            <span className="font-semibold text-amber-400">Admin</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Manage projects, invite members, and configure blueprints.
            </p>
          </div>
          <div>
            <span className="font-semibold text-blue-400">Editor</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Create and edit documents, submit reviews, and export.
            </p>
          </div>
          <div>
            <span className="font-semibold text-zinc-400">Viewer</span>
            <p className="text-[11px] text-zinc-400 mt-0.5">
              Read-only access to published engineering documents.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Members List */}
      <Card>
        <CardHeader className="p-4 pb-2 border-b border-zinc-800/60">
          <CardTitle className="text-sm">Active Members ({members.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0 divide-y divide-zinc-800/60">
          {members.map((m: any) => (
            <div
              key={m.id}
              className="p-4 flex items-center justify-between hover:bg-zinc-800/30 transition-colors"
            >
              <div className="flex items-center gap-3">
                <div className="h-9 w-9 rounded-full bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center font-semibold text-xs text-indigo-300">
                  {m.name.charAt(0)}
                </div>
                <div>
                  <p className="text-xs font-semibold text-zinc-100 flex items-center gap-2">
                    <span>{m.name}</span>
                    {m.userId === user?.id && (
                      <span className="text-[10px] text-zinc-500 font-normal">
                        (You)
                      </span>
                    )}
                  </p>
                  <p className="text-[11px] text-zinc-400 flex items-center gap-1 font-mono">
                    <Mail className="h-3 w-3 text-zinc-500" />
                    <span>{m.email}</span>
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <select
                  value={m.role}
                  onChange={(e) =>
                    updateRoleMutation.mutate({
                      memberId: m.id,
                      role: e.target.value
                    })
                  }
                  disabled={m.role === 'OWNER' || m.userId === user?.id}
                  className="h-8 px-2.5 rounded-md border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-50"
                >
                  {WORKSPACE_ROLES.map((r) => (
                    <option key={r} value={r}>
                      {r}
                    </option>
                  ))}
                </select>

                {m.role !== 'OWNER' && m.userId !== user?.id && (
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => removeMemberMutation.mutate(m.id)}
                    className="p-1 h-8 w-8 text-rose-400 hover:text-rose-300 hover:bg-rose-950/30"
                    title="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Invite Member Dialog */}
      <Dialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Invite Team Member"
        description="Grant access to this workspace and its technical blueprints."
        maxWidth="md"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            inviteMutation.mutate();
          }}
          className="space-y-4"
        >
          {inviteError && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
              {inviteError}
            </div>
          )}

          <Input
            label="User Email Address *"
            type="email"
            value={inviteEmail}
            onChange={(e) => setInviteEmail(e.target.value)}
            placeholder="colleague@company.com"
            required
          />

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-zinc-300">
              Initial Workspace Role
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-9 px-3 rounded-md border border-zinc-800 bg-zinc-950 text-xs text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              {WORKSPACE_ROLES.filter((r) => r !== 'OWNER').map((r) => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-zinc-800">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={inviteMutation.isPending}
              disabled={!inviteEmail.trim()}
            >
              Send Invitation
            </Button>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

