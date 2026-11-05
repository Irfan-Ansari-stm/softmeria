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
  FileCode,
  Folder,
  FolderOpen,
  ArrowLeft,
  ChevronsUpDown,
  Sparkles
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Progress } from '../ui/progress';

interface AppSidebarProps {
  activeProjectId?: string;
}

export function AppSidebar({ activeProjectId }: AppSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, workspaces, currentWorkspace, setCurrentWorkspace, logout } = useAuthStore();
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
        return <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />;
      case 'IN_PROGRESS':
        return <Clock className="h-3.5 w-3.5 text-indigo-400 shrink-0" />;
      case 'IN_REVIEW':
        return <Clock className="h-3.5 w-3.5 text-amber-400 shrink-0" />;
      default:
        return <FileText className="h-3.5 w-3.5 text-zinc-500 shrink-0" />;
    }
  };

  const navItems = [
    { label: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
    { label: 'All Projects', href: '/projects', icon: FolderKanban },
    { label: 'Templates', href: '/templates', icon: Bookmark },
    { label: 'Team Members', href: '/team', icon: Users },
    { label: 'Settings', href: '/settings', icon: Settings }
  ];

  return (
    <aside className="w-64 border-r border-zinc-800 bg-zinc-950 flex flex-col h-screen select-none shrink-0 overflow-hidden">
      {/* Workspace Switcher */}
      <div className="p-3 border-b border-zinc-800/80">
        <div className="relative">
          <button
            onClick={() => setIsWorkspaceMenuOpen(!isWorkspaceMenuOpen)}
            className="w-full flex items-center justify-between p-2 rounded-lg bg-zinc-900/80 hover:bg-zinc-800/80 border border-zinc-800 transition-colors text-left"
          >
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="h-7 w-7 rounded-md bg-indigo-600 flex items-center justify-center text-white font-bold text-xs shrink-0 shadow-sm">
                <Layers className="h-4 w-4" />
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-zinc-100 truncate">
                  {currentWorkspace?.name || 'Workspace'}
                </p>
                <p className="text-[10px] text-zinc-400 capitalize">
                  {currentWorkspace?.role?.toLowerCase() || 'Member'}
                </p>
              </div>
            </div>
            <ChevronsUpDown className="h-3.5 w-3.5 text-zinc-400 shrink-0" />
          </button>

          {isWorkspaceMenuOpen && (
            <div className="absolute top-full left-0 right-0 mt-1.5 p-1 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl z-30 space-y-0.5">
              <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
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
                  className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded text-xs transition-colors text-left ${
                    currentWorkspace?.id === ws.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-zinc-300 hover:bg-zinc-800'
                  }`}
                >
                  <span className="truncate">{ws.name}</span>
                  {currentWorkspace?.id === ws.id && (
                    <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
                  )}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Navigation or Project Hierarchy */}
      <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
        {activeProjectId ? (
          /* Inside Project View: Documentation Tree */
          <div className="space-y-4">
            {/* Back to Projects */}
            <Link
              href="/projects"
              className="inline-flex items-center gap-1.5 px-2 py-1 text-xs text-zinc-400 hover:text-zinc-200 transition-colors"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              <span>Back to Projects</span>
            </Link>

            {/* Active Project Card */}
            {projectData && (
              <div className="p-2.5 rounded-lg bg-zinc-900/50 border border-zinc-800 space-y-2">
                <div className="flex items-center justify-between">
                  <Link
                    href={`/projects/${projectData.id}`}
                    className="font-medium text-xs text-zinc-200 hover:text-indigo-400 transition-colors truncate"
                  >
                    {projectData.name}
                  </Link>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    {projectData.completionPercentage}%
                  </span>
                </div>
                <Progress value={projectData.completionPercentage} size="sm" />
              </div>
            )}

            {/* Documentation Tree Header */}
            <div className="px-1 flex items-center justify-between">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
                Documentation Tree
              </span>
              <Link
                href={`/projects/${activeProjectId}?action=new-doc`}
                className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-0.5"
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
                      className="w-full flex items-center justify-between px-2 py-1.5 rounded-md hover:bg-zinc-900 text-left text-xs font-medium text-zinc-300 transition-colors group"
                    >
                      <div className="flex items-center gap-1.5 truncate">
                        {isCollapsed ? (
                          <ChevronRight className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        ) : (
                          <ChevronDown className="h-3.5 w-3.5 text-zinc-500 shrink-0" />
                        )}
                        {isCollapsed ? (
                          <Folder className="h-3.5 w-3.5 text-amber-500/80 shrink-0" />
                        ) : (
                          <FolderOpen className="h-3.5 w-3.5 text-amber-500/90 shrink-0" />
                        )}
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-zinc-500 group-hover:text-zinc-400">
                        {cat.documentCount || 0}
                      </span>
                    </button>

                    {/* Documents List */}
                    {!isCollapsed && (
                      <div className="pl-6 space-y-0.5">
                        {(cat.documents || []).length === 0 ? (
                          <p className="px-2 py-1 text-[11px] text-zinc-600 italic">
                            Empty category
                          </p>
                        ) : (
                          (cat.documents || []).map((doc: any) => {
                            const isDocActive = pathname?.includes(doc.id);
                            return (
                              <Link
                                key={doc.id}
                                href={`/projects/${activeProjectId}/docs/${doc.id}`}
                                className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-colors group ${
                                  isDocActive
                                    ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                                    : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900/60'
                                }`}
                              >
                                <div className="flex items-center gap-2 truncate">
                                  {getStatusIcon(doc.status)}
                                  <span className="truncate">{doc.title}</span>
                                </div>
                                <span className="text-[9px] font-mono text-zinc-600 group-hover:text-zinc-400">
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
            <div className="px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-zinc-500">
              Workspace
            </div>
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors ${
                    isActive
                      ? 'bg-zinc-800 text-zinc-100 shadow-sm'
                      : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-900'
                  }`}
                >
                  <Icon className={`h-4 w-4 ${isActive ? 'text-indigo-400' : 'text-zinc-400'}`} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        )}
      </div>

      {/* User Footer */}
      <div className="p-3 border-t border-zinc-800/80 flex items-center justify-between">
        <Link
          href="/settings"
          className="flex items-center gap-2.5 min-w-0 hover:opacity-80 transition-opacity"
        >
          <div className="h-7 w-7 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center font-medium text-xs text-zinc-200 shrink-0">
            {user?.name?.charAt(0) || 'U'}
          </div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-zinc-200 truncate">{user?.name || 'User'}</p>
            <p className="text-[10px] text-zinc-500 truncate">{user?.email}</p>
          </div>
        </Link>
      </div>
    </aside>
  );
}

