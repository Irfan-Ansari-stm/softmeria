'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Bookmark,
  Search,
  Eye,
  Plus,
  Sparkles,
  FolderOpen,
  ArrowRight,
  Copy,
  Download,
  Upload,
  Trash2,
  Edit2
} from 'lucide-react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';
import { EnterpriseBlueprintModal } from './EnterpriseBlueprintModal';

export function TemplatesLibraryView() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { currentWorkspace } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [applyModalTemplate, setApplyModalTemplate] = useState<any | null>(null);
  const [isEnterpriseBlueprintOpen, setIsEnterpriseBlueprintOpen] = useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

  // Form state for creating custom template
  const [customTitle, setCustomTitle] = useState('');
  const [customCategory, setCustomCategory] = useState('04-backend');
  const [customDescription, setCustomDescription] = useState('');
  const [customPurpose, setCustomPurpose] = useState('');
  const [customSections, setCustomSections] = useState('Overview, Requirements, Implementation, Verification');
  const [customContent, setCustomContent] = useState('# Title\n\n## Overview\n\n## Architecture\n\n## Specifications\n');

  // Apply template state
  const [targetProjectId, setTargetProjectId] = useState('');
  const [targetCategoryId, setTargetCategoryId] = useState('');
  const [docTitle, setDocTitle] = useState('');

  // Fetch templates
  const { data: templates = [], isLoading } = useQuery({
    queryKey: ['templates', currentWorkspace?.id],
    queryFn: async () => {
      const res = await api.get<any[]>('/templates');
      return res.data || [];
    }
  });

  // Fetch user projects for the "Use Template" dropdown
  const { data: projects = [] } = useQuery({
    queryKey: ['projects', currentWorkspace?.id],
    queryFn: async () => {
      if (!currentWorkspace?.id) return [];
      const res = await api.get<any[]>(`/projects?workspaceId=${currentWorkspace.id}`);
      return res.data || [];
    },
    enabled: !!currentWorkspace?.id
  });

  // Fetch categories for selected target project
  const { data: categories = [] } = useQuery({
    queryKey: ['categories-tree', targetProjectId],
    queryFn: async () => {
      if (!targetProjectId) return [];
      const res = await api.get<any[]>(`/projects/${targetProjectId}/categories`);
      return res.data || [];
    },
    enabled: !!targetProjectId
  });

  // Apply template mutation
  const applyTemplateMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post<any>(`/templates/${applyModalTemplate.id}/apply`, {
        projectId: targetProjectId,
        categoryId: targetCategoryId || categories[0]?.id,
        title: docTitle || applyModalTemplate.title
      });
      return res.data;
    },
    onSuccess: (newDoc: any) => {
      setApplyModalTemplate(null);
      router.push(`/projects/${targetProjectId}/docs/${newDoc.id}`);
    }
  });

  // Create custom template mutation
  const createTemplateMutation = useMutation({
    mutationFn: async () => {
      const sections = customSections.split(',').map((s) => s.trim()).filter(Boolean);
      const res = await api.post<any>('/templates', {
        workspaceId: currentWorkspace?.id,
        title: customTitle,
        category: customCategory,
        description: customDescription,
        purpose: customPurpose,
        recommendedSections: sections,
        content: customContent
      });
      return res.data;
    },
    onSuccess: () => {
      setIsCreateModalOpen(false);
      setCustomTitle('');
      setCustomDescription('');
      setCustomPurpose('');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
  });

  // Duplicate template mutation
  const duplicateTemplateMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.post(`/templates/${id}/duplicate`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    }
  });

  // Export template as Markdown
  const handleExportTemplate = (t: any) => {
    const blob = new Blob([t.content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${t.slug || 'template'}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Unique categories
  const categoriesList = ['ALL', ...Array.from(new Set(templates.map((t: any) => t.category)))];

  const filteredTemplates = templates.filter((t: any) => {
    const matchesSearch =
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.purpose.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCat = selectedCategory === 'ALL' || t.category === selectedCategory;
    return matchesSearch && matchesCat;
  });

  return (
    <div className="w-full p-6 lg:p-8 space-y-6 min-w-0">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bookmark className="h-6 w-6 text-primary" />
            <span>Architecture & Blueprint Template Library</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Standardized engineering blueprint templates, architecture specifications, and reusable document patterns
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsCreateModalOpen(true)}
            className="text-xs gap-1.5"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Custom Template</span>
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsEnterpriseBlueprintOpen(true)}
            className="text-xs gap-1.5 shadow-sm"
          >
            <Sparkles className="h-3.5 w-3.5" />
            <span>139-Doc Enterprise Blueprint</span>
          </Button>
        </div>
      </div>

      {/* Search and Category Filter Toolbar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 rounded-xl border border-border bg-card shadow-xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates by title, description or purpose..."
            className="w-full pl-9 pr-3 py-1.5 text-xs rounded-lg border border-border bg-background text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 md:pb-0 scrollbar-thin">
          {categoriesList.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-primary text-primary-foreground shadow-xs font-semibold'
                  : 'bg-background-secondary text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
              }`}
            >
              {cat === 'ALL' ? 'All Categories' : cat}
            </button>
          ))}
        </div>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((t: any) => (
          <Card key={t.id} className="flex flex-col justify-between hover:border-primary/50 transition-all shadow-xs">
            <CardHeader className="p-4 pb-2">
              <div className="flex items-start justify-between gap-2">
                <Badge variant={t.isBuiltin ? 'default' : 'outline'} className="text-[10px]">
                  {t.isBuiltin ? 'Built-in Blueprint' : 'Custom Template'}
                </Badge>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleExportTemplate(t)}
                    title="Export as Markdown"
                    className="p-1 rounded text-foreground-muted hover:text-foreground transition-colors"
                  >
                    <Download className="h-3.5 w-3.5" />
                  </button>
                  <button
                    onClick={() => duplicateTemplateMutation.mutate(t.id)}
                    title="Duplicate Template"
                    className="p-1 rounded text-foreground-muted hover:text-foreground transition-colors"
                  >
                    <Copy className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

              <CardTitle className="text-sm font-bold text-foreground mt-2 line-clamp-1">
                {t.title}
              </CardTitle>
              <p className="text-xs text-foreground-secondary line-clamp-2 mt-1">
                {t.description}
              </p>
            </CardHeader>

            <CardContent className="p-4 pt-2 space-y-3">
              <div className="text-[11px] text-foreground-muted bg-background-secondary/60 p-2 rounded-lg border border-border/50">
                <span className="font-semibold text-foreground">Purpose:</span> {t.purpose}
              </div>

              {t.recommendedSections && t.recommendedSections.length > 0 && (
                <div className="space-y-1">
                  <div className="text-[10px] uppercase font-semibold text-foreground-muted tracking-wider">
                    Recommended Sections
                  </div>
                  <div className="flex flex-wrap gap-1">
                    {t.recommendedSections.slice(0, 3).map((sec: string) => (
                      <span
                        key={sec}
                        className="px-1.5 py-0.5 rounded bg-secondary text-[10px] text-foreground-secondary border border-border truncate max-w-[200px]"
                      >
                        {sec}
                      </span>
                    ))}
                    {t.recommendedSections.length > 3 && (
                      <span className="text-[10px] text-foreground-muted self-center">
                        +{t.recommendedSections.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-3 border-t border-border flex items-center justify-between gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setPreviewTemplate(t)}
                  className="text-xs gap-1 h-8"
                >
                  <Eye className="h-3 w-3" />
                  <span>Preview</span>
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => {
                    setApplyModalTemplate(t);
                    setDocTitle(t.title);
                    setTargetProjectId(projects[0]?.id || '');
                  }}
                  className="text-xs gap-1 h-8 shadow-xs"
                >
                  <Plus className="h-3 w-3" />
                  <span>Use Template</span>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Preview Dialog */}
      {previewTemplate && (
        <Dialog
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={previewTemplate.title}
          description={previewTemplate.description}
          maxWidth="2xl"
        >
          <div className="space-y-4">
            <div className="p-3.5 rounded-xl bg-background border border-border font-mono text-xs max-h-96 overflow-y-auto whitespace-pre-wrap text-foreground-secondary leading-relaxed">
              {previewTemplate.content}
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewTemplate(null)}
              >
                Close
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  setApplyModalTemplate(previewTemplate);
                  setDocTitle(previewTemplate.title);
                  setTargetProjectId(projects[0]?.id || '');
                  setPreviewTemplate(null);
                }}
              >
                Use this Template
              </Button>
            </div>
          </div>
        </Dialog>
      )}

      {/* Use Template in Project Dialog */}
      {applyModalTemplate && (
        <Dialog
          isOpen={!!applyModalTemplate}
          onClose={() => setApplyModalTemplate(null)}
          title={`Apply Template: ${applyModalTemplate.title}`}
          description="Create a new editable Markdown specification inside your project."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              applyTemplateMutation.mutate();
            }}
            className="space-y-4"
          >
            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-secondary">Target Project *</label>
              <select
                value={targetProjectId}
                onChange={(e) => setTargetProjectId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                required
              >
                {projects.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-secondary">Category *</label>
              <select
                value={targetCategoryId}
                onChange={(e) => setTargetCategoryId(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                required
              >
                {categories.map((c: any) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>

            <Input
              label="Document Title *"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
              placeholder="Document Title"
              required
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setApplyModalTemplate(null)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={applyTemplateMutation.isPending}
                disabled={!targetProjectId || !docTitle.trim()}
              >
                Create Document & Open Editor
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Create Custom Template Dialog */}
      {isCreateModalOpen && (
        <Dialog
          isOpen={isCreateModalOpen}
          onClose={() => setIsCreateModalOpen(false)}
          title="Create Custom Engineering Template"
          description="Define a reusable document pattern for your team."
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTemplateMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Template Title *"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
              placeholder="e.g. Microservice Incident Postmortem"
              required
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-secondary">Category *</label>
              <input
                type="text"
                value={customCategory}
                onChange={(e) => setCustomCategory(e.target.value)}
                placeholder="e.g. 04-backend or 08-operations"
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                required
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-secondary">Description *</label>
              <Textarea
                value={customDescription}
                onChange={(e) => setCustomDescription(e.target.value)}
                placeholder="Brief summary of when and why to use this template."
                rows={2}
                required
              />
            </div>

            <Input
              label="Recommended Sections (comma separated)"
              value={customSections}
              onChange={(e) => setCustomSections(e.target.value)}
              placeholder="Overview, Architecture, Implementation, Testing"
            />

            <div className="space-y-1.5">
              <label className="text-xs font-medium text-foreground-secondary">Markdown Content *</label>
              <Textarea
                value={customContent}
                onChange={(e) => setCustomContent(e.target.value)}
                rows={6}
                className="font-mono text-xs"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-3 border-t border-border">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setIsCreateModalOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="sm"
                isLoading={createTemplateMutation.isPending}
                disabled={!customTitle.trim()}
              >
                Save Template
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Enterprise Blueprint Explorer & Apply Modal */}
      <EnterpriseBlueprintModal
        isOpen={isEnterpriseBlueprintOpen}
        onClose={() => setIsEnterpriseBlueprintOpen(false)}
        projects={projects}
      />
    </div>
  );
}
