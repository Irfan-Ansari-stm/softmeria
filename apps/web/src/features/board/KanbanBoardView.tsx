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
  AlertCircle,
  Clock,
  CheckCircle2,
  Filter,
  User,
  Layers,
  Settings2,
  Search,
  SlidersHorizontal,
  Flame,
  CheckSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TaskStatus, TaskPriority, TaskType } from '@devblueprint/types';
import { TaskDetailsModal } from '../tasks/TaskDetailsModal';

interface KanbanBoardViewProps {
  projectId: string;
}

export function KanbanBoardView({ projectId }: KanbanBoardViewProps) {
  const queryClient = useQueryClient();
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [filterPriority, setFilterPriority] = useState<string>('ALL');
  const [filterAssignee, setFilterAssignee] = useState<string>('ALL');
  const [filterSprint, setFilterSprint] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [targetStatus, setTargetStatus] = useState<TaskStatus>('TODO');

  // Drag and drop state
  const [draggedTaskId, setDraggedTaskId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<string | null>(null);

  // Form State for Quick Task Creation
  const [taskTitle, setTaskTitle] = useState('');
  const [taskDesc, setTaskDesc] = useState('');
  const [taskPriority, setTaskPriority] = useState<TaskPriority>('MEDIUM');
  const [taskType, setTaskType] = useState<TaskType>('TASK');
  const [storyPoints, setStoryPoints] = useState(3);

  // Fetch Sprints for Filter
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/sprints?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Fetch Board
  const { data: board, isLoading } = useQuery({
    queryKey: ['board', projectId, filterSprint],
    queryFn: async () => {
      let url = `/projects/${projectId}/board`;
      if (filterSprint !== 'ALL') {
        url += `?sprintId=${filterSprint}`;
      }
      const res = await api.get<any>(url);
      return res.data;
    }
  });

  // Fetch Project Members for Assignee Filter
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    }
  });

  // Status Change Mutation
  const moveTaskMutation = useMutation({
    mutationFn: async ({ taskId, status }: { taskId: string; status: TaskStatus }) => {
      const res = await api.patch(`/tasks/${taskId}/status`, { status });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    }
  });

  // Create Task Mutation
  const createTaskMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/tasks', {
        projectId,
        title: taskTitle,
        description: taskDesc,
        status: targetStatus,
        priority: taskPriority,
        taskType,
        storyPoints: Number(storyPoints),
        sprintId: filterSprint !== 'ALL' && filterSprint !== 'BACKLOG' ? filterSprint : undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setTaskTitle('');
      setTaskDesc('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
      queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
    }
  });

  // Update Column WIP Limit Mutation
  const updateColumnMutation = useMutation({
    mutationFn: async ({ columnId, wipLimit, name }: { columnId: string; wipLimit?: number; name?: string }) => {
      const res = await api.patch(`/boards/columns/${columnId}`, { wipLimit, name });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['board', projectId] });
    }
  });

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Urgent</span>;
      case 'HIGH':
        return <span className="text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] font-medium text-primary bg-primary/10 px-1.5 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[10px] text-foreground-muted bg-secondary px-1.5 py-0.5 rounded">Low</span>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'EPIC':
        return <span className="text-[9px] font-bold text-purple-600 bg-purple-500/10 px-1.5 py-0.5 rounded uppercase">Epic</span>;
      case 'FEATURE':
      case 'STORY':
        return <span className="text-[9px] font-semibold text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded uppercase">Story</span>;
      case 'BUG':
        return <span className="text-[9px] font-semibold text-rose-600 bg-rose-500/10 px-1.5 py-0.5 rounded uppercase">Bug</span>;
      case 'TECH_DEBT':
        return <span className="text-[9px] font-semibold text-amber-600 bg-amber-500/10 px-1.5 py-0.5 rounded uppercase">Debt</span>;
      default:
        return <span className="text-[9px] font-medium text-blue-600 bg-blue-500/10 px-1.5 py-0.5 rounded uppercase">Task</span>;
    }
  };

  const getStatusColumnColor = (status: string) => {
    switch (status) {
      case 'BACKLOG':
        return 'border-t-zinc-400';
      case 'TODO':
        return 'border-t-sky-500';
      case 'IN_PROGRESS':
        return 'border-t-blue-600';
      case 'IN_REVIEW':
        return 'border-t-amber-500';
      case 'TESTING':
        return 'border-t-purple-500';
      case 'BLOCKED':
        return 'border-t-destructive';
      case 'DONE':
        return 'border-t-emerald-500';
      default:
        return 'border-t-border';
    }
  };

  const columns = board?.columns || [];

  return (
    <div className="space-y-4">
      {/* Board Controls & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Layers className="h-4 w-4 text-primary" />
            <h3 className="font-semibold text-sm text-foreground">{board?.name || 'Kanban Board'}</h3>
            <span className="text-[11px] text-foreground-muted">
              ({board?.totalTasks ?? columns.reduce((sum: number, c: any) => sum + (c.taskCount || 0), 0)} Total Tasks)
            </span>
          </div>

          {/* Search Box */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary w-44 md:w-56"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Sprint Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Flame className="h-3.5 w-3.5 text-foreground-muted" />
            <select
              value={filterSprint}
              onChange={(e) => setFilterSprint(e.target.value)}
              className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
            >
              <option value="ALL">All Sprints</option>
              <option value="BACKLOG">Backlog (Unassigned)</option>
              {sprints.map((s: any) => (
                <option key={s.id} value={s.id}>
                  {s.name} ({s.status})
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div className="flex items-center gap-1.5 text-xs">
            <Filter className="h-3.5 w-3.5 text-foreground-muted" />
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
          </div>

          {/* Board WIP Settings */}
          <Button
            size="sm"
            variant="outline"
            onClick={() => setIsSettingsOpen(true)}
            className="text-xs gap-1.5 h-8"
            title="Configure WIP limits and columns"
          >
            <Settings2 className="h-3.5 w-3.5 text-foreground-muted" />
            <span className="hidden sm:inline">Columns & WIP</span>
          </Button>

          {/* Create Task Button */}
          <Button
            size="sm"
            variant="primary"
            onClick={() => {
              setTargetStatus('TODO');
              setIsCreateOpen(true);
            }}
            className="text-xs gap-1.5 h-8 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Task</span>
          </Button>
        </div>
      </div>

      {/* Kanban Scroll Container: Explicitly structured to prevent shrinking, clipping, or overlapping */}
      <div className="w-full overflow-x-auto min-w-0 pb-4">
        {isLoading ? (
          <div className="p-12 text-center text-xs text-foreground-muted">Loading Kanban board...</div>
        ) : (
          <div className="flex gap-4 items-start min-w-max pb-2">
            {columns.map((column: any) => {
              let tasks = column.tasks || [];
              if (filterPriority !== 'ALL') {
                tasks = tasks.filter((t: any) => t.priority === filterPriority);
              }
              if (filterAssignee !== 'ALL') {
                tasks = tasks.filter((t: any) => t.assigneeId === filterAssignee);
              }
              if (searchQuery.trim()) {
                const q = searchQuery.toLowerCase();
                tasks = tasks.filter(
                  (t: any) =>
                    t.title.toLowerCase().includes(q) ||
                    (t.taskIdentifier && t.taskIdentifier.toLowerCase().includes(q)) ||
                    (t.description && t.description.toLowerCase().includes(q))
                );
              }

              const isOverWip = column.wipLimit && column.wipLimit > 0 && tasks.length > column.wipLimit;
              const isDragTarget = dragOverCol === column.statusValue;

              return (
                <div
                  key={column.id}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = 'move';
                    if (dragOverCol !== column.statusValue) {
                      setDragOverCol(column.statusValue);
                    }
                  }}
                  onDragLeave={() => {
                    if (dragOverCol === column.statusValue) {
                      setDragOverCol(null);
                    }
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    setDragOverCol(null);
                    const taskId = e.dataTransfer.getData('text/plain');
                    if (taskId) {
                      moveTaskMutation.mutate({ taskId, status: column.statusValue });
                    }
                  }}
                  className={`w-[310px] shrink-0 flex flex-col rounded-xl bg-background-secondary/70 border border-border/80 border-t-4 ${getStatusColumnColor(
                    column.statusValue
                  )} p-3 shadow-xs transition-colors duration-150 ${
                    isDragTarget ? 'ring-2 ring-primary/60 bg-primary/5' : ''
                  } ${isOverWip ? 'ring-1 ring-destructive/50' : ''}`}
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-border/60">
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-xs text-foreground">{column.name}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.5 rounded-full bg-secondary text-foreground-secondary font-medium">
                        {tasks.length}
                        {column.wipLimit > 0 && ` / ${column.wipLimit}`}
                      </span>
                    </div>

                    <div className="flex items-center gap-1">
                      {column.wipLimit > 0 && isOverWip && (
                        <span
                          className="text-[9px] font-mono px-1.5 py-0.5 rounded bg-destructive/15 text-destructive font-bold animate-pulse"
                          title={`WIP Limit (${column.wipLimit}) Exceeded!`}
                        >
                          WIP OVER
                        </span>
                      )}
                      <button
                        onClick={() => {
                          setTargetStatus(column.statusValue);
                          setIsCreateOpen(true);
                        }}
                        className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors"
                        title={`Add task to ${column.name}`}
                      >
                        <Plus className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Tasks List Container with Drag & Drop */}
                  <div className="flex-1 space-y-2.5 overflow-y-auto max-h-[calc(100vh-270px)] pr-1 min-h-[120px]">
                    {tasks.length === 0 ? (
                      <div className="py-8 text-center border border-dashed border-border/60 rounded-lg">
                        <p className="text-[11px] text-foreground-muted italic">Drop tasks here</p>
                      </div>
                    ) : (
                      tasks.map((task: any) => (
                        <div
                          key={task.id}
                          draggable
                          onDragStart={(e) => {
                            e.dataTransfer.setData('text/plain', task.id);
                            setDraggedTaskId(task.id);
                          }}
                          onDragEnd={() => {
                            setDraggedTaskId(null);
                            setDragOverCol(null);
                          }}
                          onClick={() => setSelectedTaskId(task.id)}
                          className={`p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-all shadow-xs space-y-2.5 group cursor-grab active:cursor-grabbing hover:shadow-md ${
                            draggedTaskId === task.id ? 'opacity-40 scale-95' : ''
                          }`}
                        >
                          {/* Card Top: Key & Badges */}
                          <div className="flex items-center justify-between gap-1">
                            <div className="flex items-center gap-1.5">
                              {getTypeBadge(task.taskType)}
                              <span className="font-mono text-[11px] font-semibold text-primary hover:underline">
                                {task.taskIdentifier || 'TSK-01'}
                              </span>
                            </div>
                            <div className="flex items-center gap-1">
                              {getPriorityBadge(task.priority)}
                              {task.storyPoints > 0 && (
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-secondary text-foreground-muted">
                                  {task.storyPoints}pt
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Card Title */}
                          <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                            {task.title}
                          </h4>

                          {/* Description preview */}
                          {task.description && (
                            <p className="text-[11px] text-foreground-muted line-clamp-2 leading-relaxed">
                              {task.description}
                            </p>
                          )}

                          {/* Card Bottom Meta */}
                          <div className="pt-1.5 border-t border-border/50 flex items-center justify-between text-[11px] text-foreground-muted">
                            <div className="flex items-center gap-2">
                              {task.assignee ? (
                                <div className="flex items-center gap-1 text-[11px]">
                                  <div className="h-4 w-4 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[9px]">
                                    {task.assignee.name?.charAt(0) || 'U'}
                                  </div>
                                  <span className="text-[10px] text-foreground-secondary truncate max-w-[80px]">
                                    {task.assignee.name.split(' ')[0]}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-[10px] text-foreground-muted italic">Unassigned</span>
                              )}

                              {task.subtaskCount > 0 && (
                                <span className="flex items-center gap-0.5 text-[10px]">
                                  <CheckSquare className="h-3 w-3 text-foreground-muted" />
                                  <span>
                                    {task.completedSubtasks}/{task.subtaskCount}
                                  </span>
                                </span>
                              )}

                              {task.hasBlockers && (
                                <span className="flex items-center gap-0.5 text-[10px] text-destructive font-medium">
                                  <ShieldAlert className="h-3 w-3" />
                                  <span>Blocked</span>
                                </span>
                              )}
                            </div>

                            {task.sprint && (
                              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded bg-secondary text-foreground-muted truncate max-w-[90px]">
                                {task.sprint.name}
                              </span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['board', projectId] });
            queryClient.invalidateQueries({ queryKey: ['tasks', projectId] });
          }}
        />
      )}

      {/* Quick Task Creation Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title={`Create New Task (${targetStatus})`}
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Title *</label>
            <Input
              placeholder="e.g. Implement webhook retry backoff policy"
              value={taskTitle}
              onChange={(e) => setTaskTitle(e.target.value)}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Description</label>
            <Textarea
              placeholder="Detailed acceptance criteria and technical implementation requirements..."
              value={taskDesc}
              onChange={(e) => setTaskDesc(e.target.value)}
              className="text-xs min-h-[90px]"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Work Item Type</label>
              <select
                value={taskType}
                onChange={(e) => setTaskType(e.target.value as TaskType)}
                className="w-full h-9 px-2 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-none"
              >
                <option value="TASK">Task</option>
                <option value="STORY">User Story</option>
                <option value="BUG">Bug</option>
                <option value="EPIC">Epic</option>
                <option value="TECH_DEBT">Tech Debt</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Priority</label>
              <select
                value={taskPriority}
                onChange={(e) => setTaskPriority(e.target.value as TaskPriority)}
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
              disabled={!taskTitle.trim()}
              className="text-xs"
            >
              Create Task
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Board Column & WIP Settings Dialog */}
      <Dialog
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        title="Board Column & WIP Limit Configuration"
      >
        <div className="space-y-4 pt-2">
          <p className="text-xs text-foreground-muted">
            Configure work-in-progress (WIP) thresholds for each column to maintain flow and eliminate delivery bottlenecks. Set limit to 0 for unlimited.
          </p>

          <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
            {columns.map((col: any) => (
              <div
                key={col.id}
                className="p-3 rounded-lg border border-border bg-background-secondary flex items-center justify-between gap-3"
              >
                <div>
                  <span className="font-semibold text-xs text-foreground">{col.name}</span>
                  <span className="text-[11px] text-foreground-muted block font-mono">
                    Status: {col.statusValue}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="text-[11px] text-foreground-muted">WIP Limit:</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    defaultValue={col.wipLimit || 0}
                    onBlur={(e) => {
                      const val = Number(e.target.value);
                      if (val !== col.wipLimit) {
                        updateColumnMutation.mutate({ columnId: col.id, wipLimit: val });
                      }
                    }}
                    className="w-16 h-8 text-center text-xs rounded-lg border border-border bg-background text-foreground font-mono focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-end pt-3 border-t border-border">
            <Button size="sm" variant="primary" onClick={() => setIsSettingsOpen(false)} className="text-xs">
              Done
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
