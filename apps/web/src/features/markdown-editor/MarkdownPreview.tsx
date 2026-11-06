'use client';

import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';

interface MarkdownPreviewProps {
  content: string;
}

export function MarkdownPreview({ content }: MarkdownPreviewProps) {
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
            // Code block styling
            code({ className, children, ...props }) {
              const isInline = !className;
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
              return (
                <code className={className} {...props}>
                  {children}
                </code>
              );
            }
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
