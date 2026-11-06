'use client';

import React, { useState } from 'react';
import {
  FolderKanban,
  FileText,
  Code2,
  Bookmark,
  Users,
  CheckCircle2,
  Clock,
  ChevronRight,
  History,
  MessageSquare,
  FileCheck,
  Send,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';
import { Button } from '../../components/ui/button';

export function ProductShowcaseSection() {
  const [activeTab, setActiveTab] = useState<'projects' | 'workspace' | 'editor' | 'templates' | 'collaboration'>('editor');

  const tabs = [
    { id: 'projects', label: 'Project Management', icon: FolderKanban },
    { id: 'workspace', label: 'Documentation Workspace', icon: FileText },
    { id: 'editor', label: 'Markdown Editor & Preview', icon: Code2 },
    { id: 'templates', label: 'Engineering Templates', icon: Bookmark },
    { id: 'collaboration', label: 'Team Collaboration', icon: Users }
  ];

  return (
    <section id="showcase" className="py-24 border-t border-border bg-background-secondary/30 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Interactive Product Tour
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            One Workspace. Your Entire Engineering Blueprint.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Click across the core modules to see how DevBlueprint streamlines every phase of technical architecture.
          </p>
        </div>

        {/* Tab Switcher Pills */}
        <div className="mt-10 flex flex-wrap items-center justify-center gap-2">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all shadow-xs ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-md shadow-primary/20 scale-[1.02]'
                    : 'bg-card text-foreground-secondary hover:text-foreground hover:bg-background-secondary border border-border'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Dynamic Display Area */}
        <div className="mt-8 max-w-5xl mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Header Bar */}
          <div className="h-11 bg-background-secondary border-b border-border px-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-xs font-mono text-foreground-muted">
              <span className="font-semibold text-foreground">DevBlueprint</span>
              <span>/</span>
              <span className="text-primary font-medium">{tabs.find((t) => t.id === activeTab)?.label}</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-success" />
              <span className="text-[10px] font-mono text-foreground-muted uppercase">Live Preview</span>
            </div>
          </div>

          {/* Tab 1: Project Management */}
          {activeTab === 'projects' && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold text-foreground">Multi-Project Management</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    Track architectural completion across independent distributed services.
                  </p>
                </div>
                <Badge variant="success">1 Active Enterprise Service</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Project Card 1 */}
                <div className="p-5 rounded-xl border border-primary/40 bg-background-secondary/50 space-y-4 shadow-xs">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="h-9 w-9 rounded-lg bg-emerald-500 text-white flex items-center justify-center font-bold text-sm">
                        FP
                      </div>
                      <div>
                        <h4 className="font-bold text-sm text-foreground">FinTech Payment Orchestrator</h4>
                        <span className="text-[11px] text-foreground-muted">Microservices Architecture</span>
                      </div>
                    </div>
                    <Badge variant="outline" className="text-[10px]">ACTIVE</Badge>
                  </div>
                  <p className="text-xs text-foreground-secondary leading-relaxed">
                    Distributed multi-acquirer payment router with ISO20022 compliance and real-time fraud scoring.
                  </p>
                  <div className="flex flex-wrap gap-1.5 font-mono text-[10px]">
                    <span className="px-2 py-0.5 rounded bg-background border border-border">Node.js</span>
                    <span className="px-2 py-0.5 rounded bg-background border border-border">Go</span>
                    <span className="px-2 py-0.5 rounded bg-background border border-border">Kafka</span>
                    <span className="px-2 py-0.5 rounded bg-background border border-border">PostgreSQL</span>
                  </div>
                  <div className="pt-2 border-t border-border space-y-1.5">
                    <div className="flex justify-between text-xs">
                      <span className="text-foreground-muted">Documentation Blueprint</span>
                      <span className="font-mono text-foreground font-semibold">50% (7/17 Docs)</span>
                    </div>
                    <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                      <div className="h-full bg-emerald-500 rounded-full w-1/2" />
                    </div>
                  </div>
                </div>

                {/* Project Card 2 (Template creation preview) */}
                <div className="p-5 rounded-xl border border-dashed border-border bg-card flex flex-col justify-between items-center text-center space-y-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 text-primary flex items-center justify-center">
                    <FolderKanban className="h-5 w-5" />
                  </div>
                  <div className="space-y-1">
                    <h4 className="font-semibold text-sm text-foreground">Create New Service Blueprint</h4>
                    <p className="text-xs text-foreground-muted max-w-xs">
                      Initialize standard blueprints for Event-Driven, Mobile, or SaaS architectures in 1 click.
                    </p>
                  </div>
                  <Button size="sm" variant="outline" className="text-xs">
                    + New Project
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Tab 2: Documentation Workspace */}
          {activeTab === 'workspace' && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Structured Documentation Tree</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    Hierarchical category folders matching standard enterprise software architecture layers.
                  </p>
                </div>
                <span className="text-xs font-mono text-primary font-medium">7 Categories • 17 Documents</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                {[
                  { name: '01. Product & Regulatory Blueprint', docs: 3, done: 3, status: 'COMPLETED' },
                  { name: '02. Security & Tokenization Architecture', docs: 2, done: 2, status: 'APPROVED' },
                  { name: '03. Microservices & API Architecture', docs: 3, done: 1, status: 'IN_REVIEW' },
                  { name: '04. Data Architecture & Ledger Design', docs: 2, done: 0, status: 'IN_PROGRESS' },
                  { name: '05. Infrastructure, Kafka & High Availability', docs: 2, done: 0, status: 'IN_PROGRESS' },
                  { name: '06. Quality Assurance & Chaos Engineering', docs: 2, done: 0, status: 'DRAFT' },
                  { name: '07. Operations, Reconciliation & Governance', docs: 3, done: 1, status: 'APPROVED' }
                ].map((cat, idx) => (
                  <div
                    key={idx}
                    className="p-3.5 rounded-xl border border-border bg-background-secondary/60 flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <div className="h-6 w-6 rounded bg-primary/10 text-primary flex items-center justify-center font-bold text-[10px]">
                        0{idx + 1}
                      </div>
                      <span className="font-semibold text-foreground truncate">{cat.name}</span>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className="font-mono text-[10px] text-foreground-muted">
                        {cat.done}/{cat.docs}
                      </span>
                      <Badge
                        variant={
                          cat.status === 'COMPLETED' || cat.status === 'APPROVED'
                            ? 'success'
                            : cat.status === 'IN_REVIEW'
                            ? 'warning'
                            : 'outline'
                        }
                        className="text-[9px] py-0 px-1.5"
                      >
                        {cat.status}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 3: Markdown Editor & Preview */}
          {activeTab === 'editor' && (
            <div className="animate-in fade-in duration-200">
              <div className="h-10 border-b border-border bg-background-secondary px-4 flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-primary" />
                  <span className="font-mono font-semibold text-foreground">DOUBLE_ENTRY_LEDGER.md</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-success flex items-center gap-1 font-medium">
                    <CheckCircle2 className="h-3.5 w-3.5" /> Auto-saved (v3.0)
                  </span>
                  <div className="h-4 w-px bg-border" />
                  <span className="font-mono text-[10px] text-foreground-muted">48 Lines • 312 Words</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border min-h-[300px]">
                {/* Source Pane */}
                <div className="p-4 bg-background font-mono text-xs leading-6 space-y-1 text-foreground-secondary">
                  <p className="text-primary font-bold"># Double-Entry Ledger Bookkeeping</p>
                  <p className="text-foreground-muted">## Fundamental Invariant</p>
                  <p className="text-foreground font-semibold">{"$$\\sum \\text{Debits} = \\sum \\text{Credits}$$"}</p>
                  <p className="text-foreground">Every mutation creates a Journal Entry with matched postings.</p>
                  <div className="p-2 rounded bg-background-secondary border border-border text-[11px] text-foreground mt-2">
                    <p className="text-emerald-500">CREATE TABLE postings (</p>
                    <p className="pl-4">id UUID PRIMARY KEY,</p>
                    <p className="pl-4">journal_entry_id UUID REFERENCES entries,</p>
                    <p className="pl-4">amount_cents BIGINT NOT NULL</p>
                    <p className="text-emerald-500">);</p>
                  </div>
                </div>

                {/* Rendered Live Preview Pane */}
                <div className="p-5 bg-card space-y-3 font-sans">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-sm text-foreground">Double-Entry Ledger Bookkeeping</h3>
                    <Badge variant="status-progress" className="text-[9px]">IN_PROGRESS</Badge>
                  </div>
                  <div className="p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs space-y-1">
                    <span className="font-semibold text-primary block">Mathematical Consistency Rule:</span>
                    <p className="text-foreground-secondary text-[11px]">
                      Postings must strictly balance to zero across asset and liability ledgers before the database commit.
                    </p>
                  </div>
                  <div className="space-y-1 text-xs">
                    <span className="font-mono text-[10px] text-foreground-muted uppercase">Schema Contract:</span>
                    <div className="p-2.5 rounded-lg bg-background-secondary border border-border font-mono text-[10px] flex justify-between">
                      <span className="text-foreground">postings.amount_cents</span>
                      <span className="text-primary">BIGINT (Signed)</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 4: Engineering Templates */}
          {activeTab === 'templates' && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Predefined Engineering Templates</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    Never start with a blank page. Battle-tested blueprints for modern tech stacks.
                  </p>
                </div>
                <Badge variant="outline">Built-in Library</Badge>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                {[
                  { title: 'API Specification Contract', cat: 'Backend', sections: 6, tag: 'REST / gRPC' },
                  { title: 'Database Relational Design', cat: 'Database', sections: 5, tag: 'Postgres / SQL' },
                  { title: 'Frontend Architecture Blueprint', cat: 'Frontend', sections: 7, tag: 'Next.js / React' },
                  { title: 'PCI-DSS Tokenization Vault', cat: 'Security', sections: 5, tag: 'Compliance' },
                  { title: 'Kafka Event-Driven Topology', cat: 'Infrastructure', sections: 6, tag: 'Distributed' },
                  { title: 'Design System & Tokens', cat: 'Design', sections: 8, tag: 'Tailwind / Tokens' }
                ].map((tmpl, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-xl border border-border bg-card hover:border-primary/50 transition-colors space-y-2 shadow-xs"
                  >
                    <div className="flex items-center justify-between">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-mono bg-secondary text-foreground-muted">
                        {tmpl.cat}
                      </span>
                      <span className="text-[10px] font-mono text-primary font-medium">{tmpl.tag}</span>
                    </div>
                    <h4 className="font-semibold text-xs text-foreground">{tmpl.title}</h4>
                    <p className="text-[11px] text-foreground-muted">{tmpl.sections} predefined architecture sections</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Tab 5: Team Collaboration */}
          {activeTab === 'collaboration' && (
            <div className="p-6 sm:p-8 space-y-6 animate-in fade-in duration-200">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-bold text-foreground">Architecture Sign-offs & Reviews</h3>
                  <p className="text-xs text-foreground-secondary mt-0.5">
                    Peer review engineering decisions, resolve comments, and view line-by-line version diffs.
                  </p>
                </div>
                <Badge variant="success">Audit Trail Enabled</Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Active Review Box */}
                <div className="p-4 rounded-xl border border-border bg-background-secondary/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileCheck className="h-4 w-4 text-primary" /> Architecture Sign-off Request
                    </span>
                    <Badge variant="warning" className="text-[9px]">PENDING</Badge>
                  </div>
                  <p className="text-xs text-foreground-secondary">
                    &ldquo;Please verify that the distributed idempotency TTL is sufficient for acquirer retry cycles.&rdquo;
                  </p>
                  <div className="flex items-center gap-2 pt-2 border-t border-border">
                    <Button size="sm" variant="primary" className="text-xs gap-1 h-7">
                      <Check className="h-3 w-3" /> Approve Blueprint
                    </Button>
                    <Button size="sm" variant="outline" className="text-xs h-7">
                      Request Refinements
                    </Button>
                  </div>
                </div>

                {/* Threaded Comment Preview */}
                <div className="p-4 rounded-xl border border-border bg-background-secondary/60 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-4 w-4 text-emerald-500" /> Resolved Feedback
                    </span>
                    <span className="text-[10px] text-success font-medium">Resolved</span>
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <p className="text-foreground-secondary text-[11px]">
                      <span className="font-semibold text-foreground">Sarah Connor:</span> Confirmed token vault isolation satisfies PCI DSS 4.0 RoC.
                    </p>
                    <div className="pl-3 border-l-2 border-border text-[11px] text-foreground-muted">
                      <span className="font-semibold text-foreground">Alex Rivera:</span> Verified in staging environment.
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

