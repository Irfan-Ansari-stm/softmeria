'use client';

import React, { useEffect } from 'react';
import { useRouter, useParams, usePathname } from 'next/navigation';
import { useAuthStore } from '../../stores/useAuthStore';
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

  const activeProjectId = (params?.projectId as string) || undefined;

  useEffect(() => {
    initAuth().then(() => {
      const token = localStorage.getItem('devblueprint_token');
      if (!token) {
        router.replace('/login');
      }
    });
  }, [initAuth, router]);

  if (isLoading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-zinc-950 text-zinc-500 text-xs">
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
    <div className="flex h-screen bg-zinc-950 overflow-hidden">
      {/* Left Sidebar */}
      <AppSidebar activeProjectId={activeProjectId} />

      {/* Main Column */}
      <div className="flex-1 flex flex-col min-w-0 h-full overflow-hidden">
        <AppHeader breadcrumbs={breadcrumbs} />
        <main className="flex-1 overflow-y-auto bg-zinc-950">
          {children}
        </main>
      </div>
    </div>
  );
}

