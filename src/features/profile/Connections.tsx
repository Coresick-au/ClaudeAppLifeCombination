import { useState, useCallback, useEffect, useMemo, memo } from 'react';

interface Connection {
  id: string;
  name: string;
  relationship: string;
  notes: string;
  metDate: string;
  createdAt: string;
}

type RelationshipType = 'family' | 'friend' | 'colleague' | 'partner' | 'mentor' | 'other';

const RELATIONSHIP_TYPES: RelationshipType[] = [
  'family', 'friend', 'colleague', 'partner', 'mentor', 'other',
];

const RELATIONSHIP_COLOURS: Record<RelationshipType, string> = {
  family: '#f59e0b',
  friend: '#3b82f6',
  colleague: '#10b981',
  partner: '#ec4899',
  mentor: '#a855f7',
  other: '#6b7280',
};

const CONNECTIONS_KEY = 'life-os-connections';

function loadConnections(): Connection[] {
  try {
    const raw = localStorage.getItem(CONNECTIONS_KEY);
    return raw ? (JSON.parse(raw) as Connection[]) : [];
  } catch {
    return [];
  }
}

function saveConnections(connections: Connection[]): void {
  localStorage.setItem(CONNECTIONS_KEY, JSON.stringify(connections));
}

function formatDateAU(isoDate: string): string {
  if (!isoDate) return '';
  const d = new Date(isoDate);
  if (isNaN(d.getTime())) return isoDate;
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

function generateId(): string {
  return `conn-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function ConnectionsSkeleton() {
  return (
    <div className="space-y-4">
      {[1, 2, 3].map((n) => (
        <div
          key={`conn-skel-${n}`}
          className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]"
        >
          <div className="flex items-center gap-3 mb-3">
            <div className="skeleton h-5 w-32" />
            <div className="skeleton h-5 w-16 rounded-full" />
          </div>
          <div className="skeleton h-3 w-48 mb-2" />
          <div className="skeleton h-3 w-64" />
        </div>
      ))}
    </div>
  );
}

interface ConnectionCardProps {
  connection: Connection;
  onDelete: (id: string) => void;
}

const ConnectionCard = memo(function ConnectionCard({ connection, onDelete }: ConnectionCardProps) {
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  const handleDeleteClick = useCallback(() => {
    setConfirmingDelete(true);
  }, []);

  const handleConfirmDelete = useCallback(() => {
    onDelete(connection.id);
    setConfirmingDelete(false);
  }, [onDelete, connection.id]);

  const handleCancelDelete = useCallback(() => {
    setConfirmingDelete(false);
  }, []);

  const badgeColour = RELATIONSHIP_COLOURS[connection.relationship as RelationshipType] ?? '#6b7280';

  return (
    <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] transition-colors">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3 mb-2">
          <h3 className="text-lg font-display font-semibold text-text-primary">
            {connection.name}
          </h3>
          <span
            className="inline-block px-2.5 py-0.5 rounded-full text-xs font-body font-medium text-white capitalize"
            style={{ backgroundColor: badgeColour }}
          >
            {connection.relationship}
          </span>
        </div>
        <div>
          {confirmingDelete ? (
            <div className="flex items-center gap-2">
              <span className="text-xs text-text-secondary font-body">Remove?</span>
              <button
                type="button"
                onClick={handleConfirmDelete}
                className="px-2 py-1 rounded text-xs bg-red-600 text-white hover:bg-red-700 transition-colors"
              >
                Yes
              </button>
              <button
                type="button"
                onClick={handleCancelDelete}
                className="px-2 py-1 rounded text-xs bg-[var(--color-surface-alt)] text-text-secondary hover:text-text-primary transition-colors"
              >
                No
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleDeleteClick}
              className="text-text-secondary hover:text-red-500 transition-colors text-sm"
              aria-label={`Delete ${connection.name}`}
            >
              &times;
            </button>
          )}
        </div>
      </div>
      {connection.metDate && (
        <p className="text-xs text-text-secondary font-body mb-2">
          Met: {formatDateAU(connection.metDate)}
        </p>
      )}
      {connection.notes && (
        <p className="text-sm text-text-secondary font-body leading-relaxed">
          {connection.notes}
        </p>
      )}
    </div>
  );
});

export function Connections() {
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formName, setFormName] = useState('');
  const [formRelationship, setFormRelationship] = useState<RelationshipType>('friend');
  const [formNotes, setFormNotes] = useState('');
  const [formMetDate, setFormMetDate] = useState('');

  useEffect(() => {
    setConnections(loadConnections());
    setIsLoading(false);
  }, []);

  const sortedConnections = useMemo(
    () => [...connections].sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    [connections],
  );

  const resetForm = useCallback(() => {
    setFormName('');
    setFormRelationship('friend');
    setFormNotes('');
    setFormMetDate('');
    setShowForm(false);
  }, []);

  const handleAddConnection = useCallback(() => {
    if (!formName.trim()) return;

    const newConnection: Connection = {
      id: generateId(),
      name: formName.trim(),
      relationship: formRelationship,
      notes: formNotes.trim(),
      metDate: formMetDate,
      createdAt: new Date().toISOString(),
    };

    const updated = [newConnection, ...connections];
    setConnections(updated);
    saveConnections(updated);
    resetForm();
  }, [formName, formRelationship, formNotes, formMetDate, connections, resetForm]);

  const handleDelete = useCallback((id: string) => {
    setConnections((prev) => {
      const updated = prev.filter((c) => c.id !== id);
      saveConnections(updated);
      return updated;
    });
  }, []);

  if (isLoading) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Connections</h2>
        <ConnectionsSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-display font-bold text-text-primary">Connections</h2>
        {!showForm && (
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-body hover:bg-[var(--color-accent-hover)] transition-colors"
          >
            + Add Person
          </button>
        )}
      </div>

      {/* Add Connection Form */}
      {showForm && (
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-accent)] mb-6 space-y-4">
          <h3 className="text-lg font-display font-semibold text-text-primary">Add a Connection</h3>

          <div>
            <label className="block text-xs text-text-secondary font-body uppercase tracking-wider mb-1">
              Name
            </label>
            <input
              type="text"
              value={formName}
              onChange={(e) => setFormName(e.target.value)}
              placeholder="Their name"
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-body uppercase tracking-wider mb-1">
              Relationship
            </label>
            <select
              value={formRelationship}
              onChange={(e) => setFormRelationship(e.target.value as RelationshipType)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)]"
            >
              {RELATIONSHIP_TYPES.map((type) => (
                <option key={type} value={type} className="capitalize">
                  {type.charAt(0).toUpperCase() + type.slice(1)}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-body uppercase tracking-wider mb-1">
              Notes
            </label>
            <textarea
              value={formNotes}
              onChange={(e) => setFormNotes(e.target.value)}
              placeholder="How you know them, shared experiences, anything worth remembering..."
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs text-text-secondary font-body uppercase tracking-wider mb-1">
              Met Date
            </label>
            <input
              type="date"
              value={formMetDate}
              onChange={(e) => setFormMetDate(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary font-body text-sm focus:outline-none focus:border-[var(--color-accent)]"
            />
          </div>

          <div className="flex items-center gap-3 pt-2">
            <button
              type="button"
              onClick={handleAddConnection}
              disabled={!formName.trim()}
              className="px-4 py-2 rounded-lg bg-[var(--color-accent)] text-white text-sm font-body hover:bg-[var(--color-accent-hover)] transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Add Connection
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 rounded-lg bg-[var(--color-surface-alt)] text-text-secondary text-sm font-body hover:text-text-primary transition-colors"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Connection List */}
      {sortedConnections.length === 0 ? (
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary font-body text-lg mb-2">No connections added yet</p>
          <p className="text-text-secondary font-body text-sm">
            Start mapping the people who matter in your story.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sortedConnections.map((connection) => (
            <ConnectionCard
              key={connection.id}
              connection={connection}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
