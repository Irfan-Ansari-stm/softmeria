'use client';

import React from 'react';
import {
  FolderKanban,
  FileCode2,
  BookmarkCheck,
  Palette,
  LayoutTemplate,
  Server,
  Database,
  History,
  Users2,
  Archive,
  BarChart3,
  Search
} from 'lucide-react';

export function FeatureGridSection() {
  const features = [
    {
      icon: FolderKanban,
      title: 'Project Management',
      description: 'Organize multiple software projects in separate workspaces with custom tech stacks, categories, and visibility.'
    },
    {
      icon: FileCode2,
      title: 'Markdown Editor & Preview',
      description: 'Write, edit, and preview Markdown documents with a professional dual-pane editor, syntax formatting, and auto-save.'
    },
    {
      icon: BookmarkCheck,
      title: 'Documentation Templates',
      description: 'Start immediately with structured, battle-tested engineering templates covering every phase of development.'
    },
    {
      icon: Palette,
      title: 'Design System Documentation',
      description: 'Define colors, typography, spacing scales, interactive component states, and centralized design tokens.'
    },
    {
      icon: LayoutTemplate,
      title: 'Frontend Architecture',
      description: 'Document application directory structures, client/server state management, routing paradigms, and component boundaries.'
    },
    {
      icon: Server,
      title: 'Backend Architecture',
      description: 'Define REST and gRPC API contracts, microservice topologies, authentication flows, and business logic invariants.'
    },
    {
      icon: Database,
      title: 'Database Documentation',
      description: 'Organize entity-relationship schemas, primary/foreign keys, indexing strategies, and database migration roadmaps.'
    },
    {
      icon: History,
      title: 'Version History & Diff',
      description: 'Track granular document revisions over time, view visual line-by-line diffs, and restore previous drafts in one click.'
    },
    {
      icon: Users2,
      title: 'Team Collaboration',
      description: 'Invite team members, assign fine-grained RBAC roles, leave threaded review comments, and sign off on blueprints.'
    },
    {
      icon: Archive,
      title: 'Import & Export',
      description: 'Import existing Markdown documentation and export full project blueprints as clean GitHub-ready ZIP archives.'
    },
    {
      icon: BarChart3,
      title: 'Documentation Progress',
      description: 'Track project blueprint completeness with real-time percentage indicators, document statuses, and review counters.'
    },
    {
      icon: Search,
      title: 'Global Fast Search',
      description: 'Find documents, projects, blueprints, and code definitions across your entire workspace instantly via Ctrl+K.'
    }
  ];

  return (
    <section id="features" className="py-24 border-t border-border bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Complete Feature Toolkit
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Everything You Need to Define Your Software Before Building It.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Engineered specifically for developers, architects, and technical leaders who value clarity and architectural precision.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feat, idx) => {
            const Icon = feat.icon;
            return (
              <div
                key={idx}
                className="p-6 rounded-2xl border border-border bg-card hover:border-primary/40 hover:shadow-md transition-all group flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="h-10 w-10 rounded-xl bg-background-secondary border border-border text-foreground group-hover:text-primary group-hover:border-primary/30 flex items-center justify-center transition-colors">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="font-semibold text-sm text-foreground tracking-tight">
                    {feat.title}
                  </h3>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    {feat.description}
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

