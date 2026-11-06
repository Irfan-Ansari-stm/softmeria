'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { PROJECT_TYPES, PROJECT_VISIBILITIES, slugify } from '@devblueprint/shared';

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CreateProjectModal({ isOpen, onClose }: CreateProjectModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useAuthStore();

  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [description, setDescription] = useState('');
  const [projectType, setProjectType] = useState<string>(PROJECT_TYPES[0]);
  const [category, setCategory] = useState('Engineering');
  const [techStackInput, setTechStackInput] = useState('');
  const [techStack, setTechStack] = useState<string[]>(['Next.js', 'TypeScript', 'PostgreSQL']);
  const [repositoryUrl, setRepositoryUrl] = useState('');
  const [color, setColor] = useState('#2563EB');
  const [visibility, setVisibility] = useState<string>('PRIVATE');
  const [initDefaultCategories, setInitDefaultCategories] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const handleNameChange = (val: string) => {
    setName(val);
    setSlug(slugify(val));
  };

  const handleAddTech = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      const val = techStackInput.trim().replace(/,/g, '');
      if (val && !techStack.includes(val)) {
        setTechStack([...techStack, val]);
        setTechStackInput('');
      }
    }
  };

  const handleRemoveTech = (tag: string) => {
    setTechStack(techStack.filter((t) => t !== tag));
  };

  const createProjectMutation = useMutation({
    mutationFn: async () => {
      if (!currentWorkspace) throw new Error('No active workspace');
      const res = await api.post<any>('/projects', {
        workspaceId: currentWorkspace.id,
        name,
        slug,
        description,
        projectType,
        category,
        techStack,
        repositoryUrl: repositoryUrl || undefined,
        color,
        visibility,
        initDefaultCategories
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });
      onClose();
      router.push(`/projects/${data.id}`);
    },
    onError: (err: any) => {
      setError(err.message || 'Failed to create project');
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    createProjectMutation.mutate();
  };

  const colors = [
    '#2563EB', // Blue
    '#059669', // Emerald
    '#D97706', // Amber
    '#7C3AED', // Violet
    '#DC2626', // Red
    '#0891B2', // Cyan
    '#DB2777'  // Pink
  ];

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Create Engineering Project"
      description="Initialize a centralized technical blueprint architecture workspace for your application."
      maxWidth="xl"
    >
      <form onSubmit={handleSubmit} className="space-y-4 pt-2">
        {error && (
          <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-xs text-destructive">
            {error}
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Input
            label="Project Name *"
            value={name}
            onChange={(e) => handleNameChange(e.target.value)}
            placeholder="e.g. Core Payment Platform"
            required
          />
          <Input
            label="URL Slug *"
            value={slug}
            onChange={(e) => setSlug(e.target.value)}
            placeholder="core-payment-platform"
            required
          />
        </div>

        <Textarea
          label="Project Description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Briefly describe the purpose, domain, and architecture goals..."
          rows={2}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-secondary">Project Type</label>
            <select
              value={projectType}
              onChange={(e) => setProjectType(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              {PROJECT_TYPES.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-medium text-foreground-secondary">Visibility</label>
            <select
              value={visibility}
              onChange={(e) => setVisibility(e.target.value)}
              className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            >
              {PROJECT_VISIBILITIES.map((v) => (
                <option key={v} value={v}>
                  {v}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Tech Stack Chips Input */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-secondary">
            Technology Stack (Press Enter or Comma to add)
          </label>
          <div className="min-h-[40px] p-2 rounded-lg border border-border bg-background flex flex-wrap gap-1.5 items-center shadow-xs">
            {techStack.map((tech) => (
              <span
                key={tech}
                className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-secondary text-xs text-foreground-secondary font-mono border border-border"
              >
                <span>{tech}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveTech(tech)}
                  className="hover:text-destructive"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
            <input
              type="text"
              value={techStackInput}
              onChange={(e) => setTechStackInput(e.target.value)}
              onKeyDown={handleAddTech}
              placeholder="Add tech (e.g. Next.js, Redis)..."
              className="bg-transparent text-xs text-foreground focus:outline-none flex-1 min-w-[120px]"
            />
          </div>
        </div>

        <Input
          label="Git Repository URL (Optional)"
          value={repositoryUrl}
          onChange={(e) => setRepositoryUrl(e.target.value)}
          placeholder="https://github.com/org/repo"
        />

        {/* Accent Color Selection */}
        <div className="space-y-1.5">
          <label className="text-xs font-medium text-foreground-secondary">Project Accent Color</label>
          <div className="flex items-center gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                className={`h-6 w-6 rounded-full transition-transform ${
                  color === c ? 'scale-125 ring-2 ring-primary ring-offset-2 ring-offset-background' : 'hover:scale-110'
                }`}
                style={{ backgroundColor: c }}
              />
            ))}
          </div>
        </div>

        {/* Default Blueprint Structure Checkbox */}
        <div className="p-3.5 rounded-xl border border-primary/30 bg-primary/5 space-y-1.5">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="initDefaultCategories"
              checked={initDefaultCategories}
              onChange={(e) => setInitDefaultCategories(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary h-4 w-4"
            />
            <label
              htmlFor="initDefaultCategories"
              className="text-xs font-semibold text-primary cursor-pointer"
            >
              Generate Complete Blueprint Structure (Recommended)
            </label>
          </div>
          <p className="text-[11px] text-foreground-muted pl-6 leading-relaxed">
            Automatically provisions all 8 architectural categories (Product, Design, Frontend, Backend, Infrastructure, Quality & Security, Data & Integrations, Governance) with 47 pre-configured engineering documents.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-border">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button
            type="submit"
            variant="primary"
            size="sm"
            isLoading={createProjectMutation.isPending}
            disabled={!name.trim()}
          >
            Create Project & Blueprint
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
