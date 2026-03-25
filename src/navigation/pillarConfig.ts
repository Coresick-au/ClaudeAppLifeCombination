import type { PillarConfig } from '@/types/shared.types';

export const PILLARS: readonly PillarConfig[] = [
  {
    id: 'record',
    label: 'Record',
    icon: '📜',
    tabs: [
      { id: 'chronicle', label: 'Chronicle' },
      { id: 'rpg', label: 'RPG' },
      { id: 'journal', label: 'Journal' },
      { id: 'thoughts', label: 'Thoughts' },
      { id: 'custom-events', label: 'Events' },
    ],
  },
  {
    id: 'reflect',
    label: 'Reflect',
    icon: '🔮',
    tabs: [
      { id: 'spiral', label: 'Spiral' },
      { id: 'timeline', label: 'Timeline' },
      { id: 'heatmap', label: 'Heatmap' },
      { id: 'on-this-day', label: 'On This Day' },
      { id: 'epochs', label: 'Epochs' },
      { id: 'reflections', label: 'Reflections' },
    ],
  },
  {
    id: 'wealth',
    label: 'Wealth',
    icon: '💰',
    tabs: [
      { id: 'dashboard', label: 'Dashboard' },
      { id: 'properties', label: 'Properties' },
      { id: 'salary', label: 'Salary' },
      { id: 'super', label: 'Super' },
      { id: 'spending', label: 'Spending' },
    ],
  },
  {
    id: 'me',
    label: 'Me',
    icon: '👤',
    tabs: [
      { id: 'profile', label: 'Profile' },
      { id: 'connections', label: 'Connections' },
      { id: 'letters', label: 'Letters' },
      { id: 'export', label: 'Export' },
      { id: 'settings', label: 'Settings' },
    ],
  },
] as const;
