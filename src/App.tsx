import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Pillar, SubTab } from '@/types/shared.types';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { PillarNav } from '@/navigation/PillarNav';
import { SubNav } from '@/navigation/SubNav';
import { PILLARS } from '@/navigation/pillarConfig';

// Record pillar
import { ChronicleEngine } from '@/features/chronicle/ChronicleEngine';
import { Journal } from '@/features/journal/Journal';
import { Thoughts } from '@/features/journal/Thoughts';
import { CustomEvents } from '@/features/journal/CustomEvents';

// Reflect pillar
import { SpiralTimeline } from '@/features/journal/SpiralTimeline';
import { Timeline } from '@/features/journal/Timeline';
import { Heatmap } from '@/features/journal/Heatmap';
import { OnThisDay } from '@/features/journal/OnThisDay';
import { Epochs } from '@/features/journal/Epochs';
import { SeasonalReflections } from '@/features/journal/SeasonalReflections';

// Wealth pillar
import { Dashboard } from '@/features/wealth/Dashboard';
import { PropertyPortfolio } from '@/features/wealth/PropertyPortfolio';
import { SalaryHistory } from '@/features/wealth/SalaryHistory';
import { SuperTracker } from '@/features/wealth/SuperTracker';
import { SpendingAnalysis } from '@/features/wealth/SpendingAnalysis';

// Me pillar
import { Profile } from '@/features/profile/Profile';
import { Connections } from '@/features/profile/Connections';
import { LettersToFuture } from '@/features/profile/LettersToFuture';
import { ExportHub } from '@/features/export/ExportHub';
import { Settings } from '@/features/profile/Settings';

const TAB_COMPONENTS: Record<string, React.ComponentType> = {
  // Record
  chronicle: ChronicleEngine,
  journal: Journal,
  thoughts: Thoughts,
  'custom-events': CustomEvents,
  // Reflect
  spiral: SpiralTimeline,
  timeline: Timeline,
  heatmap: Heatmap,
  'on-this-day': OnThisDay,
  epochs: Epochs,
  reflections: SeasonalReflections,
  // Wealth
  dashboard: Dashboard,
  properties: PropertyPortfolio,
  salary: SalaryHistory,
  super: SuperTracker,
  spending: SpendingAnalysis,
  // Me
  profile: Profile,
  connections: Connections,
  letters: LettersToFuture,
  export: ExportHub,
  settings: Settings,
};

const DEFAULT_TABS: Record<Pillar, SubTab> = {
  record: 'chronicle',
  reflect: 'spiral',
  wealth: 'dashboard',
  me: 'profile',
};

function AppContent() {
  const { setWealthOverride } = useTheme();
  const [activePillar, setActivePillar] = useState<Pillar>('record');
  const [activeTabs, setActiveTabs] = useState<Record<Pillar, SubTab>>(
    () => ({ ...DEFAULT_TABS }),
  );

  const currentTab = activeTabs[activePillar];
  const pillarConfig = useMemo(
    () => PILLARS.find((p) => p.id === activePillar),
    [activePillar],
  );

  // Auto-switch to Dark Gold theme when on Wealth pillar
  useEffect(() => {
    setWealthOverride(activePillar === 'wealth');
  }, [activePillar, setWealthOverride]);

  const handlePillarChange = useCallback((pillar: Pillar) => {
    setActivePillar(pillar);
  }, []);

  const handleTabChange = useCallback(
    (tab: SubTab) => {
      setActiveTabs((prev) => ({ ...prev, [activePillar]: tab }));
    },
    [activePillar],
  );

  const ActiveComponent = TAB_COMPONENTS[currentTab];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Header */}
      <header className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] px-4 py-3">
        <h1 className="text-lg font-display font-bold text-accent">Life OS</h1>
      </header>

      {/* Sub-navigation */}
      {pillarConfig && (
        <SubNav
          tabs={pillarConfig.tabs}
          activeTab={currentTab}
          onTabChange={handleTabChange}
        />
      )}

      {/* Main content */}
      <main>
        {ActiveComponent ? <ActiveComponent /> : null}
      </main>

      {/* Bottom pillar navigation */}
      <PillarNav
        activePillar={activePillar}
        onPillarChange={handlePillarChange}
      />
    </div>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <AppContent />
    </ThemeProvider>
  );
}
