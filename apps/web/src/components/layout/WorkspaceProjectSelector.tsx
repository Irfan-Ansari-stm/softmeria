'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { FolderKanban } from 'lucide-react';

interface WorkspaceProjectSelectorProps {
  selectedProjectId: string;
  onSelectProject: (id: string) => void;
  title?: string;
  subtitle?: string;
}

export function WorkspaceProjectSelector({
  selectedProjectId,
  onSelectProject,
  title,
  subtitle
}: WorkspaceProjectSelectorProps) {
  const { currentWorkspace } = useAuthStore();

  const { data: projects = [] } = useQuery({
    queryKey: ['workspace-projects-selector', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/projects?workspaceId=${currentWorkspace.id}`);
      return res.data?.projects || res.data || [];
    },
    enabled: !!currentWorkspace?.id
  });

  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
      <div>
        <h1 className="text-xl font-bold tracking-tight text-foreground">{title || 'Module'}</h1>
        <p className="text-xs text-foreground-muted">
          {subtitle || 'Manage SDLC resources across your enterprise workspace'}
        </p>
      </div>

      <div className="flex items-center gap-2">
        <label className="text-xs text-foreground-muted whitespace-nowrap flex items-center gap-1.5">
          <FolderKanban className="h-3.5 w-3.5 text-primary" /> Active Project:
        </label>
        <select
          value={selectedProjectId}
          onChange={(e) => onSelectProject(e.target.value)}
          className="px-3 py-1.5 rounded-lg border border-border bg-card text-foreground text-xs focus:ring-1 focus:ring-primary shadow-xs font-medium"
        >
          <option value="ALL">All Projects (Workspace)</option>
          {projects.map((p: any) => (
            <option key={p.id} value={p.id}>
              {p.name}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}
