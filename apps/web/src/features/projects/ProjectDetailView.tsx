'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import {
  FolderKanban,
  Download,
  Copy,
  Plus,
  FileText,
  Upload,
  FolderOpen,
  GitBranch,
  ExternalLink,
  LayoutDashboard,
  Kanban,
  CheckSquare,
  Flame,
  Target,
  Bug,
  ShieldCheck,
  Rocket,
  Users,
  Clock,
  ShieldAlert,
  MessageSquare,
  BarChart3,
  Palette,
  Code2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { ImportModal } from '../imports-exports/ImportModal';

// SDLC Module Sub-views
import { ProjectOverviewView } from '../overview/ProjectOverviewView';
import { KanbanBoardView } from '../board/KanbanBoardView';
import { TasksTableView } from '../tasks/TasksTableView';
import { SprintsView } from '../sprints/SprintsView';
import { RoadmapView } from '../roadmap/RoadmapView';
import { BugsView } from '../bugs/BugsView';
import { TestingView } from '../testing/TestingView';
import { ReleasesView } from '../releases/ReleasesView';
import { DesignSystemView } from '../design/DesignSystemView';
import { DevelopmentView } from '../development/DevelopmentView';
import { ProjectTeamView } from '../team/ProjectTeamView';
import { TimeTrackingView } from '../time/TimeTrackingView';
import { RisksView } from '../risks/RisksView';
import { DiscussionsView } from '../discussions/DiscussionsView';
import { ProjectReportsView } from '../reports/ProjectReportsView';

interface ProjectDetailViewProps {
  projectId: string;
}

export function ProjectDetailView({ projectId }: ProjectDetailViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const urlTab = searchParams?.get('tab');
  const [activeTab, setActiveTab] = useState<string>(urlTab || 'overview');

  React.useEffect(() => {
    if (urlTab) {
      setActiveTab(urlTab);
    }
  }, [urlTab]);

  const [isAddCatOpen, setIsAddCatOpen] = useState(false);
  const [isAddDocOpen, setIsAddDocOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [targetCategoryId, setTargetCategoryId] = useState('');

  // Add category form state
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  // Add document form state
  const [docTitle, setDocTitle] = useState('');
  const [docDesc, setDocDesc] = useState('');
  const [docFileName, setDocFileName] = useState('');

  // Load project data
  const { data: project, isLoading: isProjectLoading } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    }
  });

  // Load categories & documents tree
  const { data: categories = [], refetch: refetchCategories } = useQuery({
    queryKey: ['categories-tree', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/projects/${projectId}/categories`);
      return res.data || [];
    }
  });

  // Create Category Mutation
  const createCategoryMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post(`/projects/${projectId}/categories`, {
        name: catName,
        description: catDesc
      });
      return res.data;
    },
    onSuccess: () => {
      setCatName('');
      setCatDesc('');
      setIsAddCatOpen(false);
      refetchCategories();
    }
  });

  // Create Document Mutation
  const createDocMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<any>('/documents', {
        projectId,
        categoryId: targetCategoryId || categories[0]?.id,
        title: docTitle,
        fileName: docFileName || undefined,
        description: docDesc || undefined,
        content: `# ${docTitle}\n\nDocument description and technical foundation.\n`
      });
      return res.data;
    },
    onSuccess: (newDoc: any) => {
      setDocTitle('');
      setDocDesc('');
      setDocFileName('');
      setIsAddDocOpen(false);
      refetchCategories();
      router.push(`/projects/${projectId}/docs/${newDoc.id}`);
    }
  });

  // Duplicate Project Mutation
  const duplicateProjectMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<any>(`/projects/${projectId}/duplicate`, {});
      return res.data;
    },
    onSuccess: (newProject: any) => {
      router.push(`/projects/${newProject.id}`);
    }
  });

  // Export Project Blueprint as ZIP
  const handleExportZip = async () => {
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('devblueprint_token') : '';
      const response = await fetch(`http://localhost:4000/api/projects/${projectId}/export/zip`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      if (!response.ok) throw new Error('Export failed');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${project.slug}-blueprint.zip`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      console.error(err);
      alert('Failed to export zip blueprint');
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">In Progress</Badge>;
      case 'IN_REVIEW':
        return <Badge variant="warning">In Review</Badge>;
      default:
        return <Badge variant="outline">Draft</Badge>;
    }
  };

  if (isProjectLoading || !project) {
    return (
      <div className="p-8 text-center text-xs text-foreground-muted">
        Loading project workspace...
      </div>
    );
  }

  const tabsList = [
    { id: 'overview', label: 'Overview', icon: <LayoutDashboard className="h-3.5 w-3.5" /> },
    { id: 'board', label: 'Board', icon: <Kanban className="h-3.5 w-3.5" /> },
    { id: 'tasks', label: 'Tasks', icon: <CheckSquare className="h-3.5 w-3.5" /> },
    { id: 'sprints', label: 'Sprints', icon: <Flame className="h-3.5 w-3.5" /> },
    { id: 'roadmap', label: 'Roadmap', icon: <Target className="h-3.5 w-3.5" /> },
    { id: 'docs', label: 'Documentation', icon: <FileText className="h-3.5 w-3.5" /> },
    { id: 'design', label: 'Design System', icon: <Palette className="h-3.5 w-3.5" /> },
    { id: 'development', label: 'Development & Repos', icon: <Code2 className="h-3.5 w-3.5" /> },
    { id: 'bugs', label: 'Bugs & QA', icon: <Bug className="h-3.5 w-3.5" /> },
    { id: 'testing', label: 'Testing', icon: <ShieldCheck className="h-3.5 w-3.5" /> },
    { id: 'releases', label: 'Releases', icon: <Rocket className="h-3.5 w-3.5" /> },
    { id: 'team', label: 'Teams', icon: <Users className="h-3.5 w-3.5" /> },
    { id: 'time', label: 'Time Tracking', icon: <Clock className="h-3.5 w-3.5" /> },
    { id: 'risks', label: 'Risks', icon: <ShieldAlert className="h-3.5 w-3.5" /> },
    { id: 'discussions', label: 'Discussions', icon: <MessageSquare className="h-3.5 w-3.5" /> },
    { id: 'reports', label: 'Reports', icon: <BarChart3 className="h-3.5 w-3.5" /> },
  ];

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 min-w-0">
      {/* Project Header Banner */}
      <div className="p-6 rounded-xl border border-border bg-card space-y-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div
              className="h-12 w-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-sm"
              style={{ backgroundColor: project.color || '#2563EB' }}
            >
              <FolderKanban className="h-6 w-6" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-foreground">
                  {project.name}
                </h1>
                <Badge variant="outline" className="text-xs">
                  {project.status}
                </Badge>
                <Badge variant="default" className="text-xs font-mono">
                  {project.visibility}
                </Badge>
              </div>
              <p className="text-xs text-foreground-secondary max-w-2xl leading-relaxed">
                {project.description || 'No description provided.'}
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsImportOpen(true)}
              className="text-xs gap-1.5"
            >
              <Upload className="h-3.5 w-3.5" />
              <span>Import</span>
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => duplicateProjectMutation.mutate()}
              isLoading={duplicateProjectMutation.isPending}
              className="text-xs gap-1.5"
            >
              <Copy className="h-3.5 w-3.5" />
              <span>Duplicate</span>
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleExportZip}
              className="text-xs gap-1.5 shadow-sm"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export Complete Blueprint (.zip)</span>
            </Button>
          </div>
        </div>

        {/* Tech Stack & Git Link */}
        <div className="flex flex-wrap items-center justify-between gap-4 pt-4 border-t border-border text-xs">
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="text-foreground-muted text-[11px] font-medium mr-1">Tech Stack:</span>
            {(project.techStack || []).map((tech: string) => (
              <span
                key={tech}
                className="px-2 py-0.5 rounded bg-secondary text-[11px] font-mono text-foreground-secondary border border-border"
              >
                {tech}
              </span>
            ))}
          </div>

          {project.repositoryUrl && (
            <a
              href={project.repositoryUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 text-primary hover:underline text-xs font-medium"
            >
              <GitBranch className="h-3.5 w-3.5" />
              <span>Git Repository</span>
              <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </div>
      </div>

      {/* SDLC Navigation Tab Bar */}
      <div className="border-b border-border overflow-x-auto scrollbar-thin">
        <div className="flex items-center space-x-1 min-w-max pb-px text-sm">
          {tabsList.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2.5 font-medium text-xs rounded-t-lg transition-all border-b-2 ${
                  isActive
                    ? 'border-primary text-primary bg-primary/10'
                    : 'border-transparent text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Tab Panels */}
      {activeTab === 'overview' && (
        <ProjectOverviewView projectId={projectId} onNavigateTab={setActiveTab} />
      )}

      {activeTab === 'board' && (
        <KanbanBoardView projectId={projectId} />
      )}

      {activeTab === 'tasks' && (
        <TasksTableView projectId={projectId} />
      )}

      {activeTab === 'sprints' && (
        <SprintsView projectId={projectId} />
      )}

      {activeTab === 'roadmap' && (
        <RoadmapView projectId={projectId} />
      )}

      {activeTab === 'design' && (
        <DesignSystemView projectId={projectId} />
      )}

      {activeTab === 'development' && (
        <DevelopmentView projectId={projectId} />
      )}

      {activeTab === 'bugs' && (
        <BugsView projectId={projectId} />
      )}

      {activeTab === 'testing' && (
        <TestingView projectId={projectId} />
      )}

      {activeTab === 'releases' && (
        <ReleasesView projectId={projectId} />
      )}

      {activeTab === 'team' && (
        <ProjectTeamView projectId={projectId} />
      )}

      {activeTab === 'time' && (
        <TimeTrackingView projectId={projectId} />
      )}

      {activeTab === 'risks' && (
        <RisksView projectId={projectId} />
      )}

      {activeTab === 'discussions' && (
        <DiscussionsView projectId={projectId} />
      )}

      {activeTab === 'reports' && (
        <ProjectReportsView projectId={projectId} />
      )}

      {activeTab === 'docs' && (
        <div className="space-y-6">
          {/* Progress Metric & Category Overview */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">
                    Documentation Blueprint Progress
                  </h3>
                  <p className="text-xs text-foreground-muted mt-0.5">
                    Calculated across required non-optional engineering specifications.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xl font-bold font-mono text-foreground">
                    {project.completionPercentage}%
                  </span>
                  <span className="text-xs text-foreground-muted">
                    ({project.completedDocuments} / {project.totalDocuments} completed)
                  </span>
                </div>
              </div>
              <Progress value={project.completionPercentage} size="md" />
            </CardContent>
          </Card>

          {/* Categories & Documents List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
                <FolderOpen className="h-4.5 w-4.5 text-amber-500" />
                <span>Documentation Categories & Blueprint Specifications</span>
              </h2>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsAddCatOpen(true)}
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Category</span>
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    setTargetCategoryId(categories[0]?.id || '');
                    setIsAddDocOpen(true);
                  }}
                  className="text-xs gap-1.5"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>New Document</span>
                </Button>
              </div>
            </div>

            {/* Categories Stack */}
            <div className="space-y-4">
              {categories.map((cat: any) => (
                <Card key={cat.id} className="overflow-hidden border-border bg-card">
                  <CardHeader className="p-4 bg-background-secondary border-b border-border flex flex-row items-center justify-between">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-foreground">
                          {cat.name}
                        </span>
                        <span className="font-mono text-[10px] text-foreground-muted px-1.5 py-0.5 rounded bg-background border border-border">
                          {cat.slug}
                        </span>
                      </div>
                      {cat.description && (
                        <p className="text-xs text-foreground-muted">{cat.description}</p>
                      )}
                    </div>

                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <span className="text-xs font-semibold text-foreground font-mono">
                          {cat.completionPercentage}%
                        </span>
                        <span className="text-[10px] text-foreground-muted block">
                          {cat.completedCount} / {cat.documentCount} Done
                        </span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => {
                          setTargetCategoryId(cat.id);
                          setIsAddDocOpen(true);
                        }}
                        className="text-xs p-1 h-7"
                        title="Add document to category"
                      >
                        <Plus className="h-3.5 w-3.5 text-foreground-muted hover:text-foreground" />
                      </Button>
                    </div>
                  </CardHeader>

                  <CardContent className="p-0 divide-y divide-border">
                    {(cat.documents || []).length === 0 ? (
                      <div className="p-4 text-center text-xs text-foreground-muted italic">
                        No documents in this category yet.
                      </div>
                    ) : (
                      cat.documents.map((doc: any) => (
                        <Link
                          key={doc.id}
                          href={`/projects/${projectId}/docs/${doc.id}`}
                          className="p-3.5 flex items-center justify-between hover:bg-background-secondary transition-colors group block"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileText className="h-4 w-4 text-primary shrink-0" />
                            <div className="min-w-0">
                              <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                                {doc.title}
                              </p>
                              <p className="text-[11px] text-foreground-muted font-mono truncate">
                                {doc.fileName}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            {doc.isOptional && (
                              <Badge variant="outline" className="text-[10px] text-foreground-muted">
                                Optional
                              </Badge>
                            )}
                            {getStatusBadge(doc.status)}
                            <span className="text-xs text-foreground-muted font-mono">
                              v{doc.versionNumber}
                            </span>
                          </div>
                        </Link>
                      ))
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Category Dialog */}
      <Dialog
        isOpen={isAddCatOpen}
        onClose={() => setIsAddCatOpen(false)}
        title="Add Documentation Category"
        description="Create a logical grouping for related engineering architecture specifications."
      >
        <div className="space-y-4 pt-2">
          <Input
            label="Category Name"
            placeholder="e.g. Infrastructure & DevOps"
            value={catName}
            onChange={(e) => setCatName(e.target.value)}
          />
          <Textarea
            label="Description (Optional)"
            placeholder="Define what this documentation category covers..."
            value={catDesc}
            onChange={(e) => setCatDesc(e.target.value)}
          />
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddCatOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createCategoryMutation.mutate()}
              isLoading={createCategoryMutation.isPending}
              disabled={!catName.trim()}
            >
              Create Category
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Add Document Dialog */}
      <Dialog
        isOpen={isAddDocOpen}
        onClose={() => setIsAddDocOpen(false)}
        title="Create New Architecture Document"
        description="Add a technical specification document to your project blueprint."
      >
        <div className="space-y-4 pt-2">
          <div className="space-y-1.5">
            <label className="block text-xs font-medium text-foreground-secondary">
              Target Category
            </label>
            <select
              value={targetCategoryId}
              onChange={(e) => setTargetCategoryId(e.target.value)}
              className="w-full h-9 rounded-lg border border-border bg-background px-3 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              {categories.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Document Title"
            placeholder="e.g. Database Schema & Migration Strategy"
            value={docTitle}
            onChange={(e) => {
              setDocTitle(e.target.value);
              if (!docFileName) {
                setDocFileName(
                  e.target.value
                    .toLowerCase()
                    .replace(/[^a-z0-9]+/g, '-')
                    .replace(/(^-|-$)/g, '') + '.md'
                );
              }
            }}
          />

          <Input
            label="File Name"
            placeholder="e.g. database-schema.md"
            value={docFileName}
            onChange={(e) => setDocFileName(e.target.value)}
          />

          <Textarea
            label="Description (Optional)"
            placeholder="Summary of this blueprint document..."
            value={docDesc}
            onChange={(e) => setDocDesc(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setIsAddDocOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createDocMutation.mutate()}
              isLoading={createDocMutation.isPending}
              disabled={!docTitle.trim()}
            >
              Create & Open Document
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Import Modal */}
      {isImportOpen && (
        <ImportModal
          isOpen={isImportOpen}
          onClose={() => setIsImportOpen(false)}
          defaultProjectId={projectId}
        />
      )}
    </div>
  );
}
