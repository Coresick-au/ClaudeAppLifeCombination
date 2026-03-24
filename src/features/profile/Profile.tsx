import { useState, useCallback, useMemo, useRef } from 'react';
import { useData } from '@/services/DataContext';
import type { UserProfile } from '@/types/shared.types';

function formatDateAU(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function daysSince(isoDate: string): number {
  const start = new Date(isoDate);
  const now = new Date();
  const diff = now.getTime() - start.getTime();
  return Math.max(0, Math.floor(diff / (1000 * 60 * 60 * 24)));
}

function ProfileSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-6">
        <div className="skeleton h-24 w-24 rounded-full" />
        <div className="space-y-3 flex-1">
          <div className="skeleton h-6 w-48" />
          <div className="skeleton h-4 w-64" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={`stat-skel-${n}`}
            className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)]"
          >
            <div className="skeleton h-8 w-16 mb-2" />
            <div className="skeleton h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="space-y-4">
        <div className="skeleton h-10 w-full rounded-lg" />
        <div className="skeleton h-10 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function Profile() {
  const { data, isLoaded, getProfile, setProfile } = useData();
  const profile = getProfile();
  const [editingField, setEditingField] = useState<'displayName' | 'email' | null>(null);
  const [editValue, setEditValue] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const stats = useMemo(() => {
    const chronicleAnswers = Object.keys(data.chronicle.answers).length;
    const journalEntries = data.journal.entries.length;
    const thoughts = data.journal.thoughts.length;
    const daysSinceStarted = profile?.createdAt ? daysSince(profile.createdAt) : 0;
    return { chronicleAnswers, journalEntries, thoughts, daysSinceStarted };
  }, [data.chronicle.answers, data.journal.entries, data.journal.thoughts, profile?.createdAt]);

  const handleStartEdit = useCallback((field: 'displayName' | 'email') => {
    if (!profile) return;
    setEditingField(field);
    setEditValue(profile[field]);
  }, [profile]);

  const handleSaveEdit = useCallback(() => {
    if (!profile || !editingField) return;
    const updated: UserProfile = { ...profile, [editingField]: editValue };
    setProfile(updated);
    setEditingField(null);
    setEditValue('');
  }, [profile, editingField, editValue, setProfile]);

  const handleCancelEdit = useCallback(() => {
    setEditingField(null);
    setEditValue('');
  }, []);

  const handlePhotoUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) return;
    // Limit to 2MB
    if (file.size > 2 * 1024 * 1024) return;

    const reader = new FileReader();
    reader.onload = () => {
      const dataUrl = reader.result as string;
      setProfile({ ...profile, photoURL: dataUrl });
    };
    reader.readAsDataURL(file);
  }, [profile, setProfile]);

  const handlePhotoClick = useCallback(() => {
    fileInputRef.current?.click();
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Profile</h2>
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Profile</h2>

      {/* Avatar and basic info */}
      <div className="flex items-start gap-6 mb-8">
        <button
          type="button"
          onClick={handlePhotoClick}
          className="relative h-24 w-24 rounded-full overflow-hidden border-2 border-[var(--color-border)] hover:border-[var(--color-accent)] transition-colors cursor-pointer flex-shrink-0 bg-[var(--color-surface-alt)]"
          aria-label="Upload profile photo"
        >
          {profile.photoURL ? (
            <img src={profile.photoURL} alt="Profile" className="h-full w-full object-cover" />
          ) : (
            <span className="flex h-full w-full items-center justify-center text-3xl text-text-secondary">
              {profile.displayName ? profile.displayName.charAt(0).toUpperCase() : '?'}
            </span>
          )}
          <span className="absolute inset-0 flex items-center justify-center bg-black/40 text-white text-xs opacity-0 hover:opacity-100 transition-opacity">
            Change
          </span>
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handlePhotoUpload}
        />

        <div className="flex-1 space-y-3">
          {/* Display Name */}
          <div>
            <label className="text-xs text-text-secondary font-body uppercase tracking-wider">
              Display Name
            </label>
            {editingField === 'displayName' ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="text"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)] text-text-secondary text-sm hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit('displayName')}
                className="block text-lg font-display text-text-primary hover:text-accent transition-colors cursor-pointer mt-1"
              >
                {profile.displayName || 'Set your display name'}
              </button>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="text-xs text-text-secondary font-body uppercase tracking-wider">
              Email
            </label>
            {editingField === 'email' ? (
              <div className="flex items-center gap-2 mt-1">
                <input
                  type="email"
                  value={editValue}
                  onChange={(e) => setEditValue(e.target.value)}
                  className="flex-1 px-3 py-1.5 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)]"
                  autoFocus
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveEdit();
                    if (e.key === 'Escape') handleCancelEdit();
                  }}
                />
                <button
                  type="button"
                  onClick={handleSaveEdit}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-accent)] text-white text-sm hover:bg-[var(--color-accent-hover)] transition-colors"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={handleCancelEdit}
                  className="px-3 py-1.5 rounded-lg bg-[var(--color-surface-alt)] text-text-secondary text-sm hover:text-text-primary transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => handleStartEdit('email')}
                className="block text-sm font-body text-text-secondary hover:text-accent transition-colors cursor-pointer mt-1"
              >
                {profile.email || 'Set your email address'}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Stats summary */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 mb-8">
        <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <div className="text-2xl font-display font-bold text-accent">{stats.chronicleAnswers}</div>
          <div className="text-xs text-text-secondary font-body mt-1">Chronicle Answers</div>
        </div>
        <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <div className="text-2xl font-display font-bold text-accent">{stats.journalEntries}</div>
          <div className="text-xs text-text-secondary font-body mt-1">Journal Entries</div>
        </div>
        <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <div className="text-2xl font-display font-bold text-accent">{stats.thoughts}</div>
          <div className="text-xs text-text-secondary font-body mt-1">Thoughts Captured</div>
        </div>
        <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <div className="text-2xl font-display font-bold text-accent">{stats.daysSinceStarted}</div>
          <div className="text-xs text-text-secondary font-body mt-1">Days Since Started</div>
        </div>
      </div>

      {/* Member since */}
      <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
        <span className="text-xs text-text-secondary font-body">Member since </span>
        <span className="text-sm text-text-primary font-body">{formatDateAU(profile.createdAt)}</span>
      </div>
    </div>
  );
}
