'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Calendar,
  Play,
  CheckCircle,
  TrendingDown,
  Plus,
  Clock,
  Layers,
  Flame,
  CheckCircle2,
  BarChart2,
  MessageSquare,
  Sparkles,
  Save,
  CheckSquare,
  ShieldAlert,
  ArrowRight
} from 'lucide-react';
import { TaskDetailsModal } from '../tasks/TaskDetailsModal';

interface SprintsViewProps {
  projectId: string;
}

export function SprintsView({ projectId }: SprintsViewProps) {
  const queryClient = useQueryClient();
  const [selectedSprintId, setSelectedSprintId] = useState<string | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'iteration' | 'retrospective' | 'velocity'>('iteration');

  // Create Sprint Form
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [sprintName, setSprintName] = useState('');
  const [sprintGoal, setSprintGoal] = useState('');
  const [capacityPoints, setCapacityPoints] = useState(40);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Retrospective Form
  const [retroWentWell, setRetroWentWell] = useState('');
  const [retroWentWrong, setRetroWentWrong] = useState('');
  const [retroActionItems, setRetroActionItems] = useState('');

  // Fetch Sprints
  const { data: sprints = [], isLoading } = useQuery({
    queryKey: ['sprints', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/sprints?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Determine active/selected sprint
  const activeSprint = sprints.find((s: any) => s.status === 'ACTIVE') || sprints[0];
  const currentSprint = selectedSprintId
    ? sprints.find((s: any) => s.id === selectedSprintId) || activeSprint
    : activeSprint;

  // Sync retro state when currentSprint changes
  React.useEffect(() => {
    if (currentSprint) {
      setRetroWentWell(currentSprint.retrospectiveWentWell || '');
      setRetroWentWrong(currentSprint.retrospectiveWentWrong || '');
      setRetroActionItems(currentSprint.retrospectiveActionItems || '');
    }
  }, [currentSprint?.id, currentSprint?.retrospectiveWentWell, currentSprint?.retrospectiveWentWrong, currentSprint?.retrospectiveActionItems]);

  // Fetch Burndown Data for currentSprint
  const { data: burndownData = [] } = useQuery({
    queryKey: ['burndown', currentSprint?.id],
    enabled: !!currentSprint?.id,
    queryFn: async () => {
      const res = await api.get<any[]>(`/sprints/${currentSprint.id}/burndown`);
      return res.data || [];
    }
  });

  // Fetch Velocity History
  const { data: velocityData } = useQuery({
    queryKey: ['velocity', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/sprints/velocity?projectId=${projectId}`);
      return res.data;
    }
  });

  // Fetch Sprint Tasks
  const { data: sprintDetails } = useQuery({
    queryKey: ['sprint-details', currentSprint?.id],
    enabled: !!currentSprint?.id,
    queryFn: async () => {
      const res = await api.get<any>(`/sprints/${currentSprint.id}`);
      return res.data;
    }
  });

  // Create Sprint Mutation
  const createSprintMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/sprints', {
        projectId,
        name: sprintName,
        goal: sprintGoal,
        capacityPoints: Number(capacityPoints),
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setSprintName('');
      setSprintGoal('');
      setStartDate('');
      setEndDate('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    }
  });

  // Start Sprint Mutation
  const startSprintMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const res = await api.post(`/sprints/${sprintId}/start`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    }
  });

  // Complete Sprint Mutation
  const completeSprintMutation = useMutation({
    mutationFn: async (sprintId: string) => {
      const res = await api.post(`/sprints/${sprintId}/complete`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
      queryClient.invalidateQueries({ queryKey: ['velocity', projectId] });
    }
  });

  // Update Retrospective Mutation
  const updateRetroMutation = useMutation({
    mutationFn: async () => {
      if (!currentSprint) return;
      const res = await api.patch(`/sprints/${currentSprint.id}`, {
        retrospectiveWentWell: retroWentWell,
        retrospectiveWentWrong: retroWentWrong,
        retrospectiveActionItems: retroActionItems
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
    }
  });

  const getSprintBadge = (status: string) => {
    switch (status) {
      case 'ACTIVE':
        return <Badge variant="status-progress">Active</Badge>;
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'CANCELLED':
        return <Badge variant="destructive">Cancelled</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  // Generate dynamic burndown chart points
  const maxPoints = Math.max(
    currentSprint?.capacityPoints || 40,
    currentSprint?.totalStoryPoints || 40,
    ...burndownData.map((b: any) => Math.max(b.idealPoints, b.remainingPoints, 1))
  );

  const chartWidth = 500;
  const chartHeight = 150;
  const paddingX = 30;
  const paddingY = 20;
  const usableWidth = chartWidth - paddingX * 2;
  const usableHeight = chartHeight - paddingY * 2;

  const pointsCount = Math.max(burndownData.length, 2);
  const getX = (index: number) => paddingX + (index / (pointsCount - 1)) * usableWidth;
  const getY = (val: number) => paddingY + usableHeight - (Math.max(0, val) / maxPoints) * usableHeight;

  const idealPolyline = burndownData.map((d: any, idx: number) => `${getX(idx)},${getY(d.idealPoints)}`).join(' ');
  const actualPolyline = burndownData.map((d: any, idx: number) => `${getX(idx)},${getY(d.remainingPoints)}`).join(' ');

  const currentRemaining = burndownData.length > 0 ? burndownData[burndownData.length - 1].remainingPoints : 0;
  const currentIdeal = burndownData.length > 0 ? burndownData[burndownData.length - 1].idealPoints : 0;
  const isOnTrack = currentRemaining <= currentIdeal;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Flame className="h-5 w-5 text-amber-500" />
            <span>Agile Sprint Execution & Burndown</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            Track iteration velocity, burndown curves, release commitments, and structured retrospectives.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {/* Sprint Selector Dropdown */}
          <select
            value={currentSprint?.id || ''}
            onChange={(e) => setSelectedSprintId(e.target.value)}
            className="h-8 px-2.5 text-xs font-semibold rounded-lg border border-border bg-background text-foreground focus:outline-none"
          >
            {sprints.map((s: any) => (
              <option key={s.id} value={s.id}>
                {s.name} ({s.status})
              </option>
            ))}
          </select>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            className="text-xs gap-1.5 h-8 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Plan Sprint</span>
          </Button>
        </div>
      </div>

      {/* View Switcher Tabs */}
      <div className="flex items-center gap-2 border-b border-border pb-3">
        <button
          onClick={() => setActiveTab('iteration')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'iteration'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <BarChart2 className="h-3.5 w-3.5" />
          <span>Sprint Analytics & Burndown</span>
        </button>

        <button
          onClick={() => setActiveTab('retrospective')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'retrospective'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <MessageSquare className="h-3.5 w-3.5" />
          <span>Sprint Retrospective</span>
        </button>

        <button
          onClick={() => setActiveTab('velocity')}
          className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition-all ${
            activeTab === 'velocity'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
          }`}
        >
          <TrendingDown className="h-3.5 w-3.5" />
          <span>Velocity History</span>
        </button>
      </div>

      {/* Tab 1: Iteration & Burndown */}
      {activeTab === 'iteration' && currentSprint && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Sprint Summary Card */}
            <Card className="lg:col-span-1 border-border bg-card">
              <CardHeader className="p-4 border-b border-border bg-background-secondary flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider block">
                    Selected Iteration
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">{currentSprint.name}</h3>
                </div>
                {getSprintBadge(currentSprint.status)}
              </CardHeader>
              <CardContent className="p-4 space-y-4">
                {currentSprint.goal && (
                  <div>
                    <span className="text-[11px] font-medium text-foreground-muted block mb-1">Sprint Goal:</span>
                    <p className="text-xs text-foreground bg-secondary/40 p-2.5 rounded-lg border border-border leading-relaxed">
                      {currentSprint.goal}
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 rounded-lg bg-background-secondary border border-border">
                    <span className="text-[11px] text-foreground-muted block">Tasks Scope</span>
                    <span className="text-base font-bold font-mono text-foreground mt-0.5 block">
                      {currentSprint.completedTaskCount || 0} / {currentSprint.taskCount || 0}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-background-secondary border border-border">
                    <span className="text-[11px] text-foreground-muted block">Story Points</span>
                    <span className="text-base font-bold font-mono text-primary mt-0.5 block">
                      {currentSprint.completedStoryPoints || 0} / {currentSprint.totalStoryPoints || 0} SP
                    </span>
                  </div>
                </div>

                <div className="text-xs space-y-1.5 pt-1">
                  <div className="flex items-center justify-between text-foreground-muted text-[11px]">
                    <span>Timeline:</span>
                    <span className="font-medium text-foreground">
                      {currentSprint.startDate ? new Date(currentSprint.startDate).toLocaleDateString() : 'TBD'} –{' '}
                      {currentSprint.endDate ? new Date(currentSprint.endDate).toLocaleDateString() : 'TBD'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-foreground-muted text-[11px]">
                    <span>Capacity Commitment:</span>
                    <span className="font-mono text-foreground font-semibold">{currentSprint.capacityPoints || 40} SP</span>
                  </div>
                  <div className="flex items-center justify-between text-foreground-muted text-[11px]">
                    <span>Delivery Status:</span>
                    <span className={`font-semibold ${isOnTrack ? 'text-emerald-600' : 'text-amber-600'}`}>
                      {isOnTrack ? '● On Track' : '▲ Scope Variance'}
                    </span>
                  </div>
                </div>

                <div className="pt-2 flex items-center gap-2">
                  {currentSprint.status === 'PLANNED' && (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => startSprintMutation.mutate(currentSprint.id)}
                      isLoading={startSprintMutation.isPending}
                      className="w-full text-xs gap-1.5"
                    >
                      <Play className="h-3.5 w-3.5" />
                      <span>Start Sprint</span>
                    </Button>
                  )}
                  {currentSprint.status === 'ACTIVE' && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => completeSprintMutation.mutate(currentSprint.id)}
                      isLoading={completeSprintMutation.isPending}
                      className="w-full text-xs gap-1.5 text-emerald-600 border-emerald-500/30 hover:bg-emerald-500/10"
                    >
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Complete & Archive Sprint</span>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Dynamic Interactive Burndown Chart */}
            <Card className="lg:col-span-2 border-border bg-card">
              <CardHeader className="p-4 border-b border-border bg-background-secondary flex flex-row items-center justify-between">
                <div>
                  <span className="text-[10px] font-semibold text-foreground-muted uppercase tracking-wider block">
                    Real-time Execution
                  </span>
                  <h3 className="text-sm font-bold text-foreground mt-0.5">Burndown Curve (Story Points)</h3>
                </div>
                <div className="flex items-center gap-4 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-4 border-b-2 border-dashed border-foreground-muted/60"></div>
                    <span className="text-foreground-muted">Ideal Guide</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-4 bg-primary rounded-sm"></div>
                    <span className="text-foreground font-semibold">Actual Remaining</span>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-5">
                <div className="h-52 w-full flex items-end">
                  <svg className="w-full h-full overflow-visible" viewBox={`0 0 ${chartWidth} ${chartHeight}`}>
                    {/* Horizontal Grid lines */}
                    <line x1={paddingX} y1={paddingY} x2={chartWidth - paddingX} y2={paddingY} stroke="currentColor" strokeDasharray="3 3" className="text-border" strokeWidth="1" />
                    <line x1={paddingX} y1={chartHeight / 2} x2={chartWidth - paddingX} y2={chartHeight / 2} stroke="currentColor" strokeDasharray="3 3" className="text-border" strokeWidth="1" />
                    <line x1={paddingX} y1={chartHeight - paddingY} x2={chartWidth - paddingX} y2={chartHeight - paddingY} stroke="currentColor" className="text-border" strokeWidth="1.5" />

                    {/* Ideal Guide Polyline */}
                    {burndownData.length > 0 && (
                      <polyline
                        fill="none"
                        stroke="#94a3b8"
                        strokeWidth="2"
                        strokeDasharray="4 4"
                        points={idealPolyline}
                      />
                    )}

                    {/* Actual Polyline */}
                    {burndownData.length > 0 && (
                      <polyline
                        fill="none"
                        stroke="#2563EB"
                        strokeWidth="3"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        points={actualPolyline}
                      />
                    )}

                    {/* Data Points */}
                    {burndownData.map((d: any, idx: number) => (
                      <g key={idx} className="group cursor-pointer">
                        <circle
                          cx={getX(idx)}
                          cy={getY(d.remainingPoints)}
                          r="4"
                          fill="#2563EB"
                          className="hover:r-6 transition-all"
                        />
                        <title>{`${d.day} (${d.date}): ${d.remainingPoints} SP remaining (Ideal: ${d.idealPoints} SP)`}</title>
                      </g>
                    ))}
                  </svg>
                </div>

                <div className="flex justify-between items-center text-[10px] text-foreground-muted mt-3 font-mono border-t border-border/50 pt-2">
                  <span>{burndownData[0]?.day || 'Day 1'} ({burndownData[0]?.remainingPoints || currentSprint.totalStoryPoints || 0} pts)</span>
                  <span>Midpoint</span>
                  <span>{burndownData[burndownData.length - 1]?.day || 'Sprint End'} ({currentRemaining} pts remaining)</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sprint Work Items List */}
          <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
            <div className="p-4 bg-background-secondary border-b border-border flex items-center justify-between">
              <div>
                <h4 className="text-xs font-semibold text-foreground">Committed Work Items</h4>
                <p className="text-[11px] text-foreground-muted">Tasks and user stories scheduled in this iteration</p>
              </div>
              <span className="text-xs font-mono font-semibold px-2 py-0.5 rounded bg-secondary text-foreground-secondary">
                {sprintDetails?.tasks?.length || 0} Items
              </span>
            </div>

            <div className="divide-y divide-border">
              {(!sprintDetails?.tasks || sprintDetails.tasks.length === 0) ? (
                <div className="p-8 text-center text-xs text-foreground-muted italic">
                  No work items currently assigned to this sprint. Go to Product Backlog to assign items.
                </div>
              ) : (
                sprintDetails.tasks.map((task: any) => (
                  <div
                    key={task.id}
                    onClick={() => setSelectedTaskId(task.id)}
                    className="p-3.5 hover:bg-background-secondary/50 transition-colors flex items-center justify-between gap-3 cursor-pointer group"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      <span className="font-mono text-xs font-semibold text-primary shrink-0">
                        {task.taskIdentifier || 'TSK-01'}
                      </span>
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-3 shrink-0 text-xs">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-secondary text-foreground-muted">
                        {task.storyPoints || 0} SP
                      </span>
                      <Badge variant={task.status === 'DONE' ? 'success' : task.status === 'IN_PROGRESS' ? 'status-progress' : 'outline'}>
                        {task.status}
                      </Badge>
                      {task.assignee && (
                        <div className="flex items-center gap-1" title={task.assignee.name}>
                          <div className="h-5 w-5 rounded-full bg-primary/20 text-primary font-bold flex items-center justify-center text-[10px]">
                            {task.assignee.name?.charAt(0) || 'U'}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Structured Sprint Retrospective */}
      {activeTab === 'retrospective' && currentSprint && (
        <div className="space-y-6">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs flex flex-wrap items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-bold text-foreground">
                Retrospective — {currentSprint.name}
              </h3>
              <p className="text-xs text-foreground-muted mt-0.5">
                Capture iteration reflections, friction points, and continuous improvement commitments.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => updateRetroMutation.mutate()}
              isLoading={updateRetroMutation.isPending}
              className="text-xs gap-1.5 h-8 shadow-xs"
            >
              <Save className="h-3.5 w-3.5" />
              <span>Save Retrospective</span>
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Column 1: Went Well */}
            <div className="rounded-xl border border-emerald-500/30 bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-emerald-500/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                <h4 className="text-xs font-bold text-foreground">What Went Well</h4>
              </div>
              <p className="text-[11px] text-foreground-muted">
                Highlights, team achievements, successful deployments, and process improvements.
              </p>
              <Textarea
                value={retroWentWell}
                onChange={(e) => setRetroWentWell(e.target.value)}
                placeholder="e.g. Zero P0 regressions, automated database seeding reduced developer onboarding time by 80%..."
                className="text-xs min-h-[220px]"
              />
            </div>

            {/* Column 2: Went Wrong */}
            <div className="rounded-xl border border-destructive/30 bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-destructive/20">
                <ShieldAlert className="h-4 w-4 text-destructive" />
                <h4 className="text-xs font-bold text-foreground">What Went Wrong / Blockers</h4>
              </div>
              <p className="text-[11px] text-foreground-muted">
                Bottlenecks, unexpected scope creep, flaky integration tests, or API delays.
              </p>
              <Textarea
                value={retroWentWrong}
                onChange={(e) => setRetroWentWrong(e.target.value)}
                placeholder="e.g. Message queue timeouts in staging, third-party payment gateway sandbox latency..."
                className="text-xs min-h-[220px]"
              />
            </div>

            {/* Column 3: Action Items */}
            <div className="rounded-xl border border-primary/30 bg-card p-4 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 pb-2 border-b border-primary/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <h4 className="text-xs font-bold text-foreground">Action Items & Improvements</h4>
              </div>
              <p className="text-[11px] text-foreground-muted">
                Actionable commitments and policy adjustments for the next sprint cycle.
              </p>
              <Textarea
                value={retroActionItems}
                onChange={(e) => setRetroActionItems(e.target.value)}
                placeholder="e.g. 1. Add health checks to local Docker compose.\n2. Enforce PR reviews before staging merges."
                className="text-xs min-h-[220px]"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Velocity History */}
      {activeTab === 'velocity' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <span className="text-[11px] font-medium text-foreground-muted block">Average Team Velocity</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-primary">
                  {velocityData?.averageVelocity || 0}
                </span>
                <span className="text-xs text-foreground-muted">Story Points / Sprint</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <span className="text-[11px] font-medium text-foreground-muted block">Completed Sprints</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-foreground">
                  {velocityData?.totalCompletedSprints || 0}
                </span>
                <span className="text-xs text-foreground-muted">iterations closed</span>
              </div>
            </div>

            <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
              <span className="text-[11px] font-medium text-foreground-muted block">Delivery Consistency</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className="text-2xl font-bold font-mono text-emerald-600">94.2%</span>
                <span className="text-xs text-foreground-muted">commitment accuracy</span>
              </div>
            </div>
          </div>

          <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
            <h4 className="text-xs font-bold text-foreground mb-4">Sprint Delivery History (Committed vs Delivered)</h4>
            <div className="space-y-3">
              {(velocityData?.history || []).map((v: any) => (
                <div key={v.sprintId} className="space-y-1.5 p-3 rounded-lg border border-border bg-background-secondary">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-foreground">{v.sprintName}</span>
                    <span className="font-mono text-foreground-muted">
                      Delivered: <strong className="text-primary">{v.deliveredPoints} SP</strong> / Committed: {v.committedPoints} SP
                    </span>
                  </div>
                  <div className="w-full h-2.5 rounded-full bg-border overflow-hidden flex">
                    <div
                      className="h-full bg-primary"
                      style={{
                        width: `${Math.min(100, (v.deliveredPoints / Math.max(v.committedPoints, 1)) * 100)}%`
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Task Details Modal */}
      {selectedTaskId && (
        <TaskDetailsModal
          taskId={selectedTaskId}
          isOpen={!!selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onTaskUpdated={() => {
            queryClient.invalidateQueries({ queryKey: ['sprints', projectId] });
            queryClient.invalidateQueries({ queryKey: ['sprint-details', currentSprint?.id] });
            queryClient.invalidateQueries({ queryKey: ['burndown', currentSprint?.id] });
          }}
        />
      )}

      {/* Plan Sprint Dialog */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Plan New Sprint"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Sprint Name *</label>
            <Input
              value={sprintName}
              onChange={(e) => setSprintName(e.target.value)}
              placeholder="e.g. Sprint 4 — High-Availability Settlement Cluster"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">Sprint Goal</label>
            <Textarea
              value={sprintGoal}
              onChange={(e) => setSprintGoal(e.target.value)}
              placeholder="Primary milestone, compliance requirements, or deliverable outcome..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Capacity (SP)</label>
              <Input
                type="number"
                value={capacityPoints}
                onChange={(e) => setCapacityPoints(Number(e.target.value))}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">End Date</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsCreateOpen(false)} className="text-xs">
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!sprintName.trim() || createSprintMutation.isPending}
              isLoading={createSprintMutation.isPending}
              onClick={() => createSprintMutation.mutate()}
              className="text-xs"
            >
              Save Sprint
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
