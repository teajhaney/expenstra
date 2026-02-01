import { ReferenceRepo } from '@/data/referenceRepo';
import { SQLiteDatabase } from 'expo-sqlite';
import { create } from 'zustand';

interface ReferenceState {
  accounts: { id: number; name: string }[];
  categories: { id: number; name: string }[];
  isLoading: boolean;
  error: string | null;
  repo: ReferenceRepo | null;
}

interface ReferenceActions {
  initializeRepo: (db: SQLiteDatabase) => void;
  loadAccounts: () => Promise<void>;
  loadCategories: () => Promise<void>;
  addAccount: (name: string) => Promise<void>;
  addCategory: (name: string) => Promise<void>;
  deleteCategory: (id: number) => Promise<void>;
  refresh: () => Promise<void>;
}

type ReferenceStore = ReferenceState & ReferenceActions;

export const useReferenceStore = create<ReferenceStore>((set, get) => ({
  accounts: [],
  categories: [],
  isLoading: false,
  error: null,
  repo: null,

  initializeRepo: (db: SQLiteDatabase) => {
    set({ repo: new ReferenceRepo(db) });
  },

  loadAccounts: async () => {
    const { repo } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const accounts = await repo.getAccounts();
      set({ accounts, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load accounts',
        isLoading: false,
      });
    }
  },

  loadCategories: async () => {
    const { repo } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    set({ isLoading: true, error: null });
    try {
      const categories = await repo.getCategories();
      set({ categories, isLoading: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to load categories',
        isLoading: false,
      });
    }
  },

  addAccount: async (name: string) => {
    const { repo } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    try {
      await repo.addAccount(name);
      // Reload accounts to get the updated list
      await get().loadAccounts();
    } catch (error) {
      set({
        error: error instanceof Error ? error.message : 'Failed to add account',
      });
    }
  },

  addCategory: async (name: string) => {
    const { repo } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    try {
      await repo.addCategory(name);
      // Reload categories to get the updated list
      await get().loadCategories();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to add category',
      });
    }
  },

  deleteCategory: async (id: number) => {
    const { repo } = get();
    if (!repo) {
      set({ error: 'Repository not initialized' });
      return;
    }

    try {
      await repo.deleteCategory(id);
      // Reload categories to get the updated list
      await get().loadCategories();
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : 'Failed to delete category',
      });
    }
  },

  refresh: async () => {
    await Promise.all([get().loadAccounts(), get().loadCategories()]);
  },
}));
