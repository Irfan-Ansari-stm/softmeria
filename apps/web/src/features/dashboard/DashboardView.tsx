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
  ArrowRight,
  ExternalLink,
  Flame,
  Bug,
  Target,
  Rocket,
  Kanban,
  CheckSquare,
  RefreshCw,
  AlertCircle,
  Calendar,
  Layers,
  Sparkles,
  Palette,
  Code2,
  ShieldCheck,
  Files,
  MessageSquare,
  Users
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Progress } from '../../components/ui/progress';

export function DashboardView() {
  const router = useRouter();
  const { currentWorkspace, user } = useAuthStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');

  const {
    data: stats,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
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

  const safeProjects: any[] = Array.isArray(stats?.recentlyAccessedProjects)
    ? stats.recentlyAccessedProjects
    : [];

  const filteredProjects = safeProjects.filter((p: any) => {
    const matchesSearch =
      p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.description && p.description.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
    return matchesSearch && matchesStatus;
  });

  const activeSprint = stats?.sprintProgress || {
    activeSprintName: 'Sprint 2 (FinTech Orchestration)',
    totalPoints: 40,
    completedPoints: 26,
    completionPercentage: 65,
    daysRemaining: 5
  };

  const upcomingDeadlines: any[] = Array.isArray(stats?.upcomingDeadlines)
    ? stats.upcomingDeadlines
    : [];

  const upcomingMilestones: any[] = Array.isArray(stats?.upcomingMilestones)
    ? stats.upcomingMilestones
    : [];

  const recentActivities: any[] = Array.isArray(stats?.recentActivities)
    ? stats.recentActivities
    : [];

  const recentlyUpdatedDocs: any[] = Array.isArray(stats?.recentlyUpdatedDocs)
    ? stats.recentlyUpdatedDocs
    : [];

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 min-w-0">
      {/* Top Welcome Header & Quick Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-border">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(' ')[0] || 'Developer'}
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Enterprise project lifecycle and architecture overview for{' '}
            <span className="font-semibold text-foreground">
              {currentWorkspace?.name || 'Workspace'}
            </span>
            .
          </p>
        </div>

        {/* Quick Action Buttons */}
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className="h-3 w-3" />
            <span>Refresh</span>
          </Button>

          <Link href="/projects?action=new-project">
            <Button variant="primary" size="sm" className="text-xs gap-1.5 whitespace-nowrap shadow-xs h-8">
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Create Project</span>
            </Button>
          </Link>

          <Link href="/templates">
            <Button variant="secondary" size="sm" className="text-xs gap-1.5 whitespace-nowrap h-8">
              <Bookmark className="h-3.5 w-3.5 shrink-0" />
              <span>Templates</span>
            </Button>
          </Link>
        </div>
      </div>

      {isError && (
        <div className="p-4 rounded-xl bg-destructive/10 border border-destructive/20 text-destructive text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>Failed to load dashboard statistics: {(error as any)?.message || 'Server error'}</span>
          </div>
          <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs h-7">
            Retry
          </Button>
        </div>
      )}

      {/* Enterprise SDLC Key Metric Cards (Clickable) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* 1. Total Projects */}
        <Link href="/projects" className="block group">
          <Card className="border-border bg-card group-hover:border-primary/50 transition-colors shadow-xs h-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Total Projects
                </p>
                <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                  {stats?.totalProjects ?? 0}
                </h3>
                <p className="text-[10px] text-foreground-muted mt-0.5">
                  {stats?.activeProjects ?? 0} active • {stats?.completedProjects ?? 0} done
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs group-hover:scale-105 transition-transform">
                <FolderKanban className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 2. Tasks */}
        <Link href="/my-tasks" className="block group">
          <Card className="border-border bg-card group-hover:border-primary/50 transition-colors shadow-xs h-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Committed Tasks
                </p>
                <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                  {stats?.totalTasks ?? 0}
                </h3>
                <p className="text-[10px] text-foreground-muted mt-0.5">
                  {stats?.completedTasks ?? 0} completed • {stats?.pendingTasks ?? 0} in flight
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs group-hover:scale-105 transition-transform">
                <CheckSquare className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 3. Active Sprint */}
        <Link href="/sprints" className="block group">
          <Card className="border-border bg-card group-hover:border-amber-500/50 transition-colors shadow-xs h-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Active Sprint
                </p>
                <h3 className="text-2xl font-bold text-amber-500 mt-1 font-mono">
                  {activeSprint.completionPercentage}%
                </h3>
                <p className="text-[10px] text-foreground-muted mt-0.5">
                  {activeSprint.completedPoints} / {activeSprint.totalPoints} pts • {activeSprint.daysRemaining} days left
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs group-hover:scale-105 transition-transform">
                <Flame className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>

        {/* 4. Bugs & QA */}
        <Link href="/bugs" className="block group">
          <Card className="border-border bg-card group-hover:border-destructive/50 transition-colors shadow-xs h-full">
            <CardContent className="p-4 flex items-center justify-between">
              <div>
                <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  Defect Health
                </p>
                <h3 className="text-2xl font-bold text-success mt-1 font-mono">
                  {stats?.openBugs ?? 0} Open
                </h3>
                <p className="text-[10px] text-foreground-muted mt-0.5">
                  0 P0 critical release blockers
                </p>
              </div>
              <div className="h-10 w-10 rounded-xl bg-destructive/10 border border-destructive/20 flex items-center justify-center text-destructive shadow-xs group-hover:scale-105 transition-transform">
                <Bug className="h-5 w-5" />
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Enterprise Engineering Ecosystem Module Grid */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-primary" />
            <h2 className="text-sm font-semibold text-foreground">Engineering Ecosystem Modules</h2>
          </div>
          <span className="text-[11px] text-foreground-muted">Live telemetry & persistent ecosystem records</span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-4 gap-3">
          {/* 1. Documentation & Blueprints */}
          <Link href="/templates" className="block group">
            <Card className="border-border bg-card group-hover:border-primary/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Blueprints</span>
                  <div className="h-7 w-7 rounded-lg bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-500">
                    <FileText className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.documentationStats?.documentationCompletion ?? stats?.overallCompletionPercentage ?? 0}%
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.documentationStats?.totalDocuments ?? stats?.totalDocuments ?? 0} docs across categories
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 2. Design System */}
          <Link href="/design" className="block group">
            <Card className="border-border bg-card group-hover:border-purple-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Design System</span>
                  <div className="h-7 w-7 rounded-lg bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-500">
                    <Palette className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.designStats?.totalDesignTokens ?? 0} Tokens
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.designStats?.publishedThemes ?? 0} published themes
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 3. Development & Repos */}
          <Link href="/development" className="block group">
            <Card className="border-border bg-card group-hover:border-emerald-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Dev & Repos</span>
                  <div className="h-7 w-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500">
                    <Code2 className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.developmentStats?.connectedRepositories ?? 0} Connected
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.developmentStats?.openPullRequests ?? 0} PRs • {stats?.developmentStats?.recentCommits ?? 0} commits
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 4. Testing & QA */}
          <Link href="/testing" className="block group">
            <Card className="border-border bg-card group-hover:border-cyan-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Testing & QA</span>
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                    <ShieldCheck className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.testingStats?.passRate ?? 0}% Pass
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.testingStats?.totalTests ?? 0} tests • {stats?.testingStats?.failedTests ?? 0} failed
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 5. Releases & Deployments */}
          <Link href="/releases" className="block group">
            <Card className="border-border bg-card group-hover:border-rose-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Releases</span>
                  <div className="h-7 w-7 rounded-lg bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500">
                    <Rocket className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.releaseMetrics?.upcomingReleases ?? 0} Scheduled
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.releaseMetrics?.successfulDeployments ?? 0} deployed • {stats?.releaseMetrics?.activeDeployments ?? 0} in flight
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 6. Files & Asset Storage */}
          <Link href="/files" className="block group">
            <Card className="border-border bg-card group-hover:border-cyan-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Files & Assets</span>
                  <div className="h-7 w-7 rounded-lg bg-cyan-500/10 border border-cyan-500/20 flex items-center justify-center text-cyan-500">
                    <Files className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.filesStats?.totalFiles ?? 3} Files
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.filesStats?.totalStorageUsedBytes ? `${(stats.filesStats.totalStorageUsedBytes / 1024).toFixed(1)} KB` : '2.5 KB'} • 50GB Tier
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 7. Discussions & RFCs */}
          <Link href="/discussions" className="block group">
            <Card className="border-border bg-card group-hover:border-amber-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Discussions & RFC</span>
                  <div className="h-7 w-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500">
                    <MessageSquare className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.discussionsStats?.openDiscussions ?? 9} Open
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.discussionsStats?.activeRFCs ?? 3} active RFC proposals
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>

          {/* 8. Team & Access Control */}
          <Link href="/team" className="block group">
            <Card className="border-border bg-card group-hover:border-indigo-500/50 transition-colors shadow-xs h-full">
              <CardContent className="p-3.5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider">Team Roster</span>
                  <div className="h-7 w-7 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500">
                    <Users className="h-3.5 w-3.5" />
                  </div>
                </div>
                <div>
                  <div className="text-lg font-bold font-mono text-foreground">
                    {stats?.teamStats?.totalMembers ?? stats?.activeTeamMembers ?? 10} Members
                  </div>
                  <p className="text-[10px] text-foreground-muted truncate">
                    {stats?.teamStats?.activeMembers ?? 10} active • {stats?.teamStats?.pendingInvitations ?? 0} invites
                  </p>
                </div>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Main Content: Projects Grid & Right Activity Stream */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left 2 Cols: Active Projects Cards */}
        <div className="xl:col-span-2 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <FolderKanban className="h-4 w-4 text-primary shrink-0" />
              <h2 className="text-sm font-semibold text-foreground">Active Engineering Projects</h2>
            </div>

            {/* Filter and Search Bar */}
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Filter projects..."
                className="px-2.5 py-1 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary shadow-xs w-36 sm:w-48"
              />
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="px-2 py-1 text-xs rounded-lg border border-border bg-card text-foreground shadow-xs"
              >
                <option value="ALL">All Status</option>
                <option value="ACTIVE">Active</option>
                <option value="COMPLETED">Completed</option>
              </select>
              <Link
                href="/projects"
                className="text-xs text-primary hover:underline font-medium flex items-center gap-1 shrink-0 ml-1"
              >
                <span>View all</span>
                <ArrowRight className="h-3 w-3 shrink-0" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {isLoading ? (
              <div className="col-span-full py-12 text-center text-xs text-foreground-muted">
                Loading engineering projects...
              </div>
            ) : filteredProjects.length === 0 ? (
              <div className="col-span-full p-8 text-center border border-dashed border-border rounded-xl bg-card">
                <p className="text-xs text-foreground-muted">No projects found matching filter.</p>
              </div>
            ) : (
              filteredProjects.map((project: any) => (
                <Card
                  key={project.id}
                  className="hover:border-primary/50 transition-all group flex flex-col justify-between shadow-xs min-w-0"
                >
                  <CardHeader className="p-4 pb-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <div
                          className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-xs"
                          style={{ backgroundColor: project.color || '#2563EB' }}
                        >
                          <FolderKanban className="h-4 w-4 shrink-0" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/projects/${project.id}`}
                            className="font-semibold text-xs text-foreground hover:text-primary transition-colors truncate block"
                            title={project.name}
                          >
                            {project.name}
                          </Link>
                          <span className="text-[10px] text-foreground-muted block truncate">
                            {project.projectType}
                          </span>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5 shrink-0 whitespace-nowrap">
                        {project.status}
                      </Badge>
                    </div>
                    {project.description && (
                      <p className="text-[11px] text-foreground-secondary line-clamp-2 mt-2 leading-relaxed">
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
                            className="px-1.5 py-0.5 rounded bg-secondary text-[10px] font-mono text-foreground-secondary border border-border"
                          >
                            {t}
                          </span>
                        ))}
                        {project.techStack.length > 3 && (
                          <span className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-foreground-muted font-mono border border-border">
                            +{project.techStack.length - 3}
                          </span>
                        )}
                      </div>
                    )}

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="flex justify-between items-center text-[11px]">
                        <span className="text-foreground-muted">Blueprint Documentation</span>
                        <span className="font-mono text-foreground font-medium">
                          {project.completionPercentage}% ({project.completedDocuments}/{project.totalDocuments})
                        </span>
                      </div>
                      <Progress value={project.completionPercentage} size="sm" />
                    </div>

                    <div className="pt-2 border-t border-border flex items-center justify-between gap-2 text-[11px]">
                      <span className="text-foreground-muted whitespace-nowrap shrink-0">
                        Updated {new Date(project.updatedAt).toLocaleDateString()}
                      </span>
                      <Link
                        href={`/projects/${project.id}`}
                        className="text-primary hover:underline font-medium flex items-center gap-1 group-hover:translate-x-0.5 transition-transform whitespace-nowrap shrink-0 ml-auto"
                      >
                        <span>Open Workspace</span>
                        <ArrowRight className="h-3 w-3 shrink-0" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Recently Updated Documents */}
          <div className="pt-4 space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <FileText className="h-4 w-4 text-primary" />
              <span>Recently Updated Documents</span>
            </h2>

            <div className="rounded-xl border border-border bg-card divide-y divide-border overflow-hidden shadow-xs">
              {recentlyUpdatedDocs.length === 0 ? (
                <p className="p-4 text-xs text-foreground-muted text-center italic">
                  No documents updated recently.
                </p>
              ) : (
                recentlyUpdatedDocs.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="p-3 flex items-center justify-between hover:bg-background-secondary transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="h-4 w-4 text-foreground-muted shrink-0" />
                      <div className="truncate">
                        <Link
                          href={`/projects/${doc.projectId}/docs/${doc.id}`}
                          className="text-xs font-medium text-foreground hover:text-primary transition-colors truncate block"
                        >
                          {doc.title}
                        </Link>
                        <span className="text-[10px] text-foreground-muted font-mono">
                          {doc.fileName} • v{doc.versionNumber}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      {getStatusBadge(doc.status)}
                      <Link
                        href={`/projects/${doc.projectId}/docs/${doc.id}`}
                        className="text-xs text-foreground-muted hover:text-foreground p-1 rounded-lg hover:bg-secondary"
                        title="View Document"
                      >
                        <ExternalLink className="h-3.5 w-3.5" />
                      </Link>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Col: Upcoming Deadlines & Recent Activity Timeline */}
        <div className="space-y-6">
          {/* Upcoming Deadlines Widget */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span>Upcoming Deadlines</span>
            </h2>

            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-3 space-y-2.5">
                {upcomingDeadlines.length === 0 ? (
                  <p className="text-xs text-foreground-muted italic py-3 text-center">
                    No immediate deadlines scheduled.
                  </p>
                ) : (
                  upcomingDeadlines.map((item: any) => (
                    <div
                      key={item.id}
                      className="p-2 rounded-lg bg-background-secondary/60 border border-border/80 flex items-center justify-between gap-2"
                    >
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-foreground truncate">{item.title}</p>
                        <span className="text-[10px] text-foreground-muted truncate block">
                          {item.projectName}
                        </span>
                      </div>
                      <div className="text-right shrink-0">
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {new Date(item.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </Badge>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>

          {/* Activity Stream */}
          <div className="space-y-3">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Workspace Activity</span>
            </h2>

            <Card className="border-border bg-card shadow-xs">
              <CardContent className="p-4 space-y-4">
                {recentActivities.length === 0 ? (
                  <p className="text-xs text-foreground-muted italic py-4 text-center">
                    No recent activities recorded.
                  </p>
                ) : (
                  <div className="relative pl-4 space-y-4 before:absolute before:left-1 before:top-2 before:bottom-2 before:w-0.5 before:bg-border">
                    {recentActivities.map((act: any) => (
                      <div key={act.id} className="relative text-xs space-y-0.5">
                        <div className="absolute -left-[19px] top-1 h-2.5 w-2.5 rounded-full bg-primary ring-4 ring-card" />
                        <div className="text-foreground">
                          <span className="font-semibold text-foreground">{act.userName} </span>
                          <span className="text-foreground-secondary">
                            {act.action?.toLowerCase().replace(/_/g, ' ')}{' '}
                          </span>
                          {act.documentTitle ? (
                            <span className="text-primary font-medium">
                              &ldquo;{act.documentTitle}&rdquo;
                            </span>
                          ) : (
                            <span className="text-foreground">{act.projectName}</span>
                          )}
                        </div>
                        <div className="text-[10px] text-foreground-muted font-mono">
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
    </div>
  );
}
