'use client';

import React, { useState, useCallback, useEffect } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface ResizeHandleProps {
  onResize: (deltaX: number) => void;
  onReset?: () => void;
  onStepChange?: (delta: number) => void;
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
  orientation = 'horizontal',
  side = 'right',
  className,
  ariaLabel = 'Resize panel',
  min,
  max,
  current
}: ResizeHandleProps) {
  const [isDragging, setIsDragging] = useState(false);

  const startDrag = useCallback(
    (clientX: number) => {
      setIsDragging(true);
      document.body.style.userSelect = 'none';
      document.body.style.cursor = 'col-resize';

      let lastX = clientX;

      const handleMove = (currentX: number) => {
        const deltaX = currentX - lastX;
        lastX = currentX;
        onResize(deltaX);
      };

      const handleMouseMove = (e: MouseEvent) => {
        handleMove(e.clientX);
      };

      const handleTouchMove = (e: TouchEvent) => {
        if (e.touches.length > 0) {
          handleMove(e.touches[0].clientX);
        }
      };

      const stopDrag = () => {
        setIsDragging(false);
        document.body.style.userSelect = '';
        document.body.style.cursor = '';
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', stopDrag);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', stopDrag);
        window.removeEventListener('touchcancel', stopDrag);
      };

      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', stopDrag);
      window.addEventListener('touchmove', handleTouchMove, { passive: true });
      window.addEventListener('touchend', stopDrag);
      window.addEventListener('touchcancel', stopDrag);
    },
    [onResize]
  );

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    startDrag(e.clientX);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length > 0) {
      startDrag(e.touches[0].clientX);
    }
  };

  const handleDoubleClick = () => {
    if (onReset) onReset();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    const step = e.shiftKey ? 30 : 10;
    if (e.key === 'ArrowLeft') {
      e.preventDefault();
      if (onStepChange) onStepChange(-step);
      else onResize(-step);
    } else if (e.key === 'ArrowRight') {
      e.preventDefault();
      if (onStepChange) onStepChange(step);
      else onResize(step);
    } else if (e.key === 'Enter' || e.key === ' ' || e.key === 'r') {
      e.preventDefault();
      if (onReset) onReset();
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
      onMouseDown={handleMouseDown}
      onTouchStart={handleTouchStart}
      onDoubleClick={handleDoubleClick}
      onKeyDown={handleKeyDown}
      title={`${ariaLabel} (Drag to resize, double-click to reset)`}
      className={twMerge(
        clsx(
          'relative z-20 flex items-center justify-center cursor-col-resize select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary',
          'w-2 -mx-1 hover:w-2 transition-colors group',
          isDragging && 'w-2 bg-primary/20',
          className
        )
      )}
    >
      {/* Invisible expanded hit target area */}
      <div className="absolute inset-y-0 -left-1 -right-1 z-10" />

      {/* Visual Indicator Line & Pill */}
      <div
        className={clsx(
          'w-0.5 h-full transition-colors duration-150',
          isDragging
            ? 'bg-primary'
            : 'bg-transparent group-hover:bg-primary/60 group-focus-visible:bg-primary'
        )}
      />

      {/* Center grab pill dots */}
      <div
        className={clsx(
          'absolute top-1/2 -translate-y-1/2 w-1 h-6 rounded-full transition-opacity duration-150 flex items-center justify-center',
          isDragging
            ? 'opacity-100 bg-primary'
            : 'opacity-0 group-hover:opacity-100 bg-primary/50'
        )}
      />
    </div>
  );
}

