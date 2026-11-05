'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers, ArrowRight, ShieldCheck, Check } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';

export default function LoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

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
    <div className="min-h-screen bg-zinc-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-600/30">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-zinc-100">
          Sign in to DevBlueprint
        </h2>
        <p className="text-xs text-zinc-400">
          Enterprise developer documentation and technical blueprint platform
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-zinc-900/90 py-8 px-6 shadow-xl border border-zinc-800 sm:rounded-xl sm:px-10 space-y-6">
          {error && (
            <div className="p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300">
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

            <Button
              type="submit"
              variant="primary"
              size="md"
              className="w-full text-xs"
              isLoading={isLoading}
            >
              Sign In to Workspace
            </Button>
          </form>

          {/* Quick Fill Test Accounts */}
          <div className="pt-4 border-t border-zinc-800 space-y-2.5">
            <div className="text-[10px] font-semibold uppercase tracking-wider text-zinc-500 text-center">
              Quick Sign-in (Seeded Accounts)
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                type="button"
                onClick={() => handleQuickFill('owner@devblueprint.io')}
                className="p-2 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-left transition-colors"
              >
                <div className="font-semibold text-rose-400">Sarah Connor</div>
                <div className="text-[10px] text-zinc-500">Workspace Owner</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('admin@devblueprint.io')}
                className="p-2 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-left transition-colors"
              >
                <div className="font-semibold text-amber-400">Alex Rivera</div>
                <div className="text-[10px] text-zinc-500">DevOps Admin</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('editor@devblueprint.io')}
                className="p-2 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-left transition-colors"
              >
                <div className="font-semibold text-blue-400">Elena Rostova</div>
                <div className="text-[10px] text-zinc-500">Lead Editor</div>
              </button>
              <button
                type="button"
                onClick={() => handleQuickFill('viewer@devblueprint.io')}
                className="p-2 rounded border border-zinc-800 bg-zinc-950 hover:bg-zinc-800/80 text-left transition-colors"
              >
                <div className="font-semibold text-zinc-400">Marcus Vance</div>
                <div className="text-[10px] text-zinc-500">Auditor / Viewer</div>
              </button>
            </div>
          </div>

          <div className="text-center pt-2 text-xs text-zinc-500">
            Don&apos;t have an account?{' '}
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 font-medium"
            >
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

