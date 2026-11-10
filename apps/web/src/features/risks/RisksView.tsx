'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import {
  AlertTriangle,
  Plus,
  ShieldAlert,
  CheckCircle2,
  Sliders,
  Flame,
  ArrowRight,
  Shield,
  Download,
  Search,
  Filter,
  Clock,
  User,
  Trash2,
  Edit2,
  Check,
  X,
  AlertCircle,
  TrendingUp,
  FolderKanban,
  Layers,
  Link2,
  GitBranch,
  Calendar,
  Eye,
  RotateCcw
} from 'lucide-react';

interface RisksViewProps {
  projectId?: string;
}

const CATEGORIES = [
  'ALL',
  'Technical Architecture',
  'Security & Compliance',
  'Infrastructure & Cloud',
  'Schedule & Deadlines',
  'Integration & API',
  'Resource & Personnel',
  'Operational'
];

export function RisksView({ projectId }: RisksViewProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useAuthStore();
  const workspaceId = currentWorkspace?.id;

  // Active Tab: matrix | register | mitigations | dependencies
  const [activeTab, setActiveTab] = useState<'matrix' | 'register' | 'mitigations' | 'dependencies'>('matrix');

  // Matrix Filter Selection
  const [selectedCell, setSelectedCell] = useState<{ prob: string; imp: string } | null>(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [selectedSeverity, setSelectedSeverity] = useState('ALL');
  const [selectedStatus, setSelectedStatus] = useState('ALL');

  // Dialog States
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);

  // New Risk Form
  const [riskTitle, setRiskTitle] = useState('');
  const [riskCategory, setRiskCategory] = useState('Technical Architecture');
  const [riskProbability, setRiskProbability] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [riskImpact, setRiskImpact] = useState<'LOW' | 'MEDIUM' | 'HIGH'>('HIGH');
  const [riskDescription, setRiskDescription] = useState('');
  const [riskMitigation, setRiskMitigation] = useState('');
  const [riskContingency, setRiskContingency] = useState('');
  const [riskTargetDate, setRiskTargetDate] = useState('');

  // Mitigation Action Form
  const [isAddMitigationOpen, setIsAddMitigationOpen] = useState(false);
  const [mitigationDesc, setMitigationDesc] = useState('');
  const [mitigationDueDate, setMitigationDueDate] = useState('');

  // Dependency Form
  const [isAddDependencyOpen, setIsAddDependencyOpen] = useState(false);
  const [depTitle, setDepTitle] = useState('');
  const [depDesc, setDepDesc] = useState('');
  const [depType, setDepType] = useState('TECHNICAL');
  const [depPriority, setDepPriority] = useState('HIGH');
  const [depDueDate, setDepDueDate] = useState('');
  const [depError, setDepError] = useState<string | null>(null);

  // 1. Fetch Risk Matrix & Summary Stats
  const { data: matrixData, isLoading: isMatrixLoading, refetch: refetchMatrix } = useQuery({
    queryKey: ['risks-matrix', workspaceId, projectId],
    queryFn: async () => {
      if (!workspaceId) return null;
      const projectParam = projectId && projectId !== 'ALL' ? `&projectId=${projectId}` : '';
      const res = await api.get<any>(`/risks/matrix?workspaceId=${workspaceId}${projectParam}`);
      return res.data;
    },
    enabled: !!workspaceId
  });

  // 2. Fetch Risks List
  const { data: risks = [], isLoading: isRisksLoading, refetch: refetchRisks } = useQuery({
    queryKey: [
      'risks-list',
      workspaceId,
      projectId,
      selectedCategory,
      selectedSeverity,
      selectedStatus,
      searchQuery,
      selectedCell
    ],
    queryFn: async () => {
      if (!workspaceId) return [];
      const params = new URLSearchParams({ workspaceId });
      if (projectId && projectId !== 'ALL') params.append('projectId', projectId);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (selectedSeverity !== 'ALL') params.append('severity', selectedSeverity);
      if (selectedStatus !== 'ALL') params.append('status', selectedStatus);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());
      if (selectedCell) {
        params.append('probability', selectedCell.prob);
        params.append('impact', selectedCell.imp);
      }

      const res = await api.get<any[]>(`/risks?${params.toString()}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // 3. Fetch Dependencies
  const { data: dependencies = [], isLoading: isDepsLoading, refetch: refetchDeps } = useQuery({
    queryKey: ['project-dependencies', workspaceId, projectId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const projectParam = projectId && projectId !== 'ALL' ? `&projectId=${projectId}` : '';
      const res = await api.get<any[]>(`/risks/dependencies?workspaceId=${workspaceId}${projectParam}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // Mutations
  const registerRiskMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/risks', {
        workspaceId,
        projectId: projectId && projectId !== 'ALL' ? projectId : undefined,
        title: riskTitle.trim(),
        description: riskDescription.trim(),
        category: riskCategory,
        probability: riskProbability,
        impact: riskImpact,
        mitigationPlan: riskMitigation.trim() || undefined,
        contingencyPlan: riskContingency.trim() || undefined,
        targetDate: riskTargetDate || undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setRiskTitle('');
      setRiskDescription('');
      setRiskMitigation('');
      setRiskContingency('');
      setRiskTargetDate('');
      setIsRegisterOpen(false);
      refetchRisks();
      refetchMatrix();
    }
  });

  const updateRiskStatusMutation = useMutation({
    mutationFn: async ({ riskId, status }: { riskId: string; status: string }) => {
      const res = await api.patch<any>(`/risks/${riskId}`, { status });
      return res.data;
    },
    onSuccess: (updated: any) => {
      if (selectedRisk && selectedRisk.id === updated?.id) {
        setSelectedRisk(updated);
      }
      refetchRisks();
      refetchMatrix();
    }
  });

  const deleteRiskMutation = useMutation({
    mutationFn: async (riskId: string) => {
      const res = await api.delete(`/risks/${riskId}`);
      return res.data;
    },
    onSuccess: () => {
      setIsDetailOpen(false);
      setSelectedRisk(null);
      refetchRisks();
      refetchMatrix();
    }
  });

  const addMitigationMutation = useMutation({
    mutationFn: async () => {
      if (!selectedRisk) return;
      const res = await api.post(`/risks/${selectedRisk.id}/mitigations`, {
        description: mitigationDesc.trim(),
        dueDate: mitigationDueDate || undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setMitigationDesc('');
      setMitigationDueDate('');
      setIsAddMitigationOpen(false);
      refetchRisks();
      if (selectedRisk) {
        api.get<any>(`/risks/${selectedRisk.id}`).then((res) => {
          if (res.data) setSelectedRisk(res.data);
        });
      }
    }
  });

  const updateMitigationProgressMutation = useMutation({
    mutationFn: async ({ mitigationId, progress }: { mitigationId: string; progress: number }) => {
      const res = await api.patch(`/risks/mitigations/${mitigationId}`, {
        progress,
        status: progress === 100 ? 'COMPLETED' : 'IN_PROGRESS'
      });
      return res.data;
    },
    onSuccess: () => {
      refetchRisks();
      if (selectedRisk) {
        api.get<any>(`/risks/${selectedRisk.id}`).then((res) => {
          if (res.data) setSelectedRisk(res.data);
        });
      }
    }
  });

  const createDependencyMutation = useMutation({
    mutationFn: async () => {
      setDepError(null);
      const res = await api.post('/risks/dependencies', {
        workspaceId,
        projectId: projectId && projectId !== 'ALL' ? projectId : undefined,
        title: depTitle.trim(),
        description: depDesc.trim() || undefined,
        dependencyType: depType,
        priority: depPriority,
        dueDate: depDueDate || undefined
      });
      return res.data;
    },
    onSuccess: () => {
      setDepTitle('');
      setDepDesc('');
      setDepDueDate('');
      setIsAddDependencyOpen(false);
      refetchDeps();
    },
    onError: (err: any) => {
      setDepError(err.message || 'Failed to create dependency');
    }
  });

  const updateDependencyStatusMutation = useMutation({
    mutationFn: async ({ depId, status }: { depId: string; status: string }) => {
      const res = await api.put(`/risks/dependencies/${depId}`, { status });
      return res.data;
    },
    onSuccess: () => refetchDeps()
  });

  // Export handlers
  const handleExportRisks = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('devblueprint_token') : '';
    const projectParam = projectId && projectId !== 'ALL' ? `&projectId=${projectId}` : '';
    const url = `http://localhost:4000/api/v1/risks/export/csv?workspaceId=${workspaceId}${projectParam}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  const handleExportDependencies = () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') || localStorage.getItem('devblueprint_token') : '';
    const projectParam = projectId && projectId !== 'ALL' ? `&projectId=${projectId}` : '';
    const url = `http://localhost:4000/api/v1/risks/dependencies/export/csv?workspaceId=${workspaceId}${projectParam}${token ? `&token=${encodeURIComponent(token)}` : ''}`;
    window.open(url, '_blank');
  };

  // 3x3 Matrix Grid helper
  const matrixCells = matrixData?.matrix || [];
  const getCell = (prob: string, imp: string) => {
    return matrixCells.find((c: any) => c.probability === prob && c.impact === imp) || {
      probability: prob,
      impact: imp,
      score: 1,
      classification: 'LOW',
      count: 0,
      risks: []
    };
  };

  const getCellBg = (score: number) => {
    if (score >= 9) return 'bg-rose-500/15 border-rose-500/30 text-rose-600 dark:text-rose-400 hover:bg-rose-500/25';
    if (score >= 6) return 'bg-amber-500/15 border-amber-500/30 text-amber-600 dark:text-amber-400 hover:bg-amber-500/25';
    if (score >= 3) return 'bg-blue-500/15 border-blue-500/30 text-blue-600 dark:text-blue-400 hover:bg-blue-500/25';
    return 'bg-emerald-500/15 border-emerald-500/30 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/25';
  };

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <ShieldAlert className="h-5 w-5 text-primary" />
            <span>Enterprise Risk & Dependency Management</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            3×3 probability vs impact heatmap, severity scoring, mitigation workflows, and cross-project dependencies.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={activeTab === 'dependencies' ? handleExportDependencies : handleExportRisks}
            className="text-xs gap-1.5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

          {activeTab === 'dependencies' ? (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddDependencyOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Link2 className="h-3.5 w-3.5" />
              <span>Track Dependency</span>
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsRegisterOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Register Risk</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Risk Management Dashboard Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Total Risks
              </p>
              <h3 className="text-2xl font-bold text-foreground mt-1 font-mono">
                {matrixData?.totalRisks ?? risks.length}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {matrixData?.openRisks ?? 0} active • {matrixData?.mitigatedRisks ?? 0} closed
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shadow-xs">
              <Shield className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Critical Severity
              </p>
              <h3 className="text-2xl font-bold text-rose-500 mt-1 font-mono">
                {matrixData?.criticalRisks ?? 0}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Score 9 (High Prob × High Impact)
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-500 shadow-xs">
              <Flame className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Overdue Actions
              </p>
              <h3 className="text-2xl font-bold text-amber-500 mt-1 font-mono">
                {matrixData?.overdueRisks ?? 0}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                Past resolution target date
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-500 shadow-xs">
              <Clock className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>

        <Card className="border-border bg-card shadow-xs">
          <CardContent className="p-4 flex items-center justify-between">
            <div>
              <p className="text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                Dependencies
              </p>
              <h3 className="text-2xl font-bold text-indigo-500 mt-1 font-mono">
                {dependencies.length}
              </h3>
              <p className="text-[10px] text-foreground-muted mt-0.5">
                {dependencies.filter((d: any) => d.status === 'BLOCKED').length} blocked links
              </p>
            </div>
            <div className="h-10 w-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-500 shadow-xs">
              <Link2 className="h-5 w-5" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 3. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('matrix');
              setSelectedCell(null);
            }}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'matrix'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <Sliders className="h-4 w-4" />
            <span>3×3 Risk Heatmap</span>
          </button>

          <button
            onClick={() => setActiveTab('register')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'register'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            <span>Risk Register ({risks.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('dependencies')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'dependencies'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <Link2 className="h-4 w-4" />
            <span>Dependencies ({dependencies.length})</span>
          </button>
        </div>

        {/* Search & Category Filter */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative w-48 sm:w-60">
            <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
            <Input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search risks or dependencies..."
              className="pl-8 h-8 text-xs"
            />
          </div>

          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
          >
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. TAB 1: 3x3 Probability vs Impact Matrix */}
      {activeTab === 'matrix' && (
        <div className="space-y-6">
          <Card className="border-border bg-card shadow-xs">
            <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-sm font-semibold text-foreground">
                  3×3 Probability vs Impact Matrix
                </CardTitle>
                <p className="text-[11px] text-foreground-muted mt-0.5">
                  Click any cell to filter matching risks. Risk Score = Probability (1-3) × Impact (1-3).
                </p>
              </div>

              {selectedCell && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedCell(null)}
                  className="text-xs h-7 gap-1 text-primary"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reset Cell Filter ({selectedCell.prob} Prob / {selectedCell.imp} Imp)</span>
                </Button>
              )}
            </CardHeader>

            <CardContent className="p-6">
              <div className="max-w-2xl mx-auto space-y-4">
                {/* Impact Header Axis */}
                <div className="grid grid-cols-4 gap-3 text-center text-xs font-bold text-foreground">
                  <div className="flex items-center justify-center text-foreground-muted font-normal text-[11px]">
                    Probability ↓ / Impact →
                  </div>
                  <div className="p-1 rounded bg-background-secondary border border-border text-[11px]">
                    Low Impact (1)
                  </div>
                  <div className="p-1 rounded bg-background-secondary border border-border text-[11px]">
                    Medium Impact (2)
                  </div>
                  <div className="p-1 rounded bg-background-secondary border border-border text-[11px]">
                    High Impact (3)
                  </div>
                </div>

                {/* Rows: High, Medium, Low */}
                {(['HIGH', 'MEDIUM', 'LOW'] as const).map((prob) => (
                  <div key={prob} className="grid grid-cols-4 gap-3">
                    {/* Y-axis Label */}
                    <div className="flex items-center justify-end pr-3 text-xs font-bold text-foreground">
                      <span>{prob === 'HIGH' ? 'High Prob (3)' : prob === 'MEDIUM' ? 'Medium Prob (2)' : 'Low Prob (1)'}</span>
                    </div>

                    {/* Columns: Low, Med, High */}
                    {(['LOW', 'MEDIUM', 'HIGH'] as const).map((imp) => {
                      const cell = getCell(prob, imp);
                      const isSelected = selectedCell?.prob === prob && selectedCell?.imp === imp;

                      return (
                        <div
                          key={imp}
                          onClick={() => setSelectedCell(isSelected ? null : { prob, imp })}
                          className={`p-4 rounded-xl border transition-all cursor-pointer text-center space-y-1 ${getCellBg(
                            cell.score
                          )} ${isSelected ? 'ring-2 ring-primary ring-offset-2 scale-105 shadow-md' : 'shadow-xs'}`}
                        >
                          <div className="flex items-center justify-between text-[10px] font-mono font-bold uppercase opacity-80">
                            <span>Score: {cell.score}</span>
                            <span>{cell.classification}</span>
                          </div>
                          <div className="text-2xl font-bold font-mono py-1">
                            {cell.count}
                          </div>
                          <p className="text-[10px] opacity-75 truncate">
                            {cell.count === 1 ? '1 registered risk' : `${cell.count} risks`}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                ))}

                {/* Severity Classification Legend */}
                <div className="flex items-center justify-center gap-4 pt-4 border-t border-border text-xs flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-emerald-500" />
                    <span className="text-foreground-muted">Low (1-2)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-blue-500" />
                    <span className="text-foreground-muted">Medium (3-4)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-amber-500" />
                    <span className="text-foreground-muted">High (6)</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="h-3 w-3 rounded-full bg-rose-500" />
                    <span className="text-foreground-muted font-bold">Critical (9)</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtered Risks below Matrix */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                <Shield className="h-4 w-4 text-primary" />
                <span>
                  {selectedCell
                    ? `Risks with ${selectedCell.prob} Probability & ${selectedCell.imp} Impact (${risks.length})`
                    : `Active Risk Register (${risks.length})`}
                </span>
              </h3>
            </div>

            {isRisksLoading ? (
              <div className="p-8 text-center text-xs text-foreground-muted bg-card rounded-xl border border-border">
                <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                <span>Loading risk records...</span>
              </div>
            ) : risks.length === 0 ? (
              <div className="p-12 text-center bg-card rounded-xl border border-dashed border-border text-xs text-foreground-muted">
                No matching risks found for this filter combination.
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {risks.map((r: any) => (
                  <Card
                    key={r.id}
                    className="border-border bg-card hover:border-primary/50 transition-colors shadow-xs"
                  >
                    <CardContent className="p-4 space-y-2.5">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <Badge
                            variant={
                              r.score >= 9
                                ? 'destructive'
                                : r.score >= 6
                                ? 'warning'
                                : r.score >= 3
                                ? 'info'
                                : 'success'
                            }
                            className="text-[10px] font-mono"
                          >
                            Score {r.score} • {r.severity}
                          </Badge>
                          <Badge variant="outline" className="text-[10px]">
                            {r.status}
                          </Badge>
                          <span className="text-[10px] text-foreground-muted">
                            {r.project?.name || 'Workspace'}
                          </span>
                        </div>

                        <span className="text-[10px] text-foreground-muted font-mono">
                          {r.probability}P × {r.impact}I
                        </span>
                      </div>

                      <div
                        onClick={() => {
                          setSelectedRisk(r);
                          setIsDetailOpen(true);
                        }}
                        className="cursor-pointer group"
                      >
                        <h4 className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                          {r.title}
                        </h4>
                        <p className="text-[11px] text-foreground-muted mt-1 line-clamp-2 leading-relaxed">
                          {r.description}
                        </p>
                      </div>

                      <div className="flex items-center justify-between text-[10px] text-foreground-muted pt-2 border-t border-border">
                        <span>Owner: {r.owner?.name || 'Unassigned'}</span>
                        <div className="flex items-center gap-2">
                          <span>{r._count?.mitigations || 0} mitigations</span>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setSelectedRisk(r);
                              setIsDetailOpen(true);
                            }}
                            className="text-xs h-6 p-1 text-primary"
                          >
                            <Eye className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. TAB 2: Risk Register Table */}
      {activeTab === 'register' && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-foreground">
              Risk Register ({risks.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {isRisksLoading ? (
              <div className="p-8 text-center text-xs text-foreground-muted">
                <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                <span>Loading risk register...</span>
              </div>
            ) : risks.length === 0 ? (
              <div className="p-12 text-center text-xs text-foreground-muted">
                No risks registered yet. Click &quot;Register Risk&quot; to add one.
              </div>
            ) : (
              risks.map((r: any) => (
                <div
                  key={r.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-background-secondary/40 transition-colors text-xs"
                >
                  <div className="space-y-1 flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        onClick={() => {
                          setSelectedRisk(r);
                          setIsDetailOpen(true);
                        }}
                        className="font-bold text-foreground cursor-pointer hover:text-primary transition-colors truncate"
                      >
                        {r.title}
                      </span>
                      <Badge
                        variant={
                          r.score >= 9
                            ? 'destructive'
                            : r.score >= 6
                            ? 'warning'
                            : r.score >= 3
                            ? 'info'
                            : 'success'
                        }
                        className="text-[10px] font-mono"
                      >
                        Score {r.score}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {r.status}
                      </Badge>
                    </div>

                    <p className="text-[11px] text-foreground-muted line-clamp-1">{r.description}</p>
                    <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
                      <span>Project: {r.project?.name || 'Workspace'}</span>
                      <span>•</span>
                      <span>Category: {r.category}</span>
                      <span>•</span>
                      <span>Target: {r.targetDate ? new Date(r.targetDate).toLocaleDateString() : 'None'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center">
                    <select
                      value={r.status}
                      onChange={(e) => updateRiskStatusMutation.mutate({ riskId: r.id, status: e.target.value })}
                      className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground font-medium"
                    >
                      <option value="IDENTIFIED">Identified</option>
                      <option value="MITIGATING">Mitigating</option>
                      <option value="ACCEPTED">Accepted</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CLOSED">Closed</option>
                    </select>

                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedRisk(r);
                        setIsDetailOpen(true);
                      }}
                      className="h-8 text-xs gap-1"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Details</span>
                    </Button>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* 6. TAB 3: Dependencies Tracker */}
      {activeTab === 'dependencies' && (
        <Card className="border-border bg-card shadow-xs">
          <CardHeader className="p-4 pb-2 border-b border-border flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-sm font-semibold text-foreground">
                Cross-Project & System Dependencies ({dependencies.length})
              </CardTitle>
              <p className="text-[11px] text-foreground-muted mt-0.5">
                Track inter-service blockers, external deliverables, and task prerequisites.
              </p>
            </div>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddDependencyOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Dependency</span>
            </Button>
          </CardHeader>
          <CardContent className="p-0 divide-y divide-border">
            {isDepsLoading ? (
              <div className="p-8 text-center text-xs text-foreground-muted">
                <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
                <span>Loading project dependencies...</span>
              </div>
            ) : dependencies.length === 0 ? (
              <div className="p-12 text-center text-xs text-foreground-muted">
                No active dependencies recorded. Click &quot;New Dependency&quot; to link projects or tasks.
              </div>
            ) : (
              dependencies.map((dep: any) => (
                <div
                  key={dep.id}
                  className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-background-secondary/40 transition-colors text-xs"
                >
                  <div className="space-y-1 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-foreground">{dep.title}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">
                        {dep.dependencyType}
                      </Badge>
                      <Badge
                        variant={
                          dep.status === 'BLOCKED'
                            ? 'destructive'
                            : dep.status === 'RESOLVED'
                            ? 'success'
                            : 'warning'
                        }
                        className="text-[10px]"
                      >
                        {dep.status}
                      </Badge>
                    </div>

                    {dep.description && (
                      <p className="text-[11px] text-foreground-muted">{dep.description}</p>
                    )}

                    <div className="flex items-center gap-3 text-[10px] text-foreground-muted">
                      <span>Source: {dep.sourceProject?.name || 'Workspace'}</span>
                      {dep.targetProject && (
                        <>
                          <span>→</span>
                          <span>Target: {dep.targetProject.name}</span>
                        </>
                      )}
                      <span>•</span>
                      <span>Due: {dep.dueDate ? new Date(dep.dueDate).toLocaleDateString() : 'Open'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <select
                      value={dep.status}
                      onChange={(e) =>
                        updateDependencyStatusMutation.mutate({ depId: dep.id, status: e.target.value })
                      }
                      className="h-8 px-2 rounded-lg border border-border bg-background text-xs text-foreground font-medium"
                    >
                      <option value="IDENTIFIED">Identified</option>
                      <option value="PENDING">Pending</option>
                      <option value="IN_PROGRESS">In Progress</option>
                      <option value="BLOCKED">Blocked</option>
                      <option value="RESOLVED">Resolved</option>
                      <option value="CANCELLED">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      )}

      {/* DIALOG 1: Register New Risk */}
      <Dialog
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        title="Register Project Risk"
        description="Assess probability, impact, severity scoring, and mitigation contingency."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Risk Title
            </label>
            <Input
              value={riskTitle}
              onChange={(e) => setRiskTitle(e.target.value)}
              placeholder="e.g. AWS CloudWatch Metrics Ingestion Throttling"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Category
              </label>
              <select
                value={riskCategory}
                onChange={(e) => setRiskCategory(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
              >
                {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Probability
              </label>
              <select
                value={riskProbability}
                onChange={(e) => setRiskProbability(e.target.value as any)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
              >
                <option value="LOW">Low (1)</option>
                <option value="MEDIUM">Medium (2)</option>
                <option value="HIGH">High (3)</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Impact
              </label>
              <select
                value={riskImpact}
                onChange={(e) => setRiskImpact(e.target.value as any)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
              >
                <option value="LOW">Low (1)</option>
                <option value="MEDIUM">Medium (2)</option>
                <option value="HIGH">High (3)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Description & Context
            </label>
            <Textarea
              value={riskDescription}
              onChange={(e) => setRiskDescription(e.target.value)}
              placeholder="Describe what triggers this risk, potential bottlenecks, and fallout..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Mitigation Strategy
              </label>
              <Textarea
                value={riskMitigation}
                onChange={(e) => setRiskMitigation(e.target.value)}
                placeholder="Proactive steps to reduce probability or impact..."
                rows={2}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Contingency Plan
              </label>
              <Textarea
                value={riskContingency}
                onChange={(e) => setRiskContingency(e.target.value)}
                placeholder="Fallback recovery action if risk occurs..."
                rows={2}
                className="text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Target Resolution Date
            </label>
            <Input
              type="date"
              value={riskTargetDate}
              onChange={(e) => setRiskTargetDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsRegisterOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => registerRiskMutation.mutate()}
              disabled={!riskTitle.trim()}
              className="text-xs shadow-xs"
            >
              Register Risk
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 2: Risk Details Drawer */}
      <Dialog
        isOpen={isDetailOpen}
        onClose={() => setIsDetailOpen(false)}
        title={selectedRisk ? `${selectedRisk.title}` : 'Risk Details'}
        description={`Category: ${selectedRisk?.category} • Score: ${selectedRisk?.score} (${selectedRisk?.severity})`}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div className="p-3 bg-background-secondary rounded-lg border border-border text-xs space-y-1">
            <span className="font-semibold text-foreground block uppercase text-[10px] tracking-wider">
              Description
            </span>
            <p className="text-foreground-muted leading-relaxed">{selectedRisk?.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1">
              <span className="font-semibold text-primary block uppercase text-[10px] tracking-wider">
                Mitigation Strategy
              </span>
              <p className="text-foreground leading-relaxed">{selectedRisk?.mitigationPlan || 'None specified'}</p>
            </div>

            <div className="p-3 bg-amber-500/5 rounded-lg border border-amber-500/20 space-y-1">
              <span className="font-semibold text-amber-600 block uppercase text-[10px] tracking-wider">
                Contingency Plan
              </span>
              <p className="text-foreground leading-relaxed">{selectedRisk?.contingencyPlan || 'None specified'}</p>
            </div>
          </div>

          {/* Mitigation Actions Section */}
          <div className="space-y-2 pt-2 border-t border-border">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-primary" />
                <span>Mitigation Actions ({selectedRisk?.mitigations?.length || 0})</span>
              </h4>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsAddMitigationOpen(true)}
                className="text-xs h-7 gap-1"
              >
                <Plus className="h-3 w-3" />
                <span>Add Action</span>
              </Button>
            </div>

            <div className="space-y-2">
              {selectedRisk?.mitigations?.length === 0 ? (
                <p className="text-xs text-foreground-muted italic py-2">
                  No active mitigation actions recorded for this risk.
                </p>
              ) : (
                selectedRisk?.mitigations?.map((m: any) => (
                  <div
                    key={m.id}
                    className="p-3 bg-card rounded-lg border border-border text-xs space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-foreground">{m.description}</span>
                      <Badge
                        variant={m.status === 'COMPLETED' ? 'success' : 'outline'}
                        className="text-[10px]"
                      >
                        {m.progress}% • {m.status}
                      </Badge>
                    </div>

                    <div className="flex items-center gap-3">
                      <Progress value={m.progress} className="h-1.5 flex-1" />
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            updateMitigationProgressMutation.mutate({
                              mitigationId: m.id,
                              progress: Math.min(100, m.progress + 25)
                            })
                          }
                          className="h-6 text-[10px] px-1.5"
                        >
                          +25%
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            updateMitigationProgressMutation.mutate({
                              mitigationId: m.id,
                              progress: 100
                            })
                          }
                          className="h-6 text-[10px] px-1.5 text-emerald-600"
                        >
                          Complete
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-border">
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteRiskMutation.mutate(selectedRisk.id)}
              className="text-xs gap-1"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>Delete Risk</span>
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsDetailOpen(false)}
              className="text-xs"
            >
              Close
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 3: Add Mitigation Action */}
      <Dialog
        isOpen={isAddMitigationOpen}
        onClose={() => setIsAddMitigationOpen(false)}
        title="Add Mitigation Action"
        description={`Record specific proactive action for ${selectedRisk?.title}`}
        maxWidth="sm"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Action Description
            </label>
            <Input
              value={mitigationDesc}
              onChange={(e) => setMitigationDesc(e.target.value)}
              placeholder="e.g. Implement circuit breaker on payment API"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Due Date
            </label>
            <Input
              type="date"
              value={mitigationDueDate}
              onChange={(e) => setMitigationDueDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddMitigationOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => addMitigationMutation.mutate()}
              disabled={!mitigationDesc.trim()}
              className="text-xs"
            >
              Add Action
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 4: Add Dependency */}
      <Dialog
        isOpen={isAddDependencyOpen}
        onClose={() => setIsAddDependencyOpen(false)}
        title="Track Cross-Project Dependency"
        description="Prevent bottlenecks by establishing dependency requirements."
        maxWidth="md"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Dependency Title
            </label>
            <Input
              value={depTitle}
              onChange={(e) => setDepTitle(e.target.value)}
              placeholder="e.g. Identity Service OAuth token introspection endpoint"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Dependency Type
              </label>
              <select
                value={depType}
                onChange={(e) => setDepType(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
              >
                <option value="TECHNICAL">Technical Dependency</option>
                <option value="PROJECT_TO_PROJECT">Project to Project</option>
                <option value="TASK_TO_TASK">Task to Task</option>
                <option value="EXTERNAL">External Third-Party</option>
                <option value="INFRASTRUCTURE">Infrastructure</option>
                <option value="RELEASE">Release Blocker</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Priority
              </label>
              <select
                value={depPriority}
                onChange={(e) => setDepPriority(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="CRITICAL">Critical</option>
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Description & Prerequisites
            </label>
            <Textarea
              value={depDesc}
              onChange={(e) => setDepDesc(e.target.value)}
              placeholder="Details on contract agreement, payload expectations, or timeline..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Target Due Date
            </label>
            <Input
              type="date"
              value={depDueDate}
              onChange={(e) => setDepDueDate(e.target.value)}
              className="h-8 text-xs"
            />
          </div>

          {depError && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive text-xs rounded-lg flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 shrink-0" />
              <span>{depError}</span>
            </div>
          )}

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsAddDependencyOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createDependencyMutation.mutate()}
              disabled={!depTitle.trim()}
              className="text-xs"
            >
              Create Dependency
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
