'use client';

import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Dialog } from '../../components/ui/dialog';
import { Badge } from '../../components/ui/badge';
import {
  Clock,
  Play,
  Pause,
  Plus,
  Trash2,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Filter,
  DollarSign,
  TrendingUp,
  RefreshCw
} from 'lucide-react';

interface TimeTrackingViewProps {
  projectId: string;
}

export function TimeTrackingView({ projectId }: TimeTrackingViewProps) {
  const queryClient = useQueryClient();
  const [isLogOpen, setIsLogOpen] = useState(false);

  // Live Timer State
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [timerSeconds, setTimerSeconds] = useState(0);

  // Form State
  const [selectedTaskId, setSelectedTaskId] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [description, setDescription] = useState('');
  const [isBillable, setIsBillable] = useState(true);

  // Filter State
  const [filterBillable, setFilterBillable] = useState<'ALL' | 'BILLABLE' | 'NON_BILLABLE'>('ALL');

  // Timer Tick
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1);
      }, 1000);
    } else {
      clearInterval(interval);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  // Format timer display (HH:MM:SS)
  const formatTimer = (sec: number) => {
    const hrs = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    const s = sec % 60;
    return `${hrs.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Fetch Time Entries
  const {
    data: timeResponse,
    isLoading,
    isError,
    error,
    refetch
  } = useQuery({
    queryKey: ['time-entries', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/time-entries?projectId=${projectId}`);
      return res.data;
    }
  });

  // Safe normalized entries array
  const entries: any[] = Array.isArray(timeResponse)
    ? timeResponse
    : Array.isArray(timeResponse?.entries)
    ? timeResponse.entries
    : [];

  const safeEntries = Array.isArray(entries) ? entries : [];

  // Fetch Tasks for dropdown
  const { data: tasksData = [] } = useQuery({
    queryKey: ['tasks', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/tasks?projectId=${projectId}`);
      const raw = res.data;
      return Array.isArray(raw) ? raw : Array.isArray(raw?.tasks) ? raw.tasks : [];
    }
  });

  const tasks = Array.isArray(tasksData) ? tasksData : [];

  // Log Time Mutation
  const logTimeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/time-entries', {
        projectId,
        taskId: selectedTaskId || undefined,
        durationMinutes: Number(durationMinutes),
        hours: Number(durationMinutes) / 60,
        description: description.trim() || 'Engineering development session',
        isBillable,
        date: new Date().toISOString()
      });
      return res.data;
    },
    onSuccess: () => {
      setDescription('');
      setDurationMinutes(60);
      setSelectedTaskId('');
      setIsLogOpen(false);
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
    }
  });

  // Delete Time Entry Mutation
  const deleteMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/time-entries/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['time-entries', projectId] });
    }
  });

  // Stop Timer and open log modal
  const handleStopTimer = () => {
    setIsTimerRunning(false);
    const minutes = Math.max(1, Math.round(timerSeconds / 60));
    setDurationMinutes(minutes);
    setTimerSeconds(0);
    setIsLogOpen(true);
  };

  // Safe metrics calculations
  const totalMinutes = safeEntries.reduce(
    (acc: number, entry: any) =>
      acc + (entry.durationMinutes ?? Math.round((entry.hours ?? 0) * 60) ?? 0),
    0
  );

  const billableMinutes = safeEntries
    .filter((entry: any) => entry.isBillable)
    .reduce(
      (acc: number, entry: any) =>
        acc + (entry.durationMinutes ?? Math.round((entry.hours ?? 0) * 60) ?? 0),
      0
    );

  const nonBillableMinutes = Math.max(0, totalMinutes - billableMinutes);
  const totalHours = (totalMinutes / 60).toFixed(1);
  const billableHours = (billableMinutes / 60).toFixed(1);
  const nonBillableHours = (nonBillableMinutes / 60).toFixed(1);
  const billablePercentage = totalMinutes > 0 ? Math.round((billableMinutes / totalMinutes) * 100) : 100;

  // Filtered entries for table
  const displayedEntries = safeEntries.filter((entry: any) => {
    if (filterBillable === 'BILLABLE') return entry.isBillable;
    if (filterBillable === 'NON_BILLABLE') return !entry.isBillable;
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Header Banner & Live Stopwatch */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            <span>Time Tracking & Worklogs</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            Billable engineering hours, task allocation logs, and sprint accounting.
          </p>
        </div>

        {/* Live Timer Control */}
        <div className="flex items-center gap-2.5 bg-background-secondary p-1.5 sm:p-2 rounded-xl border border-border">
          <div className="font-mono text-sm sm:text-base font-bold text-foreground px-2">
            {formatTimer(timerSeconds)}
          </div>
          {!isTimerRunning ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsTimerRunning(true)}
              className="text-xs gap-1.5 bg-success hover:bg-success/90 text-white h-8"
            >
              <Play className="h-3 w-3" />
              <span>Start Timer</span>
            </Button>
          ) : (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleStopTimer}
              className="text-xs gap-1.5 h-8"
            >
              <Pause className="h-3 w-3" />
              <span>Stop & Log</span>
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsLogOpen(true)}
            className="text-xs gap-1.5 h-8"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Manual Log</span>
          </Button>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
            Total Logged
          </span>
          <span className="text-2xl font-bold font-mono text-foreground block">
            {totalHours} hrs
          </span>
          <span className="text-[11px] text-foreground-muted block">{safeEntries.length} log sessions</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
            Billable Hours
          </span>
          <span className="text-2xl font-bold font-mono text-success block">
            {billableHours} hrs
          </span>
          <span className="text-[11px] text-foreground-muted block">{billablePercentage}% utilization</span>
        </div>

        <div className="p-4 rounded-xl border border-border bg-card shadow-xs space-y-1">
          <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block">
            Non-Billable Internal
          </span>
          <span className="text-2xl font-bold font-mono text-foreground-muted block">
            {nonBillableHours} hrs
          </span>
          <span className="text-[11px] text-foreground-muted block">Architecture & internal grooming</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between gap-3 pb-1">
        <div className="flex items-center gap-1.5">
          <Button
            variant={filterBillable === 'ALL' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterBillable('ALL')}
            className="text-xs h-7"
          >
            All Logs ({safeEntries.length})
          </Button>
          <Button
            variant={filterBillable === 'BILLABLE' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterBillable('BILLABLE')}
            className="text-xs h-7"
          >
            Billable ({safeEntries.filter((e) => e.isBillable).length})
          </Button>
          <Button
            variant={filterBillable === 'NON_BILLABLE' ? 'secondary' : 'ghost'}
            size="sm"
            onClick={() => setFilterBillable('NON_BILLABLE')}
            className="text-xs h-7"
          >
            Non-Billable ({safeEntries.filter((e) => !e.isBillable).length})
          </Button>
        </div>

        <Button
          variant="outline"
          size="sm"
          onClick={() => refetch()}
          className="text-xs h-7 gap-1"
        >
          <RefreshCw className="h-3 w-3" />
          <span>Refresh</span>
        </Button>
      </div>

      {/* Time Entries Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Date</th>
                <th className="py-3 px-4">Work Description</th>
                <th className="py-3 px-4 w-48">Associated Task</th>
                <th className="py-3 px-4 w-28 text-center">Duration</th>
                <th className="py-3 px-4 w-28 text-center">Billing</th>
                <th className="py-3 px-4 w-36">Engineer</th>
                <th className="py-3 px-4 w-16 text-center">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-foreground-muted">
                    <div className="flex items-center justify-center gap-2">
                      <Clock className="h-4 w-4 animate-spin text-primary" />
                      <span>Loading time worklogs from database...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-destructive">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      <span>Failed to load time entries: {(error as any)?.message || 'Network error'}</span>
                      <Button variant="outline" size="sm" onClick={() => refetch()} className="text-xs mt-2">
                        Try Again
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : displayedEntries.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-16 text-center text-foreground-muted">
                    <div className="flex flex-col items-center justify-center gap-2 max-w-sm mx-auto">
                      <Clock className="h-8 w-8 text-foreground-muted/50" />
                      <p className="font-semibold text-foreground text-sm">No time entries recorded yet</p>
                      <p className="text-xs text-foreground-muted">
                        Start the live timer above or manually log hours worked on tasks.
                      </p>
                      <Button variant="primary" size="sm" onClick={() => setIsLogOpen(true)} className="text-xs mt-2">
                        <Plus className="h-3.5 w-3.5 mr-1" /> Log Work Now
                      </Button>
                    </div>
                  </td>
                </tr>
              ) : (
                displayedEntries.map((entry: any) => {
                  const entryMinutes =
                    entry.durationMinutes ?? Math.round((entry.hours ?? 0) * 60) ?? 0;
                  const taskKey = entry.task?.taskIdentifier || entry.task?.key;
                  return (
                    <tr key={entry.id} className="hover:bg-background-secondary/50 transition-colors">
                      <td className="py-3 px-4 font-mono text-foreground-secondary text-[11px] whitespace-nowrap">
                        {entry.date ? new Date(entry.date).toLocaleDateString() : 'Today'}
                      </td>
                      <td className="py-3 px-4 font-medium text-foreground">
                        {entry.description || 'Engineering development session'}
                      </td>
                      <td className="py-3 px-4">
                        {entry.task ? (
                          <span className="font-mono text-primary font-medium text-[11px] truncate block max-w-[180px]">
                            {taskKey}: {entry.task.title}
                          </span>
                        ) : (
                          <span className="text-foreground-muted text-[11px]">General Work</span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-center font-mono font-bold text-foreground">
                        {(entryMinutes / 60).toFixed(1)} hrs
                      </td>
                      <td className="py-3 px-4 text-center">
                        {entry.isBillable ? (
                          <Badge variant="outline" className="text-[10px] text-success border-success/30 font-medium">
                            Billable
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="text-[10px] text-foreground-muted font-medium">
                            Internal
                          </Badge>
                        )}
                      </td>
                      <td className="py-3 px-4 text-foreground-secondary text-[11px] truncate max-w-[140px]">
                        {entry.user?.name || 'Engineer'}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => deleteMutation.mutate(entry.id)}
                          disabled={deleteMutation.isPending}
                          className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                          title="Delete entry"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Manual Log Dialog */}
      <Dialog
        isOpen={isLogOpen}
        onClose={() => setIsLogOpen(false)}
        maxWidth="md"
      >
        <div className="space-y-4">
          <div className="flex items-center gap-2.5 pb-2 border-b border-border">
            <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <Clock className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-foreground">Log Engineering Time</h3>
              <p className="text-xs text-foreground-muted">Record hours dedicated to project development</p>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Associated Task
            </label>
            <select
              value={selectedTaskId}
              onChange={(e) => setSelectedTaskId(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="">-- General Project Work --</option>
              {tasks.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.taskIdentifier || t.key || 'TASK'} - {t.title}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Duration (Minutes) *
              </label>
              <Input
                type="number"
                value={durationMinutes}
                onChange={(e) => setDurationMinutes(Math.max(1, parseInt(e.target.value) || 0))}
                min={1}
                className="text-xs"
                required
              />
              <span className="text-[10px] text-foreground-muted font-mono mt-0.5 block">
                = {(durationMinutes / 60).toFixed(1)} hours
              </span>
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">
                Billing Classification
              </label>
              <select
                value={isBillable ? 'yes' : 'no'}
                onChange={(e) => setIsBillable(e.target.value === 'yes')}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:ring-1 focus:ring-primary"
              >
                <option value="yes">Billable</option>
                <option value="no">Non-Billable (Internal)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Work Description *
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Detail what was accomplished, tested, or investigated..."
              rows={3}
              className="text-xs"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsLogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!description.trim() || logTimeMutation.isPending}
              isLoading={logTimeMutation.isPending}
              onClick={() => logTimeMutation.mutate()}
            >
              Save Time Entry
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
