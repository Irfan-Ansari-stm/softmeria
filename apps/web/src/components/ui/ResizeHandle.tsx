'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  onReset?: () => void;
  onStepChange?: (delta: number) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
  orientation?: 'horizontal'; // for column resizing
  side?: 'left' | 'right';
  className?: string;
  ariaLabel?: string;
  min?: number;
  max?: number;
  current?: number;
}

export function ResizeHandle({
  onResize,
  onReset,
  onStepChange,
  onDragStart,
  onDragEnd,
  orientation = 'horizontal',
  side = 'right',
  className,
  ariaLabel = 'Resize panel',
  min,
  max,
  current
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);
  const isDraggingRef = useRef(false);
  const lastXRef = useRef(0);
  const pendingDeltaXRef = useRef(0);
  const rafIdRef = useRef<number | null>(null);

  // Keep callback refs fresh
  const onResizeRef = useRef(onResize);
  onResizeRef.current = onResize;
  const onDragStartRef = useRef(onDragStart);
  onDragStartRef.current = onDragStart;
  const onDragEndRef = useRef(onDragEnd);
  onDragEndRef.current = onDragEnd;
  const onResetRef = useRef(onReset);
  onResetRef.current = onReset;
  const onStepChangeRef = useRef(onStepChange);
  onStepChangeRef.current = onStepChange;

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
      }
      if (isDraggingRef.current) {
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
      }
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    // Only primary mouse button or touch
    if (e.button !== 0) return;

    e.preventDefault();
    e.stopPropagation();

    try {
      e.currentTarget.setPointerCapture(e.pointerId);
    } catch {
      // Fallback if pointer capture is unsupported
    }

    lastXRef.current = e.clientX;
    pendingDeltaXRef.current = 0;
    isDraggingRef.current = true;
    setIsDragging(true);

    document.body.style.userSelect = 'none';
    document.body.style.cursor = 'col-resize';

    onDragStartRef.current?.();
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current) return;

    const currentX = e.clientX;
    const deltaX = currentX - lastXRef.current;
    lastXRef.current = currentX;

    pendingDeltaXRef.current += deltaX;

    // Use requestAnimationFrame to avoid firing multiple layout recalculations in a single frame
    if (rafIdRef.current === null) {
      rafIdRef.current = requestAnimationFrame(() => {
        if (pendingDeltaXRef.current !== 0) {
          onResizeRef.current(pendingDeltaXRef.current);
          pendingDeltaXRef.current = 0;
        }
        rafIdRef.current = null;
      });
    }
  };

  const finishDrag = (pointerId?: number, currentTarget?: HTMLDivElement) => {
    if (!isDraggingRef.current) return;

    if (currentTarget && pointerId !== undefined) {
      try {
        if (currentTarget.hasPointerCapture(pointerId)) {
          currentTarget.releasePointerCapture(pointerId);
        }
      } catch {
        // Ignore
      }
    }

    if (rafIdRef.current !== null) {
      cancelAnimationFrame(rafIdRef.current);
      rafIdRef.current = null;
    }

    // Flush any remaining delta
    if (pendingDeltaXRef.current !== 0) {
      onResizeRef.current(pendingDeltaXRef.current);
      pendingDeltaXRef.current = 0;
    }

    isDraggingRef.current = false;
    setIsDragging(false);

    document.body.style.userSelect = '';
    document.body.style.cursor = '';

    onDragEndRef.current?.();
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.pointerId, e.currentTarget);
  };

  const handlePointerCancel = (e: React.PointerEvent<HTMLDivElement>) => {
    finishDrag(e.pointerId, e.currentTarget);
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    onResetRef.current?.();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 30 : 10;

    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (onStepChangeRef.current) onStepChangeRef.current(-step);
      else onResizeRef.current(-step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (onStepChangeRef.current) onStepChangeRef.current(step);
      else onResizeRef.current(step);
    } else if (e.key === 'Home') {
      e.preventDefault();
      if (min !== undefined && current !== undefined) {
        const delta = min - current;
        if (onStepChangeRef.current) onStepChangeRef.current(delta);
        else onResizeRef.current(delta);
      }
    } else if (e.key === 'End') {
      e.preventDefault();
      if (max !== undefined && current !== undefined) {
        const delta = max - current;
        if (onStepChangeRef.current) onStepChangeRef.current(delta);
        else onResizeRef.current(delta);
      }
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'r' || e.key === 'R') {
      e.preventDefault();
      onResetRef.current?.();
    }
  };

  return (
    <div
      role="separator"
      tabIndex={0}
      aria-label={ariaLabel}
      aria-orientation="vertical"
      aria-valuenow={current}
      aria-valuemin={min}
      aria-valuemax={max}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerCancel}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      title={`${ariaLabel} (Drag to resize, double-click to reset)`}
      className={twMerge(
        clsx(
          // Interaction area: 10px width (-mx-1 for snug placement between panels)
          'relative z-30 flex items-center justify-center cursor-col-resize select-none touch-none',
          'w-2.5 -mx-1 shrink-0 group focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:z-40',
          className
        )
      )}
    >
      {/* Invisible expanded hit target area (12px hit zone) */}
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />

      {/* Visible subtle divider line */}
      <div
        className={clsx(
          'w-[1.5px] h-full transition-colors duration-150',
          isDragging
            ? 'bg-primary'
            : 'bg-border group-hover:bg-primary/70 group-focus-visible:bg-primary'
        )}
      />

      {/* Visual grab pill / affordance in center */}
      <div
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 w-1 h-7 rounded-full transition-all duration-150 pointer-events-none flex items-center justify-center',
          isDragging
            ? 'opacity-100 bg-primary scale-110 shadow-sm'
            : 'opacity-0 group-hover:opacity-100 bg-primary/60'
        )}
      />
    </div>
  );
}
