'use client';

import React, { useState, useMemo } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardContent } from '../../components/ui/card';
import { Progress } from '../../components/ui/progress';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import {
  Milestone as MilestoneIcon,
  Plus,
  Calendar,
  CheckCircle2,
  Clock,
  ArrowRight,
  Flag,
  Target,
  Layers,
  ChevronRight,
  SlidersHorizontal,
  AlignLeft,
  CalendarDays,
  LayoutGrid,
  BarChart2,
  Trash2,
  Edit,
  ExternalLink,
  ChevronLeft
} from 'lucide-react';

interface RoadmapViewProps {
  projectId: string;
}

type ViewMode = 'timeline' | 'quarterly' | 'monthly' | 'list';

export function RoadmapView({ projectId }: RoadmapViewProps) {
  const queryClient = useQueryClient();

  const [viewMode, setViewMode] = useState<ViewMode>('timeline');
  const [isItemModalOpen, setIsItemModalOpen] = useState(false);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);

  // Form State for Roadmap Item
  const [itemTitle, setItemTitle] = useState('');
  const [itemDesc, setItemDesc] = useState('');
  const [itemStartDate, setItemStartDate] = useState('');
  const [itemEndDate, setItemEndDate] = useState('');
  const [itemProgress, setItemProgress] = useState(0);
  const [itemColor, setItemColor] = useState('#3b82f6');
  const [itemStatus, setItemStatus] = useState('PLANNED');
  const [itemPriority, setItemPriority] = useState('MEDIUM');
  const [itemMilestoneId, setItemMilestoneId] = useState('');

  // 1. Fetch Project Details
  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/projects/${projectId}`);
      return res.data;
    }
  });

  // 2. Fetch Roadmap & Items
  const { data: roadmap, isLoading, refetch } = useQuery({
    queryKey: ['roadmap', projectId],
    queryFn: async () => {
      const res = await api.get<any>(`/roadmaps?projectId=${projectId}`);
      return res.data;
    }
  });

  // 3. Fetch Project Milestones for Linking
  const { data: rawMilestones = [] } = useQuery({
    queryKey: ['milestones', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/milestones?projectId=${projectId}`);
      return Array.isArray(res.data) ? res.data : [];
    }
  });

  const milestones = Array.isArray(rawMilestones) ? rawMilestones : [];
  const items = Array.isArray(roadmap?.items) ? roadmap.items : [];

  // Mutations
  const createOrUpdateItemMutation = useMutation({
    mutationFn: async () => {
      if (!roadmap?.id) return;
      const payload: any = {
        roadmapId: roadmap.id,
        title: itemTitle,
        description: itemDesc,
        startDate: new Date(itemStartDate).toISOString(),
        endDate: new Date(itemEndDate).toISOString(),
        progress: Number(itemProgress) || 0,
        color: itemColor,
        status: itemStatus,
        priority: itemPriority,
        milestoneId: itemMilestoneId || null
      };

      if (editingItemId) {
        const res = await api.put(`/roadmaps/items/${editingItemId}`, payload);
        return res.data;
      } else {
        const res = await api.post('/roadmaps/items', payload);
        return res.data;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', projectId] });
      queryClient.invalidateQueries({ queryKey: ['milestones', projectId] });
      setIsItemModalOpen(false);
      resetForm();
    }
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (itemId: string) => {
      const res = await api.delete(`/roadmaps/items/${itemId}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['roadmap', projectId] });
    }
  });

  const resetForm = () => {
    setEditingItemId(null);
    setItemTitle('');
    setItemDesc('');
    setItemStartDate('');
    setItemEndDate('');
    setItemProgress(0);
    setItemColor('#3b82f6');
    setItemStatus('PLANNED');
    setItemPriority('MEDIUM');
    setItemMilestoneId('');
  };

  const openEditModal = (item: any) => {
    setEditingItemId(item.id);
    setItemTitle(item.title);
    setItemDesc(item.description || '');
    setItemStartDate(item.startDate ? new Date(item.startDate).toISOString().split('T')[0] : '');
    setItemEndDate(item.endDate ? new Date(item.endDate).toISOString().split('T')[0] : '');
    setItemProgress(item.progress || 0);
    setItemColor(item.color || '#3b82f6');
    setItemStatus(item.status || 'PLANNED');
    setItemPriority(item.priority || 'MEDIUM');
    setItemMilestoneId(item.milestoneId || '');
    setIsItemModalOpen(true);
  };

  // Grouping for Quarterly View
  const quarterlyItems = useMemo(() => {
    const quarters: Record<string, any[]> = {
      'Q1 2026': [],
      'Q2 2026': [],
      'Q3 2026': [],
      'Q4 2026': []
    };

    items.forEach((item: any) => {
      const month = new Date(item.startDate).getMonth(); // 0-11
      if (month <= 2) quarters['Q1 2026'].push(item);
      else if (month <= 5) quarters['Q2 2026'].push(item);
      else if (month <= 8) quarters['Q3 2026'].push(item);
      else quarters['Q4 2026'].push(item);
    });

    return quarters;
  }, [items]);

  // Grouping for Monthly View
  const monthlyItems = useMemo(() => {
    const months: Record<string, any[]> = {};
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    monthNames.forEach((m) => (months[m] = []));

    items.forEach((item: any) => {
      const d = new Date(item.startDate);
      const mName = monthNames[d.getMonth()];
      if (months[mName]) months[mName].push(item);
    });

    return months;
  }, [items]);

  // Timeline year bounds (2026)
  const timelineStart = new Date('2026-01-01').getTime();
  const timelineEnd = new Date('2026-12-31').getTime();
  const totalTimelineDuration = timelineEnd - timelineStart;

  const getStatusBadge = (s: string) => {
    switch (s) {
      case 'COMPLETED':
        return <Badge variant="success">Completed</Badge>;
      case 'IN_PROGRESS':
        return <Badge variant="status-progress">In Progress</Badge>;
      case 'BLOCKED':
        return <Badge variant="danger">Blocked</Badge>;
      default:
        return <Badge variant="outline">Planned</Badge>;
    }
  };

  const getPriorityBadge = (p: string) => {
    switch (p) {
      case 'URGENT':
        return <span className="text-[10px] font-bold text-destructive bg-destructive/10 px-1.5 py-0.5 rounded">Urgent</span>;
      case 'HIGH':
        return <span className="text-[10px] font-semibold text-warning bg-warning/10 px-1.5 py-0.5 rounded">High</span>;
      case 'MEDIUM':
        return <span className="text-[10px] text-foreground-secondary bg-secondary px-1.5 py-0.5 rounded">Medium</span>;
      default:
        return <span className="text-[10px] text-foreground-muted bg-secondary/50 px-1.5 py-0.5 rounded">Low</span>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-sm">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" />
            <span>{roadmap?.name || 'Strategic Product Roadmap 2026'}</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-0.5">
            Cross-functional timeline horizons, milestone gates, and quarterly commitments for {project?.name}
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View Mode Switcher */}
          <div className="flex items-center rounded-lg border border-border bg-background p-1 text-xs">
            <button
              onClick={() => setViewMode('timeline')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'timeline' ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <BarChart2 className="h-3.5 w-3.5 rotate-90" />
              <span>Timeline</span>
            </button>
            <button
              onClick={() => setViewMode('quarterly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'quarterly' ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              <span>Quarterly</span>
            </button>
            <button
              onClick={() => setViewMode('monthly')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'monthly' ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <CalendarDays className="h-3.5 w-3.5" />
              <span>Monthly</span>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors flex items-center gap-1.5 ${
                viewMode === 'list' ? 'bg-primary text-white shadow-xs' : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              <AlignLeft className="h-3.5 w-3.5" />
              <span>List</span>
            </button>
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              resetForm();
              setItemStartDate('2026-04-01');
              setItemEndDate('2026-06-30');
              setIsItemModalOpen(true);
            }}
            className="text-xs gap-1.5 shadow-sm whitespace-nowrap"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Add Item</span>
          </Button>
        </div>
      </div>

      {/* 1. TIMELINE (GANTT) VIEW */}
      {viewMode === 'timeline' && (
        <Card className="p-5 overflow-hidden">
          <div className="overflow-x-auto min-w-[760px]">
            {/* Timeline Header (Months & Quarters) */}
            <div className="grid grid-cols-12 border-b border-border pb-2 text-[11px] font-semibold text-foreground-muted text-center uppercase tracking-wider">
              {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, idx) => (
                <div key={m} className={`py-1 ${idx % 3 === 0 ? 'border-l border-border/60' : ''}`}>
                  <span>{m}</span>
                  {idx % 3 === 0 && (
                    <span className="block text-[9px] font-mono text-primary font-bold">
                      Q{Math.floor(idx / 3) + 1}
                    </span>
                  )}
                </div>
              ))}
            </div>

            {/* Timeline Items */}
            <div className="py-6 space-y-4 relative min-h-[300px]">
              {/* Background Quarter Stripes */}
              <div className="absolute inset-0 grid grid-cols-4 pointer-events-none opacity-20">
                <div className="border-r border-border bg-foreground/5" />
                <div className="border-r border-border" />
                <div className="border-r border-border bg-foreground/5" />
                <div className="" />
              </div>

              {items.map((item: any) => {
                const s = Math.max(timelineStart, new Date(item.startDate).getTime());
                const e = Math.min(timelineEnd, new Date(item.endDate).getTime());
                const leftPercent = Math.max(0, Math.min(100, ((s - timelineStart) / totalTimelineDuration) * 100));
                const widthPercent = Math.max(8, Math.min(100 - leftPercent, ((e - s) / totalTimelineDuration) * 100));

                return (
                  <div key={item.id} className="relative h-12 flex items-center group">
                    <div
                      onClick={() => openEditModal(item)}
                      style={{
                        left: `${leftPercent}%`,
                        width: `${widthPercent}%`,
                        backgroundColor: `${item.color || '#3b82f6'}20`,
                        borderColor: item.color || '#3b82f6'
                      }}
                      className="absolute h-10 rounded-lg border-2 p-2 shadow-xs cursor-pointer hover:shadow-md transition-all flex items-center justify-between gap-2 overflow-hidden"
                    >
                      <div className="truncate">
                        <span className="text-xs font-bold text-foreground truncate block">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-foreground-muted font-mono truncate block">
                          {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                        </span>
                      </div>

                      <div className="flex items-center gap-2 shrink-0">
                        <span className="text-[10px] font-mono font-bold text-foreground">
                          {item.progress || 0}%
                        </span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </Card>
      )}

      {/* 2. QUARTERLY VIEW */}
      {viewMode === 'quarterly' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {Object.entries(quarterlyItems).map(([qName, qItems]) => (
            <Card key={qName} className="p-4 space-y-3 bg-card border border-border">
              <div className="flex items-center justify-between pb-2 border-b border-border">
                <span className="font-bold text-xs text-foreground uppercase tracking-wider">{qName}</span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-secondary text-foreground-secondary">
                  {qItems.length} items
                </span>
              </div>

              <div className="space-y-2.5">
                {qItems.length === 0 ? (
                  <p className="text-xs text-foreground-muted italic py-6 text-center">No initiatives scheduled</p>
                ) : (
                  qItems.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => openEditModal(item)}
                      className="p-3 rounded-lg border border-border bg-background hover:border-primary/50 transition-all cursor-pointer shadow-xs space-y-2"
                    >
                      <div className="flex items-start justify-between gap-1">
                        <h4 className="text-xs font-semibold text-foreground line-clamp-2">{item.title}</h4>
                        {getPriorityBadge(item.priority)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span className="text-foreground-muted">Progress</span>
                          <span className="font-bold text-foreground">{item.progress || 0}%</span>
                        </div>
                        <Progress value={item.progress || 0} size="sm" className="h-1" />
                      </div>

                      <div className="flex items-center justify-between pt-1 border-t border-border/50 text-[10px] text-foreground-muted">
                        <span>{new Date(item.startDate).toLocaleDateString()}</span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 3. MONTHLY VIEW */}
      {viewMode === 'monthly' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Object.entries(monthlyItems).map(([mName, mItems]) => (
            <Card key={mName} className="p-3.5 space-y-2.5 bg-card">
              <div className="flex items-center justify-between pb-1.5 border-b border-border">
                <span className="font-bold text-xs text-foreground">{mName} 2026</span>
                <span className="text-[10px] font-mono text-foreground-muted">{mItems.length} items</span>
              </div>

              <div className="space-y-2">
                {mItems.length === 0 ? (
                  <p className="text-[11px] text-foreground-muted italic py-3 text-center">No items</p>
                ) : (
                  mItems.map((item: any) => (
                    <div
                      key={item.id}
                      onClick={() => openEditModal(item)}
                      className="p-2.5 rounded-lg border border-border bg-background hover:border-primary/50 cursor-pointer text-xs space-y-1"
                    >
                      <span className="font-medium text-foreground block truncate">{item.title}</span>
                      <div className="flex items-center justify-between text-[10px] font-mono text-foreground-muted">
                        <span>{item.progress}% done</span>
                        {getStatusBadge(item.status)}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* 4. LIST VIEW */}
      {viewMode === 'list' && (
        <Card className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              <thead>
                <tr className="border-b border-border bg-background-secondary text-[11px] font-semibold text-foreground-muted uppercase tracking-wider">
                  <th className="py-3 px-4">Roadmap Initiative</th>
                  <th className="py-3 px-4 w-32">Status</th>
                  <th className="py-3 px-4 w-28">Priority</th>
                  <th className="py-3 px-4 w-36">Timeline</th>
                  <th className="py-3 px-4 w-40">Progress</th>
                  <th className="py-3 px-4 w-24 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {items.map((item: any) => (
                  <tr key={item.id} className="hover:bg-background-secondary/50 transition-colors">
                    <td className="py-3 px-4">
                      <div
                        onClick={() => openEditModal(item)}
                        className="cursor-pointer hover:text-primary transition-colors font-medium text-foreground"
                      >
                        <span>{item.title}</span>
                        {item.description && (
                          <span className="text-[11px] text-foreground-muted block truncate max-w-md">
                            {item.description}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">{getStatusBadge(item.status)}</td>
                    <td className="py-3 px-4">{getPriorityBadge(item.priority)}</td>
                    <td className="py-3 px-4 font-mono text-[11px] text-foreground-secondary">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4">
                      <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-mono">
                          <span>{item.progress || 0}%</span>
                        </div>
                        <Progress value={item.progress || 0} size="sm" className="h-1.5" />
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1 rounded text-foreground-muted hover:text-foreground"
                        >
                          <Edit className="h-3.5 w-3.5" />
                        </button>
                        <button
                          onClick={() => deleteItemMutation.mutate(item.id)}
                          className="p-1 rounded text-foreground-muted hover:text-destructive"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      )}

      {/* Add / Edit Roadmap Item Modal */}
      <Dialog
        isOpen={isItemModalOpen}
        onClose={() => setIsItemModalOpen(false)}
        title={editingItemId ? 'Edit Roadmap Initiative' : 'Add Strategic Roadmap Initiative'}
        size="md"
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Initiative Title *</label>
            <Input
              value={itemTitle}
              onChange={(e) => setItemTitle(e.target.value)}
              placeholder="e.g. Q2 Resilience & Distributed Fallback Engine"
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">Description</label>
            <Textarea
              value={itemDesc}
              onChange={(e) => setItemDesc(e.target.value)}
              placeholder="Strategic goals, deliverable scope, or acceptance criteria..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Start Date</label>
              <Input
                type="date"
                value={itemStartDate}
                onChange={(e) => setItemStartDate(e.target.value)}
                className="text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">End Date</label>
              <Input
                type="date"
                value={itemEndDate}
                onChange={(e) => setItemEndDate(e.target.value)}
                className="text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Status</label>
              <select
                value={itemStatus}
                onChange={(e) => setItemStatus(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="PLANNED">Planned</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="COMPLETED">Completed</option>
                <option value="BLOCKED">Blocked</option>
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Priority</label>
              <select
                value={itemPriority}
                onChange={(e) => setItemPriority(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
                <option value="URGENT">Urgent</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Progress (%)</label>
              <Input
                type="number"
                min="0"
                max="100"
                value={itemProgress}
                onChange={(e) => setItemProgress(Math.min(100, Math.max(0, parseInt(e.target.value) || 0)))}
                className="text-xs font-mono"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">Link Delivery Milestone</label>
              <select
                value={itemMilestoneId}
                onChange={(e) => setItemMilestoneId(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-background text-xs font-medium text-foreground"
              >
                <option value="">No milestone linked</option>
                {milestones.map((m: any) => (
                  <option key={m.id} value={m.id}>
                    {m.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button variant="outline" size="sm" onClick={() => setIsItemModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              disabled={!itemTitle.trim() || !itemStartDate || !itemEndDate || createOrUpdateItemMutation.isPending}
              isLoading={createOrUpdateItemMutation.isPending}
              onClick={() => createOrUpdateItemMutation.mutate()}
            >
              {editingItemId ? 'Save Changes' : 'Create Initiative'}
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
