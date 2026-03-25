export type ThemeName = 'hearthstone' | 'meadow' | 'darkgold';
export type UserTheme = 'hearthstone' | 'meadow';

export type Pillar = 'record' | 'reflect' | 'wealth' | 'me';

export type RecordTab = 'chronicle' | 'rpg' | 'journal' | 'thoughts' | 'custom-events';
export type ReflectTab = 'spiral' | 'timeline' | 'heatmap' | 'on-this-day' | 'epochs' | 'reflections';
export type WealthTab = 'dashboard' | 'properties' | 'salary' | 'super' | 'spending';
export type MeTab = 'profile' | 'connections' | 'letters' | 'export' | 'settings';

export type SubTab = RecordTab | ReflectTab | WealthTab | MeTab;

export interface PillarConfig {
  id: Pillar;
  label: string;
  icon: string;
  tabs: readonly TabConfig[];
}

export interface TabConfig {
  id: SubTab;
  label: string;
}

export type EventCategory =
  | 'career'
  | 'family'
  | 'home'
  | 'education'
  | 'travel'
  | 'health'
  | 'milestone'
  | 'relationships'
  | 'thoughts';

export const EVENT_CATEGORY_COLOURS: Record<EventCategory, string> = {
  career: '#3b82f6',
  family: '#f59e0b',
  home: '#10b981',
  education: '#a855f7',
  travel: '#eab308',
  health: '#06b6d4',
  milestone: '#f43f5e',
  relationships: '#ec4899',
  thoughts: '#8b5cf6',
};

export interface UserProfile {
  displayName: string;
  email: string;
  photoURL?: string;
  theme: UserTheme;
  soundEnabled: boolean;
  createdAt: string;
}
