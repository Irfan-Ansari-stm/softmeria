'use client';

import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

export function FaqSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0); // First open by default

  const faqs = [
    {
      q: 'What is DevBlueprint?',
      a: 'DevBlueprint is a centralized developer documentation and engineering blueprint platform that enables developers, architects, and engineering teams to plan, define, organize, maintain, and export technical software documentation before beginning application code development.'
    },
    {
      q: 'Who should use DevBlueprint?',
      a: 'DevBlueprint is built for solo developers, startup founders, software architects, and enterprise engineering teams who want to eliminate architectural confusion, align teams across frontend and backend boundaries, and maintain a single source of truth.'
    },
    {
      q: 'Can I create multiple software projects?',
      a: 'Yes. DevBlueprint provides multi-project workspaces where you can organize independent microservices, mobile apps, and distributed web platforms, each with its own technology stack, categories, and documentation trees.'
    },
    {
      q: 'Can I import existing Markdown files?',
      a: 'Yes. DevBlueprint includes a built-in import feature that allows you to upload existing Markdown (.md) documents and assign them to any category folder within your project.'
    },
    {
      q: 'Can I export my entire documentation structure?',
      a: 'Yes. You can export individual documents as pure Markdown or download your complete project blueprint as a organized ZIP archive containing your full folder hierarchy, ready to be committed directly into Git.'
    },
    {
      q: 'Does DevBlueprint support team collaboration?',
      a: 'Yes. You can invite team members with distinct RBAC roles (Owner, Admin, Editor, Viewer), request formal architecture reviews, sign off on blueprints, leave threaded comments, and view line-by-line version diffs.'
    },
    {
      q: 'Can I customize documentation templates?',
      a: 'Yes. While DevBlueprint provides battle-tested built-in engineering templates for APIs, schemas, security, and infrastructure, you can freely edit, extend, or add custom templates within your workspace.'
    },
    {
      q: 'Is my documentation stored securely?',
      a: 'Yes. All data is securely persisted in PostgreSQL with UUID primary keys, Bcrypt password hashing, JWT authentication, and scoped workspace tenant isolation. Only authorized members of your workspace can access your blueprints.'
    },
    {
      q: 'Can I use DevBlueprint with GitHub?',
      a: 'You can link your GitHub repository URL to any project blueprint, and export clean, standard GitHub Flavored Markdown (GFM) with full table and syntax highlighting support for direct repository synchronization.'
    },
    {
      q: 'Does DevBlueprint generate actual software code?',
      a: 'DevBlueprint focuses strictly on the technical architecture, specifications, contracts, and engineering blueprint phase. It establishes the complete foundation so that when developers write application code, there is zero ambiguity.'
    }
  ];

  return (
    <section id="faq" className="py-24 border-t border-border bg-background-secondary/30 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Clear Answers
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Frequently Asked Questions
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            Everything you need to know about DevBlueprint, architectural blueprints, and engineering workflows.
          </p>
        </div>

        <div className="mt-14 max-w-3xl mx-auto space-y-3">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-xl border border-border bg-card shadow-xs overflow-hidden transition-all"
              >
                <button
                  type="button"
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between text-left hover:bg-background-secondary/50 transition-colors gap-4"
                  aria-expanded={isOpen}
                >
                  <span className="font-semibold text-xs sm:text-sm text-foreground">
                    {faq.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="h-4 w-4 text-primary shrink-0" />
                  ) : (
                    <ChevronDown className="h-4 w-4 text-foreground-muted shrink-0" />
                  )}
                </button>

                {isOpen && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-border/60 bg-background/40 animate-in fade-in duration-150">
                    <p className="text-xs text-foreground-secondary leading-relaxed pt-3">
                      {faq.a}
                    </p>
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

