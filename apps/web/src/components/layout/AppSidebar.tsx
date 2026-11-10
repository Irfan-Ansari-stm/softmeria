'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
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
  CreditCard,
  Search,
  Trash2,
  Inbox,
  Briefcase,
  Calendar,
  Target,
  Kanban,
  Flame,
  Bug,
  ShieldCheck,
  Palette,
  Code2,
  Rocket,
  MessageSquare,
  Files,
  BarChart3,
  ShieldAlert,
  Blocks,
  Shield,
  Activity,
  CheckSquare,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useLayoutStore, MIN_SIDEBAR_WIDTH, MAX_SIDEBAR_WIDTH } from '../../stores/useLayoutStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { useNotifications } from '../../hooks/useNotifications';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Progress } from '../ui/progress';
import { Badge } from '../ui/badge';
import { Button } from '../ui/button';
import { ResizeHandle } from '../ui/ResizeHandle';
import { QuickCreateModal } from '../modals/QuickCreateModal';
import { CreateWorkspaceModal } from '../modals/CreateWorkspaceModal';
import { GlobalSearchModal } from '../../features/search/GlobalSearchModal';

interface AppSidebarProps {
  activeProjectId?: string;
  isMobileDrawer?: boolean;
}

export function AppSidebar({ activeProjectId, isMobileDrawer = false }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentTab = searchParams?.get('tab') || 'overview';

  const { user, workspaces, currentWorkspace, setCurrentWorkspace } = useAuthStore();
  const {
    sidebarWidth,
    setSidebarWidth,
    isSidebarCollapsed,
    toggleSidebarCollapsed,
    resetSidebarWidth,
    isMobileSidebarOpen,
    setMobileSidebarOpen,
    isResizing,
    setIsResizing,
    commitLayout
  } = useLayoutStore();

  const {
    expandedGroups,
    toggleGroup,
    isQuickCreateOpen,
    setQuickCreateOpen,
    isCreateWorkspaceOpen,
    setCreateWorkspaceOpen,
    isGlobalSearchOpen,
    setGlobalSearchOpen,
    projectNavMode,
    setProjectNavMode,
    initNavigation
  } = useNavigationStore();

  const { unreadCount } = useNotifications();

  const [isWorkspaceMenuOpen, setIsWorkspaceMenuOpen] = useState(false);
  const [collapsedCategories, setCollapsedCategories] = useState<Record<string, boolean>>({});

  // Initialize navigation preferences
  useEffect(() => {
    if (currentWorkspace?.id) {
      initNavigation(currentWorkspace.id);
    }
  }, [currentWorkspace?.id, initNavigation]);

  // Load project data if in project context
  const { data: projectData } = useQuery({
    queryKey: ['project', activeProjectId],
    queryFn: async () => {
      if (!activeProjectId) return null;
      const res = await api.get<any>(`/projects/${activeProjectId}`);
      return res.data;
    },
    enabled: !!activeProjectId
  });

  // Load project categories & documentation tree
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

  // Check user role in current workspace
  const userRole = currentWorkspace?.role || 'MEMBER';
  const isAdminOrOwner = userRole === 'OWNER' || userRole === 'ADMIN';

  // Handle Resize Delta
  const handleResize = (deltaX: number) => {
    setSidebarWidth(sidebarWidth + deltaX, false);
  };

  const handleStepResize = (delta: number) => {
    setSidebarWidth(sidebarWidth + delta, true);
  };

  const handleLinkClick = () => {
    if (isMobileDrawer) {
      setMobileSidebarOpen(false);
    }
  };

  // =========================================================================
  // 1. COLLAPSED DESKTOP MINI RAIL (56px)
  // =========================================================================
  if (isSidebarCollapsed && !isMobileDrawer) {
    return (
      <>
        <aside
          className="w-14 border-r border-border bg-card flex flex-col h-screen select-none shrink-0 overflow-hidden items-center py-3 justify-between z-20 transition-all duration-200"
          aria-label="Navigation Rail"
        >
          <div className="space-y-3 flex flex-col items-center w-full px-1">
            {/* Workspace Logo / Switcher Icon */}
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              title={`${currentWorkspace?.name || 'Workspace'} (${userRole})`}
              className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shadow-sm hover:opacity-90 transition-opacity"
            >
              <Layers className="h-4 w-4" />
            </button>

            {/* Expand Sidebar Button */}
            <button
              onClick={toggleSidebarCollapsed}
              title="Expand Sidebar"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
            >
              <PanelLeftOpen className="h-4 w-4" />
            </button>

            {/* Quick Create (+) */}
            <button
              onClick={() => setQuickCreateOpen(true)}
              title="Quick Create (Task, Doc, Bug, Milestone)"
              className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors shadow-xs"
            >
              <Plus className="h-4 w-4" />
            </button>

            {/* Global Search Shortcut */}
            <button
              onClick={() => setGlobalSearchOpen(true)}
              title="Search (Ctrl + K)"
              className="h-8 w-8 rounded-lg flex items-center justify-center text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
            >
              <Search className="h-4 w-4" />
            </button>

            <div className="w-8 h-px bg-border my-1" />

            {/* Inbox with unread badge */}
            <Link
              href="/inbox"
              title={`Inbox ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
              className={`relative h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                pathname === '/inbox'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              }`}
            >
              <Inbox className="h-4 w-4" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary ring-2 ring-card" />
              )}
            </Link>

            {/* Dashboard */}
            <Link
              href="/dashboard"
              title="Dashboard"
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                pathname === '/dashboard'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              }`}
            >
              <LayoutDashboard className="h-4 w-4" />
            </Link>

            {/* All Projects */}
            <Link
              href="/projects"
              title="Projects"
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                pathname.startsWith('/projects') && !activeProjectId
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              }`}
            >
              <FolderKanban className="h-4 w-4" />
            </Link>

            {/* Boards */}
            <Link
              href="/boards"
              title="My Boards"
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                pathname === '/boards'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              }`}
            >
              <Kanban className="h-4 w-4" />
            </Link>

            {/* Active Project Icon if inside project */}
            {activeProjectId && projectData && (
              <Link
                href={`/projects/${projectData.id}`}
                title={`Active: ${projectData.name} (${projectData.completionPercentage}%)`}
                className="h-8 w-8 rounded-lg flex items-center justify-center text-white shadow-xs transition-transform hover:scale-105"
                style={{ backgroundColor: projectData.color || '#2563EB' }}
              >
                <CreditCard className="h-4 w-4" />
              </Link>
            )}

            {/* Team */}
            <Link
              href="/team"
              title="Team"
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                pathname === '/team'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              }`}
            >
              <Users className="h-4 w-4" />
            </Link>

            {/* Reports */}
            <Link
              href="/reports"
              title="Reports & Analytics"
              className={`h-9 w-9 rounded-lg flex items-center justify-center transition-colors ${
                pathname === '/reports'
                  ? 'bg-secondary text-primary font-semibold'
                  : 'text-foreground-muted hover:text-foreground hover:bg-background-secondary'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </Link>
          </div>

          {/* User profile avatar at bottom */}
          <Link
            href="/settings"
            title={`${user?.name || 'User'} (${userRole})`}
            className="h-8 w-8 rounded-full bg-background-tertiary border border-border flex items-center justify-center font-semibold text-xs text-foreground hover:opacity-80 transition-opacity"
          >
            {user?.name?.charAt(0) || 'U'}
          </Link>
        </aside>

        {/* Global Modals Mounted */}
        <QuickCreateModal
          isOpen={isQuickCreateOpen}
          onClose={() => setQuickCreateOpen(false)}
          activeProjectId={activeProjectId}
        />
        <CreateWorkspaceModal
          isOpen={isCreateWorkspaceOpen}
          onClose={() => setCreateWorkspaceOpen(false)}
        />
        <GlobalSearchModal
          isOpen={isGlobalSearchOpen}
          onClose={() => setGlobalSearchOpen(false)}
        />
      </>
    );
  }

  // =========================================================================
  // 2. EXPANDED ENTERPRISE SIDEBAR (DESKTOP OR MOBILE DRAWER)
  // =========================================================================
  return (
    <>
      {/* Mobile Drawer Backdrop */}
      {isMobileDrawer && isMobileSidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-xs z-40 md:hidden animate-in fade-in"
          onClick={() => setMobileSidebarOpen(false)}
        />
      )}

      <aside
        style={{ width: isMobileDrawer ? '290px' : `${sidebarWidth}px` }}
        className={`border-r border-border bg-card flex flex-col h-screen select-none shrink-0 overflow-hidden relative z-30 ${
          !isResizing ? 'transition-[width] duration-200 ease-out' : ''
        } ${
          isMobileDrawer
            ? `fixed inset-y-0 left-0 shadow-2xl transition-transform duration-300 md:hidden ${
                isMobileSidebarOpen
                  ? 'translate-x-0 pointer-events-auto'
                  : '-translate-x-full pointer-events-none'
              }`
            : 'hidden md:flex'
        }`}
      >
        {/* ================================================================= */}
        {/* SECTION 1: WORKSPACE HEADER & SWITCHER */}
        {/* ================================================================= */}
        <div className="p-3 border-b border-border flex items-center justify-between gap-2 bg-card">
          <div className="relative flex-1 min-w-0">
            <button
              onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
              className="w-full flex items-center justify-between p-2 rounded-xl bg-background-secondary/80 hover:bg-background-tertiary border border-border transition-colors text-left shadow-xs group"
            >
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground font-bold text-xs shrink-0 shadow-xs">
                  <Layers className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-semibold text-foreground truncate group-hover:text-primary transition-colors">
                    {currentWorkspace?.name || 'Workspace'}
                  </p>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[10px] text-foreground-muted capitalize">
                      {userRole.toLowerCase()}
                    </span>
                    <span className="h-1 w-1 rounded-full bg-emerald-500" />
                    <span className="text-[9px] text-foreground-muted font-mono">online</span>
                  </div>
                </div>
              </div>
              <ChevronsUpDown className="h-3.5 w-3.5 text-foreground-muted group-hover:text-foreground transition-colors shrink-0" />
            </button>

            {/* Workspace Switcher Dropdown */}
            {isWorkspaceMenuOpen && (
              <div className="absolute top-full left-0 right-0 mt-1.5 p-1.5 rounded-xl border border-border bg-card shadow-2xl z-50 space-y-1 animate-in fade-in zoom-in-95">
                <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center justify-between">
                  <span>Workspaces</span>
                  <Badge variant="outline" className="text-[9px] px-1 py-0">
                    {workspaces.length}
                  </Badge>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-0.5 pr-0.5">
                  {workspaces.map((ws) => (
                    <button
                      key={ws.id}
                      onClick={() => {
                        setCurrentWorkspace(ws);
                        setIsWorkspaceMenuOpen(false);
                        handleLinkClick();
                        router.push('/dashboard');
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors text-left ${
                        currentWorkspace?.id === ws.id
                          ? 'bg-primary/10 text-primary font-semibold'
                          : 'text-foreground-secondary hover:bg-background-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <div className="h-5 w-5 rounded-md bg-background-tertiary border border-border flex items-center justify-center font-bold text-[10px] text-foreground shrink-0">
                          {ws.name.charAt(0)}
                        </div>
                        <span className="truncate">{ws.name}</span>
                      </div>
                      {currentWorkspace?.id === ws.id && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0" />
                      )}
                    </button>
                  ))}
                </div>

                <div className="pt-1.5 border-t border-border space-y-1">
                  <button
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      setCreateWorkspaceOpen(true);
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-primary hover:bg-primary/10 transition-colors font-medium"
                  >
                    <Plus className="h-3.5 w-3.5" />
                    <span>Create New Workspace</span>
                  </button>

                  <Link
                    href="/settings"
                    onClick={() => {
                      setIsWorkspaceMenuOpen(false);
                      handleLinkClick();
                    }}
                    className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
                  >
                    <Settings className="h-3.5 w-3.5" />
                    <span>Workspace Settings</span>
                  </Link>
                </div>
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
              title="Collapse sidebar into mini rail"
              aria-label="Collapse sidebar"
            >
              <PanelLeftClose className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION 2: GLOBAL SEARCH SHORTCUT & QUICK CREATE */}
        {/* ================================================================= */}
        <div className="p-3 border-b border-border/60 space-y-2 bg-card">
          {/* Quick Create Action */}
          <Button
            onClick={() => setQuickCreateOpen(true)}
            variant="primary"
            size="sm"
            className="w-full justify-center gap-2 text-xs font-semibold h-8 shadow-xs"
          >
            <Plus className="h-3.5 w-3.5 shrink-0" />
            <span>Quick Create</span>
          </Button>

          {/* Search Shortcut */}
          <button
            onClick={() => setGlobalSearchOpen(true)}
            className="w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg border border-border bg-background-secondary/60 hover:bg-background-tertiary text-foreground-muted hover:text-foreground text-xs transition-colors group shadow-xs"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-foreground-muted group-hover:text-primary transition-colors shrink-0" />
              <span className="truncate">Search workspace...</span>
            </div>
            <kbd className="inline-flex items-center gap-0.5 px-1.5 py-0.2 rounded border border-border bg-card text-[9px] font-mono text-foreground-muted shrink-0">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* ================================================================= */}
        {/* SECTION 3: SCROLLABLE NAVIGATION GROUPS */}
        {/* ================================================================= */}
        <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4 text-xs scrollbar-thin">
          {/* =============================================================== */}
          {/* A. PROJECT CONTEXT NAVIGATION (WHEN INSIDE A PROJECT) */}
          {/* =============================================================== */}
          {activeProjectId && projectData && (
            <div className="space-y-3 pb-3 border-b border-border/80">
              {/* Back to All Projects */}
              <Link
                href="/projects"
                onClick={handleLinkClick}
                className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-foreground-secondary hover:text-foreground transition-colors font-medium group"
              >
                <ArrowLeft className="h-3.5 w-3.5 group-hover:-translate-x-0.5 transition-transform" />
                <span>All Projects</span>
              </Link>

              {/* Active Project Card */}
              <div className="p-2.5 rounded-xl bg-background-secondary/80 border border-border space-y-2 shadow-xs">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <div
                      className="h-6 w-6 rounded-md flex items-center justify-center text-white shrink-0 text-[10px] font-bold shadow-xs"
                      style={{ backgroundColor: projectData.color || '#2563EB' }}
                    >
                      <FolderKanban className="h-3.5 w-3.5" />
                    </div>
                    <span className="font-semibold text-xs text-foreground truncate">
                      {projectData.name}
                    </span>
                  </div>
                  <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                    {projectData.completionPercentage}%
                  </Badge>
                </div>
                <Progress value={projectData.completionPercentage} size="sm" />
              </div>

              {/* Project Sub-modules */}
              <div className="space-y-0.5">
                {[
                  { id: 'overview', label: 'Overview', icon: LayoutDashboard },
                  { id: 'board', label: 'Board', icon: Kanban },
                  { id: 'tasks', label: 'Tasks', icon: CheckSquare },
                  { id: 'sprints', label: 'Sprints', icon: Flame },
                  { id: 'roadmap', label: 'Roadmap', icon: Target },
                  { id: 'docs', label: 'Documentation', icon: FileText },
                  { id: 'design', label: 'Design System', icon: Palette },
                  { id: 'development', label: 'Development & Repos', icon: Code2 },
                  { id: 'bugs', label: 'Bugs & QA', icon: Bug },
                  { id: 'testing', label: 'Testing', icon: ShieldCheck },
                  { id: 'releases', label: 'Releases', icon: Rocket },
                  { id: 'team', label: 'Teams', icon: Users },
                  { id: 'time', label: 'Time Tracking', icon: Clock },
                  { id: 'risks', label: 'Risks', icon: ShieldAlert },
                  { id: 'discussions', label: 'Discussions', icon: MessageSquare },
                  { id: 'reports', label: 'Reports', icon: BarChart3 }
                ].map((item) => {
                  const isCurrent =
                    pathname === `/projects/${activeProjectId}` && currentTab === item.id;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.id}
                      href={`/projects/${activeProjectId}?tab=${item.id}`}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isCurrent
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isCurrent ? 'text-primary' : 'text-foreground-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>

              {/* Documentation Tree under Docs */}
              {currentTab === 'docs' && categoriesTree.length > 0 && (
                <div className="pt-2 border-t border-border/60 space-y-1">
                  <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted flex items-center justify-between">
                    <span>Blueprint Categories</span>
                    <span className="font-mono text-[9px]">{categoriesTree.length}</span>
                  </div>

                  {categoriesTree.map((cat: any) => {
                    const isCollapsed = !!collapsedCategories[cat.id];
                    return (
                      <div key={cat.id} className="space-y-0.5">
                        <button
                          onClick={() => toggleCategory(cat.id)}
                          className="w-full flex items-center justify-between px-2 py-1 rounded-md hover:bg-background-secondary text-left text-xs text-foreground transition-colors group"
                        >
                          <div className="flex items-center gap-1.5 truncate">
                            {isCollapsed ? (
                              <ChevronRight className="h-3 w-3 text-foreground-muted shrink-0" />
                            ) : (
                              <ChevronDown className="h-3 w-3 text-foreground-muted shrink-0" />
                            )}
                            <Folder className="h-3 w-3 text-amber-500 shrink-0" />
                            <span className="truncate text-[11px] font-medium">{cat.name}</span>
                          </div>
                          <span className="text-[9px] font-mono text-foreground-muted">
                            {cat.documentCount || 0}
                          </span>
                        </button>

                        {!isCollapsed && (
                          <div className="pl-5 space-y-0.5">
                            {(cat.documents || []).map((doc: any) => {
                              const isDocActive = pathname?.includes(doc.id);
                              return (
                                <Link
                                  key={doc.id}
                                  href={`/projects/${activeProjectId}/docs/${doc.id}`}
                                  onClick={handleLinkClick}
                                  className={`flex items-center justify-between px-2 py-1 rounded-md text-[11px] transition-colors truncate ${
                                    isDocActive
                                      ? 'bg-primary/10 text-primary font-medium'
                                      : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 truncate">
                                    {getStatusIcon(doc.status)}
                                    <span className="truncate">{doc.title}</span>
                                  </div>
                                  <span className="text-[9px] font-mono text-foreground-muted shrink-0">
                                    v{doc.versionNumber}
                                  </span>
                                </Link>
                              );
                            })}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}

          {/* =============================================================== */}
          {/* WORKSPACE GROUP */}
          {/* =============================================================== */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('workspace')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
            >
              <span>Workspace</span>
              {expandedGroups.workspace ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedGroups.workspace && (
              <div className="space-y-0.5">
                {[
                  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
                  {
                    href: '/inbox',
                    label: 'Inbox',
                    icon: Inbox,
                    badge: unreadCount > 0 ? unreadCount : undefined
                  },
                  { href: '/my-tasks', label: 'My Tasks', icon: CheckSquare },
                  { href: '/my-time', label: 'My Time', icon: Clock }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 truncate">
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                        <span className="truncate">{item.label}</span>
                      </div>
                      {item.badge !== undefined && item.badge > 0 && (
                        <Badge variant="default" className="text-[10px] px-1.5 py-0">
                          {item.badge}
                        </Badge>
                      )}
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* E. PROJECT MANAGEMENT GROUP */}
          {/* =============================================================== */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('projectManagement')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
            >
              <span>Project Management</span>
              {expandedGroups.projectManagement ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedGroups.projectManagement && (
              <div className="space-y-0.5">
                {[
                  { href: '/projects', label: 'All Projects', icon: FolderKanban },
                  { href: '/portfolios', label: 'Portfolios', icon: Briefcase },
                  { href: '/roadmaps', label: 'Roadmaps', icon: Target },
                  { href: '/calendar', label: 'Calendar', icon: Calendar },
                  { href: '/milestones', label: 'Milestones', icon: Target }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* F. EXECUTION GROUP */}
          {/* =============================================================== */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('execution')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
            >
              <span>Execution</span>
              {expandedGroups.execution ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedGroups.execution && (
              <div className="space-y-0.5">
                {[
                  { href: '/boards', label: 'My Boards', icon: Kanban },
                  { href: '/backlog', label: 'Backlog', icon: CheckSquare },
                  { href: '/sprints', label: 'Sprints', icon: Flame },
                  { href: '/bugs', label: 'Issues & Bugs', icon: Bug }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* G. ENGINEERING GROUP */}
          {/* =============================================================== */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('engineering')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
            >
              <span>Engineering</span>
              {expandedGroups.engineering ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedGroups.engineering && (
              <div className="space-y-0.5">
                {[
                  { href: '/templates', label: 'Documentation & Blueprints', icon: FileText },
                  { href: '/design', label: 'Design System', icon: Palette },
                  { href: '/development', label: 'Development & Repos', icon: Code2 },
                  { href: '/testing', label: 'Testing & QA', icon: ShieldCheck },
                  { href: '/releases', label: 'Releases & Deploys', icon: Rocket }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* H. COLLABORATION GROUP */}
          {/* =============================================================== */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('collaboration')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
            >
              <span>Collaboration</span>
              {expandedGroups.collaboration ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedGroups.collaboration && (
              <div className="space-y-0.5">
                {[
                  { href: '/team', label: 'Teams & Roster', icon: Users },
                  { href: '/discussions', label: 'Discussions & RFCs', icon: MessageSquare },
                  { href: '/files', label: 'Files & Assets', icon: Files }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* I. INSIGHTS GROUP */}
          {/* =============================================================== */}
          <div className="space-y-1">
            <button
              onClick={() => toggleGroup('insights')}
              className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
            >
              <span>Insights</span>
              {expandedGroups.insights ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedGroups.insights && (
              <div className="space-y-0.5">
                {[
                  { href: '/reports', label: 'Reports & Analytics', icon: BarChart3 },
                  { href: '/risks', label: 'Risks & Dependencies', icon: ShieldAlert }
                ].map((item) => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleLinkClick}
                      className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                          : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                      }`}
                    >
                      <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                      <span className="truncate">{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* J. ADMINISTRATION GROUP (ROLE-BASED: ADMIN / OWNER ONLY) */}
          {/* =============================================================== */}
          {isAdminOrOwner && (
            <div className="space-y-1">
              <button
                onClick={() => toggleGroup('administration')}
                className="w-full flex items-center justify-between px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-foreground-muted hover:text-foreground transition-colors"
              >
                <span>Administration</span>
                {expandedGroups.administration ? (
                  <ChevronDown className="h-3 w-3" />
                ) : (
                  <ChevronRight className="h-3 w-3" />
                )}
              </button>

              {expandedGroups.administration && (
                <div className="space-y-0.5">
                  {[
                    { href: '/team', label: 'Team Members', icon: Users },
                    { href: '/integrations', label: 'Integrations', icon: Blocks },
                    { href: '/audit-logs', label: 'Audit Logs', icon: Shield },
                    { href: '/settings', label: 'Settings', icon: Settings }
                  ].map((item) => {
                    const isActive = pathname === item.href;
                    const Icon = item.icon;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={handleLinkClick}
                        className={`flex items-center gap-2.5 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                          isActive
                            ? 'bg-primary/10 text-primary font-semibold shadow-xs'
                            : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                        }`}
                      >
                        <Icon className={`h-3.5 w-3.5 ${isActive ? 'text-primary' : 'text-foreground-muted'}`} />
                        <span className="truncate">{item.label}</span>
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* ================================================================= */}
        {/* SECTION 4: USER FOOTER SECTION */}
        {/* ================================================================= */}
        <div className="p-3 border-t border-border flex items-center justify-between bg-card">
          <Link
            href="/settings"
            onClick={handleLinkClick}
            className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
          >
            <div className="h-7 w-7 rounded-full bg-primary/10 border border-primary/20 flex items-center justify-center font-bold text-xs text-primary shrink-0 shadow-xs">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-foreground truncate">{user?.name || 'User'}</p>
              <p className="text-[10px] text-foreground-muted truncate">{user?.email}</p>
            </div>
          </Link>
          <Badge variant="outline" className="text-[10px] capitalize shrink-0 font-mono">
            {userRole.toLowerCase()}
          </Badge>
        </div>
      </aside>

      {/* Draggable Resize Handle on Right Boundary (Desktop Only) */}
      {!isMobileDrawer && !isSidebarCollapsed && (
        <ResizeHandle
          onResize={handleResize}
          onReset={resetSidebarWidth}
          onStepChange={handleStepResize}
          onDragStart={() => setIsResizing(true)}
          onDragEnd={() => {
            setIsResizing(false);
            commitLayout();
          }}
          min={MIN_SIDEBAR_WIDTH}
          max={MAX_SIDEBAR_WIDTH}
          current={sidebarWidth}
          ariaLabel="Resize Sidebar"
          className="hidden md:flex"
        />
      )}

      {/* Global Modals Mounted */}
      <QuickCreateModal
        isOpen={isQuickCreateOpen}
        onClose={() => setQuickCreateOpen(false)}
        activeProjectId={activeProjectId}
      />
      <CreateWorkspaceModal
        isOpen={isCreateWorkspaceOpen}
        onClose={() => setCreateWorkspaceOpen(false)}
      />
      <GlobalSearchModal
        isOpen={isGlobalSearchOpen}
        onClose={() => setGlobalSearchOpen(false)}
      />
    </>
  );
}
