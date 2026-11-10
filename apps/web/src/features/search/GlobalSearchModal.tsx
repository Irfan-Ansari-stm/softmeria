'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  FileText,
  FolderKanban,
  CheckSquare,
  Bookmark,
  Users,
  MessageSquare,
  Bug,
  Rocket,
  ArrowRight,
  Loader2,
  X,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Dialog } from '../../components/ui/dialog';
import { useAuthStore } from '../../stores/useAuthStore';
import { useNavigationStore } from '../../stores/useNavigationStore';
import { api } from '../../lib/api';
import { Badge } from '../../components/ui/badge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type SearchCategory = 'ALL' | 'PROJECTS' | 'TASKS' | 'DOCS' | 'BUGS' | 'TEAM' | 'DISCUSSIONS' | 'RELEASES';

export function GlobalSearchModal({ isOpen, onClose }: GlobalSearchModalProps) {
  const router = useRouter();
  const { currentWorkspace } = useAuthStore();
  const { addRecentItem } = useNavigationStore();
  const [query, setQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('ALL');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  const [results, setResults] = useState<{
    documents: any[];
    projects: any[];
    tasks: any[];
    templates: any[];
    teamMembers: any[];
    discussions: any[];
    bugs: any[];
    releases: any[];
  }>({
    documents: [],
    projects: [],
    tasks: [],
    templates: [],
    teamMembers: [],
    discussions: [],
    bugs: [],
    releases: []
  });

  const [isLoading, setIsLoading] = useState(false);

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('devblueprint_recent_searches');
        if (saved) setRecentSearches(JSON.parse(saved));
      } catch (e) {
        // ignore
      }
    }
  }, [isOpen]);

  const saveRecentSearch = (term: string) => {
    if (!term.trim()) return;
    const next = [term.trim(), ...recentSearches.filter((s) => s !== term.trim())].slice(0, 5);
    setRecentSearches(next);
    if (typeof window !== 'undefined') {
      localStorage.setItem('devblueprint_recent_searches', JSON.stringify(next));
    }
  };

  const clearRecentSearches = () => {
    setRecentSearches([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('devblueprint_recent_searches');
    }
  };

  useEffect(() => {
    if (!isOpen) {
      setQuery('');
      setResults({
        documents: [],
        projects: [],
        tasks: [],
        templates: [],
        teamMembers: [],
        discussions: [],
        bugs: [],
        releases: []
      });
      return;
    }
  }, [isOpen]);

  useEffect(() => {
    if (!query.trim() || !currentWorkspace) {
      setResults({
        documents: [],
        projects: [],
        tasks: [],
        templates: [],
        teamMembers: [],
        discussions: [],
        bugs: [],
        releases: []
      });
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
          saveRecentSearch(query);
        }
      } catch (err) {
        console.error('Search error:', err);
      } finally {
        setIsLoading(false);
      }
    }, 200);

    return () => clearTimeout(timer);
  }, [query, currentWorkspace]);

  // Handlers for navigation
  const navigateTo = (url: string, recentItem?: { id: string; title: string; type: any; color?: string }) => {
    onClose();
    if (recentItem) {
      addRecentItem({
        id: recentItem.id,
        title: recentItem.title,
        type: recentItem.type,
        href: url,
        color: recentItem.color
      });
    }
    router.push(url);
  };

  const totalHits =
    (results.projects?.length || 0) +
    (results.tasks?.length || 0) +
    (results.documents?.length || 0) +
    (results.bugs?.length || 0) +
    (results.teamMembers?.length || 0) +
    (results.discussions?.length || 0) +
    (results.releases?.length || 0) +
    (results.templates?.length || 0);

  const categories: Array<{ id: SearchCategory; label: string; count: number }> = [
    { id: 'ALL', label: 'All Results', count: totalHits },
    { id: 'PROJECTS', label: 'Projects', count: results.projects?.length || 0 },
    { id: 'TASKS', label: 'Tasks', count: results.tasks?.length || 0 },
    { id: 'DOCS', label: 'Documents', count: results.documents?.length || 0 },
    { id: 'BUGS', label: 'Bugs', count: results.bugs?.length || 0 },
    { id: 'TEAM', label: 'Team', count: results.teamMembers?.length || 0 },
    { id: 'DISCUSSIONS', label: 'Discussions', count: results.discussions?.length || 0 },
    { id: 'RELEASES', label: 'Releases', count: results.releases?.length || 0 }
  ];

  return (
    <Dialog isOpen={isOpen} onClose={onClose} maxWidth="2xl">
      <div className="space-y-4">
        {/* Search Input */}
        <div className="relative flex items-center">
          <Search className="absolute left-3.5 h-4 w-4 text-foreground-muted" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search projects, tasks, documents, bugs, releases, team..."
            className="w-full pl-10 pr-10 py-2.5 rounded-lg border border-border bg-background text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
            autoFocus
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="absolute right-3 p-1 rounded hover:bg-background-secondary text-foreground-muted"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="absolute right-3 px-1.5 py-0.5 rounded border border-border bg-background-secondary text-[10px] font-mono text-foreground-muted">
              ESC
            </kbd>
          )}
        </div>

        {/* Categories Bar when searching */}
        {query.trim().length > 0 && (
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 border-b border-border text-xs scrollbar-none">
            {categories.map((c) => (
              <button
                key={c.id}
                type="button"
                onClick={() => setActiveCategory(c.id)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium whitespace-nowrap transition-colors flex items-center gap-1.5 ${
                  activeCategory === c.id
                    ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                    : 'text-foreground-secondary hover:bg-background-secondary'
                }`}
              >
                <span>{c.label}</span>
                {c.count > 0 && (
                  <span
                    className={`text-[10px] px-1 rounded-full ${
                      activeCategory === c.id
                        ? 'bg-primary-foreground/20 text-primary-foreground'
                        : 'bg-background-tertiary text-foreground-muted'
                    }`}
                  >
                    {c.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        )}

        {/* Recent Searches (when query empty) */}
        {!query.trim() && recentSearches.length > 0 && (
          <div className="space-y-2 p-2">
            <div className="flex items-center justify-between text-xs text-foreground-muted px-1">
              <span className="font-semibold uppercase tracking-wider text-[10px] flex items-center gap-1.5">
                <Clock className="h-3 w-3" /> Recent Searches
              </span>
              <button
                onClick={clearRecentSearches}
                className="text-[11px] text-foreground-muted hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {recentSearches.map((term, i) => (
                <button
                  key={i}
                  onClick={() => setQuery(term)}
                  className="px-2.5 py-1 rounded-md border border-border bg-background-secondary hover:bg-background-tertiary text-xs text-foreground transition-colors flex items-center gap-1"
                >
                  <Search className="h-3 w-3 text-foreground-muted" />
                  <span>{term}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Results Container */}
        <div className="max-h-[380px] overflow-y-auto space-y-4 pr-1">
          {isLoading ? (
            <div className="py-12 flex flex-col items-center justify-center gap-2 text-foreground-muted text-xs">
              <Loader2 className="h-5 w-5 animate-spin text-primary" />
              <span>Searching workspace across all modules...</span>
            </div>
          ) : query.trim() && totalHits === 0 ? (
            <div className="py-12 text-center text-xs text-foreground-muted">
              No matching results found for &ldquo;{query}&rdquo;.
            </div>
          ) : (
            <>
              {/* 1. Projects */}
              {(activeCategory === 'ALL' || activeCategory === 'PROJECTS') &&
                (results.projects || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <FolderKanban className="h-3 w-3 text-primary" /> Projects ({results.projects.length})
                    </h3>
                    {results.projects.map((p) => (
                      <button
                        key={p.id}
                        onClick={() =>
                          navigateTo(`/projects/${p.id}`, {
                            id: p.id,
                            title: p.name,
                            type: 'project',
                            color: p.color
                          })
                        }
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary hover:border-primary/40 transition-colors text-left group"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <div
                            className="h-6 w-6 rounded-md flex items-center justify-center text-white text-[10px] font-bold shrink-0 shadow-xs"
                            style={{ backgroundColor: p.color || '#2563EB' }}
                          >
                            <FolderKanban className="h-3 w-3" />
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-foreground group-hover:text-primary transition-colors truncate">
                              {p.name}
                            </p>
                            <p className="text-[10px] text-foreground-muted truncate">
                              {p.description || p.projectType}
                            </p>
                          </div>
                        </div>
                        <ArrowRight className="h-3.5 w-3.5 text-foreground-muted group-hover:text-primary transition-colors shrink-0" />
                      </button>
                    ))}
                  </div>
                )}

              {/* 2. Tasks */}
              {(activeCategory === 'ALL' || activeCategory === 'TASKS') &&
                (results.tasks || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <CheckSquare className="h-3 w-3 text-blue-500" /> Tasks ({results.tasks.length})
                    </h3>
                    {results.tasks.map((t) => (
                      <button
                        key={t.id}
                        onClick={() =>
                          navigateTo(`/projects/${t.projectId}?tab=tasks`, {
                            id: t.id,
                            title: `${t.key}: ${t.title}`,
                            type: 'task'
                          })
                        }
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {t.key}
                          </Badge>
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {t.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-foreground-muted shrink-0 ml-2">
                          {t.projectName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {/* 3. Documents */}
              {(activeCategory === 'ALL' || activeCategory === 'DOCS') &&
                (results.documents || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <FileText className="h-3 w-3 text-emerald-500" /> Documents ({results.documents.length})
                    </h3>
                    {results.documents.map((d) => (
                      <button
                        key={d.id}
                        onClick={() =>
                          navigateTo(`/projects/${d.project.id}/docs/${d.id}`, {
                            id: d.id,
                            title: d.title,
                            type: 'document'
                          })
                        }
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <FileText className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {d.title}
                            </p>
                            {d.snippet && (
                              <p className="text-[10px] text-foreground-muted truncate">
                                {d.snippet}
                              </p>
                            )}
                          </div>
                        </div>
                        <span className="text-[10px] text-foreground-muted shrink-0 ml-2 font-mono">
                          v{d.versionNumber}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {/* 4. Bugs */}
              {(activeCategory === 'ALL' || activeCategory === 'BUGS') &&
                (results.bugs || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <Bug className="h-3 w-3 text-red-500" /> Bugs & QA ({results.bugs.length})
                    </h3>
                    {results.bugs.map((b) => (
                      <button
                        key={b.id}
                        onClick={() => navigateTo(`/projects/${b.projectId}?tab=bugs`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="destructive" className="text-[10px] font-mono shrink-0">
                            {b.key}
                          </Badge>
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {b.title}
                          </span>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {b.severity}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

              {/* 5. Team Members */}
              {(activeCategory === 'ALL' || activeCategory === 'TEAM') &&
                (results.teamMembers || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <Users className="h-3 w-3 text-purple-500" /> Team Members ({results.teamMembers.length})
                    </h3>
                    {results.teamMembers.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => navigateTo('/team')}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <div className="h-6 w-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
                            {m.name.charAt(0)}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                              {m.name}
                            </p>
                            <p className="text-[10px] text-foreground-muted truncate">
                              {m.jobTitle || m.department || m.email}
                            </p>
                          </div>
                        </div>
                        <Badge variant="outline" className="text-[10px]">
                          {m.role}
                        </Badge>
                      </button>
                    ))}
                  </div>
                )}

              {/* 6. Discussions */}
              {(activeCategory === 'ALL' || activeCategory === 'DISCUSSIONS') &&
                (results.discussions || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3 text-amber-500" /> Discussions ({results.discussions.length})
                    </h3>
                    {results.discussions.map((d) => (
                      <button
                        key={d.id}
                        onClick={() => navigateTo(`/projects/${d.projectId}?tab=discussions`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <MessageSquare className="h-3.5 w-3.5 text-foreground-muted shrink-0" />
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {d.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-foreground-muted shrink-0 ml-2">
                          by {d.author}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

              {/* 7. Releases */}
              {(activeCategory === 'ALL' || activeCategory === 'RELEASES') &&
                (results.releases || []).length > 0 && (
                  <div className="space-y-1.5">
                    <h3 className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 flex items-center gap-1.5">
                      <Rocket className="h-3 w-3 text-blue-400" /> Releases ({results.releases.length})
                    </h3>
                    {results.releases.map((r) => (
                      <button
                        key={r.id}
                        onClick={() => navigateTo(`/projects/${r.projectId}?tab=releases`)}
                        className="w-full flex items-center justify-between p-2 rounded-lg border border-border bg-background-secondary/50 hover:bg-background-secondary text-left group transition-colors"
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <Badge variant="outline" className="text-[10px] font-mono shrink-0">
                            {r.version}
                          </Badge>
                          <span className="text-xs font-medium text-foreground group-hover:text-primary transition-colors truncate">
                            {r.title}
                          </span>
                        </div>
                        <span className="text-[10px] text-foreground-muted shrink-0 ml-2">
                          {r.projectName}
                        </span>
                      </button>
                    ))}
                  </div>
                )}
            </>
          )}
        </div>
      </div>
    </Dialog>
  );
}
