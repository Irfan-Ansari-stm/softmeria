'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Dialog } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { api } from '../../lib/api';
import { useAuthStore } from '../../stores/useAuthStore';
import { Layers } from 'lucide-react';

interface CreateWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateWorkspaceModal({ isOpen, onClose }: CreateWorkspaceModalProps) {
  const router = useRouter();
  const { workspaces, setCurrentWorkspace } = useAuthStore();
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    const generated = val
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
    setSlug(generated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsLoading(true);
    setError(null);

    try {
      const res = await api.post<any>('/workspaces', {
        name: name.trim(),
        slug: slug.trim() || undefined
      });

      if (res.success && res.data) {
        const newWs = res.data;
        setCurrentWorkspace(newWs);
        useAuthStore.setState({ workspaces: [...workspaces, newWs] });
        onClose();
        setName('');
        setSlug('');
        router.push('/dashboard');
      } else {
        setError(res.message || 'Failed to create workspace');
      }
    } catch (err: any) {
      setError(err?.message || 'Error creating workspace');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
            <Layers className="h-5 w-5" />
          </div>
          <div>
            <h2 className="text-base font-semibold text-foreground">Create New Workspace</h2>
            <p className="text-xs text-foreground-muted">
              Workspaces organize your team, projects, blueprints, and portfolio governance.
            </p>
          </div>
        </div>

        {error && (
          <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs">
            {error}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Workspace Name *
            </label>
            <Input
              type="text"
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="e.g. Acme Mobile Engineering"
              required
              autoFocus
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-foreground mb-1.5">
              Workspace URL Slug
            </label>
            <Input
              type="text"
              value={slug}
              onChange={(e) => setSlug(e.target.value)}
              placeholder="acme-mobile-engineering"
            />
            <p className="text-[11px] text-foreground-muted mt-1 font-mono">
              app.devblueprint.io/{slug || 'workspace-slug'}
            </p>
          </div>
        </div>

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" isLoading={isLoading} disabled={!name.trim()}>
            Create Workspace
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
