'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Button } from '../ui/button';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  CheckSquare,
  FileText,
  Bug,
  MessageSquare,
  Target,
  Users,
  Flame,
  Plus
} from 'lucide-react';

export type CreateEntityType =
  | 'task'
  | 'project'
  | 'doc'
  | 'bug'
  | 'discussion'
  | 'milestone'
  | 'team'
  | 'sprint';

interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeProjectId?: string;
}

export function QuickCreateModal({ isOpen, onClose, activeProjectId }: QuickCreateModalProps) {
  const router = useRouter();
  const { currentWorkspace, user } = useAuthStore();
  const [selectedType, setSelectedType] = useState<CreateEntityType>('task');

  // Load projects for dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['workspace-projects-list', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/projects?workspaceId=${currentWorkspace.id}`);
      return res.data?.projects || res.data || [];
    },
    enabled: isOpen && !!currentWorkspace?.id
  });

  const [projectId, setProjectId] = useState<string>(activeProjectId || '');
  React.useEffect(() => {
    if (activeProjectId) {
      setProjectId(activeProjectId);
    } else if (projects.length > 0 && !projectId) {
      setProjectId(projects[0].id);
    }
  }, [activeProjectId, projects, projectId]);

  // Form states
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState('MEDIUM');
  const [severity, setSeverity] = useState('HIGH');
  const [targetDate, setTargetDate] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Permission check
  const isViewer = currentWorkspace?.role === 'VIEWER';

  const resetForm = () => {
    setTitle('');
    setDescription('');
    setError(null);
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    if (isViewer) {
      setError('You have read-only access (Viewer role) and cannot create items in this workspace.');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const selectedProj = projectId || (projects[0]?.id as string);

      switch (selectedType) {
        case 'project': {
          const res = await api.post<any>('/projects', {
            workspaceId: currentWorkspace?.id,
            name: title.trim(),
            description: description.trim() || undefined,
            projectType: 'Web Application',
            category: 'Engineering'
          });
          if (res.success && res.data) {
            onClose();
            resetForm();
            router.push(`/projects/${res.data.id}`);
          }
          break;
        }

        case 'task': {
          if (!selectedProj) throw new Error('Please select a project for this task.');
          const res = await api.post<any>('/tasks', {
            projectId: selectedProj,
            title: title.trim(),
            description: description.trim() || undefined,
            priority,
            taskType: 'TASK',
            storyPoints: 3
          });
          if (res.success) {
            onClose();
            resetForm();
            router.push(`/projects/${selectedProj}?tab=tasks`);
          }
          break;
        }

        case 'doc': {
          if (!selectedProj) throw new Error('Please select a project for this document.');
          // Find first category
          const catRes = await api.get<any[]>(`/projects/${selectedProj}/categories`);
          const cats = catRes.data || [];
          const catId = cats[0]?.id;
          if (!catId) throw new Error('No category available in selected project.');

          const res = await api.post<any>('/documents', {
            projectId: selectedProj,
            categoryId: catId,
            title: title.trim(),
            fileName: `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.md`,
            description: description.trim() || undefined,
            content: `# ${title.trim()}\n\n${description.trim()}\n`
          });
          if (res.success && res.data) {
            onClose();
            resetForm();
            router.push(`/projects/${selectedProj}/docs/${res.data.id}`);
          }
          break;
        }

        case 'bug': {
          if (!selectedProj) throw new Error('Please select a project for this defect.');
          const res = await api.post<any>('/bugs', {
            projectId: selectedProj,
            title: title.trim(),
            description: description.trim() || undefined,
            severity,
            priority: 'HIGH',
            status: 'OPEN',
            environment: 'Staging'
          });
          if (res.success) {
            onClose();
            resetForm();
            router.push(`/projects/${selectedProj}?tab=bugs`);
          }
          break;
        }

        case 'discussion': {
          if (!selectedProj) throw new Error('Please select a project for this discussion.');
          const res = await api.post<any>('/discussions', {
            projectId: selectedProj,
            title: title.trim(),
            content: description.trim() || 'Opening discussion topic for team review.'
          });
          if (res.success) {
            onClose();
            resetForm();
            router.push(`/projects/${selectedProj}?tab=discussions`);
          }
          break;
        }

        case 'milestone': {
          if (!selectedProj) throw new Error('Please select a project for this milestone.');
          const res = await api.post<any>('/milestones', {
            projectId: selectedProj,
            name: title.trim(),
            description: description.trim() || undefined,
            targetDate: targetDate ? new Date(targetDate).toISOString() : new Date().toISOString()
          });
          if (res.success) {
            onClose();
            resetForm();
            router.push(`/projects/${selectedProj}?tab=roadmap`);
          }
          break;
        }

        case 'sprint': {
          if (!selectedProj) throw new Error('Please select a project for this sprint.');
          const res = await api.post<any>('/sprints', {
            projectId: selectedProj,
            name: title.trim(),
            goal: description.trim() || undefined,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString()
          });
          if (res.success) {
            onClose();
            resetForm();
            router.push(`/projects/${selectedProj}?tab=sprints`);
          }
          break;
        }

        case 'team': {
          onClose();
          resetForm();
          router.push('/team?action=invite');
          break;
        }
      }
    } catch (err: any) {
      setError(err?.message || 'Failed to create item');
    } finally {
      setIsLoading(false);
    }
  };

  const entityTypes: Array<{ id: CreateEntityType; label: string; icon: any }> = [
    { id: 'task', label: 'Task', icon: CheckSquare },
    { id: 'project', label: 'Project', icon: FolderKanban },
    { id: 'doc', label: 'Document', icon: FileText },
    { id: 'bug', label: 'Bug / Defect', icon: Bug },
    { id: 'discussion', label: 'Discussion', icon: MessageSquare },
    { id: 'milestone', label: 'Milestone', icon: Target },
    { id: 'sprint', label: 'Sprint', icon: Flame },
    { id: 'team', label: 'Invite Member', icon: Users }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="xl">
      <div className="space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Plus className="h-4 w-4" />
            </div>
            <div>
              <h2 className="text-sm font-semibold text-foreground">Quick Create</h2>
              <p className="text-xs text-foreground-muted">
                Create new SDLC work items, documents, and project resources
              </p>
            </div>
          </div>
        </div>

        {/* Entity Type Picker Tabs */}
        <div className="grid grid-cols-4 sm:grid-cols-8 gap-1.5 p-1 bg-background-secondary rounded-lg border border-border">
          {entityTypes.map((et) => {
            const Icon = et.icon;
            const isSelected = selectedType === et.id;
            return (
              <button
                key={et.id}
                type="button"
                onClick={() => {
                  setSelectedType(et.id);
                  setError(null);
                }}
                className={`flex flex-col items-center justify-center p-2 rounded-md text-xs transition-colors ${
                  isSelected
                    ? 'bg-card text-primary font-semibold shadow-xs border border-border'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
                }`}
              >
                <Icon className={`h-4 w-4 mb-1 ${isSelected ? 'text-primary' : 'text-foreground-muted'}`} />
                <span className="truncate text-[11px]">{et.label}</span>
              </button>
            );
          })}
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <form onSubmit={handleCreate} className="space-y-4">
          {/* Project selector for items that need project context */}
          {selectedType !== 'project' && selectedType !== 'team' && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">
                Target Project *
              </label>
              <select
                value={projectId}
                onChange={(e) => setProjectId(e.target.value)}
                className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs focus:ring-1 focus:ring-primary"
                required
              >
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.projectType || 'Project'})
                  </option>
                ))}
              </select>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              {selectedType === 'bug'
                ? 'Defect Summary *'
                : selectedType === 'sprint'
                ? 'Sprint Name *'
                : selectedType === 'team'
                ? "Member's Email Address *"
                : 'Title *'}
            </label>
            <Input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder={
                selectedType === 'bug'
                  ? 'e.g. 504 Gateway Timeout during service rollout'
                  : selectedType === 'task'
                  ? 'e.g. Implement OAuth2 refresh token rotation'
                  : selectedType === 'doc'
                  ? 'e.g. Threat Modeling & Security Architecture'
                  : 'Enter title...'
              }
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1">
              Description / Details
            </label>
            <Textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Provide background, requirements, acceptance criteria or reproduction steps..."
            />
          </div>

          {selectedType === 'task' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          )}

          {selectedType === 'bug' && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1">Severity</label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value)}
                  className="w-full px-3 py-1.5 rounded-lg border border-border bg-background text-foreground text-xs"
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>
              </div>
            </div>
          )}

          {selectedType === 'milestone' && (
            <div>
              <label className="block text-xs font-medium text-foreground mb-1">Target Date</label>
              <Input
                type="date"
                value={targetDate}
                onChange={(e) => setTargetDate(e.target.value)}
              />
            </div>
          )}

          <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-border">
            <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isLoading}
              disabled={!title.trim() || isViewer}
            >
              Create {entityTypes.find((e) => e.id === selectedType)?.label}
            </Button>
          </div>
        </form>
      </div>
    </Dialog>
  );
}
