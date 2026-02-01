import { SQLiteDatabase } from 'expo-sqlite';
import { addAccount, addCategory, deleteCategory, getAccounts, getCategories } from '@/db/transactions';

export class ReferenceRepo {
  constructor(private db: SQLiteDatabase) {}

  async getAccounts() {
    return await getAccounts(this.db);
  }

  async getCategories() {
    return await getCategories(this.db);
  }

  async addAccount(name: string) {
    return await addAccount(this.db, name);
  }

  async addCategory(name: string) {
    return await addCategory(this.db, name);
  }

  async deleteCategory(id: number) {
    return await deleteCategory(this.db, id);
  }
}
