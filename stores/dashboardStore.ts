import { create } from 'zustand';
import { getCurrentMonth, addMonths } from '@/utils/format';
import { TransactionRepo } from '@/data/transactionsRepo';
import { SQLiteDatabase } from 'expo-sqlite';

interface DashboardState {
  currentMonth: string;
  summary: {
    income: number;
    expense: number;
    balance: number;
  };
  accountBalances: Array<{
    account: string;
    balance: number;
    income: number;
    expense: number;
  }>;
  isLoading: boolean;
  error: string | null;
  repo: TransactionRepo | null;
}

interface DashboardActions {
  initializeRepo: (db: SQLiteDatabase) => void;
  setMonth: (month: string) => void;
  navigateMonth: (direction: -1 | 1) => void;
  refresh: () => Promise<void>;
}

type DashboardStore = DashboardState & DashboardActions;

export const useDashboardStore = create<DashboardStore>((set, get) => ({
  currentMonth: getCurrentMonth(),
  summary: {
    income: 0,
    expense: 0,
    balance: 0,
  },
  accountBalances: [],
  isLoading: false,
  error: null,
  repo: null,

  initializeRepo: (db: SQLiteDatabase) => {
    set({ repo: new TransactionRepo(db) });
  },

  setMonth: (month: string) => {
    set({ currentMonth: month });
    get().refresh();
  },

  navigateMonth: (direction: -1 | 1) => {
    const { currentMonth } = get();
    const newDate = addMonths(new Date(currentMonth + '-01'), direction);
    const newMonth = `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, '0')}`;
    get().setMonth(newMonth);
  },

  refresh: async () => {
    const { repo, currentMonth } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const [summaryData, balancesData] = await Promise.all([
        repo.getMonthlySummary(currentMonth),
        repo.getAccountBalances(currentMonth),
      ]);
      
      set({
        summary: summaryData,
        accountBalances: balancesData,
        isLoading: false,
      });
    } catch (error) {
      set({ 
        error: error instanceof Error ? error.message : 'Failed to load dashboard data',
        isLoading: false 
      });
    }
  },
}));
