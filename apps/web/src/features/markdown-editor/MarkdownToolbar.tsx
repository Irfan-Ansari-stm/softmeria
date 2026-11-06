'use client';

import React from 'react';
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  Code,
  Table,
  CheckSquare,
  List,
  ListOrdered,
  Quote,
  Link,
  Minus,
  Columns2,
  Eye,
  Edit3,
  Maximize2,
  Minimize2,
  Undo,
  Redo
} from 'lucide-react';
import { ViewMode } from '../../stores/useEditorStore';

interface MarkdownToolbarProps {
  onInsert: (prefix: string, suffix?: string, defaultText?: string) => void;
  onUndo: () => void;
  onRedo: () => void;
  viewMode: ViewMode;
  onViewModeChange: (mode: ViewMode) => void;
  isFullScreen: boolean;
  onToggleFullScreen: () => void;
}

export function MarkdownToolbar({
  onInsert,
  onUndo,
  onRedo,
  viewMode,
  onViewModeChange,
  isFullScreen,
  onToggleFullScreen
}: MarkdownToolbarProps) {
  return (
    <div className="h-10 border-b border-border bg-background-secondary/90 px-3 flex items-center justify-between gap-2 overflow-x-auto text-foreground-secondary select-none">
      {/* Left Toolbar Formatting Buttons */}
      <div className="flex items-center gap-0.5">
        <button
          onClick={onUndo}
          title="Undo"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Undo className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={onRedo}
          title="Redo"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Redo className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={() => onInsert('# ', '', 'Heading 1')}
          title="Heading 1"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Heading1 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('## ', '', 'Heading 2')}
          title="Heading 2"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Heading2 className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('### ', '', 'Heading 3')}
          title="Heading 3"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Heading3 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={() => onInsert('**', '**', 'bold text')}
          title="Bold (Ctrl+B)"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Bold className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('*', '*', 'italic text')}
          title="Italic (Ctrl+I)"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Italic className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('~~', '~~', 'strikethrough')}
          title="Strikethrough"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Strikethrough className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-border mx-1" />

        <button
          onClick={() => onInsert('```typescript\n', '\n```', '// code here')}
          title="Code Block"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Code className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() =>
            onInsert(
              '| Column 1 | Column 2 | Column 3 |\n|---|---|---|\n| Item 1 | Item 2 | Item 3 |\n'
            )
          }
          title="Insert Table"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Table className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('- [ ] ', '', 'Task item')}
          title="Checklist Item"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <CheckSquare className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('- ', '', 'Bullet item')}
          title="Bullet List"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <List className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('1. ', '', 'Numbered item')}
          title="Numbered List"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <ListOrdered className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('> ', '', 'Quoted text')}
          title="Blockquote"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Quote className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('[', '](https://example.com)', 'Link title')}
          title="Insert Link"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Link className="h-3.5 w-3.5" />
        </button>
        <button
          onClick={() => onInsert('\n---\n')}
          title="Horizontal Rule"
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Right View Mode & Fullscreen Controls */}
      <div className="flex items-center gap-1">
        <div className="flex items-center p-0.5 rounded-lg bg-background border border-border shadow-xs">
          <button
            onClick={() => onViewModeChange('edit')}
            title="Editor Only"
            className={`p-1 rounded-md text-xs transition-colors ${
              viewMode === 'edit'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Edit3 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('split')}
            title="Split View"
            className={`p-1 rounded-md text-xs transition-colors ${
              viewMode === 'split'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Columns2 className="h-3.5 w-3.5" />
          </button>
          <button
            onClick={() => onViewModeChange('preview')}
            title="Preview Only"
            className={`p-1 rounded-md text-xs transition-colors ${
              viewMode === 'preview'
                ? 'bg-secondary text-foreground font-semibold shadow-xs'
                : 'text-foreground-muted hover:text-foreground'
            }`}
          >
            <Eye className="h-3.5 w-3.5" />
          </button>
        </div>

        <button
          onClick={onToggleFullScreen}
          title={isFullScreen ? 'Exit Full Screen' : 'Full Screen'}
          className="p-1.5 rounded-lg hover:bg-background-tertiary hover:text-foreground transition-colors ml-1"
        >
          {isFullScreen ? (
            <Minimize2 className="h-3.5 w-3.5" />
          ) : (
            <Maximize2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
}
