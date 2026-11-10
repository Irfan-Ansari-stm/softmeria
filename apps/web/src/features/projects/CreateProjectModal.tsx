'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { X, CheckCircle2, FileText, FolderKanban, Layers, Sparkles, ArrowRight } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { PROJECT_TYPES, PROJECT_VISIBILITIES, slugify } from '@devblueprint/shared';

export type BlueprintOption = 'FULL' | 'MINIMAL' | 'BLANK' | 'CUSTOM';

const BLUEPRINT_CATEGORIES = [
  { slug: 'root', name: 'Project Root (README, AGENTS, Overview)', count: 5 },
  { slug: '01-project', name: '01. Project Management & Requirements', count: 5 },
  { slug: '02-architecture', name: '02. System Architecture & Decisions', count: 6 },
  { slug: '03-design-system', name: '03. Design System & Tokens', count: 19 },
  { slug: '04-ui-components', name: '04. UI Component Library', count: 37 },
  { slug: '05-page-design', name: '05. Page Designs & Views', count: 9 },
  { slug: '06-frontend', name: '06. Frontend Architecture & Standards', count: 11 },
  { slug: '07-backend', name: '07. Backend Architecture & Services', count: 11 },
  { slug: '08-database', name: '08. Database Schema & Data Models', count: 7 },
  { slug: '09-security', name: '09. Security Policies & Hardening', count: 6 },
  { slug: '10-testing', name: '10. Testing Strategy & Quality Assurance', count: 8 },
  { slug: '11-devops', name: '11. DevOps, CI/CD & Cloud Infrastructure', count: 9 },
  { slug: '12-maintenance', name: '12. Maintenance, Monitoring & Operations', count: 6 }
];

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
  const [blueprintOption, setBlueprintOption] = useState<BlueprintOption>('FULL');
  const [selectedCategories, setSelectedCategories] = useState<string[]>(
    BLUEPRINT_CATEGORIES.map((c) => c.slug)
  );
  const [generationSummary, setGenerationSummary] = useState<any | null>(null);
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

  const toggleCategorySelection = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((s) => s !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
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
        blueprintOption,
        selectedCategories: blueprintOption === 'CUSTOM' ? selectedCategories : undefined
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['dashboard'] });

      // Calculate generation stats from manifest
      let docsCount = 130;
      let catCount = 13;
      if (blueprintOption === 'MINIMAL') {
        docsCount = 18;
        catCount = 9;
      } else if (blueprintOption === 'BLANK') {
        docsCount = 0;
        catCount = 0;
      } else if (blueprintOption === 'CUSTOM') {
        catCount = selectedCategories.length;
        docsCount = BLUEPRINT_CATEGORIES.filter((c) => selectedCategories.includes(c.slug)).reduce(
          (sum, c) => sum + c.count,
          0
        );
      }

      setGenerationSummary({
        project: data,
        blueprintOption,
        categoriesCount: catCount,
        documentsCount: docsCount
      });
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

  const handleFinishAndNavigate = () => {
    if (generationSummary?.project?.id) {
      onClose();
      router.push(`/projects/${generationSummary.project.id}`);
    } else {
      onClose();
    }
  };

  // If generation summary is ready, render success report
  if (generationSummary) {
    return (
      <Dialog
        isOpen={isOpen}
        onClose={handleFinishAndNavigate}
        title="Documentation Blueprint Generated"
        description="Your enterprise engineering documentation workspace has been successfully created and populated."
        maxWidth="lg"
      >
        <div className="space-y-6 pt-2">
          <div className="p-5 rounded-xl border border-success/30 bg-success/5 space-y-3">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-success/20 flex items-center justify-center text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-foreground">
                  {generationSummary.project.name} is Ready
                </h3>
                <p className="text-xs text-foreground-muted">
                  Initialized with{' '}
                  <span className="font-medium text-foreground">
                    {generationSummary.blueprintOption === 'FULL'
                      ? 'Full Enterprise Blueprint'
                      : generationSummary.blueprintOption === 'MINIMAL'
                      ? 'Minimal Core Blueprint'
                      : generationSummary.blueprintOption === 'CUSTOM'
                      ? 'Custom Blueprint'
                      : 'Blank Workspace'}
                  </span>
                </p>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-2 border-t border-success/20">
              <div className="p-2.5 rounded-lg bg-background/80 border border-border">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Categories</p>
                <p className="text-lg font-bold text-foreground font-mono mt-0.5">
                  {generationSummary.categoriesCount}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/80 border border-border">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Documents</p>
                <p className="text-lg font-bold text-foreground font-mono mt-0.5">
                  {generationSummary.documentsCount}
                </p>
              </div>
              <div className="p-2.5 rounded-lg bg-background/80 border border-border">
                <p className="text-[10px] text-foreground-muted uppercase tracking-wider">Initial Status</p>
                <p className="text-sm font-semibold text-amber-500 mt-1">DRAFT / NOT_STARTED</p>
              </div>
            </div>
          </div>

          <div className="space-y-2 text-xs text-foreground-secondary">
            <p className="font-medium text-foreground">What was generated:</p>
            <ul className="space-y-1.5 list-disc list-inside text-foreground-muted">
              <li>Root governance files (README, AGENTS, CONTRIBUTING, CHANGELOG, PROJECT-OVERVIEW)</li>
              <li>12 domain categories (Project, Architecture, Design System, UI Components, Page Design, Frontend, Backend, Database, Security, Testing, DevOps, Maintenance)</li>
              <li>Production starter markdown content with Mermaid diagrams and acceptance criteria</li>
              <li>Initial version snapshots (v1) for every document</li>
            </ul>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-border">
            <Button
              variant="primary"
              size="sm"
              onClick={handleFinishAndNavigate}
              className="text-xs gap-1.5 whitespace-nowrap"
            >
              <span>Open Project Workspace</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
          </div>
        </div>
      </Dialog>
    );
  }

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

        {/* Documentation Blueprint Selection Step */}
        <div className="space-y-3 pt-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Sparkles className="h-4 w-4 text-primary" />
              <span>Documentation Blueprint Setup</span>
            </label>
            <span className="text-[11px] text-foreground-muted">Select workspace documentation level</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
            {/* Option A: Full Enterprise Blueprint */}
            <div
              onClick={() => setBlueprintOption('FULL')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                blueprintOption === 'FULL'
                  ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-background-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-foreground">Full Enterprise Blueprint</span>
                <Badge variant="info" className="text-[9px] px-1.5 py-0">Recommended</Badge>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                All 12 domain categories + Root governance with 139 complete production Markdown specifications.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-primary font-medium">
                <span>13 Categories</span>
                <span>•</span>
                <span>139 Documents</span>
              </div>
            </div>

            {/* Option B: Minimal Blueprint */}
            <div
              onClick={() => setBlueprintOption('MINIMAL')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                blueprintOption === 'MINIMAL'
                  ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-background-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-foreground">Minimal Blueprint</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">Essential</Badge>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                Core architectural essentials: requirements, system architecture, database, API design, CI/CD.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-foreground-muted font-medium">
                <span>9 Categories</span>
                <span>•</span>
                <span>18 Documents</span>
              </div>
            </div>

            {/* Option C: Blank Project */}
            <div
              onClick={() => setBlueprintOption('BLANK')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                blueprintOption === 'BLANK'
                  ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-background-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-foreground">Blank Project</span>
                <Badge variant="default" className="text-[9px] px-1.5 py-0">Clean</Badge>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                Start from scratch without any seeded categories or markdown files.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-foreground-muted font-medium">
                <span>0 Categories</span>
                <span>•</span>
                <span>0 Documents</span>
              </div>
            </div>

            {/* Option D: Custom Blueprint */}
            <div
              onClick={() => setBlueprintOption('CUSTOM')}
              className={`p-3 rounded-xl border cursor-pointer transition-all ${
                blueprintOption === 'CUSTOM'
                  ? 'border-primary bg-primary/10 shadow-xs ring-1 ring-primary'
                  : 'border-border bg-card hover:bg-background-secondary'
              }`}
            >
              <div className="flex items-center justify-between gap-1">
                <span className="text-xs font-semibold text-foreground">Custom Blueprint</span>
                <Badge variant="outline" className="text-[9px] px-1.5 py-0">Select</Badge>
              </div>
              <p className="text-[11px] text-foreground-muted mt-1 leading-relaxed">
                Choose specifically which categories and specifications to generate.
              </p>
              <div className="flex items-center gap-3 mt-2 text-[10px] text-foreground-muted font-medium">
                <span>{selectedCategories.length} Categories Selected</span>
              </div>
            </div>
          </div>

          {/* Custom Blueprint Categories Selector */}
          {blueprintOption === 'CUSTOM' && (
            <div className="p-3 rounded-xl border border-border bg-background-secondary/50 space-y-2 animate-in fade-in">
              <div className="flex items-center justify-between text-xs font-medium text-foreground">
                <span>Select Categories to Include:</span>
                <button
                  type="button"
                  onClick={() =>
                    setSelectedCategories(
                      selectedCategories.length === BLUEPRINT_CATEGORIES.length
                        ? []
                        : BLUEPRINT_CATEGORIES.map((c) => c.slug)
                    )
                  }
                  className="text-primary text-[11px] hover:underline"
                >
                  {selectedCategories.length === BLUEPRINT_CATEGORIES.length
                    ? 'Deselect All'
                    : 'Select All'}
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 max-h-48 overflow-y-auto p-1">
                {BLUEPRINT_CATEGORIES.map((cat) => (
                  <label
                    key={cat.slug}
                    className="flex items-center justify-between p-2 rounded-lg border border-border bg-background text-xs cursor-pointer hover:border-primary/50 transition-colors"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.slug)}
                        onChange={() => toggleCategorySelection(cat.slug)}
                        className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                      />
                      <span className="truncate">{cat.name}</span>
                    </div>
                    <span className="text-[10px] font-mono text-foreground-muted shrink-0 ml-1">
                      {cat.count} docs
                    </span>
                  </label>
                ))}
              </div>
            </div>
          )}
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
            className="whitespace-nowrap"
          >
            Create Project & Blueprint
          </Button>
        </div>
      </form>
    </Dialog>
  );
}
