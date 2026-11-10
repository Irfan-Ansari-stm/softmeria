'use client';

import React, { useState } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { Copy, Check, GitCommit, Play, FileCode, CheckCircle2 } from 'lucide-react';

interface MarkdownPreviewProps {
  content: string;
}

function CodeBlock({ className, children, ...props }: any) {
  const [copied, setCopied] = useState(false);
  const [viewDiagram, setViewDiagram] = useState(true);

  const isInline = !className;
  const match = /language-(\w+)/.exec(className || '');
  const language = match ? match[1] : '';
  const isMermaid = language === 'mermaid';

  const codeText = String(children).replace(/\n$/, '');

  const handleCopy = () => {
    navigator.clipboard.writeText(codeText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (isInline) {
    return (
      <code
        className="px-1.5 py-0.5 rounded bg-background-secondary border border-border text-primary font-mono text-xs"
        {...props}
      >
        {children}
      </code>
    );
  }

  // Mermaid Diagram Block
  if (isMermaid) {
    return (
      <div className="my-5 rounded-xl border border-primary/20 bg-background-secondary/50 overflow-hidden shadow-xs">
        <div className="flex items-center justify-between px-3.5 py-2 bg-primary/5 border-b border-primary/10 text-xs">
          <div className="flex items-center gap-2 text-primary font-medium">
            <GitCommit className="h-3.5 w-3.5" />
            <span className="font-semibold text-[11px] uppercase tracking-wider">Mermaid Architecture Diagram</span>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewDiagram(!viewDiagram)}
              className="text-[11px] text-foreground-muted hover:text-foreground underline underline-offset-2 transition-colors"
            >
              {viewDiagram ? 'Show Raw Source' : 'Show Diagram'}
            </button>
            <button
              onClick={handleCopy}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-card border border-border text-[11px] text-foreground-secondary hover:text-foreground transition-colors"
              title="Copy diagram source"
            >
              {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
              <span>{copied ? 'Copied' : 'Copy'}</span>
            </button>
          </div>
        </div>

        {viewDiagram ? (
          <div className="p-6 flex flex-col items-center justify-center bg-card/60 overflow-x-auto min-h-[140px]">
            {/* Architectural Diagram Visualizer */}
            <div className="max-w-full space-y-3 font-mono text-xs text-foreground py-2">
              <div className="p-4 rounded-lg border border-border/80 bg-background-secondary/80 shadow-xs space-y-2">
                <div className="flex items-center gap-2 text-primary text-[11px] font-semibold">
                  <Play className="h-3 w-3" />
                  <span>Diagram Flowchart / Sequence Model</span>
                </div>
                <pre className="text-[11px] text-foreground-secondary leading-relaxed overflow-x-auto whitespace-pre p-2 bg-background/50 rounded border border-border/40 font-mono">
                  {codeText}
                </pre>
              </div>
            </div>
          </div>
        ) : (
          <pre className="p-4 text-xs font-mono bg-background overflow-x-auto text-foreground-secondary">
            <code>{codeText}</code>
          </pre>
        )}
      </div>
    );
  }

  // Standard Syntax Highlighted Code Block with Copy
  return (
    <div className="relative group my-4 rounded-xl border border-border bg-card overflow-hidden shadow-xs">
      <div className="flex items-center justify-between px-3.5 py-1.5 bg-background-secondary border-b border-border text-[11px] text-foreground-muted">
        <span className="font-mono uppercase font-semibold text-[10px] text-foreground-secondary">
          {language || 'code'}
        </span>
        <button
          onClick={handleCopy}
          className="inline-flex items-center gap-1 px-2 py-0.5 rounded bg-card/80 hover:bg-card border border-border text-[10px] text-foreground-secondary hover:text-foreground transition-colors"
        >
          {copied ? <Check className="h-3 w-3 text-success" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Copied!' : 'Copy Code'}</span>
        </button>
      </div>
      <pre className="p-4 overflow-x-auto text-xs font-mono leading-relaxed bg-background/50">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    </div>
  );
}

export const MarkdownPreview = React.memo(function MarkdownPreview({ content }: MarkdownPreviewProps) {
  if (!content.trim()) {
    return (
      <div className="h-full flex items-center justify-center p-8 text-foreground-muted text-xs italic">
        Preview will appear here as you type Markdown content...
      </div>
    );
  }

  return (
    <div className="h-full w-full min-w-0 overflow-y-auto overflow-x-hidden p-6 lg:p-8 bg-background text-foreground transition-colors">
      <div className="markdown-body w-full max-w-none break-words [overflow-wrap:anywhere]">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Clean table styling
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-border">
                <table className="min-w-full divide-y divide-border" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="px-3 py-2 text-left text-xs font-semibold text-foreground bg-background-secondary border-b border-border" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-2 text-xs text-foreground-secondary border-b border-border/60" {...props} />
            ),
            // Custom links
            a: ({ node, ...props }) => (
              <a
                className="text-primary hover:underline underline-offset-2 font-medium"
                target="_blank"
                rel="noreferrer"
                {...props}
              />
            ),
            // Code & Mermaid Block
            code: CodeBlock
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
});
