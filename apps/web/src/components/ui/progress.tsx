import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number; // 0 to 100
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

export function Progress({
  value = 0,
  showLabel = false,
  size = 'md',
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  const sizeStyles = {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3'
  };

  const getProgressColor = (v: number) => {
    if (v >= 80) return 'bg-emerald-500';
    if (v >= 40) return 'bg-indigo-500';
    return 'bg-amber-500';
  };

  return (
    <div className="w-full space-y-1">
      {showLabel && (
        <div className="flex justify-between items-center text-xs text-zinc-400">
          <span>Completion</span>
          <span className="font-semibold text-zinc-200">{clamped}%</span>
        </div>
      )}
      <div
        className={twMerge(
          clsx(
            'w-full bg-zinc-800 rounded-full overflow-hidden',
            sizeStyles[size],
            className
          )
        )}
        {...props}
      >
        <div
          className={twMerge(
            clsx(
              'h-full transition-all duration-500 ease-out rounded-full',
              getProgressColor(clamped)
            )
          )}
          style={{ width: `${clamped}%` }}
        />
      </div>
    </div>
  );
}

