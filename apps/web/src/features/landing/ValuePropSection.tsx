'use client';

import React from 'react';
import {
  FolderTree,
  GitBranch,
  FileCheck,
  CheckCircle,
  ArrowRight
} from 'lucide-react';

export function ValuePropSection() {
  const valueProps = [
    {
      icon: FolderTree,
      title: 'Structured Documentation',
      description:
        'Keep every project document organized in a predictable, standardized hierarchy across architecture, APIs, data schemas, and deployment.'
    },
    {
      icon: GitBranch,
      title: 'Engineering Consistency',
      description:
        'Define concrete standards that frontend, backend, database, and infrastructure teams can follow before writing application code.'
    },
    {
      icon: FileCheck,
      title: 'Reusable Templates',
      description:
        'Start immediately with predefined, production-grade engineering documentation templates instead of staring at blank Markdown files.'
    },
    {
      icon: CheckCircle,
      title: 'Development Readiness',
      description:
        'Always understand what is documented, what is missing, what is under active review, and when your project is ready for implementation.'
    }
  ];

  return (
    <section className="py-20 border-t border-border bg-background-secondary/40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Architecture-First Development
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-foreground">
            Everything Your Project Needs Before the First Line of Code.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Eliminate costly rework, misaligned schemas, and chaotic handoffs by establishing a clean technical foundation first.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {valueProps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 border border-primary/20 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="text-base font-semibold text-foreground tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

