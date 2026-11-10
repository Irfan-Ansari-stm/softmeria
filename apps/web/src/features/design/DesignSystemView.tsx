'use client';

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Palette,
  Plus,
  Copy,
  Check,
  Download,
  Sun,
  Moon,
  Sparkles,
  Sliders,
  Layers,
  Code2,
  Trash2,
  Edit2,
  BookOpen,
  Eye,
  CheckCircle2,
  FileCode,
  ShieldCheck,
  Share2
} from 'lucide-react';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { Dialog } from '../../components/ui/dialog';
import { Input } from '../../components/ui/input';
import { Textarea } from '../../components/ui/textarea';

interface DesignSystemViewProps {
  projectId: string;
}

const TOKEN_CATEGORIES = [
  { id: 'ALL', label: 'All Tokens' },
  { id: 'BRAND_COLOR', label: 'Brand Colors' },
  { id: 'SEMANTIC_COLOR', label: 'Semantic Colors' },
  { id: 'BG_COLOR', label: 'Backgrounds' },
  { id: 'SURFACE_COLOR', label: 'Surfaces' },
  { id: 'FONT_FAMILY', label: 'Font Families' },
  { id: 'FONT_SIZE', label: 'Font Sizes' },
  { id: 'FONT_WEIGHT', label: 'Font Weights' },
  { id: 'LINE_HEIGHT', label: 'Line Heights' },
  { id: 'LETTER_SPACING', label: 'Letter Spacing' },
  { id: 'SPACING', label: 'Spacing Scales' },
  { id: 'GRID', label: 'Grid' },
  { id: 'BORDER_RADIUS', label: 'Border Radius' },
  { id: 'BORDER_WIDTH', label: 'Border Widths' },
  { id: 'SHADOW', label: 'Shadows' },
  { id: 'ICONOGRAPHY', label: 'Iconography' },
  { id: 'ANIMATION', label: 'Animations' },
  { id: 'TRANSITION', label: 'Transitions' },
  { id: 'BREAKPOINT', label: 'Breakpoints' },
  { id: 'Z_INDEX', label: 'Z-Index' }
];

export function DesignSystemView({ projectId }: DesignSystemViewProps) {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'tokens' | 'palettes' | 'themes' | 'components' | 'export'>('tokens');
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Modals
  const [isAddTokenOpen, setIsAddTokenOpen] = useState(false);
  const [editingToken, setEditingToken] = useState<any | null>(null);
  const [isAddThemeOpen, setIsAddThemeOpen] = useState(false);
  const [isAddComponentOpen, setIsAddComponentOpen] = useState(false);
  const [exportFormat, setExportFormat] = useState<'css' | 'tailwind' | 'json' | 'scss'>('css');

  // Form State: Token
  const [tokenName, setTokenName] = useState('');
  const [tokenKey, setTokenKey] = useState('');
  const [tokenCategory, setTokenCategory] = useState('BRAND_COLOR');
  const [tokenValue, setTokenValue] = useState('#2563EB');
  const [tokenSemanticRole, setTokenSemanticRole] = useState('PRIMARY');
  const [tokenDescription, setTokenDescription] = useState('');

  // Form State: Theme
  const [themeName, setThemeName] = useState('');
  const [themeSlug, setThemeSlug] = useState('');
  const [isThemeDark, setIsThemeDark] = useState(false);

  // Form State: Component Spec
  const [compName, setCompName] = useState('');
  const [compType, setCompType] = useState('BUTTON');
  const [compDesc, setCompDesc] = useState('');
  const [compVariants, setCompVariants] = useState('primary, secondary, outline, ghost');
  const [compA11y, setCompA11y] = useState('WCAG 2.1 AA compliant. Minimum 4.5:1 text contrast ratio.');
  const [compUsage, setCompUsage] = useState('<Button variant="primary">Submit</Button>');

  // Copy helper
  const copyToClipboard = (text: string, identifier: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(identifier);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Queries
  const { data: tokens = [], isLoading: isTokensLoading } = useQuery({
    queryKey: ['design-tokens', projectId, selectedCategory],
    queryFn: async () => {
      const res = await api.get<any[]>(`/design/tokens?projectId=${projectId}&category=${selectedCategory}`);
      return res.data || [];
    }
  });

  const { data: palettes = [] } = useQuery({
    queryKey: ['design-palettes', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/design/palettes?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const { data: themes = [] } = useQuery({
    queryKey: ['design-themes', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/design/themes?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const { data: components = [] } = useQuery({
    queryKey: ['design-components', projectId],
    queryFn: async () => {
      const res = await api.get<any[]>(`/design/components?projectId=${projectId}`);
      return res.data || [];
    }
  });

  const { data: exportData } = useQuery({
    queryKey: ['design-export', projectId, exportFormat],
    queryFn: async () => {
      const res = await api.get<any>(`/design/export?projectId=${projectId}&format=${exportFormat}`);
      return res.data;
    },
    enabled: activeTab === 'export'
  });

  // Mutations
  const createTokenMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/design/tokens', {
        projectId,
        name: tokenName,
        key: tokenKey,
        category: tokenCategory,
        value: tokenValue,
        type: tokenCategory.includes('COLOR') ? 'color' : 'string',
        semanticRole: tokenSemanticRole,
        description: tokenDescription,
        metadata: { hex: tokenValue }
      });
      return res.data;
    },
    onSuccess: () => {
      setIsAddTokenOpen(false);
      setTokenName('');
      setTokenKey('');
      setTokenDescription('');
      queryClient.invalidateQueries({ queryKey: ['design-tokens', projectId] });
    }
  });

  const deleteTokenMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.delete(`/design/tokens/${id}`);
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-tokens', projectId] });
    }
  });

  const createThemeMutation = useMutation({
    mutationFn: async () => {
      const res = await api.post('/design/themes', {
        projectId,
        name: themeName,
        slug: themeSlug.toLowerCase().replace(/\s+/g, '-'),
        isDark: isThemeDark
      });
      return res.data;
    },
    onSuccess: () => {
      setIsAddThemeOpen(false);
      setThemeName('');
      setThemeSlug('');
      queryClient.invalidateQueries({ queryKey: ['design-themes', projectId] });
    }
  });

  const publishThemeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await api.patch(`/design/themes/${id}/publish`, {});
      return res.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['design-themes', projectId] });
    }
  });

  const createComponentMutation = useMutation({
    mutationFn: async () => {
      const variants = compVariants.split(',').map((v) => v.trim()).filter(Boolean);
      const res = await api.post('/design/components', {
        projectId,
        name: compName,
        componentType: compType,
        description: compDesc,
        variants,
        accessibility: compA11y,
        usageExamples: compUsage
      });
      return res.data;
    },
    onSuccess: () => {
      setIsAddComponentOpen(false);
      setCompName('');
      setCompDesc('');
      queryClient.invalidateQueries({ queryKey: ['design-components', projectId] });
    }
  });

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-border pb-3">
        <div className="flex items-center gap-1 overflow-x-auto scrollbar-thin">
          {[
            { id: 'tokens', label: 'Design Tokens', icon: Sliders, count: tokens.length },
            { id: 'palettes', label: 'Color Palettes', icon: Palette, count: palettes.length },
            { id: 'themes', label: 'Themes & Dark Mode', icon: Sun, count: themes.length },
            { id: 'components', label: 'Components', icon: Layers, count: components.length },
            { id: 'export', label: 'Token Export', icon: Download }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{tab.label}</span>
                {tab.count !== undefined && (
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${isActive ? 'bg-primary-foreground/20 text-primary-foreground' : 'bg-background-tertiary text-foreground-muted'}`}>
                    {tab.count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <div>
          {activeTab === 'tokens' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddTokenOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Create Token</span>
            </Button>
          )}
          {activeTab === 'themes' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddThemeOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>New Theme</span>
            </Button>
          )}
          {activeTab === 'components' && (
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsAddComponentOpen(true)}
              className="text-xs gap-1.5 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Document Component</span>
            </Button>
          )}
        </div>
      </div>

      {/* =================================================================== */}
      {/* TAB 1: DESIGN TOKENS & 20 CATEGORIES */}
      {/* =================================================================== */}
      {activeTab === 'tokens' && (
        <div className="space-y-4">
          {/* Category Chips Bar */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1.5 scrollbar-thin">
            {TOKEN_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-medium transition-colors whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? 'bg-foreground text-background font-semibold shadow-xs'
                    : 'bg-background-secondary text-foreground-secondary hover:text-foreground hover:bg-background-tertiary'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Tokens Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {tokens.map((token: any) => {
              const isColor = token.type === 'color' || token.value?.startsWith('#') || token.value?.startsWith('rgb');
              return (
                <Card key={token.id} className="p-4 space-y-3 hover:border-primary/40 transition-colors shadow-xs">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {isColor ? (
                        <div
                          className="h-8 w-8 rounded-lg shrink-0 border border-border shadow-xs"
                          style={{ backgroundColor: token.value }}
                        />
                      ) : (
                        <div className="h-8 w-8 rounded-lg shrink-0 bg-background-secondary border border-border flex items-center justify-center text-primary font-mono text-[10px] font-bold">
                          Aa
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="text-xs font-semibold text-foreground truncate">{token.name}</h4>
                        <code className="text-[10px] text-foreground-muted font-mono truncate block">
                          {token.key}
                        </code>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteTokenMutation.mutate(token.id)}
                      className="p-1 rounded text-foreground-muted hover:text-destructive transition-colors shrink-0"
                      title="Delete token"
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </div>

                  {/* Value and Copy Actions */}
                  <div className="p-2 rounded-lg bg-background-secondary/70 border border-border/60 flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-foreground truncate">{token.value}</span>
                    <button
                      onClick={() => copyToClipboard(token.value, token.id)}
                      className="inline-flex items-center gap-1 text-[10px] text-primary hover:underline font-medium"
                      title="Copy token value"
                    >
                      {copiedKey === token.id ? (
                        <>
                          <Check className="h-2.5 w-2.5 text-success" />
                          <span className="text-success">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="h-2.5 w-2.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>

                  {token.description && (
                    <p className="text-[11px] text-foreground-secondary line-clamp-2">{token.description}</p>
                  )}

                  <div className="flex items-center justify-between pt-1 text-[10px]">
                    <Badge variant="outline" className="text-[9px] font-mono">
                      {token.category}
                    </Badge>
                    {token.semanticRole && (
                      <span className="font-semibold text-primary uppercase text-[9px]">
                        {token.semanticRole}
                      </span>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 2: COLOR PALETTES */}
      {/* =================================================================== */}
      {activeTab === 'palettes' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {palettes.map((pal: any) => (
              <Card key={pal.id} className="p-5 space-y-4 shadow-xs">
                <div>
                  <h3 className="text-sm font-bold text-foreground">{pal.name}</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">{pal.description}</p>
                </div>

                {/* Swatches in this palette */}
                <div className="grid grid-cols-5 gap-2">
                  {(pal.tokens || []).map((t: any) => (
                    <div
                      key={t.id}
                      onClick={() => copyToClipboard(t.value, t.id)}
                      className="group cursor-pointer text-center space-y-1"
                    >
                      <div
                        className="h-10 w-full rounded-md border border-border shadow-xs group-hover:scale-105 transition-transform"
                        style={{ backgroundColor: t.value }}
                      />
                      <span className="text-[9px] font-mono text-foreground-muted block truncate">{t.value}</span>
                    </div>
                  ))}
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 3: THEMES & DARK MODE */}
      {/* =================================================================== */}
      {activeTab === 'themes' && (
        <div className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {themes.map((theme: any) => (
              <Card key={theme.id} className="p-5 space-y-4 shadow-xs">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className={`h-8 w-8 rounded-lg flex items-center justify-center ${theme.isDark ? 'bg-slate-900 text-amber-400' : 'bg-amber-100 text-amber-700'}`}>
                      {theme.isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-foreground">{theme.name}</h4>
                      <code className="text-[10px] text-foreground-muted font-mono">{theme.slug}</code>
                    </div>
                  </div>

                  {theme.isDefault && (
                    <Badge variant="default" className="text-[10px]">
                      Default
                    </Badge>
                  )}
                </div>

                <div className="p-3 rounded-lg bg-background-secondary/80 border border-border text-xs space-y-2">
                  <div className="flex justify-between text-[11px]">
                    <span className="text-foreground-muted">Version:</span>
                    <span className="font-mono font-semibold text-foreground">v{theme.version}</span>
                  </div>
                  <div className="flex justify-between text-[11px]">
                    <span className="text-foreground-muted">Status:</span>
                    <Badge variant={theme.isPublished ? 'success' : 'outline'} className="text-[9px]">
                      {theme.isPublished ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-border">
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => publishThemeMutation.mutate(theme.id)}
                    className="text-xs h-7 gap-1"
                  >
                    <CheckCircle2 className="h-3 w-3" />
                    <span>Publish Theme</span>
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 4: COMPONENT SPECIFICATIONS */}
      {/* =================================================================== */}
      {activeTab === 'components' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {components.map((comp: any) => {
              let variants: string[] = [];
              try {
                variants = JSON.parse(comp.variants || '[]');
              } catch {}

              let props: any[] = [];
              try {
                props = JSON.parse(comp.properties || '[]');
              } catch {}

              return (
                <Card key={comp.id} className="p-5 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-sm font-bold text-foreground">{comp.name}</h3>
                        <Badge variant="outline" className="text-[9px]">
                          {comp.componentType}
                        </Badge>
                      </div>
                      <p className="text-xs text-foreground-secondary mt-1">{comp.description}</p>
                    </div>
                    <Badge variant="success" className="text-[10px]">
                      {comp.status}
                    </Badge>
                  </div>

                  {/* Variants */}
                  {variants.length > 0 && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                        Supported Variants:
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {variants.map((v) => (
                          <span key={v} className="px-1.5 py-0.5 rounded bg-background-secondary border border-border text-[10px] font-mono text-foreground">
                            {v}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Accessibility Notes */}
                  {comp.accessibility && (
                    <div className="p-2.5 rounded-lg bg-primary/5 border border-primary/20 text-[11px] text-foreground-secondary flex items-start gap-2">
                      <ShieldCheck className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-primary">Accessibility Requirements: </span>
                        {comp.accessibility}
                      </div>
                    </div>
                  )}

                  {/* Code Usage */}
                  {comp.usageExamples && (
                    <div className="space-y-1">
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                        Usage Code Example:
                      </span>
                      <pre className="p-2.5 rounded-lg bg-background font-mono text-[11px] text-foreground-secondary border border-border overflow-x-auto whitespace-pre">
                        {comp.usageExamples}
                      </pre>
                    </div>
                  )}
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {/* =================================================================== */}
      {/* TAB 5: TOKEN EXPORT */}
      {/* =================================================================== */}
      {activeTab === 'export' && (
        <div className="space-y-4 max-w-4xl">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              {(['css', 'tailwind', 'json', 'scss'] as const).map((fmt) => (
                <button
                  key={fmt}
                  onClick={() => setExportFormat(fmt)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors uppercase ${
                    exportFormat === fmt
                      ? 'bg-primary text-primary-foreground shadow-xs'
                      : 'bg-background-secondary text-foreground-secondary hover:text-foreground'
                  }`}
                >
                  {fmt}
                </button>
              ))}
            </div>

            {exportData && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const blob = new Blob([exportData.content], { type: 'text/plain' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = exportData.filename || 'tokens.txt';
                  a.click();
                  URL.revokeObjectURL(url);
                }}
                className="text-xs gap-1.5"
              >
                <Download className="h-3 w-3" />
                <span>Download {exportData.filename}</span>
              </Button>
            )}
          </div>

          <div className="relative rounded-xl border border-border bg-card p-4 overflow-hidden shadow-xs">
            <div className="flex items-center justify-between pb-2 border-b border-border/60 text-xs text-foreground-muted mb-3">
              <span className="font-mono text-[11px]">{exportData?.filename || 'tokens'}</span>
              <button
                onClick={() => exportData && copyToClipboard(exportData.content, 'export-copy')}
                className="inline-flex items-center gap-1 text-[11px] text-primary hover:underline font-medium"
              >
                {copiedKey === 'export-copy' ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
                <span>{copiedKey === 'export-copy' ? 'Copied' : 'Copy All'}</span>
              </button>
            </div>
            <pre className="p-3 bg-background rounded-lg font-mono text-xs text-foreground-secondary leading-relaxed overflow-x-auto max-h-[500px]">
              {exportData?.content || 'Loading token export...'}
            </pre>
          </div>
        </div>
      )}

      {/* Create Token Dialog */}
      {isAddTokenOpen && (
        <Dialog
          isOpen={isAddTokenOpen}
          onClose={() => setIsAddTokenOpen(false)}
          title="Create New Design Token"
          description="Add a persistent design token to PostgreSQL for this project."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createTokenMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Token Name *"
              value={tokenName}
              onChange={(e) => setTokenName(e.target.value)}
              placeholder="e.g. Brand Primary 500"
              required
            />
            <Input
              label="Token Key *"
              value={tokenKey}
              onChange={(e) => setTokenKey(e.target.value)}
              placeholder="e.g. colors.brand.primary"
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Category *</label>
              <select
                value={tokenCategory}
                onChange={(e) => setTokenCategory(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                {TOKEN_CATEGORIES.filter((c) => c.id !== 'ALL').map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.label}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Value *"
              value={tokenValue}
              onChange={(e) => setTokenValue(e.target.value)}
              placeholder="e.g. #2563EB or 16px"
              required
            />
            <Input
              label="Semantic Role"
              value={tokenSemanticRole}
              onChange={(e) => setTokenSemanticRole(e.target.value)}
              placeholder="e.g. PRIMARY, SUCCESS, WARNING, DANGER"
            />
            <Textarea
              label="Description"
              value={tokenDescription}
              onChange={(e) => setTokenDescription(e.target.value)}
              placeholder="Usage guidelines"
              rows={2}
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddTokenOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createTokenMutation.isPending}>
                Create Token
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Create Theme Dialog */}
      {isAddThemeOpen && (
        <Dialog
          isOpen={isAddThemeOpen}
          onClose={() => setIsAddThemeOpen(false)}
          title="Create New Theme"
          description="Add a light, dark or custom branded theme variant."
          maxWidth="md"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createThemeMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Theme Name *"
              value={themeName}
              onChange={(e) => setThemeName(e.target.value)}
              placeholder="e.g. High Contrast Dark"
              required
            />
            <Input
              label="Slug *"
              value={themeSlug}
              onChange={(e) => setThemeSlug(e.target.value)}
              placeholder="e.g. high-contrast-dark"
              required
            />
            <label className="flex items-center gap-2 text-xs font-medium text-foreground cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isThemeDark}
                onChange={(e) => setIsThemeDark(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary"
              />
              <span>Is Dark Mode Variant</span>
            </label>

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddThemeOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createThemeMutation.isPending}>
                Create Theme
              </Button>
            </div>
          </form>
        </Dialog>
      )}

      {/* Document Component Dialog */}
      {isAddComponentOpen && (
        <Dialog
          isOpen={isAddComponentOpen}
          onClose={() => setIsAddComponentOpen(false)}
          title="Document Component Specification"
          description="Record accessibility, variants, and usage instructions."
          maxWidth="lg"
        >
          <form
            onSubmit={(e) => {
              e.preventDefault();
              createComponentMutation.mutate();
            }}
            className="space-y-3"
          >
            <Input
              label="Component Name *"
              value={compName}
              onChange={(e) => setCompName(e.target.value)}
              placeholder="e.g. Alert Banner"
              required
            />
            <div className="space-y-1">
              <label className="text-xs font-medium text-foreground-secondary">Component Type</label>
              <select
                value={compType}
                onChange={(e) => setCompType(e.target.value)}
                className="w-full h-9 px-3 rounded-lg border border-border bg-background text-xs text-foreground"
              >
                {['BUTTON', 'INPUT', 'FORM', 'CARD', 'TABLE', 'MODAL', 'DRAWER', 'NAVIGATION', 'ALERT', 'BADGE', 'LAYOUT'].map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>
            <Textarea
              label="Description"
              value={compDesc}
              onChange={(e) => setCompDesc(e.target.value)}
              placeholder="What this component is used for"
              rows={2}
            />
            <Input
              label="Variants (comma separated)"
              value={compVariants}
              onChange={(e) => setCompVariants(e.target.value)}
              placeholder="info, warning, success, error"
            />
            <Textarea
              label="Accessibility Notes (WCAG 2.1 AA)"
              value={compA11y}
              onChange={(e) => setCompA11y(e.target.value)}
              rows={2}
            />
            <Textarea
              label="Code Usage Snippet"
              value={compUsage}
              onChange={(e) => setCompUsage(e.target.value)}
              rows={3}
              className="font-mono text-xs"
            />

            <div className="flex justify-end gap-2 pt-2 border-t border-border">
              <Button type="button" variant="outline" size="sm" onClick={() => setIsAddComponentOpen(false)}>
                Cancel
              </Button>
              <Button type="submit" variant="primary" size="sm" isLoading={createComponentMutation.isPending}>
                Save Specification
              </Button>
            </div>
          </form>
        </Dialog>
      )}
    </div>
  );
}
