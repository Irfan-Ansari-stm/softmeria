'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  Upload,
  Search,
  ArrowRight
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { CreateProjectModal } from './CreateProjectModal';
import { ImportModal } from '../imports-exports/ImportModal';
import { PROJECT_TYPES, PROJECT_STATUSES } from '@devblueprint/shared';

export function ProjectsListView() {
  const searchParams = useSearchParams();
  const { currentWorkspace } = useAuthStore();

  const [isCreateOpen, setIsCreateOpen] = useState(
    searchParams?.get('action') === 'new-project'
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  const { data: projects = [], isLoading } = useQuery({
    queryKey: ['projects', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any[]>(`/projects?workspaceId=${currentWorkspace.id}`);
      return res.data || [];
    },
    enabled: !!currentWorkspace?.id
  });

  const filteredProjects = projects.filter((p: any) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      p.projectType.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesType = selectedType === 'ALL' || p.projectType === selectedType;
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <FolderKanban className="h-6 w-6 text-primary" />
            <span>Software Projects</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Manage your technical documentation workspaces, architecture blueprints, and engineering roadmaps.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="text-xs gap-1.5"
          >
            <Upload className="h-3.5 w-3.5" />
            <span>Import Markdown / ZIP</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Project</span>
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, description, or stack..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        {/* Project Type Filter */}
        <select
          value={selectedType}
          onChange={(e) => setSelectedType(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto shadow-xs"
        >
          <option value="ALL">All Types</option>
          {PROJECT_TYPES.map((t) => (
            <option key={t} value={t}>
              {t}
            </option>
          ))}
        </select>

        {/* Status Filter */}
        <select
          value={selectedStatus}
          onChange={(e) => setSelectedStatus(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto shadow-xs"
        >
          <option value="ALL">All Statuses</option>
          {PROJECT_STATUSES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
      </div>

      {/* Projects Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredProjects.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-dashed border-border rounded-xl space-y-3 bg-card">
            <FolderKanban className="h-10 w-10 text-foreground-muted mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">No projects found</h3>
            <p className="text-xs text-foreground-muted max-w-sm mx-auto">
              Get started by creating your first software project or importing an existing Markdown repository.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="text-xs gap-1.5"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </Button>
          </div>
        ) : (
          filteredProjects.map((project: any) => (
            <Card
              key={project.id}
              className="hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm"
            >
              <CardHeader className="p-5 pb-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: project.color || '#2563EB' }}
                    >
                      <FolderKanban className="h-4.5 w-4.5" />
                    </div>
                    <div className="min-w-0">
                      <Link
                        href={`/projects/${project.id}`}
                        className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block"
                      >
                        {project.name}
                      </Link>
                      <span className="text-[11px] text-foreground-muted">
                        {project.projectType}
                      </span>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px] py-0 px-2 shrink-0">
                    {project.status}
                  </Badge>
                </div>

                {project.description && (
                  <p className="text-xs text-foreground-secondary line-clamp-2 mt-3 leading-relaxed">
                    {project.description}
                  </p>
                )}
              </CardHeader>

              <CardContent className="p-5 pt-0 space-y-4">
                {/* Tech Stack */}
                {project.techStack && project.techStack.length > 0 && (
                  <div className="flex flex-wrap gap-1">
                    {project.techStack.slice(0, 4).map((tech: string) => (
                      <span
                        key={tech}
                        className="px-2 py-0.5 rounded bg-secondary text-[10px] font-mono text-foreground-secondary border border-border"
                      >
                        {tech}
                      </span>
                    ))}
                    {project.techStack.length > 4 && (
                      <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-foreground-muted font-mono border border-border">
                        +{project.techStack.length - 4}
                      </span>
                    )}
                  </div>
                )}

                {/* Documentation Completion */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-xs">
                    <span className="text-foreground-muted">Documentation Completion</span>
                    <span className="font-mono text-foreground font-semibold">
                      {project.completionPercentage}% ({project.completedDocuments}/{project.totalDocuments})
                    </span>
                  </div>
                  <Progress value={project.completionPercentage} size="sm" />
                </div>

                <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                  <span className="text-foreground-muted text-[11px]">
                    Updated {new Date(project.updatedAt).toLocaleDateString()}
                  </span>
                  <Link
                    href={`/projects/${project.id}`}
                    className="text-primary hover:underline font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                  >
                    <span>Open Workspace</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>

      {/* Create Project Modal */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      {/* Import Modal */}
      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          projects={projects}
        />
      )}
    </div>
  );
}
