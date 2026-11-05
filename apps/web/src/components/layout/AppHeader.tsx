'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, LogOut, Sun, Moon, Bell, Layers } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { Button } from '../ui/button';
import { GlobalSearchModal } from '../../features/search/GlobalSearchModal';

interface AppHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAuthStore();
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsSearchOpen(true);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  return (
    <>
      <header className="h-14 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md px-4 flex items-center justify-between shrink-0 z-20">
        {/* Left: Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs">
          <Link
            href="/dashboard"
            className="text-zinc-400 hover:text-zinc-200 transition-colors font-medium flex items-center gap-1.5"
          >
            <span className="font-semibold text-zinc-100 tracking-tight">DevBlueprint</span>
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <span className="text-zinc-600">/</span>
              {bc.href ? (
                <Link
                  href={bc.href}
                  className="text-zinc-400 hover:text-zinc-200 transition-colors truncate max-w-[180px]"
                >
                  {bc.label}
                </Link>
              ) : (
                <span className="text-zinc-200 font-medium truncate max-w-[220px]">
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Center: Search Trigger Button */}
        <div className="flex-1 max-w-md mx-6">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-3 py-1.5 rounded-lg border border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-400 text-xs transition-colors group shadow-sm"
          >
            <div className="flex items-center gap-2">
              <Search className="h-3.5 w-3.5 text-zinc-500 group-hover:text-zinc-300 transition-colors" />
              <span>Search documents, projects, blueprints...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-zinc-700 bg-zinc-800 text-[10px] font-mono text-zinc-400">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & User Menu */}
        <div className="flex items-center gap-2.5">
          <Link href="/projects?action=new-project">
            <Button size="sm" variant="primary" className="text-xs gap-1.5">
              <Plus className="h-3.5 w-3.5" />
              <span>New Project</span>
            </Button>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-1 rounded-full border border-zinc-800 hover:border-zinc-700 transition-colors"
            >
              <div className="h-7 w-7 rounded-full bg-indigo-600 flex items-center justify-center font-semibold text-xs text-white">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-lg border border-zinc-800 bg-zinc-900 shadow-xl py-1 z-30">
                <div className="px-3 py-2 border-b border-zinc-800 text-xs">
                  <p className="font-medium text-zinc-200 truncate">{user?.name}</p>
                  <p className="text-[11px] text-zinc-400 truncate">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3 py-2 text-xs text-zinc-300 hover:bg-zinc-800 transition-colors"
                >
                  Workspace & Account Settings
                </Link>
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-rose-400 hover:bg-zinc-800 transition-colors text-left"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span>Log out</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Global Search Modal */}
      <GlobalSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </>
  );
}

