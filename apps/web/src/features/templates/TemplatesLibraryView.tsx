'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Bookmark, Search, Eye, Plus } from 'lucide-react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';

export function TemplatesLibraryView() {
  const router = useRouter();
  const { currentWorkspace } = useAuthStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [previewTemplate, setPreviewTemplate] = useState<any | null>(null);
  const [applyModalTemplate, setApplyModalTemplate] = useState<any | null>(null);

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
    <div className="p-8 space-y-6 max-w-7xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-2.5">
            <Bookmark className="h-6 w-6 text-primary" />
            <span>Architecture & Blueprint Template Library</span>
          </h1>
          <p className="text-xs text-foreground-muted mt-1">
            Production-tested templates for software specifications, API standards, data models, and QA roadmaps.
          </p>
        </div>
      </div>

      {/* Filter and Search */}
      <div className="flex flex-col sm:flex-row items-center gap-3">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search templates by title, section, or architectural goal..."
            className="w-full pl-9 pr-4 py-2 rounded-lg border border-border bg-background text-xs text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
          />
        </div>

        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary w-full sm:w-auto shadow-xs"
        >
          {categoriesList.map((c) => (
            <option key={c} value={c}>
              {c === 'ALL' ? 'All Blueprint Categories' : c}
            </option>
          ))}
        </select>
      </div>

      {/* Templates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTemplates.map((t: any) => (
          <Card
            key={t.id}
            className="hover:border-primary/50 transition-all flex flex-col justify-between group shadow-sm"
          >
            <CardHeader className="p-5 pb-3">
              <div className="flex items-start justify-between gap-2">
                <Badge variant="outline" className="text-[10px] text-primary border-primary/30 bg-primary/10">
                  {t.category}
                </Badge>
                {t.isBuiltin && (
                  <span className="text-[10px] font-mono text-foreground-muted">Standard</span>
                )}
              </div>
              <CardTitle className="text-sm font-semibold mt-2 text-foreground group-hover:text-primary transition-colors">
                {t.title}
              </CardTitle>
              <p className="text-xs text-foreground-secondary mt-1 line-clamp-2 leading-relaxed">
                {t.description}
              </p>
            </CardHeader>

            <CardContent className="p-5 pt-0 space-y-4">
              {/* Recommended Sections preview */}
              {t.recommendedSections && t.recommendedSections.length > 0 && (
                <div className="space-y-1">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                    Recommended Sections:
                  </span>
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
                  className="text-xs gap-1 h-8"
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
    </div>
  );
}
