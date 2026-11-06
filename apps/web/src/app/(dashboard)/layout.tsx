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
    <div className="w-full h-[100dvh] overflow-hidden bg-background text-foreground transition-colors grid grid-cols-1 md:grid-cols-[auto_minmax(0,1fr)]">
      {/* Mobile Drawer Left Sidebar (Only mounted on Mobile screens) */}
      <div className="md:hidden">
        <AppSidebar isMobileDrawer activeProjectId={activeProjectId} />
      </div>

      {/* Desktop Left Sidebar (Occupies Column 1 on desktop) */}
      <AppSidebar activeProjectId={activeProjectId} />

      {/* Main Application Area (Occupies Column 2 on desktop: Top Nav + Viewport Workspace) */}
      <div className="grid grid-rows-[auto_minmax(0,1fr)] h-full w-full min-w-0 overflow-hidden bg-background">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="h-full w-full min-w-0 min-h-0 overflow-y-auto bg-background-secondary/60 transition-colors">
          {children}
        </main>
      </div>
    </div>
  );
}
