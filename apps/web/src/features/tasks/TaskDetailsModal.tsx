'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import {
  X,
  Calendar,
  Clock,
  User,
  CheckSquare,
  AlertCircle,
  Bookmark,
  Layers,
  Trash2,
  CheckCircle2,
  ChevronRight,
  Copy,
  Check,
  Plus,
  Link as LinkIcon,
  AlertTriangle,
  FileText,
  Timer
} from 'lucide-react';
import { TaskStatus, TaskPriority, TaskType } from '@devblueprint/types';

interface TaskDetailsModalProps {
  taskId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onTaskUpdated?: () => void;
  onTaskDeleted?: () => void;
}

export function TaskDetailsModal({
  taskId,
  isOpen,
  onClose,
  onTaskUpdated,
  onTaskDeleted
}: TaskDetailsModalProps) {
  const queryClient = useQueryClient();

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState<TaskStatus>('TODO');
  const [priority, setPriority] = useState<TaskPriority>('MEDIUM');
  const [taskType, setTaskType] = useState<TaskType>('TASK');
  const [assigneeId, setAssigneeId] = useState<string>('');
  const [sprintId, setSprintId] = useState<string>('');
  const [milestoneId, setMilestoneId] = useState<string>('');
  const [storyPoints, setStoryPoints] = useState<number>(1);
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [startDate, setStartDate] = useState<string>('');
  const [dueDate, setDueDate] = useState<string>('');

  // Subtask quick add
  const [newSubtaskTitle, setNewSubtaskTitle] = useState('');
  const [isAddingSubtask, setIsAddingSubtask] = useState(false);

  // Time logging quick state
  const [logHours, setLogHours] = useState<number>(1);
  const [logDescription, setLogDescription] = useState('');
  const [isLoggingTime, setIsLoggingTime] = useState(false);

  // Copied state
  const [copiedKey, setCopiedKey] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  // Fetch Full Task Details
  const { data: task, isLoading, refetch } = useQuery({
    queryKey: ['task-detail', taskId],
    queryFn: async () => {
      if (!taskId) return null;
      const res = await api.get<any>(`/tasks/${taskId}`);
      return res.data;
    },
    enabled: !!taskId && isOpen
  });

  // Fetch Project context for members, sprints, milestones
  const projectId = task?.projectId;
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      if (!projectId) return null;
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    },
    enabled: !!projectId && isOpen
  });

  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get<any[]>(`/sprints?projectId=${projectId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!projectId && isOpen
  });

  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      if (!projectId) return [];
      const res = await api.get<any[]>(`/milestones?projectId=${projectId}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!projectId && isOpen
  });

  // Populate form fields when task data arrives
  useEffect(() => {
    if (task) {
      setTitle(task.title || '');
      setDescription(task.description || '');
      setStatus(task.status || 'TODO');
      setPriority(task.priority || 'MEDIUM');
      setTaskType(task.taskType || 'TASK');
      setAssigneeId(task.assigneeId || '');
      setSprintId(task.sprintId || '');
      setMilestoneId(task.milestoneId || '');
      setStoryPoints(task.storyPoints ?? 1);
      setEstimatedHours(task.estimatedHours ?? 0);
      setStartDate(task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '');
      setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '');
      setConfirmDelete(false);
    }
  }, [task]);

  // Update Task Mutation
  const updateTaskMutation = useMutation({
    mutationFn: async () => {
      if (!taskId) return;
      const payload: any = {
        title,
        description,
        status,
        priority,
        taskType,
        assigneeId: assigneeId || null,
        sprintId: sprintId || null,
        milestoneId: milestoneId || null,
        storyPoints: Number(storyPoints) || 0,
        estimatedHours: Number(estimatedHours) || 0,
        startDate: startDate ? new Date(startDate).toISOString() : null,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null
      };
      const res = await api.put(`/tasks/${taskId}`, payload);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['task-detail', taskId] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onTaskUpdated?.();
      onClose();
    }
  });

  // Delete Task Mutation
  const deleteTaskMutation = useMutation({
    mutationFn: async () => {
      if (!taskId) return;
      const res = await api.delete(`/tasks/${taskId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      queryClient.invalidateQueries({ queryKey: ['board'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onTaskDeleted?.();
      onClose();
    }
  });

  // Add Subtask Mutation
  const addSubtaskMutation = useMutation({
    mutationFn: async () => {
      if (!taskId || !newSubtaskTitle.trim() || !projectId) return;
      const res = await api.post('/tasks', {
        projectId,
        parentTaskId: taskId,
        title: newSubtaskTitle.trim(),
        taskType: 'TASK',
        status: 'TODO',
        priority: 'MEDIUM'
      });
      return res.data;
    },
    onSuccess: () => {
      setNewSubtaskTitle('');
      setIsAddingSubtask(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Toggle Subtask Status
  const toggleSubtaskMutation = useMutation({
    mutationFn: async ({ subtaskId, newStatus }: { subtaskId: string; newStatus: TaskStatus }) => {
      const res = await api.patch(`/tasks/${subtaskId}/status`, { status: newStatus });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Delete Subtask
  const deleteSubtaskMutation = useMutation({
    mutationFn: async (subtaskId: string) => {
      const res = await api.delete(`/tasks/${subtaskId}`);
      return res.data;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    }
  });

  // Quick Log Time Mutation
  const logTimeMutation = useMutation({
    mutationFn: async () => {
      if (!taskId || !projectId || !logHours) return;
      const res = await api.post('/time-tracking', {
        projectId,
        taskId,
        hours: Number(logHours),
        description: logDescription.trim() || `Work on ${task?.taskIdentifier || 'task'}`,
        isBillable: true
      });
      return res.data;
    },
    onSuccess: () => {
      setLogHours(1);
      setLogDescription('');
      setIsLoggingTime(false);
      refetch();
      queryClient.invalidateQueries({ queryKey: ['time-entries'] });
    }
  });

  const copyTaskKey = () => {
    const key = task?.taskIdentifier || task?.key || '';
    if (key) {
      navigator.clipboard.writeText(key);
      setCopiedKey(true);
      setTimeout(() => setCopiedKey(false), 2000);
    }
  };

  if (!isOpen) return null;

  const subtasks = Array.isArray(task?.subtasks) ? task.subtasks : [];
  const completedSubtasks = subtasks.filter((s: any) => s.status === 'DONE').length;
  const subtaskProgress = subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;
  const timeEntries = Array.isArray(task?.timeEntries) ? task.timeEntries : [];
  const totalLoggedHours = timeEntries.reduce((acc: number, e: any) => acc + (Number(e.hours) || 0), 0);
  const members = Array.isArray(project?.members) ? project.members : [];

  const getTypeIcon = (tType: string) => {
    switch (tType) {
      case 'BUG':
        return <AlertCircle className="h-4 w-4 text-destructive" />;
      case 'STORY':
        return <Bookmark className="h-4 w-4 text-success" />;
      case 'EPIC':
        return <Layers className="h-4 w-4 text-primary" />;
      default:
        return <CheckSquare className="h-4 w-4 text-info" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      />

      {/* Modal Surface */}
      <div className="relative w-full max-w-4xl bg-card border border-border rounded-2xl shadow-2xl z-10 my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
        {/* Top Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary/60">
          <div className="flex items-center gap-3">
            {/* Task Key Badge */}
            <div
              onClick={copyTaskKey}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-primary/10 border border-primary/20 text-primary font-mono text-xs font-semibold cursor-pointer hover:bg-primary/20 transition-colors"
              title="Click to copy task identifier"
            >
              <span>{task?.taskIdentifier || task?.key || 'TASK'}</span>
              {copiedKey ? (
                <Check className="h-3.5 w-3.5 text-success" />
              ) : (
                <Copy className="h-3.5 w-3.5 opacity-70" />
              )}
            </div>

            {/* Type selector */}
            <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2 py-1">
              {getTypeIcon(taskType)}
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="bg-transparent text-xs font-medium text-foreground focus:outline-none cursor-pointer"
              >
                <option value="TASK">Task</option>
                <option value="STORY">Story</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
              </select>
            </div>

            {/* Status Selector */}
            <div className="flex items-center gap-1 bg-background border border-border rounded-lg px-2 py-1">
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as TaskStatus)}
                className="bg-transparent text-xs font-semibold text-foreground focus:outline-none cursor-pointer"
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
          </div>

          <div className="flex items-center gap-2">
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="p-1.5 rounded-lg text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                title="Delete task"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            ) : (
              <div className="flex items-center gap-1.5 bg-destructive/10 border border-destructive/20 px-2 py-1 rounded-lg">
                <span className="text-[11px] text-destructive font-medium">Delete task?</span>
                <button
                  onClick={() => deleteTaskMutation.mutate()}
                  disabled={deleteTaskMutation.isPending}
                  className="text-[10px] font-bold text-destructive hover:underline"
                >
                  Confirm
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="text-[10px] text-foreground-muted hover:underline ml-1"
                >
                  Cancel
                </button>
              </div>
            )}

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Modal Body */}
        {isLoading ? (
          <div className="py-24 text-center text-foreground-muted space-y-2">
            <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="text-xs">Loading task details...</p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left Column (7 cols): Main Content */}
            <div className="lg:col-span-7 space-y-6">
              {/* Task Title */}
              <div>
                <label className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
                  Task Title
                </label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Task title..."
                  className="text-base font-semibold text-foreground py-2 h-auto"
                />
              </div>

              {/* Task Description */}
              <div>
                <label className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
                  Description
                </label>
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a detailed description, acceptance criteria, or technical considerations..."
                  rows={6}
                  className="text-xs font-normal leading-relaxed text-foreground"
                />
              </div>

              {/* Subtasks Section */}
              <div className="p-4 rounded-xl border border-border bg-background-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckSquare className="h-4 w-4 text-primary" />
                    <span className="text-xs font-semibold text-foreground">
                      Subtasks ({completedSubtasks}/{subtasks.length})
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-foreground-muted font-medium">
                    {subtaskProgress}% done
                  </span>
                </div>

                {subtasks.length > 0 && (
                  <Progress value={subtaskProgress} size="sm" className="h-1.5" />
                )}

                {/* Subtask Items */}
                <div className="space-y-1.5 pt-1">
                  {subtasks.map((st: any) => {
                    const isDone = st.status === 'DONE';
                    return (
                      <div
                        key={st.id}
                        className="flex items-center justify-between gap-2 p-2 rounded-lg bg-card border border-border hover:border-primary/40 transition-colors group"
                      >
                        <div className="flex items-center gap-2.5 flex-1 min-w-0">
                          <input
                            type="checkbox"
                            checked={isDone}
                            onChange={() =>
                              toggleSubtaskMutation.mutate({
                                subtaskId: st.id,
                                newStatus: isDone ? 'TODO' : 'DONE'
                              })
                            }
                            className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer"
                          />
                          <span
                            className={`text-xs truncate ${
                              isDone
                                ? 'line-through text-foreground-muted'
                                : 'text-foreground font-medium'
                            }`}
                          >
                            {st.title}
                          </span>
                        </div>
                        <button
                          onClick={() => deleteSubtaskMutation.mutate(st.id)}
                          className="opacity-0 group-hover:opacity-100 p-1 text-foreground-muted hover:text-destructive transition-all"
                          title="Delete subtask"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    );
                  })}
                </div>

                {/* Add Subtask Form */}
                {isAddingSubtask ? (
                  <div className="flex items-center gap-2 pt-2">
                    <Input
                      value={newSubtaskTitle}
                      onChange={(e) => setNewSubtaskTitle(e.target.value)}
                      placeholder="Enter subtask title..."
                      className="text-xs h-8 flex-1"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addSubtaskMutation.mutate();
                      }}
                      autoFocus
                    />
                    <Button
                      size="sm"
                      variant="primary"
                      onClick={() => addSubtaskMutation.mutate()}
                      disabled={!newSubtaskTitle.trim() || addSubtaskMutation.isPending}
                      className="text-xs h-8 px-3"
                    >
                      Add
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => setIsAddingSubtask(false)}
                      className="text-xs h-8 px-2"
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsAddingSubtask(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline pt-1"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Add subtask</span>
                  </button>
                )}
              </div>

              {/* Time Tracking Section */}
              <div className="p-4 rounded-xl border border-border bg-background-secondary/30 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Timer className="h-4 w-4 text-warning" />
                    <span className="text-xs font-semibold text-foreground">Time Tracking</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs font-mono">
                    <span className="font-semibold text-foreground">{totalLoggedHours}h logged</span>
                    {estimatedHours > 0 && (
                      <span className="text-foreground-muted">/ {estimatedHours}h est.</span>
                    )}
                  </div>
                </div>

                {/* Quick Log Time */}
                {isLoggingTime ? (
                  <div className="p-3 rounded-lg bg-card border border-border space-y-2">
                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-1">
                        <label className="text-[10px] font-medium text-foreground-muted block mb-0.5">
                          Hours
                        </label>
                        <Input
                          type="number"
                          step="0.5"
                          min="0.25"
                          value={logHours}
                          onChange={(e) => setLogHours(parseFloat(e.target.value) || 0)}
                          className="text-xs h-8"
                        />
                      </div>
                      <div className="col-span-2">
                        <label className="text-[10px] font-medium text-foreground-muted block mb-0.5">
                          Description
                        </label>
                        <Input
                          value={logDescription}
                          onChange={(e) => setLogDescription(e.target.value)}
                          placeholder="e.g. Code review and unit test fixes"
                          className="text-xs h-8"
                        />
                      </div>
                    </div>
                    <div className="flex justify-end gap-1.5 pt-1">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setIsLoggingTime(false)}
                        className="text-xs h-7 px-2.5"
                      >
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => logTimeMutation.mutate()}
                        disabled={logHours <= 0 || logTimeMutation.isPending}
                        className="text-xs h-7 px-3"
                      >
                        Save Entry
                      </Button>
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={() => setIsLoggingTime(true)}
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-primary hover:underline"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Log Time</span>
                  </button>
                )}

                {/* Logged Entries List */}
                {timeEntries.length > 0 && (
                  <div className="space-y-1.5 pt-1 border-t border-border/60">
                    <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider block">
                      Logged Entries ({timeEntries.length})
                    </span>
                    <div className="max-h-28 overflow-y-auto space-y-1 pr-1">
                      {timeEntries.map((e: any) => (
                        <div
                          key={e.id}
                          className="flex items-center justify-between text-xs py-1 px-2 rounded bg-card border border-border/50 text-foreground"
                        >
                          <div className="flex items-center gap-2 truncate">
                            <span className="font-semibold font-mono text-primary">{e.hours}h</span>
                            <span className="text-foreground-secondary truncate max-w-[220px]">
                              {e.description || 'Time logged'}
                            </span>
                          </div>
                          <span className="text-[10px] text-foreground-muted font-mono whitespace-nowrap">
                            {e.date ? new Date(e.date).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column (5 cols): Metadata & Properties Sidebar */}
            <div className="lg:col-span-5 space-y-4 bg-background-secondary/40 p-4 rounded-xl border border-border">
              <h3 className="text-xs font-semibold uppercase tracking-wider text-foreground-muted mb-3">
                Task Properties
              </h3>

              {/* Assignee */}
              <div>
                <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1.5 mb-1">
                  <User className="h-3.5 w-3.5 text-primary" /> Assignee
                </label>
                <select
                  value={assigneeId}
                  onChange={(e) => setAssigneeId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">Unassigned</option>
                  {members.map((m: any) => (
                    <option key={m.user?.id || m.id} value={m.user?.id || m.userId}>
                      {m.user?.name || m.user?.email || 'Team Member'} ({m.role})
                    </option>
                  ))}
                </select>
              </div>

              {/* Priority */}
              <div>
                <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1.5 mb-1">
                  <AlertCircle className="h-3.5 w-3.5 text-warning" /> Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as TaskPriority)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="URGENT">Urgent</option>
                </select>
              </div>

              {/* Sprint */}
              <div>
                <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1.5 mb-1">
                  <Layers className="h-3.5 w-3.5 text-info" /> Sprint
                </label>
                <select
                  value={sprintId}
                  onChange={(e) => setSprintId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">No Sprint (Backlog)</option>
                  {sprints.map((s: any) => (
                    <option key={s.id} value={s.id}>
                      {s.name} ({s.status})
                    </option>
                  ))}
                </select>
              </div>

              {/* Milestone */}
              <div>
                <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1.5 mb-1">
                  <Bookmark className="h-3.5 w-3.5 text-success" /> Milestone
                </label>
                <select
                  value={milestoneId}
                  onChange={(e) => setMilestoneId(e.target.value)}
                  className="w-full h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
                >
                  <option value="">No Milestone</option>
                  {milestones.map((m: any) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Story Points & Estimated Hours */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-foreground-muted block mb-1">
                    Story Points
                  </label>
                  <Input
                    type="number"
                    min="0"
                    max="100"
                    value={storyPoints}
                    onChange={(e) => setStoryPoints(parseInt(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-foreground-muted block mb-1">
                    Est. Hours
                  </label>
                  <Input
                    type="number"
                    min="0"
                    step="0.5"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(parseFloat(e.target.value) || 0)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-2.5">
                <div>
                  <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> Start Date
                  </label>
                  <Input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1 mb-1">
                    <Calendar className="h-3 w-3" /> Due Date
                  </label>
                  <Input
                    type="date"
                    value={dueDate}
                    onChange={(e) => setDueDate(e.target.value)}
                    className="h-8 text-xs"
                  />
                </div>
              </div>

              {/* Associated Document / Blueprint */}
              {task?.document && (
                <div className="pt-2 border-t border-border">
                  <label className="text-[11px] font-medium text-foreground-muted flex items-center gap-1.5 mb-1">
                    <FileText className="h-3.5 w-3.5 text-primary" /> Blueprint Document
                  </label>
                  <div className="p-2 rounded-lg bg-card border border-border text-xs font-medium text-primary truncate flex items-center gap-1.5">
                    <FileText className="h-3 w-3 shrink-0" />
                    <span className="truncate">{task.document.title}</span>
                  </div>
                </div>
              )}

              {/* Reporter Info */}
              <div className="pt-2 border-t border-border text-[11px] text-foreground-muted flex items-center justify-between">
                <span>Reporter:</span>
                <span className="font-medium text-foreground">
                  {task?.reporter?.name || 'Workspace Owner'}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="flex items-center justify-between px-6 py-3.5 border-t border-border bg-background-secondary/60">
          <div className="text-[11px] text-foreground-muted">
            {task?.updatedAt && (
              <span>Last updated: {new Date(task.updatedAt).toLocaleDateString()}</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={onClose} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!title.trim() || updateTaskMutation.isPending}
              isLoading={updateTaskMutation.isPending}
              onClick={() => updateTaskMutation.mutate()}
              className="text-xs px-4"
            >
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
