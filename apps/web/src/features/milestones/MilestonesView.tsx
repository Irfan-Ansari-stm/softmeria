'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import {
  Flag,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  FolderKanban,
  User,
  CheckSquare,
  Trash2,
  Edit,
  ArrowRight,
  ExternalLink,
  Target,
  Calendar,
  Layers,
  ChevronRight
} from 'lucide-react';

interface MilestonesViewProps {
  projectId?: string;
}

export function MilestonesView({ projectId }: MilestonesViewProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace } = useAuthStore();

  const [selectedProjectId, setSelectedProjectId] = useState<string>(projectId || 'ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [search, setSearch] = useState('');

  // Modals
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [selectedMilestone, setSelectedMilestone] = useState<any | null>(null);

  // Form State
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formProjectId, setFormProjectId] = useState(projectId || '');
  const [formOwnerId, setFormOwnerId] = useState('');
  const [formStartDate, setFormStartDate] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formPriority, setFormPriority] = useState('MEDIUM');
  const [formStatus, setFormStatus] = useState('PLANNED');
  const [formTaskIds, setFormTaskIds] = useState<string[]>([]);

  // 1. Fetch Workspace Projects
  const { data: rawProjects = [] } = useQuery({
    queryKey: ['workspace-projects-selector', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/projects?workspaceId=${currentWorkspace.id}`);
      return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.projects) ? res.data.projects : [];
    },
    enabled: !!currentWorkspace?.id
  });

  const projects = Array.isArray(rawProjects) ? rawProjects : [];

  // 2. Fetch Milestones
  const { data: rawMilestones = [], isLoading } = useQuery({
    queryKey: ['milestones-view', currentWorkspace?.id, selectedProjectId],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const projParam = selectedProjectId !== 'ALL' ? `?projectId=${selectedProjectId}` : `?workspaceId=${currentWorkspace.id}`;
      const res = await api.get<any[]>(`/milestones${projParam}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!currentWorkspace?.id
  });

  const milestones = Array.isArray(rawMilestones) ? rawMilestones : [];

  // 3. Fetch Tasks for Linking (if project selected in form)
  const activeFormProject = formProjectId || (projects[0]?.id ?? '');
  const { data: rawTasks = [] } = useQuery({
    queryKey: ['tasks', activeFormProject],
    queryFn: async () => {
      if (!activeFormProject) return [];
      const res = await api.get<any>(`/tasks?projectId=${activeFormProject}`);
      return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.tasks) ? res.data.tasks : [];
    },
    enabled: !!activeFormProject && isCreateOpen
  });

  const projectTasks = Array.isArray(rawTasks) ? rawTasks : [];

  // KPI Calculations
  const stats = useMemo(() => {
    const total = milestones.length;
    const completed = milestones.filter((m: any) => m.status === 'COMPLETED').length;
    const inProgress = milestones.filter((m: any) => m.status === 'IN_PROGRESS').length;
    const atRisk = milestones.filter((m: any) => m.status === 'AT_RISK' || m.status === 'DELAYED').length;
    const overdue = milestones.filter((m: any) => m.isOverdue).length;
    const avgProgress = total > 0 ? Math.round(milestones.reduce((acc: number, m: any) => acc + (m.completionPercentage || 0), 0) / total) : 0;

    return { total, completed, inProgress, atRisk, overdue, avgProgress };
  }, [milestones]);

  // Mutations
  const createOrUpdateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        projectId: formProjectId || projects[0]?.id,
        name: formName,
        description: formDesc,
        ownerId: formOwnerId || null,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        targetDate: formTargetDate ? new Date(formTargetDate).toISOString() : null,
        priority: formPriority,
        status: formStatus,
        taskIds: formTaskIds
      };

      if (editingMilestoneId) {
        const res = await api.put(`/milestones/${editingMilestoneId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/milestones', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones-view'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setIsCreateOpen(false);
      resetForm();
    }
  });

  const deleteMilestoneMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/milestones/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones-view'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
      setSelectedMilestone(null);
    }
  });

  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, newStatus }: { id: string; newStatus: string }) => {
      const res = await api.patch(`/milestones/${id}`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['milestones-view'] });
      queryClient.invalidateQueries({ queryKey: ['roadmap'] });
      queryClient.invalidateQueries({ queryKey: ['calendar-events'] });
    }
  });

  const resetForm = () => {
    setEditingMilestoneId(null);
    setFormName('');
    setFormDesc('');
    setFormProjectId(projectId || (projects[0]?.id ?? ''));
    setFormOwnerId('');
    setFormStartDate(new Date().toISOString().split('T')[0]);
    setFormTargetDate(new Date(Date.now() + 30 * 86400000).toISOString().split('T')[0]);
    setFormPriority('MEDIUM');
    setFormStatus('PLANNED');
    setFormTaskIds([]);
  };

  const openEditModal = (m: any) => {
    setEditingMilestoneId(m.id);
    setFormName(m.name);
    setFormDesc(m.description || '');
    setFormProjectId(m.projectId);
    setFormOwnerId(m.ownerId || '');
    setFormStartDate(m.startDate ? new Date(m.startDate).toISOString().split('T')[0] : '');
    setFormTargetDate(m.targetDate ? new Date(m.targetDate).toISOString().split('T')[0] : '');
    setFormPriority(m.priority || 'MEDIUM');
    setFormStatus(m.status || 'PLANNED');
    setFormTaskIds((m.tasks || []).map((t: any) => t.id));
    setSelectedMilestone(null);
    setIsCreateOpen(true);
  };

  const filteredMilestones = useMemo(() => {
    return milestones.filter((m: any) => {
      if (statusFilter !== 'ALL' && m.status !== statusFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = m.name?.toLowerCase().includes(query);
        const matchDesc = m.description?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [milestones, statusFilter, search]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">In Progress</Badge>;
      case 'AT_RISK':
        return <Badge variant="warning">At Risk</Badge>;
      case 'DELAYED':
        return <Badge variant="danger">Delayed</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Flag className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Delivery Gate Milestones</h1>
            <p className="text-xs text-foreground-muted">
              Strategic delivery commitments, phase-gate approvals, and synchronized cross-project milestones
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setIsCreateOpen(true);
          }}
          className="text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Milestone</span>
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3.5">
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] text-foreground-muted block font-medium">Total Gates</span>
          <span className="text-xl font-bold font-mono text-foreground">{stats.total}</span>
        </Card>
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] text-foreground-muted block font-medium">Completed</span>
          <span className="text-xl font-bold font-mono text-success">{stats.completed}</span>
        </Card>
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] text-foreground-muted block font-medium">In Progress</span>
          <span className="text-xl font-bold font-mono text-primary">{stats.inProgress}</span>
        </Card>
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] text-foreground-muted block font-medium">At Risk</span>
          <span className="text-xl font-bold font-mono text-warning">{stats.atRisk}</span>
        </Card>
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] text-foreground-muted block font-medium">Overdue</span>
          <span className="text-xl font-bold font-mono text-destructive">{stats.overdue}</span>
        </Card>
        <Card className="p-3.5 space-y-1">
          <span className="text-[11px] text-foreground-muted block font-medium">Avg Completion</span>
          <span className="text-xl font-bold font-mono text-foreground">{stats.avgProgress}%</span>
        </Card>
      </div>

      {/* Controls & Filter Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[200px]">
            <Search className="absolute left-2.5 top-2.5 h-3.5 w-3.5 text-foreground-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search milestones..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          <select
            value={selectedProjectId}
            onChange={(e) => setSelectedProjectId(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="ALL">All Projects</option>
            {projects.map((p: any) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="PLANNED">Planned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="AT_RISK">At Risk</option>
            <option value="COMPLETED">Completed</option>
          </select>
        </div>

        <span className="text-xs text-foreground-muted font-medium px-2">
          {filteredMilestones.length} milestones
        </span>
      </div>

      {/* Milestone Cards Grid */}
      {isLoading ? (
        <div className="py-20 text-center text-foreground-muted">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading delivery gates...</p>
        </div>
      ) : filteredMilestones.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card">
          <Flag className="h-8 w-8 text-foreground-muted mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No milestones found</h3>
          <p className="text-xs text-foreground-muted mt-1">Create a milestone to establish formal phase gates.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredMilestones.map((m: any) => (
            <Card
              key={m.id}
              onClick={() => setSelectedMilestone(m)}
              className="p-5 space-y-4 hover:border-primary/50 transition-all shadow-xs cursor-pointer hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block font-mono">
                      {m.project?.name || 'Project'}
                    </span>
                    <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                      {m.name}
                    </h3>
                  </div>
                  {getStatusBadge(m.status)}
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">
                  {m.description || 'Strategic milestone gate with linked task acceptance criteria.'}
                </p>

                {/* Progress bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px] font-mono">
                    <span className="text-foreground-muted">Completion</span>
                    <span className="font-bold text-foreground">{m.completionPercentage || 0}%</span>
                  </div>
                  <Progress value={m.completionPercentage || 0} size="sm" className="h-1.5" />
                </div>

                {/* Date & Linked Tasks */}
                <div className="flex items-center justify-between pt-2 border-t border-border/60 text-xs">
                  <span className="text-foreground-muted flex items-center gap-1 font-mono text-[11px]">
                    <Calendar className="h-3 w-3" />
                    {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'No date'}
                  </span>
                  <span className="text-foreground-muted flex items-center gap-1 font-mono text-[11px]">
                    <CheckSquare className="h-3 w-3 text-primary" />
                    {m.completedTaskCount || 0}/{m.taskCount || 0} tasks
                  </span>
                </div>
              </div>

              {/* Card Footer */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:underline">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={() => openEditModal(m)}
                    className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-secondary"
                    title="Edit milestone"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deleteMilestoneMutation.mutate(m.id)}
                    className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10"
                    title="Delete milestone"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Milestone Details Modal */}
      {selectedMilestone && (
        <Dialog
          isOpen={!!selectedMilestone}
          onClose={() => setSelectedMilestone(null)}
          title={selectedMilestone.name}
          size="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-border">
              <div className="flex items-center gap-2">
                {getStatusBadge(selectedMilestone.status)}
                <span className="text-xs font-mono text-foreground-muted">
                  Project: {selectedMilestone.project?.name}
                </span>
              </div>
              <div className="text-xs font-mono font-semibold text-foreground">
                Target: {selectedMilestone.targetDate ? new Date(selectedMilestone.targetDate).toLocaleDateString() : 'None'}
              </div>
            </div>

            {selectedMilestone.description && (
              <p className="text-xs text-foreground bg-background p-3 rounded-lg border border-border leading-relaxed">
                {selectedMilestone.description}
              </p>
            )}

            {/* Linked Tasks */}
            <div className="space-y-2">
              <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                Linked Tasks ({(selectedMilestone.tasks || []).length})
              </span>

              <div className="max-h-56 overflow-y-auto space-y-1.5 border border-border rounded-lg p-2 bg-background">
                {(selectedMilestone.tasks || []).length === 0 ? (
                  <p className="text-xs text-foreground-muted italic py-4 text-center">No tasks linked</p>
                ) : (
                  (selectedMilestone.tasks || []).map((t: any) => (
                    <div
                      key={t.id}
                      className="flex items-center justify-between p-2 rounded bg-card border border-border text-xs"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="font-mono font-bold text-primary">{t.taskIdentifier}</span>
                        <span className="truncate text-foreground font-medium">{t.title}</span>
                      </div>
                      <Badge variant={t.status === 'DONE' ? 'success' : 'outline'} className="text-[10px]">
                        {t.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => deleteMilestoneMutation.mutate(selectedMilestone.id)}
                className="text-xs text-destructive hover:bg-destructive/10"
              >
                <Trash2 className="h-3.5 w-3.5 mr-1" />
                Delete
              </Button>

              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => openEditModal(selectedMilestone)} className="text-xs">
                  <Edit className="h-3.5 w-3.5 mr-1" />
                  Edit
                </Button>
                <Button variant="primary" size="sm" onClick={() => setSelectedMilestone(null)} className="text-xs">
                  Close
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}

      {/* Create / Edit Milestone Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingMilestoneId(null);
        }}
        title={editingMilestoneId ? 'Edit Delivery Gate Milestone' : 'Create Delivery Gate Milestone'}
        size="md"
      >
        <div className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Milestone Name *</label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. M2: Zero-Loss Transactional Ledger Sign-Off"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Project</label>
            <select
              value={formProjectId}
              onChange={(e) => setFormProjectId(e.target.value)}
              className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
            >
              {projects.map((p: any) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <Textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Exit criteria, sign-off parties, or audit requirements..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Start Date</label>
              <Input
                type="date"
                value={formStartDate}
                onChange={(e) => setFormStartDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Gate Date</label>
              <Input
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
                className="text-xs h-8"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Status</label>
              <select
                value={formStatus}
                onChange={(e) => setFormStatus(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="AT_RISK">At Risk</option>
                <option value="COMPLETED">Completed</option>
                <option value="DELAYED">Delayed</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Priority</label>
              <select
                value={formPriority}
                onChange={(e) => setFormPriority(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          {/* Link Project Tasks */}
          {projectTasks.length > 0 && (
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Link Tasks ({formTaskIds.length} selected)
              </label>
              <div className="max-h-32 overflow-y-auto border border-border rounded-lg p-2 space-y-1 bg-background text-xs">
                {projectTasks.map((t: any) => {
                  const isChecked = formTaskIds.includes(t.id);
                  return (
                    <div
                      key={t.id}
                      onClick={() => {
                        if (isChecked) setFormTaskIds(formTaskIds.filter((id) => id !== t.id));
                        else setFormTaskIds([...formTaskIds, t.id]);
                      }}
                      className="flex items-center justify-between p-1 rounded hover:bg-secondary cursor-pointer"
                    >
                      <span className="truncate max-w-[280px]">
                        {t.taskIdentifier}: {t.title}
                      </span>
                      <input type="checkbox" checked={isChecked} readOnly className="rounded border-border text-primary" />
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingMilestoneId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!formName.trim() || createOrUpdateMutation.isPending}
              isLoading={createOrUpdateMutation.isPending}
              onClick={() => createOrUpdateMutation.mutate()}
            >
              {editingMilestoneId ? 'Save Changes' : 'Create Milestone'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
