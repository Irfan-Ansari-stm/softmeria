import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export interface TabItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  count?: number;
}

export interface TabsProps {
  tabs: TabItem[];
  activeTab: string;
  onChange: (tabId: string) => void;
  className?: string;
}

export function Tabs({ tabs, activeTab, onChange, className }: TabsProps) {
  return (
    <div
      className={twMerge(
        clsx(
          'flex items-center space-x-1 border-b border-border pb-px text-sm',
          className
        )
      )}
    >
      {tabs.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={twMerge(
              clsx(
                'flex items-center gap-2 px-3 py-2 font-medium text-xs rounded-t-lg transition-all border-b-2',
                isActive
                  ? 'border-primary text-primary bg-primary/10'
                  : 'border-transparent text-foreground-secondary hover:text-foreground hover:bg-background-secondary'
              )
            )}
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.count !== undefined && (
              <span
                className={clsx(
                  'px-1.5 py-0.5 rounded-full text-[10px] font-semibold',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-foreground-muted'
                )}
              >
                {tab.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
