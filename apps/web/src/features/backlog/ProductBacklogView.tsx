'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Plus,
  ListTodo,
  Layers,
  Filter,
  Search,
  CheckCircle2,
  Clock,
  Flame,
  User,
  ChevronDown,
  ChevronRight,
  Sparkles,
  ArrowRight,
  BarChart3,
  CheckSquare,
  AlertCircle
} from 'lucide-react';
import { TaskStatus, TaskPriority, TaskType } from '@devblueprint/types';
import { TaskDetailsModal } from '../tasks/TaskDetailsModal';

interface ProductBacklogViewProps {
  projectId: string;
}

export function ProductBacklogView({ projectId }: ProductBacklogViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'grooming' | 'epics' | 'priority'>('grooming');
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<string>('ALL');
  const [filterPriority, setFilterPriority] = useState<string>('ALL');

  // Create Task Form State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('STORY');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [storyPoints, setStoryPoints] = useState(3);
  const [targetSprintId, setTargetSprintId] = useState<string>('');

  // Fetch Sprints
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/sprints?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Fetch Tasks
  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/tasks?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Assign Task to Sprint Mutation
  const assignSprintMutation = useMutation({
    mutationFn: async ({ taskId, sprintId }: { taskId: string; sprintId: string | null }) => {
      const res = await api.put(`/tasks/${taskId}`, { sprintId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await api.patch(`/tasks/${taskId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    }
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks', {
        projectId,
        title,
        description,
        taskType,
        priority,
        storyPoints: Number(storyPoints),
        sprintId: targetSprintId ? targetSprintId : undefined,
        status: targetSprintId ? 'TODO' : 'BACKLOG'
      });
      return res.data;
    },
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    }
  });

  // Filter tasks based on search, type, and priority
  const filteredTasks = tasks.filter((t: any) => {
    if (filterType !== 'ALL' && t.taskType !== filterType) return false;
    if (filterPriority !== 'ALL' && t.priority !== filterPriority) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        t.title.toLowerCase().includes(q) ||
        (t.taskIdentifier && t.taskIdentifier.toLowerCase().includes(q)) ||
        (t.description && t.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  // Groupings for Grooming View
  const unscheduledBacklog = filteredTasks.filter((t: any) => !t.sprintId);
  const activeSprint = sprints.find((s: any) => s.status === 'ACTIVE');
  const plannedSprints = sprints.filter((s: any) => s.status === 'PLANNED');

  // Metrics
  const totalBacklogPoints = unscheduledBacklog.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);
  const totalProjectPoints = tasks.reduce((sum: number, t: any) => sum + (t.storyPoints || 0), 0);

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'EPIC':
        return <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded uppercase">Epic</span>;
      case 'FEATURE':
      case 'STORY':
        return <span className="text-[10px] font-semibold text-emerald-600 bg-emerald-500/10 px-2 py-0.5 rounded uppercase">Story</span>;
      case 'BUG':
        return <span className="text-[10px] font-semibold text-rose-600 bg-rose-500/10 px-2 py-0.5 rounded uppercase">Bug</span>;
      case 'TECH_DEBT':
        return <span className="text-[10px] font-semibold text-amber-600 bg-amber-500/10 px-2 py-0.5 rounded uppercase">Tech Debt</span>;
      default:
        return <span className="text-[10px] font-medium text-blue-600 bg-blue-500/10 px-2 py-0.5 rounded uppercase">Task</span>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">Urgent</span>;
      case 'HIGH':
        return <span className="text-[10px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium text-primary bg-primary/10 px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[10px] text-foreground-muted bg-secondary px-2 py-0.5 rounded">Low</span>;
    }
  };

  const renderTaskRow = (task: any) => (
    <div
      key={task.id}
      className="p-3.5 rounded-lg border border-border bg-card hover:border-primary/50 transition-all flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs hover:shadow-sm"
    >
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <div className="shrink-0">{getTypeBadge(task.taskType)}</div>
        <span className="font-mono text-xs font-semibold text-primary shrink-0">
          {task.taskIdentifier || 'TSK-01'}
        </span>
        <button
          onClick={() => setSelectedTaskId(task.id)}
          className="text-xs font-semibold text-foreground hover:text-primary transition-colors text-left truncate flex-1 hover:underline"
        >
          {task.title}
        </button>
      </div>

      <div className="flex flex-wrap items-center gap-3 shrink-0">
        {getPriorityBadge(task.priority)}

        <span className="text-[11px] font-mono font-medium px-2 py-0.5 rounded bg-secondary text-foreground-secondary">
          {task.storyPoints || 0} SP
        </span>

        {/* Sprint Assignment Dropdown */}
        <select
          value={task.sprintId || ''}
          onChange={(e) => {
            const val = e.target.value;
            assignSprintMutation.mutate({
              taskId: task.id,
              sprintId: val ? val : null
            });
          }}
          className="h-7 text-[11px] rounded border border-border bg-background px-2 text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
        >
          <option value="">Unscheduled Backlog</option>
          {sprints.map((s: any) => (
            <option key={s.id} value={s.id}>
              {s.name} ({s.status})
            </option>
          ))}
        </select>

        {/* Status Dropdown */}
        <select
          value={task.status}
          onChange={(e) => {
            updateStatusMutation.mutate({
              taskId: task.id,
              status: e.target.value as TaskStatus
            });
          }}
          className="h-7 text-[11px] font-medium rounded border border-border bg-background px-2 text-foreground focus:outline-none"
        >
          <option value="BACKLOG">Backlog</option>
          <option value="TODO">To Do</option>
          <option value="IN_PROGRESS">In Progress</option>
          <option value="IN_REVIEW">In Review</option>
          <option value="TESTING">Testing</option>
          <option value="BLOCKED">Blocked</option>
          <option value="DONE">Done</option>
        </select>

        {task.assignee ? (
          <div className="flex items-center gap-1.5 text-xs" title={task.assignee.name}>
            <div className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
              {task.assignee.name?.charAt(0) || 'U'}
            </div>
            <span className="text-[11px] text-foreground-secondary hidden lg:inline max-w-[80px] truncate">
              {task.assignee.name.split(' ')[0]}
            </span>
          </div>
        ) : (
          <span className="text-[11px] text-foreground-muted italic">Unassigned</span>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Backlog Overview Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[11px] font-medium text-foreground-muted block">Unscheduled Backlog</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-foreground">{unscheduledBacklog.length}</span>
            <span className="text-xs text-foreground-muted">items ({totalBacklogPoints} SP)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[11px] font-medium text-foreground-muted block">Active Sprint Scope</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-primary">
              {activeSprint ? activeSprint.taskCount : 0}
            </span>
            <span className="text-xs text-foreground-muted">
              tasks ({activeSprint ? activeSprint.totalStoryPoints : 0} / {activeSprint?.capacityPoints || 40} SP)
            </span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[11px] font-medium text-foreground-muted block">Total Project Scope</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-foreground">{tasks.length}</span>
            <span className="text-xs text-foreground-muted">items ({totalProjectPoints} SP total)</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[11px] font-medium text-foreground-muted block">Completed Work</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {tasks.filter((t: any) => t.status === 'DONE').length}
            </span>
            <span className="text-xs text-foreground-muted">
              done ({tasks.filter((t: any) => t.status === 'DONE').reduce((s: number, t: any) => s + (t.storyPoints || 0), 0)} SP)
            </span>
          </div>
        </div>
      </div>

      {/* Toolbar & View Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex items-center gap-1 bg-background-secondary p-1 rounded-lg border border-border">
          <button
            onClick={() => setActiveTab('grooming')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'grooming' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Sprint Planning & Grooming
          </button>
          <button
            onClick={() => setActiveTab('epics')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'epics' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Epic Hierarchy
          </button>
          <button
            onClick={() => setActiveTab('priority')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition-all ${
              activeTab === 'priority' ? 'bg-primary text-primary-foreground shadow-xs' : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            Priority Breakdown
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Filter backlog..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-52"
            />
          </div>

          {/* Type Filter */}
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Types</option>
            <option value="STORY">Stories</option>
            <option value="TASK">Tasks</option>
            <option value="BUG">Bugs</option>
            <option value="EPIC">Epics</option>
            <option value="TECH_DEBT">Tech Debt</option>
          </select>

          {/* Priority Filter */}
          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Priorities</option>
            <option value="URGENT">Urgent</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>

          {/* Create Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs gap-1.5 h-8 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Item</span>
          </Button>
        </div>
      </div>

      {/* Tab 1: Sprint Planning & Grooming */}
      {activeTab === 'grooming' && (
        <div className="space-y-6">
          {/* Active Sprint Section */}
          {activeSprint && (
            <div className="rounded-xl border border-primary/30 bg-card overflow-hidden shadow-xs">
              <div className="p-4 bg-primary/5 border-b border-primary/20 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Flame className="h-4 w-4 text-primary" />
                  <h3 className="text-sm font-bold text-foreground">{activeSprint.name}</h3>
                  <Badge variant="status-progress">Active Sprint</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="text-foreground-muted">
                    Capacity: <strong className="text-foreground">{activeSprint.totalStoryPoints || 0}</strong> / {activeSprint.capacityPoints || 40} SP
                  </span>
                  <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(100, ((activeSprint.totalStoryPoints || 0) / (activeSprint.capacityPoints || 40)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 space-y-2">
                {filteredTasks.filter((t: any) => t.sprintId === activeSprint.id).length === 0 ? (
                  <p className="py-6 text-center text-xs text-foreground-muted italic">
                    No items in active sprint matching filters. Assign items from the backlog below!
                  </p>
                ) : (
                  filteredTasks
                    .filter((t: any) => t.sprintId === activeSprint.id)
                    .map(renderTaskRow)
                )}
              </div>
            </div>
          )}

          {/* Planned Sprints */}
          {plannedSprints.map((sprint: any) => {
            const sprintTasks = filteredTasks.filter((t: any) => t.sprintId === sprint.id);
            const sprintPts = sprintTasks.reduce((s: number, t: any) => s + (t.storyPoints || 0), 0);

            return (
              <div key={sprint.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="p-4 bg-background-secondary border-b border-border flex flex-wrap items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-foreground-muted" />
                    <h3 className="text-sm font-semibold text-foreground">{sprint.name}</h3>
                    <Badge variant="outline">Planned</Badge>
                  </div>
                  <div className="text-xs text-foreground-muted">
                    Committed: <strong className="text-foreground">{sprintPts}</strong> / {sprint.capacityPoints || 40} SP
                  </div>
                </div>

                <div className="p-4 space-y-2">
                  {sprintTasks.length === 0 ? (
                    <p className="py-4 text-center text-xs text-foreground-muted italic">
                      No items in this planned sprint. Use the dropdown to allocate backlog stories here.
                    </p>
                  ) : (
                    sprintTasks.map(renderTaskRow)
                  )}
                </div>
              </div>
            );
          })}

          {/* Unscheduled Backlog */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="p-4 bg-background-secondary border-b border-border flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2">
                <ListTodo className="h-4 w-4 text-foreground-muted" />
                <h3 className="text-sm font-semibold text-foreground">Product Backlog (Unscheduled)</h3>
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-secondary text-foreground-secondary">
                  {unscheduledBacklog.length} items ({totalBacklogPoints} SP)
                </span>
              </div>
              <p className="text-xs text-foreground-muted">
                Assign items directly into an active or future iteration using the sprint selector.
              </p>
            </div>

            <div className="p-4 space-y-2">
              {isLoading ? (
                <div className="py-8 text-center text-xs text-foreground-muted">Loading backlog items...</div>
              ) : unscheduledBacklog.length === 0 ? (
                <div className="py-10 text-center text-xs text-foreground-muted">
                  No unscheduled backlog items found.
                </div>
              ) : (
                unscheduledBacklog.map(renderTaskRow)
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Epic Hierarchy View */}
      {activeTab === 'epics' && (
        <div className="space-y-4">
          {filteredTasks.filter((t: any) => t.taskType === 'EPIC').length === 0 ? (
            <div className="p-8 text-center rounded-xl border border-border bg-card text-xs text-foreground-muted">
              No Epic-level initiatives currently defined. Create a new item with type &quot;Epic&quot; to organize user stories.
            </div>
          ) : (
            filteredTasks
              .filter((t: any) => t.taskType === 'EPIC')
              .map((epic: any) => {
                const childTasks = tasks.filter((t: any) => t.parentTaskId === epic.id || t.featureId === epic.id);
                const completedCount = childTasks.filter((t: any) => t.status === 'DONE').length;
                const progress = childTasks.length > 0 ? Math.round((completedCount / childTasks.length) * 100) : 0;

                return (
                  <div key={epic.id} className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                    <div className="p-4 bg-background-secondary/60 border-b border-border flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-[10px] font-bold text-purple-600 bg-purple-500/10 px-2 py-0.5 rounded uppercase">
                          Epic
                        </span>
                        <span className="font-mono text-xs font-bold text-primary">{epic.taskIdentifier}</span>
                        <h4 className="text-sm font-bold text-foreground">{epic.title}</h4>
                      </div>

                      <div className="flex items-center gap-4 text-xs">
                        <span className="text-foreground-muted">
                          Progress: <strong className="text-foreground">{progress}%</strong> ({completedCount}/{childTasks.length} Done)
                        </span>
                        <div className="w-24 h-2 rounded-full bg-border overflow-hidden">
                          <div className="h-full bg-purple-600" style={{ width: `${progress}%` }} />
                        </div>
                      </div>
                    </div>

                    <div className="p-4 space-y-2">
                      {childTasks.length === 0 ? (
                        <p className="py-3 text-center text-xs text-foreground-muted italic">
                          No user stories linked to this epic yet.
                        </p>
                      ) : (
                        childTasks.map(renderTaskRow)
                      )}
                    </div>
                  </div>
                );
              })
          )}
        </div>
      )}

      {/* Tab 3: Priority Breakdown */}
      {activeTab === 'priority' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as TaskPriority[]).map((p) => {
            const pTasks = filteredTasks.filter((t: any) => t.priority === p);
            const pPoints = pTasks.reduce((s: number, t: any) => s + (t.storyPoints || 0), 0);

            return (
              <div key={p} className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
                <div className="p-3.5 bg-background-secondary border-b border-border flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getPriorityBadge(p)}
                    <span className="text-xs font-semibold text-foreground">{p} Priority Backlog</span>
                  </div>
                  <span className="text-xs font-mono text-foreground-muted">
                    {pTasks.length} items ({pPoints} SP)
                  </span>
                </div>
                <div className="p-3 space-y-2 max-h-[420px] overflow-y-auto">
                  {pTasks.length === 0 ? (
                    <p className="py-6 text-center text-xs text-foreground-muted italic">No {p.toLowerCase()} priority items</p>
                  ) : (
                    pTasks.map(renderTaskRow)
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
            queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
          }}
        />
      )}

      {/* Create Backlog Item Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Work Item"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Item Title *</label>
            <Input
              placeholder="e.g. As a merchant, I want to initiate refund batch webhooks"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Description / Acceptance Criteria</label>
            <Textarea
              placeholder="Given valid payload, when webhook triggers, then refund status is recorded in ledger..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Work Item Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full h-9 px-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
              >
                <option value="STORY">User Story</option>
                <option value="TASK">Task</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
                <option value="TECH_DEBT">Tech Debt</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Story Points</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={storyPoints}
                onChange={(e) => setStoryPoints(Number(e.target.value))}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Target Sprint</label>
              <select
                value={targetSprintId}
                onChange={(e) => setTargetSprintId(e.target.value)}
                className="w-full h-9 px-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
              >
                <option value="">Unscheduled</option>
                {sprints.map((s: any) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-border">
            <Button size="sm" variant="outline" onClick={() => setIsCreateOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              size="sm"
              variant="primary"
              onClick={() => createTaskMutation.mutate()}
              isLoading={createTaskMutation.isPending}
              disabled={!title.trim()}
              className="text-xs"
            >
              Create Item
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
