'use client';

import React from 'react';
import {
  AlertOctagon,
  CheckCircle2,
  XCircle,
  FileQuestion,
  Layers,
  ArrowRight
} from 'lucide-react';

export function ProblemSection() {
  const chaosPoints = [
    'Scattered Markdown files across repos, Notion, and Google Docs',
    'Inconsistent architecture decisions buried in Slack threads',
    'Missing API contracts leading to broken client integrations',
    'Unclear frontend and backend boundary standards',
    'Outdated technical documentation abandoned after sprint 1',
    'No central source of truth for the entire engineering team',
    'Painful, high-friction handoffs between engineers and architects'
  ];

  const devblueprintPoints = [
    'One centralized, structured workspace for all engineering specifications',
    'Standardized architecture categories matching modern software tiers',
    'Production-ready templates with required sections and schema checks',
    'Clear frontend, backend, database, and infrastructure contracts',
    'Real-time blueprint progress and completion rate visibility',
    'Built-in architecture review, sign-offs, and version history diffs',
    'Instant export to GitHub Flavored Markdown and full project ZIP archives'
  ];

  return (
    <section className="py-24 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-destructive">
            The Documentation Crisis
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Software Projects Shouldn&apos;t Start With Documentation Chaos.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Writing code before aligning on the blueprint costs teams months of refactoring. See the difference between scattered notes and a true engineering foundation.
          </p>
        </div>

        {/* Visual Before & After Comparison */}
        <div className="mt-14 grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Before: Documentation Chaos */}
          <div className="p-6 sm:p-8 rounded-2xl border border-destructive/30 bg-destructive/5 space-y-6">
            <div className="flex items-center justify-between border-b border-destructive/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-destructive/10 text-destructive flex items-center justify-center font-bold">
                  <XCircle className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">Before DevBlueprint</h3>
                  <p className="text-xs text-foreground-muted">Scattered, Disconnected, Inconsistent</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-destructive/10 text-destructive border border-destructive/20">
                HIGH REWORK RISK
              </span>
            </div>

            <ul className="space-y-3 text-xs text-foreground-secondary">
              {chaosPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <XCircle className="h-4 w-4 text-destructive shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="p-3.5 rounded-xl border border-dashed border-destructive/30 bg-background/60 font-mono text-[11px] text-foreground-muted space-y-1">
              <div className="text-destructive font-semibold">⚠️ Typical Sprint 1 Bottleneck:</div>
              <p className="text-[10px] italic">
                &ldquo;Wait, is the payment status payload `state` or `status`? Why does the database table say `order_state`?&rdquo;
              </p>
            </div>
          </div>

          {/* After: DevBlueprint Workspace */}
          <div className="p-6 sm:p-8 rounded-2xl border border-primary/30 bg-primary/5 space-y-6">
            <div className="flex items-center justify-between border-b border-primary/20 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold">
                  <CheckCircle2 className="h-4 w-4" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-foreground">After DevBlueprint</h3>
                  <p className="text-xs text-foreground-muted">One Unified Technical Foundation</p>
                </div>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-success/10 text-success border border-success/20">
                DEVELOPMENT READY
              </span>
            </div>

            <ul className="space-y-3 text-xs text-foreground-secondary">
              {devblueprintPoints.map((point, idx) => (
                <li key={idx} className="flex items-start gap-2.5 leading-relaxed">
                  <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>

            <div className="p-3.5 rounded-xl border border-primary/20 bg-background/80 font-mono text-[11px] text-foreground space-y-1">
              <div className="text-primary font-semibold">✓ Production Blueprint Invariant:</div>
              <p className="text-[10px] text-foreground-secondary">
                All 7 categories verified, API contracts locked, database schemas normalized, and 100% ready for code execution.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

