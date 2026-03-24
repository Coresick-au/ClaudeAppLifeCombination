import { useState, useEffect, useMemo, useCallback, memo } from 'react';
import { formatAUD } from '@/utils/currency';
import { isoToAU } from '@/utils/dates';
import type { Property } from '@/types/wealth.types';

// --- localStorage helpers ---

function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem('life-os-properties');
    return raw ? (JSON.parse(raw) as Property[]) : [];
  } catch {
    return [];
  }
}

function saveProperties(properties: Property[]): void {
  localStorage.setItem('life-os-properties', JSON.stringify(properties));
}

function generateId(): string {
  return `prop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

// --- Constants ---

const AU_STATES = ['NSW', 'VIC', 'QLD', 'SA', 'WA', 'TAS', 'NT', 'ACT'] as const;
const PROPERTY_TYPES = ['House', 'Apartment', 'Townhouse', 'Land', 'Commercial'] as const;

type SortField = 'equity' | 'value';

const EMPTY_PROPERTY: Omit<Property, 'id'> = {
  address: '',
  suburb: '',
  state: 'QLD',
  postcode: '',
  type: 'House',
  currentValue: 0,
  purchasePrice: 0,
  purchaseDate: '',
  loanBalance: 0,
  lender: '',
  interestRate: 0,
  ownershipSplit: '100%',
  weeklyRent: 0,
  isManaged: false,
  isPPOR: false,
  notes: '',
};

// --- Skeleton loader ---

function PortfolioSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48 rounded-lg" />
      <div className="skeleton h-12 w-full rounded-lg" />
      {[1, 2, 3].map((n) => (
        <div key={`prop-skel-${n}`} className="skeleton h-44 rounded-xl" />
      ))}
    </div>
  );
}

// --- Form component ---

interface PropertyFormProps {
  initial: Omit<Property, 'id'>;
  onSubmit: (data: Omit<Property, 'id'>) => void;
  onCancel: () => void;
  submitLabel: string;
}

function PropertyForm({ initial, onSubmit, onCancel, submitLabel }: PropertyFormProps) {
  const [form, setForm] = useState(initial);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleChange = useCallback((field: keyof Omit<Property, 'id'>, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};
      if (!form.address.trim()) newErrors['address'] = 'Address is required';
      if (form.currentValue <= 0) newErrors['currentValue'] = 'Current value must be greater than zero';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      onSubmit(form);
    },
    [form, onSubmit],
  );

  return (
    <form onSubmit={handleSubmit} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Address */}
        <div className="md:col-span-2">
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Address *</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => handleChange('address', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
            placeholder="123 Example Street"
          />
          {errors['address'] && <p className="text-red-400 text-xs mt-1">{errors['address']}</p>}
        </div>

        {/* Suburb */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Suburb</label>
          <input
            type="text"
            value={form.suburb}
            onChange={(e) => handleChange('suburb', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* State */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">State</label>
          <select
            value={form.state}
            onChange={(e) => handleChange('state', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            {AU_STATES.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        {/* Postcode */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Postcode</label>
          <input
            type="text"
            value={form.postcode}
            onChange={(e) => handleChange('postcode', e.target.value)}
            maxLength={4}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Type */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Type</label>
          <select
            value={form.type}
            onChange={(e) => handleChange('type', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          >
            {PROPERTY_TYPES.map((t) => (
              <option key={t} value={t}>{t}</option>
            ))}
          </select>
        </div>

        {/* Current Value */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Current Value *</label>
          <input
            type="number"
            value={form.currentValue || ''}
            onChange={(e) => handleChange('currentValue', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
            placeholder="800000"
          />
          {errors['currentValue'] && <p className="text-red-400 text-xs mt-1">{errors['currentValue']}</p>}
        </div>

        {/* Purchase Price */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Purchase Price</label>
          <input
            type="number"
            value={form.purchasePrice || ''}
            onChange={(e) => handleChange('purchasePrice', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Purchase Date */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Purchase Date</label>
          <input
            type="date"
            value={form.purchaseDate}
            onChange={(e) => handleChange('purchaseDate', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Loan Balance */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Loan Balance</label>
          <input
            type="number"
            value={form.loanBalance || ''}
            onChange={(e) => handleChange('loanBalance', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Lender */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Lender</label>
          <input
            type="text"
            value={form.lender}
            onChange={(e) => handleChange('lender', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Interest Rate */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Interest Rate (%)</label>
          <input
            type="number"
            value={form.interestRate || ''}
            onChange={(e) => handleChange('interestRate', Number(e.target.value))}
            min={0}
            max={20}
            step={0.01}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Ownership Split */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Ownership Split</label>
          <input
            type="text"
            value={form.ownershipSplit}
            onChange={(e) => handleChange('ownershipSplit', e.target.value)}
            placeholder="100% or 50/50"
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Weekly Rent */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Weekly Rent</label>
          <input
            type="number"
            value={form.weeklyRent || ''}
            onChange={(e) => handleChange('weeklyRent', Number(e.target.value))}
            min={0}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Checkboxes */}
        <div className="flex items-center gap-6">
          <label className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isManaged}
              onChange={(e) => handleChange('isManaged', e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            Managed
          </label>
          <label className="flex items-center gap-2 text-text-primary text-sm cursor-pointer">
            <input
              type="checkbox"
              checked={form.isPPOR}
              onChange={(e) => handleChange('isPPOR', e.target.checked)}
              className="accent-[var(--color-accent)]"
            />
            PPOR
          </label>
        </div>

        {/* Sold Date */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Sold Date</label>
          <input
            type="date"
            value={form.soldDate ?? ''}
            onChange={(e) => handleChange('soldDate', e.target.value)}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Sold Price */}
        <div>
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Sold Price</label>
          <input
            type="number"
            value={form.soldPrice ?? ''}
            onChange={(e) => handleChange('soldPrice', e.target.value ? Number(e.target.value) : 0)}
            min={0}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
          />
        </div>

        {/* Notes */}
        <div className="md:col-span-2">
          <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Notes</label>
          <textarea
            value={form.notes}
            onChange={(e) => handleChange('notes', e.target.value)}
            rows={2}
            className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent resize-none"
          />
        </div>
      </div>

      <div className="flex gap-3 justify-end">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-text-secondary text-sm hover:text-text-primary transition-colors"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          {submitLabel}
        </button>
      </div>
    </form>
  );
}

// --- Property card ---

interface PropertyCardProps {
  property: Property;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onSaveEdit: (data: Omit<Property, 'id'>) => void;
  onCancelEdit: () => void;
  deletingId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

const PropertyCard = memo(function PropertyCard({
  property,
  onEdit,
  onDelete,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  deletingId,
  onConfirmDelete,
  onCancelDelete,
}: PropertyCardProps) {
  const equity = property.currentValue - property.loanBalance;
  const lvr = property.currentValue > 0 ? (property.loanBalance / property.currentValue) * 100 : 0;
  const isDeleting = deletingId === property.id;

  if (isEditing) {
    const { id: _id, ...rest } = property;
    return <PropertyForm initial={rest} onSubmit={onSaveEdit} onCancel={onCancelEdit} submitLabel="Save Changes" />;
  }

  return (
    <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-display font-semibold text-text-primary">{property.address}</h3>
          <p className="text-text-secondary text-sm">
            {property.suburb}{property.suburb && property.state ? ', ' : ''}{property.state} {property.postcode}
          </p>
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(property.id)}
            className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-text-secondary text-xs hover:text-text-primary hover:border-accent transition-colors"
          >
            Edit
          </button>
          {isDeleting ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onConfirmDelete(property.id)}
                className="px-3 py-1 rounded-lg bg-red-600 text-white text-xs hover:bg-red-700 transition-colors"
              >
                Confirm
              </button>
              <button
                type="button"
                onClick={onCancelDelete}
                className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-text-secondary text-xs hover:text-text-primary transition-colors"
              >
                Cancel
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => onDelete(property.id)}
              className="px-3 py-1 rounded-lg border border-red-800 text-red-400 text-xs hover:bg-red-900/30 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Type</p>
          <p className="text-text-primary font-medium">{property.type}{property.isPPOR ? ' (PPOR)' : ''}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Value</p>
          <p className="text-text-primary font-semibold">{formatAUD(property.currentValue)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Loan</p>
          <p className="text-text-primary font-medium">{formatAUD(property.loanBalance)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Equity</p>
          <p className={`font-semibold ${equity >= 0 ? 'text-accent' : 'text-red-400'}`}>{formatAUD(equity)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">LVR</p>
          <p className={`font-medium ${lvr > 80 ? 'text-red-400' : 'text-text-primary'}`}>{lvr.toFixed(1)}%</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Weekly Rent</p>
          <p className="text-text-primary font-medium">{property.weeklyRent > 0 ? formatAUD(property.weeklyRent) : 'N/A'}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Ownership</p>
          <p className="text-text-primary font-medium">{property.ownershipSplit}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Rate</p>
          <p className="text-text-primary font-medium">{property.interestRate > 0 ? `${property.interestRate}%` : 'N/A'}</p>
        </div>
      </div>

      {property.purchaseDate && (
        <p className="text-text-secondary text-xs mt-3">
          Purchased {isoToAU(property.purchaseDate)}{property.purchasePrice > 0 ? ` for ${formatAUD(property.purchasePrice)}` : ''}{property.lender ? ` via ${property.lender}` : ''}
        </p>
      )}

      {property.soldDate && (
        <p className="text-red-400 text-xs mt-1">
          Sold {isoToAU(property.soldDate)}{property.soldPrice ? ` for ${formatAUD(property.soldPrice)}` : ''}
        </p>
      )}

      {property.notes && (
        <p className="text-text-secondary text-xs mt-2 italic">{property.notes}</p>
      )}
    </div>
  );
});

// --- Main component ---

export function PropertyPortfolio() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortField>('equity');

  useEffect(() => {
    setProperties(loadProperties());
    setLoading(false);
  }, []);

  const sortedProperties = useMemo(() => {
    const sorted = [...properties];
    if (sortBy === 'equity') {
      sorted.sort((a, b) => (b.currentValue - b.loanBalance) - (a.currentValue - a.loanBalance));
    } else {
      sorted.sort((a, b) => b.currentValue - a.currentValue);
    }
    return sorted;
  }, [properties, sortBy]);

  const handleAdd = useCallback((data: Omit<Property, 'id'>) => {
    const newProperty: Property = { ...data, id: generateId() };
    const updated = [...properties, newProperty];
    setProperties(updated);
    saveProperties(updated);
    setShowAddForm(false);
  }, [properties]);

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setDeletingId(null);
  }, []);

  const handleSaveEdit = useCallback((data: Omit<Property, 'id'>) => {
    if (!editingId) return;
    const updated = properties.map((p) => (p.id === editingId ? { ...data, id: editingId } : p));
    setProperties(updated);
    saveProperties(updated);
    setEditingId(null);
  }, [editingId, properties]);

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleConfirmDelete = useCallback((id: string) => {
    const updated = properties.filter((p) => p.id !== id);
    setProperties(updated);
    saveProperties(updated);
    setDeletingId(null);
  }, [properties]);

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  const handleSortChange = useCallback((field: SortField) => {
    setSortBy(field);
  }, []);

  if (loading) {
    return (
      <div className="p-6">
        <PortfolioSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-display font-bold text-text-primary">Property Portfolio</h2>
        <div className="flex items-center gap-3">
          {/* Sort controls */}
          {properties.length > 1 && (
            <div className="flex items-center gap-1 text-sm">
              <span className="text-text-secondary">Sort:</span>
              <button
                type="button"
                onClick={() => handleSortChange('equity')}
                className={`px-2 py-1 rounded text-xs transition-colors ${sortBy === 'equity' ? 'bg-accent text-[#0f1117] font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Equity
              </button>
              <button
                type="button"
                onClick={() => handleSortChange('value')}
                className={`px-2 py-1 rounded text-xs transition-colors ${sortBy === 'value' ? 'bg-accent text-[#0f1117] font-semibold' : 'text-text-secondary hover:text-text-primary'}`}
              >
                Value
              </button>
            </div>
          )}
          <button
            type="button"
            onClick={() => { setShowAddForm((prev) => !prev); setEditingId(null); }}
            className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            {showAddForm ? 'Cancel' : 'Add Property'}
          </button>
        </div>
      </div>

      {showAddForm && (
        <PropertyForm
          initial={EMPTY_PROPERTY}
          onSubmit={handleAdd}
          onCancel={() => setShowAddForm(false)}
          submitLabel="Add Property"
        />
      )}

      {properties.length === 0 && !showAddForm && (
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary text-lg mb-2">No properties yet</p>
          <p className="text-text-secondary text-sm">
            Add your first property to start tracking your portfolio.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {sortedProperties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            isEditing={editingId === property.id}
            onSaveEdit={handleSaveEdit}
            onCancelEdit={handleCancelEdit}
            deletingId={deletingId}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
          />
        ))}
      </div>
    </div>
  );
}
