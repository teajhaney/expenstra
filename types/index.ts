// Shared type definitions for the expense tracker app

export interface MonthlySummary {
  income: number;
  expense: number;
  balance: number;
}

export interface AccountBalance {
  account: string;
  balance: number;
  income: number;
  expense: number;
}

export interface Transaction {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string;
  category?: string;
}

export interface Category {
  id: number;
  name: string;
}

export interface Account {
  id: number;
  name: string;
}
