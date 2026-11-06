'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Check, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Badge } from '../../components/ui/badge';
import { useAuthStore } from '../../stores/useAuthStore';

export function PricingSection() {
  const { isAuthenticated } = useAuthStore();
  const [isAnnual, setIsAnnual] = useState(true);

  const plans = [
    {
      id: 'free',
      name: 'Free',
      description: 'For individual developers exploring the platform and planning personal projects.',
      monthlyPrice: 0,
      annualPrice: 0,
      isRecommended: false,
      ctaText: isAuthenticated ? 'Access Free Tier' : 'Get Started Free',
      ctaHref: isAuthenticated ? '/dashboard' : '/register',
      features: [
        'Personal workspace',
        '1 active project blueprint',
        'Core split Markdown editor',
        'Built-in architecture templates',
        'Single document Markdown export',
        'Community discussion support'
      ]
    },
    {
      id: 'pro',
      name: 'Pro',
      description: 'For software architects and developers managing multiple production projects.',
      monthlyPrice: 19,
      annualPrice: 15,
      isRecommended: true,
      ctaText: isAuthenticated ? 'Upgrade to Pro' : 'Start 14-Day Pro Trial',
      ctaHref: isAuthenticated ? '/dashboard' : '/register',
      features: [
        'Unlimited active projects',
        'Full engineering template library',
        'Granular version history & visual diffs',
        'Full project ZIP archive export',
        'Fast workspace global search (Ctrl+K)',
        'Import existing Markdown files',
        'Priority technical support'
      ]
    },
    {
      id: 'team',
      name: 'Team',
      description: 'For collaborative engineering organizations, startups, and enterprise teams.',
      monthlyPrice: 49,
      annualPrice: 39,
      isRecommended: false,
      ctaText: isAuthenticated ? 'Contact for Team' : 'Start Team Trial',
      ctaHref: isAuthenticated ? '/dashboard' : '/register',
      features: [
        'Everything in Pro, plus:',
        'Shared organization workspaces',
        'Team collaboration & seat management',
        'Role-based access control (RBAC)',
        'Architecture review & approval sign-offs',
        'Threaded comments with resolution states',
        'Full workspace activity audit logs'
      ]
    }
  ];

  return (
    <section id="pricing" className="py-24 border-t border-border bg-background scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Transparent Pricing
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Simple, Predictable Plans for Developers & Teams.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Start for free as an individual developer. Upgrade when your team is ready to scale multi-project architecture.
          </p>

          {/* Monthly / Annual Toggle Switch */}
          <div className="pt-6 flex items-center justify-center gap-3">
            <span className={`text-xs font-medium ${!isAnnual ? 'text-foreground' : 'text-foreground-muted'}`}>
              Monthly billing
            </span>
            <button
              type="button"
              onClick={() => setIsAnnual(!isAnnual)}
              className="relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent bg-background-secondary transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary shadow-xs"
              style={{ backgroundColor: isAnnual ? '#2563EB' : undefined }}
              role="switch"
              aria-checked={isAnnual}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                  isAnnual ? 'translate-x-5' : 'translate-x-0'
                }`}
              />
            </button>
            <span className={`text-xs font-medium flex items-center gap-1.5 ${isAnnual ? 'text-foreground' : 'text-foreground-muted'}`}>
              <span>Annual billing</span>
              <span className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-success/15 text-success border border-success/30">
                Save 20%
              </span>
            </span>
          </div>
        </div>

        {/* Pricing Cards */}
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-8 items-stretch max-w-6xl mx-auto">
          {plans.map((plan) => {
            const price = isAnnual ? plan.annualPrice : plan.monthlyPrice;

            return (
              <div
                key={plan.id}
                className={`rounded-2xl border p-7 flex flex-col justify-between transition-all relative ${
                  plan.isRecommended
                    ? 'border-primary shadow-xl bg-card ring-1 ring-primary/30 md:-translate-y-2'
                    : 'border-border bg-card shadow-xs hover:border-primary/40'
                }`}
              >
                {plan.isRecommended && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                    <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase bg-primary text-primary-foreground shadow-sm flex items-center gap-1">
                      <Sparkles className="h-3 w-3" /> Most Popular
                    </span>
                  </div>
                )}

                <div className="space-y-6">
                  <div>
                    <h3 className="font-bold text-lg text-foreground">{plan.name}</h3>
                    <p className="text-xs text-foreground-secondary mt-1 leading-relaxed min-h-[36px]">
                      {plan.description}
                    </p>
                  </div>

                  <div className="pt-2 border-t border-border flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-extrabold text-foreground">
                      ${price}
                    </span>
                    <span className="text-xs text-foreground-muted font-medium">
                      / month {isAnnual && price > 0 ? '(billed annually)' : ''}
                    </span>
                  </div>

                  <div className="space-y-2.5 pt-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-foreground-muted">
                      What&apos;s included:
                    </span>
                    <ul className="space-y-2 text-xs text-foreground">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2.5">
                          <Check className="h-4 w-4 text-success shrink-0 mt-0.5" />
                          <span className="text-foreground-secondary text-[11px] leading-relaxed">{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                <div className="pt-8">
                  <Link href={plan.ctaHref}>
                    <Button
                      variant={plan.isRecommended ? 'primary' : 'outline'}
                      size="md"
                      className="w-full text-xs font-semibold h-10 gap-1.5 shadow-xs"
                    >
                      <span>{plan.ctaText}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </Button>
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

