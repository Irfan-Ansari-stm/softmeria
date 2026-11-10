'use client';

import React from 'react';
import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import {
  FolderKanban,
  CheckCircle2,
  Clock,
  AlertCircle,
  GitBranch,
  ExternalLink,
  Target,
  Flame,
  Bug,
  ShieldCheck,
  Rocket,
  Users,
  FileText,
  ArrowRight
} from 'lucide-react';

interface ProjectOverviewViewProps {
  projectId: string;
  onNavigateTab: (tabId: string) => void;
}

export function ProjectOverviewView({ projectId, onNavigateTab }: ProjectOverviewViewProps) {
  // Fetch Project
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    }
  });

  // Fetch Tasks
  const { data: tasks = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/tasks?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Fetch Sprints
  const { data: sprints = [] } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/sprints?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Fetch Bugs
  const { data: bugs = [] } = useQuery({
    queryKey: ['bugs', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/bugs?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Fetch Milestones
  const { data: milestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/milestones?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const activeSprint = sprints.find((s: any) => s.status === 'ACTIVE') || sprints[0];
  const urgentTasks = tasks.filter((t: any) => t.priority === 'URGENT' || t.priority === 'HIGH');
  const openBugs = bugs.filter((b: any) => b.status !== 'RESOLVED' && b.status !== 'CLOSED');

  return (
    <div className="space-y-6">
      {/* Blueprint Progress Card */}
      <Card className="border-border bg-card">
        <CardContent className="p-6 space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <FileText className="h-4 w-4 text-primary" />
                <span>Architecture Blueprint & Engineering Specifications</span>
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Calculated across required core engineering blueprint specifications.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xl font-bold font-mono text-foreground">
                {project?.completionPercentage || 0}%
              </span>
              <span className="text-xs text-foreground-muted">
                ({project?.completedDocuments || 0} / {project?.totalDocuments || 0} completed)
              </span>
            </div>
          </div>
          <Progress value={project?.completionPercentage || 0} size="md" />

          <div className="pt-2 flex justify-end">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('docs')}
              className="text-xs gap-1.5"
            >
              <span>Explore Complete Documentation Tree</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Grid: Active Sprint & Milestones */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Active Sprint Summary */}
        <Card className="border-border bg-card">
          <CardHeader className="p-5 border-b border-border bg-background-secondary flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Flame className="h-4 w-4 text-amber-500" />
              <h4 className="text-sm font-bold text-foreground">Active Sprint</h4>
            </div>
            {activeSprint && (
              <Badge variant="success" className="text-[10px]">
                {activeSprint.name}
              </Badge>
            )}
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {activeSprint ? (
              <>
                <p className="text-xs text-foreground-muted leading-relaxed">
                  {activeSprint.goal || 'Execution of committed iteration stories.'}
                </p>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-background-secondary border border-border">
                    <span className="text-[10px] text-foreground-muted block">Tasks</span>
                    <span className="text-base font-bold font-mono text-foreground">
                      {activeSprint.tasks?.length || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background-secondary border border-border">
                    <span className="text-[10px] text-foreground-muted block">Committed Points</span>
                    <span className="text-base font-bold font-mono text-primary">
                      {(activeSprint.tasks || []).reduce((acc: number, t: any) => acc + (t.storyPoints || 0), 0)} pts
                    </span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNavigateTab('sprints')}
                  className="w-full text-xs gap-1.5"
                >
                  <span>View Sprint Burndown</span>
                  <ArrowRight className="h-3 w-3" />
                </Button>
              </>
            ) : (
              <p className="text-xs text-foreground-muted italic">No active sprint running.</p>
            )}
          </CardContent>
        </Card>

        {/* Milestones Summary */}
        <Card className="border-border bg-card">
          <CardHeader className="p-5 border-b border-border bg-background-secondary flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Target className="h-4 w-4 text-primary" />
              <h4 className="text-sm font-bold text-foreground">Roadmap Milestones</h4>
            </div>
            <span className="text-xs font-mono text-foreground-muted">
              {milestones.filter((m: any) => m.status === 'COMPLETED').length} / {milestones.length} Done
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-3">
            {milestones.slice(0, 3).map((m: any) => (
              <div
                key={m.id}
                className="flex items-center justify-between text-xs p-2 rounded-lg hover:bg-background-secondary transition-colors"
              >
                <div className="space-y-0.5">
                  <span className="font-medium text-foreground block">{m.name}</span>
                  <span className="text-[10px] text-foreground-muted font-mono">
                    Due: {m.dueDate ? new Date(m.dueDate).toLocaleDateString() : 'TBD'}
                  </span>
                </div>
                <Badge variant={m.status === 'COMPLETED' ? 'success' : 'outline'} className="text-[10px]">
                  {m.status}
                </Badge>
              </div>
            ))}
            <Button
              variant="outline"
              size="sm"
              onClick={() => onNavigateTab('roadmap')}
              className="w-full text-xs gap-1.5 mt-2"
            >
              <span>View Executive Roadmap</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Grid: High Priority Tasks & Defects */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Urgent Tasks */}
        <Card className="border-border bg-card">
          <CardHeader className="p-5 border-b border-border bg-background-secondary flex flex-row items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Critical & High Priority Tasks</h4>
            <Badge variant="warning" className="text-[10px]">
              {urgentTasks.length} High Priority
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            {urgentTasks.slice(0, 4).map((t: any) => (
              <div
                key={t.id}
                className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background-secondary/50 text-xs"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-[11px] font-bold text-primary">{t.key}</span>
                  <span className="font-medium text-foreground truncate max-w-[200px]">{t.title}</span>
                </div>
                <Badge variant="outline" className="text-[10px]">
                  {t.status}
                </Badge>
              </div>
            ))}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('tasks')}
              className="w-full text-xs gap-1 text-primary hover:underline mt-2"
            >
              <span>View All Tasks & Board</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>

        {/* Open Defects */}
        <Card className="border-border bg-card">
          <CardHeader className="p-5 border-b border-border bg-background-secondary flex flex-row items-center justify-between">
            <h4 className="text-sm font-bold text-foreground">Defects & Bugs in Flight</h4>
            <Badge variant="destructive" className="text-[10px]">
              {openBugs.length} Open
            </Badge>
          </CardHeader>
          <CardContent className="p-5 space-y-2">
            {openBugs.length === 0 ? (
              <p className="text-xs text-foreground-muted italic py-4 text-center">
                Zero open defects. System healthy!
              </p>
            ) : (
              openBugs.slice(0, 4).map((b: any) => (
                <div
                  key={b.id}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-border bg-background-secondary/50 text-xs"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-[11px] font-bold text-destructive">{b.key || 'BUG'}</span>
                    <span className="font-medium text-foreground truncate max-w-[200px]">{b.title}</span>
                  </div>
                  <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">
                    {b.severity}
                  </span>
                </div>
              ))
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onNavigateTab('bugs')}
              className="w-full text-xs gap-1 text-destructive hover:underline mt-2"
            >
              <span>View Quality Assurance Log</span>
              <ArrowRight className="h-3 w-3" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
