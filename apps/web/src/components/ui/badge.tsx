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
    default: 'bg-zinc-800 text-zinc-300 border-zinc-700/60',
    success: 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50',
    warning: 'bg-amber-950/60 text-amber-400 border-amber-800/50',
    info: 'bg-blue-950/60 text-blue-400 border-blue-800/50',
    danger: 'bg-rose-950/60 text-rose-400 border-rose-800/50',
    outline: 'bg-transparent text-zinc-400 border-zinc-700',
    'status-completed': 'bg-emerald-950/80 text-emerald-400 border-emerald-700/60',
    'status-review': 'bg-amber-950/80 text-amber-300 border-amber-700/60',
    'status-progress': 'bg-indigo-950/80 text-indigo-300 border-indigo-700/60',
    'status-draft': 'bg-zinc-800 text-zinc-300 border-zinc-700',
    'status-notstarted': 'bg-zinc-900 text-zinc-500 border-zinc-800'
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

