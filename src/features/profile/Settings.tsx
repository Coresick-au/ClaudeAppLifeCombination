import { useState, useCallback, useMemo } from 'react';
import { useTheme } from '@/theme/ThemeProvider';
import { useSound } from '@/hooks/useSound';
import { useData } from '@/services/DataContext';
import { saveToFile } from '@/services/local-data.service';
import type { UserTheme } from '@/types/shared.types';

type ResetStage = 'idle' | 'first' | 'second';

function SettingsSkeleton() {
  return (
    <div className="space-y-8">
      <div>
        <div className="skeleton h-5 w-32 mb-4" />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="skeleton h-32 rounded-xl" />
          <div className="skeleton h-32 rounded-xl" />
        </div>
      </div>
      <div>
        <div className="skeleton h-5 w-28 mb-4" />
        <div className="skeleton h-12 w-full rounded-lg" />
      </div>
      <div>
        <div className="skeleton h-5 w-40 mb-4" />
        <div className="space-y-3">
          <div className="skeleton h-12 w-full rounded-lg" />
          <div className="skeleton h-12 w-full rounded-lg" />
          <div className="skeleton h-12 w-full rounded-lg" />
        </div>
      </div>
    </div>
  );
}

interface ThemeCardProps {
  theme: UserTheme;
  label: string;
  description: string;
  previewBg: string;
  previewAccent: string;
  previewText: string;
  isActive: boolean;
  onSelect: (theme: UserTheme) => void;
}

function ThemeCard({
  theme,
  label,
  description,
  previewBg,
  previewAccent,
  previewText,
  isActive,
  onSelect,
}: ThemeCardProps) {
  const handleClick = useCallback(() => {
    onSelect(theme);
  }, [onSelect, theme]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`rounded-xl p-4 text-left transition-all border-2 ${
        isActive
          ? 'border-[var(--color-accent)] ring-1 ring-[var(--color-accent)]'
          : 'border-[var(--color-border)] hover:border-[var(--color-accent-hover)]'
      }`}
      style={{ backgroundColor: previewBg }}
    >
      <div className="flex items-center justify-between mb-3">
        <span className="font-display font-semibold text-sm" style={{ color: previewText }}>
          {label}
        </span>
        {isActive && (
          <span className="px-2 py-0.5 rounded-full text-xs font-body font-medium bg-[var(--color-accent)] text-white">
            Active
          </span>
        )}
      </div>
      <p className="text-xs font-body leading-relaxed mb-3" style={{ color: previewText, opacity: 0.7 }}>
        {description}
      </p>
      {/* Colour preview swatches */}
      <div className="flex gap-2">
        <div
          className="h-4 w-4 rounded-full border border-black/10"
          style={{ backgroundColor: previewAccent }}
          title="Accent colour"
        />
        <div
          className="h-4 flex-1 rounded"
          style={{ backgroundColor: previewAccent, opacity: 0.2 }}
        />
      </div>
    </button>
  );
}

export function Settings() {
  const { userTheme, setUserTheme } = useTheme();
  const { isMuted, toggleMute } = useSound();
  const { data, loadExisting, startNew } = useData();
  const [isLoading] = useState(false);
  const [resetStage, setResetStage] = useState<ResetStage>('idle');
  const [importError, setImportError] = useState<string | null>(null);

  const handleThemeSelect = useCallback(
    (theme: UserTheme) => {
      setUserTheme(theme);
    },
    [setUserTheme],
  );

  const handleExport = useCallback(() => {
    saveToFile(data);
  }, [data]);

  const handleImport = useCallback(async () => {
    setImportError(null);
    try {
      await loadExisting();
    } catch (err) {
      setImportError(
        err instanceof Error ? err.message : 'Failed to import data',
      );
    }
  }, [loadExisting]);

  const handleResetClick = useCallback(() => {
    setResetStage('first');
  }, []);

  const handleResetConfirmFirst = useCallback(() => {
    setResetStage('second');
  }, []);

  const handleResetConfirmSecond = useCallback(() => {
    startNew();
    setResetStage('idle');
  }, [startNew]);

  const handleResetCancel = useCallback(() => {
    setResetStage('idle');
  }, []);

  const themeCards = useMemo(
    () => [
      {
        theme: 'hearthstone' as UserTheme,
        label: 'Hearthstone',
        description:
          'Warm dark tones — like firelight on timber walls. Amber accents, deep shadows, the feel of a well-worn leather journal.',
        previewBg: '#1a1410',
        previewAccent: '#d4a44a',
        previewText: '#e8dcc8',
      },
      {
        theme: 'meadow' as UserTheme,
        label: 'Meadow',
        description:
          'Light botanical tones — morning sunlight through eucalyptus. Soft greens, clean whites, the crispness of a fresh page.',
        previewBg: '#f5f0e8',
        previewAccent: '#4a7c59',
        previewText: '#2d3b2d',
      },
    ],
    [],
  );

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Settings</h2>
        <SettingsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-8">Settings</h2>

      {/* Theme Picker */}
      <section className="mb-8">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Theme
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {themeCards.map((card) => (
            <ThemeCard
              key={card.theme}
              theme={card.theme}
              label={card.label}
              description={card.description}
              previewBg={card.previewBg}
              previewAccent={card.previewAccent}
              previewText={card.previewText}
              isActive={userTheme === card.theme}
              onSelect={handleThemeSelect}
            />
          ))}
        </div>
      </section>

      {/* Sound Toggle */}
      <section className="mb-8">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Sound
        </h3>
        <button
          type="button"
          onClick={toggleMute}
          className="w-full flex items-center justify-between rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
        >
          <div>
            <span className="text-sm font-body text-text-primary block">
              Sound Effects
            </span>
            <span className="text-xs font-body text-text-secondary">
              RPG bleeps, fanfares, and achievement sounds
            </span>
          </div>
          <span
            className={`px-3 py-1 rounded-full text-xs font-body font-medium ${
              isMuted
                ? 'bg-[var(--color-surface-alt)] text-text-secondary'
                : 'bg-[var(--color-accent)] text-white'
            }`}
          >
            {isMuted ? 'Off' : 'On'}
          </span>
        </button>
      </section>

      {/* Data Management */}
      <section className="mb-8">
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          Data Management
        </h3>
        <div className="space-y-3">
          <button
            type="button"
            onClick={handleExport}
            className="w-full flex items-center justify-between rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div>
              <span className="text-sm font-body text-text-primary block">Export Data</span>
              <span className="text-xs font-body text-text-secondary">
                Download your .lifeos.json file
              </span>
            </div>
            <span className="text-text-secondary text-sm">&darr;</span>
          </button>

          <button
            type="button"
            onClick={handleImport}
            className="w-full flex items-center justify-between rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors"
          >
            <div>
              <span className="text-sm font-body text-text-primary block">Import Data</span>
              <span className="text-xs font-body text-text-secondary">
                Load a previously saved .lifeos.json file
              </span>
            </div>
            <span className="text-text-secondary text-sm">&uarr;</span>
          </button>

          {importError && (
            <div className="rounded-lg p-3 bg-red-500/10 border border-red-500/30">
              <p className="text-sm text-red-400 font-body">{importError}</p>
            </div>
          )}

          {/* Reset with double confirmation */}
          <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
            {resetStage === 'idle' && (
              <button
                type="button"
                onClick={handleResetClick}
                className="w-full flex items-center justify-between"
              >
                <div>
                  <span className="text-sm font-body text-red-400 block">Reset All Data</span>
                  <span className="text-xs font-body text-text-secondary">
                    Clear all saved data and start fresh
                  </span>
                </div>
              </button>
            )}

            {resetStage === 'first' && (
              <div className="space-y-3">
                <p className="text-sm font-body text-text-primary">
                  This will permanently delete all your chronicle answers, journal entries,
                  thoughts, connections, and letters. This cannot be undone.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetConfirmFirst}
                    className="px-4 py-2 rounded-lg bg-red-600 text-white text-sm font-body hover:bg-red-700 transition-colors"
                  >
                    I understand, continue
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCancel}
                    className="px-4 py-2 rounded-lg bg-[var(--color-surface-alt)] text-text-secondary text-sm font-body hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {resetStage === 'second' && (
              <div className="space-y-3">
                <p className="text-sm font-body text-red-400 font-semibold">
                  Final confirmation: Are you absolutely sure? Export your data first if you
                  want to keep a backup.
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={handleResetConfirmSecond}
                    className="px-4 py-2 rounded-lg bg-red-700 text-white text-sm font-body hover:bg-red-800 transition-colors"
                  >
                    Yes, delete everything
                  </button>
                  <button
                    type="button"
                    onClick={handleResetCancel}
                    className="px-4 py-2 rounded-lg bg-[var(--color-surface-alt)] text-text-secondary text-sm font-body hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* App Info */}
      <section>
        <h3 className="text-lg font-display font-semibold text-text-primary mb-4">
          About
        </h3>
        <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-text-secondary">Version</span>
            <span className="text-sm font-body text-text-primary">0.1.0</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-sm font-body text-text-secondary">Storage</span>
            <span className="text-sm font-body text-text-primary">All data stored locally</span>
          </div>
        </div>
      </section>
    </div>
  );
}
