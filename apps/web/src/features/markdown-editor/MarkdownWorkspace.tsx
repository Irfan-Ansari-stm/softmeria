'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  Save,
  CheckCircle,
  Loader2,
  AlertTriangle,
  PanelRightClose,
  PanelRightOpen,
  Maximize2,
  Minimize2,
  FileText
} from 'lucide-react';
import { useEditorStore } from '../../stores/useEditorStore';
import { MarkdownToolbar } from './MarkdownToolbar';
import { MarkdownPreview } from './MarkdownPreview';
import { ContextualRightPanel } from './ContextualRightPanel';
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
    viewMode,
    isFullScreen,
    isRightPanelOpen,
    setDocument,
    setTitle,
    setContent,
    setSaveStatus,
    setSavedSuccessfully,
    setViewMode,
    toggleFullScreen,
    toggleRightPanel
  } = useEditorStore();

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

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
        if (err.message?.includes('modified by another session') || err.message?.includes('409')) {
          setSaveStatus('conflict', err.message);
        } else {
          setSaveStatus('error', err.message || 'Auto-save failed');
        }
      }
    },
    [documentId, setSaveStatus, setSavedSuccessfully]
  );

  // Trigger debounced save on content / title / status changes
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

  return (
    <div
      className={`flex flex-col h-full bg-zinc-950 text-zinc-100 ${
        isFullScreen ? 'fixed inset-0 z-50' : 'relative'
      }`}
    >
      {/* Document Top Bar */}
      <div className="h-12 border-b border-zinc-800 bg-zinc-950 px-4 flex items-center justify-between gap-4 shrink-0">
        {/* Document Title input */}
        <div className="flex items-center gap-2 flex-1 max-w-xl">
          <FileText className="h-4 w-4 text-indigo-400 shrink-0" />
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Document Title"
            className="w-full bg-transparent font-semibold text-sm text-zinc-100 placeholder:text-zinc-600 focus:outline-none focus:ring-0 truncate"
          />
        </div>

        {/* Save Status & Metrics */}
        <div className="flex items-center gap-3 text-xs">
          {/* Status Indicator */}
          <div className="flex items-center gap-1.5 font-medium">
            {saveStatus === 'saving' && (
              <span className="flex items-center gap-1.5 text-zinc-400">
                <Loader2 className="h-3.5 w-3.5 animate-spin text-indigo-400" />
                <span>Saving...</span>
              </span>
            )}
            {saveStatus === 'saved' && (
              <span className="flex items-center gap-1 text-emerald-400">
                <CheckCircle className="h-3.5 w-3.5" />
                <span>Saved</span>
              </span>
            )}
            {saveStatus === 'dirty' && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="h-2 w-2 rounded-full bg-amber-400 animate-pulse" />
                <span>Unsaved</span>
              </span>
            )}
            {saveStatus === 'error' && (
              <span
                className="flex items-center gap-1 text-rose-400"
                title={errorMessage || 'Save error'}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Save Failed</span>
              </span>
            )}
            {saveStatus === 'conflict' && (
              <span
                className="flex items-center gap-1 text-rose-400 font-semibold"
                title={errorMessage || 'Version conflict'}
              >
                <AlertTriangle className="h-3.5 w-3.5" />
                <span>Conflict!</span>
              </span>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-2 text-zinc-500 font-mono text-[11px] border-l border-zinc-800 pl-3">
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
            className="text-xs gap-1.5 h-7 px-2.5"
          >
            <Save className="h-3 w-3" />
            <span className="hidden sm:inline">Save</span>
          </Button>

          {/* Toggle Right Panel */}
          <button
            onClick={toggleRightPanel}
            title={isRightPanelOpen ? 'Collapse panel' : 'Expand panel'}
            className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800 transition-colors"
          >
            {isRightPanelOpen ? (
              <PanelRightClose className="h-4 w-4" />
            ) : (
              <PanelRightOpen className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Formatting Toolbar */}
      <MarkdownToolbar
        onInsert={handleInsert}
        onUndo={handleUndo}
        onRedo={handleRedo}
        viewMode={viewMode}
        onViewModeChange={setViewMode}
        isFullScreen={isFullScreen}
        onToggleFullScreen={toggleFullScreen}
      />

      {/* Main Split / Edit / Preview Workspace */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor Pane */}
        {(viewMode === 'split' || viewMode === 'edit') && (
          <div
            className={`flex-1 flex flex-col h-full bg-zinc-950 ${
              viewMode === 'split' ? 'border-r border-zinc-800' : ''
            }`}
          >
            <div className="flex-1 relative flex">
              {/* Line Numbers Gutter */}
              <div className="w-10 select-none py-4 text-right pr-2 text-zinc-600 font-mono text-xs leading-6 bg-zinc-950/80 border-r border-zinc-900 shrink-0">
                {Array.from({ length: Math.min(lines, 500) }).map((_, i) => (
                  <div key={i}>{i + 1}</div>
                ))}
              </div>

              {/* Textarea */}
              <textarea
                ref={textareaRef}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Write your technical blueprint or architectural specification in Markdown..."
                className="flex-1 w-full h-full p-4 bg-transparent text-zinc-200 font-mono text-xs leading-6 resize-none focus:outline-none placeholder:text-zinc-700"
                spellCheck="false"
              />
            </div>
          </div>
        )}

        {/* Live Preview Pane */}
        {(viewMode === 'split' || viewMode === 'preview') && (
          <div className="flex-1 h-full overflow-hidden">
            <MarkdownPreview content={content} />
          </div>
        )}

        {/* Contextual Right Panel */}
        {isRightPanelOpen && <ContextualRightPanel documentId={documentId} />}
      </div>
    </div>
  );
}

