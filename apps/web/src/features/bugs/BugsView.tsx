'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  AlertTriangle,
  Plus,
  Bug,
  CheckCircle2,
  AlertCircle,
  FileCode,
  ShieldAlert,
  Server,
  Filter,
  Search,
  CheckCircle,
  RefreshCw,
  ExternalLink,
  Laptop
} from 'lucide-react';
import { BugSeverity, BugStatus } from '@prisma/client';

interface BugsViewProps {
  projectId: string;
}

export function BugsView({ projectId }: BugsViewProps) {
  const queryClient = useQueryClient();
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [selectedBug, setSelectedBug] = useState<any | null>(null);

  // Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [filterSeverity, setFilterSeverity] = useState<string>('ALL');
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterEnv, setFilterEnv] = useState<string>('ALL');

  // Report Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<string>('HIGH');
  const [priority, setPriority] = useState<string>('HIGH');
  const [stepsToReproduce, setStepsToReproduce] = useState('');
  const [expectedResult, setExpectedResult] = useState('');
  const [actualResult, setActualResult] = useState('');
  const [environment, setEnvironment] = useState('Staging Kubernetes Cluster');
  const [rootCause, setRootCause] = useState('');
  const [resolutionNotes, setResolutionNotes] = useState('');

  // Fetch Analytics
  const { data: analytics } = useQuery({
    queryKey: ['bug-analytics', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/bugs/analytics?projectId=${projectId}`);
      return res.data;
    }
  });

  // Fetch Bugs
  const { data: bugs = [], isLoading } = useQuery({
    queryKey: ['bugs', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/bugs?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Report Bug Mutation
  const reportBugMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/bugs', {
        projectId,
        title,
        description,
        severity,
        priority,
        stepsToReproduce,
        expectedResult,
        actualResult,
        environment,
        rootCause,
        resolutionNotes
      });
      return res.data;
    },
    onSuccess: () => {
      setTitle('');
      setDescription('');
      setStepsToReproduce('');
      setExpectedResult('');
      setActualResult('');
      setRootCause('');
      setResolutionNotes('');
      setIsReportOpen(false);
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bug-analytics', projectId] });
    }
  });

  // Update Status / Bug Mutation
  const updateBugMutation = useMutation({
    mutationFn: async ({ id, data }: { id: string; data: any }) => {
      const res = await api.patch(`/bugs/${id}`, data);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['bugs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['bug-analytics', projectId] });
      if (selectedBug) {
        setSelectedBug(null);
      }
    }
  });

  const getSeverityBadge = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return (
          <span className="text-[10px] font-bold text-destructive bg-destructive/15 px-2 py-0.5 rounded border border-destructive/30">
            Critical P0
          </span>
        );
      case 'HIGH':
        return (
          <span className="text-[10px] font-semibold text-warning bg-warning/15 px-2 py-0.5 rounded border border-warning/30">
            High P1
          </span>
        );
      case 'MEDIUM':
        return (
          <span className="text-[10px] text-foreground-secondary bg-secondary px-2 py-0.5 rounded border border-border">
            Medium P2
          </span>
        );
      default:
        return (
          <span className="text-[10px] text-foreground-muted bg-secondary/60 px-2 py-0.5 rounded">
            Low P3
          </span>
        );
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'FIXED':
      case 'VERIFIED':
      case 'CLOSED':
        return <Badge variant="success">{status}</Badge>;
      case 'READY_FOR_TESTING':
        return <Badge variant="status-progress">Ready for QA</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">In Progress</Badge>;
      case 'CONFIRMED':
        return <Badge variant="warning">Confirmed</Badge>;
      case 'REOPENED':
        return <Badge variant="destructive">Reopened</Badge>;
      default:
        return <Badge variant="outline">Open</Badge>;
    }
  };

  // Filter bugs
  const filteredBugs = bugs.filter((b: any) => {
    if (filterSeverity !== 'ALL' && b.severity !== filterSeverity) return false;
    if (filterStatus !== 'ALL' && b.status !== filterStatus) return false;
    if (filterEnv !== 'ALL' && b.environment !== filterEnv) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        b.title.toLowerCase().includes(q) ||
        (b.bugIdentifier && b.bugIdentifier.toLowerCase().includes(q)) ||
        (b.description && b.description.toLowerCase().includes(q));
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Defect Quality Analytics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
          <span className="text-[11px] font-medium text-foreground-muted block">Total Defects</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-foreground">
              {analytics?.totalBugs ?? bugs.length}
            </span>
            <span className="text-xs text-foreground-muted">tracked</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-destructive/30 bg-destructive/5 shadow-xs">
          <span className="text-[11px] font-medium text-destructive block">Critical Blockers (P0)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-destructive">
              {analytics?.critical ?? bugs.filter((b: any) => b.severity === 'CRITICAL').length}
            </span>
            <span className="text-xs text-destructive/80">needs immediate hotfix</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-warning/30 bg-warning/5 shadow-xs">
          <span className="text-[11px] font-medium text-warning block">High Priority (P1)</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-warning">
              {analytics?.high ?? bugs.filter((b: any) => b.severity === 'HIGH').length}
            </span>
            <span className="text-xs text-warning/80">scheduled in sprint</span>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/5 shadow-xs">
          <span className="text-[11px] font-medium text-emerald-600 block">Resolution Rate</span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-2xl font-bold font-mono text-emerald-600">
              {analytics?.resolutionRate ?? 0}%
            </span>
            <span className="text-xs text-emerald-600/80">
              ({analytics?.resolvedBugs ?? 0} resolved)
            </span>
          </div>
        </div>
      </div>

      {/* Header & Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-xl bg-card border border-border shadow-xs">
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <Bug className="h-4 w-4 text-destructive" />
            <h3 className="font-semibold text-sm text-foreground">Defect Tracking & QA Audits</h3>
            <span className="text-[11px] text-foreground-muted">
              ({filteredBugs.length} showing)
            </span>
          </div>

          {/* Search */}
          <div className="relative">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <input
              type="text"
              placeholder="Search defects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 pr-3 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-1 focus:ring-primary w-40 md:w-52"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Severity Filter */}
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Severities</option>
            <option value="CRITICAL">Critical P0</option>
            <option value="HIGH">High P1</option>
            <option value="MEDIUM">Medium P2</option>
            <option value="LOW">Low P3</option>
          </select>

          {/* Status Filter */}
          <select
            value={filterStatus}
            onChange={(e) => setFilterStatus(e.target.value)}
            className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none"
          >
            <option value="ALL">All Statuses</option>
            <option value="OPEN">Open</option>
            <option value="CONFIRMED">Confirmed</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="FIXED">Fixed</option>
            <option value="READY_FOR_TESTING">Ready for QA</option>
            <option value="VERIFIED">Verified</option>
            <option value="CLOSED">Closed</option>
          </select>

          {/* Report Defect Button */}
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsReportOpen(true)}
            className="text-xs gap-1.5 h-8 shadow-xs bg-destructive hover:bg-destructive/90 text-white"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Report Defect</span>
          </Button>
        </div>
      </div>

      {/* Bugs Table */}
      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-border bg-background-secondary text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                <th className="py-3 px-4 w-32">Bug Key</th>
                <th className="py-3 px-4">Title & Description</th>
                <th className="py-3 px-4 w-28">Severity</th>
                <th className="py-3 px-4 w-36">Status</th>
                <th className="py-3 px-4 w-44">Environment</th>
                <th className="py-3 px-4 w-32 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border text-xs">
              {isLoading ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-foreground-muted">
                    Loading defect records...
                  </td>
                </tr>
              ) : filteredBugs.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-foreground-muted">
                    No defects found matching your criteria. Clean build!
                  </td>
                </tr>
              ) : (
                filteredBugs.map((b: any) => (
                  <tr key={b.id} className="hover:bg-background-secondary/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-destructive">
                      <button
                        onClick={() => setSelectedBug(b)}
                        className="hover:underline flex items-center gap-1"
                      >
                        {b.bugIdentifier || b.key || 'BUG-101'}
                      </button>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <button
                          onClick={() => setSelectedBug(b)}
                          className="font-semibold text-foreground hover:text-primary text-left text-xs transition-colors hover:underline block"
                        >
                          {b.title}
                        </button>
                        {b.description && (
                          <p className="text-[11px] text-foreground-muted line-clamp-1">
                            {b.description}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      {getSeverityBadge(b.severity)}
                    </td>
                    <td className="py-3.5 px-4">
                      <select
                        value={b.status}
                        onChange={(e) =>
                          updateBugMutation.mutate({
                            id: b.id,
                            data: { status: e.target.value }
                          })
                        }
                        className="bg-transparent text-xs font-semibold focus:outline-none cursor-pointer hover:underline text-foreground"
                      >
                        <option value="OPEN">OPEN</option>
                        <option value="CONFIRMED">CONFIRMED</option>
                        <option value="IN_PROGRESS">IN PROGRESS</option>
                        <option value="FIXED">FIXED</option>
                        <option value="READY_FOR_TESTING">READY FOR QA</option>
                        <option value="VERIFIED">VERIFIED</option>
                        <option value="CLOSED">CLOSED</option>
                        <option value="REOPENED">REOPENED</option>
                      </select>
                    </td>
                    <td className="py-3.5 px-4 text-foreground-secondary text-[11px] font-mono">
                      {b.environment || 'Staging'}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {b.status !== 'VERIFIED' && b.status !== 'CLOSED' ? (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateBugMutation.mutate({
                              id: b.id,
                              data: { status: 'FIXED' }
                            })
                          }
                          className="text-[11px] h-7 gap-1 text-emerald-600 hover:bg-emerald-500/10"
                        >
                          <CheckCircle2 className="h-3 w-3" />
                          <span>Fix</span>
                        </Button>
                      ) : (
                        <span className="text-[11px] text-emerald-600 font-semibold">Verified</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bug Details & Root Cause Audit Dialog */}
      {selectedBug && (
        <Dialog
          isOpen={!!selectedBug}
          onClose={() => setSelectedBug(null)}
          title={`Defect Audit: ${selectedBug.bugIdentifier || selectedBug.key || 'BUG'}`}
          size="lg"
        >
          <div className="space-y-4 pt-2">
            <div className="flex items-center justify-between gap-3 pb-2 border-b border-border">
              <div>
                <h3 className="text-sm font-bold text-foreground">{selectedBug.title}</h3>
                <span className="text-[11px] text-foreground-muted font-mono">
                  Environment: {selectedBug.environment || 'Staging'} • Browser: {selectedBug.browser || 'Chrome 122'}
                </span>
              </div>
              {getSeverityBadge(selectedBug.severity)}
            </div>

            {selectedBug.description && (
              <div>
                <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
                  Summary & Impact
                </span>
                <p className="text-xs text-foreground bg-secondary/30 p-2.5 rounded-lg border border-border">
                  {selectedBug.description}
                </p>
              </div>
            )}

            {selectedBug.stepsToReproduce && (
              <div>
                <span className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider block mb-1">
                  Steps to Reproduce
                </span>
                <pre className="text-xs font-mono text-foreground bg-secondary/50 p-3 rounded-lg border border-border whitespace-pre-wrap">
                  {selectedBug.stepsToReproduce}
                </pre>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 text-xs">
              {selectedBug.expectedResult && (
                <div>
                  <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
                    Expected Result
                  </span>
                  <p className="text-foreground-secondary bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20">
                    {selectedBug.expectedResult}
                  </p>
                </div>
              )}
              {selectedBug.actualResult && (
                <div>
                  <span className="text-[11px] font-semibold text-destructive uppercase tracking-wider block mb-1">
                    Actual Result
                  </span>
                  <p className="text-foreground-secondary bg-destructive/5 p-2.5 rounded-lg border border-destructive/20">
                    {selectedBug.actualResult}
                  </p>
                </div>
              )}
            </div>

            {selectedBug.rootCause && (
              <div>
                <span className="text-[11px] font-semibold text-primary uppercase tracking-wider block mb-1">
                  Engineering Root Cause
                </span>
                <p className="text-xs text-foreground bg-primary/5 p-2.5 rounded-lg border border-primary/20 leading-relaxed font-mono">
                  {selectedBug.rootCause}
                </p>
              </div>
            )}

            {selectedBug.resolutionNotes && (
              <div>
                <span className="text-[11px] font-semibold text-emerald-600 uppercase tracking-wider block mb-1">
                  Resolution Notes & Patch Verification
                </span>
                <p className="text-xs text-foreground bg-emerald-500/5 p-2.5 rounded-lg border border-emerald-500/20 leading-relaxed">
                  {selectedBug.resolutionNotes}
                </p>
              </div>
            )}

            <div className="flex justify-between items-center pt-3 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-xs text-foreground-muted">Update Status:</span>
                <select
                  value={selectedBug.status}
                  onChange={(e) => {
                    updateBugMutation.mutate({
                      id: selectedBug.id,
                      data: { status: e.target.value }
                    });
                  }}
                  className="h-8 px-2 text-xs font-semibold rounded-lg border border-border bg-background text-foreground"
                >
                  <option value="OPEN">OPEN</option>
                  <option value="CONFIRMED">CONFIRMED</option>
                  <option value="IN_PROGRESS">IN PROGRESS</option>
                  <option value="FIXED">FIXED</option>
                  <option value="READY_FOR_TESTING">READY FOR QA</option>
                  <option value="VERIFIED">VERIFIED</option>
                  <option value="CLOSED">CLOSED</option>
                  <option value="REOPENED">REOPENED</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedBug(null)}
                className="text-xs"
              >
                Close Audit
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Report Defect Dialog */}
      <Dialog
        isOpen={isReportOpen}
        onClose={() => setIsReportOpen(false)}
        title="Report Engineering Defect"
        size="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Defect Summary *
            </label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Race condition in ledger balance debit under burst load"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Description & Customer Impact
            </label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Under high TPS, balance can dip into negative due to non-atomic query..."
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Severity</label>
              <select
                value={severity}
                onChange={(e) => setSeverity(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground"
              >
                <option value="CRITICAL">Critical P0</option>
                <option value="HIGH">High P1</option>
                <option value="MEDIUM">Medium P2</option>
                <option value="LOW">Low P3</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="w-full h-8 px-2 text-xs rounded-lg border border-border bg-background text-foreground"
              >
                <option value="URGENT">Urgent</option>
                <option value="HIGH">High</option>
                <option value="MEDIUM">Medium</option>
                <option value="LOW">Low</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Environment</label>
              <Input
                value={environment}
                onChange={(e) => setEnvironment(e.target.value)}
                placeholder="Staging / Production"
                className="text-xs h-8"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-medium text-foreground block mb-1">
              Steps to Reproduce
            </label>
            <Textarea
              value={stepsToReproduce}
              onChange={(e) => setStepsToReproduce(e.target.value)}
              placeholder="1. Send 5,000 requests in parallel&#10;2. Check account ledger balance"
              rows={2}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Expected Result</label>
              <Input
                value={expectedResult}
                onChange={(e) => setExpectedResult(e.target.value)}
                placeholder="Idempotency key prevents duplicate debit"
                className="text-xs"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-foreground block mb-1">Actual Result</label>
              <Input
                value={actualResult}
                onChange={(e) => setActualResult(e.target.value)}
                placeholder="Both transactions debited simultaneously"
                className="text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsReportOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!title.trim() || reportBugMutation.isPending}
              isLoading={reportBugMutation.isPending}
              onClick={() => reportBugMutation.mutate()}
              className="text-xs bg-destructive hover:bg-destructive/90 text-white"
            >
              Submit Defect
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
