'use client';

import React from 'react';
import {
  Code,
  Network,
  Rocket,
  Building2,
  Check
} from 'lucide-react';

export function UseCasesSection() {
  const useCases = [
    {
      icon: Code,
      badge: 'Solopreneurs & Makers',
      title: 'Independent Developers',
      description:
        'Organize personal software projects, eliminate scope creep, and establish clear architectural standards before writing code.',
      highlights: ['Personal workspaces', 'Fast template bootstrapping', 'Zero lock-in Markdown export']
    },
    {
      icon: Network,
      badge: 'System Designers',
      title: 'Software Architects',
      description:
        'Define distributed microservices, database schemas, API idempotency contracts, and cryptographic standards in one structured tool.',
      highlights: ['Contract validation', 'Formal review workflows', 'Granular version change history']
    },
    {
      icon: Rocket,
      badge: 'Early-Stage Ventures',
      title: 'Startup Teams',
      description:
        'Onboard new developers in hours instead of weeks with a centralized technical blueprint that eliminates tribal knowledge.',
      highlights: ['Faster developer onboarding', 'Clean engineering culture', 'Unified product source of truth']
    },
    {
      icon: Building2,
      badge: 'Scale-ups & Enterprise',
      title: 'Enterprise Engineering Teams',
      description:
        'Manage documentation governance, compliance audits (PCI-DSS/ISO20022), and multi-team approvals across dozens of projects.',
      highlights: ['Multi-project workspaces', 'Role-based access control', 'Audit logging & compliance readiness']
    }
  ];

  return (
    <section className="py-24 border-t border-border bg-background-secondary/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Tailored Engineering Value
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Built for the People Who Build Software.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Whether you are shipping an indie SaaS over the weekend or architecting mission-critical fintech platforms with 50 engineers.
          </p>
        </div>

        <div className="mt-14 grid grid-cols-1 md:grid-cols-2 gap-6">
          {useCases.map((uc, idx) => {
            const Icon = uc.icon;
            return (
              <div
                key={idx}
                className="p-6 sm:p-7 rounded-2xl border border-border bg-card shadow-xs hover:border-primary/40 hover:shadow-md transition-all flex flex-col justify-between space-y-5"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="h-10 w-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="h-5 w-5" />
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-secondary text-foreground-muted border border-border">
                      {uc.badge}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-bold text-base text-foreground tracking-tight">
                      {uc.title}
                    </h3>
                    <p className="text-xs text-foreground-secondary leading-relaxed mt-1">
                      {uc.description}
                    </p>
                  </div>
                </div>

                <div className="pt-4 border-t border-border space-y-2 text-xs text-foreground">
                  {uc.highlights.map((item, hIdx) => (
                    <div key={hIdx} className="flex items-center gap-2">
                      <Check className="h-3.5 w-3.5 text-success shrink-0" />
                      <span className="text-[11px] text-foreground-secondary">{item}</span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

