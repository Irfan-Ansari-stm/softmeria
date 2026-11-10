'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  Plus,
  Upload,
  Search,
  ArrowRight,
  LayoutGrid,
  List,
  Copy,
  Archive,
  Trash2,
  MoreVertical,
  CheckCircle2,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog } from '../../components/ui/dialog';
import { CreateProjectModal } from './CreateProjectModal';
import { ImportModal } from '../imports-exports/ImportModal';
import { PROJECT_TYPES, PROJECT_STATUSES } from '@devblueprint/shared';

export function ProjectsListView() {
  const queryClient = useQueryClient();
  const searchParams = useSearchParams();
  const { currentWorkspace } = useAuthStore();

  const [isCreateOpen, setIsCreateOpen] = useState(
    searchParams?.get('action') === 'new-project'
  );
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [sortBy, setSortBy] = useState<'updated' | 'name' | 'created'>('updated');

  // Delete Confirmation State
  const [projectToDelete, setProjectToDelete] = useState<{ id: string; name: string } | null>(null);

  // Load Projects from PostgreSQL
  const { data: rawProjects, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['projects', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/projects?workspaceId=${currentWorkspace.id}`);
      return res.data;
    },
    enabled: !!currentWorkspace?.id
  });

  const projects: any[] = Array.isArray(rawProjects)
    ? rawProjects
    : Array.isArray(rawProjects?.projects)
    ? rawProjects.projects
    : [];

  const safeProjects = Array.isArray(projects) ? projects : [];

  // Duplicate Project Mutation
  const duplicateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/projects/${id}/duplicate`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?.id] });
    }
  });

  // Archive Project Mutation
  const archiveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/projects/${id}/archive`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?.id] });
    }
  });

  // Delete Project Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/projects/${id}`);
      return res.data;
    },
    onSuccess: () => {
      setProjectToDelete(null);
      queryClient.invalidateQueries({ queryKey: ['projects', currentWorkspace?.id] });
    }
  });

  // Filter & Sort
  const filteredProjects = safeProjects
    .filter((p: any) => {
      const matchesSearch =
        p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (p.projectType && p.projectType.toLowerCase().includes(searchTerm.toLowerCase()));

      const matchesType = selectedType === 'ALL' || p.projectType === selectedType;
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;

      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a: any, b: any) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'created') return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
    });

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 min-w-0">
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

        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsImportOpen(true)}
            className="text-xs gap-1.5 whitespace-nowrap shrink-0 h-8"
          >
            <Upload className="h-3.5 w-3.5 shrink-0" />
            <span>Import Markdown / ZIP</span>
          </Button>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs gap-1.5 whitespace-nowrap shrink-0 shadow-xs h-8"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>Create Project</span>
          </Button>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load projects: {(error as any)?.message || 'Network error'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {/* Filter, Search & View Controls Bar */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search projects by name, description, or stack..."
            className="w-full pl-9 pr-4 py-1.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          {/* Project Type Filter */}
          <select
            value={selectedType}
            onChange={(e) => setSelectedType(e.target.value)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs"
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
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs"
          >
            <option value="ALL">All Statuses</option>
            {PROJECT_STATUSES.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs"
          >
            <option value="updated">Recently Updated</option>
            <option value="created">Recently Created</option>
            <option value="name">Name (A-Z)</option>
          </select>

          {/* Grid vs List toggle */}
          <div className="flex items-center border border-border rounded-lg overflow-hidden bg-background">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 transition-colors ${viewMode === 'grid' ? 'bg-secondary text-primary font-bold' : 'text-foreground-muted hover:text-foreground'}`}
              title="Grid View"
            >
              <LayoutGrid className="h-4 w-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 transition-colors ${viewMode === 'list' ? 'bg-secondary text-primary font-bold' : 'text-foreground-muted hover:text-foreground'}`}
              title="List View"
            >
              <List className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Projects Grid or List View */}
      {viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-4 gap-6">
          {isLoading ? (
            <div className="col-span-full py-16 text-center text-xs text-foreground-muted">
              Loading projects from database...
            </div>
          ) : filteredProjects.length === 0 ? (
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
                className="text-xs gap-1.5 whitespace-nowrap shadow-xs"
              >
                <Plus className="h-3.5 w-3.5 shrink-0" />
                <span>New Project</span>
              </Button>
            </div>
          ) : (
            filteredProjects.map((project: any) => (
              <Card
                key={project.id}
                className="hover:border-primary/50 transition-all flex flex-col justify-between group shadow-xs min-w-0"
              >
                <CardHeader className="p-5 pb-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0 flex-1">
                      <div
                        className="h-9 w-9 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                        style={{ backgroundColor: project.color || '#2563EB' }}
                      >
                        <FolderKanban className="h-4.5 w-4.5 shrink-0" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/projects/${project.id}`}
                          className="font-semibold text-sm text-foreground hover:text-primary transition-colors truncate block"
                          title={project.name}
                        >
                          {project.name}
                        </Link>
                        <span className="text-[11px] text-foreground-muted block truncate">
                          {project.projectType}
                        </span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px] py-0 px-2 shrink-0 whitespace-nowrap">
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

                  <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => duplicateMutation.mutate(project.id)}
                        disabled={duplicateMutation.isPending}
                        className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                        title="Duplicate Project"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => archiveMutation.mutate(project.id)}
                        disabled={archiveMutation.isPending}
                        className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                        title="Archive Project"
                      >
                        <Archive className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete({ id: project.id, name: project.name })}
                        className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                        title="Delete Project"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>

                    <Link
                      href={`/projects/${project.id}`}
                      className="text-primary hover:underline font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0 ml-auto"
                    >
                      <span>Open Workspace</span>
                      <ArrowRight className="h-3.5 w-3.5 shrink-0" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      ) : (
        /* List View */
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="py-3 px-4">Project</th>
                <th className="py-3 px-4 w-40">Type</th>
                <th className="py-3 px-4 w-48">Blueprint Progress</th>
                <th className="py-3 px-4 w-28 text-center">Status</th>
                <th className="py-3 px-4 w-32">Updated</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {filteredProjects.map((p: any) => (
                <tr key={p.id} className="hover:bg-background-secondary/50 transition-colors">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-2.5">
                      <div
                        className="h-7 w-7 rounded-md flex items-center justify-center text-white shrink-0 text-xs font-bold"
                        style={{ backgroundColor: p.color || '#2563EB' }}
                      >
                        <FolderKanban className="h-3.5 w-3.5" />
                      </div>
                      <div className="min-w-0">
                        <Link
                          href={`/projects/${p.id}`}
                          className="font-semibold text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {p.name}
                        </Link>
                        <p className="text-[10px] text-foreground-muted truncate max-w-md">
                          {p.description || 'No description provided.'}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-foreground-secondary">{p.projectType}</td>
                  <td className="py-3.5 px-4">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span>{p.completionPercentage}%</span>
                        <span className="text-foreground-muted">
                          {p.completedDocuments}/{p.totalDocuments}
                        </span>
                      </div>
                      <Progress value={p.completionPercentage} size="sm" />
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-center">
                    <Badge variant="outline" className="text-[10px]">
                      {p.status}
                    </Badge>
                  </td>
                  <td className="py-3.5 px-4 text-[11px] text-foreground-muted">
                    {new Date(p.updatedAt).toLocaleDateString()}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => duplicateMutation.mutate(p.id)}
                        className="p-1 rounded text-foreground-muted hover:text-foreground"
                        title="Duplicate"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                      <button
                        onClick={() => setProjectToDelete({ id: p.id, name: p.name })}
                        className="p-1 rounded text-foreground-muted hover:text-destructive"
                        title="Delete"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                      <Link href={`/projects/${p.id}`}>
                        <Button variant="secondary" size="sm" className="text-xs h-7 px-2.5 ml-1">
                          Open
                        </Button>
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {projectToDelete && (
        <Dialog
          isOpen={!!projectToDelete}
          onClose={() => setProjectToDelete(null)}
          maxWidth="sm"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-destructive/10 text-destructive flex items-center justify-center shrink-0">
                <Trash2 className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-semibold text-foreground">Delete Project</h3>
                <p className="text-xs text-foreground-muted">
                  Are you sure you want to delete <span className="font-semibold text-foreground">{projectToDelete.name}</span>?
                </p>
              </div>
            </div>
            <p className="text-xs text-foreground-secondary">
              This action cannot be undone. All documents, tasks, test runs, sprints, and release records associated with this project will be removed.
            </p>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setProjectToDelete(null)}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                variant="destructive"
                size="sm"
                isLoading={deleteMutation.isPending}
                onClick={() => deleteMutation.mutate(projectToDelete.id)}
              >
                Confirm Delete
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Create Project Modal */}
      <CreateProjectModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />

      {/* Import Modal */}
      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          projects={safeProjects}
        />
      )}
    </div>
  );
}
