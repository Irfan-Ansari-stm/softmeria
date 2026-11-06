'use client';

import React, { useState } from 'react';
import {
  FileText,
  FolderOpen,
  Folder,
  Layers,
  Palette,
  Layout,
  Server,
  ShieldCheck,
  Database,
  Sliders,
  CheckCircle2,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { Badge } from '../../components/ui/badge';

export function CategoriesSection() {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(1); // Design open by default

  const categories = [
    {
      name: '1. Product Requirements',
      icon: Layers,
      description: 'Business objectives, user personas, regulatory compliance, and functional roadmaps.',
      files: ['PRODUCT_OVERVIEW.md', 'USER_ROLES_PERMISSIONS.md', 'REGULATORY_REQUIREMENTS.md', 'ACCEPTANCE_CRITERIA.md']
    },
    {
      name: '2. Design System',
      icon: Palette,
      description: 'Design tokens, color palettes, typography hierarchy, component states, and layout grids.',
      files: ['DESIGN_SYSTEM.md', 'COLORS.md', 'TYPOGRAPHY.md', 'SPACING_AND_LAYOUT.md', 'DESIGN_TOKENS.md', 'COMPONENT_STATES.md']
    },
    {
      name: '3. Frontend Architecture',
      icon: Layout,
      description: 'Next.js App router patterns, React component hierarchy, state management, and caching.',
      files: ['FRONTEND_ARCHITECTURE.md', 'PROJECT_STRUCTURE.md', 'STATE_MANAGEMENT.md', 'ROUTING_AND_NAVIGATION.md']
    },
    {
      name: '4. Backend Architecture',
      icon: Server,
      description: 'Microservices topologies, REST/gRPC contracts, idempotency rules, and auth pipelines.',
      files: ['BACKEND_ARCHITECTURE.md', 'API_STANDARDS.md', 'SERVICE_TOPOLOGY.md', 'AUTHENTICATION_FLOW.md']
    },
    {
      name: '5. Infrastructure & DevOps',
      icon: Sliders,
      description: 'Kubernetes active-active clusters, Kafka message brokers, CI/CD pipelines, and DNS routing.',
      files: ['INFRASTRUCTURE.md', 'KUBERNETES_TOPOLOGY.md', 'KAFKA_STREAMING_CLUSTER.md', 'CICD_PIPELINE.md']
    },
    {
      name: '6. Quality & Security',
      icon: ShieldCheck,
      description: 'PCI-DSS tokenization vaults, HSM key ceremonies, chaos engineering drills, and SLA benchmarks.',
      files: ['SECURITY_STANDARDS.md', 'PCI_DSS_TOKENIZATION_VAULT.md', 'CHAOS_ENGINEERING.md', 'TESTING_STRATEGY.md']
    },
    {
      name: '7. Data Architecture & Integrations',
      icon: Database,
      description: 'Double-entry bookkeeping schemas, Kafka CDC, Snowflake pipelines, and third-party gateways.',
      files: ['DATABASE_DESIGN.md', 'DOUBLE_ENTRY_LEDGER.md', 'CDC_EVENT_SOURCING.md', 'ACQUIRER_INTEGRATIONS.md']
    },
    {
      name: '8. Operations & Governance',
      icon: CheckCircle2,
      description: 'Automated bank reconciliations, 15-minute RTO disaster recovery, and immutable audit logs.',
      files: ['BANK_RECONCILIATION_RUNBOOK.md', 'DISASTER_RECOVERY_RUNBOOK.md', 'SECURITY_AUDIT_LOGGING.md']
    }
  ];

  return (
    <section id="categories" className="py-24 border-t border-border bg-background-secondary/30 scroll-mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto space-y-3">
          <div className="text-[11px] font-semibold uppercase tracking-wider text-primary">
            Standardized Architecture Tiers
          </div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">
            Every Layer of Your Software, Clearly Documented.
          </h2>
          <p className="text-sm text-foreground-secondary leading-relaxed">
            DevBlueprint arranges your engineering specifications into eight enterprise-proven categories so nothing is overlooked.
          </p>
        </div>

        <div className="mt-14 max-w-4xl mx-auto space-y-3">
          {categories.map((cat, idx) => {
            const Icon = cat.icon;
            const isExpanded = expandedIndex === idx;

            return (
              <div
                key={idx}
                className="rounded-2xl border border-border bg-card shadow-xs overflow-hidden transition-all"
              >
                {/* Category Header Accordion Trigger */}
                <button
                  onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                  className="w-full p-4 sm:p-5 flex items-center justify-between hover:bg-background-secondary/60 transition-colors text-left"
                >
                  <div className="flex items-center gap-3.5 min-w-0">
                    <div className="h-9 w-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm text-foreground truncate">{cat.name}</h3>
                      <p className="text-xs text-foreground-muted truncate hidden sm:block">
                        {cat.description}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 shrink-0">
                    <Badge variant="outline" className="text-[10px] font-mono">
                      {cat.files.length} Docs
                    </Badge>
                    {isExpanded ? (
                      <ChevronDown className="h-4 w-4 text-foreground-muted" />
                    ) : (
                      <ChevronRight className="h-4 w-4 text-foreground-muted" />
                    )}
                  </div>
                </button>

                {/* Expanded File List */}
                {isExpanded && (
                  <div className="p-4 sm:p-5 pt-0 border-t border-border/60 bg-background/50 space-y-3 animate-in fade-in duration-150">
                    <p className="text-xs text-foreground-secondary sm:hidden">
                      {cat.description}
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-2">
                      {cat.files.map((file, fIdx) => (
                        <div
                          key={fIdx}
                          className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-card text-xs font-mono text-foreground hover:border-primary/40 transition-colors"
                        >
                          <FileText className="h-3.5 w-3.5 text-primary shrink-0" />
                          <span className="truncate">{file}</span>
                        </div>
                      ))}
                    </div>
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

