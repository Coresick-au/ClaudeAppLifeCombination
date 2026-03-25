import React, { useState, useMemo, useCallback } from 'react';
import { useData } from '@/services/DataContext';
import {
  ARCHETYPES,
  ARCHETYPE_INFO,
  AVAILABLE_TRAITS,
  type Archetype,
  type CharacterProfile,
} from '@/types/rpg.types';

// ─── Sub-components ────────────────────────────────────────────────

const INPUT_CLASS =
  'bg-[var(--color-input-bg)] border border-[var(--color-input-border)] rounded-lg px-3 py-2 text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)] w-full';

const LABEL_CLASS =
  'block text-xs text-text-secondary font-body uppercase tracking-wider mb-1';

const BUTTON_CLASS =
  'px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-body hover:bg-[var(--color-accent-hover)] transition-colors';

interface ArchetypeOptionProps {
  archetype: Archetype;
  selected: boolean;
  onSelect: (archetype: Archetype) => void;
}

const ArchetypeOption = React.memo(function ArchetypeOption({
  archetype,
  selected,
  onSelect,
}: ArchetypeOptionProps) {
  const info = ARCHETYPE_INFO[archetype];
  const handleClick = useCallback(() => onSelect(archetype), [archetype, onSelect]);

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`text-left p-3 rounded-lg border transition-colors ${
        selected
          ? 'border-[var(--color-accent)] bg-[var(--color-accent)]/10'
          : 'border-[var(--color-border)] bg-[var(--color-surface-card)] hover:border-[var(--color-accent)]/50'
      }`}
    >
      <span className="text-sm font-body font-semibold text-text-primary">
        {archetype}
      </span>
      <p className="text-xs text-text-secondary font-body mt-1">{info.tagline}</p>
    </button>
  );
});

interface TraitChipProps {
  traitId: string;
  label: string;
  selected: boolean;
  disabled: boolean;
  onToggle: (traitId: string) => void;
}

const TraitChip = React.memo(function TraitChip({
  traitId,
  label,
  selected,
  disabled,
  onToggle,
}: TraitChipProps) {
  const handleClick = useCallback(() => onToggle(traitId), [traitId, onToggle]);

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={disabled && !selected}
      className={`px-3 py-1.5 rounded-full text-xs font-body transition-colors ${
        selected
          ? 'bg-[var(--color-accent)] text-white'
          : disabled
            ? 'bg-[var(--color-surface-card)] text-text-secondary/40 border border-[var(--color-border)] cursor-not-allowed'
            : 'bg-[var(--color-surface-card)] text-text-secondary border border-[var(--color-border)] hover:border-[var(--color-accent)]/50 hover:text-text-primary'
      }`}
    >
      {label}
    </button>
  );
});

interface CharacterCardProps {
  character: CharacterProfile;
  expectedLifespan: number;
  onEdit: () => void;
}

const CharacterCard = React.memo(function CharacterCard({
  character,
  expectedLifespan,
  onEdit,
}: CharacterCardProps) {
  const archetypeInfo = character.archetype
    ? ARCHETYPE_INFO[character.archetype]
    : null;

  return (
    <div className="bg-[var(--color-surface-card)] border border-[var(--color-border)] rounded-xl p-6 max-w-lg mx-auto">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h2 className="text-2xl font-display text-text-primary">{character.name}</h2>
          {character.title && (
            <p className="text-sm font-rpg text-[var(--color-accent)] mt-0.5">
              {character.title}
            </p>
          )}
        </div>
        <button type="button" onClick={onEdit} className={BUTTON_CLASS}>
          Edit
        </button>
      </div>

      {character.archetype && archetypeInfo && (
        <div className="mb-4 p-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
          <span className="text-sm font-body font-semibold text-text-primary">
            {character.archetype}
          </span>
          <p className="text-xs text-text-secondary font-body mt-1">
            {archetypeInfo.tagline}
          </p>
          <p className="text-xs text-text-secondary font-body mt-1">
            {archetypeInfo.bonus}
          </p>
        </div>
      )}

      {character.motto && (
        <blockquote className="text-sm font-body italic text-text-secondary border-l-2 border-[var(--color-accent)] pl-3 mb-4">
          &ldquo;{character.motto}&rdquo;
        </blockquote>
      )}

      {character.traits.length > 0 && (
        <div className="flex flex-wrap gap-2 mb-4">
          {character.traits.map((traitId) => {
            const traitDef = AVAILABLE_TRAITS.find((t) => t.id === traitId);
            return (
              <span
                key={traitId}
                className="px-3 py-1 rounded-full text-xs font-body bg-[var(--color-accent)]/10 text-[var(--color-accent)] border border-[var(--color-accent)]/20"
              >
                {traitDef?.name ?? traitId}
              </span>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3 text-xs font-body text-text-secondary">
        {character.birthDate && (
          <div>
            <span className="uppercase tracking-wider">Born</span>
            <p className="text-text-primary mt-0.5">
              {new Date(character.birthDate).toLocaleDateString('en-AU')}
            </p>
          </div>
        )}
        <div>
          <span className="uppercase tracking-wider">Expected Lifespan</span>
          <p className="text-text-primary mt-0.5">{expectedLifespan} years</p>
        </div>
      </div>
    </div>
  );
});

const DesignerSkeleton = React.memo(function DesignerSkeleton() {
  return (
    <div className="max-w-lg mx-auto space-y-4 animate-pulse">
      <div className="h-8 bg-[var(--color-surface-card)] rounded-lg w-48" />
      <div className="h-10 bg-[var(--color-surface-card)] rounded-lg" />
      <div className="h-10 bg-[var(--color-surface-card)] rounded-lg" />
      <div className="grid grid-cols-3 gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={`skel-${i}`} className="h-16 bg-[var(--color-surface-card)] rounded-lg" />
        ))}
      </div>
      <div className="h-10 bg-[var(--color-surface-card)] rounded-lg" />
      <div className="h-20 bg-[var(--color-surface-card)] rounded-lg" />
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={`skel-trait-${i}`} className="h-8 w-20 bg-[var(--color-surface-card)] rounded-full" />
        ))}
      </div>
    </div>
  );
});

// ─── Main Component ────────────────────────────────────────────────

export function CharacterDesigner() {
  const { getRPG, setRPG, isLoaded } = useData();
  const rpg = getRPG();

  const [isEditing, setIsEditing] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [title, setTitle] = useState('');
  const [archetype, setArchetype] = useState<Archetype | ''>('');
  const [birthDate, setBirthDate] = useState('');
  const [motto, setMotto] = useState('');
  const [traits, setTraits] = useState<string[]>([]);
  const [expectedLifespan, setExpectedLifespan] = useState(80);

  const characterExists = useMemo(
    () => Boolean(rpg?.character?.name),
    [rpg?.character?.name],
  );

  const showForm = isEditing || !characterExists;

  const populateForm = useCallback(() => {
    if (rpg?.character) {
      setName(rpg.character.name);
      setTitle(rpg.character.title || '');
      setArchetype(rpg.character.archetype || '');
      setBirthDate(rpg.character.birthDate || '');
      setMotto(rpg.character.motto || '');
      setTraits(rpg.character.traits || []);
    }
    setExpectedLifespan(rpg?.expectedLifespan ?? 80);
  }, [rpg?.character, rpg?.expectedLifespan]);

  const handleEdit = useCallback(() => {
    populateForm();
    setIsEditing(true);
  }, [populateForm]);

  const handleCancel = useCallback(() => {
    setIsEditing(false);
  }, []);

  const handleArchetypeSelect = useCallback((selected: Archetype) => {
    setArchetype(selected);
  }, []);

  const handleTraitToggle = useCallback((trait: string) => {
    setTraits((prev) => {
      if (prev.includes(trait)) {
        return prev.filter((t) => t !== trait);
      }
      if (prev.length >= 3) return prev;
      return [...prev, trait];
    });
  }, []);

  const handleLifespanChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = parseInt(e.target.value, 10);
      if (!isNaN(val) && val > 0) {
        setExpectedLifespan(val);
      }
    },
    [],
  );

  const selectedArchetypeInfo = useMemo(
    () => (archetype ? ARCHETYPE_INFO[archetype] : null),
    [archetype],
  );

  const traitsAtMax = useMemo(() => traits.length >= 3, [traits.length]);

  const handleSave = useCallback(() => {
    if (!rpg) return;

    const now = new Date().toISOString();
    const updatedCharacter: CharacterProfile = {
      name,
      title,
      archetype,
      birthDate,
      motto,
      traits,
      createdAt: rpg.character?.createdAt || now,
      updatedAt: now,
    };

    setRPG({
      ...rpg,
      character: updatedCharacter,
      expectedLifespan,
    });

    setIsEditing(false);
  }, [rpg, name, title, archetype, birthDate, motto, traits, expectedLifespan, setRPG]);

  const isFormValid = useMemo(() => name.trim().length > 0, [name]);

  // ─── Render ──────────────────────────────────────────────────────

  if (!isLoaded) {
    return <DesignerSkeleton />;
  }

  if (!showForm && rpg?.character) {
    return (
      <CharacterCard
        character={rpg.character}
        expectedLifespan={rpg.expectedLifespan ?? 80}
        onEdit={handleEdit}
      />
    );
  }

  return (
    <div className="max-w-lg mx-auto">
      <h2 className="text-xl font-display text-text-primary mb-6">
        {characterExists ? 'Edit Your Character' : 'Design Your Character'}
      </h2>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSave();
        }}
        className="space-y-5"
      >
        {/* Name */}
        <div>
          <label htmlFor="char-name" className={LABEL_CLASS}>
            Name
          </label>
          <input
            id="char-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Your character's name"
            className={INPUT_CLASS}
            required
          />
        </div>

        {/* Title */}
        <div>
          <label htmlFor="char-title" className={LABEL_CLASS}>
            Title
          </label>
          <input
            id="char-title"
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder='e.g. "The Persistent"'
            className={INPUT_CLASS}
          />
        </div>

        {/* Archetype */}
        <div>
          <span className={LABEL_CLASS}>Archetype</span>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-1">
            {ARCHETYPES.map((a) => (
              <ArchetypeOption
                key={a}
                archetype={a}
                selected={archetype === a}
                onSelect={handleArchetypeSelect}
              />
            ))}
          </div>
          {selectedArchetypeInfo && (
            <div className="mt-3 p-3 rounded-lg bg-[var(--color-accent)]/5 border border-[var(--color-accent)]/20">
              <p className="text-xs font-body text-text-secondary">
                {selectedArchetypeInfo.tagline}
              </p>
              <p className="text-xs font-body text-text-secondary mt-1">
                <span className="font-semibold text-text-primary">Bonus:</span>{' '}
                {selectedArchetypeInfo.bonus}
              </p>
            </div>
          )}
        </div>

        {/* Birth Date */}
        <div>
          <label htmlFor="char-birth" className={LABEL_CLASS}>
            Birth Date
          </label>
          <input
            id="char-birth"
            type="date"
            value={birthDate}
            onChange={(e) => setBirthDate(e.target.value)}
            className={INPUT_CLASS}
          />
        </div>

        {/* Expected Lifespan */}
        <div>
          <label htmlFor="char-lifespan" className={LABEL_CLASS}>
            Expected Lifespan (years)
          </label>
          <input
            id="char-lifespan"
            type="number"
            min={1}
            max={150}
            value={expectedLifespan}
            onChange={handleLifespanChange}
            className={INPUT_CLASS}
          />
          <p className="text-xs text-text-secondary font-body mt-1">
            Used to map your life onto the spiral timeline. The average Australian lifespan is roughly 83 years.
          </p>
        </div>

        {/* Motto */}
        <div>
          <label htmlFor="char-motto" className={LABEL_CLASS}>
            Motto
          </label>
          <textarea
            id="char-motto"
            value={motto}
            onChange={(e) => setMotto(e.target.value)}
            placeholder="A guiding phrase that grounds you — something you can feel in your bones."
            rows={3}
            className={INPUT_CLASS + ' resize-none'}
          />
        </div>

        {/* Traits */}
        <div>
          <span className={LABEL_CLASS}>
            Traits (select up to 3)
          </span>
          <div className="flex flex-wrap gap-2 mt-1">
            {AVAILABLE_TRAITS.map((trait) => (
              <TraitChip
                key={trait.id}
                traitId={trait.id}
                label={trait.name}
                selected={traits.includes(trait.id)}
                disabled={traitsAtMax}
                onToggle={handleTraitToggle}
              />
            ))}
          </div>
          {traits.length > 0 && (
            <p className="text-xs text-text-secondary font-body mt-2">
              {traits.length}/3 traits selected
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex items-center gap-3 pt-2">
          <button
            type="submit"
            disabled={!isFormValid}
            className={`${BUTTON_CLASS} ${!isFormValid ? 'opacity-50 cursor-not-allowed' : ''}`}
          >
            {characterExists ? 'Save Changes' : 'Create Character'}
          </button>
          {characterExists && (
            <button
              type="button"
              onClick={handleCancel}
              className="px-4 py-2 rounded-lg text-sm font-body text-text-secondary hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
