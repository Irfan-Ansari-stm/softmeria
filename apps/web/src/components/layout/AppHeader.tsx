'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Plus, LogOut, Sun, Moon, Menu } from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { useLayoutStore } from '../../stores/useLayoutStore';
import { Button } from '../ui/button';
import { GlobalSearchModal } from '../../features/search/GlobalSearchModal';

interface AppHeaderProps {
  breadcrumbs?: Array<{ label: string; href?: string }>;
}

export function AppHeader({ breadcrumbs = [] }: AppHeaderProps) {
  const router = useRouter();
  const { user, currentWorkspace, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { setMobileSidebarOpen } = useLayoutStore();
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
      <header className="h-14 border-b border-border bg-background/90 backdrop-blur-md px-3 sm:px-4 flex items-center justify-between shrink-0 z-20 transition-colors">
        {/* Left: Mobile Toggle & Breadcrumbs */}
        <div className="flex items-center gap-2 text-xs min-w-0">
          <button
            onClick={() => setMobileSidebarOpen(true)}
            className="md:hidden p-1.5 rounded-lg border border-border text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors shrink-0"
            aria-label="Open navigation menu"
          >
            <Menu className="h-4 w-4" />
          </button>

          <Link
            href="/dashboard"
            className="text-foreground-secondary hover:text-foreground transition-colors font-medium flex items-center gap-1.5 shrink-0"
          >
            <span className="font-semibold text-foreground tracking-tight">DevBlueprint</span>
          </Link>
          {breadcrumbs.map((bc, idx) => (
            <React.Fragment key={idx}>
              <span className="text-foreground-muted shrink-0">/</span>
              {bc.href ? (
                <Link
                  href={bc.href}
                  className="text-foreground-secondary hover:text-foreground transition-colors truncate max-w-[120px] sm:max-w-[180px]"
                >
                  {bc.label}
                </Link>
              ) : (
                <span className="text-foreground font-medium truncate max-w-[140px] sm:max-w-[220px]">
                  {bc.label}
                </span>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* Center: Search Trigger Button */}
        <div className="flex-1 max-w-xs md:max-w-md mx-2 sm:mx-6 min-w-0">
          <button
            onClick={() => setIsSearchOpen(true)}
            className="w-full flex items-center justify-between px-2.5 sm:px-3 py-1.5 rounded-lg border border-border bg-background-secondary/80 hover:bg-background-tertiary text-foreground-muted text-xs transition-colors group shadow-xs truncate"
          >
            <div className="flex items-center gap-2 truncate">
              <Search className="h-3.5 w-3.5 text-foreground-muted group-hover:text-foreground transition-colors shrink-0" />
              <span className="truncate hidden sm:inline">Search documents, projects, blueprints...</span>
              <span className="truncate sm:hidden">Search...</span>
            </div>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded border border-border bg-background text-[10px] font-mono text-foreground-muted shrink-0">
              Ctrl K
            </kbd>
          </button>
        </div>

        {/* Right: Actions, Theme Toggle & User Menu */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Theme Toggle Button */}
          <button
            onClick={() => toggleTheme(currentWorkspace?.id)}
            className="h-8 w-8 rounded-lg border border-border bg-background-secondary hover:bg-background-tertiary text-foreground-secondary hover:text-foreground flex items-center justify-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary shadow-xs"
            aria-label={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
            title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400 transition-transform duration-200 hover:rotate-45" />
            ) : (
              <Moon className="h-4 w-4 text-slate-700 transition-transform duration-200 hover:-rotate-12" />
            )}
          </button>

          <Link href="/projects?action=new-project">
            <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 px-2.5 sm:px-3">
              <Plus className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">New Project</span>
            </Button>
          </Link>

          {/* User Menu */}
          <div className="relative">
            <button
              onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
              className="flex items-center gap-2 p-0.5 rounded-full border border-border hover:border-primary/50 transition-colors"
              aria-label="User profile options"
            >
              <div className="h-7 w-7 rounded-full bg-primary flex items-center justify-center font-semibold text-xs text-primary-foreground shadow-xs">
                {user?.name?.charAt(0) || 'U'}
              </div>
            </button>

            {isUserMenuOpen && (
              <div className="absolute right-0 mt-2 w-52 rounded-lg border border-border bg-card shadow-xl py-1 z-30 animate-in fade-in zoom-in-95">
                <div className="px-3 py-2 border-b border-border text-xs">
                  <p className="font-medium text-foreground truncate">{user?.name}</p>
                  <p className="text-[11px] text-foreground-muted truncate">{user?.email}</p>
                </div>
                <Link
                  href="/settings"
                  onClick={() => setIsUserMenuOpen(false)}
                  className="block px-3 py-2 text-xs text-foreground-secondary hover:text-foreground hover:bg-background-tertiary transition-colors"
                >
                  Workspace & Account Settings
                </Link>
                <button
                  onClick={async () => {
                    setIsUserMenuOpen(false);
                    await logout();
                    router.push('/login');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-destructive hover:bg-background-tertiary transition-colors text-left"
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
