'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Layers } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';

export default function RegisterPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<any>('/auth/register', { name, email, password });
      if (res.success && res.data) {
        setAuth(res.data.user, res.data.tokens.accessToken, [res.data.workspace]);
        router.push('/dashboard');
      }
    } catch (err: any) {
      setError(err.message || 'Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <div className="mx-auto h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
          <Layers className="h-6 w-6" />
        </div>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Create DevBlueprint Account
        </h2>
        <p className="text-xs text-foreground-muted">
          Establish an isolated engineering workspace for your team
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
              label="Full Name *"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Linus Torvalds"
              required
            />

            <Input
              label="Work Email *"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="developer@company.com"
              required
            />

            <Input
              label="Password (min 8 chars) *"
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
              className="w-full text-xs shadow-sm"
              isLoading={isLoading}
            >
              Get Started with Light Mode
            </Button>
          </form>

          <div className="text-center pt-2 text-xs text-foreground-muted">
            Already have an account?{' '}
            <Link
              href="/login"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
