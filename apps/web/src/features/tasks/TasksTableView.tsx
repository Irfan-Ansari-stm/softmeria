'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Plus,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  MoreVertical,
  CheckSquare,
  Bookmark,
  Layers,
  ArrowUpDown,
  User,
  Eye,
  ExternalLink
} from 'lucide-react';
import { TaskStatus, TaskPriority, TaskType } from '@devblueprint/types';
import { TaskDetailsModal } from './TaskDetailsModal';

interface TasksTableViewProps {
  projectId: string;
}

export function TasksTableView({ projectId }: TasksTableViewProps) {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [priorityFilter, setPriorityFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');

  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [taskType, setTaskType] = useState<TaskType>('TASK');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [storyPoints, setStoryPoints] = useState(3);
  const [assigneeId, setAssigneeId] = useState<string>('');

  // Fetch Tasks
  const { data: rawTasks = [], isLoading, refetch } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/tasks?projectId=${projectId}`);
      return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.tasks) ? res.data.tasks : [];
    }
  });

  const tasks = Array.isArray(rawTasks) ? rawTasks : [];

  // Fetch Project details for members
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
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
        status,
        storyPoints: Number(storyPoints) || 0,
        assigneeId: assigneeId || undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setStoryPoints(3);
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    }
  });

  // Update Status Mutation
  const updateStatusMutation = useMutation({
    mutationFn: async ({ taskId, newStatus }: { taskId: string; newStatus: TaskStatus }) => {
      const res = await api.patch(`/tasks/${taskId}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    }
  });

  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter((t: any) => {
      if (statusFilter !== 'ALL' && t.status !== statusFilter) return false;
      if (priorityFilter !== 'ALL' && t.priority !== priorityFilter) return false;
      if (typeFilter !== 'ALL' && t.taskType !== typeFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchTitle = t.title?.toLowerCase().includes(query);
        const matchKey = t.key?.toLowerCase().includes(query);
        if (!matchTitle && !matchKey) return false;
      }
      return true;
    });
  }, [tasks, statusFilter, priorityFilter, typeFilter, search]);

  const totalPoints = useMemo(() => {
    return filteredTasks.reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0);
  }, [filteredTasks]);

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'DONE':
        return <Badge variant="success">Done</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">In Progress</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="warning">In Review</Badge>;
      case 'TESTING':
        return <Badge variant="secondary">Testing</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">Blocked</Badge>;
      case 'TODO':
        return <Badge variant="outline">Todo</Badge>;
      default:
        return <Badge variant="outline">Backlog</Badge>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[11px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">Urgent</span>;
      case 'HIGH':
        return <span className="text-[11px] font-semibold text-warning bg-warning/10 px-2 py-0.5 rounded">High</span>;
      case 'MEDIUM':
        return <span className="text-[11px] text-foreground-secondary bg-secondary px-2 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[11px] text-foreground-muted bg-secondary/50 px-2 py-0.5 rounded">Low</span>;
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'BUG':
        return <AlertCircle className="h-3.5 w-3.5 text-destructive" />;
      case 'STORY':
        return <Bookmark className="h-3.5 w-3.5 text-success" />;
      case 'EPIC':
        return <Layers className="h-3.5 w-3.5 text-primary" />;
      default:
        return <CheckSquare className="h-3.5 w-3.5 text-info" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Filter & Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 bg-card p-4 rounded-xl border border-border shadow-sm">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search tasks by title or key..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Statuses</option>
            <option value="BACKLOG">Backlog</option>
            <option value="TODO">To Do</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="IN_REVIEW">In Review</option>
            <option value="TESTING">Testing</option>
            <option value="BLOCKED">Blocked</option>
            <option value="DONE">Done</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Types</option>
            <option value="TASK">Task</option>
            <option value="STORY">Story</option>
            <option value="BUG">Bug</option>
            <option value="EPIC">Epic</option>
          </select>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="text-xs font-semibold text-foreground">{filteredTasks.length} tasks</span>
            <span className="text-[11px] text-foreground-muted block font-mono">{totalPoints} story points</span>
          </div>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Task Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="py-3 px-4 w-28">Key</th>
                <th className="py-3 px-4">Title</th>
                <th className="py-3 px-4 w-24">Type</th>
                <th className="py-3 px-4 w-32">Status</th>
                <th className="py-3 px-4 w-24">Priority</th>
                <th className="py-3 px-4 w-20 text-center">Points</th>
                <th className="py-3 px-4 w-36">Assignee</th>
                <th className="py-3 px-4 w-28 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-foreground-muted">
                    Loading project tasks...
                  </td>
                </tr>
              ) : filteredTasks.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-foreground-muted">
                    No tasks found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTasks.map((t: any) => (
                  <tr key={t.id} className="hover:bg-background-secondary/50 transition-colors">
                    <td className="py-3 px-4 font-mono font-medium text-primary">
                      <button
                        onClick={() => setSelectedTaskId(t.id)}
                        className="hover:underline font-mono font-semibold text-primary focus:outline-none"
                      >
                        {t.taskIdentifier || t.key || 'TASK'}
                      </button>
                    </td>
                    <td className="py-3 px-4 font-medium text-foreground">
                      <div
                        onClick={() => setSelectedTaskId(t.id)}
                        className="flex flex-col cursor-pointer group/title"
                      >
                        <span className="group-hover/title:text-primary transition-colors">{t.title}</span>
                        {t.sprint && (
                          <span className="text-[10px] text-foreground-muted mt-0.5">
                            Sprint: {t.sprint.name}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="inline-flex items-center gap-1.5 capitalize font-medium text-[11px]">
                        {getTypeIcon(t.taskType)}
                        {t.taskType?.toLowerCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <select
                        value={t.status}
                        onChange={(e) =>
                          updateStatusMutation.mutate({
                            taskId: t.id,
                            newStatus: e.target.value as TaskStatus
                          })
                        }
                        className="bg-transparent text-xs font-medium focus:outline-none cursor-pointer hover:underline"
                      >
                        <option value="BACKLOG">Backlog</option>
                        <option value="TODO">To Do</option>
                        <option value="IN_PROGRESS">In Progress</option>
                        <option value="IN_REVIEW">In Review</option>
                        <option value="TESTING">Testing</option>
                        <option value="BLOCKED">Blocked</option>
                        <option value="DONE">Done</option>
                      </select>
                    </td>
                    <td className="py-3 px-4">
                      {getPriorityBadge(t.priority)}
                    </td>
                    <td className="py-3 px-4 text-center font-mono font-semibold text-foreground-secondary">
                      {t.storyPoints || 0}
                    </td>
                    <td className="py-3 px-4">
                      {t.assignee ? (
                        <div className="flex items-center gap-1.5">
                          <div className="h-5 w-5 rounded-full bg-primary/20 text-primary text-[10px] font-bold flex items-center justify-center">
                            {t.assignee.name?.[0] || 'U'}
                          </div>
                          <span className="truncate max-w-[100px] text-foreground-secondary font-medium text-[11px]">
                            {t.assignee.name}
                          </span>
                        </div>
                      ) : (
                        <span className="text-foreground-muted text-[11px]">Unassigned</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2.5">
                        <button
                          onClick={() => setSelectedTaskId(t.id)}
                          className="text-[11px] font-medium text-foreground-muted hover:text-primary inline-flex items-center gap-1 transition-colors"
                          title="Open Task Details"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Details</span>
                        </button>
                        {t.status !== 'DONE' ? (
                          <button
                            onClick={() =>
                              updateStatusMutation.mutate({ taskId: t.id, newStatus: 'DONE' })
                            }
                            className="text-[11px] font-medium text-success hover:underline inline-flex items-center gap-1"
                          >
                            <CheckCircle2 className="h-3 w-3" />
                            <span>Done</span>
                          </button>
                        ) : (
                          <span className="text-[11px] text-foreground-muted">Completed</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create Task Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Task"
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Task Title *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Implement resilient circuit breaker for Stripe Gateway"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Description
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide context, acceptance criteria, or architectural notes..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Type
              </label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="TASK">Task</option>
                <option value="STORY">Story</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as TaskPriority)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="BACKLOG">Backlog</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="IN_REVIEW">In Review</option>
                <option value="TESTING">Testing</option>
                <option value="BLOCKED">Blocked</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Story Points
              </label>
              <Input
                type="number"
                value={storyPoints}
                onChange={(e) => setStoryPoints(parseInt(e.target.value) || 0)}
                min={0}
                max={40}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!title.trim() || createTaskMutation.isPending}
              isLoading={createTaskMutation.isPending}
              onClick={() => createTaskMutation.mutate()}
            >
              Create Task
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Task Details Modal */}
      <TaskDetailsModal
        taskId={selectedTaskId}
        isOpen={!!selectedTaskId}
        onClose={() => setSelectedTaskId(null)}
        onTaskUpdated={() => refetch()}
        onTaskDeleted={() => refetch()}
      />
    </div>
  );
}
