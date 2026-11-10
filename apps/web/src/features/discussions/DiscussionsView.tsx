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
  MessageSquare,
  Plus,
  Pin,
  Send,
  User,
  Clock,
  CheckCircle2,
  Bookmark,
  FileCode,
  ThumbsUp,
  Heart,
  Rocket,
  Eye,
  Check,
  X,
  AlertCircle,
  HelpCircle,
  RotateCcw,
  Sparkles,
  Shield,
  Layers,
  Search,
  Filter,
  CheckSquare,
  MessageCircle,
  CornerDownRight,
  TrendingUp,
  Award
} from 'lucide-react';

interface DiscussionsViewProps {
  projectId?: string;
}

const CATEGORIES = [
  'ALL',
  'ARCHITECTURE',
  'TECHNICAL_DESIGN',
  'DATABASE_DESIGN',
  'API_DESIGN',
  'SECURITY',
  'PERFORMANCE',
  'INFRASTRUCTURE',
  'CODE_REVIEW',
  'PRODUCT_DECISIONS',
  'ENGINEERING_STANDARDS',
  'GENERAL'
];

export function DiscussionsView({ projectId }: DiscussionsViewProps) {
  const queryClient = useQueryClient();
  const { currentWorkspace, user } = useAuthStore();
  const workspaceId = currentWorkspace?.id;

  // Active Tab: discussions | rfcs | adrs
  const [activeTab, setActiveTab] = useState<'discussions' | 'rfcs' | 'adrs'>('discussions');

  // Filters & Search
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED'>('ALL');

  // Dialog States
  const [isStartDiscussionOpen, setIsStartDiscussionOpen] = useState(false);
  const [isCreateRFCOpen, setIsCreateRFCOpen] = useState(false);
  const [isCreateADROpen, setIsCreateADROpen] = useState(false);

  // Selected Detail views
  const [selectedDiscussion, setSelectedDiscussion] = useState<any | null>(null);
  const [selectedRFC, setSelectedRFC] = useState<any | null>(null);

  // Forms: Discussion
  const [discTitle, setDiscTitle] = useState('');
  const [discCategory, setDiscCategory] = useState('ARCHITECTURE');
  const [discContent, setDiscContent] = useState('');
  const [discTags, setDiscTags] = useState('');

  // Comment & Reply Form
  const [newComment, setNewComment] = useState('');
  const [replyingToCommentId, setReplyingToCommentId] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState('');

  // Forms: RFC
  const [rfcTitle, setRfcTitle] = useState('');
  const [rfcCategory, setRfcCategory] = useState('ARCHITECTURE');
  const [rfcProblem, setRfcProblem] = useState('');
  const [rfcMotivation, setRfcMotivation] = useState('');
  const [rfcSolution, setRfcSolution] = useState('');
  const [rfcTechArch, setRfcTechArch] = useState('');
  const [rfcSecurity, setRfcSecurity] = useState('');
  const [rfcPerformance, setRfcPerformance] = useState('');

  // Review & Vote Form
  const [reviewStatus, setReviewStatus] = useState('APPROVED');
  const [reviewComments, setReviewComments] = useState('');

  // Forms: ADR
  const [adrTitle, setAdrTitle] = useState('');
  const [adrContext, setAdrContext] = useState('');
  const [adrDecision, setAdrDecision] = useState('');
  const [adrConsequences, setAdrConsequences] = useState('');
  const [adrAlternatives, setAdrAlternatives] = useState('');

  // 1. Fetch Discussions
  const {
    data: discussions = [],
    isLoading: isDiscussionsLoading,
    isError: isDiscussionsError,
    refetch: refetchDiscussions
  } = useQuery({
    queryKey: ['discussions', workspaceId, projectId, selectedCategory, statusFilter, searchQuery],
    queryFn: async () => {
      if (!workspaceId) return [];
      const params = new URLSearchParams({ workspaceId });
      if (projectId && projectId !== 'ALL') params.append('projectId', projectId);
      if (selectedCategory !== 'ALL') params.append('category', selectedCategory);
      if (statusFilter !== 'ALL') params.append('status', statusFilter);
      if (searchQuery.trim()) params.append('search', searchQuery.trim());

      const res = await api.get<any[]>(`/discussions?${params.toString()}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // 2. Fetch RFCs
  const {
    data: rfcs = [],
    isLoading: isRFCsLoading,
    refetch: refetchRFCs
  } = useQuery({
    queryKey: ['rfcs', workspaceId, projectId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const params = new URLSearchParams({ workspaceId });
      if (projectId && projectId !== 'ALL') params.append('projectId', projectId);
      const res = await api.get<any[]>(`/discussions/rfcs?${params.toString()}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // 3. Fetch ADRs
  const {
    data: adrs = [],
    isLoading: isADRsLoading,
    refetch: refetchADRs
  } = useQuery({
    queryKey: ['adrs', workspaceId, projectId],
    queryFn: async () => {
      if (!workspaceId) return [];
      const params = new URLSearchParams({ workspaceId });
      if (projectId && projectId !== 'ALL') params.append('projectId', projectId);
      const res = await api.get<any[]>(`/discussions/decisions?${params.toString()}`);
      return res.data || [];
    },
    enabled: !!workspaceId
  });

  // Discussion Mutations
  const startDiscussionMutation = useMutation({
    mutationFn: async () => {
      const tagsArray = discTags
        .split(',')
        .map((t) => t.trim())
        .filter(Boolean);
      const res = await api.post('/discussions', {
        workspaceId,
        projectId: projectId && projectId !== 'ALL' ? projectId : undefined,
        title: discTitle,
        category: discCategory,
        content: discContent,
        tags: tagsArray
      });
      return res.data;
    },
    onSuccess: () => {
      setDiscTitle('');
      setDiscContent('');
      setDiscTags('');
      setIsStartDiscussionOpen(false);
      refetchDiscussions();
    }
  });

  const togglePinMutation = useMutation({
    mutationFn: async ({ id, isPinned }: { id: string; isPinned: boolean }) => {
      const res = await api.put(`/discussions/${id}`, { isPinned });
      return res.data;
    },
    onSuccess: () => refetchDiscussions()
  });

  const toggleResolveMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/discussions/${id}/resolve`, {});
      return res.data;
    },
    onSuccess: () => {
      refetchDiscussions();
      if (selectedDiscussion) {
        setSelectedDiscussion({
          ...selectedDiscussion,
          isResolved: !selectedDiscussion.isResolved
        });
      }
    }
  });

  // Comment Mutation (Supports Threaded Parent Comment ID)
  const postCommentMutation = useMutation({
    mutationFn: async ({
      discussionId,
      content,
      parentId
    }: {
      discussionId: string;
      content: string;
      parentId?: string;
    }) => {
      const res = await api.post(`/discussions/${discussionId}/comments`, {
        content,
        parentId
      });
      return res.data;
    },
    onSuccess: (comment: any) => {
      setNewComment('');
      setReplyContent('');
      setReplyingToCommentId(null);
      if (selectedDiscussion) {
        // If it was a reply, append to parents' replies or comments array
        refetchDiscussions().then(() => {
          api.get<any>(`/discussions/${selectedDiscussion.id}`).then((res) => {
            if (res.data) setSelectedDiscussion(res.data);
          });
        });
      }
    }
  });

  // Reaction Mutation
  const reactMutation = useMutation({
    mutationFn: async ({ commentId, emoji }: { commentId: string; emoji: string }) => {
      const res = await api.post(`/discussions/comments/${commentId}/reactions`, { emoji });
      return res.data;
    },
    onSuccess: () => {
      if (selectedDiscussion) {
        api.get<any>(`/discussions/${selectedDiscussion.id}`).then((res) => {
          if (res.data) setSelectedDiscussion(res.data);
        });
      }
    }
  });

  // RFC Mutations
  const createRFCMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/discussions/rfcs', {
        workspaceId,
        projectId: projectId && projectId !== 'ALL' ? projectId : undefined,
        title: rfcTitle,
        category: rfcCategory,
        problemStatement: rfcProblem,
        motivation: rfcMotivation,
        proposedSolution: rfcSolution,
        technicalArchitecture: rfcTechArch,
        securityConsiderations: rfcSecurity,
        performanceConsiderations: rfcPerformance
      });
      return res.data;
    },
    onSuccess: () => {
      setRfcTitle('');
      setRfcProblem('');
      setRfcMotivation('');
      setRfcSolution('');
      setRfcTechArch('');
      setRfcSecurity('');
      setRfcPerformance('');
      setIsCreateRFCOpen(false);
      refetchRFCs();
    }
  });

  const voteRFCMutation = useMutation({
    mutationFn: async ({ rfcId, vote }: { rfcId: string; vote: 'APPROVE' | 'REJECT' | 'ABSTAIN' }) => {
      const res = await api.post(`/discussions/rfcs/${rfcId}/vote`, { vote });
      return res.data;
    },
    onSuccess: (updatedRFC: any) => {
      setSelectedRFC(updatedRFC);
      refetchRFCs();
    }
  });

  const reviewRFCMutation = useMutation({
    mutationFn: async ({
      rfcId,
      status,
      comments
    }: {
      rfcId: string;
      status: string;
      comments: string;
    }) => {
      const res = await api.post(`/discussions/rfcs/${rfcId}/reviews`, { status, comments });
      return res.data;
    },
    onSuccess: (updatedRFC: any) => {
      setReviewComments('');
      setSelectedRFC(updatedRFC);
      refetchRFCs();
    }
  });

  // ADR Mutation
  const createADRMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/discussions/decisions', {
        workspaceId,
        projectId: projectId && projectId !== 'ALL' ? projectId : undefined,
        rfcId: selectedRFC?.id,
        title: adrTitle,
        context: adrContext,
        decision: adrDecision,
        consequences: adrConsequences,
        alternativesConsidered: adrAlternatives
      });
      return res.data;
    },
    onSuccess: () => {
      setAdrTitle('');
      setAdrContext('');
      setAdrDecision('');
      setAdrConsequences('');
      setAdrAlternatives('');
      setIsCreateADROpen(false);
      refetchADRs();
    }
  });

  return (
    <div className="space-y-6">
      {/* 1. Header Banner & Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div>
          <h2 className="text-base font-semibold text-foreground flex items-center gap-2">
            <MessageSquare className="h-5 w-5 text-primary" />
            <span>Discussions & Architecture Decision Log</span>
          </h2>
          <p className="text-xs text-foreground-muted mt-1">
            RFC proposals, technical architecture signoffs, threaded discussions, and formal ADR records.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'discussions' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsStartDiscussionOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Start Discussion</span>
            </Button>
          )}

          {activeTab === 'rfcs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateRFCOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <FileCode className="h-3.5 w-3.5" />
              <span>Submit RFC Proposal</span>
            </Button>
          )}

          {activeTab === 'adrs' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateADROpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Award className="h-3.5 w-3.5" />
              <span>Record ADR</span>
            </Button>
          )}
        </div>
      </div>

      {/* 2. Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3 flex-wrap gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab('discussions')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'discussions'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <MessageCircle className="h-4 w-4" />
            <span>Discussions ({discussions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('rfcs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'rfcs'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <FileCode className="h-4 w-4" />
            <span>RFC Proposals ({rfcs.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('adrs')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              activeTab === 'adrs'
                ? 'bg-primary text-white shadow-xs'
                : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <Award className="h-4 w-4" />
            <span>Decisions / ADR ({adrs.length})</span>
          </button>
        </div>

        {/* Search & Category Filter for Discussions */}
        {activeTab === 'discussions' && (
          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative w-48 sm:w-60">
              <Search className="h-3.5 w-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-foreground-muted" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search topics..."
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
                  {cat.replace(/_/g, ' ')}
                </option>
              ))}
            </select>

            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value as any)}
              className="h-8 px-2 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
            >
              <option value="ALL">All Status</option>
              <option value="OPEN">Open Only</option>
              <option value="RESOLVED">Resolved</option>
            </select>
          </div>
        )}
      </div>

      {/* 3. TAB 1: Discussions View */}
      {activeTab === 'discussions' && (
        <div className="space-y-4">
          {isDiscussionsLoading ? (
            <div className="p-12 text-center text-xs text-foreground-muted bg-card rounded-xl border border-border">
              <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              <span>Loading engineering discussions...</span>
            </div>
          ) : isDiscussionsError ? (
            <div className="p-8 text-center text-xs text-destructive bg-destructive/10 rounded-xl border border-destructive/20">
              Failed to load discussions. Verify server connection.
            </div>
          ) : discussions.length === 0 ? (
            <div className="p-16 text-center bg-card rounded-xl border border-dashed border-border space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <MessageSquare className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No discussions started</h3>
              <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                Start an asynchronous debate, propose an architectural change, or seek consensus from the team.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsStartDiscussionOpen(true)}
                className="text-xs"
              >
                Start First Discussion
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {discussions.map((d: any) => (
                <Card
                  key={d.id}
                  className={`border-border bg-card hover:border-primary/50 transition-colors shadow-xs ${
                    d.isPinned ? 'border-primary/30 bg-primary/5' : ''
                  }`}
                >
                  <CardContent className="p-4 space-y-2.5">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-2 flex-wrap">
                        {d.isPinned && (
                          <Badge variant="info" className="text-[10px] gap-1">
                            <Pin className="h-3 w-3" /> Pinned
                          </Badge>
                        )}
                        <Badge variant="secondary" className="text-[10px] font-mono">
                          {d.category?.replace(/_/g, ' ')}
                        </Badge>
                        {d.isResolved ? (
                          <Badge variant="success" className="text-[10px] gap-1">
                            <CheckCircle2 className="h-3 w-3" /> Resolved
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-[10px]">
                            Open
                          </Badge>
                        )}
                        <span className="text-[11px] text-foreground-muted">
                          {d.project?.name || 'Workspace'}
                        </span>
                      </div>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => togglePinMutation.mutate({ id: d.id, isPinned: !d.isPinned })}
                          className={`p-1 hover:text-primary transition-colors ${
                            d.isPinned ? 'text-primary' : 'text-foreground-muted'
                          }`}
                          title={d.isPinned ? 'Unpin' : 'Pin to top'}
                        >
                          <Pin className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => toggleResolveMutation.mutate(d.id)}
                          className={`p-1 hover:text-emerald-500 transition-colors ${
                            d.isResolved ? 'text-emerald-500' : 'text-foreground-muted'
                          }`}
                          title={d.isResolved ? 'Reopen' : 'Mark Resolved'}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>

                    <div
                      onClick={() => setSelectedDiscussion(d)}
                      className="cursor-pointer group"
                    >
                      <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                        {d.title}
                      </h3>
                      <p className="text-xs text-foreground-muted mt-1 line-clamp-2 leading-relaxed">
                        {d.content}
                      </p>
                    </div>

                    {/* Footer info */}
                    <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-2 border-t border-border">
                      <div className="flex items-center gap-2">
                        <span>By {d.author?.name || 'Engineer'}</span>
                        <span>•</span>
                        <span>{new Date(d.createdAt).toLocaleDateString()}</span>
                      </div>

                      <button
                        onClick={() => setSelectedDiscussion(d)}
                        className="flex items-center gap-1 hover:text-primary transition-colors font-medium"
                      >
                        <MessageSquare className="h-3.5 w-3.5" />
                        <span>{d.comments?.length || 0} comments</span>
                      </button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. TAB 2: RFC Proposals */}
      {activeTab === 'rfcs' && (
        <div className="space-y-4">
          {isRFCsLoading ? (
            <div className="p-12 text-center text-xs text-foreground-muted bg-card rounded-xl border border-border">
              <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              <span>Loading RFC proposals...</span>
            </div>
          ) : rfcs.length === 0 ? (
            <div className="p-16 text-center bg-card rounded-xl border border-dashed border-border space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <FileCode className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No RFC proposals submitted</h3>
              <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                Draft a Request For Comments to propose major technical, security, or architectural upgrades.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateRFCOpen(true)}
                className="text-xs"
              >
                Submit First RFC
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {rfcs.map((rfc: any) => {
                const totalVotes = rfc.votes?.length || 0;
                const approveVotes = rfc.votes?.filter((v: any) => v.vote === 'APPROVE').length || 0;
                const consensusPct = totalVotes > 0 ? Math.round((approveVotes / totalVotes) * 100) : 0;

                return (
                  <Card
                    key={rfc.id}
                    className="border-border bg-card hover:border-primary/50 transition-colors shadow-xs"
                  >
                    <CardContent className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="info" className="text-[10px] font-mono">
                            RFC #{rfc.rfcNumber}
                          </Badge>
                          <Badge
                            variant={
                              rfc.status === 'ACCEPTED'
                                ? 'success'
                                : rfc.status === 'UNDER_REVIEW'
                                ? 'info'
                                : 'outline'
                            }
                            className="text-[10px]"
                          >
                            {rfc.status?.replace(/_/g, ' ')}
                          </Badge>
                        </div>
                        <span className="text-[10px] text-foreground-muted font-mono">
                          v{rfc.version}
                        </span>
                      </div>

                      <div
                        onClick={() => setSelectedRFC(rfc)}
                        className="cursor-pointer group space-y-1"
                      >
                        <h3 className="text-sm font-semibold text-foreground group-hover:text-primary transition-colors">
                          {rfc.title}
                        </h3>
                        <p className="text-xs text-foreground-muted line-clamp-2 leading-relaxed">
                          {rfc.problemStatement}
                        </p>
                      </div>

                      {/* Consensus Meter */}
                      <div className="space-y-1.5 pt-1">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="text-foreground-muted flex items-center gap-1">
                            <TrendingUp className="h-3 w-3 text-primary" /> Consensus
                          </span>
                          <span className="font-mono font-semibold text-foreground">
                            {consensusPct}% ({approveVotes}/{totalVotes} Approved)
                          </span>
                        </div>
                        <Progress value={consensusPct} className="h-1.5" />
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-2 border-t border-border">
                        <span>By {rfc.author?.name || 'Architect'}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRFC(rfc)}
                          className="text-xs h-7 gap-1"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          <span>Review & Vote</span>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 3: Architecture Decision Records (ADR) */}
      {activeTab === 'adrs' && (
        <div className="space-y-4">
          {isADRsLoading ? (
            <div className="p-12 text-center text-xs text-foreground-muted bg-card rounded-xl border border-border">
              <Clock className="h-5 w-5 animate-spin mx-auto mb-2 text-primary" />
              <span>Loading Architecture Decision Records...</span>
            </div>
          ) : adrs.length === 0 ? (
            <div className="p-16 text-center bg-card rounded-xl border border-dashed border-border space-y-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
                <Award className="h-6 w-6" />
              </div>
              <h3 className="text-sm font-semibold text-foreground">No Architecture Decisions recorded</h3>
              <p className="text-xs text-foreground-muted max-w-sm mx-auto">
                Document critical technology selections, tradeoffs, and consequences as immutable ADRs.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateADROpen(true)}
                className="text-xs"
              >
                Record First ADR
              </Button>
            </div>
          ) : (
            <div className="space-y-3">
              {adrs.map((adr: any) => (
                <Card key={adr.id} className="border-border bg-card shadow-xs">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <Badge variant="info" className="text-[10px] font-mono">
                          ADR-{String(adr.decisionNumber).padStart(3, '0')}
                        </Badge>
                        <Badge variant="success" className="text-[10px]">
                          {adr.status}
                        </Badge>
                      </div>
                      <span className="text-[10px] text-foreground-muted">
                        Approved {new Date(adr.approvedAt || adr.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <div>
                      <h3 className="text-sm font-bold text-foreground">{adr.title}</h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-lg bg-background-secondary border border-border space-y-1">
                        <span className="font-semibold text-foreground block text-[11px] uppercase tracking-wider">
                          Context & Problem
                        </span>
                        <p className="text-foreground-muted leading-relaxed">{adr.context}</p>
                      </div>

                      <div className="p-3 rounded-lg bg-primary/5 border border-primary/20 space-y-1">
                        <span className="font-semibold text-primary block text-[11px] uppercase tracking-wider">
                          Decision
                        </span>
                        <p className="text-foreground leading-relaxed font-medium">{adr.decision}</p>
                      </div>
                    </div>

                    <div className="text-xs space-y-1 pt-1">
                      <span className="font-semibold text-foreground-muted text-[11px] uppercase tracking-wider">
                        Consequences & Tradeoffs
                      </span>
                      <p className="text-foreground-muted leading-relaxed">{adr.consequences}</p>
                    </div>

                    <div className="flex items-center justify-between text-[11px] text-foreground-muted pt-2 border-t border-border">
                      <span>Approved by: {adr.approvedBy?.name || 'Chief Architect'}</span>
                      {adr.rfc && (
                        <span className="font-mono text-primary">Linked RFC #{adr.rfc.rfcNumber}</span>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}

      {/* DIALOG 1: Start Discussion */}
      <Dialog
        isOpen={isStartDiscussionOpen}
        onClose={() => setIsStartDiscussionOpen(false)}
        title="Start Engineering Discussion"
        description="Initiate an asynchronous technical discussion or architectural debate."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Discussion Title
            </label>
            <Input
              value={discTitle}
              onChange={(e) => setDiscTitle(e.target.value)}
              placeholder="e.g. Migration to Redis Cluster for Distributed Session Cache"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Category
              </label>
              <select
                value={discCategory}
                onChange={(e) => setDiscCategory(e.target.value)}
                className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground focus:ring-1 focus:ring-primary shadow-xs font-medium"
              >
                {CATEGORIES.filter((c) => c !== 'ALL').map((cat) => (
                  <option key={cat} value={cat}>
                    {cat.replace(/_/g, ' ')}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1.5">
                Tags (Comma-separated)
              </label>
              <Input
                value={discTags}
                onChange={(e) => setDiscTags(e.target.value)}
                placeholder="Cache, Redis, Infrastructure"
                className="h-9 text-xs"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1.5">
              Topic Content & Context
            </label>
            <Textarea
              value={discContent}
              onChange={(e) => setDiscContent(e.target.value)}
              placeholder="Provide background, proposed solutions, benchmarks, and questions for team review..."
              rows={5}
              className="text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsStartDiscussionOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => startDiscussionMutation.mutate()}
              disabled={!discTitle.trim() || !discContent.trim()}
              className="text-xs"
            >
              Publish Topic
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 2: Threaded Discussion Detail View */}
      <Dialog
        isOpen={!!selectedDiscussion}
        onClose={() => setSelectedDiscussion(null)}
        title={selectedDiscussion?.title || 'Discussion Thread'}
        description={`Category: ${selectedDiscussion?.category?.replace(/_/g, ' ')} • By: ${selectedDiscussion?.author?.name || 'Engineer'}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2">
          {/* Main post */}
          <div className="p-4 rounded-xl bg-background-secondary border border-border space-y-2">
            <p className="text-xs text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedDiscussion?.content}
            </p>
            <div className="flex items-center justify-between text-[10px] text-foreground-muted pt-2 border-t border-border">
              <span>Published {new Date(selectedDiscussion?.createdAt).toLocaleString()}</span>
              {selectedDiscussion?.isResolved && (
                <Badge variant="success" className="text-[10px]">
                  Resolved
                </Badge>
              )}
            </div>
          </div>

          {/* Comments list */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5 text-primary" />
              <span>Replies & Threaded Feedback ({selectedDiscussion?.comments?.length || 0})</span>
            </h4>

            <div className="space-y-2.5 max-h-[40vh] overflow-y-auto pr-1">
              {selectedDiscussion?.comments?.length === 0 ? (
                <p className="text-xs text-foreground-muted italic py-3 text-center">
                  No replies yet. Be the first to share your technical feedback!
                </p>
              ) : (
                selectedDiscussion?.comments?.map((comment: any) => (
                  <div
                    key={comment.id}
                    className={`p-3 rounded-lg border text-xs space-y-1.5 transition-colors ${
                      comment.parentId
                        ? 'ml-6 bg-background-secondary/40 border-border/60'
                        : 'bg-card border-border'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {comment.author?.name || 'Engineer'}
                        </span>
                        <span className="text-[10px] text-foreground-muted">
                          {new Date(comment.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      {/* Reply button */}
                      <button
                        onClick={() => setReplyingToCommentId(comment.id)}
                        className="text-[10px] text-primary hover:underline flex items-center gap-1"
                      >
                        <CornerDownRight className="h-3 w-3" /> Reply
                      </button>
                    </div>

                    <p className="text-foreground-secondary leading-relaxed">{comment.content}</p>

                    {/* Reactions Bar */}
                    <div className="flex items-center gap-2 pt-1">
                      {['👍', '❤️', '🚀', '👀'].map((emoji) => (
                        <button
                          key={emoji}
                          onClick={() => reactMutation.mutate({ commentId: comment.id, emoji })}
                          className="px-1.5 py-0.5 rounded bg-background-secondary border border-border text-[11px] hover:border-primary transition-colors"
                        >
                          {emoji}
                        </button>
                      ))}
                    </div>

                    {/* Inline reply box if actively replying */}
                    {replyingToCommentId === comment.id && (
                      <div className="pt-2 flex items-center gap-2">
                        <Input
                          value={replyContent}
                          onChange={(e) => setReplyContent(e.target.value)}
                          placeholder="Write a direct reply..."
                          className="h-8 text-xs flex-1"
                          autoFocus
                        />
                        <Button
                          size="sm"
                          variant="primary"
                          onClick={() =>
                            postCommentMutation.mutate({
                              discussionId: selectedDiscussion.id,
                              content: replyContent,
                              parentId: comment.id
                            })
                          }
                          disabled={!replyContent.trim()}
                          className="h-8 text-xs"
                        >
                          Send
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setReplyingToCommentId(null)}
                          className="h-8 text-xs"
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>

          {/* New comment input */}
          <div className="pt-2 space-y-2 border-t border-border">
            <Textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="Leave a comment or review note..."
              rows={3}
              className="text-xs"
            />
            <div className="flex justify-between items-center">
              <Button
                variant="outline"
                size="sm"
                onClick={() => toggleResolveMutation.mutate(selectedDiscussion.id)}
                className="text-xs gap-1"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-500" />
                <span>{selectedDiscussion?.isResolved ? 'Reopen Topic' : 'Resolve Thread'}</span>
              </Button>

              <Button
                variant="primary"
                size="sm"
                onClick={() =>
                  postCommentMutation.mutate({
                    discussionId: selectedDiscussion.id,
                    content: newComment
                  })
                }
                disabled={!newComment.trim()}
                className="text-xs gap-1.5 shadow-xs"
              >
                <Send className="h-3.5 w-3.5" />
                <span>Post Reply</span>
              </Button>
            </div>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 3: Submit RFC Proposal */}
      <Dialog
        isOpen={isCreateRFCOpen}
        onClose={() => setIsCreateRFCOpen(false)}
        title="Submit RFC Architecture Proposal"
        description="Formal proposal for review, consensus voting, and engineering signoff."
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              RFC Title
            </label>
            <Input
              value={rfcTitle}
              onChange={(e) => setRfcTitle(e.target.value)}
              placeholder="e.g. Migration from REST to gRPC for Internal East-West RPCs"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Category
            </label>
            <select
              value={rfcCategory}
              onChange={(e) => setRfcCategory(e.target.value)}
              className="w-full h-9 px-2.5 rounded-lg border border-border bg-card text-xs text-foreground font-medium"
            >
              <option value="ARCHITECTURE">Architecture</option>
              <option value="TECHNICAL_DESIGN">Technical Design</option>
              <option value="DATABASE_DESIGN">Database Design</option>
              <option value="API_DESIGN">API Design</option>
              <option value="SECURITY">Security & Compliance</option>
              <option value="INFRASTRUCTURE">Infrastructure & DevOps</option>
            </select>
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Problem Statement
            </label>
            <Textarea
              value={rfcProblem}
              onChange={(e) => setRfcProblem(e.target.value)}
              placeholder="Describe the technical bottleneck, limitation, or compliance requirement..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Motivation & Business Justification
            </label>
            <Textarea
              value={rfcMotivation}
              onChange={(e) => setRfcMotivation(e.target.value)}
              placeholder="Why is this change necessary? What happens if we do nothing?"
              rows={2}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Proposed Solution & Technical Design
            </label>
            <Textarea
              value={rfcSolution}
              onChange={(e) => setRfcSolution(e.target.value)}
              placeholder="Detailed architecture, component breakdown, and migration phases..."
              rows={4}
              className="text-xs"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Security Considerations
              </label>
              <Input
                value={rfcSecurity}
                onChange={(e) => setRfcSecurity(e.target.value)}
                placeholder="mTLS, IAM permissions, encryption..."
                className="h-8 text-xs"
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-foreground block mb-1">
                Performance Impact
              </label>
              <Input
                value={rfcPerformance}
                onChange={(e) => setRfcPerformance(e.target.value)}
                placeholder="p99 latency, CPU, memory footprint..."
                className="h-8 text-xs"
              />
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateRFCOpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createRFCMutation.mutate()}
              disabled={!rfcTitle.trim() || !rfcProblem.trim() || !rfcSolution.trim()}
              className="text-xs"
            >
              Submit RFC for Review
            </Button>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 4: RFC Detail, Voting & Review Modal */}
      <Dialog
        isOpen={!!selectedRFC}
        onClose={() => setSelectedRFC(null)}
        title={selectedRFC ? `RFC #${selectedRFC.rfcNumber}: ${selectedRFC.title}` : 'RFC Proposal'}
        description={`Category: ${selectedRFC?.category} • Status: ${selectedRFC?.status} • Version: v${selectedRFC?.version}`}
        maxWidth="2xl"
      >
        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          {/* Problem & Motivation */}
          <div className="p-3 bg-background-secondary rounded-lg border border-border space-y-1.5 text-xs">
            <span className="font-semibold text-foreground block uppercase tracking-wider text-[10px]">
              Problem Statement
            </span>
            <p className="text-foreground-muted leading-relaxed">{selectedRFC?.problemStatement}</p>
          </div>

          {/* Proposed Solution */}
          <div className="p-3 bg-primary/5 rounded-lg border border-primary/20 space-y-1.5 text-xs">
            <span className="font-semibold text-primary block uppercase tracking-wider text-[10px]">
              Proposed Solution
            </span>
            <p className="text-foreground leading-relaxed whitespace-pre-wrap">
              {selectedRFC?.proposedSolution}
            </p>
          </div>

          {/* Voting Widget */}
          <div className="p-4 bg-card rounded-xl border border-border space-y-3">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <ThumbsUp className="h-4 w-4 text-primary" />
                <span>Engineering Consensus Vote</span>
              </h4>
              <Badge variant="outline" className="text-[10px]">
                {selectedRFC?.votes?.length || 0} Votes Recorded
              </Badge>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => voteRFCMutation.mutate({ rfcId: selectedRFC.id, vote: 'APPROVE' })}
                className="text-xs flex-1 border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10 gap-1.5"
              >
                <Check className="h-3.5 w-3.5" />
                <span>Approve Proposal</span>
              </Button>

              <Button
                variant="outline"
                size="sm"
                onClick={() => voteRFCMutation.mutate({ rfcId: selectedRFC.id, vote: 'REJECT' })}
                className="text-xs flex-1 border-rose-500/30 text-rose-600 hover:bg-rose-500/10 gap-1.5"
              >
                <X className="h-3.5 w-3.5" />
                <span>Reject</span>
              </Button>

              <Button
                variant="ghost"
                size="sm"
                onClick={() => voteRFCMutation.mutate({ rfcId: selectedRFC.id, vote: 'ABSTAIN' })}
                className="text-xs"
              >
                Abstain
              </Button>
            </div>
          </div>

          {/* Formal Reviews */}
          <div className="space-y-3 pt-2 border-t border-border">
            <h4 className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Shield className="h-3.5 w-3.5 text-primary" />
              <span>Review Signoffs ({selectedRFC?.reviews?.length || 0})</span>
            </h4>

            {selectedRFC?.reviews?.map((r: any) => (
              <div
                key={r.id}
                className="p-3 bg-background-secondary rounded-lg border border-border text-xs flex items-center justify-between"
              >
                <div>
                  <span className="font-semibold text-foreground">{r.reviewer?.name || 'Reviewer'}</span>
                  {r.comments && <p className="text-foreground-muted mt-0.5">{r.comments}</p>}
                </div>
                <Badge
                  variant={r.status === 'APPROVED' ? 'success' : 'outline'}
                  className="text-[10px]"
                >
                  {r.status}
                </Badge>
              </div>
            ))}

            {/* Submit Review */}
            <div className="p-3 bg-card rounded-lg border border-border space-y-2">
              <span className="text-xs font-semibold text-foreground block">
                Submit Architecture Review Signoff
              </span>
              <Input
                value={reviewComments}
                onChange={(e) => setReviewComments(e.target.value)}
                placeholder="Review comments or required adjustments..."
                className="h-8 text-xs"
              />
              <div className="flex justify-end gap-2 pt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    reviewRFCMutation.mutate({
                      rfcId: selectedRFC.id,
                      status: 'REQUEST_CHANGES',
                      comments: reviewComments
                    })
                  }
                  className="text-xs text-amber-600"
                >
                  Request Changes
                </Button>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() =>
                    reviewRFCMutation.mutate({
                      rfcId: selectedRFC.id,
                      status: 'APPROVED',
                      comments: reviewComments
                    })
                  }
                  className="text-xs"
                >
                  Sign Off (Approve)
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Dialog>

      {/* DIALOG 5: Record Architecture Decision (ADR) */}
      <Dialog
        isOpen={isCreateADROpen}
        onClose={() => setIsCreateADROpen(false)}
        title="Record Architecture Decision (ADR)"
        description="Formalize an accepted technical decision and persist consequences."
        maxWidth="lg"
      >
        <div className="space-y-4 pt-2 max-h-[70vh] overflow-y-auto pr-1">
          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Decision Title
            </label>
            <Input
              value={adrTitle}
              onChange={(e) => setAdrTitle(e.target.value)}
              placeholder="e.g. ADR: Adoption of Kafka Event Sourcing for Core Payment Ledger"
              className="h-9 text-xs"
              autoFocus
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Context & Business Need
            </label>
            <Textarea
              value={adrContext}
              onChange={(e) => setAdrContext(e.target.value)}
              placeholder="Why was this decision required? What constraints were present?"
              rows={3}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Decision Taken
            </label>
            <Textarea
              value={adrDecision}
              onChange={(e) => setAdrDecision(e.target.value)}
              placeholder="State the exact architecture, database, or library selected..."
              rows={3}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Consequences & Tradeoffs
            </label>
            <Textarea
              value={adrConsequences}
              onChange={(e) => setAdrConsequences(e.target.value)}
              placeholder="What are the operational impacts, benefits, and negative tradeoffs?"
              rows={3}
              className="text-xs"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-foreground block mb-1">
              Alternatives Considered
            </label>
            <Input
              value={adrAlternatives}
              onChange={(e) => setAdrAlternatives(e.target.value)}
              placeholder="Direct relational updates, MongoDB, etc."
              className="h-8 text-xs"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-border">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setIsCreateADROpen(false)}
              className="text-xs"
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => createADRMutation.mutate()}
              disabled={!adrTitle.trim() || !adrDecision.trim()}
              className="text-xs"
            >
              Record Decision
            </Button>
          </div>
        </div>
      </Dialog>
    </div>
  );
}
