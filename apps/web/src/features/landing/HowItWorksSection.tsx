'use client';

import React from 'react';
import {
  FolderPlus,
  GitFork,
  FileEdit,
  UserCheck,
  Download,
  ArrowRight
} from 'lucide-react';

export function HowItWorksSection() {
  const steps = [
    {
      step: '01',
      icon: FolderPlus,
      title: 'Create a Project',
      description: 'Define your software project, category domain, and chosen technology stack in seconds.'
    },
    {
      step: '02',
      icon: GitFork,
      title: 'Generate Your Structure',
      description: 'Instantly scaffold a structured documentation hierarchy with predefined production templates.'
    },
    {
      step: '03',
      icon: FileEdit,
      title: 'Define Your Architecture',
      description: 'Draft product requirements, design tokens, frontend routers, backend APIs, and DB schemas.'
    },
    {
      step: '04',
      icon: UserCheck,
      title: 'Review & Collaborate',
      description: 'Invite your engineering team, review architectural invariants, resolve feedback, and sign off.'
    },
    {
      step: '05',
      icon: Download,
      title: 'Export & Build',
      description: 'Export clean GitHub-ready Markdown archives and start writing application code with 100% clarity.'
    }
  ];

  return (
    <section id="how-it-works" className="py-24 border-t border-border bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Streamlined Methodology
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            From Idea to Development-Ready Blueprint in Five Steps.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Follow a proven sequence that turns ambiguity into an organized, executable technical plan.
          </p>
        </div>

        {/* 5-Step Connected Workflow Grid */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-5 gap-4 relative">
          {steps.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-4 relative group"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-primary">
                      STEP {item.step}
                    </span>
                    <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  <h3 className="font-semibold text-sm text-foreground tracking-tight">
                    {item.title}
                  </h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {idx < 4 && (
                  <div className="hidden md:block absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-border group-hover:text-primary transition-colors">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

