'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import {
  Users,
  Plus,
  Shield,
  Briefcase,
  Mail,
  CheckCircle2,
  AlertTriangle,
  UserCheck
} from 'lucide-react';

interface ProjectTeamViewProps {
  projectId: string;
}

export function ProjectTeamView({ projectId }: ProjectTeamViewProps) {
  const queryClient = useQueryClient();
  const [isInviteOpen, setIsInviteOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('MEMBER');

  // Fetch Project details (including members)
  const { data: project, isLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    }
  });

  // Fetch Tasks to calculate workload per assignee
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/tasks?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const members = project?.members || [];

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            <span>Engineering Team & Resource Allocation</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            Engineers, designers, product owners, and their committed sprint workload.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsInviteOpen(true)}
          className="text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>Add Member</span>
        </Button>
      </div>

      {/* Team Capacity & Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
            Active Engineers
          </span>
          <span className="text-2xl font-bold font-mono text-foreground mt-1 block">
            {members.length > 0 ? members.length : 1}
          </span>
          <span className="text-[11px] text-foreground-muted mt-1 block">100% capacity available</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
            Assigned Workload
          </span>
          <span className="text-2xl font-bold font-mono text-primary mt-1 block">
            {tasks.filter((t: any) => t.assigneeId).length} Tasks
          </span>
          <span className="text-[11px] text-foreground-muted mt-1 block">
            Across active sprints
          </span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card">
          <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
            Unassigned Backlog
          </span>
          <span className="text-2xl font-bold font-mono text-warning mt-1 block">
            {tasks.filter((t: any) => !t.assigneeId).length} Tasks
          </span>
          <span className="text-[11px] text-foreground-muted mt-1 block">Needs engineering triage</span>
        </div>
      </div>

      {/* Members Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {members.map((member: any) => {
          const userTasks = tasks.filter((t: any) => t.assigneeId === member.userId);
          const userPoints = userTasks.reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);
          const user = member.user || {};

          return (
            <Card key={member.id} className="border-border bg-card">
              <CardContent className="p-5 space-y-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-sm shadow-sm">
                      {user.name?.[0] || 'U'}
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-foreground">{user.name || 'Member'}</h4>
                      <span className="text-[11px] text-foreground-muted flex items-center gap-1">
                        <Mail className="h-3 w-3" />
                        {user.email || 'user@devblueprint.io'}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] uppercase font-mono">
                    {member.role || 'Member'}
                  </Badge>
                </div>

                <div className="pt-3 border-t border-border grid grid-cols-2 gap-2 text-xs">
                  <div className="p-2 rounded bg-background-secondary border border-border">
                    <span className="text-[10px] text-foreground-muted block">Tasks Assigned</span>
                    <span className="text-sm font-bold font-mono text-foreground mt-0.5 block">
                      {userTasks.length}
                    </span>
                  </div>
                  <div className="p-2 rounded bg-background-secondary border border-border">
                    <span className="text-[10px] text-foreground-muted block">Story Points</span>
                    <span className="text-sm font-bold font-mono text-primary mt-0.5 block">
                      {userPoints} pts
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Add Member Dialog */}
      <Dialog
        isOpen={isInviteOpen}
        onClose={() => setIsInviteOpen(false)}
        title="Add Engineer to Project"
        size="sm"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              User Email *
            </label>
            <Input
              value={inviteEmail}
              onChange={(e) => setInviteEmail(e.target.value)}
              placeholder="engineer@acme.corp"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Project Role *
            </label>
            <select
              value={inviteRole}
              onChange={(e) => setInviteRole(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
            >
              <option value="OWNER">Owner / Principal</option>
              <option value="ADMIN">Lead Architect / Admin</option>
              <option value="MEMBER">Staff Engineer / Member</option>
              <option value="VIEWER">Stakeholder / Viewer</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsInviteOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                alert(`Invitation sent to ${inviteEmail} as ${inviteRole}`);
                setIsInviteOpen(false);
              }}
            >
              Grant Access
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
