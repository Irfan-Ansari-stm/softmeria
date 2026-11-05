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
      <div className="h-full flex items-center justify-center p-8 text-zinc-600 text-xs italic">
        Preview will appear here as you type Markdown content...
      </div>
    );
  }

  return (
    <div className="h-full overflow-y-auto p-6 bg-zinc-950 text-zinc-200">
      <div className="markdown-body max-w-4xl mx-auto">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
          components={{
            // Clean table styling
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto my-4 rounded-lg border border-zinc-800">
                <table className="min-w-full divide-y divide-zinc-800" {...props} />
              </div>
            ),
            th: ({ node, ...props }) => (
              <th className="px-3 py-2 text-left text-xs font-semibold text-zinc-200 bg-zinc-900 border-b border-zinc-800" {...props} />
            ),
            td: ({ node, ...props }) => (
              <td className="px-3 py-2 text-xs text-zinc-300 border-b border-zinc-800/60" {...props} />
            ),
            // Custom links
            a: ({ node, ...props }) => (
              <a
                className="text-indigo-400 hover:text-indigo-300 underline underline-offset-2"
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
                    className="px-1.5 py-0.5 rounded bg-zinc-900 border border-zinc-800 text-indigo-300 font-mono text-xs"
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

