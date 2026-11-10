'use client';

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Card, CardHeader, CardContent, CardTitle } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import {
  Shield,
  Clock,
  User,
  ArrowRight,
  Download,
  Filter,
  Search,
  RefreshCw,
  Info,
  ChevronLeft,
  ChevronRight,
  FileSpreadsheet,
  X,
  Laptop
} from 'lucide-react';
import { AuditLogRecord } from '@devblueprint/types';

export function AuditLogsView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>('all');
  const [status, setStatus] = useState<string>('all');
  const [page, setPage] = useState<number>(1);
  const [selectedEvent, setSelectedEvent] = useState<AuditLogRecord | null>(null);

  const { data, isLoading, refetch, isFetching } = useQuery<{
    events: AuditLogRecord[];
    pagination: { total: number; page: number; limit: number; totalPages: number };
  }>({
    queryKey: ['audit-logs', search, category, status, page],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.append('search', search);
      if (category && category !== 'all') params.append('category', category);
      if (status && status !== 'all') params.append('status', status);
      params.append('page', page.toString());
      params.append('limit', '20');

      const res = await api.get<any>(`/audit-logs?${params.toString()}`);
      return res.data;
    }
  });

  const handleExportCSV = () => {
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (status && status !== 'all') params.append('status', status);

    const token = typeof window !== 'undefined' ? localStorage.getItem('devblueprint_token') : null;
    const downloadUrl = `http://localhost:4000/api/v1/audit-logs/export/csv?${params.toString()}`;

    fetch(downloadUrl, {
      headers: token ? { Authorization: `Bearer ${token}` } : {}
    })
      .then((res) => res.blob())
      .then((blob) => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `audit-logs-report.csv`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      })
      .catch((err) => {
        console.error('Failed to export CSV:', err);
      });
  };

  const getStatusBadge = (eventStatus?: string) => {
    switch (eventStatus) {
      case 'SUCCESS':
        return (
          <Badge className="bg-emerald-500/15 text-emerald-600 border border-emerald-500/30 text-[10px]">
            SUCCESS
          </Badge>
        );
      case 'FAILURE':
        return (
          <Badge className="bg-rose-500/15 text-rose-600 border border-rose-500/30 text-[10px]">
            FAILURE
          </Badge>
        );
      case 'WARNING':
        return (
          <Badge className="bg-amber-500/15 text-amber-600 border border-amber-500/30 text-[10px]">
            WARNING
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-[10px]">
            {eventStatus || 'INFO'}
          </Badge>
        );
    }
  };

  const events = data?.events || [];
  const pagination = data?.pagination;

  return (
    <div className="w-full max-w-5xl mx-auto p-6 lg:p-8 space-y-6 min-w-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Shield className="h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Audit Logs & Governance</h1>
            <p className="text-xs text-foreground-muted">
              Immutable workspace audit trail tracking user actions, releases, blueprints, tests, and security events.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={handleExportCSV}
            className="text-xs gap-1.5 h-8 border-primary/30 text-primary hover:bg-primary/5"
          >
            <Download className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>

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
        </div>
      </div>

      {/* Filter and Search Bar */}
      <Card className="p-4 shadow-xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="relative">
            <Search className="h-3.5 w-3.5 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search actor, action, or target..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
            />
          </div>

          <div>
            <select
              value={category}
              onChange={(e) => {
                setCategory(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Event Categories</option>
              <option value="AUTH">Authentication & Users</option>
              <option value="BLUEPRINT">Documentation & Blueprints</option>
              <option value="RELEASE">Releases & Deployments</option>
              <option value="TEST">Testing & QA</option>
              <option value="DEFECT">Defects & Bugs</option>
              <option value="RISK">Risks & Dependencies</option>
              <option value="INTEGRATION">Integrations & Connectors</option>
              <option value="WORKSPACE">Workspace Settings</option>
            </select>
          </div>

          <div>
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value);
                setPage(1);
              }}
              className="w-full px-3 py-1.5 text-xs rounded-lg border border-border bg-card text-foreground focus:ring-1 focus:ring-primary"
            >
              <option value="all">All Outcomes</option>
              <option value="SUCCESS">Success Only</option>
              <option value="FAILURE">Failure Only</option>
              <option value="WARNING">Warnings</option>
            </select>
          </div>
        </div>
      </Card>

      {/* Events Table / List */}
      <div className="space-y-2">
        {events.length === 0 ? (
          <div className="text-center py-12 text-xs text-foreground-muted bg-card border border-border rounded-xl">
            No audit log entries found matching current filter parameters.
          </div>
        ) : (
          events.map((log) => (
            <Card
              key={log.id}
              onClick={() => setSelectedEvent(log)}
              className="p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-primary/40 cursor-pointer transition-all"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center text-xs font-bold shrink-0">
                  {log.actorName ? log.actorName.charAt(0) : 'S'}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">
                      {log.actorName || 'System'}
                    </span>
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {log.action}
                    </Badge>
                    {getStatusBadge(log.status)}
                    <span className="text-[10px] bg-background-secondary px-1.5 py-0.5 rounded text-foreground-muted font-mono">
                      {log.category}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary truncate mt-0.5">
                    {(log as any).target || (log.details ? String(log.details) : `${log.entityType}: ${log.entityId || log.action}`)}
                  </p>
                </div>
              </div>

              <div className="text-left sm:text-right shrink-0 flex sm:flex-col items-center sm:items-end justify-between text-xs text-foreground-muted border-t sm:border-t-0 pt-2 sm:pt-0">
                <span className="text-[11px] block">{new Date(log.createdAt).toLocaleString()}</span>
                <span className="text-[10px] font-mono">{log.ipAddress || '127.0.0.1'}</span>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Pagination Controls */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between pt-2 text-xs text-foreground-muted">
          <span>
            Page {pagination.page} of {pagination.totalPages} ({pagination.total} records)
          </span>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="text-xs h-7 px-2"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </Button>
            <Button
              variant="outline"
              size="sm"
              disabled={page >= pagination.totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="text-xs h-7 px-2"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      )}

      {/* Event Details Modal / Drawer */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <Card className="w-full max-w-xl bg-card border-border shadow-xl">
            <CardHeader className="p-5 border-b border-border flex flex-row items-center justify-between">
              <div className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-primary" />
                <CardTitle className="text-sm font-semibold text-foreground">
                  Audit Event Record Details
                </CardTitle>
              </div>
              <button
                onClick={() => setSelectedEvent(null)}
                className="text-foreground-muted hover:text-foreground"
              >
                <X className="h-4 w-4" />
              </button>
            </CardHeader>
            <CardContent className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-foreground-muted block">Event ID</span>
                  <span className="font-mono text-foreground font-semibold">{selectedEvent.id}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block">Timestamp</span>
                  <span className="text-foreground font-semibold">
                    {new Date(selectedEvent.createdAt).toLocaleString()}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block">Actor</span>
                  <span className="text-foreground font-semibold">
                    {selectedEvent.actorName} ({selectedEvent.userId || 'N/A'})
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block">Action / Status</span>
                  <span className="flex items-center gap-1.5 mt-0.5">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {selectedEvent.action}
                    </Badge>
                    {getStatusBadge(selectedEvent.status)}
                  </span>
                </div>
                <div>
                  <span className="text-foreground-muted block">Category</span>
                  <span className="font-mono text-foreground">{selectedEvent.category}</span>
                </div>
                <div>
                  <span className="text-foreground-muted block">Client IP / User Agent</span>
                  <span className="text-[11px] font-mono text-foreground truncate block">
                    {selectedEvent.ipAddress || '127.0.0.1'}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-xs font-semibold text-foreground block mb-1">Target Resource</span>
                <p className="text-xs text-foreground-secondary bg-background-secondary p-2.5 rounded-lg border border-border">
                  {(selectedEvent as any).target || `${selectedEvent.entityType}: ${selectedEvent.entityId || 'N/A'}`}
                </p>
              </div>

              {selectedEvent.details && (
                <div>
                  <span className="text-xs font-semibold text-foreground block mb-1">
                    Event Metadata & Parameters
                  </span>
                  <pre className="text-[11px] font-mono bg-background-secondary p-3 rounded-lg border border-border text-foreground overflow-x-auto">
                    {JSON.stringify(selectedEvent.details, null, 2)}
                  </pre>
                </div>
              )}

              <div className="flex justify-end pt-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSelectedEvent(null)}
                  className="text-xs"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
