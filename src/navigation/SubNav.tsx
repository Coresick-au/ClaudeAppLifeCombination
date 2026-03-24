import { memo, useCallback } from 'react';
import type { SubTab, TabConfig } from '@/types/shared.types';

interface SubNavProps {
  tabs: readonly TabConfig[];
  activeTab: SubTab;
  onTabChange: (tab: SubTab) => void;
}

export const SubNav = memo(function SubNav({
  tabs,
  activeTab,
  onTabChange,
}: SubNavProps) {
  return (
    <div className="sticky top-0 z-40 bg-[var(--color-surface)] border-b border-[var(--color-border)]">
      <div className="flex overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => (
          <TabButton
            key={tab.id}
            tab={tab}
            isActive={activeTab === tab.id}
            onClick={onTabChange}
          />
        ))}
      </div>
    </div>
  );
});

interface TabButtonProps {
  tab: TabConfig;
  isActive: boolean;
  onClick: (tab: SubTab) => void;
}

const TabButton = memo(function TabButton({
  tab,
  isActive,
  onClick,
}: TabButtonProps) {
  const handleClick = useCallback(() => onClick(tab.id), [onClick, tab.id]);

  return (
    <button
      onClick={handleClick}
      className={`px-4 py-3 text-sm font-medium whitespace-nowrap transition-colors border-b-2 ${
        isActive
          ? 'border-accent text-accent'
          : 'border-transparent text-text-secondary hover:text-text-primary'
      }`}
    >
      {tab.label}
    </button>
  );
});
