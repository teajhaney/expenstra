import {
  addTransaction,
  deleteTransaction,
  getAccountBalances,
  getArchiveHistory,
  getMonthlySummary,
  getTransactionsByMonth,
  Transaction,
} from '@/db/transactions';
import { SQLiteDatabase } from 'expo-sqlite';

export class TransactionRepo {
  constructor(private db: SQLiteDatabase) {}

  async getTransactionsByMonth(month: string) {
    return await getTransactionsByMonth(this.db, month);
  }

  async getMonthlySummary(month: string) {
    return await getMonthlySummary(this.db, month);
  }

  async getAccountBalances(month: string) {
    return await getAccountBalances(this.db, month);
  }

  async getArchiveHistory() {
    return await getArchiveHistory(this.db);
  }

  async addTransaction(transaction: Omit<Transaction, 'id'>) {
    return await addTransaction(this.db, transaction);
  }

  async deleteTransaction(id: number) {
    return await deleteTransaction(this.db, id);
  }
}
