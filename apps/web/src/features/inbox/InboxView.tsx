'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useNotifications, NotificationItem } from '../../hooks/useNotifications';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';
import {
  Inbox,
  CheckCircle2,
  Clock,
  MessageSquare,
  FileText,
  Target,
  Rocket,
  CheckSquare,
  ShieldCheck,
  Check,
  ArrowRight,
  Filter
} from 'lucide-react';

export function InboxView() {
  const { notifications, unreadCount, isLoading, markAsRead, markAllAsRead, isMarkingRead } =
    useNotifications();
  const [filterType, setFilterType] = useState<string>('ALL');

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'task_assignment':
        return <CheckSquare className="h-4 w-4 text-blue-500 shrink-0" />;
      case 'mention':
        return <MessageSquare className="h-4 w-4 text-amber-500 shrink-0" />;
      case 'comment':
        return <MessageSquare className="h-4 w-4 text-emerald-500 shrink-0" />;
      case 'review_request':
        return <FileText className="h-4 w-4 text-purple-500 shrink-0" />;
      case 'approval_request':
        return <ShieldCheck className="h-4 w-4 text-indigo-500 shrink-0" />;
      case 'milestone':
        return <Target className="h-4 w-4 text-rose-500 shrink-0" />;
      case 'project_update':
        return <Rocket className="h-4 w-4 text-cyan-500 shrink-0" />;
      default:
        return <Inbox className="h-4 w-4 text-foreground-muted shrink-0" />;
    }
  };

  const filtered = notifications.filter((n) => {
    if (filterType === 'UNREAD') return !n.isRead;
    if (filterType === 'ASSIGNMENTS') return n.type === 'task_assignment';
    if (filterType === 'MENTIONS') return n.type === 'mention' || n.type === 'comment';
    if (filterType === 'APPROVALS') return n.type === 'approval_request' || n.type === 'review_request';
    return true;
  });

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Inbox className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-foreground">Inbox & Notifications</h1>
              {unreadCount > 0 && (
                <Badge variant="default" className="text-xs">
                  {unreadCount} unread
                </Badge>
              )}
            </div>
            <p className="text-xs text-foreground-muted">
              Assignments, review requests, mentions, milestone alerts, and project updates
            </p>
          </div>
        </div>

        {unreadCount > 0 && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => markAllAsRead()}
            isLoading={isMarkingRead}
            className="text-xs gap-1.5 self-start sm:self-auto"
          >
            <Check className="h-3.5 w-3.5" />
            <span>Mark all as read</span>
          </Button>
        )}
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs">
        {[
          { id: 'ALL', label: 'All', count: notifications.length },
          { id: 'UNREAD', label: 'Unread', count: unreadCount },
          {
            id: 'ASSIGNMENTS',
            label: 'Task Assignments',
            count: notifications.filter((n) => n.type === 'task_assignment').length
          },
          {
            id: 'MENTIONS',
            label: 'Mentions & Comments',
            count: notifications.filter((n) => n.type === 'mention' || n.type === 'comment').length
          },
          {
            id: 'APPROVALS',
            label: 'Approvals & Reviews',
            count: notifications.filter(
              (n) => n.type === 'approval_request' || n.type === 'review_request'
            ).length
          }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterType(tab.id)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap ${
              filterType === tab.id
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
            }`}
          >
            <span>{tab.label}</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-background-tertiary text-foreground-muted">
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Notifications List */}
      <div className="space-y-2">
        {isLoading ? (
          <div className="py-12 text-center text-xs text-foreground-muted">Loading inbox...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center rounded-xl border border-dashed border-border bg-card space-y-2">
            <CheckCircle2 className="h-8 w-8 text-success mx-auto" />
            <h3 className="text-sm font-semibold text-foreground">You are all caught up!</h3>
            <p className="text-xs text-foreground-muted max-w-sm mx-auto">
              No notifications matching this filter. New assignments, reviews, and project updates will appear here.
            </p>
          </div>
        ) : (
          filtered.map((notif) => (
            <div
              key={notif.id}
              className={`p-4 rounded-xl border transition-colors flex items-start justify-between gap-4 ${
                !notif.isRead
                  ? 'border-primary/40 bg-primary/5 shadow-xs'
                  : 'border-border bg-card hover:bg-background-secondary/60'
              }`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-background border border-border mt-0.5">
                  {getTypeIcon(notif.type)}
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-foreground">{notif.title}</span>
                    {!notif.isRead && (
                      <span className="h-2 w-2 rounded-full bg-primary shrink-0" title="Unread" />
                    )}
                    <span className="text-[10px] text-foreground-muted">
                      {new Date(notif.createdAt).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </span>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {notif.message}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {!notif.isRead && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => markAsRead(notif.id)}
                    className="text-xs h-7 px-2 text-foreground-muted hover:text-foreground"
                    title="Mark as read"
                  >
                    <Check className="h-3.5 w-3.5" />
                  </Button>
                )}
                {notif.link && (
                  <Link href={notif.link}>
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => !notif.isRead && markAsRead(notif.id)}
                      className="text-xs h-7 px-2.5 gap-1"
                    >
                      <span>View</span>
                      <ArrowRight className="h-3 w-3" />
                    </Button>
                  </Link>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
