'use client';

import React, { useState } from 'react';
import {
  Info,
  History,
  MessageSquare,
  CheckCircle,
  Download,
  RotateCcw,
  Send,
  Check,
  Tag,
  FileCheck,
  FileX,
  PanelRightClose
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import {
  useLayoutStore,
  MIN_INSPECTOR_WIDTH,
  MAX_INSPECTOR_WIDTH
} from '../../stores/useLayoutStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { ResizeHandle } from '../../components/ui/ResizeHandle';
import { DOCUMENT_STATUSES } from '@devblueprint/shared';
import * as diff from 'diff';

interface ContextualRightPanelProps {
  documentId: string;
}

export function ContextualRightPanel({ documentId }: ContextualRightPanelProps) {
  const queryClient = useQueryClient();
  const {
    status,
    isOptional,
    versionNumber,
    setStatus,
    setIsOptional,
    activeRightTab,
    setActiveRightTab,
    setSavedSuccessfully
  } = useEditorStore();

  const {
    inspectorWidth,
    setInspectorWidth,
    resetInspectorWidth,
    isInspectorCollapsed,
    toggleInspectorCollapsed,
    isMobileInspectorOpen,
    setMobileInspectorOpen,
    isResizing,
    setIsResizing,
    commitLayout
  } = useLayoutStore();

  const [commentInput, setCommentInput] = useState('');
  const [reviewNotes, setReviewNotes] = useState('');
  const [selectedVersionForDiff, setSelectedVersionForDiff] = useState<any | null>(null);

  // Fetch full document details (with versions, comments, review requests)
  const { data: docData, refetch } = useQuery({
    queryKey: ['document-details', documentId],
    queryFn: async () => {
      const res = await api.get<any>(`/documents/${documentId}`);
      return res.data;
    },
    enabled: !!documentId
  });

  // Post comment mutation
  const postCommentMutation = useMutation({
    mutationFn: async (content: string) => {
      const res = await api.post('/comments', { documentId, content });
      return res.data;
    },
    onSuccess: () => {
      setCommentInput('');
      refetch();
    }
  });

  // Resolve comment mutation
  const resolveCommentMutation = useMutation({
    mutationFn: async ({ commentId, isResolved }: { commentId: string; isResolved: boolean }) => {
      const res = await api.put(`/comments/${commentId}/resolve`, { isResolved });
      return res.data;
    },
    onSuccess: () => refetch()
  });

  // Restore version mutation
  const restoreVersionMutation = useMutation({
    mutationFn: async (targetVersion: number) => {
      const res = await api.post<any>(`/documents/${documentId}/versions/restore`, {
        versionNumber: targetVersion
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      setSavedSuccessfully(data.versionNumber);
      setSelectedVersionForDiff(null);
      refetch();
    }
  });

  // Request review mutation
  const requestReviewMutation = useMutation({
    mutationFn: async (notes: string) => {
      const res = await api.post('/reviews', { documentId, notes });
      return res.data;
    },
    onSuccess: () => {
      setReviewNotes('');
      refetch();
    }
  });

  // Submit review approval mutation
  const submitReviewApprovalMutation = useMutation({
    mutationFn: async ({
      requestId,
      reviewStatus,
      comment
    }: {
      requestId: string;
      reviewStatus: string;
      comment?: string;
    }) => {
      const res = await api.post(`/reviews/${requestId}/approvals`, {
        status: reviewStatus,
        comment
      });
      return res.data;
    },
    onSuccess: () => {
      refetch();
      queryClient.invalidateQueries({ queryKey: ['project'] });
    }
  });

  const handleExport = () => {
    window.open(
      `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/documents/${documentId}/export`,
      '_blank'
    );
  };

  const tabs = [
    { id: 'metadata', label: 'Meta', icon: <Info className="h-3.5 w-3.5" /> },
    {
      id: 'versions',
      label: 'Versions',
      icon: <History className="h-3.5 w-3.5" />,
      count: docData?.versions?.length
    },
    {
      id: 'comments',
      label: 'Comments',
      icon: <MessageSquare className="h-3.5 w-3.5" />,
      count: docData?.comments?.length
    },
    { id: 'review', label: 'Review', icon: <CheckCircle className="h-3.5 w-3.5" /> }
  ];

  const handleResize = (deltaX: number) => {
    // Left boundary resize: moving mouse left increases width
    setInspectorWidth(inspectorWidth - deltaX, false);
  };

  const handleStepResize = (delta: number) => {
    setInspectorWidth(inspectorWidth - delta, true);
  };

  const panelContent = (
    <div className="flex flex-col h-full overflow-hidden w-full">
      {/* Tab Switcher & Collapse Header */}
      <div className="flex items-center justify-between border-b border-border bg-background-secondary p-1 shrink-0">
        <div className="flex flex-1 gap-1 min-w-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveRightTab(t.id as any)}
              className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 px-1 rounded-lg font-medium text-[11px] transition-colors truncate ${
                activeRightTab === t.id
                  ? 'bg-card text-foreground font-semibold shadow-xs'
                  : 'text-foreground-muted hover:text-foreground'
              }`}
            >
              {t.icon}
              <span className="truncate">{t.label}</span>
              {t.count !== undefined && t.count > 0 && (
                <span className="text-[10px] px-1 rounded-full bg-secondary text-foreground-secondary shrink-0">
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Collapse button on desktop / close on mobile */}
        <button
          onClick={() => {
            toggleInspectorCollapsed();
            setMobileInspectorOpen(false);
          }}
          className="p-1.5 rounded-md text-foreground-muted hover:text-foreground hover:bg-background-tertiary transition-colors ml-1 shrink-0"
          title="Close Inspector"
          aria-label="Close Inspector"
        >
          <PanelRightClose className="h-4 w-4" />
        </button>
      </div>

      {/* Tab Panels with independent scrolling */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Tab 1: Metadata */}
        {activeRightTab === 'metadata' && (
          <div className="space-y-4">
            {/* Compact Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted block">
                Document Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-8 px-2.5 rounded-lg border border-border bg-background-secondary text-xs font-semibold text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs cursor-pointer"
              >
                {DOCUMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div className="border-t border-border pt-3">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted block mb-1.5">
                Blueprint Requirements
              </label>
              <div className="flex items-center justify-between p-2.5 rounded-lg bg-background-secondary border border-border">
                <div className="space-y-0.5 min-w-0 pr-2">
                  <p className="text-xs font-medium text-foreground">Optional Document</p>
                  <p className="text-[10px] text-foreground-muted">Excluded from blueprint completion rate</p>
                </div>
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="h-4 w-4 rounded border-border text-primary focus:ring-primary cursor-pointer shrink-0"
                />
              </div>
            </div>

            <div className="border-t border-border pt-3 space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted block">
                Document Information
              </label>
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between py-1 border-b border-border/50 gap-2">
                  <span className="text-foreground-muted shrink-0">File Name</span>
                  <span
                    className="font-mono text-foreground font-medium truncate max-w-[180px] text-right"
                    title={docData?.fileName}
                  >
                    {docData?.fileName || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/50 gap-2">
                  <span className="text-foreground-muted shrink-0">Current Version</span>
                  <span className="font-mono text-foreground font-medium">v{versionNumber}</span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/50 gap-2">
                  <span className="text-foreground-muted shrink-0">Category</span>
                  <span className="text-foreground font-medium truncate max-w-[180px] text-right">
                    {docData?.category?.name || '-'}
                  </span>
                </div>
                <div className="flex items-center justify-between py-1 border-b border-border/50 gap-2">
                  <span className="text-foreground-muted shrink-0">Created By</span>
                  <span className="text-foreground font-medium truncate max-w-[180px] text-right">
                    {docData?.createdBy?.name || '-'}
                  </span>
                </div>
              </div>
            </div>

            {/* Document Tags */}
            <div className="border-t border-border pt-3 space-y-2">
              <label className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center gap-1.5">
                <Tag className="h-3 w-3" />
                <span>Tags</span>
              </label>
              <div className="flex flex-wrap gap-1.5">
                {(docData?.documentTags || []).length === 0 ? (
                  <span className="text-foreground-muted text-[11px] italic">No tags attached</span>
                ) : (
                  docData.documentTags.map((dt: any) => (
                    <Badge
                      key={dt.tag.id}
                      variant="outline"
                      className="text-[10px]"
                      style={{ borderColor: dt.tag.color, color: dt.tag.color }}
                    >
                      {dt.tag.name}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Export Actions */}
            <div className="border-t border-border pt-3">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full text-xs gap-1.5 border-border"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export as Markdown (.md)</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Version History & Visual Diff */}
        {activeRightTab === 'versions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-foreground">
                Revisions ({docData?.versions?.length || 0})
              </span>
              <span className="text-[10px] text-foreground-muted">Click to view diff</span>
            </div>

            {selectedVersionForDiff && (
              <div className="p-3 rounded-xl border border-primary/30 bg-primary/5 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-xs text-primary truncate">
                    Comparing v{selectedVersionForDiff.versionNumber} with current
                  </span>
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-6 text-[10px] gap-1 px-2 border-primary/40 text-primary shrink-0"
                    onClick={() => restoreVersionMutation.mutate(selectedVersionForDiff.versionNumber)}
                    isLoading={restoreVersionMutation.isPending}
                  >
                    <RotateCcw className="h-3 w-3" /> Restore
                  </Button>
                </div>
                <div className="max-h-48 overflow-y-auto font-mono text-[10px] bg-background p-2 rounded-lg border border-border leading-relaxed">
                  {diff
                    .diffLines(selectedVersionForDiff.content || '', docData?.content || '')
                    .map((part, index) => {
                      const color = part.added
                        ? 'text-success bg-success/10'
                        : part.removed
                        ? 'text-destructive bg-destructive/10'
                        : 'text-foreground-muted';
                      return (
                        <div key={index} className={color}>
                          {part.added ? '+ ' : part.removed ? '- ' : '  '}
                          {part.value}
                        </div>
                      );
                    })}
                </div>
              </div>
            )}

            <div className="space-y-2">
              {(docData?.versions || []).map((ver: any) => (
                <div
                  key={ver.id}
                  onClick={() => setSelectedVersionForDiff(ver)}
                  className={`p-2.5 rounded-lg border transition-all cursor-pointer ${
                    selectedVersionForDiff?.id === ver.id
                      ? 'border-primary bg-primary/5'
                      : 'border-border bg-card hover:bg-background-tertiary'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-semibold text-xs text-foreground">
                      v{ver.versionNumber}
                    </span>
                    <span className="text-[10px] text-foreground-muted">
                      {new Date(ver.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  {ver.changeSummary && (
                    <p className="text-[11px] text-foreground-secondary mt-1">{ver.changeSummary}</p>
                  )}
                  <p className="text-[10px] text-foreground-muted mt-1">By {ver.user?.name || 'User'}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Comments */}
        {activeRightTab === 'comments' && (
          <div className="space-y-4">
            <div className="space-y-2">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Leave an architectural feedback comment..."
                rows={3}
                className="w-full p-2.5 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => postCommentMutation.mutate(commentInput)}
                disabled={!commentInput.trim()}
                isLoading={postCommentMutation.isPending}
                className="w-full text-xs gap-1.5 shadow-xs"
              >
                <Send className="h-3 w-3" />
                <span>Post Comment</span>
              </Button>
            </div>

            <div className="space-y-2.5 pt-2">
              {(docData?.comments || []).length === 0 ? (
                <div className="p-4 text-center border border-dashed border-border rounded-xl">
                  <p className="text-[11px] text-foreground-muted">No comments yet</p>
                </div>
              ) : (
                docData.comments.map((c: any) => (
                  <div
                    key={c.id}
                    className={`p-3 rounded-xl border transition-colors ${
                      c.isResolved ? 'border-border bg-background-secondary/60 opacity-60' : 'border-border bg-card'
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-foreground text-[11px]">{c.author.name}</span>
                      <button
                        onClick={() =>
                          resolveCommentMutation.mutate({
                            commentId: c.id,
                            isResolved: !c.isResolved
                          })
                        }
                        className={`text-[10px] flex items-center gap-1 font-medium ${
                          c.isResolved ? 'text-success' : 'text-foreground-muted hover:text-foreground'
                        }`}
                      >
                        <Check className="h-3 w-3" />
                        <span>{c.isResolved ? 'Resolved' : 'Resolve'}</span>
                      </button>
                    </div>
                    <p className="text-foreground-secondary text-xs leading-relaxed">{c.content}</p>
                    <span className="text-[10px] text-foreground-muted mt-2 block">
                      {new Date(c.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Review Workflow */}
        {activeRightTab === 'review' && (
          <div className="space-y-4">
            <div className="p-3 rounded-xl border border-border bg-card space-y-2 shadow-xs">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                Current Approval State
              </span>
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-foreground">Status:</span>
                <Badge
                  variant={
                    status === 'APPROVED' || status === 'COMPLETED'
                      ? 'success'
                      : status === 'IN_REVIEW'
                      ? 'warning'
                      : 'outline'
                  }
                >
                  {status}
                </Badge>
              </div>
            </div>

            {/* Request Review Box */}
            <div className="space-y-2 border-t border-border pt-3">
              <span className="text-[11px] font-medium text-foreground">
                Request Architecture Review
              </span>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Notes for the reviewer (e.g., changes to data schema)..."
                rows={2}
                className="w-full p-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => requestReviewMutation.mutate(reviewNotes)}
                isLoading={requestReviewMutation.isPending}
                className="w-full text-xs shadow-xs"
              >
                Submit Review Request
              </Button>
            </div>

            {/* Active Review Requests */}
            {(docData?.reviewRequests || []).length > 0 && (
              <div className="space-y-2 border-t border-border pt-3">
                <span className="text-[11px] font-medium text-foreground">
                  Review Approvals & Sign-offs
                </span>
                {docData.reviewRequests.map((rr: any) => (
                  <div
                    key={rr.id}
                    className="p-3 rounded-xl border border-border bg-card space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-foreground font-medium">
                        Requested by {rr.requester.name}
                      </span>
                      <Badge variant="warning">{rr.status}</Badge>
                    </div>
                    {rr.notes && <p className="text-foreground-secondary text-[11px]">{rr.notes}</p>}

                    {/* Quick sign-off buttons for Admin/Owner */}
                    {rr.status === 'PENDING' && (
                      <div className="flex gap-2 pt-2">
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            submitReviewApprovalMutation.mutate({
                              requestId: rr.id,
                              reviewStatus: 'APPROVED',
                              comment: 'Approved for production blueprint'
                            })
                          }
                          className="flex-1 text-xs gap-1"
                        >
                          <FileCheck className="h-3 w-3" /> Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="danger"
                          onClick={() =>
                            submitReviewApprovalMutation.mutate({
                              requestId: rr.id,
                              reviewStatus: 'CHANGES_REQUESTED',
                              comment: 'Please refine architectural invariants'
                            })
                          }
                          className="flex-1 text-xs gap-1"
                        >
                          <FileX className="h-3 w-3" /> Request Changes
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileInspectorOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={() => setMobileInspectorOpen(false)}
        />
      )}

      {/* Mobile Slide-Over Drawer */}
      <aside
        className={`fixed inset-y-0 right-0 w-[300px] sm:w-[340px] bg-background border-l border-border z-50 flex flex-col shadow-2xl transition-transform duration-300 md:hidden ${
          isMobileInspectorOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {panelContent}
      </aside>

      {/* Desktop Resizable Right Panel (when not collapsed) */}
      {!isInspectorCollapsed && (
        <>
          <ResizeHandle
            onResize={handleResize}
            onReset={resetInspectorWidth}
            onStepChange={handleStepResize}
            onDragStart={() => setIsResizing(true)}
            onDragEnd={() => {
              setIsResizing(false);
              commitLayout();
            }}
            min={MIN_INSPECTOR_WIDTH}
            max={MAX_INSPECTOR_WIDTH}
            current={inspectorWidth}
            ariaLabel="Resize Inspector Panel"
            side="left"
            className="hidden md:flex"
          />
          <aside
            style={{ width: `${inspectorWidth}px` }}
            className={`border-l border-border bg-background hidden md:flex flex-col h-full text-xs select-none shrink-0 overflow-hidden relative min-w-0 ${
              !isResizing ? 'transition-[width] duration-200 ease-out' : ''
            }`}
          >
            {panelContent}
          </aside>
        </>
      )}
    </>
  );
}
