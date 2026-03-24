import { useState, useMemo, useCallback, memo } from 'react';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';
import { Doughnut } from 'react-chartjs-2';
import { formatAUD } from '@/utils/currency';

ChartJS.register(ArcElement, Tooltip, Legend);

// --- Types ---

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
}

interface CategorySummary {
  category: string;
  total: number;
  percentage: number;
  count: number;
}

// --- Auto-categorisation rules ---

const CATEGORY_RULES: Array<{ pattern: RegExp; category: string }> = [
  // Groceries
  { pattern: /woolworths|woolies|coles|aldi|iga|harris farm|foodworks/i, category: 'Groceries' },
  // Fuel
  { pattern: /shell|bp|caltex|ampol|7-eleven fuel|united petroleum|liberty oil/i, category: 'Fuel' },
  // Dining
  { pattern: /mcdonald|kfc|hungry jack|domino|uber eats|deliveroo|doordash|menulog|cafe|restaurant|pizza|sushi|thai|burger/i, category: 'Dining Out' },
  // Transport
  { pattern: /uber trip|didi|ola|translink|go card|opal|myki|taxi/i, category: 'Transport' },
  // Utilities
  { pattern: /origin energy|agl|energex|ergon|telstra|optus|vodafone|nbn|iinet|tpg|electricity|gas bill|water bill/i, category: 'Utilities' },
  // Insurance
  { pattern: /suncorp|nrma|racq|allianz|bupa|medibank|hbf|hcf|insurance/i, category: 'Insurance' },
  // Health
  { pattern: /pharmacy|chemist warehouse|priceline pharmacy|doctor|medical|dental|physio|optometrist|pathology/i, category: 'Health' },
  // Entertainment
  { pattern: /netflix|spotify|disney|stan|amazon prime|apple music|youtube|cinema|event cinemas|hoyts/i, category: 'Entertainment' },
  // Shopping
  { pattern: /kmart|target|big w|bunnings|officeworks|jb hi-fi|harvey norman|ikea|amazon/i, category: 'Shopping' },
  // Rent / Mortgage
  { pattern: /rent|mortgage|home loan|loan repayment/i, category: 'Housing' },
  // Transfer / Savings
  { pattern: /transfer|savings|investment|shares|etf|vanguard|betashares/i, category: 'Transfers & Savings' },
  // Income
  { pattern: /salary|wages|pay|dividend|interest earned|tax refund|centrelink/i, category: 'Income' },
  // Subscriptions
  { pattern: /gym|fitness|anytime fitness|f45|crossfit|subscription/i, category: 'Subscriptions' },
];

function categoriseTransaction(description: string): string {
  for (const rule of CATEGORY_RULES) {
    if (rule.pattern.test(description)) {
      return rule.category;
    }
  }
  return 'Other';
}

// --- CSV parsing ---

function parseCSV(text: string): Transaction[] {
  const lines = text.split('\n').map((l) => l.trim()).filter((l) => l.length > 0);
  if (lines.length < 2) return [];

  // Try to detect header row
  const header = lines[0]?.toLowerCase() ?? '';
  const hasHeader = header.includes('date') || header.includes('description') || header.includes('amount');
  const dataLines = hasHeader ? lines.slice(1) : lines;

  const transactions: Transaction[] = [];

  for (const line of dataLines) {
    // Handle quoted CSV fields
    const fields = parseCSVLine(line);
    if (fields.length < 3) continue;

    const dateField = fields[0]?.trim() ?? '';
    const descField = fields[1]?.trim() ?? '';
    const amountField = fields[2]?.trim().replace(/[$ ,]/g, '') ?? '';

    const amount = parseFloat(amountField);
    if (isNaN(amount)) continue;

    // Try to parse various date formats
    const parsedDate = parseDate(dateField);
    if (!parsedDate) continue;

    transactions.push({
      id: `txn-${parsedDate}-${transactions.length}-${Math.random().toString(36).slice(2, 7)}`,
      date: parsedDate,
      description: descField,
      amount,
      category: categoriseTransaction(descField),
    });
  }

  return transactions;
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === ',' && !inQuotes) {
      fields.push(current);
      current = '';
    } else {
      current += char;
    }
  }
  fields.push(current);
  return fields;
}

function parseDate(dateStr: string): string | null {
  // Try dd/mm/yyyy
  const auMatch = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(dateStr);
  if (auMatch) {
    const [, day, month, year] = auMatch;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Try yyyy-mm-dd
  const isoMatch = /^(\d{4})-(\d{1,2})-(\d{1,2})$/.exec(dateStr);
  if (isoMatch) {
    const [, year, month, day] = isoMatch;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  // Try dd-mm-yyyy
  const dashMatch = /^(\d{1,2})-(\d{1,2})-(\d{4})$/.exec(dateStr);
  if (dashMatch) {
    const [, day, month, year] = dashMatch;
    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  return null;
}

// --- Chart colours ---

const CATEGORY_COLOURS = [
  '#C9A84C', '#E8D48B', '#8B7A3A', '#D4B85E', '#A08C42',
  '#F0E4A8', '#706020', '#BFA940', '#9B8B4A', '#CFBD6E',
  '#5C5020', '#E0C868', '#786830', '#B8A050', '#A89848',
];

// --- Category row ---

interface CategoryRowProps {
  summary: CategorySummary;
}

const CategoryRow = memo(function CategoryRow({ summary }: CategoryRowProps) {
  return (
    <tr className="border-b border-[var(--color-border)] last:border-0">
      <td className="py-2 pr-4 text-text-primary font-medium">{summary.category}</td>
      <td className="py-2 pr-4 text-accent font-semibold">{formatAUD(Math.abs(summary.total))}</td>
      <td className="py-2 pr-4 text-text-secondary">{summary.count}</td>
      <td className="py-2 text-text-secondary">{summary.percentage.toFixed(1)}%</td>
    </tr>
  );
});

// --- Main component ---

export function SpendingAnalysis() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [parseError, setParseError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFileUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParseError(null);
    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text !== 'string') {
        setParseError('Could not read the file contents.');
        return;
      }
      const parsed = parseCSV(text);
      if (parsed.length === 0) {
        setParseError('No valid transactions found. Expected CSV with columns: Date, Description, Amount.');
        return;
      }
      setTransactions(parsed);

      // Auto-set date range
      const dates = parsed.map((t) => t.date).sort();
      setDateFrom(dates[0] ?? '');
      setDateTo(dates[dates.length - 1] ?? '');
    };
    reader.onerror = () => {
      setParseError('Failed to read the file. Please try again.');
    };
    reader.readAsText(file);

    // Reset input so same file can be re-uploaded
    e.target.value = '';
  }, []);

  const filteredTransactions = useMemo(() => {
    return transactions.filter((t) => {
      if (dateFrom && t.date < dateFrom) return false;
      if (dateTo && t.date > dateTo) return false;
      return true;
    });
  }, [transactions, dateFrom, dateTo]);

  // Only expenses (negative amounts)
  const expenses = useMemo(
    () => filteredTransactions.filter((t) => t.amount < 0),
    [filteredTransactions],
  );

  const income = useMemo(
    () => filteredTransactions.filter((t) => t.amount > 0),
    [filteredTransactions],
  );

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, t) => sum + Math.abs(t.amount), 0),
    [expenses],
  );

  const totalIncome = useMemo(
    () => income.reduce((sum, t) => sum + t.amount, 0),
    [income],
  );

  const categorySummaries = useMemo(() => {
    const map = new Map<string, { total: number; count: number }>();
    for (const txn of expenses) {
      const existing = map.get(txn.category) ?? { total: 0, count: 0 };
      existing.total += Math.abs(txn.amount);
      existing.count += 1;
      map.set(txn.category, existing);
    }

    const summaries: CategorySummary[] = [];
    for (const [category, data] of map) {
      summaries.push({
        category,
        total: data.total,
        percentage: totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0,
        count: data.count,
      });
    }

    return summaries.sort((a, b) => b.total - a.total);
  }, [expenses, totalExpenses]);

  const doughnutData = useMemo(() => ({
    labels: categorySummaries.map((s) => s.category),
    datasets: [
      {
        data: categorySummaries.map((s) => s.total),
        backgroundColor: categorySummaries.map((_, i) => CATEGORY_COLOURS[i % CATEGORY_COLOURS.length]),
        borderColor: 'rgba(0,0,0,0.3)',
        borderWidth: 1,
      },
    ],
  }), [categorySummaries]);

  const doughnutOptions = useMemo(
    () => ({
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom' as const,
          labels: { color: '#8b8e96', font: { size: 11 }, padding: 12 },
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

  const hasData = transactions.length > 0;

  return (
    <div className="p-6 space-y-6">
      <h2 className="text-2xl font-display font-bold text-text-primary">Spending Analysis</h2>

      {/* File upload area */}
      <div className="rounded-xl p-6 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
        <p className="text-text-secondary text-sm mb-3">
          Upload a bank statement CSV with columns: <span className="text-text-primary font-medium">Date, Description, Amount</span>.
          Negative amounts are treated as expenses, positive as income.
        </p>
        <label className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-accent text-[#0f1117] font-semibold text-sm hover:bg-accent-hover transition-colors cursor-pointer">
          <span>{hasData ? 'Upload New CSV' : 'Upload CSV'}</span>
          <input
            type="file"
            accept=".csv,text/csv"
            onChange={handleFileUpload}
            className="sr-only"
          />
        </label>
        {fileName && (
          <span className="ml-3 text-text-secondary text-sm">
            {fileName} &middot; {transactions.length} transaction{transactions.length !== 1 ? 's' : ''} loaded
          </span>
        )}
        {parseError && (
          <p className="text-red-400 text-sm mt-2">{parseError}</p>
        )}
      </div>

      {/* Empty state */}
      {!hasData && !parseError && (
        <div className="rounded-xl p-8 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
          <p className="text-text-secondary text-lg mb-2">No spending data loaded</p>
          <p className="text-text-secondary text-sm">
            Upload a CSV from your bank to analyse your spending by category.
          </p>
        </div>
      )}

      {/* Date range filter + summary */}
      {hasData && (
        <>
          <div className="flex items-end gap-4 flex-wrap">
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">From</label>
              <input
                type="date"
                value={dateFrom}
                onChange={(e) => setDateFrom(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="block text-text-secondary text-xs uppercase tracking-wider mb-1">To</label>
              <input
                type="date"
                value={dateTo}
                onChange={(e) => setDateTo(e.target.value)}
                className="px-3 py-2 rounded-lg bg-[var(--color-input-bg)] border border-[var(--color-input-border)] text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <p className="text-text-secondary text-sm pb-2">
              Showing {filteredTransactions.length} of {transactions.length} transactions
            </p>
          </div>

          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Total Expenses</p>
              <p className="text-2xl font-display font-bold text-red-400">{formatAUD(totalExpenses)}</p>
              <p className="text-text-secondary text-sm mt-1">{expenses.length} transactions</p>
            </div>
            <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Total Income</p>
              <p className="text-2xl font-display font-bold text-green-400">{formatAUD(totalIncome)}</p>
              <p className="text-text-secondary text-sm mt-1">{income.length} transactions</p>
            </div>
            <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
              <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">Net Cash Flow</p>
              <p className={`text-2xl font-display font-bold ${totalIncome - totalExpenses >= 0 ? 'text-accent' : 'text-red-400'}`}>
                {formatAUD(totalIncome - totalExpenses)}
              </p>
            </div>
          </div>

          {/* Chart + table row */}
          {categorySummaries.length > 0 && (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Doughnut chart */}
              <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Spending by Category</h3>
                <div className="h-72">
                  <Doughnut data={doughnutData} options={doughnutOptions} />
                </div>
              </div>

              {/* Category table */}
              <div className="rounded-xl p-5 bg-[var(--color-surface-card)] border border-[var(--color-border)]">
                <h3 className="text-lg font-display font-semibold text-text-primary mb-4">Category Breakdown</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-text-secondary text-left border-b border-[var(--color-border)]">
                        <th className="pb-2 pr-4">Category</th>
                        <th className="pb-2 pr-4">Total Spent</th>
                        <th className="pb-2 pr-4">Count</th>
                        <th className="pb-2">% of Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categorySummaries.map((summary) => (
                        <CategoryRow key={summary.category} summary={summary} />
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="border-t border-[var(--color-border)] font-semibold">
                        <td className="pt-2 pr-4 text-text-primary">Total</td>
                        <td className="pt-2 pr-4 text-accent">{formatAUD(totalExpenses)}</td>
                        <td className="pt-2 pr-4 text-text-secondary">{expenses.length}</td>
                        <td className="pt-2 text-text-secondary">100%</td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* No expenses in range */}
          {categorySummaries.length === 0 && filteredTransactions.length > 0 && (
            <div className="rounded-xl p-6 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
              <p className="text-text-secondary">No expenses found in the selected date range. Only income transactions present.</p>
            </div>
          )}

          {filteredTransactions.length === 0 && (
            <div className="rounded-xl p-6 bg-[var(--color-surface-card)] border border-[var(--color-border)] text-center">
              <p className="text-text-secondary">No transactions match the selected date range. Try adjusting the filters.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
