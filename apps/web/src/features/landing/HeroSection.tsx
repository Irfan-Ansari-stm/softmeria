'use client';

import React from 'react';
import Link from 'next/link';
import {
  ArrowRight,
  Sparkles,
  CheckCircle2,
  FileText,
  FolderKanban,
  Check,
  ShieldCheck,
  Database,
  Layers,
  Code2,
  Terminal,
  Clock,
  Tag
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../stores/useAuthStore';

export function HeroSection() {
  const { isAuthenticated } = useAuthStore();

  const supportingPills = [
    'Designed for developers',
    'Structured engineering documentation',
    'Export-ready Markdown',
    'Built for teams'
  ];

  return (
    <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
      {/* Subtle background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-primary/5 via-primary/2 to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Hero Copy */}
        <div className="max-w-4xl mx-auto text-center space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-border bg-background-secondary/80 text-[11px] font-medium text-foreground-secondary shadow-xs">
            <span className="flex h-1.5 w-1.5 rounded-full bg-success animate-pulse" />
            <span className="text-foreground font-semibold">DevBlueprint 1.0</span>
            <span className="text-foreground-muted">•</span>
            <span>Centralized Technical Architecture Platform</span>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-foreground leading-[1.12]">
            Build Better Software.{' '}
            <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
              Start With a Better Blueprint.
            </span>
          </h1>

          {/* Supporting Description */}
          <p className="text-base sm:text-lg text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
            Your software architecture deserves more than scattered Markdown files. Plan, document, organize, and manage every engineering decision in one structured workspace.
          </p>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <Link href={isAuthenticated ? '/dashboard' : '/register'}>
              <Button size="lg" variant="primary" className="w-full sm:w-auto text-xs sm:text-sm font-semibold h-11 px-6 shadow-md shadow-primary/20 gap-2">
                <span>{isAuthenticated ? 'Enter Your Workspace' : 'Start Building for Free'}</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>

            <a
              href="#showcase"
              onClick={(e) => {
                e.preventDefault();
                document.querySelector('#showcase')?.scrollIntoView({ behavior: 'smooth' });
              }}
            >
              <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm font-medium h-11 px-6 border-border hover:bg-background-secondary">
                Explore the Platform
              </Button>
            </a>
          </div>

          {/* Supporting Checkmarks */}
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 pt-4 text-xs text-foreground-muted">
            {supportingPills.map((pill) => (
              <div key={pill} className="flex items-center gap-1.5">
                <Check className="h-3.5 w-3.5 text-primary shrink-0" />
                <span>{pill}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Hero Visual: Miniature Realistic DevBlueprint Interface Mockup with Floating Labels */}
        <div className="mt-14 sm:mt-18 max-w-5xl mx-auto relative">
          {/* Floating Pill Labels around the mockup */}
          <div className="hidden lg:flex items-center gap-1.5 absolute -top-4 -left-6 z-20 px-3 py-1.5 rounded-xl border border-border bg-card shadow-lg text-[11px] font-medium text-foreground">
            <Database className="h-3.5 w-3.5 text-primary" />
            <span>Database Schema</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 absolute -top-4 -right-6 z-20 px-3 py-1.5 rounded-xl border border-border bg-card shadow-lg text-[11px] font-medium text-foreground">
            <ShieldCheck className="h-3.5 w-3.5 text-success" />
            <span>Security Standards</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 absolute top-1/2 -left-10 -translate-y-1/2 z-20 px-3 py-1.5 rounded-xl border border-border bg-card shadow-lg text-[11px] font-medium text-foreground">
            <Layers className="h-3.5 w-3.5 text-blue-500" />
            <span>Design System</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 absolute top-1/2 -right-10 -translate-y-1/2 z-20 px-3 py-1.5 rounded-xl border border-border bg-card shadow-lg text-[11px] font-medium text-foreground">
            <Code2 className="h-3.5 w-3.5 text-amber-500" />
            <span>API Architecture</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 absolute -bottom-4 left-1/3 z-20 px-3 py-1.5 rounded-xl border border-border bg-card shadow-lg text-[11px] font-medium text-foreground">
            <Sparkles className="h-3.5 w-3.5 text-primary" />
            <span>Engineering Blueprint</span>
          </div>

          {/* Main App Container Mockup */}
          <div className="rounded-2xl border border-border bg-card shadow-2xl overflow-hidden transition-all">
            {/* Window Chrome / Titlebar */}
            <div className="h-10 bg-background-secondary border-b border-border px-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full bg-red-400/80" />
                <div className="h-3 w-3 rounded-full bg-amber-400/80" />
                <div className="h-3 w-3 rounded-full bg-emerald-400/80" />
                <span className="ml-2 font-mono text-[11px] text-foreground-muted hidden sm:inline">
                  devblueprint.io/projects/fintech-payment-orchestrator
                </span>
              </div>
              <div className="flex items-center gap-2 text-[10px] font-mono text-foreground-muted">
                <span className="flex h-1.5 w-1.5 rounded-full bg-success" />
                <span>Connected • PostgreSQL v16</span>
              </div>
            </div>

            {/* Application Mockup Layout */}
            <div className="grid grid-cols-12 min-h-[440px] text-xs">
              {/* Left Sidebar Mockup (3 cols) */}
              <div className="col-span-12 md:col-span-3 border-r border-border bg-background p-3 space-y-3 hidden md:block">
                {/* Project Badge */}
                <div className="p-2.5 rounded-xl bg-background-secondary border border-border space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-md bg-emerald-500 text-white flex items-center justify-center font-bold text-xs shrink-0">
                      FP
                    </div>
                    <div className="min-w-0">
                      <p className="font-semibold text-foreground truncate text-[11px]">Payment Orchestrator</p>
                      <p className="text-[10px] text-foreground-muted">Microservices</p>
                    </div>
                  </div>
                  {/* Blueprint Progress */}
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px]">
                      <span className="text-foreground-muted">Blueprint</span>
                      <span className="font-mono text-foreground font-semibold">50% (7/17)</span>
                    </div>
                    <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>

                {/* Categories & Docs Tree */}
                <div className="space-y-1">
                  <div className="text-[9px] font-semibold uppercase tracking-wider text-foreground-muted px-1">
                    Documentation Tree
                  </div>
                  <div className="space-y-0.5">
                    <div className="px-2 py-1 rounded bg-secondary/80 font-medium text-foreground flex items-center justify-between text-[11px]">
                      <span className="truncate">01. Product & Regulatory</span>
                      <span className="font-mono text-[9px] text-success">3/3</span>
                    </div>
                    <div className="pl-3 space-y-0.5">
                      <div className="px-2 py-1 rounded bg-primary/10 text-primary font-medium flex items-center gap-1.5 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        <span className="truncate">PRODUCT_OVERVIEW.md</span>
                      </div>
                      <div className="px-2 py-0.5 text-foreground-muted flex items-center gap-1.5 text-[10px]">
                        <CheckCircle2 className="h-3 w-3 text-success shrink-0" />
                        <span className="truncate">REGULATORY_SPEC.md</span>
                      </div>
                    </div>
                    <div className="px-2 py-1 text-foreground-secondary flex items-center justify-between text-[11px]">
                      <span className="truncate">02. Security & Tokenization</span>
                      <span className="font-mono text-[9px] text-foreground-muted">2/2</span>
                    </div>
                    <div className="px-2 py-1 text-foreground-secondary flex items-center justify-between text-[11px]">
                      <span className="truncate">03. Microservices & API</span>
                      <span className="font-mono text-[9px] text-foreground-muted">3/3</span>
                    </div>
                    <div className="px-2 py-1 text-foreground-secondary flex items-center justify-between text-[11px]">
                      <span className="truncate">04. Ledger Architecture</span>
                      <span className="font-mono text-[9px] text-foreground-muted">2/2</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Center Editor + Preview (6 cols) */}
              <div className="col-span-12 md:col-span-6 flex flex-col bg-background">
                {/* Editor Header Bar */}
                <div className="h-9 border-b border-border px-3 flex items-center justify-between bg-background-secondary/60">
                  <div className="flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-primary" />
                    <span className="font-mono text-[11px] font-semibold text-foreground">
                      PRODUCT_OVERVIEW.md
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-success flex items-center gap-1 font-medium">
                      <CheckCircle2 className="h-3 w-3" /> Auto-saved
                    </span>
                    <Badge variant="outline" className="text-[9px] py-0 px-1">
                      Split View
                    </Badge>
                  </div>
                </div>

                {/* Editor Split: Code on left, Live Render on right */}
                <div className="flex-1 grid grid-cols-2 divide-x divide-border font-mono text-[11px] leading-relaxed p-3 bg-card overflow-hidden">
                  {/* Left: Source Markdown */}
                  <div className="space-y-1 text-foreground-secondary pr-2">
                    <p className="text-primary font-bold"># Payment Orchestrator</p>
                    <p className="text-foreground-muted">## Core Architecture</p>
                    <p className="text-[10px]">Routes payments across 12 acquirers with dynamic lowest-cost routing.</p>
                    <div className="p-1.5 rounded bg-background border border-border text-[9px] text-foreground mt-2">
                      <p className="text-emerald-500">```text</p>
                      <p>[ Checkout ] -&gt; [ Gateway ]</p>
                      <p>  -&gt; [ Risk Engine ]</p>
                      <p>  -&gt; [ Acquirer ]</p>
                      <p className="text-emerald-500">```</p>
                    </div>
                  </div>

                  {/* Right: Rendered Output */}
                  <div className="space-y-2 pl-3 font-sans">
                    <h3 className="text-xs font-bold text-foreground">Payment Orchestrator</h3>
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">
                      Production Blueprint
                    </Badge>
                    <p className="text-[10px] text-foreground-secondary leading-normal">
                      Routes payments across 12 acquirers with dynamic lowest-cost routing.
                    </p>
                    <div className="p-2 rounded-lg bg-background-secondary border border-border text-[10px] space-y-1">
                      <div className="flex justify-between font-mono text-[9px] text-foreground-muted">
                        <span>THROUGHPUT</span>
                        <span className="text-success font-semibold">10,000 TPS</span>
                      </div>
                      <div className="flex justify-between font-mono text-[9px] text-foreground-muted">
                        <span>LATENCY P99</span>
                        <span className="text-primary font-semibold">&lt; 45ms</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Contextual Inspector (3 cols) */}
              <div className="col-span-12 md:col-span-3 border-l border-border bg-background p-3 space-y-3 hidden md:block">
                <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted border-b border-border pb-2">
                  Document Inspector
                </div>
                <div className="space-y-2 text-[11px]">
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-foreground-muted">Status</span>
                    <Badge variant="success" className="text-[9px] py-0 px-1.5">
                      COMPLETED
                    </Badge>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-foreground-muted">Version</span>
                    <span className="font-mono text-foreground font-semibold">v3.0.0</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-border/60">
                    <span className="text-foreground-muted">Sign-off</span>
                    <span className="text-foreground font-medium">Lead Architect</span>
                  </div>
                  <div className="space-y-1 pt-1">
                    <span className="text-foreground-muted text-[10px] block">Tags</span>
                    <div className="flex flex-wrap gap-1">
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-primary/10 text-primary border border-primary/20">
                        PCI-DSS
                      </span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-secondary text-foreground-secondary border border-border">
                        ISO20022
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

