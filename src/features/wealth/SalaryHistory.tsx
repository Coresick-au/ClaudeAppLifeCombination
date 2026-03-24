import { useState, useMemo, useCallback, memo } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';
import { Bar } from 'react-chartjs-2';
import { formatAUD } from '@/utils/currency';
import { useData } from '@/services/DataContext';
import type { SalaryRecord } from '@/types/wealth.types';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// --- Skeleton ---

function SalarySkeleton() {
  return (
    <div className="space-y-4">
      <div className="skeleton h-10 w-48 rounded-lg" />
      <div className="skeleton h-64 rounded-xl" />
      {[1, 2, 3].map((n) => (
        <div key={`sal-skel-${n}`} className="skeleton h-20 rounded-xl" />
      ))}
    </div>
  );
}

// --- Salary row ---

interface SalaryRowProps {
  record: SalaryRecord;
  onDelete: (id: string) => void;
  deletingId: string | null;
  onConfirmDelete: (id: string) => void;
  onCancelDelete: () => void;
}

const SalaryRow = memo(function SalaryRow({
  record,
  onDelete,
  deletingId,
  onConfirmDelete,
  onCancelDelete,
}: SalaryRowProps) {
  const isDeleting = deletingId === record.id;

  return (
    <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] flex items-center justify-between gap-4 flex-wrap">
      <div className="flex items-center gap-6 flex-wrap">
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Financial Year</p>
          <p className="text-text-primary font-display font-semibold">{record.financialYear}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Gross Salary</p>
          <p className="text-accent font-display font-bold text-lg">{formatAUD(record.grossSalary)}</p>
        </div>
        <div>
          <p className="text-text-secondary text-xs uppercase tracking-wider">Employer</p>
          <p className="text-text-primary text-sm">{record.employer || 'N/A'}</p>
        </div>
        {record.notes && (
          <div>
            <p className="text-text-secondary text-xs uppercase tracking-wider">Notes</p>
            <p className="text-text-secondary text-sm italic">{record.notes}</p>
          </div>
        )}
      </div>
      <div className="shrink-0">
        {isDeleting ? (
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => onConfirmDelete(record.id)}
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
            onClick={() => onDelete(record.id)}
            className="px-3 py-1 rounded-lg border border-red-800 text-red-400 text-xs hover:bg-red-900/30 transition-colors"
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
});

// --- Main component ---

export function SalaryHistory() {
  const { getSalaryHistory, setSalaryHistory, isLoaded } = useData();
  const records = getSalaryHistory();
  const [showForm, setShowForm] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  // Form state
  const [formYear, setFormYear] = useState('');
  const [formSalary, setFormSalary] = useState<number | ''>('');
  const [formEmployer, setFormEmployer] = useState('');
  const [formNotes, setFormNotes] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  const sortedRecords = useMemo(
    () => [...records].sort((a, b) => b.financialYear.localeCompare(a.financialYear)),
    [records],
  );

  const averageGrowth = useMemo(() => {
    if (sortedRecords.length < 2) return null;
    const chronological = [...sortedRecords].reverse();
    let totalGrowth = 0;
    let count = 0;
    for (let i = 1; i < chronological.length; i++) {
      const prev = chronological[i - 1];
      const curr = chronological[i];
      if (prev && curr && prev.grossSalary > 0) {
        totalGrowth += ((curr.grossSalary - prev.grossSalary) / prev.grossSalary) * 100;
        count++;
      }
    }
    return count > 0 ? totalGrowth / count : null;
  }, [sortedRecords]);

  // --- Chart data ---
  const chartData = useMemo(() => {
    const chronological = [...sortedRecords].reverse();
    return {
      labels: chronological.map((r) => r.financialYear),
      datasets: [
        {
          label: 'Gross Salary',
          data: chronological.map((r) => r.grossSalary),
          backgroundColor: 'rgba(201, 168, 76, 0.7)',
          borderColor: '#C9A84C',
          borderWidth: 1,
          borderRadius: 4,
        },
      ],
    };
  }, [sortedRecords]);

  const chartOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          ticks: { color: '#8b8e96' },
          grid: { color: 'rgba(201, 168, 76, 0.08)' },
        },
        y: {
          ticks: {
            color: '#8b8e96',
            callback: (value: string | number) => formatAUD(Number(value)),
          },
          grid: { color: 'rgba(201, 168, 76, 0.08)' },
        },
      },
      plugins: {
        legend: { display: false },
        tooltip: {
          callbacks: {
            label: (ctx: { parsed: { y: number | null } }) => formatAUD(ctx.parsed.y ?? 0),
          },
        },
      },
    }),
    [],
  );

  const resetForm = useCallback(() => {
    setFormYear('');
    setFormSalary('');
    setFormEmployer('');
    setFormNotes('');
    setFormErrors({});
  }, []);

  const handleSubmit = useCallback(
    (e: React.FormEvent) => {
      e.preventDefault();
      const errors: Record<string, string> = {};
      if (!formYear.trim()) errors['year'] = 'Financial year is required';
      if (!formSalary || formSalary <= 0) errors['salary'] = 'Salary must be greater than zero';
      if (Object.keys(errors).length > 0) {
        setFormErrors(errors);
        return;
      }
      const newRecord: SalaryRecord = {
        id: crypto.randomUUID(),
        financialYear: formYear.trim(),
        grossSalary: Number(formSalary),
        employer: formEmployer.trim(),
        notes: formNotes.trim(),
      };
      const updated = [...records, newRecord];
      setSalaryHistory(updated);
      resetForm();
      setShowForm(false);
    },
    [formYear, formSalary, formEmployer, formNotes, records, resetForm, setSalaryHistory],
  );

  const handleDeleteRequest = useCallback((id: string) => {
    setDeletingId(id);
  }, []);

  const handleConfirmDelete = useCallback(
    (id: string) => {
      const updated = records.filter((r) => r.id !== id);
      setSalaryHistory(updated);
      setDeletingId(null);
    },
    [records, setSalaryHistory],
  );

  const handleCancelDelete = useCallback(() => {
    setDeletingId(null);
  }, []);

  if (!isLoaded) {
    return (
      <div className="p-6">
        <SalarySkeleton />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-display font-bold text-text-primary">Salary History</h2>
        <button
          type="button"
          onClick={() => { setShowForm((prev) => !prev); if (showForm) resetForm(); }}
          className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          {showForm ? 'Cancel' : 'Add Salary Record'}
        </button>
      </div>

      {/* Average growth stat */}
      {averageGrowth !== null && (
        <div className="rounded-xl p-4 bg-[var(--color-surface-card)] border border-[var(--color-border)] inline-block">
          <p className="text-text-secondary text-xs uppercase tracking-wider">Average Salary Growth</p>
          <p className={`text-lg font-display font-bold ${averageGrowth >= 0 ? 'text-accent' : 'text-red-400'}`}>
            {averageGrowth >= 0 ? '+' : ''}{averageGrowth.toFixed(1)}% per year
          </p>
        </div>
      )}

      {/* Add form */}
      {showForm && (
        <form onSubmit={handleSubmit} className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)] space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Financial Year *</label>
              <input
                type="text"
                value={formYear}
                onChange={(e) => { setFormYear(e.target.value); setFormErrors((p) => { const n = { ...p }; delete n['year']; return n; }); }}
                placeholder="2024-25"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              {formErrors['year'] && <p className="text-red-400 text-xs mt-1">{formErrors['year']}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Gross Salary *</label>
              <input
                type="number"
                value={formSalary}
                onChange={(e) => { setFormSalary(e.target.value ? Number(e.target.value) : ''); setFormErrors((p) => { const n = { ...p }; delete n['salary']; return n; }); }}
                min={0}
                placeholder="120000"
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
              {formErrors['salary'] && <p className="text-red-400 text-xs mt-1">{formErrors['salary']}</p>}
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Employer</label>
              <input
                type="text"
                value={formEmployer}
                onChange={(e) => setFormEmployer(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">Notes</label>
              <input
                type="text"
                value={formNotes}
                onChange={(e) => setFormNotes(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
            >
              Add Record
            </button>
          </div>
        </form>
      )}

      {/* Bar chart */}
      {records.length > 0 && (
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Salary Over Time</h3>
          <div className="h-64">
            <Bar data={chartData} options={chartOptions} />
          </div>
        </div>
      )}

      {/* Records list */}
      {records.length === 0 && !showForm && (
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary text-lg mb-2">No salary records yet</p>
          <p className="text-text-secondary text-sm">
            Add your salary history by financial year to track your earnings growth.
          </p>
        </div>
      )}

      <div className="space-y-3">
        {sortedRecords.map((record) => (
          <SalaryRow
            key={record.id}
            record={record}
            onDelete={handleDeleteRequest}
            deletingId={deletingId}
            onConfirmDelete={handleConfirmDelete}
            onCancelDelete={handleCancelDelete}
          />
        ))}
      </div>
    </div>
  );
}
