export interface Property {
  id: string;
  address: string;
  suburb: string;
  state: string;
  postcode: string;
  type: string;
  currentValue: number;
  purchasePrice: number;
  purchaseDate: string;
  loanBalance: number;
  lender: string;
  interestRate: number;
  ownershipSplit: string;
  weeklyRent: number;
  isManaged: boolean;
  isPPOR: boolean;
  soldDate?: string;
  soldPrice?: number;
  notes: string;
}

export interface FinancialSnapshot {
  date: string;
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  superBalance: number;
  salary: number;
  properties: PropertySummary[];
}

export interface PropertySummary {
  address: string;
  currentValue: number;
  loanBalance: number;
  equity: number;
}

export interface SalaryRecord {
  id: string;
  financialYear: string;
  grossSalary: number;
  employer: string;
  notes: string;
}

export interface SuperFund {
  id: string;
  fundName: string;
  balance: number;
  insuranceCover: string;
  lastUpdated: string;
}
