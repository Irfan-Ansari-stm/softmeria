'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Sparkles,
  Layers,
  FileText,
  CheckCircle2,
  FolderOpen,
  ArrowRight,
  Eye,
  Check
} from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { api } from '../../lib/api';

interface EnterpriseBlueprintModalProps {
  isOpen: boolean;
  onClose: () => void;
  projects: Array<{ id: string; name: string }>;
}

export function EnterpriseBlueprintModal({
  isOpen,
  onClose,
  projects
}: EnterpriseBlueprintModalProps) {
  const router = useRouter();
  const queryClient = useQueryClient();

  const [targetProjectId, setTargetProjectId] = useState(projects[0]?.id || '');
  const [activeCategorySlug, setActiveCategorySlug] = useState('root');
  const [previewDoc, setPreviewDoc] = useState<any | null>(null);
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch manifest
  const { data: manifest, isLoading } = useQuery({
    queryKey: ['documentation-seeds-manifest'],
    queryFn: async () => {
      const res = await api.get<any>('/documentation-seeds/manifest?option=FULL');
      return res.data;
    },
    enabled: isOpen
  });

  // Initialize selected categories when manifest loads
  React.useEffect(() => {
    if (manifest?.categories && selectedCategories.length === 0) {
      setSelectedCategories(manifest.categories.map((c: any) => c.slug));
    }
  }, [manifest, selectedCategories.length]);

  React.useEffect(() => {
    if (projects.length > 0 && !targetProjectId) {
      setTargetProjectId(projects[0].id);
    }
  }, [projects, targetProjectId]);

  const toggleCategory = (slug: string) => {
    if (selectedCategories.includes(slug)) {
      setSelectedCategories(selectedCategories.filter((s) => s !== slug));
    } else {
      setSelectedCategories([...selectedCategories, slug]);
    }
  };

  const applyBlueprintMutation = useMutation({
    mutationFn: async (applyAll: boolean) => {
      if (!targetProjectId) throw new Error('Please select a target project');

      const res = await api.post<any>(`/projects/${targetProjectId}/seed-blueprint`, {
        blueprintOption: applyAll ? 'FULL' : 'CUSTOM',
        selectedCategories: applyAll ? undefined : selectedCategories
      });
      return res.data;
    },
    onSuccess: (data: any) => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      queryClient.invalidateQueries({ queryKey: ['categories-tree', targetProjectId] });
      queryClient.invalidateQueries({ queryKey: ['project', targetProjectId] });
      setSuccessMessage(
        `Successfully applied blueprint! ${data.documentsCreated} new documents created (${data.documentsSkipped} existing documents preserved).`
      );
    }
  });

  const activeCategory = (manifest?.categories || []).find(
    (c: any) => c.slug === activeCategorySlug
  );

  return (
    <Dialog
      isOpen={isOpen}
      onClose={onClose}
      title="Enterprise Software Documentation Blueprint"
      description="A complete engineering documentation structure covering product planning, architecture, design systems, UI components, frontend, backend, databases, security, testing, DevOps, and maintenance."
      maxWidth="2xl"
    >
      <div className="space-y-5 pt-2">
        {successMessage ? (
          <div className="p-6 rounded-xl border border-success/30 bg-success/5 space-y-4 text-center">
            <div className="h-12 w-12 rounded-full bg-success/20 flex items-center justify-center text-success mx-auto">
              <CheckCircle2 className="h-7 w-7" />
            </div>
            <div>
              <h3 className="font-bold text-base text-foreground">Blueprint Successfully Seeded</h3>
              <p className="text-xs text-foreground-muted mt-1 max-w-md mx-auto">
                {successMessage}
              </p>
            </div>
            <div className="pt-2 flex justify-center gap-3">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSuccessMessage(null)}
                className="text-xs"
              >
                Apply Another
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => {
                  onClose();
                  router.push(`/projects/${targetProjectId}`);
                }}
                className="text-xs gap-1.5"
              >
                <span>Open Project Workspace</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        ) : (
          <>
            {/* Target Project Selection & Stats */}
            <div className="p-4 rounded-xl border border-border bg-card flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-foreground">Target Project</label>
                <select
                  value={targetProjectId}
                  onChange={(e) => setTargetProjectId(e.target.value)}
                  className="h-8 px-2.5 rounded-lg border border-border bg-background text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
                >
                  {projects.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center gap-4 text-xs font-mono text-foreground-muted">
                <div>
                  <span className="text-foreground font-semibold">
                    {manifest?.totalCategories || 13}
                  </span>{' '}
                  Categories
                </div>
                <div>•</div>
                <div>
                  <span className="text-foreground font-semibold">
                    {manifest?.totalDocuments || 130}
                  </span>{' '}
                  Total Documents
                </div>
              </div>
            </div>

            {/* Two Column Explorer: Categories vs Documents */}
            <div className="grid grid-cols-1 md:grid-cols-12 gap-4 h-96 border border-border rounded-xl overflow-hidden bg-background">
              {/* Left Column: Categories List */}
              <div className="md:col-span-5 border-r border-border overflow-y-auto divide-y divide-border bg-background-secondary/40">
                <div className="p-2.5 bg-background sticky top-0 border-b border-border flex items-center justify-between text-xs font-semibold text-foreground z-10">
                  <span>Categories</span>
                  <span className="text-[10px] text-foreground-muted">
                    {selectedCategories.length} selected
                  </span>
                </div>

                {(manifest?.categories || []).map((cat: any) => {
                  const isActive = activeCategorySlug === cat.slug;
                  const isChecked = selectedCategories.includes(cat.slug);

                  return (
                    <div
                      key={cat.slug}
                      onClick={() => setActiveCategorySlug(cat.slug)}
                      className={`p-2.5 text-xs flex items-center justify-between cursor-pointer transition-colors ${
                        isActive
                          ? 'bg-primary/10 text-primary font-medium'
                          : 'hover:bg-background-tertiary text-foreground-secondary'
                      }`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <input
                          type="checkbox"
                          checked={isChecked}
                          onChange={(e) => {
                            e.stopPropagation();
                            toggleCategory(cat.slug);
                          }}
                          className="rounded border-border text-primary focus:ring-primary h-3.5 w-3.5"
                        />
                        <span className="truncate">{cat.name}</span>
                      </div>
                      <span className="text-[10px] font-mono text-foreground-muted shrink-0 ml-1">
                        {cat.documentCount}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Right Column: Documents in Active Category */}
              <div className="md:col-span-7 flex flex-col h-full overflow-hidden">
                <div className="p-2.5 border-b border-border bg-background flex items-center justify-between text-xs shrink-0">
                  <div className="truncate font-semibold text-foreground">
                    {activeCategory?.name}
                  </div>
                  <span className="text-[10px] text-foreground-muted font-mono shrink-0">
                    {activeCategory?.documents?.length || 0} specs
                  </span>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-border p-2 space-y-1">
                  {(activeCategory?.documents || []).map((doc: any) => (
                    <div
                      key={doc.id}
                      className="p-2 rounded-lg hover:bg-background-secondary text-xs flex items-center justify-between group transition-colors"
                    >
                      <div className="flex items-center gap-2 truncate flex-1 min-w-0">
                        <FileText className="h-3.5 w-3.5 text-foreground-muted shrink-0 group-hover:text-primary" />
                        <div className="truncate">
                          <p className="font-medium text-foreground truncate">{doc.title}</p>
                          <p className="text-[10px] text-foreground-muted font-mono truncate">
                            {doc.fileName}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 shrink-0 ml-2">
                        <Badge variant="outline" className="text-[9px] py-0 px-1.5">
                          {doc.initialStatus}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between pt-3 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={onClose}>
                Cancel
              </Button>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  disabled={selectedCategories.length === 0 || applyBlueprintMutation.isPending}
                  onClick={() => applyBlueprintMutation.mutate(false)}
                  className="text-xs whitespace-nowrap"
                >
                  Apply Selected Categories ({selectedCategories.length})
                </Button>

                <Button
                  type="button"
                  variant="primary"
                  size="sm"
                  isLoading={applyBlueprintMutation.isPending}
                  onClick={() => applyBlueprintMutation.mutate(true)}
                  className="text-xs gap-1.5 whitespace-nowrap"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Apply Entire Blueprint (130 Docs)</span>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </Dialog>
  );
}
