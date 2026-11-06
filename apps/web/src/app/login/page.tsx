'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../stores/useAuthStore';
import { useThemeStore } from '../../stores/useThemeStore';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const { syncWithWorkspace } = useThemeStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<any>('/auth/login', { email, password });
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.tokens.accessToken, res.data.workspaces);
        // Sync theme with workspace preference if received
        const wsTheme = res.data.workspaces?.[0]?.settings?.themePreference;
        if (wsTheme) {
          syncWithWorkspace(wsTheme);
        }
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password');
    } finally {
      setIsLoading(false);
    }
  };

  const handleQuickFill = (targetEmail: string) => {
    setEmail(targetEmail);
    setPassword('Password123!');
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Sign in to DevBlueprint
        </h2>
        <p className="text-xs text-foreground-muted">
          Enterprise developer documentation and technical blueprint platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 shadow-xl border border-border sm:rounded-xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive font-medium">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Work Email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="architect@company.com"
              required
            />

            <Input
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••••••"
              required
            />

            <div className="flex items-center justify-between">
              <span className="text-[11px] text-foreground-muted">Default: Password123!</span>
              <Link
                href="/forgot-password"
                className="text-xs text-primary hover:underline font-medium"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs shadow-sm"
              isLoading={isLoading}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Fill Test Accounts */}
          <div className="pt-4 border-t border-border space-y-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted text-center">
              Quick Sign-in (Seeded Accounts)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('owner@devblueprint.io')}
                className="p-2.5 rounded-lg border border-border bg-background-secondary hover:bg-background-tertiary text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-destructive">Sarah Connor</div>
                <div className="text-[10px] text-foreground-muted">Workspace Owner</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@devblueprint.io')}
                className="p-2.5 rounded-lg border border-border bg-background-secondary hover:bg-background-tertiary text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-warning">Alex Rivera</div>
                <div className="text-[10px] text-foreground-muted">DevOps Admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('editor@devblueprint.io')}
                className="p-2.5 rounded-lg border border-border bg-background-secondary hover:bg-background-tertiary text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-primary">Elena Rostova</div>
                <div className="text-[10px] text-foreground-muted">Lead Editor</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('viewer@devblueprint.io')}
                className="p-2.5 rounded-lg border border-border bg-background-secondary hover:bg-background-tertiary text-left transition-colors shadow-xs"
              >
                <div className="font-semibold text-foreground-secondary">Marcus Vance</div>
                <div className="text-[10px] text-foreground-muted">Auditor / Viewer</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-foreground-muted">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-primary hover:underline font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
