'use client';

import React, { useState } from 'react';
import {
  Info,
  History,
  MessageSquare,
  CheckCircle,
  Clock,
  Download,
  RotateCcw,
  Send,
  Check,
  Tag,
  AlertCircle,
  FileCheck,
  FileX
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { DOCUMENT_STATUSES } from '@devblueprint/shared';
import * as diff from 'diff';

interface ContextualRightPanelProps {
  documentId: string;
}

export function ContextualRightPanel({ documentId }: ContextualRightPanelProps) {
  const queryClient = useQueryClient();
  const {
    title,
    status,
    isOptional,
    versionNumber,
    setStatus,
    setIsOptional,
    activeRightTab,
    setActiveRightTab,
    setSavedSuccessfully
  } = useEditorStore();

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
      queryClient.invalidateQueries({ queryKey: ['project'] });
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
      setStatus('IN_REVIEW');
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
      comment: string;
    }) => {
      const res = await api.post(`/reviews/${requestId}/approval`, {
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
    window.open(`${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1'}/documents/${documentId}/export`, '_blank');
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

  return (
    <aside className="w-80 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full text-xs select-none shrink-0 overflow-hidden">
      {/* Tab Switcher */}
      <div className="flex border-b border-zinc-800 bg-zinc-900/60 p-1">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setActiveRightTab(t.id as any)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md font-medium text-[11px] transition-colors ${
              activeRightTab === t.id
                ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.count !== undefined && t.count > 0 && (
              <span className="text-[10px] px-1 rounded-full bg-zinc-700/80 text-zinc-300">
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {activeRightTab === 'metadata' && (
          <div className="space-y-4">
            {/* Status Selector */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-medium text-zinc-400">
                Document Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value)}
                className="w-full h-8 px-2.5 rounded-md border border-zinc-800 bg-zinc-900 text-zinc-200 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
              >
                {DOCUMENT_STATUSES.map((st) => (
                  <option key={st} value={st}>
                    {st.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            {/* Optional Document Toggle */}
            <div className="p-3 rounded-lg border border-zinc-800/80 bg-zinc-900/40 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-medium text-zinc-200">
                  Optional Blueprint
                </span>
                <input
                  type="checkbox"
                  checked={isOptional}
                  onChange={(e) => setIsOptional(e.target.checked)}
                  className="rounded border-zinc-700 bg-zinc-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                />
              </div>
              <p className="text-[11px] text-zinc-500 leading-relaxed">
                When marked optional, this document does not penalize total project completion percentage.
              </p>
            </div>

            {/* Document Info */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex justify-between items-center text-zinc-400">
                <span>File Name:</span>
                <span className="font-mono text-zinc-300 truncate max-w-[150px]">
                  {docData?.fileName || 'document.md'}
                </span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Current Version:</span>
                <span className="font-mono text-zinc-200">v{versionNumber}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Category:</span>
                <span className="text-zinc-300">{docData?.categoryName}</span>
              </div>
              <div className="flex justify-between items-center text-zinc-400">
                <span>Created By:</span>
                <span className="text-zinc-300">{docData?.createdBy?.name}</span>
              </div>
            </div>

            {/* Tags */}
            <div className="space-y-2 pt-2 border-t border-zinc-800/60">
              <div className="flex items-center gap-1.5 text-zinc-400 font-medium text-[11px]">
                <Tag className="h-3 w-3" />
                <span>Tags</span>
              </div>
              <div className="flex flex-wrap gap-1">
                {(docData?.tags || []).length === 0 ? (
                  <span className="text-zinc-600 italic">No tags assigned</span>
                ) : (
                  docData.tags.map((tag: string) => (
                    <Badge key={tag} variant="outline" className="text-[10px]">
                      {tag}
                    </Badge>
                  ))
                )}
              </div>
            </div>

            {/* Export Action */}
            <div className="pt-4 border-t border-zinc-800/60">
              <Button
                variant="outline"
                size="sm"
                onClick={handleExport}
                className="w-full text-xs gap-1.5 justify-center"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export as Markdown (.md)</span>
              </Button>
            </div>
          </div>
        )}

        {/* Tab 2: Version History & Diff */}
        {activeRightTab === 'versions' && (
          <div className="space-y-3">
            <p className="text-[11px] text-zinc-400">
              Immutable content snapshots recorded automatically on major changes.
            </p>

            {/* Version Diff Viewer if selected */}
            {selectedVersionForDiff && (
              <div className="p-3 rounded-lg border border-indigo-900/60 bg-indigo-950/20 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="font-semibold text-indigo-300">
                    Comparing v{selectedVersionForDiff.versionNumber} with current
                  </span>
                  <button
                    onClick={() => setSelectedVersionForDiff(null)}
                    className="text-zinc-400 hover:text-zinc-200"
                  >
                    ×
                  </button>
                </div>
                <div className="max-h-48 overflow-y-auto font-mono text-[10px] space-y-0.5 bg-zinc-950 p-2 rounded">
                  {diff
                    .diffLines(selectedVersionForDiff.content, docData?.content || '')
                    .map((part, index) => (
                      <div
                        key={index}
                        className={
                          part.added
                            ? 'bg-emerald-950/80 text-emerald-300'
                            : part.removed
                            ? 'bg-rose-950/80 text-rose-300'
                            : 'text-zinc-400'
                        }
                      >
                        {part.added ? '+ ' : part.removed ? '- ' : '  '}
                        {part.value}
                      </div>
                    ))}
                </div>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() =>
                    restoreVersionMutation.mutate(selectedVersionForDiff.versionNumber)
                  }
                  isLoading={restoreVersionMutation.isPending}
                  className="w-full text-xs gap-1.5"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Restore v{selectedVersionForDiff.versionNumber} as latest</span>
                </Button>
              </div>
            )}

            {/* Versions List */}
            <div className="space-y-2">
              {(docData?.versions || []).map((v: any) => (
                <div
                  key={v.id}
                  className="p-2.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 space-y-1.5 transition-colors"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-zinc-200 font-mono">
                      v{v.versionNumber}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {new Date(v.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                  <p className="text-[11px] text-zinc-400">
                    {v.changeSummary || 'Snapshot update'}
                  </p>
                  <div className="flex items-center justify-between pt-1 border-t border-zinc-800/40">
                    <span className="text-[10px] text-zinc-500">{v.authorName}</span>
                    <button
                      onClick={async () => {
                        const res = await api.get<any>(
                          `/documents/${documentId}/versions/${v.versionNumber}`
                        );
                        setSelectedVersionForDiff(res.data);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 font-medium"
                    >
                      Compare / Restore
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 3: Comments */}
        {activeRightTab === 'comments' && (
          <div className="space-y-3 flex flex-col h-full">
            {/* Comment Post Box */}
            <div className="space-y-2">
              <textarea
                value={commentInput}
                onChange={(e) => setCommentInput(e.target.value)}
                placeholder="Leave feedback or architectural note..."
                rows={3}
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => postCommentMutation.mutate(commentInput)}
                disabled={!commentInput.trim()}
                isLoading={postCommentMutation.isPending}
                className="w-full text-xs gap-1.5"
              >
                <Send className="h-3 w-3" />
                <span>Post Comment</span>
              </Button>
            </div>

            {/* Comments List */}
            <div className="space-y-2.5 pt-2">
              {(docData?.comments || []).length === 0 ? (
                <p className="text-zinc-500 text-center py-4 italic">
                  No comments on this document yet.
                </p>
              ) : (
                docData.comments.map((c: any) => (
                  <div
                    key={c.id}
                    className={`p-2.5 rounded-lg border space-y-1.5 transition-colors ${
                      c.isResolved
                        ? 'border-zinc-800/40 bg-zinc-950/40 opacity-70'
                        : 'border-zinc-800 bg-zinc-900/60'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-semibold text-zinc-300">{c.user.name}</span>
                      <span className="text-[10px] text-zinc-500">
                        {new Date(c.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                    <p className="text-zinc-200 text-[11px]">{c.content}</p>

                    {/* Replies */}
                    {(c.replies || []).length > 0 && (
                      <div className="pl-3 border-l-2 border-zinc-800 space-y-1 my-1">
                        {c.replies.map((r: any) => (
                          <div key={r.id} className="text-[10px]">
                            <span className="font-medium text-zinc-300">{r.user.name}: </span>
                            <span className="text-zinc-400">{r.content}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="pt-1 flex items-center justify-end">
                      <button
                        onClick={() =>
                          resolveCommentMutation.mutate({
                            commentId: c.id,
                            isResolved: !c.isResolved
                          })
                        }
                        className="text-[10px] text-zinc-400 hover:text-zinc-200 flex items-center gap-1"
                      >
                        <Check className="h-3 w-3" />
                        <span>{c.isResolved ? 'Reopen' : 'Resolve'}</span>
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Tab 4: Review Workflow */}
        {activeRightTab === 'review' && (
          <div className="space-y-4">
            <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-900/40 space-y-2">
              <span className="font-semibold text-zinc-200">Review Status</span>
              <div>
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
            <div className="space-y-2 border-t border-zinc-800/60 pt-3">
              <span className="text-[11px] font-medium text-zinc-300">
                Request Architecture Review
              </span>
              <textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder="Notes for the reviewer (e.g., changes to data schema)..."
                rows={2}
                className="w-full p-2 rounded-lg border border-zinc-800 bg-zinc-900 text-xs text-zinc-200 placeholder:text-zinc-500 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
              <Button
                size="sm"
                variant="primary"
                onClick={() => requestReviewMutation.mutate(reviewNotes)}
                isLoading={requestReviewMutation.isPending}
                className="w-full text-xs"
              >
                Submit Review Request
              </Button>
            </div>

            {/* Active Review Requests */}
            {(docData?.reviewRequests || []).length > 0 && (
              <div className="space-y-2 border-t border-zinc-800/60 pt-3">
                <span className="text-[11px] font-medium text-zinc-300">
                  Review Approvals & Sign-offs
                </span>
                {docData.reviewRequests.map((rr: any) => (
                  <div
                    key={rr.id}
                    className="p-3 rounded-lg border border-zinc-800 bg-zinc-900 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-zinc-300 font-medium">
                        Requested by {rr.requester.name}
                      </span>
                      <Badge variant="warning">{rr.status}</Badge>
                    </div>
                    {rr.notes && <p className="text-zinc-400 text-[11px]">{rr.notes}</p>}

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
                          className="flex-1 text-xs bg-emerald-600 hover:bg-emerald-500 gap-1"
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
    </aside>
  );
}
