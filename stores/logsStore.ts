import { TransactionRepo } from '@/data/transactionsRepo';
import { Transaction } from '@/db/transactions';
import { getCurrentMonth } from '@/utils/format';
import { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

type ViewMode = 'records' | 'history';

interface LogsState {
  selectedMonth: string;
  viewMode: ViewMode;
  transactions: Transaction[];
  history: Array<{
    month: string;
    income: number;
    expense: number;
  }>;
  isLoading: boolean;
  error: string | null;
  repo: TransactionRepo | null;
}

interface LogsActions {
  initializeRepo: (db: SQLiteDatabase) => void;
  setViewMode: (mode: ViewMode) => void;
  setSelectedMonth: (month: string) => void;
  refresh: () => Promise<void>;
  deleteTransaction: (id: number) => Promise<void>;
}

type LogsStore = LogsState & LogsActions;

export const useLogsStore = create<LogsStore>((set, get) => ({
  selectedMonth: getCurrentMonth(),
  viewMode: 'records',
  transactions: [],
  history: [],
  isLoading: false,
  error: null,
  repo: null,

  initializeRepo: (db: SQLiteDatabase) => {
    set({ repo: new TransactionRepo(db) });
  },

  setViewMode: (mode: ViewMode) => {
    set({ viewMode: mode });
    get().refresh();
  },

  setSelectedMonth: (month: string) => {
    set({ selectedMonth: month });
    get().refresh();
  },

  refresh: async () => {
    const { repo, viewMode, selectedMonth } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      if (viewMode === 'records') {
        const transactions = await repo.getTransactionsByMonth(selectedMonth);
        set({ transactions, isLoading: false });
      } else {
        const history = await repo.getArchiveHistory();
        set({ history, isLoading: false });
      }
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load logs data',
        isLoading: false,
      });
    }
  },

  deleteTransaction: async (id: number) => {
    const { repo } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    try {
      await repo.deleteTransaction(id);
      // Refresh the current view
      await get().refresh();
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : 'Failed to delete transaction',
      });
    }
  },
}));
