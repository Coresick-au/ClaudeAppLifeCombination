import { useState, useCallback, useEffect, useMemo } from 'react';
import type { Pillar, SubTab } from '@/types/shared.types';
import { ThemeProvider, useTheme } from '@/theme/ThemeProvider';
import { DataProvider, useData } from '@/services/DataContext';
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

// --- Welcome Screen ---

function WelcomeScreen() {
  const { startNew, loadExisting } = useData();
  const [loadError, setLoadError] = useState<string | null>(null);

  const handleLoad = useCallback(async () => {
    try {
      setLoadError(null);
      await loadExisting();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load file');
    }
  }, [loadExisting]);

  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-6">
      <div className="max-w-md w-full text-center">
        <h1 className="font-display text-4xl font-bold text-accent mb-2">Life OS</h1>
        <p className="text-text-secondary font-body mb-10">
          Your personal life operating system — chronicle, journal, and wealth tracker
          all saved to a single local file.
        </p>

        <div className="space-y-4">
          <button
            onClick={startNew}
            className="w-full px-6 py-4 rounded-xl bg-[var(--color-accent)] text-[#1a1510] font-semibold text-lg hover:opacity-90 transition-opacity"
          >
            Start New
          </button>

          <button
            onClick={handleLoad}
            className="w-full px-6 py-4 rounded-xl border-2 border-[var(--color-border)] text-text-primary font-semibold text-lg hover:border-[var(--color-accent)] transition-colors"
          >
            Load Existing (.lifeos.json)
          </button>
        </div>

        {loadError && (
          <p className="mt-4 text-sm text-red-400 font-body">{loadError}</p>
        )}

        <p className="mt-8 text-xs text-text-secondary font-body">
          All data stays on your device. No accounts, no servers, no cloud.
        </p>
      </div>
    </div>
  );
}

// --- Unsaved Changes Confirmation Modal ---

function ConfirmNewModal({
  onConfirm,
  onCancel,
}: {
  onConfirm: () => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4">
      <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6 max-w-sm w-full">
        <h3 className="font-display font-bold text-lg text-text-primary mb-2">
          Unsaved Changes
        </h3>
        <p className="text-text-secondary font-body text-sm mb-6">
          You have unsaved changes. Starting a new file will discard them.
          Save your current data first, or continue to start fresh.
        </p>
        <div className="flex items-center gap-3">
          <button
            onClick={onConfirm}
            className="flex-1 px-4 py-2 rounded-lg bg-red-500/20 text-red-400 font-body text-sm font-medium hover:bg-red-500/30 transition-colors"
          >
            Discard & Start New
          </button>
          <button
            onClick={onCancel}
            className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border)] text-text-secondary font-body text-sm hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main App Content ---

function AppContent() {
  const { setWealthOverride } = useTheme();
  const { isLoaded, hasUnsavedChanges, save, loadExisting, startNew } = useData();
  const [activePillar, setActivePillar] = useState<Pillar>('record');
  const [activeTabs, setActiveTabs] = useState<Record<Pillar, SubTab>>(
    () => ({ ...DEFAULT_TABS }),
  );
  const [showConfirmNew, setShowConfirmNew] = useState(false);
  const [loadError, setLoadError] = useState<string | null>(null);

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

  const handleNew = useCallback(() => {
    if (hasUnsavedChanges) {
      setShowConfirmNew(true);
    } else {
      startNew();
    }
  }, [hasUnsavedChanges, startNew]);

  const handleConfirmNew = useCallback(() => {
    setShowConfirmNew(false);
    startNew();
  }, [startNew]);

  const handleLoad = useCallback(async () => {
    try {
      setLoadError(null);
      await loadExisting();
    } catch (err) {
      setLoadError(err instanceof Error ? err.message : 'Failed to load file');
    }
  }, [loadExisting]);

  // Show welcome screen until data is loaded
  if (!isLoaded) {
    return <WelcomeScreen />;
  }

  const ActiveComponent = TAB_COMPONENTS[currentTab];

  return (
    <div className="min-h-screen bg-surface pb-20">
      {/* Confirm new modal */}
      {showConfirmNew && (
        <ConfirmNewModal
          onConfirm={handleConfirmNew}
          onCancel={() => setShowConfirmNew(false)}
        />
      )}

      {/* Header with save/load controls */}
      <header className="bg-[var(--color-surface-alt)] border-b border-[var(--color-border)] px-4 py-3 flex items-center justify-between">
        <h1 className="text-lg font-display font-bold text-accent">Life OS</h1>

        <div className="flex items-center gap-2">
          {/* New */}
          <button
            onClick={handleNew}
            className="text-sm text-text-secondary hover:text-text-primary transition-colors px-2 py-1 rounded"
            title="New file"
          >
            New
          </button>

          {/* Load */}
          <button
            onClick={handleLoad}
            className="text-lg px-2 py-1 rounded hover:bg-[var(--color-surface)]/50 transition-colors"
            title="Load file"
          >
            📂
          </button>

          {/* Save */}
          <button
            onClick={save}
            className="relative text-lg px-2 py-1 rounded hover:bg-[var(--color-surface)]/50 transition-colors"
            title={hasUnsavedChanges ? 'Save file (unsaved changes)' : 'Save file'}
          >
            💾
            {hasUnsavedChanges && (
              <span className="absolute -top-0.5 -right-0.5 w-2.5 h-2.5 bg-[var(--color-accent)] rounded-full" />
            )}
          </button>
        </div>
      </header>

      {/* Load error banner */}
      {loadError && (
        <div className="bg-red-500/10 border-b border-red-500/30 px-4 py-2 text-sm text-red-400 font-body">
          {loadError}
        </div>
      )}

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
    <DataProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </DataProvider>
  );
}
