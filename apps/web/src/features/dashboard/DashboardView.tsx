'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  FileText,
  CheckCircle2,
  Clock,
  TrendingUp,
  Plus,
  Upload,
  Bookmark,
  Layers,
  ArrowRight,
  Sparkles,
  ExternalLink,
  Search
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

export function DashboardView() {
  const router = useRouter();
  const { currentWorkspace, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');

  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return null;
      const res = await api.get<any>(`/dashboard?workspaceId=${currentWorkspace.id}`);
      return res.data;
    },
    enabled: !!currentWorkspace?.id
  });

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

  const filteredProjects = (stats?.recentlyAccessedProjects || []).filter((p: any) =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Top Welcome Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-zinc-100">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Engineering blueprint and technical documentation overview for {currentWorkspace?.name}.
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          <Link href="/projects?action=new-project">
            <Button variant="primary" size="sm" className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>Create Project</span>
            </Button>
          </Link>
          <Link href="/templates">
            <Button variant="secondary" size="sm" className="text-xs gap-1.5">
              <Bookmark className="h-3.5 w-3.5" />
              <span>Browse Templates</span>
            </Button>
          </Link>
          <Link href="/projects">
            <Button variant="outline" size="sm" className="text-xs gap-1.5">
              <Upload className="h-3.5 w-3.5" />
              <span>Import Documentation</span>
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Total Projects
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1 font-mono">
                {stats?.totalProjects ?? 0}
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {stats?.activeProjects ?? 0} active
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <FolderKanban className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Total Documents
              </p>
              <h3 className="text-2xl font-bold text-zinc-100 mt-1 font-mono">
                {stats?.totalDocuments ?? 0}
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Across all categories
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-zinc-800/60 border border-zinc-700/40 flex items-center justify-center text-zinc-300">
              <FileText className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Completed Docs
              </p>
              <h3 className="text-2xl font-bold text-emerald-400 mt-1 font-mono">
                {stats?.completedDocuments ?? 0}
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                {stats?.pendingDocuments ?? 0} remaining
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium text-zinc-400 uppercase tracking-wider">
                Documentation Rate
              </p>
              <h3 className="text-2xl font-bold text-indigo-400 mt-1 font-mono">
                {stats?.overallCompletionPercentage ?? 0}%
              </h3>
              <p className="text-[10px] text-zinc-500 mt-0.5">
                Required non-optional
              </p>
            </div>
            <div className="h-10 w-10 rounded-lg bg-indigo-950/60 border border-indigo-800/40 flex items-center justify-center text-indigo-400">
              <TrendingUp className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content: Projects Grid & Right Activity Stream */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Active Projects Cards */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-indigo-400" />
              <span>Active Engineering Projects</span>
            </h2>
            <Link
              href="/projects"
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>View all</span>
              <ArrowRight className="h-3 w-3" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredProjects.length === 0 ? (
              <div className="col-span-2 p-8 text-center border border-dashed border-zinc-800 rounded-lg">
                <p className="text-xs text-zinc-500">No projects found.</p>
              </div>
            ) : (
              filteredProjects.map((project: any) => (
                <Card
                  key={project.id}
                  className="hover:border-zinc-700/80 transition-all group flex flex-col justify-between"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div
                          className="h-8 w-8 rounded-md flex items-center justify-center text-white shrink-0 shadow-sm"
                          style={{ backgroundColor: project.color || '#4f46e5' }}
                        >
                          <FolderKanban className="h-4 w-4" />
                        </div>
                        <div className="min-w-0">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-semibold text-xs text-zinc-100 hover:text-indigo-400 transition-colors truncate block"
                          >
                            {project.name}
                          </Link>
                          <span className="text-[10px] text-zinc-500">
                            {project.projectType}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0">
                        {project.status}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-[11px] text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                        {project.description}
                      </p>
                    )}
                  </CardHeader>

                  <CardContent className="p-4 pt-2 space-y-3">
                    {/* Tech Stack Chips */}
                    {project.techStack && project.techStack.length > 0 && (
                      <div className="flex flex-wrap gap-1">
                        {project.techStack.slice(0, 3).map((t: string) => (
                          <span
                            key={t}
                            className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] font-mono text-zinc-300"
                          >
                            {t}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded bg-zinc-800 text-[10px] text-zinc-500 font-mono">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-zinc-500">Documentation Blueprint</span>
                        <span className="font-mono text-zinc-300 font-medium">
                          {project.completionPercentage}% ({project.completedDocuments}/{project.totalDocuments})
                        </span>
                      </div>
                      <Progress value={project.completionPercentage} size="sm" />
                    </div>

                    <div className="pt-2 border-t border-zinc-800/60 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform"
                      >
                        <span>Workspace</span>
                        <ArrowRight className="h-3 w-3" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Recently Updated Documents */}
          <div className="pt-4 space-y-3">
            <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
              <FileText className="h-4 w-4 text-indigo-400" />
              <span>Recently Updated Documents</span>
            </h2>

            <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 divide-y divide-zinc-800/60">
              {(stats?.recentlyUpdatedDocs || []).map((doc: any) => (
                <div
                  key={doc.id}
                  className="p-3 flex items-center justify-between hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-2.5 truncate">
                    <FileText className="h-4 w-4 text-zinc-400 shrink-0" />
                    <div className="truncate">
                      <Link
                        href={`/projects/${doc.projectId}/docs/${doc.id}`}
                        className="text-xs font-medium text-zinc-200 hover:text-indigo-400 transition-colors truncate block"
                      >
                        {doc.title}
                      </Link>
                      <span className="text-[10px] text-zinc-500 font-mono">
                        {doc.fileName} • v{doc.versionNumber}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    {getStatusBadge(doc.status)}
                    <Link
                      href={`/projects/${doc.projectId}/docs/${doc.id}`}
                      className="text-xs text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800"
                    >
                      <ExternalLink className="h-3.5 w-3.5" />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Recent Activity Timeline */}
        <div className="space-y-4">
          <h2 className="text-sm font-semibold text-zinc-100 flex items-center gap-2">
            <Clock className="h-4 w-4 text-indigo-400" />
            <span>Workspace Activity</span>
          </h2>

          <Card>
            <CardContent className="p-4 space-y-4">
              {(stats?.recentActivities || []).length === 0 ? (
                <p className="text-xs text-zinc-500 italic py-4 text-center">
                  No recent activities recorded.
                </p>
              ) : (
                <div className="relative pl-4 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-zinc-800">
                  {stats.recentActivities.map((act: any) => (
                    <div key={act.id} className="relative text-xs space-y-0.5">
                      <div className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-indigo-500 ring-4 ring-zinc-900" />
                      <div className="text-zinc-200">
                        <span className="font-semibold text-zinc-100">{act.userName} </span>
                        <span className="text-zinc-400">
                          {act.action.toLowerCase().replace(/_/g, ' ')}{' '}
                        </span>
                        {act.documentTitle ? (
                          <span className="text-indigo-300 font-medium">
                            &ldquo;{act.documentTitle}&rdquo;
                          </span>
                        ) : (
                          <span className="text-zinc-300">{act.projectName}</span>
                        )}
                      </div>
                      <div className="text-[10px] text-zinc-500 font-mono">
                        {new Date(act.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

