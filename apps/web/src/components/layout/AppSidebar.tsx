'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Layers,
  LayoutDashboard,
  FolderKanban,
  FileText,
  Bookmark,
  Users,
  Settings,
  Plus,
  ChevronDown,
  ChevronRight,
  CheckCircle2,
  Clock,
  Folder,
  FolderOpen,
  ArrowLeft,
  ChevronsUpDown,
  PanelLeftClose,
  PanelLeftOpen,
  X,
  CreditCard
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLayoutStore } from '../../stores/useLayoutStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Progress } from '../ui/progress';
import { ResizeHandle } from '../ui/ResizeHandle';

interface AppSidebarProps {
  activeProjectId?: string;
  isMobileDrawer?: boolean;
}

export function AppSidebar({ activeProjectId, isMobileDrawer = false }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspaces, currentWorkspace, setCurrentWorkspace } = useAuthStore();
  const {
    sidebarWidth,
    setSidebarWidth,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    resetSidebarWidth,
    isMobileSidebarOpen,
    setMobileSidebarOpen
  } = useLayoutStore();

  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});
  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);

  // If in project, load project categories and docs
  const { data: projectData } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return null;
      const res = await api.get<any>(`/projects/${activeProjectId}`);
      return res.data;
    },
    enabled: !!activeProjectId
  });

  const { data: categoriesTree = [] } = useQuery({
    queryKey: ['categories-tree', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return [];
      const res = await api.get<any[]>(`/projects/${activeProjectId}/categories`);
      return res.data || [];
    },
    enabled: !!activeProjectId
  });

  const toggleCategory = (catId: string) => {
    setCollapsedCategories((prev) => ({ ...prev, [catId]: !prev[catId] }));
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
      case 'APPROVED':
        return <CheckCircle2 className="h-3.5 w-3.5 text-success shrink-0" />;
      case 'IN_PROGRESS':
        return <Clock className="h-3.5 w-3.5 text-primary shrink-0" />;
      case 'IN_REVIEW':
        return <Clock className="h-3.5 w-3.5 text-warning shrink-0" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-foreground-muted shrink-0" />;
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'All Projects', href: '/projects', icon: FolderKanban },
    { label: 'Templates', href: '/templates', icon: Bookmark },
    { label: 'Team Members', href: '/team', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];

  // Handle Resize Delta
  const handleResize = (deltaX: number) => {
    setSidebarWidth(sidebarWidth + deltaX);
  };

  // 1. COLLAPSED DESKTOP NAVIGATION RAIL
  if (isSidebarCollapsed && !isMobileDrawer) {
    return (
      <aside
        className="w-14 border-r border-border bg-background flex flex-col h-screen select-none shrink-0 overflow-hidden items-center py-3 justify-between z-10 transition-all duration-200"
        aria-label="Navigation Rail"
      >
        <div className="space-y-4 flex flex-col items-center w-full">
          {/* Workspace Avatar */}
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            title={currentWorkspace?.name || 'Workspace'}
            className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90"
          >
            <Layers className="h-4 w-4" />
          </button>

          {/* Expand Button */}
          <button
            onClick={toggleSidebarCollapsed}
            title="Expand Sidebar (Click to restore)"
            className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
          >
            <PanelLeftOpen className="h-4 w-4" />
          </button>

          <div className="w-8 h-px bg-border my-1" />

          {/* Project icon if in project */}
          {activeProjectId && projectData && (
            <Link
              href={`/projects/${projectData.id}`}
              title={`${projectData.name} (${projectData.completionPercentage}%)`}
              className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-sm transition-transform hover:scale-105"
              style={{ backgroundColor: projectData.color || '#2563EB' }}
            >
              <CreditCard className="h-4 w-4" />
            </Link>
          )}

          {/* Nav Icons */}
          <div className="space-y-1 flex flex-col items-center w-full px-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={item.label}
                  className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                    isActive
                      ? 'bg-secondary text-foreground font-semibold shadow-xs'
                      : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : ''}`} />
                </Link>
              );
            })}
          </div>
        </div>

        {/* User profile avatar at bottom */}
        <Link
          href="/settings"
          title={user?.name || 'Settings'}
          className="h-8 w-8 rounded-full bg-background-tertiary border border-border flex items-center justify-center font-medium text-xs text-foreground hover:opacity-80 transition-opacity"
        >
          {user?.name?.charAt(0) || 'U'}
        </Link>
      </aside>
    );
  }

  // 2. EXPANDED SIDEBAR (DESKTOP OR MOBILE DRAWER)
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawer && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 lg:hidden animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        style={{ width: isMobileDrawer ? '280px' : `${sidebarWidth}px` }}
        className={`border-r border-border bg-background flex flex-col h-screen select-none shrink-0 overflow-hidden transition-[width] duration-75 relative z-40 ${
          isMobileDrawer
            ? `fixed inset-y-0 left-0 shadow-2xl transition-transform duration-300 ${
                isMobileSidebarOpen ? 'translate-x-0' : '-translate-x-full'
              }`
            : 'hidden md:flex'
        }`}
      >
        {/* Workspace Switcher & Collapse Header */}
        <div className="p-3 border-b border-border flex items-center justify-between gap-2">
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-lg bg-background-secondary hover:bg-background-tertiary border border-border transition-colors text-left shadow-xs"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-md bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0 shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate">
                    {currentWorkspace?.name || 'Workspace'}
                  </p>
                  <p className="text-[10px] text-foreground-muted capitalize">
                    {currentWorkspace?.role?.toLowerCase() || 'Member'}
                  </p>
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
            </button>

            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-lg border border-border bg-card shadow-xl z-50 space-y-0.5 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                  Switch Workspace
                </div>
                {workspaces.map((ws) => (
                  <button
                    key={ws.id}
                    onClick={() => {
                      setCurrentWorkspace(ws);
                      setIsWorkspaceMenuOpen(false);
                      router.push('/dashboard');
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-md text-xs transition-colors text-left ${
                      currentWorkspace?.id === ws.id
                        ? 'bg-primary/10 text-primary font-medium'
                        : 'text-foreground-secondary hover:bg-background-tertiary'
                    }`}
                  >
                    <span className="truncate">{ws.name}</span>
                    {currentWorkspace?.id === ws.id && (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Collapse Button (Desktop) or Close Button (Mobile) */}
          {isMobileDrawer ? (
            <button
              onClick={() => setMobileSidebarOpen(false)}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              aria-label="Close sidebar drawer"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <button
              onClick={toggleSidebarCollapsed}
              className="p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
              title="Collapse sidebar into rail"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Main Navigation or Project Hierarchy */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
          {activeProjectId ? (
            /* Inside Project View: Documentation Tree */
            <div className="space-y-4">
              {/* Back to Projects */}
              <Link
                href="/projects"
                onClick={() => isMobileDrawer && setMobileSidebarOpen(false)}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-foreground-secondary hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" />
                <span>Back to Projects</span>
              </Link>

              {/* Active Project Card */}
              {projectData && (
                <div className="p-2.5 rounded-lg bg-background-secondary border border-border space-y-2">
                  <div className="flex items-center justify-between">
                    <Link
                      href={`/projects/${projectData.id}`}
                      onClick={() => isMobileDrawer && setMobileSidebarOpen(false)}
                      className="font-medium text-xs text-foreground hover:text-primary transition-colors truncate"
                    >
                      {projectData.name}
                    </Link>
                    <span className="text-[10px] text-foreground-muted font-mono">
                      {projectData.completionPercentage}%
                    </span>
                  </div>
                  <Progress value={projectData.completionPercentage} size="sm" />
                </div>
              )}

              {/* Documentation Tree Header */}
              <div className="px-1 flex items-center justify-between">
                <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                  Documentation Tree
                </span>
                <Link
                  href={`/projects/${activeProjectId}?action=new-doc`}
                  onClick={() => isMobileDrawer && setMobileSidebarOpen(false)}
                  className="text-[11px] text-primary hover:underline flex items-center gap-0.5 font-medium"
                >
                  <Plus className="h-3 w-3" /> New
                </Link>
              </div>

              {/* Category Nodes */}
              <div className="space-y-1">
                {categoriesTree.map((cat: any) => {
                  const isCollapsed = !!collapsedCategories[cat.id];
                  return (
                    <div key={cat.id} className="space-y-0.5">
                      {/* Category Title Row */}
                      <button
                        onClick={() => toggleCategory(cat.id)}
                        className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-background-secondary text-left text-xs font-medium text-foreground transition-colors group"
                      >
                        <div className="flex items-center gap-1.5 truncate">
                          {isCollapsed ? (
                            <ChevronRight className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          ) : (
                            <ChevronDown className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          )}
                          {isCollapsed ? (
                            <Folder className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          ) : (
                            <FolderOpen className="h-3.5 w-3.5 text-amber-500 shrink-0" />
                          )}
                          <span className="truncate">{cat.name}</span>
                        </div>
                        <span className="text-[10px] font-mono text-foreground-muted group-hover:text-foreground">
                          {cat.documentCount || 0}
                        </span>
                      </button>

                      {/* Documents List */}
                      {!isCollapsed && (
                        <div className="pl-6 space-y-0.5">
                          {(cat.documents || []).length === 0 ? (
                            <p className="px-2 py-1 text-[11px] text-foreground-muted italic">
                              Empty category
                            </p>
                          ) : (
                            (cat.documents || []).map((doc: any) => {
                              const isDocActive = pathname?.includes(doc.id);
                              return (
                                <Link
                                  key={doc.id}
                                  href={`/projects/${activeProjectId}/docs/${doc.id}`}
                                  onClick={() => isMobileDrawer && setMobileSidebarOpen(false)}
                                  className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors group ${
                                    isDocActive
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                                  }`}
                                >
                                  <div className="flex items-center gap-2 truncate">
                                    {getStatusIcon(doc.status)}
                                    <span className="truncate">{doc.title}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-foreground-muted group-hover:text-foreground">
                                    v{doc.versionNumber}
                                  </span>
                                </Link>
                              );
                            })
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            /* General Global Navigation */
            <div className="space-y-1">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                Workspace
              </div>
              {navItems.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => isMobileDrawer && setMobileSidebarOpen(false)}
                    className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                      isActive
                        ? 'bg-secondary text-foreground font-semibold shadow-xs'
                        : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* User Footer */}
        <div className="p-3 border-t border-border flex items-center justify-between">
          <Link
            href="/settings"
            onClick={() => isMobileDrawer && setMobileSidebarOpen(false)}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="h-7 w-7 rounded-full bg-background-tertiary border border-border flex items-center justify-center font-medium text-xs text-foreground shrink-0 shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-medium text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-foreground-muted truncate">{user?.email}</p>
            </div>
          </Link>
        </div>
      </aside>

      {/* Draggable Resize Handle on Right Boundary (Desktop Only) */}
      {!isMobileDrawer && !isSidebarCollapsed && (
        <ResizeHandle
          onResize={handleResize}
          onReset={resetSidebarWidth}
          min={260}
          max={420}
          current={sidebarWidth}
          ariaLabel="Resize Sidebar"
          className="hidden md:flex"
        />
      )}
    </>
  );
}
