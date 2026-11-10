'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLayoutStore } from '../../stores/useLayoutStore';
import { AppSidebar } from '../../components/layout/AppSidebar';
import { AppHeader } from '../../components/layout/AppHeader';

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const { initAuth, isAuthenticated, isLoading } = useAuthStore();
  const { initLayout } = useLayoutStore();

  const activeProjectId = (params?.projectId as string) || undefined;

  useEffect(() => {
    initLayout();
    initAuth().then(() => {
      const token = localStorage.getItem('devblueprint_token');
      if (!token) {
        router.replace('/login');
      }
    });
  }, [initAuth, initLayout, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-background text-foreground-muted text-xs">
        Loading workspace...
      </div>
    );
  }

  // Derive breadcrumbs
  const breadcrumbs: Array<{ label: string; href?: string }> = [];
  if (pathname.includes('/projects')) {
    breadcrumbs.push({ label: 'Projects', href: '/projects' });
  } else if (pathname.includes('/inbox')) {
    breadcrumbs.push({ label: 'Inbox', href: '/inbox' });
  } else if (pathname.includes('/my-tasks')) {
    breadcrumbs.push({ label: 'My Tasks', href: '/my-tasks' });
  } else if (pathname.includes('/my-time')) {
    breadcrumbs.push({ label: 'My Time', href: '/my-time' });
  } else if (pathname.includes('/boards')) {
    breadcrumbs.push({ label: 'My Boards', href: '/boards' });
  } else if (pathname.includes('/backlog')) {
    breadcrumbs.push({ label: 'Backlog', href: '/backlog' });
  } else if (pathname.includes('/sprints')) {
    breadcrumbs.push({ label: 'Sprints', href: '/sprints' });
  } else if (pathname.includes('/bugs')) {
    breadcrumbs.push({ label: 'Issues & Bugs', href: '/bugs' });
  } else if (pathname.includes('/roadmaps')) {
    breadcrumbs.push({ label: 'Roadmaps', href: '/roadmaps' });
  } else if (pathname.includes('/milestones')) {
    breadcrumbs.push({ label: 'Milestones', href: '/milestones' });
  } else if (pathname.includes('/calendar')) {
    breadcrumbs.push({ label: 'Calendar', href: '/calendar' });
  } else if (pathname.includes('/portfolios')) {
    breadcrumbs.push({ label: 'Portfolios', href: '/portfolios' });
  } else if (pathname.includes('/testing')) {
    breadcrumbs.push({ label: 'Testing & QA', href: '/testing' });
  } else if (pathname.includes('/releases')) {
    breadcrumbs.push({ label: 'Releases', href: '/releases' });
  } else if (pathname.includes('/discussions')) {
    breadcrumbs.push({ label: 'Discussions', href: '/discussions' });
  } else if (pathname.includes('/reports')) {
    breadcrumbs.push({ label: 'Reports', href: '/reports' });
  } else if (pathname.includes('/risks')) {
    breadcrumbs.push({ label: 'Risks', href: '/risks' });
  } else if (pathname.includes('/design')) {
    breadcrumbs.push({ label: 'Design System', href: '/design' });
  } else if (pathname.includes('/development')) {
    breadcrumbs.push({ label: 'Development', href: '/development' });
  } else if (pathname.includes('/files')) {
    breadcrumbs.push({ label: 'Files', href: '/files' });
  } else if (pathname.includes('/integrations')) {
    breadcrumbs.push({ label: 'Integrations', href: '/integrations' });
  } else if (pathname.includes('/audit-logs')) {
    breadcrumbs.push({ label: 'Audit Logs', href: '/audit-logs' });
  } else if (pathname.includes('/templates')) {
    breadcrumbs.push({ label: 'Templates', href: '/templates' });
  } else if (pathname.includes('/team')) {
    breadcrumbs.push({ label: 'Team', href: '/team' });
  } else if (pathname.includes('/settings')) {
    breadcrumbs.push({ label: 'Settings', href: '/settings' });
  } else {
    breadcrumbs.push({ label: 'Dashboard', href: '/dashboard' });
  }

  return (
    <div className="w-full h-[100dvh] overflow-hidden bg-background text-foreground transition-colors flex">
      {/* Mobile Drawer Left Sidebar */}
      <AppSidebar isMobileDrawer activeProjectId={activeProjectId} />

      {/* Desktop Left Sidebar + Resize Handle */}
      <AppSidebar activeProjectId={activeProjectId} />

      {/* Main Application Area (Flexible Viewport: Top Nav + Content) */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden bg-background">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main
          className={`flex-1 w-full min-w-0 min-h-0 ${
            pathname.includes('/docs/') ? 'overflow-hidden' : 'overflow-y-auto'
          } bg-background-secondary/60 transition-colors`}
        >
          {children}
        </main>
      </div>
    </div>
  );
}
