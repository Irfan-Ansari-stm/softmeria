'use client';

import React from 'react';
import Link from 'next/link';
import { Layers, Github, Twitter, Linkedin } from 'lucide-react';

export function Footer() {
  const footerColumns = [
    {
      title: 'Product',
      links: [
        { label: 'Features', href: '#features' },
        { label: 'Showcase', href: '#showcase' },
        { label: 'Categories', href: '#categories' },
        { label: 'Templates', href: '#showcase' },
        { label: 'Pricing', href: '#pricing' }
      ]
    },
    {
      title: 'Resources',
      links: [
        { label: 'Getting Started', href: '/register' },
        { label: 'Architecture Guide', href: '#how-it-works' },
        { label: 'FAQ', href: '#faq' },
        { label: 'Sample Blueprint', href: '#showcase' }
      ]
    },
    {
      title: 'Account',
      links: [
        { label: 'Sign In', href: '/login' },
        { label: 'Register', href: '/register' },
        { label: 'Password Reset', href: '/forgot-password' },
        { label: 'Dashboard', href: '/dashboard' }
      ]
    },
    {
      title: 'Company & Legal',
      links: [
        { label: 'Privacy Policy', href: '#' },
        { label: 'Terms of Service', href: '#' },
        { label: 'Security & Compliance', href: '#features' },
        { label: 'Open Source Standards', href: '#' }
      ]
    }
  ];

  return (
    <footer className="border-t border-border bg-background pt-16 pb-12 text-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          {/* Brand Info (2 cols on md) */}
          <div className="col-span-2 space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center text-primary-foreground shadow-xs">
                <Layers className="h-4 w-4" />
              </div>
              <span className="font-bold text-base tracking-tight text-foreground">
                DevBlueprint
              </span>
            </Link>

            <p className="text-xs text-foreground-secondary leading-relaxed max-w-sm">
              The centralized documentation and technical blueprint management platform for modern software engineering teams. Plan, define, organize, and export technical foundations before writing code.
            </p>

            <div className="pt-2 text-[11px] text-foreground-muted">
              Built with Next.js, Express, PostgreSQL, and TypeScript.
            </div>
          </div>

          {/* 3 Navigation Columns */}
          {footerColumns.slice(0, 3).map((col, idx) => (
            <div key={idx} className="space-y-3">
              <h4 className="font-semibold text-xs text-foreground uppercase tracking-wider">
                {col.title}
              </h4>
              <ul className="space-y-2">
                {col.links.map((link, lIdx) => (
                  <li key={lIdx}>
                    <a
                      href={link.href}
                      className="text-foreground-secondary hover:text-foreground transition-colors"
                    >
                      {link.label}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Row */}
        <div className="mt-12 pt-8 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-4 text-foreground-muted text-[11px]">
          <div>
            &copy; {new Date().getFullYear()} DevBlueprint Platform Inc. All rights reserved.
          </div>
          <div className="flex items-center gap-4">
            <span>Enterprise Grade</span>
            <span>•</span>
            <span>Zero Vendor Lock-in</span>
            <span>•</span>
            <span>GFM Markdown</span>
          </div>
        </div>
      </div>
    </footer>
  );
}

