'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';
import {
  BarChart3,
  Download,
  PieChart,
  TrendingUp,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Layers,
  Bug,
  ShieldAlert,
  Calendar,
  Filter,
  RefreshCw,
  Target,
  Users,
  Activity,
  FileSpreadsheet
} from 'lucide-react';
import { ExecutiveReportData } from '@devblueprint/types';

interface ProjectReportsViewProps {
  projectId?: string;
}

export function ProjectReportsView({ projectId }: ProjectReportsViewProps) {
  const [dateRange, setDateRange] = useState<string>('all');

  const { data: report, isLoading, refetch, isFetching } = useQuery<ExecutiveReportData>({
    queryKey: ['executive-reports', projectId, dateRange],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (projectId && projectId.toLowerCase() !== 'all') {
        params.append('projectId', projectId);
      }
      if (dateRange && dateRange !== 'all') {
        params.append('range', dateRange);
      }
      const queryStr = params.toString() ? `?${params.toString()}` : '';
      const res = await api.get<ExecutiveReportData>(`/reports/executive${queryStr}`);
      if (!res.data) throw new Error('Failed to load executive report data');
      return res.data;
    }
  });

  const handleDownloadCSV = (type: 'kpi' | 'velocity' | 'defects' | 'time' | 'status') => {
    const params = new URLSearchParams({ type });
    if (projectId && projectId.toLowerCase() !== 'all') {
      params.append('projectId', projectId);
    }
    const token = typeof window !== 'undefined' ? localStorage.getItem('devblueprint_token') : null;
    const downloadUrl = `http://localhost:4000/api/v1/reports/export/csv?${params.toString()}`;

    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `report-${type}-${projectId || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Failed to download CSV:', err);
      });
  };

  const kpis = report?.kpis;
  const health = report?.projectHealth;

  const getHealthBadge = (progress: number = 0, blocked: number = 0) => {
    if (blocked > 2 || progress < 40) {
      return <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30">CRITICAL</Badge>;
    }
    if (blocked > 0 || progress < 70) {
      return <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30">AT RISK</Badge>;
    }
    return <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30">HEALTHY</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Header and Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-primary" />
            <span>Executive Reports & Delivery Analytics</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            Real-time delivery KPIs, sprint velocity trends, defect resolution integrity, and time logs.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Date Range Selector */}
          <div className="flex items-center gap-1.5 bg-background border border-border rounded-lg px-2.5 py-1.5 text-xs text-foreground">
            <Calendar className="h-3.5 w-3.5 text-foreground-muted" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="bg-transparent text-xs font-medium focus:outline-hidden cursor-pointer"
            >
              <option value="all">All Time History</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
              <option value="90d">Last 90 Days</option>
            </select>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isFetching}
            className="text-xs gap-1.5 h-8"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${isFetching ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </Button>

          {/* Export Dropdown / Action */}
          <div className="relative group">
            <Button
              variant="outline"
              size="sm"
              className="text-xs gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/5"
            >
              <Download className="h-3.5 w-3.5" />
              <span>Export CSV</span>
            </Button>
            <div className="absolute right-0 top-full mt-1 hidden group-hover:flex flex-col bg-card border border-border rounded-lg shadow-lg py-1 w-44 z-30">
              <button
                onClick={() => handleDownloadCSV('kpi')}
                className="px-3 py-1.5 text-left text-xs hover:bg-background-secondary text-foreground flex items-center gap-2"
              >
                <FileSpreadsheet className="h-3.5 w-3.5 text-primary" />
                <span>Executive KPIs</span>
              </button>
              <button
                onClick={() => handleDownloadCSV('velocity')}
                className="px-3 py-1.5 text-left text-xs hover:bg-background-secondary text-foreground flex items-center gap-2"
              >
                <TrendingUp className="h-3.5 w-3.5 text-emerald-500" />
                <span>Sprint Velocity</span>
              </button>
              <button
                onClick={() => handleDownloadCSV('defects')}
                className="px-3 py-1.5 text-left text-xs hover:bg-background-secondary text-foreground flex items-center gap-2"
              >
                <Bug className="h-3.5 w-3.5 text-rose-500" />
                <span>Defect Metrics</span>
              </button>
              <button
                onClick={() => handleDownloadCSV('time')}
                className="px-3 py-1.5 text-left text-xs hover:bg-background-secondary text-foreground flex items-center gap-2"
              >
                <Clock className="h-3.5 w-3.5 text-blue-500" />
                <span>Time Tracking</span>
              </button>
              <button
                onClick={() => handleDownloadCSV('status')}
                className="px-3 py-1.5 text-left text-xs hover:bg-background-secondary text-foreground flex items-center gap-2"
              >
                <Layers className="h-3.5 w-3.5 text-violet-500" />
                <span>Work Breakdown</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Project Health Banner */}
      {health && (
        <Card className="border-border bg-card">
          <CardContent className="p-4 sm:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-mono font-bold text-base shrink-0">
                {health.overallProgress}%
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold text-foreground">Project Health Score</span>
                  {getHealthBadge(health.overallProgress, health.blockedTasks)}
                </div>
                <p className="text-xs text-foreground-muted mt-0.5">
                  Calculated from milestone completion ({health.milestoneCompletion}%), release readiness ({health.releaseReadiness}%), open risks ({health.openRisks}), and blocked tasks ({health.blockedTasks}).
                </p>
              </div>
            </div>

            <div className="flex items-center gap-6 text-xs text-foreground-secondary border-t md:border-t-0 pt-3 md:pt-0">
              <div className="flex items-center gap-1.5">
                <AlertTriangle className="h-4 w-4 text-amber-500" />
                <span>Blockers: <strong className="text-foreground">{health.blockedTasks}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <ShieldAlert className="h-4 w-4 text-orange-500" />
                <span>Active Risks: <strong className="text-foreground">{health.openRisks}</strong></span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                <span>Release Readiness: <strong className="text-foreground">{health.releaseReadiness}%</strong></span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* 8 Executive KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Sprint Velocity */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.sprintVelocity.title || 'Sprint Velocity'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {kpis?.sprintVelocity.currentValue ?? 0}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.sprintVelocity.unit}
              </span>
            </div>
            <span className="text-[11px] text-emerald-600 flex items-center gap-1 font-medium pt-1">
              <TrendingUp className="h-3 w-3" />
              {kpis?.sprintVelocity.period} · {kpis?.sprintVelocity.definition}
            </span>
          </CardContent>
        </Card>

        {/* Task Throughput */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.taskThroughput.title || 'Task Throughput'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-primary">
                {kpis?.taskThroughput.currentValue ?? 0}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.taskThroughput.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.taskThroughput.definition}
            </span>
          </CardContent>
        </Card>

        {/* Defect Resolution Rate */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.defectResolutionRate.title || 'Defect Resolution Rate'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-rose-500">
                {kpis?.defectResolutionRate.currentValue ?? 'N/A'}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.defectResolutionRate.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.defectResolutionRate.definition}
            </span>
          </CardContent>
        </Card>

        {/* Engineering Hours */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.engineeringHours.title || 'Engineering Hours Logged'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {kpis?.engineeringHours.currentValue ?? 0}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.engineeringHours.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.engineeringHours.definition}
            </span>
          </CardContent>
        </Card>

        {/* Sprint Completion Rate */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.sprintCompletionRate.title || 'Sprint Completion Rate'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-blue-600">
                {kpis?.sprintCompletionRate.currentValue ?? 0}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.sprintCompletionRate.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.sprintCompletionRate.definition}
            </span>
          </CardContent>
        </Card>

        {/* Backlog Scope */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.backlogSize.title || 'Backlog Size'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-foreground">
                {kpis?.backlogSize.currentValue ?? 0}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.backlogSize.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.backlogSize.definition}
            </span>
          </CardContent>
        </Card>

        {/* Open Critical Defects */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.openCriticalBugs.title || 'Open Critical Defects'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-destructive">
                {kpis?.openCriticalBugs.currentValue ?? 0}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.openCriticalBugs.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.openCriticalBugs.definition}
            </span>
          </CardContent>
        </Card>

        {/* On-Time Delivery Rate */}
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-5 space-y-1">
            <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
              {kpis?.onTimeDeliveryRate.title || 'On-Time Delivery Rate'}
            </span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold font-mono text-emerald-600">
                {kpis?.onTimeDeliveryRate.currentValue ?? 100}
              </span>
              <span className="text-xs text-foreground-muted font-mono">
                {kpis?.onTimeDeliveryRate.unit}
              </span>
            </div>
            <span className="text-[11px] text-foreground-muted pt-1 block">
              {kpis?.onTimeDeliveryRate.definition}
            </span>
          </CardContent>
        </Card>
      </div>

      {/* Sprint Velocity Comparison */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-primary" />
              <span>Sprint Velocity & Commitment Trends</span>
            </CardTitle>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Historical story points committed vs points accepted across sprint milestones
            </p>
          </div>
          <span className="text-[11px] font-mono text-foreground-muted">
            {report?.velocityTrends.length || 0} Sprints Analyzed
          </span>
        </CardHeader>
        <CardContent className="p-6">
          {(!report?.velocityTrends || report.velocityTrends.length === 0) ? (
            <div className="text-center py-8 text-xs text-foreground-muted">
              No closed sprint velocity records found for this scope.
            </div>
          ) : (
            <div className="space-y-4">
              {report.velocityTrends.map((sprint, idx) => {
                const velocityPct = sprint.plannedPoints > 0
                  ? Math.round((sprint.completedPoints / sprint.plannedPoints) * 100)
                  : 100;
                return (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-foreground">{sprint.sprintName}</span>
                      <span className="font-mono text-foreground-muted">
                        {sprint.completedPoints} / {sprint.plannedPoints} pts ({velocityPct}%)
                      </span>
                    </div>
                    <div className="h-4 w-full bg-background-secondary rounded-full overflow-hidden flex border border-border">
                      <div
                        className="bg-primary h-full transition-all"
                        style={{ width: `${Math.min(velocityPct, 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Work Status Breakdown & Defect Breakdown in 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Work Status Breakdown */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" />
              <span>Work Status Distribution</span>
            </CardTitle>
            <span className="text-[11px] font-mono text-foreground-muted">
              {report?.statusBreakdown.reduce((sum, s) => sum + s.count, 0) || 0} Total Items
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            {/* Visual Stacked Bar */}
            <div className="h-6 w-full bg-background-secondary rounded-lg overflow-hidden flex border border-border">
              {report?.statusBreakdown.map((s, idx) => {
                const colors = [
                  'bg-slate-400',
                  'bg-blue-400',
                  'bg-primary',
                  'bg-amber-400',
                  'bg-purple-500',
                  'bg-rose-500',
                  'bg-emerald-500'
                ];
                return (
                  <div
                    key={idx}
                    className={`${colors[idx % colors.length]} h-full transition-all`}
                    style={{ width: `${s.percentage}%` }}
                    title={`${s.status}: ${s.count} items (${s.percentage}%)`}
                  />
                );
              })}
            </div>

            {/* List breakdown */}
            <div className="grid grid-cols-2 gap-2 text-xs pt-2">
              {report?.statusBreakdown.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-background-secondary border border-border">
                  <span className="font-mono text-foreground-secondary">{item.status}</span>
                  <span className="font-semibold text-foreground">
                    {item.count} <span className="text-[10px] text-foreground-muted font-normal">({item.storyPoints} pts)</span>
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Defect Resolution Breakdown */}
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Bug className="h-4 w-4 text-destructive" />
              <span>Defect Severity & Environment Analysis</span>
            </CardTitle>
            <span className="text-[11px] font-mono text-foreground-muted">
              {report?.defectResolution.totalBugs || 0} Total Defects
            </span>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div>
              <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-2">
                By Severity
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">LOW</span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {report?.defectResolution.bySeverity?.LOW || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">MEDIUM</span>
                  <span className="text-base font-bold font-mono text-blue-500">
                    {report?.defectResolution.bySeverity?.MEDIUM || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">HIGH</span>
                  <span className="text-base font-bold font-mono text-amber-500">
                    {report?.defectResolution.bySeverity?.HIGH || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">CRITICAL</span>
                  <span className="text-base font-bold font-mono text-destructive">
                    {report?.defectResolution.bySeverity?.CRITICAL || 0}
                  </span>
                </div>
              </div>
            </div>

            <div className="pt-2 border-t border-border">
              <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-2">
                By Environment
              </span>
              <div className="grid grid-cols-3 gap-2">
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">DEV</span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {report?.defectResolution.byEnvironment?.DEVELOPMENT || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">STAGING</span>
                  <span className="text-base font-bold font-mono text-foreground">
                    {report?.defectResolution.byEnvironment?.STAGING || 0}
                  </span>
                </div>
                <div className="p-2.5 rounded-lg border border-border bg-background-secondary text-center">
                  <span className="text-[10px] text-foreground-muted block">PROD</span>
                  <span className="text-base font-bold font-mono text-rose-500">
                    {report?.defectResolution.byEnvironment?.PRODUCTION || 0}
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Engineering Time Tracking Breakdown */}
      <Card className="border-border bg-card shadow-xs">
        <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xs font-semibold text-foreground flex items-center gap-2">
              <Clock className="h-4 w-4 text-primary" />
              <span>Engineering Time Tracking & Resource Allocation</span>
            </CardTitle>
            <p className="text-[11px] text-foreground-muted mt-0.5">
              Aggregated work log hours partitioned by project initiative and engineering contributors
            </p>
          </div>
          <span className="text-xs font-mono font-bold text-primary">
            {report?.engineeringTime.totalHours || 0} hrs Total
          </span>
        </CardHeader>
        <CardContent className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* By Project */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground block">Allocation by Project</span>
            {(!report?.engineeringTime.byProject || report.engineeringTime.byProject.length === 0) ? (
              <p className="text-xs text-foreground-muted py-4">No time logged against active projects.</p>
            ) : (
              report.engineeringTime.byProject.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-background-secondary border border-border text-xs">
                  <span className="font-medium text-foreground truncate max-w-[200px]">{item.projectName}</span>
                  <span className="font-mono font-semibold text-foreground">{item.hours}h</span>
                </div>
              ))
            )}
          </div>

          {/* By Member */}
          <div className="space-y-3">
            <span className="text-xs font-semibold text-foreground block">Allocation by Team Member</span>
            {(!report?.engineeringTime.byMember || report.engineeringTime.byMember.length === 0) ? (
              <p className="text-xs text-foreground-muted py-4">No member time log entries found.</p>
            ) : (
              report.engineeringTime.byMember.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between p-2.5 rounded-lg bg-background-secondary border border-border text-xs">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px] shrink-0">
                      {item.memberName.charAt(0)}
                    </div>
                    <span className="font-medium text-foreground truncate">{item.memberName}</span>
                  </div>
                  <span className="font-mono font-semibold text-foreground">{item.hours}h</span>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
