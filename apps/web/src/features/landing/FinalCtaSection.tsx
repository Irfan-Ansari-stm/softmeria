'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { useAuthStore } from '../../stores/useAuthStore';

export function FinalCtaSection() {
  const { isAuthenticated } = useAuthStore();

  return (
    <section className="py-24 border-t border-border bg-gradient-to-b from-background to-background-secondary/80 relative overflow-hidden">
      {/* Decorative radial glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary/10 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/20 bg-primary/5 text-[11px] font-semibold text-primary">
          <Sparkles className="h-3.5 w-3.5" />
          <span>Start Your Next Software Project Right</span>
        </div>

        <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-foreground max-w-3xl mx-auto leading-tight">
          Before You Build the Product,{' '}
          <span className="bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
            Build the Blueprint.
          </span>
        </h2>

        <p className="text-sm sm:text-base text-foreground-secondary max-w-2xl mx-auto leading-relaxed">
          Bring your architecture, engineering standards, and documentation together. Start every software project with clarity and confidence.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <Link href={isAuthenticated ? '/dashboard' : '/register'}>
            <Button size="lg" variant="primary" className="w-full sm:w-auto text-xs sm:text-sm font-semibold h-11 px-7 shadow-lg shadow-primary/25 gap-2">
              <span>{isAuthenticated ? 'Open Your Dashboard' : 'Create Your Free Workspace'}</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>

          <a
            href="#features"
            onClick={(e) => {
              e.preventDefault();
              document.querySelector('#features')?.scrollIntoView({ behavior: 'smooth' });
            }}
          >
            <Button size="lg" variant="outline" className="w-full sm:w-auto text-xs sm:text-sm font-medium h-11 px-6 border-border hover:bg-background-secondary">
              Explore Features
            </Button>
          </a>
        </div>
      </div>
    </section>
  );
}

