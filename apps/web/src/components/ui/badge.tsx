import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'success'
    | 'warning'
    | 'info'
    | 'danger'
    | 'outline'
    | 'status-completed'
    | 'status-review'
    | 'status-progress'
    | 'status-draft'
    | 'status-notstarted';
}

export function Badge({
  className,
  variant = 'default',
  children,
  ...props
}: BadgeProps) {
  const variantStyles = {
    default: 'bg-secondary text-secondary-foreground border-border',
    success: 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    warning: 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    info: 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    danger: 'bg-rose-500/15 text-rose-700 dark:text-rose-400 border-rose-500/30',
    outline: 'bg-transparent text-foreground-secondary border-border',
    'status-completed': 'bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border-emerald-500/30',
    'status-review': 'bg-amber-500/15 text-amber-700 dark:text-amber-400 border-amber-500/30',
    'status-progress': 'bg-blue-500/15 text-blue-700 dark:text-blue-400 border-blue-500/30',
    'status-draft': 'bg-secondary text-foreground-secondary border-border',
    'status-notstarted': 'bg-muted text-foreground-muted border-border'
  };

  return (
    <span
      className={twMerge(
        clsx(
          'inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium border transition-colors',
          variantStyles[variant],
          className
        )
      )}
      {...props}
    >
      {children}
    </span>
  );
}
