import { useState, useMemo, useCallback, memo } from 'react';
import { formatAUD } from '@/utils/currency';
import { isoToAU } from '@/utils/dates';
import { useData } from '@/services/DataContext';
import type { SuperFund } from '@/types/wealth.types';

// --- Skeleton ---

function SuperSkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48 rounded-lg" />
      <div className="skeleton h-24 rounded-xl" />
      {[1, 2].map((n) => (
        <div key={`super-skel-${n}`} className="skeleton h-32 rounded-xl" />
      ))}
    </div>
  );
}

// --- Empty form state ---

interface SuperFormData {
  fundName: string;
  balance: number | '';
  insuranceCover: string;
  lastUpdated: string;
}

const EMPTY_FORM: SuperFormData = {
  fundName: '',
  balance: '',
  insuranceCover: '',
  lastUpdated: new Date().toISOString().split('T')[0] ?? '',
};

// --- Fund card ---

interface FundCardProps {
  fund: SuperFund;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  isEditing: boolean;
  onSaveEdit: (id: string, data: SuperFormData) => void;
  onCancelEdit: () => void;
  deletingId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

const FundCard = memo(function FundCard({
  fund,
  onEdit,
  onDelete,
  isEditing,
  onSaveEdit,
  onCancelEdit,
  deletingId,
  onConfirmDelete,
  onCancelDelete,
}: FundCardProps) {
  const isDeleting = deletingId === fund.id;
  const [form, setForm] = useState<SuperFormData>({
    fundName: fund.fundName,
    balance: fund.balance,
    insuranceCover: fund.insuranceCover,
    lastUpdated: fund.lastUpdated,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmitEdit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const newErrors: Record<string, string> = {};
      if (!form.fundName.trim()) newErrors['fundName'] = 'Fund name is required';
      if (!form.balance || Number(form.balance) < 0) newErrors['balance'] = 'Balance must be zero or greater';
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        return;
      }
      onSaveEdit(fund.id, form);
    },
    [form, fund.id, onSaveEdit],
  );

  if (isEditing) {
    return (
      <form onSubmit={handleSubmitEdit} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Fund Name *</label>
            <input
              type="text"
              value={form.fundName}
              onChange={(e) => { setForm((p) => ({ ...p, fundName: e.target.value })); setErrors((p) => { const n = { ...p }; delete n['fundName']; return n; }); }}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            {errors['fundName'] && <p className="text-red-400 text-xs mt-1">{errors['fundName']}</p>}
          </div>
          <div>
            <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Balance *</label>
            <input
              type="number"
              value={form.balance}
              onChange={(e) => { setForm((p) => ({ ...p, balance: e.target.value ? Number(e.target.value) : '' })); setErrors((p) => { const n = { ...p }; delete n['balance']; return n; }); }}
              min={0}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
            />
            {errors['balance'] && <p className="text-red-400 text-xs mt-1">{errors['balance']}</p>}
          </div>
          <div>
            <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Insurance Cover</label>
            <input
              type="text"
              value={form.insuranceCover}
              onChange={(e) => setForm((p) => ({ ...p, insuranceCover: e.target.value }))}
              placeholder="e.g. Death & TPD $500k"
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
          <div>
            <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Last Updated</label>
            <input
              type="date"
              value={form.lastUpdated}
              onChange={(e) => setForm((p) => ({ ...p, lastUpdated: e.target.value }))}
              className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
            />
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button
            type="button"
            onClick={onCancelEdit}
            className="px-4 py-2 rounded-lg border border-[var(--color-border)] text-text-secondary text-sm hover:text-text-primary transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    );
  }

  return (
    <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
      <div className="flex items-start justify-between gap-4 mb-3">
        <div>
          <h3 className="text-lg font-display font-semibold text-text-primary">{fund.fundName}</h3>
          {fund.lastUpdated && (
            <p className="text-text-secondary text-xs">Last updated: {isoToAU(fund.lastUpdated)}</p>
          )}
        </div>
        <div className="flex gap-2 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(fund.id)}
            className="px-3 py-1 rounded-lg border border-[var(--color-border)] text-text-secondary text-xs hover:text-text-primary hover:border-accent transition-colors"
          >
            Edit
          </button>
          {isDeleting ? (
            <div className="flex gap-1">
              <button
                type="button"
                onClick={() => onConfirmDelete(fund.id)}
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
              onClick={() => onDelete(fund.id)}
              className="px-3 py-1 rounded-lg border border-red-800 text-red-400 text-xs hover:bg-red-900/30 transition-colors"
            >
              Delete
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Balance</p>
          <p className="text-accent font-display font-bold text-xl">{formatAUD(fund.balance)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Insurance Cover</p>
          <p className="text-text-primary font-medium">{fund.insuranceCover || 'Not specified'}</p>
        </div>
      </div>
    </div>
  );
});

// --- Main component ---

export function SuperTracker() {
  const { getSuperFunds, setSuperFunds, isLoaded } = useData();
  const funds = getSuperFunds();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Add form state
  const [form, setForm] = useState<SuperFormData>(EMPTY_FORM);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const totalBalance = useMemo(
    () => funds.reduce((sum, f) => sum + f.balance, 0),
    [funds],
  );

  const resetForm = useCallback(() => {
    setForm(EMPTY_FORM);
    setFormErrors({});
  }, []);

  const handleSubmitAdd = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errors: Record<string, string> = {};
      if (!form.fundName.trim()) errors['fundName'] = 'Fund name is required';
      if (!form.balance || Number(form.balance) < 0) errors['balance'] = 'Balance must be zero or greater';
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      const newFund: SuperFund = {
        id: crypto.randomUUID(),
        fundName: form.fundName.trim(),
        balance: Number(form.balance),
        insuranceCover: form.insuranceCover.trim(),
        lastUpdated: form.lastUpdated || new Date().toISOString().split('T')[0] || '',
      };
      const updated = [...funds, newFund];
      setSuperFunds(updated);
      resetForm();
      setShowForm(false);
    },
    [form, funds, resetForm, setSuperFunds],
  );

  const handleEdit = useCallback((id: string) => {
    setEditingId(id);
    setDeletingId(null);
  }, []);

  const handleSaveEdit = useCallback(
    (id: string, data: SuperFormData) => {
      const updated = funds.map((f) =>
        f.id === id
          ? {
              ...f,
              fundName: data.fundName.trim(),
              balance: Number(data.balance),
              insuranceCover: data.insuranceCover.trim(),
              lastUpdated: data.lastUpdated || f.lastUpdated,
            }
          : f,
      );
      setSuperFunds(updated);
      setEditingId(null);
    },
    [funds, setSuperFunds],
  );

  const handleCancelEdit = useCallback(() => {
    setEditingId(null);
  }, []);

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleConfirmDelete = useCallback(
    (id: string) => {
      const updated = funds.filter((f) => f.id !== id);
      setSuperFunds(updated);
      setDeletingId(null);
    },
    [funds, setSuperFunds],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <SuperSkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-display font-bold text-text-primary">Superannuation</h2>
        <button
          type="button"
          onClick={() => { setShowForm((prev) => !prev); if (showForm) resetForm(); }}
          className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Super Fund'}
        </button>
      </div>

      {/* Total balance summary */}
      {funds.length > 0 && (
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Total Super Balance</p>
          <p className="text-3xl font-display font-bold text-accent">{formatAUD(totalBalance)}</p>
          <p className="text-text-secondary text-sm mt-1">
            Across {funds.length} fund{funds.length !== 1 ? 's' : ''}
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmitAdd} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Fund Name *</label>
              <input
                type="text"
                value={form.fundName}
                onChange={(e) => { setForm((p) => ({ ...p, fundName: e.target.value })); setFormErrors((p) => { const n = { ...p }; delete n['fundName']; return n; }); }}
                placeholder="e.g. AustralianSuper"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              {formErrors['fundName'] && <p className="text-red-400 text-xs mt-1">{formErrors['fundName']}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Balance *</label>
              <input
                type="number"
                value={form.balance}
                onChange={(e) => { setForm((p) => ({ ...p, balance: e.target.value ? Number(e.target.value) : '' })); setFormErrors((p) => { const n = { ...p }; delete n['balance']; return n; }); }}
                min={0}
                placeholder="250000"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              {formErrors['balance'] && <p className="text-red-400 text-xs mt-1">{formErrors['balance']}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Insurance Cover</label>
              <input
                type="text"
                value={form.insuranceCover}
                onChange={(e) => setForm((p) => ({ ...p, insuranceCover: e.target.value }))}
                placeholder="e.g. Death & TPD $500,000"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Last Updated</label>
              <input
                type="date"
                value={form.lastUpdated}
                onChange={(e) => setForm((p) => ({ ...p, lastUpdated: e.target.value }))}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Add Fund
            </button>
          </div>
        </form>
      )}

      {/* Empty state */}
      {funds.length === 0 && !showForm && (
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary text-lg mb-2">No super funds tracked yet</p>
          <p className="text-text-secondary text-sm">
            Add your superannuation funds to keep track of your retirement savings.
          </p>
        </div>
      )}

      {/* Fund cards */}
      <div className="space-y-4">
        {funds.map((fund) => (
          <FundCard
            key={fund.id}
            fund={fund}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            isEditing={editingId === fund.id}
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
