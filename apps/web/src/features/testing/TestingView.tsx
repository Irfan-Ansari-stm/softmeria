'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  CheckCircle,
  XCircle,
  Play,
  Plus,
  ShieldCheck,
  CheckCircle2,
  AlertOctagon,
  Layers,
  FileCheck,
  Copy,
  Trash2,
  Edit2,
  Clock,
  Bug,
  BarChart3,
  ListOrdered,
  Paperclip,
  CheckSquare,
  AlertCircle
} from 'lucide-react';

interface TestingViewProps {
  projectId: string;
}

const TEST_TYPES = [
  'UNIT',
  'INTEGRATION',
  'FUNCTIONAL',
  'REGRESSION',
  'SMOKE',
  'SANITY',
  'API',
  'UI',
  'E2E',
  'PERFORMANCE',
  'SECURITY',
  'ACCESSIBILITY',
  'ACCEPTANCE'
];

const EXEC_STATUSES = [
  'ALL',
  'NOT_RUN',
  'PASSED',
  'FAILED',
  'BLOCKED',
  'SKIPPED',
  'RETEST_REQUIRED'
];

export function TestingView({ projectId }: TestingViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'cases' | 'runs' | 'reports'>('cases');
  const [selectedStatus, setSelectedStatus] = useState('ALL');
  const [selectedSuiteId, setSelectedSuiteId] = useState<string>('ALL');

  // Modals & Drawers
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isTestRunModalOpen, setIsTestRunModalOpen] = useState(false);
  const [selectedCase, setSelectedCase] = useState<any | null>(null);

  // Form State: Test Case
  const [suiteId, setSuiteId] = useState('');
  const [title, setTitle] = useState('');
  const [testType, setTestType] = useState('INTEGRATION');
  const [priority, setPriority] = useState('HIGH');
  const [environment, setEnvironment] = useState('Staging');
  const [preconditions, setPreconditions] = useState('');
  const [steps, setSteps] = useState('');
  const [expectedResult, setExpectedResult] = useState('');

  // Form State: Test Run
  const [runName, setRunName] = useState('');
  const [runEnvironment, setRunEnvironment] = useState('Staging Cluster us-east-1');
  const [runNotes, setRunNotes] = useState('');

  // Fetch Test Plans & Suites
  const { data: plans = [] } = useQuery({
    queryKey: ['test-plans', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/testing/plans?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const suites = plans.flatMap((p: any) => p.testSuites || []);

  // Fetch Test Cases
  const { data: testCases = [], isLoading: isCasesLoading } = useQuery({
    queryKey: ['test-cases', projectId, selectedStatus],
    queryFn: async () => {
      const res = await api.get<any[]>(`/testing/cases?projectId=${projectId}&status=${selectedStatus}`);
      return res.data || [];
    }
  });

  // Fetch Test Runs
  const { data: testRuns = [] } = useQuery({
    queryKey: ['test-runs', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/testing/runs?projectId=${projectId}`);
      return res.data || [];
    }
  });

  // Fetch Quality Reports
  const { data: reports } = useQuery({
    queryKey: ['testing-reports', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/testing/reports?projectId=${projectId}`);
      return res.data;
    }
  });

  // Record Execution Mutation
  const recordExecutionMutation = useMutation({
    mutationFn: async ({ caseId, status }: { caseId: string; status: string }) => {
      const res = await api.patch(`/testing/cases/${caseId}/status`, {
        status,
        notes: `Executed via QA Workbench at ${new Date().toLocaleTimeString()}`
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases', projectId] });
      queryClient.invalidateQueries({ queryKey: ['test-plans', projectId] });
      queryClient.invalidateQueries({ queryKey: ['testing-reports', projectId] });
    }
  });

  // Create Test Case Mutation
  const createCaseMutation = useMutation({
    mutationFn: async () => {
      const targetSuiteId = suiteId || suites[0]?.id;
      const res = await api.post('/testing/cases', {
        projectId,
        testSuiteId: targetSuiteId,
        title,
        testType,
        priority,
        environment,
        preconditions,
        steps,
        expectedResult
      });
      return res.data;
    },
    onSuccess: () => {
      setTitle('');
      setPreconditions('');
      setSteps('');
      setExpectedResult('');
      setIsCreateOpen(false);
      queryClient.invalidateQueries({ queryKey: ['test-cases', projectId] });
      queryClient.invalidateQueries({ queryKey: ['test-plans', projectId] });
      queryClient.invalidateQueries({ queryKey: ['testing-reports', projectId] });
    }
  });

  // Duplicate Test Case
  const duplicateCaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/testing/cases/${id}/duplicate`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['test-cases', projectId] });
      queryClient.invalidateQueries({ queryKey: ['testing-reports', projectId] });
    }
  });

  // Delete Test Case
  const deleteCaseMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/testing/cases/${id}`);
      return res.data;
    },
    onSuccess: () => {
      setSelectedCase(null);
      queryClient.invalidateQueries({ queryKey: ['test-cases', projectId] });
      queryClient.invalidateQueries({ queryKey: ['testing-reports', projectId] });
    }
  });

  // Create Test Run Mutation
  const createTestRunMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/testing/runs', {
        projectId,
        name: runName,
        environment: runEnvironment,
        notes: runNotes
      });
      return res.data;
    },
    onSuccess: () => {
      setIsTestRunModalOpen(false);
      setRunName('');
      setRunNotes('');
      queryClient.invalidateQueries({ queryKey: ['test-runs', projectId] });
      queryClient.invalidateQueries({ queryKey: ['testing-reports', projectId] });
    }
  });

  // Accurate Calculations: Do NOT display 100% when 0 executed!
  const totalCount = testCases.length;
  const passedCount = testCases.filter((c: any) => c.status === 'PASSED').length;
  const failedCount = testCases.filter((c: any) => c.status === 'FAILED').length;
  const blockedCount = testCases.filter((c: any) => c.status === 'BLOCKED').length;
  const skippedCount = testCases.filter((c: any) => c.status === 'SKIPPED').length;
  const notRunCount = testCases.filter((c: any) => c.status === 'NOT_RUN' || !c.status).length;
  const executedCount = totalCount - notRunCount;
  const passRate = executedCount > 0 ? Math.round((passedCount / executedCount) * 1000) / 10 : 0;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PASSED':
        return <Badge variant="success">Passed</Badge>;
      case 'FAILED':
        return <Badge variant="destructive">Failed</Badge>;
      case 'BLOCKED':
        return <Badge variant="warning">Blocked</Badge>;
      case 'SKIPPED':
        return <Badge variant="outline">Skipped</Badge>;
      default:
        return <Badge variant="outline">Not Run</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Total Tests</span>
          <div className="text-xl font-bold text-foreground">{totalCount}</div>
          <span className="text-[10px] text-foreground-muted">{executedCount} executed</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Pass Rate</span>
          <div className="text-xl font-bold text-success">{passRate}%</div>
          <span className="text-[10px] text-foreground-muted">of executed tests</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Passed</span>
          <div className="text-xl font-bold text-success">{passedCount}</div>
          <span className="text-[10px] text-foreground-muted">Green assertions</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Failed</span>
          <div className="text-xl font-bold text-destructive">{failedCount}</div>
          <span className="text-[10px] text-destructive">Blocking releases</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Blocked / Skipped</span>
          <div className="text-xl font-bold text-warning">{blockedCount + skippedCount}</div>
          <span className="text-[10px] text-foreground-muted">Dependency delay</span>
        </Card>

        <Card className="p-3.5 space-y-1 shadow-xs">
          <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">Not Run</span>
          <div className="text-xl font-bold text-foreground-muted">{notRunCount}</div>
          <span className="text-[10px] text-foreground-muted">Awaiting cycle</span>
        </Card>
      </div>

      {/* Navigation Tabs and Header Actions */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1">
          {[
            { id: 'cases', label: 'Test Cases & Suites', icon: FileCheck, count: testCases.length },
            { id: 'runs', label: 'Test Runs', icon: Play, count: testRuns.length },
            { id: 'reports', label: 'Quality Reports', icon: BarChart3 }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background-tertiary text-foreground-muted'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'cases' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Test Case</span>
            </Button>
          )}

          {activeTab === 'runs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setRunName(`Test Execution Run #${testRuns.length + 1} (${new Date().toLocaleDateString()})`);
                setIsTestRunModalOpen(true);
              }}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Play className="h-3.5 w-3.5" />
              <span>Start Test Run</span>
            </Button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: TEST CASES & SUITES */}
      {/* =================================================================== */}
      {activeTab === 'cases' && (
        <div className="space-y-4">
          {/* Status Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
            {EXEC_STATUSES.map((status) => (
              <button
                key={status}
                onClick={() => setSelectedStatus(status)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  selectedStatus === status
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'bg-background-secondary text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
                }`}
              >
                {status.replace(/_/g, ' ')}
              </button>
            ))}
          </div>

          <Card className="overflow-hidden shadow-xs">
            <div className="divide-y divide-border">
              {testCases.map((tc: any) => (
                <div
                  key={tc.id}
                  onClick={() => setSelectedCase(tc)}
                  className="p-4 flex items-center justify-between hover:bg-background-secondary/50 cursor-pointer transition-colors"
                >
                  <div className="flex items-start gap-3 min-w-0">
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <code className="text-xs font-mono font-bold text-primary">{tc.caseIdentifier}</code>
                        <h4 className="text-xs font-semibold text-foreground truncate">{tc.title}</h4>
                        <Badge variant="outline" className="text-[9px] font-mono">
                          {tc.testType}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-foreground-muted font-mono">
                        <span>Priority: {tc.priority}</span>
                        <span>•</span>
                        <span>Suite: {tc.testSuite?.name || 'General Suite'}</span>
                        {tc.bug && (
                          <>
                            <span>•</span>
                            <span className="text-destructive font-semibold flex items-center gap-0.5">
                              <Bug className="h-2.5 w-2.5" /> {tc.bug.bugIdentifier}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0" onClick={(e) => e.stopPropagation()}>
                    {getStatusBadge(tc.status)}

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => recordExecutionMutation.mutate({ caseId: tc.id, status: 'PASSED' })}
                        title="Mark Passed"
                        className="p-1 rounded text-foreground-muted hover:text-success hover:bg-success/10 transition-colors"
                      >
                        <CheckCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => recordExecutionMutation.mutate({ caseId: tc.id, status: 'FAILED' })}
                        title="Mark Failed"
                        className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                      >
                        <XCircle className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => duplicateCaseMutation.mutate(tc.id)}
                        title="Duplicate Test Case"
                        className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: TEST RUNS */}
      {/* =================================================================== */}
      {activeTab === 'runs' && (
        <Card className="overflow-hidden shadow-xs">
          <div className="divide-y divide-border">
            {testRuns.map((run: any) => (
              <div key={run.id} className="p-4 flex items-center justify-between hover:bg-background-secondary/50 transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="h-9 w-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Play className="h-4 w-4" />
                  </div>
                  <div className="space-y-0.5 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-foreground">{run.name}</h4>
                      <Badge variant="outline" className="text-[10px]">
                        {run.environment}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-3 text-[11px] text-foreground-muted font-mono">
                      <span>{run.passedCases}/{run.totalCases} passed ({run.passRate}%)</span>
                      <span>•</span>
                      <span>Started: {new Date(run.startedAt).toLocaleTimeString()}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <Badge variant={run.status === 'COMPLETED' ? 'success' : 'status-progress'} className="text-[10px]">
                    {run.status}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* =================================================================== */}
      {/* TAB 3: QUALITY REPORTS */}
      {/* =================================================================== */}
      {activeTab === 'reports' && reports && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="p-4 space-y-2 shadow-xs">
              <span className="text-xs font-semibold text-foreground">Defect Density Ratio</span>
              <div className="text-2xl font-bold text-primary">{reports.defectDensity}</div>
              <p className="text-[11px] text-foreground-muted">Open bugs per test case across project domain</p>
            </Card>

            <Card className="p-4 space-y-2 shadow-xs">
              <span className="text-xs font-semibold text-foreground">Test Coverage Gate</span>
              <div className="text-2xl font-bold text-success">{reports.coverageRate}%</div>
              <p className="text-[11px] text-foreground-muted">Percentage of total test catalog executed</p>
            </Card>

            <Card className="p-4 space-y-2 shadow-xs">
              <span className="text-xs font-semibold text-foreground">Active Regression Runs</span>
              <div className="text-2xl font-bold text-foreground">{reports.recentTestRuns?.length || 0}</div>
              <p className="text-[11px] text-foreground-muted">Recorded automated test run executions</p>
            </Card>
          </div>

          {/* Test Type Distribution */}
          <Card className="p-5 space-y-3 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-foreground-muted">
              Test Coverage Distribution by Test Type
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Object.entries(reports.typeDistribution || {}).map(([type, count]: [string, any]) => (
                <div key={type} className="p-3 rounded-lg bg-background-secondary border border-border text-xs flex justify-between items-center">
                  <span className="font-mono text-foreground-secondary">{type}</span>
                  <span className="font-bold text-foreground">{count}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {/* Create Test Case Dialog */}
      {isCreateOpen && (
        <Dialog
          isOpen={isCreateOpen}
          onClose={() => setIsCreateOpen(false)}
          title="Create New Test Case"
          description="Add a structured test specification with steps and expected results."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createCaseMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Test Case Title *"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Verify multi-region ledger replication latency"
              required
            />
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-secondary">Test Type</label>
                <select
                  value={testType}
                  onChange={(e) => setTestType(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
                >
                  {TEST_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-medium text-foreground-secondary">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
                >
                  <option value="CRITICAL">Critical</option>
                  <option value="HIGH">High</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <Textarea
              label="Preconditions"
              value={preconditions}
              onChange={(e) => setPreconditions(e.target.value)}
              placeholder="e.g. Staging cluster running version 1.2.0"
              rows={2}
            />

            <Textarea
              label="Test Steps *"
              value={steps}
              onChange={(e) => setSteps(e.target.value)}
              placeholder="1. Dispatch POST /api/v1/payments\n2. Verify response 200 OK"
              rows={3}
              required
            />

            <Textarea
              label="Expected Result *"
              value={expectedResult}
              onChange={(e) => setExpectedResult(e.target.value)}
              placeholder="Response body contains status: COMPLETED within 200ms"
              rows={2}
              required
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createCaseMutation.isPending}>
                Save Test Case
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Start Test Run Dialog */}
      {isTestRunModalOpen && (
        <Dialog
          isOpen={isTestRunModalOpen}
          onClose={() => setIsTestRunModalOpen(false)}
          title="Start QA Test Run"
          description="Execute test catalog against staging or release environments."
          maxWidth="sm"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTestRunMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Run Name *"
              value={runName}
              onChange={(e) => setRunName(e.target.value)}
              required
            />
            <Input
              label="Environment *"
              value={runEnvironment}
              onChange={(e) => setRunEnvironment(e.target.value)}
              required
            />
            <Textarea
              label="Execution Notes"
              value={runNotes}
              onChange={(e) => setRunNotes(e.target.value)}
              placeholder="Scope of execution"
              rows={2}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsTestRunModalOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createTestRunMutation.isPending}>
                Complete Run
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Detail Drawer / Modal for Selected Test Case */}
      {selectedCase && (
        <Dialog
          isOpen={!!selectedCase}
          onClose={() => setSelectedCase(null)}
          title={`[${selectedCase.caseIdentifier}] ${selectedCase.title}`}
          description={`Test Type: ${selectedCase.testType} • Priority: ${selectedCase.priority}`}
          maxWidth="lg"
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-foreground-muted">Current Execution Status:</span>
              {getStatusBadge(selectedCase.status)}
            </div>

            {selectedCase.preconditions && (
              <div className="p-3 rounded-lg bg-background-secondary text-xs space-y-1">
                <span className="font-semibold text-foreground">Preconditions:</span>
                <p className="text-foreground-secondary">{selectedCase.preconditions}</p>
              </div>
            )}

            <div className="p-3 rounded-lg bg-background-secondary text-xs space-y-1">
              <span className="font-semibold text-foreground">Execution Steps:</span>
              <pre className="text-foreground-secondary whitespace-pre-wrap font-mono text-[11px] leading-relaxed">
                {selectedCase.steps}
              </pre>
            </div>

            <div className="p-3 rounded-lg bg-background-secondary text-xs space-y-1">
              <span className="font-semibold text-foreground">Expected Result:</span>
              <p className="text-foreground-secondary">{selectedCase.expectedResult}</p>
            </div>

            {/* Quick Status Buttons */}
            <div className="pt-2 border-t border-border flex items-center justify-between">
              <button
                onClick={() => deleteCaseMutation.mutate(selectedCase.id)}
                className="text-xs text-destructive hover:underline flex items-center gap-1"
              >
                <Trash2 className="h-3.5 w-3.5" />
                <span>Delete Case</span>
              </button>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    recordExecutionMutation.mutate({ caseId: selectedCase.id, status: 'BLOCKED' });
                    setSelectedCase(null);
                  }}
                  className="text-xs text-warning"
                >
                  Mark Blocked
                </Button>
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => {
                    recordExecutionMutation.mutate({ caseId: selectedCase.id, status: 'FAILED' });
                    setSelectedCase(null);
                  }}
                  className="text-xs"
                >
                  Mark Failed
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => {
                    recordExecutionMutation.mutate({ caseId: selectedCase.id, status: 'PASSED' });
                    setSelectedCase(null);
                  }}
                  className="text-xs"
                >
                  Mark Passed
                </Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </div>
  );
}
