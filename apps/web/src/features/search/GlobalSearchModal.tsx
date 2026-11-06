'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Search, FileText, FolderKanban, ArrowRight, Loader2, X } from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { useAuthStore } from '../../stores/useAuthStore';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { currentWorkspace } = useAuthStore();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<{ documents: any[]; projects: any[] }>({
    documents: [],
    projects: []
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({ documents: [], projects: [] });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || !currentWorkspace) {
      setResults({ documents: [], projects: [] });
      setIsLoading(false);
      return;
    }

    const timer = setTimeout(async () => {
      setIsLoading(true);
      try {
        const res = await api.get<any>(
          `/search?workspaceId=${currentWorkspace.id}&q=${encodeURIComponent(query)}`
        );
        if (res.success && res.data) {
          setResults(res.data);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, currentWorkspace]);

  const handleSelectDoc = (projectId: string, docId: string) => {
    onClose();
    router.push(`/projects/${projectId}/docs/${docId}`);
  };

  const handleSelectProject = (projectId: string) => {
    onClose();
    router.push(`/projects/${projectId}`);
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search all documents, markdown code, blueprint categories, or projects..."
            className="w-full pl-9 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            autoFocus
          />
          {isLoading ? (
            <Loader2 className="absolute right-3 h-4 w-4 animate-spin text-foreground-muted" />
          ) : query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-0.5 text-foreground-muted hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          ) : null}
        </div>

        {/* Results List */}
        <div className="max-h-[60vh] overflow-y-auto space-y-4 pr-1">
          {/* Projects Results */}
          {results.projects.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted px-2">
                Projects
              </div>
              {results.projects.map((p) => (
                <button
                  key={p.id}
                  onClick={() => handleSelectProject(p.id)}
                  className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-background-secondary transition-colors text-left group border border-transparent hover:border-border shadow-xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm"
                      style={{ backgroundColor: p.color || '#2563EB' }}
                    >
                      <FolderKanban className="h-4 w-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors">
                        {p.name}
                      </p>
                      <p className="text-[11px] text-foreground-secondary truncate">
                        {p.description || p.projectType}
                      </p>
                    </div>
                  </div>
                  <ArrowRight className="h-4 w-4 text-foreground-muted group-hover:text-foreground transition-colors" />
                </button>
              ))}
            </div>
          )}

          {/* Documents Results */}
          {results.documents.length > 0 && (
            <div className="space-y-1">
              <div className="text-[11px] font-semibold uppercase tracking-wider text-foreground-muted px-2">
                Documents & Blueprints
              </div>
              {results.documents.map((d) => (
                <button
                  key={d.id}
                  onClick={() => handleSelectDoc(d.project.id, d.id)}
                  className="w-full p-2.5 rounded-lg hover:bg-background-secondary transition-colors text-left group border border-border/60 hover:border-border space-y-1.5 shadow-xs"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className="h-4 w-4 text-primary shrink-0" />
                      <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                        {d.title}
                      </span>
                      <span className="text-[10px] text-foreground-muted font-mono">
                        ({d.fileName})
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-[10px] py-0 px-1.5">
                        {d.project.name}
                      </Badge>
                      <span className="text-[10px] text-foreground-muted">v{d.versionNumber}</span>
                    </div>
                  </div>
                  {d.snippet && (
                    <p className="text-[11px] text-foreground-secondary font-mono line-clamp-2 pl-6 bg-background-secondary/80 p-1.5 rounded-md border border-border">
                      {d.snippet}
                    </p>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Empty State */}
          {query.trim() &&
            !isLoading &&
            results.projects.length === 0 &&
            results.documents.length === 0 && (
              <div className="py-8 text-center text-xs text-foreground-muted">
                No documents or projects matching &ldquo;{query}&rdquo;
              </div>
            )}

          {!query.trim() && (
            <div className="py-8 text-center text-xs text-foreground-muted">
              Type keywords to search across titles, files, markdown text, and tags.
            </div>
          )}
        </div>
      </div>
    </Dialog>
  );
}
