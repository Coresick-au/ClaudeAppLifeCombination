import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Doughnut } from 'react-chartjs-2';
import { formatAUD } from '@/utils/currency';
import type { Property, SalaryRecord, SuperFund, FinancialSnapshot } from '@/types/wealth.types';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, ArcElement, Title, Tooltip, Legend, Filler);

// --- localStorage helpers ---

function loadProperties(): Property[] {
  try {
    const raw = localStorage.getItem('life-os-properties');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSalary(): SalaryRecord[] {
  try {
    const raw = localStorage.getItem('life-os-salary');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSuper(): SuperFund[] {
  try {
    const raw = localStorage.getItem('life-os-super');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function loadSnapshots(): FinancialSnapshot[] {
  try {
    const raw = localStorage.getItem('life-os-snapshots');
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function saveSnapshots(snapshots: FinancialSnapshot[]): void {
  localStorage.setItem('life-os-snapshots', JSON.stringify(snapshots));
}

function formatDateAU(isoDate: string): string {
  const d = new Date(isoDate);
  const day = String(d.getDate()).padStart(2, '0');
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
}

// --- Skeleton loader ---

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="skeleton h-24 w-full rounded-xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map((n) => (
          <div key={`stat-skel-${n}`} className="skeleton h-28 rounded-xl" />
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="skeleton h-64 rounded-xl" />
        <div className="skeleton h-64 rounded-xl" />
      </div>
    </div>
  );
}

// --- Chart colour palette ---

const EQUITY_COLOURS = [
  '#C9A84C',
  '#D4B85E',
  '#8B7A3A',
  '#E8D48B',
  '#A08C42',
  '#F0E4A8',
  '#706020',
  '#BFA940',
];

// --- Main component ---

export function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [properties, setProperties] = useState<Property[]>([]);
  const [salaryRecords, setSalaryRecords] = useState<SalaryRecord[]>([]);
  const [superFunds, setSuperFunds] = useState<SuperFund[]>([]);
  const [snapshots, setSnapshots] = useState<FinancialSnapshot[]>([]);

  useEffect(() => {
    setProperties(loadProperties());
    setSalaryRecords(loadSalary());
    setSuperFunds(loadSuper());
    setSnapshots(loadSnapshots());
    setLoading(false);
  }, []);

  // Refresh data on storage events (cross-tab) and on focus (same-tab navigation)
  useEffect(() => {
    const refresh = () => {
      setProperties(loadProperties());
      setSalaryRecords(loadSalary());
      setSuperFunds(loadSuper());
      setSnapshots(loadSnapshots());
    };
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    return () => {
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  const totalSuperBalance = useMemo(
    () => superFunds.reduce((sum, f) => sum + f.balance, 0),
    [superFunds],
  );

  const totalPropertyValue = useMemo(
    () => properties.reduce((sum, p) => sum + p.currentValue, 0),
    [properties],
  );

  const totalLiabilities = useMemo(
    () => properties.reduce((sum, p) => sum + p.loanBalance, 0),
    [properties],
  );

  const totalAssets = useMemo(
    () => totalPropertyValue + totalSuperBalance,
    [totalPropertyValue, totalSuperBalance],
  );

  const netWorth = useMemo(
    () => totalAssets - totalLiabilities,
    [totalAssets, totalLiabilities],
  );

  const latestSalary = useMemo(() => {
    if (salaryRecords.length === 0) return null;
    const sorted = [...salaryRecords].sort((a, b) => b.financialYear.localeCompare(a.financialYear));
    return sorted[0] ?? null;
  }, [salaryRecords]);

  const isEmpty = useMemo(
    () => properties.length === 0 && superFunds.length === 0 && salaryRecords.length === 0,
    [properties, superFunds, salaryRecords],
  );

  // --- Doughnut chart: property equity breakdown ---
  const equityChartData = useMemo(() => {
    const activeProperties = properties.filter((p) => !p.soldDate);
    return {
      labels: activeProperties.map((p) => p.suburb ? `${p.suburb}` : p.address),
      datasets: [
        {
          data: activeProperties.map((p) => Math.max(0, p.currentValue - p.loanBalance)),
          backgroundColor: activeProperties.map((_, i) => EQUITY_COLOURS[i % EQUITY_COLOURS.length]),
          borderColor: 'rgba(0,0,0,0.3)',
          borderWidth: 1,
        },
      ],
    };
  }, [properties]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: '#8b8e96', font: { size: 12 } },
        },
        tooltip: {
          callbacks: {
            label: (ctx: { label?: string; parsed: number }) =>
              `${ctx.label}: ${formatAUD(ctx.parsed)}`,
          },
        },
      },
    }),
    [],
  );

  // --- Line chart: net worth over time ---
  const lineChartData = useMemo(() => {
    const sorted = [...snapshots].sort((a, b) => a.date.localeCompare(b.date));
    return {
      labels: sorted.map((s) => formatDateAU(s.date)),
      datasets: [
        {
          label: 'Net Worth',
          data: sorted.map((s) => s.netWorth),
          borderColor: '#C9A84C',
          backgroundColor: 'rgba(201, 168, 76, 0.1)',
          fill: true,
          tension: 0.3,
          pointRadius: 4,
          pointBackgroundColor: '#C9A84C',
        },
      ],
    };
  }, [snapshots]);

  const lineOptions = useMemo(
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

  // --- Take snapshot ---
  const handleTakeSnapshot = useCallback(() => {
    const snapshot: FinancialSnapshot = {
      date: new Date().toISOString().split('T')[0] ?? '',
      totalAssets,
      totalLiabilities,
      netWorth,
      superBalance: totalSuperBalance,
      salary: latestSalary?.grossSalary ?? 0,
      properties: properties
        .filter((p) => !p.soldDate)
        .map((p) => ({
          address: p.address,
          currentValue: p.currentValue,
          loanBalance: p.loanBalance,
          equity: p.currentValue - p.loanBalance,
        })),
    };
    const updated = [...snapshots, snapshot];
    setSnapshots(updated);
    saveSnapshots(updated);
  }, [totalAssets, totalLiabilities, netWorth, totalSuperBalance, latestSalary, properties, snapshots]);

  if (loading) {
    return (
      <div className="p-6">
        <DashboardSkeleton />
      </div>
    );
  }

  if (isEmpty) {
    return (
      <div className="p-6">
        <h2 className="text-2xl font-display font-bold text-text-primary mb-6">Financial Dashboard</h2>
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary text-lg mb-2">No financial data yet</p>
          <p className="text-text-secondary text-sm">
            Add properties, salary records, or super funds to see your wealth overview here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h2 className="text-2xl font-display font-bold text-text-primary">Financial Dashboard</h2>
        <button
          type="button"
          onClick={handleTakeSnapshot}
          className="px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          Take Snapshot
        </button>
      </div>

      {/* Hero net worth */}
      <div className="rounded-xl p-6 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
        <p className="text-text-secondary text-sm uppercase tracking-wider mb-1">Net Worth</p>
        <p className="text-4xl md:text-5xl font-display font-bold text-accent">{formatAUD(netWorth)}</p>
        <div className="flex justify-center gap-8 mt-4 text-sm">
          <div>
            <span className="text-text-secondary">Assets: </span>
            <span className="text-text-primary font-semibold">{formatAUD(totalAssets)}</span>
          </div>
          <div>
            <span className="text-text-secondary">Liabilities: </span>
            <span className="text-text-primary font-semibold">{formatAUD(totalLiabilities)}</span>
          </div>
        </div>
      </div>

      {/* Quick stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Properties</p>
          <p className="text-2xl font-display font-bold text-text-primary">
            {properties.filter((p) => !p.soldDate).length}
          </p>
          <p className="text-text-secondary text-sm mt-1">
            Total value: {formatAUD(totalPropertyValue)}
          </p>
        </div>
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Super Balance</p>
          <p className="text-2xl font-display font-bold text-text-primary">{formatAUD(totalSuperBalance)}</p>
          <p className="text-text-secondary text-sm mt-1">
            {superFunds.length} fund{superFunds.length !== 1 ? 's' : ''}
          </p>
        </div>
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Latest Salary</p>
          <p className="text-2xl font-display font-bold text-text-primary">
            {latestSalary ? formatAUD(latestSalary.grossSalary) : 'N/A'}
          </p>
          {latestSalary && (
            <p className="text-text-secondary text-sm mt-1">
              FY {latestSalary.financialYear} &middot; {latestSalary.employer}
            </p>
          )}
        </div>
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Equity doughnut */}
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Property Equity</h3>
          {properties.filter((p) => !p.soldDate).length > 0 ? (
            <div className="h-64">
              <Doughnut data={equityChartData} options={doughnutOptions} />
            </div>
          ) : (
            <p className="text-text-secondary text-sm">No active properties to display.</p>
          )}
        </div>

        {/* Net worth line */}
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Net Worth Over Time</h3>
          {snapshots.length > 1 ? (
            <div className="h-64">
              <Line data={lineChartData} options={lineOptions} />
            </div>
          ) : (
            <p className="text-text-secondary text-sm">
              Take at least two snapshots to see your net worth trend.
            </p>
          )}
        </div>
      </div>

      {/* Snapshot history */}
      {snapshots.length > 0 && (
        <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
          <h3 className="text-lg font-display font-semibold text-text-primary mb-3">Snapshot History</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-text-secondary text-left border-b border-[var(--color-border)]">
                  <th className="pb-2 pr-4">Date</th>
                  <th className="pb-2 pr-4">Net Worth</th>
                  <th className="pb-2 pr-4">Assets</th>
                  <th className="pb-2 pr-4">Liabilities</th>
                  <th className="pb-2">Super</th>
                </tr>
              </thead>
              <tbody>
                {[...snapshots]
                  .sort((a, b) => b.date.localeCompare(a.date))
                  .map((s) => (
                    <tr key={s.date} className="border-b border-[var(--color-border)] last:border-0">
                      <td className="py-2 pr-4 text-text-primary">{formatDateAU(s.date)}</td>
                      <td className="py-2 pr-4 text-accent font-semibold">{formatAUD(s.netWorth)}</td>
                      <td className="py-2 pr-4 text-text-primary">{formatAUD(s.totalAssets)}</td>
                      <td className="py-2 pr-4 text-text-primary">{formatAUD(s.totalLiabilities)}</td>
                      <td className="py-2 text-text-primary">{formatAUD(s.superBalance)}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
