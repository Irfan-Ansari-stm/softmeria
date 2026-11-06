'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save,
  CheckCircle,
  Loader2,
  AlertTriangle,
  PanelRightClose,
  PanelRightOpen,
  FileText,
  Code2,
  Eye,
  Info
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { useLayoutStore } from '../../stores/useLayoutStore';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { ContextualRightPanel } from './ContextualRightPanel';
import { ResizeHandle } from '../../components/ui/ResizeHandle';
import { api } from '../../lib/api';
import { Button } from '../../components/ui/button';

interface MarkdownWorkspaceProps {
  documentId: string;
}

export function MarkdownWorkspace({ documentId }: MarkdownWorkspaceProps) {
  const {
    title,
    content,
    savedContent,
    versionNumber,
    status,
    isOptional,
    saveStatus,
    errorMessage,
    isFullScreen,
    setDocument,
    setTitle,
    setContent,
    setSaveStatus,
    setSavedSuccessfully,
    toggleFullScreen
  } = useEditorStore();

  const {
    editorSplitRatio,
    setEditorSplitRatio,
    resetEditorSplitRatio,
    viewMode,
    setViewMode,
    mobileTab,
    setMobileTab,
    inspectorWidth,
    isInspectorCollapsed,
    toggleInspectorCollapsed,
    setInspectorCollapsed,
    isMobileInspectorOpen,
    setMobileInspectorOpen
  } = useLayoutStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const gutterRef = useRef<HTMLDivElement>(null);
  const splitContainerRef = useRef<HTMLDivElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Synchronize line gutter vertical scroll with textarea
  const handleEditorScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (gutterRef.current) {
      gutterRef.current.scrollTop = e.currentTarget.scrollTop;
    }
  };

  // Load document data
  useEffect(() => {
    let isMounted = true;
    async function loadDoc() {
      try {
        const res = await api.get<any>(`/documents/${documentId}`);
        if (res.success && res.data && isMounted) {
          setDocument(res.data);
          setHistory([res.data.content || '']);
          setHistoryIndex(0);
        }
      } catch (err: any) {
        console.error('Failed to load document:', err);
      }
    }
    loadDoc();
    return () => {
      isMounted = false;
    };
  }, [documentId, setDocument]);

  // Reliable Auto-Save implementation (debounced at 1000ms)
  const performSave = useCallback(
    async (
      currentTitle: string,
      currentContent: string,
      currentStatus: string,
      currentOptional: boolean,
      expectedVer: number
    ) => {
      setSaveStatus('saving');
      try {
        const res = await api.put<any>(`/documents/${documentId}`, {
          title: currentTitle,
          content: currentContent,
          status: currentStatus,
          isOptional: currentOptional,
          expectedVersion: expectedVer
        });
        if (res.success && res.data) {
          setSavedSuccessfully(res.data.versionNumber);
        }
      } catch (err: any) {
        if (err.statusCode === 409) {
          setSaveStatus('conflict', 'Conflict detected: document was modified by another session');
        } else {
          setSaveStatus('error', err.message || 'Auto-save failed');
        }
      }
    },
    [documentId, setSaveStatus, setSavedSuccessfully]
  );

  // Debounced auto-save listener on content change
  useEffect(() => {
    if (saveStatus !== 'dirty') return;

    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }

    saveTimeoutRef.current = setTimeout(() => {
      performSave(title, content, status, isOptional, versionNumber);
    }, 1000);

    return () => {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
    };
  }, [content, title, status, isOptional, saveStatus, versionNumber, performSave]);

  // Window beforeunload warning if dirty
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (saveStatus === 'dirty') {
        e.preventDefault();
        e.returnValue = '';
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveStatus]);

  // Manual save handler
  const handleManualSave = () => {
    if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
    performSave(title, content, status, isOptional, versionNumber);
  };

  // Textarea toolbar insert helper
  const handleInsert = (prefix: string, suffix = '', defaultText = '') => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selected = content.substring(start, end) || defaultText;
    const replacement = `${prefix}${selected}${suffix}`;

    const newContent =
      content.substring(0, start) + replacement + content.substring(end);

    setContent(newContent);

    // Record history
    const nextHistory = history.slice(0, historyIndex + 1);
    nextHistory.push(newContent);
    setHistory(nextHistory);
    setHistoryIndex(nextHistory.length - 1);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + prefix.length,
        start + prefix.length + selected.length
      );
    }, 0);
  };

  // Undo / Redo
  const handleUndo = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const newIndex = historyIndex + 1;
      setHistoryIndex(newIndex);
      setContent(history[newIndex]);
    }
  };

  // Handle Tab key in textarea
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault();
      handleInsert('  ');
    }
    if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleManualSave();
    }
  };

  // Metrics
  const words = content.trim() ? content.trim().split(/\s+/).length : 0;
  const chars = content.length;
  const lines = content.split('\n').length;

  // Split resize handler
  const handleSplitResize = (deltaX: number) => {
    if (!splitContainerRef.current) return;
    const totalWidth = splitContainerRef.current.offsetWidth;
    if (totalWidth <= 0) return;
    const deltaPercent = (deltaX / totalWidth) * 100;
    setEditorSplitRatio(editorSplitRatio + deltaPercent);
  };

  return (
    <div
      className={`w-full h-full flex flex-col bg-background text-foreground transition-colors overflow-hidden ${
        isFullScreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* 1. DOCUMENT HEADER */}
      <header className="h-12 border-b border-border bg-background px-3 sm:px-4 flex items-center justify-between gap-2 sm:gap-4 shrink-0 z-10">
        {/* Document Title input */}
        <div className="flex items-center gap-2 flex-1 min-w-0 max-w-xl">
          <FileText className="h-4 w-4 text-primary shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full bg-transparent font-semibold text-xs sm:text-sm text-foreground placeholder:text-foreground-muted focus:outline-none focus:ring-0 truncate"
          />
        </div>

        {/* Save Status & Metrics */}
        <div className="flex items-center gap-2 sm:gap-3 text-xs shrink-0">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 font-medium">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-foreground-muted">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-primary" />
                <span className="hidden sm:inline">Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-success font-medium">
                <CheckCircle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Saved</span>
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="flex items-center gap-1 text-warning font-medium">
                <span className="h-2 w-2 rounded-full bg-warning animate-pulse" />
                <span className="hidden sm:inline">Unsaved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span
                className="flex items-center gap-1 text-destructive font-medium"
                title={errorMessage || 'Save error'}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Save Failed</span>
              </span>
            )}
            {saveStatus === 'conflict' && (
              <span
                className="flex items-center gap-1 text-destructive font-semibold"
                title={errorMessage || 'Version conflict'}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Conflict!</span>
              </span>
            )}
          </div>

          <div className="hidden lg:flex items-center gap-2 text-foreground-muted font-mono text-[11px] border-l border-border pl-3">
            <span>{lines} L</span>
            <span>•</span>
            <span>{words} W</span>
            <span>•</span>
            <span>{chars} C</span>
          </div>

          {/* Manual Save Button */}
          <Button
            size="sm"
            variant={saveStatus === 'dirty' ? 'primary' : 'outline'}
            onClick={handleManualSave}
            disabled={saveStatus === 'saving'}
            className="text-xs gap-1.5 h-7 px-2.5 shadow-xs"
          >
            <Save className="h-3 w-3" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Mobile Inspector Trigger (<768px) */}
          <button
            onClick={() => setMobileInspectorOpen(true)}
            title="Open Document Inspector"
            className="md:hidden p-1.5 rounded-lg text-foreground-secondary hover:text-foreground hover:bg-background-secondary border border-border transition-colors"
          >
            <Info className="h-3.5 w-3.5" />
          </button>

          {/* Desktop Toggle Right Inspector (>=768px) */}
          <button
            onClick={toggleInspectorCollapsed}
            title={isInspectorCollapsed ? 'Expand Inspector' : 'Collapse Inspector'}
            className="hidden md:flex p-1.5 rounded-lg text-foreground-muted hover:text-foreground hover:bg-background-secondary transition-colors"
          >
            {isInspectorCollapsed ? (
              <PanelRightOpen className="h-4 w-4" />
            ) : (
              <PanelRightClose className="h-4 w-4" />
            )}
          </button>
        </div>
      </header>

      {/* 2. EDITOR TOOLBAR */}
      <MarkdownToolbar
        onInsert={handleInsert}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
      />

      {/* Mobile-Only Tabs Header (<768px) */}
      <div className="flex md:hidden border-b border-border bg-background-secondary p-1 shrink-0">
        <button
          onClick={() => setMobileTab('editor')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mobileTab === 'editor'
              ? 'bg-card text-foreground font-semibold shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Code2 className="h-3.5 w-3.5" />
          <span>Source Editor</span>
        </button>
        <button
          onClick={() => setMobileTab('preview')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
            mobileTab === 'preview'
              ? 'bg-card text-foreground font-semibold shadow-xs'
              : 'text-foreground-muted hover:text-foreground'
          }`}
        >
          <Eye className="h-3.5 w-3.5" />
          <span>Live Preview</span>
        </button>
      </div>

      {/* 3. CONTENT AREA: CSS GRID ARCHITECTURE */}
      <div className="flex-1 w-full min-w-0 min-h-0 overflow-hidden relative">
        {/* MOBILE LAYOUT (<768px) */}
        <div className="flex md:hidden w-full h-full overflow-hidden">
          {mobileTab === 'editor' ? (
            <div className="flex-1 flex flex-col h-full bg-background overflow-hidden">
              <div className="flex-1 relative flex h-full overflow-hidden">
                <div
                  ref={gutterRef}
                  className="w-10 select-none py-3 text-right pr-2 text-foreground-muted font-mono text-xs leading-6 bg-background-secondary border-r border-border shrink-0 overflow-hidden"
                >
                  {Array.from({ length: Math.max(lines, 1) }).map((_, i) => (
                    <div key={i}>{i + 1}</div>
                  ))}
                </div>
                <textarea
                  ref={textareaRef}
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onScroll={handleEditorScroll}
                  wrap="off"
                  placeholder="Write Markdown..."
                  className="flex-1 w-full h-full p-3 bg-transparent text-foreground font-mono text-xs leading-6 resize-none focus:outline-none placeholder:text-foreground-muted whitespace-pre overflow-x-auto overflow-y-auto"
                  spellCheck="false"
                />
              </div>
            </div>
          ) : (
            <div className="flex-1 h-full w-full overflow-y-auto bg-background">
              <MarkdownPreview content={content} />
            </div>
          )}
        </div>

        {/* DESKTOP CSS GRID (>=768px): [Editor/Preview Area] + [Inspector] */}
        <div
          className={`hidden md:grid h-full w-full min-w-0 overflow-hidden transition-all duration-75 ${
            isInspectorCollapsed
              ? 'grid-cols-[minmax(0,1fr)]'
              : `grid-cols-[minmax(0,1fr)_auto_${inspectorWidth}px]`
          }`}
        >
          {/* Column 1: Editor & Preview Split Workspace */}
          <div
            ref={splitContainerRef}
            className={`h-full w-full min-w-0 overflow-hidden ${
              viewMode === 'split'
                ? 'grid'
                : 'flex'
            }`}
            style={{
              gridTemplateColumns:
                viewMode === 'split'
                  ? `minmax(320px, ${editorSplitRatio}fr) auto minmax(320px, ${100 - editorSplitRatio}fr)`
                  : undefined
            }}
          >
            {/* Editor Pane (in split or edit-only mode) */}
            {(viewMode === 'split' || viewMode === 'edit') && (
              <div className="flex flex-col h-full w-full min-w-0 bg-background overflow-hidden flex-1">
                <div className="flex-1 relative flex h-full min-w-0 overflow-hidden">
                  {/* Line Numbers Gutter */}
                  <div
                    ref={gutterRef}
                    className="w-12 select-none py-4 text-right pr-2 text-foreground-muted font-mono text-xs leading-6 bg-background-secondary border-r border-border shrink-0 overflow-hidden"
                  >
                    {Array.from({ length: Math.max(lines, 1) }).map((_, i) => (
                      <div key={i}>{i + 1}</div>
                    ))}
                  </div>

                  {/* Professional Source Code Editor (wrap=off, whitespace-pre, horizontal scrolling) */}
                  <textarea
                    ref={textareaRef}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onScroll={handleEditorScroll}
                    wrap="off"
                    placeholder="Write your technical blueprint or architectural specification in Markdown..."
                    className="flex-1 w-full h-full p-4 bg-transparent text-foreground font-mono text-xs leading-6 resize-none focus:outline-none placeholder:text-foreground-muted whitespace-pre overflow-x-auto overflow-y-auto select-text"
                    spellCheck="false"
                  />
                </div>
              </div>
            )}

            {/* Draggable Divider between Editor and Preview (Split Mode Only) */}
            {viewMode === 'split' && (
              <ResizeHandle
                onResize={handleSplitResize}
                onReset={resetEditorSplitRatio}
                min={20}
                max={80}
                current={editorSplitRatio}
                ariaLabel="Resize Editor and Preview Divider"
                className="flex shrink-0"
              />
            )}

            {/* Live Preview Pane (in split or preview-only mode) */}
            {(viewMode === 'split' || viewMode === 'preview') && (
              <div className="h-full w-full min-w-0 overflow-hidden bg-background flex-1 border-l border-border/40">
                <MarkdownPreview content={content} />
              </div>
            )}
          </div>

          {/* Right Inspector Column (Desktop & Tablet) */}
          <ContextualRightPanel documentId={documentId} />
        </div>
      </div>
    </div>
  );
}
