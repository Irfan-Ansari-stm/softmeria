'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  CreditCard,
  CheckCircle2,
  Clock,
  FileText,
  ExternalLink,
  ArrowRight,
  Code2,
  ShieldCheck,
  Cpu
} from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../stores/useAuthStore';

export function SampleProjectSection() {
  const { isAuthenticated } = useAuthStore();
  const [selectedDoc, setSelectedDoc] = useState<'overview' | 'pci' | 'stateMachine'>('overview');

  const sampleDocs = {
    overview: {
      title: 'PRODUCT_OVERVIEW.md',
      status: 'COMPLETED',
      version: 'v3.0',
      category: '01. Product & Regulatory Blueprint',
      content: `# Payment Orchestration Architecture Overview

## 1. Executive Summary
The FinTech Payment Orchestrator routes global electronic card payments, SEPA instant transfers, and cross-border remittances across 12 tier-1 acquiring banks with sub-50ms dynamic routing logic.

## 2. Key Architecture Invariants
- High Throughput: 10,000 transactions per second (TPS) peak capacity.
- Dynamic Routing: Smart lowest-cost routing (LCR) with automated failover on acquirer timeouts.
- Idempotency Guarantee: Cryptographic idempotency keys on every payment mutation.
- Regulatory Strictness: Full PCI-DSS Level 1 compliance and ISO20022 pacs.008 message translation.`
    },
    pci: {
      title: 'PCI_DSS_TOKENIZATION_VAULT.md',
      status: 'APPROVED',
      version: 'v3.0',
      category: '02. Security & Tokenization Architecture',
      content: `# Zero-PAN Tokenization Vault Architecture

## 1. Zero-PAN Principle
The main application cluster and microservices NEVER receive or store raw Primary Account Numbers (PANs). All browser checkouts tokenize client-side directly against our physically isolated Token Vault.

## 2. Vault Security Boundary
- AES-256-GCM Format-Preserving Encryption (FPE BPS mode)
- Thales Luna PCIe Hardware Security Module (FIPS 140-2 Level 3)
- Cryptographically secure 128-bit UUID v4 token replacement`
    },
    stateMachine: {
      title: 'TRANSACTION_STATE_MACHINE.md',
      status: 'IN_REVIEW',
      version: 'v3.0',
      category: '03. Microservices & API Architecture',
      content: `# Two-Phase Transaction State Machine

## 1. State Lifecycle Transitions
[ INITIATED ] -> [ RISK_CHECKING ] -> [ AUTHORIZED ] -> [ CAPTURING ] -> [ SETTLED ]
                        |                   |               |
                        v                   v               v
                   [ DECLINED ]        [ VOIDED ]      [ REFUNDED ]

## 2. Invariant Rules
1. A transaction in CAPTURING state cannot transition to VOIDED; it must issue a REFUND.
2. Every state transition emits an immutable Kafka event to payments.events.`
    }
  };

  const current = sampleDocs[selectedDoc];

  return (
    <section className="py-24 border-t border-border bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Live Case Study
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            See What a Complete Engineering Blueprint Looks Like.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Explore a real-world enterprise blueprint: <span className="font-semibold text-foreground">FinTech Payment Orchestrator</span>, featuring 7 architecture categories and 17 comprehensive technical specifications.
          </p>
        </div>

        {/* Project Card & Interactive Preview */}
        <div className="mt-14 max-w-5xl mx-auto rounded-2xl border border-border bg-card shadow-xl overflow-hidden">
          {/* Project Header Bar */}
          <div className="p-6 bg-background-secondary border-b border-border flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="h-11 w-11 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-bold text-base shadow-sm">
                <CreditCard className="h-6 w-6" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-base text-foreground">FinTech Payment Orchestrator</h3>
                  <Badge variant="outline" className="text-[10px]">ACTIVE</Badge>
                </div>
                <p className="text-xs text-foreground-secondary mt-0.5">
                  Distributed payment gateway router with ISO20022 compliance and fraud scoring.
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="text-right hidden sm:block">
                <div className="text-xs font-semibold text-foreground">50% Completed</div>
                <div className="text-[10px] text-foreground-muted">7 of 17 docs approved</div>
              </div>
              <Link href={isAuthenticated ? '/dashboard' : '/login'}>
                <Button size="sm" variant="primary" className="text-xs gap-1.5 shadow-xs">
                  <span>Explore Sample Project</span>
                  <ExternalLink className="h-3.5 w-3.5" />
                </Button>
              </Link>
            </div>
          </div>

          {/* Tech Stack Bar */}
          <div className="px-6 py-2.5 bg-background border-b border-border flex flex-wrap items-center justify-between gap-2 text-xs">
            <div className="flex items-center gap-2 text-foreground-muted font-mono text-[11px]">
              <span>TECH STACK:</span>
              <div className="flex flex-wrap gap-1">
                {['Node.js', 'Go', 'Kafka', 'PostgreSQL', 'Redis', 'Docker'].map((tech) => (
                  <span key={tech} className="px-2 py-0.5 rounded bg-secondary text-foreground text-[10px]">
                    {tech}
                  </span>
                ))}
              </div>
            </div>
            <div className="text-[11px] font-mono text-foreground-muted">
              Workspace: Acme Cloud Engineering
            </div>
          </div>

          {/* Document Switcher & Interactive Preview */}
          <div className="grid grid-cols-1 md:grid-cols-12 divide-y md:divide-y-0 md:divide-x divide-border">
            {/* Left 4 cols: Document Selector */}
            <div className="md:col-span-4 p-4 bg-background-secondary/40 space-y-2">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted px-2 py-1">
                Sample Blueprint Documents
              </div>

              {[
                { id: 'overview', title: 'Product Overview & Topology', file: 'PRODUCT_OVERVIEW.md', status: 'COMPLETED' },
                { id: 'pci', title: 'Zero-PAN Token Vault', file: 'PCI_DSS_TOKENIZATION_VAULT.md', status: 'APPROVED' },
                { id: 'stateMachine', title: 'Transaction State Machine', file: 'TRANSACTION_STATE_MACHINE.md', status: 'IN_REVIEW' }
              ].map((doc) => {
                const isSelected = selectedDoc === doc.id;
                return (
                  <button
                    key={doc.id}
                    onClick={() => setSelectedDoc(doc.id as any)}
                    className={`w-full p-3 rounded-xl border text-left transition-all ${
                      isSelected
                        ? 'border-primary bg-card shadow-xs'
                        : 'border-border bg-card/60 hover:bg-card text-foreground-secondary'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-xs text-foreground truncate">{doc.title}</span>
                      <Badge
                        variant={doc.status === 'COMPLETED' || doc.status === 'APPROVED' ? 'success' : 'warning'}
                        className="text-[9px] py-0 px-1 shrink-0"
                      >
                        {doc.status}
                      </Badge>
                    </div>
                    <span className="font-mono text-[10px] text-foreground-muted block truncate">
                      {doc.file}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Right 8 cols: Rendered Document View */}
            <div className="md:col-span-8 p-6 bg-card space-y-4 font-mono text-xs">
              <div className="flex items-center justify-between border-b border-border pb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-foreground text-sm">{current.title}</span>
                    <Badge variant="outline" className="text-[9px]">{current.version}</Badge>
                  </div>
                  <span className="text-[10px] text-foreground-muted font-sans">{current.category}</span>
                </div>
                <Badge variant={current.status === 'COMPLETED' || current.status === 'APPROVED' ? 'success' : 'warning'}>
                  {current.status}
                </Badge>
              </div>

              <div className="bg-background-secondary p-4 rounded-xl border border-border leading-relaxed text-foreground-secondary whitespace-pre-wrap font-mono text-[11px] max-h-72 overflow-y-auto">
                {current.content}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

