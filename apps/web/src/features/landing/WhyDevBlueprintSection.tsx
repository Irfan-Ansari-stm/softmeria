'use client';

import React from 'react';
import {
  Check,
  Shield,
  Layers,
  FileCode,
  Compass,
  Bookmark,
  Users,
  DownloadCloud
} from 'lucide-react';

export function WhyDevBlueprintSection() {
  const differentiators = [
    {
      icon: Compass,
      title: 'Purpose-Built for Software Engineering',
      description: 'Unlike generic wikis or unstructured note apps, DevBlueprint is built explicitly around the engineering lifecycle and modern architectural tiers.'
    },
    {
      icon: Layers,
      title: 'Organized Documentation Hierarchy',
      description: 'Pre-structured categories for product requirements, design systems, frontend, backend, database, infrastructure, quality, and governance.'
    },
    {
      icon: FileCode,
      title: 'Real Markdown Files, Zero Vendor Lock-in',
      description: 'Your documentation is stored as pure, standardized GitHub Flavored Markdown. No proprietary databases or black-box binary formats.'
    },
    {
      icon: Shield,
      title: 'Architecture-First Project Planning',
      description: 'Establish contracts, schemas, and security standards before writing application code to prevent weeks of downstream refactoring.'
    },
    {
      icon: Bookmark,
      title: 'Reusable Engineering Templates',
      description: 'Bootstrap technical specifications in seconds using battle-tested templates with required sections and architecture checklists.'
    },
    {
      icon: Users,
      title: 'Native Team Collaboration & Audits',
      description: 'Review requests, approval workflows, threaded comments, and immutable audit logs designed for engineering governance.'
    },
    {
      icon: DownloadCloud,
      title: '100% Exportable Project Blueprints',
      description: 'Export your entire project documentation as a clean directory structure and ZIP archive directly into your Git repository.'
    }
  ];

  return (
    <section className="py-24 border-t border-border bg-background-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Engineering Philosophy
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Documentation Is Not an Afterthought. It&apos;s Your Foundation.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Great software systems are built on clear engineering specifications. DevBlueprint gives engineering teams the rigor of software architecture with the speed of modern tools.
          </p>
        </div>

        <div className="mt-14 max-w-4xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
          {differentiators.map((diff, idx) => {
            const Icon = diff.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 transition-all space-y-3"
              >
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4" />
                  </div>
                  <h3 className="font-bold text-sm text-foreground tracking-tight">
                    {diff.title}
                  </h3>
                </div>
                <p className="text-xs text-foreground-secondary leading-relaxed pl-12">
                  {diff.description}
                </p>
              </div>
            );
          })}
        </div>

        {/* Ownership banner */}
        <div className="mt-12 max-w-3xl mx-auto p-4 rounded-xl border border-primary/20 bg-primary/5 text-center space-y-1">
          <span className="text-xs font-semibold text-primary">100% Data Sovereignty Guarantee</span>
          <p className="text-xs text-foreground-secondary">
            You always own your data. Export your entire technical blueprint at any time with zero loss of formatting or links.
          </p>
        </div>
      </div>
    </section>
  );
}

