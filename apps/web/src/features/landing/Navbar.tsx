'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Layers,
  Sun,
  Moon,
  Menu,
  X,
  ArrowRight,
  Sparkles,
  ChevronRight
} from 'lucide-react';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { Button } from '../../components/ui/button';

export function Navbar() {
  const router = useRouter();
  const { isAuthenticated, user, currentWorkspace } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinks = [
    { label: 'Product', href: '#showcase' },
    { label: 'Features', href: '#features' },
    { label: 'How It Works', href: '#how-it-works' },
    { label: 'Categories', href: '#categories' },
    { label: 'Pricing', href: '#pricing' },
    { label: 'FAQ', href: '#faq' }
  ];

  const handleNavClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    if (href.startsWith('#')) {
      e.preventDefault();
      setIsMobileMenuOpen(false);
      const target = document.querySelector(href);
      if (target) {
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  };

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? 'bg-background/85 backdrop-blur-md border-b border-border shadow-xs'
          : 'bg-background/60 backdrop-blur-xs border-b border-border/40'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Name */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs group-hover:scale-105 transition-transform">
              <Layers className="h-4 w-4" />
            </div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base tracking-tight text-foreground">
                DevBlueprint
              </span>
              <span className="hidden sm:inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-secondary text-foreground-secondary border border-border">
                v1.0
              </span>
            </div>
          </Link>

          {/* Center Navigation Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-1.5 text-xs font-medium text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-md transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* Right Actions: Theme Toggle, Auth Links */}
          <div className="hidden md:flex items-center gap-2.5">
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

            {isAuthenticated ? (
              <Link href="/dashboard">
                <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 px-3 shadow-xs">
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button size="sm" variant="ghost" className="text-xs text-foreground-secondary hover:text-foreground h-8 px-3">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" variant="primary" className="text-xs gap-1.5 h-8 px-3 shadow-xs">
                    <span>Get Started</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>

          {/* Mobile Hamburger & Theme Button */}
          <div className="flex md:hidden items-center gap-2">
            <button
              onClick={() => toggleTheme(currentWorkspace?.id)}
              className="h-8 w-8 rounded-lg border border-border bg-background-secondary text-foreground-secondary flex items-center justify-center transition-colors"
              aria-label="Toggle theme"
            >
              {theme === 'dark' ? (
                <Sun className="h-4 w-4 text-amber-400" />
              ) : (
                <Moon className="h-4 w-4 text-slate-700" />
              )}
            </button>

            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-1.5 rounded-lg border border-border text-foreground-secondary hover:text-foreground hover:bg-background-secondary transition-colors"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-border bg-background px-4 pt-2 pb-6 space-y-4 shadow-xl animate-in slide-in-from-top-2 duration-150">
          <nav className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <a
                key={link.label}
                href={link.href}
                onClick={(e) => handleNavClick(e, link.href)}
                className="px-3 py-2 text-sm font-medium text-foreground-secondary hover:text-foreground hover:bg-background-secondary rounded-lg transition-colors flex items-center justify-between"
              >
                <span>{link.label}</span>
                <ChevronRight className="h-4 w-4 text-foreground-muted" />
              </a>
            ))}
          </nav>

          <div className="pt-3 border-t border-border flex flex-col gap-2">
            {isAuthenticated ? (
              <Link href="/dashboard" onClick={() => setIsMobileMenuOpen(false)}>
                <Button variant="primary" className="w-full text-xs justify-center gap-1.5">
                  <span>Go to Workspace</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="outline" className="w-full text-xs justify-center">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register" onClick={() => setIsMobileMenuOpen(false)}>
                  <Button variant="primary" className="w-full text-xs justify-center gap-1.5 shadow-xs">
                    <span>Get Started Free</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}

