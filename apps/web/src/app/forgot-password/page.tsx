'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Layers, ArrowLeft, Mail, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setIsSubmitted(true);
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center py-12 px-4 sm:px-6 lg:px-8 transition-colors">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center space-y-2">
        <Link href="/" className="inline-flex items-center justify-center">
          <div className="h-12 w-12 rounded-xl bg-primary flex items-center justify-center text-primary-foreground shadow-lg shadow-primary/30">
            <Layers className="h-6 w-6" />
          </div>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-foreground">
          Reset your password
        </h2>
        <p className="text-xs text-foreground-muted">
          Enter your registered email address and we&apos;ll send you a password recovery link.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-card py-8 px-6 shadow-xl border border-border sm:rounded-2xl space-y-6">
          {isSubmitted ? (
            <div className="space-y-4 text-center py-4">
              <div className="mx-auto h-12 w-12 rounded-full bg-success/10 flex items-center justify-center text-success">
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Check your email</h3>
              <p className="text-xs text-foreground-secondary leading-relaxed">
                If an account exists for <span className="font-semibold text-foreground">{email}</span>, you will receive password reset instructions shortly.
              </p>
              <div className="pt-2">
                <Link href="/login">
                  <Button variant="outline" size="sm" className="w-full text-xs gap-1.5">
                    <ArrowLeft className="h-3.5 w-3.5" />
                    <span>Return to Sign In</span>
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">Email address</label>
                <div className="relative">
                  <Input
                    type="email"
                    required
                    placeholder="architect@devblueprint.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                  />
                  <Mail className="h-4 w-4 text-foreground-muted absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                </div>
              </div>

              <Button
                type="submit"
                variant="primary"
                className="w-full text-xs shadow-xs"
                isLoading={isLoading}
              >
                Send Password Reset Link
              </Button>

              <div className="text-center pt-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 text-xs text-foreground-muted hover:text-foreground transition-colors font-medium"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  <span>Back to login</span>
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}

