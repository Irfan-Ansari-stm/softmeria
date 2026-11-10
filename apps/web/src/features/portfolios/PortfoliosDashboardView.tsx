'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Progress } from '../../components/ui/progress';
import {
  Briefcase,
  Plus,
  Search,
  Filter,
  ArrowRight,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Clock,
  DollarSign,
  TrendingUp,
  Users,
  Target,
  MoreVertical,
  Copy,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  ShieldAlert,
  Flag,
  Calendar,
  Layers,
  ChevronRight,
  X
} from 'lucide-react';

export function PortfoliosDashboardView() {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useAuthStore();

  const [search, setSearch] = useState('');
  const [healthFilter, setHealthFilter] = useState('ALL');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  // Modals state
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string | null>(null);
  const [detailTab, setDetailTab] = useState<'overview' | 'projects' | 'objectives' | 'milestones' | 'risks' | 'team'>('overview');

  // Form state
  const [editingPortfolioId, setEditingPortfolioId] = useState<string | null>(null);
  const [formName, setFormName] = useState('');
  const [formDesc, setFormDesc] = useState('');
  const [formCategory, setFormCategory] = useState('Strategic Initiatives');
  const [formBudget, setFormBudget] = useState(1000000);
  const [formHealth, setFormHealth] = useState('ON_TRACK');
  const [formColor, setFormColor] = useState('#4f46e5');
  const [formStartDate, setFormStartDate] = useState('');
  const [formTargetDate, setFormTargetDate] = useState('');
  const [formSelectedProjectIds, setFormSelectedProjectIds] = useState<string[]>([]);

  // Objective quick add state
  const [newObjTitle, setNewObjTitle] = useState('');
  const [newObjDesc, setNewObjDesc] = useState('');

  // Project quick link state
  const [projectToLink, setProjectToLink] = useState('');

  // 1. Fetch Portfolios
  const { data: rawPortfolios = [], isLoading } = useQuery({
    queryKey: ['portfolios', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/portfolios?workspaceId=${currentWorkspace.id}`);
      return Array.isArray(res.data) ? res.data : [];
    },
    enabled: !!currentWorkspace?.id
  });

  const portfolios = Array.isArray(rawPortfolios) ? rawPortfolios : [];

  // 2. Fetch Workspace Projects
  const { data: rawProjects = [] } = useQuery({
    queryKey: ['workspace-projects-selector', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any>(`/projects?workspaceId=${currentWorkspace.id}`);
      return Array.isArray(res.data) ? res.data : Array.isArray(res.data?.projects) ? res.data.projects : [];
    },
    enabled: !!currentWorkspace?.id
  });

  const allProjects = Array.isArray(rawProjects) ? rawProjects : [];

  // 3. Fetch Selected Portfolio Details
  const { data: selectedPortfolio, refetch: refetchDetail } = useQuery({
    queryKey: ['portfolio-detail', selectedPortfolioId],
    queryFn: async () => {
      if (!selectedPortfolioId) return null;
      const res = await api.get<any>(`/portfolios/${selectedPortfolioId}`);
      return res.data;
    },
    enabled: !!selectedPortfolioId
  });

  // KPI Calculations
  const totalProjectsAcrossPortfolios = useMemo(() => {
    return portfolios.reduce((acc: number, p: any) => acc + (p.projectCount || 0), 0);
  }, [portfolios]);

  const totalBudgetAcrossPortfolios = useMemo(() => {
    return portfolios.reduce((acc: number, p: any) => acc + (p.totalBudget || 0), 0);
  }, [portfolios]);

  const totalProjectsBudget = useMemo(() => {
    return portfolios.reduce((acc: number, p: any) => acc + (p.projectsBudget || 0), 0);
  }, [portfolios]);

  const overallAvgCompletion = useMemo(() => {
    if (portfolios.length === 0) return 0;
    const total = portfolios.reduce((acc: number, p: any) => acc + (p.completionPercentage || 0), 0);
    return Math.round(total / portfolios.length);
  }, [portfolios]);

  // Mutations
  const createOrUpdateMutation = useMutation({
    mutationFn: async () => {
      const payload: any = {
        workspaceId: currentWorkspace!.id,
        name: formName,
        description: formDesc,
        category: formCategory,
        budget: Number(formBudget),
        health: formHealth,
        color: formColor,
        startDate: formStartDate ? new Date(formStartDate).toISOString() : null,
        targetDate: formTargetDate ? new Date(formTargetDate).toISOString() : null,
        projectIds: formSelectedProjectIds
      };

      if (editingPortfolioId) {
        const res = await api.put(`/portfolios/${editingPortfolioId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/portfolios', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      setIsCreateOpen(false);
      setEditingPortfolioId(null);
      resetForm();
    }
  });

  const deletePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/portfolios/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      if (selectedPortfolioId) setSelectedPortfolioId(null);
    }
  });

  const duplicatePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/portfolios/${id}/duplicate`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    }
  });

  const archivePortfolioMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/portfolios/${id}/archive`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    }
  });

  const addProjectMutation = useMutation({
    mutationFn: async ({ portfolioId, projectId }: { portfolioId: string; projectId: string }) => {
      const res = await api.post(`/portfolios/${portfolioId}/projects`, { projectId });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-detail', selectedPortfolioId] });
      setProjectToLink('');
    }
  });

  const removeProjectMutation = useMutation({
    mutationFn: async ({ portfolioId, projectId }: { portfolioId: string; projectId: string }) => {
      const res = await api.delete(`/portfolios/${portfolioId}/projects/${projectId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
      queryClient.invalidateQueries({ queryKey: ['portfolio-detail', selectedPortfolioId] });
    }
  });

  const addObjectiveMutation = useMutation({
    mutationFn: async ({ portfolioId, title, description }: { portfolioId: string; title: string; description: string }) => {
      const res = await api.post(`/portfolios/${portfolioId}/objectives`, { title, description });
      return res.data;
    },
    onSuccess: () => {
      setNewObjTitle('');
      setNewObjDesc('');
      queryClient.invalidateQueries({ queryKey: ['portfolio-detail', selectedPortfolioId] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    }
  });

  const toggleObjectiveMutation = useMutation({
    mutationFn: async ({ objectiveId, isCompleted }: { objectiveId: string; isCompleted: boolean }) => {
      const res = await api.put(`/portfolios/objectives/${objectiveId}`, {
        status: isCompleted ? 'IN_PROGRESS' : 'COMPLETED',
        progress: isCompleted ? 50 : 100
      });
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-detail', selectedPortfolioId] });
      queryClient.invalidateQueries({ queryKey: ['portfolios'] });
    }
  });

  const deleteObjectiveMutation = useMutation({
    mutationFn: async (objectiveId: string) => {
      const res = await api.delete(`/portfolios/objectives/${objectiveId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['portfolio-detail', selectedPortfolioId] });
    }
  });

  const resetForm = () => {
    setFormName('');
    setFormDesc('');
    setFormCategory('Strategic Initiatives');
    setFormBudget(1000000);
    setFormHealth('ON_TRACK');
    setFormColor('#4f46e5');
    setFormStartDate('');
    setFormTargetDate('');
    setFormSelectedProjectIds([]);
  };

  const openEditModal = (p: any, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingPortfolioId(p.id);
    setFormName(p.name);
    setFormDesc(p.description || '');
    setFormCategory(p.category || 'Strategic Initiatives');
    setFormBudget(p.budget || 0);
    setFormHealth(p.health || 'ON_TRACK');
    setFormColor(p.color || '#4f46e5');
    setFormStartDate(p.startDate ? new Date(p.startDate).toISOString().split('T')[0] : '');
    setFormTargetDate(p.targetDate ? new Date(p.targetDate).toISOString().split('T')[0] : '');
    setFormSelectedProjectIds((p.projects || []).map((pr: any) => pr.id));
    setIsCreateOpen(true);
  };

  const filteredPortfolios = useMemo(() => {
    return portfolios.filter((p: any) => {
      if (healthFilter !== 'ALL' && p.health !== healthFilter) return false;
      if (categoryFilter !== 'ALL' && p.category !== categoryFilter) return false;
      if (search.trim()) {
        const query = search.toLowerCase();
        const matchName = p.name?.toLowerCase().includes(query);
        const matchDesc = p.description?.toLowerCase().includes(query);
        if (!matchName && !matchDesc) return false;
      }
      return true;
    });
  }, [portfolios, healthFilter, categoryFilter, search]);

  const categories = useMemo(() => {
    const set = new Set<string>();
    portfolios.forEach((p: any) => {
      if (p.category) set.add(p.category);
    });
    return Array.from(set);
  }, [portfolios]);

  const getHealthBadge = (h: string) => {
    switch (h) {
      case 'ON_TRACK':
        return <Badge variant="success">On Track</Badge>;
      case 'AT_RISK':
        return <Badge variant="warning">At Risk</Badge>;
      case 'DELAYED':
        return <Badge variant="danger">Delayed</Badge>;
      case 'COMPLETED':
        return <Badge variant="secondary">Completed</Badge>;
      default:
        return <Badge variant="outline">{h}</Badge>;
    }
  };

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Briefcase className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Strategic Portfolios</h1>
            <p className="text-xs text-foreground-muted">
              Executive initiative management aggregating multi-project budgets, health, OKRs, and risk horizons
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => {
            resetForm();
            setEditingPortfolioId(null);
            setIsCreateOpen(true);
          }}
          className="text-xs gap-1.5 shadow-sm"
        >
          <Plus className="h-3.5 w-3.5" />
          <span>New Portfolio</span>
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Total Portfolios</span>
            <Briefcase className="h-4 w-4 text-primary" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground font-mono">{portfolios.length}</span>
            <span className="text-xs text-foreground-secondary">{totalProjectsAcrossPortfolios} projects linked</span>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Total Budget</span>
            <DollarSign className="h-4 w-4 text-success" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground font-mono">
              ${(totalBudgetAcrossPortfolios / 1000).toLocaleString()}k
            </span>
            <span className="text-xs text-foreground-secondary font-mono">
              ${(totalProjectsBudget / 1000).toLocaleString()}k allocated
            </span>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Avg Delivery Progress</span>
            <TrendingUp className="h-4 w-4 text-info" />
          </div>
          <div className="flex items-baseline justify-between">
            <span className="text-2xl font-bold text-foreground font-mono">{overallAvgCompletion}%</span>
            <span className="text-xs text-foreground-muted">Across all portfolios</span>
          </div>
        </Card>

        <Card className="p-4 space-y-2">
          <div className="flex items-center justify-between text-xs text-foreground-muted">
            <span className="font-medium">Portfolio Health</span>
            <Target className="h-4 w-4 text-warning" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-success font-mono">
              <span className="h-2 w-2 rounded-full bg-success inline-block" />
              {portfolios.filter((p: any) => p.health === 'ON_TRACK').length} Healthy
            </span>
            <span className="text-foreground-muted text-xs">•</span>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-warning font-mono">
              <span className="h-2 w-2 rounded-full bg-warning inline-block" />
              {portfolios.filter((p: any) => p.health === 'AT_RISK' || p.health === 'DELAYED').length} At Risk
            </span>
          </div>
        </Card>
      </div>

      {/* Filter & Search Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-card p-3 rounded-xl border border-border">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[220px]">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-foreground-muted" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search portfolios by name or objective..."
              className="pl-9 h-9 text-xs"
            />
          </div>

          <select
            value={healthFilter}
            onChange={(e) => setHealthFilter(e.target.value)}
            className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
          >
            <option value="ALL">All Health Statuses</option>
            <option value="ON_TRACK">On Track</option>
            <option value="AT_RISK">At Risk</option>
            <option value="DELAYED">Delayed</option>
            <option value="COMPLETED">Completed</option>
          </select>

          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground focus:outline-none focus:ring-1 focus:ring-primary"
            >
              <option value="ALL">All Categories</option>
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          )}
        </div>

        <span className="text-xs text-foreground-muted font-medium px-2">
          {filteredPortfolios.length} of {portfolios.length} portfolios
        </span>
      </div>

      {/* Portfolio Grid */}
      {isLoading ? (
        <div className="py-24 text-center text-foreground-muted">
          <div className="h-6 w-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs">Loading enterprise portfolios...</p>
        </div>
      ) : filteredPortfolios.length === 0 ? (
        <div className="py-16 text-center border border-dashed border-border rounded-xl bg-card">
          <Briefcase className="h-8 w-8 text-foreground-muted mx-auto mb-2 opacity-50" />
          <h3 className="text-sm font-semibold text-foreground">No portfolios found</h3>
          <p className="text-xs text-foreground-muted mt-1 max-w-sm mx-auto">
            Create your first strategic portfolio to group multi-project delivery horizons and executive budgets.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPortfolios.map((portfolio: any) => (
            <Card
              key={portfolio.id}
              onClick={() => setSelectedPortfolioId(portfolio.id)}
              className="p-5 space-y-4 hover:border-primary/50 transition-all shadow-xs cursor-pointer hover:shadow-md flex flex-col justify-between group"
            >
              <div className="space-y-3">
                {/* Header: Icon, Category & Actions */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div
                      className="h-9 w-9 rounded-xl flex items-center justify-center text-white text-xs font-bold shadow-xs shrink-0"
                      style={{ backgroundColor: portfolio.color || '#4f46e5' }}
                    >
                      <Briefcase className="h-4 w-4" />
                    </div>
                    <div>
                      <span className="text-[10px] font-semibold text-primary uppercase tracking-wider block">
                        {portfolio.category || 'Strategic Initiative'}
                      </span>
                      <h3 className="text-sm font-bold text-foreground group-hover:text-primary transition-colors leading-tight">
                        {portfolio.name}
                      </h3>
                    </div>
                  </div>

                  <div className="flex items-center gap-1">
                    {getHealthBadge(portfolio.health)}
                  </div>
                </div>

                <p className="text-xs text-foreground-secondary leading-relaxed line-clamp-2">
                  {portfolio.description || 'Enterprise strategic portfolio with cross-functional project resource alignment.'}
                </p>

                {/* Delivery Progress Bar */}
                <div className="space-y-1.5 pt-1">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-foreground-muted font-medium">Delivery Completion</span>
                    <span className="font-mono font-bold text-foreground">{portfolio.completionPercentage || 0}%</span>
                  </div>
                  <Progress value={portfolio.completionPercentage || 0} size="sm" className="h-1.5" />
                </div>

                {/* Budget & Projects Row */}
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-border/60 text-xs">
                  <div>
                    <span className="text-[10px] text-foreground-muted block">Budget</span>
                    <span className="font-mono font-semibold text-foreground">
                      ${(portfolio.totalBudget / 1000).toLocaleString()}k
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-foreground-muted block">Projects</span>
                    <span className="font-mono font-semibold text-foreground">
                      {portfolio.projectCount || 0} active
                    </span>
                  </div>
                </div>
              </div>

              {/* Card Footer: Quick Actions */}
              <div className="pt-3 border-t border-border flex items-center justify-between text-xs">
                <span className="text-primary font-medium inline-flex items-center gap-1 group-hover:underline">
                  <span>View Details</span>
                  <ArrowRight className="h-3 w-3" />
                </span>

                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  <button
                    onClick={(e) => openEditModal(portfolio, e)}
                    className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors"
                    title="Edit portfolio"
                  >
                    <Edit className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => duplicatePortfolioMutation.mutate(portfolio.id)}
                    className="p-1 rounded text-foreground-muted hover:text-foreground hover:bg-secondary transition-colors"
                    title="Duplicate portfolio"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => deletePortfolioMutation.mutate(portfolio.id)}
                    className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10 transition-colors"
                    title="Delete portfolio"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create / Edit Portfolio Modal */}
      <Dialog
        isOpen={isCreateOpen}
        onClose={() => {
          setIsCreateOpen(false);
          setEditingPortfolioId(null);
        }}
        title={editingPortfolioId ? 'Edit Strategic Portfolio' : 'Create New Portfolio'}
        size="lg"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Portfolio Name *</label>
            <Input
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="e.g. Core Banking & Cloud Architecture"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <Textarea
              value={formDesc}
              onChange={(e) => setFormDesc(e.target.value)}
              placeholder="Strategic mandate, governance goals, or executive sponsorship..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Category</label>
              <select
                value={formCategory}
                onChange={(e) => setFormCategory(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="Strategic Initiatives">Strategic Initiatives</option>
                <option value="Digital Transformation">Digital Transformation</option>
                <option value="Operational Excellence">Operational Excellence</option>
                <option value="Infrastructure & Platform">Infrastructure & Platform</option>
                <option value="Compliance & Security">Compliance & Security</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Overall Health</label>
              <select
                value={formHealth}
                onChange={(e) => setFormHealth(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="ON_TRACK">On Track</option>
                <option value="AT_RISK">At Risk</option>
                <option value="DELAYED">Delayed</option>
                <option value="COMPLETED">Completed</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Budget ($)</label>
              <Input
                type="number"
                value={formBudget}
                onChange={(e) => setFormBudget(Number(e.target.value) || 0)}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Target Delivery Date</label>
              <Input
                type="date"
                value={formTargetDate}
                onChange={(e) => setFormTargetDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          {/* Project Associations */}
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Associate Projects ({formSelectedProjectIds.length} selected)
            </label>
            <div className="max-h-36 overflow-y-auto border border-border rounded-lg p-2 space-y-1.5 bg-background">
              {allProjects.map((p: any) => {
                const isSelected = formSelectedProjectIds.includes(p.id);
                return (
                  <div
                    key={p.id}
                    onClick={() => {
                      if (isSelected) {
                        setFormSelectedProjectIds(formSelectedProjectIds.filter((id) => id !== p.id));
                      } else {
                        setFormSelectedProjectIds([...formSelectedProjectIds, p.id]);
                      }
                    }}
                    className={`flex items-center justify-between p-1.5 rounded cursor-pointer text-xs transition-colors ${
                      isSelected ? 'bg-primary/10 text-primary font-medium' : 'hover:bg-secondary text-foreground'
                    }`}
                  >
                    <span className="truncate">{p.name}</span>
                    <input
                      type="checkbox"
                      checked={isSelected}
                      readOnly
                      className="rounded border-border text-primary cursor-pointer"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setIsCreateOpen(false);
                setEditingPortfolioId(null);
              }}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!formName.trim() || createOrUpdateMutation.isPending}
              isLoading={createOrUpdateMutation.isPending}
              onClick={() => createOrUpdateMutation.mutate()}
            >
              {editingPortfolioId ? 'Save Changes' : 'Create Portfolio'}
            </Button>
          </div>
        </div>
      </Dialog>

      {/* Portfolio Detail Slide-over / Modal */}
      {selectedPortfolio && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 overflow-y-auto">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setSelectedPortfolioId(null)}
          />

          <div className="relative w-full max-w-5xl bg-card border border-border rounded-2xl shadow-2xl z-10 my-auto flex flex-col max-h-[92vh] overflow-hidden animate-in fade-in zoom-in-95">
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-background-secondary/60">
              <div className="flex items-center gap-3">
                <div
                  className="h-10 w-10 rounded-xl flex items-center justify-center text-white text-sm font-bold shadow-xs shrink-0"
                  style={{ backgroundColor: selectedPortfolio.color || '#4f46e5' }}
                >
                  <Briefcase className="h-5 w-5" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-base font-bold text-foreground">{selectedPortfolio.name}</h2>
                    {getHealthBadge(selectedPortfolio.health)}
                  </div>
                  <span className="text-xs text-foreground-muted">{selectedPortfolio.category}</span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => openEditModal(selectedPortfolio)}
                  className="text-xs gap-1"
                >
                  <Edit className="h-3 w-3" />
                  <span>Edit</span>
                </Button>
                <button
                  onClick={() => setSelectedPortfolioId(null)}
                  className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-border px-6 bg-background text-xs">
              {[
                { id: 'overview', label: 'Overview' },
                { id: 'projects', label: `Projects (${(selectedPortfolio.projects || []).length})` },
                { id: 'objectives', label: `Objectives (${(selectedPortfolio.objectives || []).length})` },
                { id: 'milestones', label: `Milestones (${(selectedPortfolio.milestones || []).length})` },
                { id: 'risks', label: `Risks (${(selectedPortfolio.risks || []).length})` },
                { id: 'team', label: `Team Allocation (${(selectedPortfolio.teamMembers || []).length})` }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setDetailTab(tab.id as any)}
                  className={`py-3 px-4 font-medium border-b-2 transition-colors ${
                    detailTab === tab.id
                      ? 'border-primary text-primary font-semibold'
                      : 'border-transparent text-foreground-muted hover:text-foreground'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Content Body */}
            <div className="p-6 overflow-y-auto flex-1">
              {/* 1. OVERVIEW TAB */}
              {detailTab === 'overview' && (
                <div className="space-y-6">
                  {/* Summary Metric Cards */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <div className="p-3.5 rounded-xl border border-border bg-background-secondary/40 space-y-1">
                      <span className="text-[11px] text-foreground-muted block">Budget Utilization</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {selectedPortfolio.budgetUtilization || 0}%
                      </span>
                      <span className="text-[10px] text-foreground-muted block font-mono">
                        ${(selectedPortfolio.projectsBudget / 1000).toLocaleString()}k of ${(selectedPortfolio.totalBudget / 1000).toLocaleString()}k
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-background-secondary/40 space-y-1">
                      <span className="text-[11px] text-foreground-muted block">Delivery Progress</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {selectedPortfolio.completionPercentage || 0}%
                      </span>
                      <span className="text-[10px] text-foreground-muted block font-mono">
                        {selectedPortfolio.completedTasks || 0} of {selectedPortfolio.totalTasks || 0} tasks done
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-background-secondary/40 space-y-1">
                      <span className="text-[11px] text-foreground-muted block">Active Projects</span>
                      <span className="text-xl font-bold font-mono text-foreground">
                        {(selectedPortfolio.projects || []).length}
                      </span>
                      <span className="text-[10px] text-foreground-muted block">
                        {(selectedPortfolio.teamMembers || []).length} engineers deployed
                      </span>
                    </div>

                    <div className="p-3.5 rounded-xl border border-border bg-background-secondary/40 space-y-1">
                      <span className="text-[11px] text-foreground-muted block">Identified Risks</span>
                      <span className="text-xl font-bold font-mono text-warning">
                        {(selectedPortfolio.risks || []).length}
                      </span>
                      <span className="text-[10px] text-foreground-muted block">Across all linked projects</span>
                    </div>
                  </div>

                  {/* Description & Strategic Mandate */}
                  <div className="p-4 rounded-xl border border-border bg-card space-y-2">
                    <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                      Strategic Mandate
                    </h4>
                    <p className="text-xs text-foreground-secondary leading-relaxed">
                      {selectedPortfolio.description || 'Enterprise strategic portfolio alignment.'}
                    </p>
                  </div>

                  {/* Top Objectives Preview */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-semibold text-foreground uppercase tracking-wider">
                        Key Strategic Objectives
                      </h4>
                      <button
                        onClick={() => setDetailTab('objectives')}
                        className="text-xs text-primary hover:underline font-medium"
                      >
                        Manage Objectives →
                      </button>
                    </div>

                    <div className="space-y-2">
                      {(selectedPortfolio.objectives || []).map((obj: any) => (
                        <div
                          key={obj.id}
                          className="p-3 rounded-lg border border-border bg-card flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-2.5 flex-1 min-w-0">
                            <Target className="h-4 w-4 text-primary shrink-0" />
                            <div className="truncate">
                              <span className="font-semibold text-foreground block truncate">{obj.title}</span>
                              {obj.description && (
                                <span className="text-foreground-muted text-[11px] truncate block">{obj.description}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 font-mono text-[11px]">
                            <span className="font-bold text-foreground">{obj.progress}%</span>
                            <Badge variant={obj.status === 'COMPLETED' ? 'success' : 'outline'}>
                              {obj.status}
                            </Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 2. LINKED PROJECTS TAB */}
              {detailTab === 'projects' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl border border-border bg-background-secondary/30">
                    <div className="flex items-center gap-2 flex-1">
                      <FolderKanban className="h-4 w-4 text-primary" />
                      <select
                        value={projectToLink}
                        onChange={(e) => setProjectToLink(e.target.value)}
                        className="h-8 px-2.5 rounded-lg border border-border bg-card text-xs font-medium text-foreground flex-1 max-w-sm"
                      >
                        <option value="">Select project to link...</option>
                        {allProjects
                          .filter((p: any) => !(selectedPortfolio.projects || []).some((sp: any) => sp.id === p.id))
                          .map((p: any) => (
                            <option key={p.id} value={p.id}>
                              {p.name}
                            </option>
                          ))}
                      </select>
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!projectToLink || addProjectMutation.isPending}
                        onClick={() =>
                          addProjectMutation.mutate({
                            portfolioId: selectedPortfolio.id,
                            projectId: projectToLink
                          })
                        }
                        className="text-xs h-8 px-3"
                      >
                        Link Project
                      </Button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {(selectedPortfolio.projects || []).map((pr: any) => (
                      <Card key={pr.id} className="p-4 space-y-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="text-xs font-bold text-foreground">{pr.name}</h4>
                            <span className="text-[10px] text-foreground-muted">{pr.projectType || 'Software Project'}</span>
                          </div>
                          <button
                            onClick={() =>
                              removeProjectMutation.mutate({
                                portfolioId: selectedPortfolio.id,
                                projectId: pr.id
                              })
                            }
                            className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10"
                            title="Unlink from portfolio"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        </div>

                        <div className="space-y-1">
                          <div className="flex justify-between text-[11px] font-mono">
                            <span className="text-foreground-muted">Progress</span>
                            <span className="font-semibold text-foreground">{pr.progress || 0}%</span>
                          </div>
                          <Progress value={pr.progress || 0} size="sm" className="h-1.5" />
                        </div>

                        <div className="flex items-center justify-between pt-2 border-t border-border/60 text-[11px]">
                          <span className="font-mono text-foreground-secondary">
                            ${(pr.budget ? pr.budget / 1000 : 0).toLocaleString()}k budget
                          </span>
                          <Link href={`/projects/${pr.id}`}>
                            <span className="text-primary font-medium hover:underline inline-flex items-center gap-1">
                              <span>Open Project</span>
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </Link>
                        </div>
                      </Card>
                    ))}
                  </div>
                </div>
              )}

              {/* 3. STRATEGIC OBJECTIVES TAB */}
              {detailTab === 'objectives' && (
                <div className="space-y-4">
                  {/* Quick Add Objective */}
                  <div className="p-3.5 rounded-xl border border-border bg-background-secondary/30 space-y-2">
                    <span className="text-xs font-semibold text-foreground block">Add Strategic Objective</span>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      <Input
                        value={newObjTitle}
                        onChange={(e) => setNewObjTitle(e.target.value)}
                        placeholder="Objective title (e.g. Attain SOC2 Certification)..."
                        className="text-xs h-8 sm:col-span-2"
                      />
                      <Button
                        size="sm"
                        variant="primary"
                        disabled={!newObjTitle.trim() || addObjectiveMutation.isPending}
                        onClick={() =>
                          addObjectiveMutation.mutate({
                            portfolioId: selectedPortfolio.id,
                            title: newObjTitle.trim(),
                            description: newObjDesc.trim()
                          })
                        }
                        className="text-xs h-8"
                      >
                        Add Objective
                      </Button>
                    </div>
                  </div>

                  {/* Objective List */}
                  <div className="space-y-2">
                    {(selectedPortfolio.objectives || []).map((obj: any) => {
                      const isDone = obj.status === 'COMPLETED';
                      return (
                        <div
                          key={obj.id}
                          className="p-3.5 rounded-xl border border-border bg-card flex items-center justify-between gap-3 text-xs"
                        >
                          <div className="flex items-center gap-3 flex-1 min-w-0">
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() =>
                                toggleObjectiveMutation.mutate({
                                  objectiveId: obj.id,
                                  isCompleted: isDone
                                })
                              }
                              className="h-4 w-4 rounded border-border text-primary cursor-pointer"
                            />
                            <div className="truncate">
                              <span
                                className={`font-semibold text-xs block truncate ${
                                  isDone ? 'line-through text-foreground-muted' : 'text-foreground'
                                }`}
                              >
                                {obj.title}
                              </span>
                              {obj.description && (
                                <span className="text-[11px] text-foreground-muted truncate block">{obj.description}</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 shrink-0">
                            <Badge variant={isDone ? 'success' : 'outline'}>{obj.status}</Badge>
                            <button
                              onClick={() => deleteObjectiveMutation.mutate(obj.id)}
                              className="p-1 rounded text-foreground-muted hover:text-destructive hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* 4. MILESTONES TAB */}
              {detailTab === 'milestones' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Aggregated Delivery Milestones ({(selectedPortfolio.milestones || []).length})
                  </span>
                  <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                    {(selectedPortfolio.milestones || []).map((m: any) => (
                      <div key={m.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <Flag className="h-4 w-4 text-primary shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground block">{m.name}</span>
                            <span className="text-[10px] text-foreground-muted font-mono">{m.projectName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-mono text-foreground-muted">
                            {m.targetDate ? new Date(m.targetDate).toLocaleDateString() : 'No date'}
                          </span>
                          <Badge variant={m.status === 'COMPLETED' ? 'success' : 'outline'}>
                            {m.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. RISKS TAB */}
              {detailTab === 'risks' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Portfolio Risk Register ({(selectedPortfolio.risks || []).length})
                  </span>
                  <div className="divide-y divide-border border border-border rounded-xl bg-card overflow-hidden">
                    {(selectedPortfolio.risks || []).map((r: any) => (
                      <div key={r.id} className="p-3 flex items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2.5">
                          <ShieldAlert className="h-4 w-4 text-warning shrink-0" />
                          <div>
                            <span className="font-semibold text-foreground block">{r.title}</span>
                            <span className="text-[10px] text-foreground-muted font-mono">{r.projectName}</span>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] uppercase font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded">
                            {r.severity}
                          </span>
                          <Badge variant="outline">{r.status}</Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 6. TEAM ALLOCATION TAB */}
              {detailTab === 'team' && (
                <div className="space-y-3">
                  <span className="text-xs font-semibold text-foreground uppercase tracking-wider block">
                    Allocated Engineering Talent ({(selectedPortfolio.teamMembers || []).length})
                  </span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {(selectedPortfolio.teamMembers || []).map((m: any) => (
                      <div
                        key={m.id}
                        className="p-3 rounded-lg border border-border bg-card flex items-center gap-3 text-xs"
                      >
                        <div className="h-8 w-8 rounded-full bg-primary/10 text-primary font-bold flex items-center justify-center shrink-0">
                          {m.name?.[0] || 'U'}
                        </div>
                        <div className="truncate">
                          <span className="font-semibold text-foreground block truncate">{m.name}</span>
                          <span className="text-[10px] text-foreground-muted block truncate">{m.email}</span>
                          <span className="text-[9px] font-mono text-primary block mt-0.5">
                            {(m.projects || []).join(', ')}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
