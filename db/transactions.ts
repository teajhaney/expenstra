import { SQLiteDatabase } from 'expo-sqlite';

export type Transaction = {
  id: number;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
  account?: string;
  category?: string;
};

export async function addTransaction(
  db: SQLiteDatabase,
  transaction: Omit<Transaction, 'id'>
) {
  return await db.runAsync(
    'INSERT INTO transactions (date, description, amount, type, account, category) VALUES (?, ?, ?, ?, ?, ?)',
    [
      transaction.date,
      transaction.description,
      transaction.amount,
      transaction.type,
      transaction.account ?? null,
      transaction.category ?? null,
    ]
  );
}

export async function getTransactionsByMonth(
  db: SQLiteDatabase,
  month: string
) {
  // month format: YYYY-MM
  return await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions WHERE date LIKE ? ORDER BY date DESC, id DESC',
    [`${month}%`]
  );
}

export async function getMonthlySummary(db: SQLiteDatabase, month: string) {
  const result = await db.getFirstAsync<{
    total_income: number;
    total_expense: number;
  }>(
    `SELECT 
      SUM(CASE WHEN LOWER(type) = 'income' THEN CAST(amount AS REAL) ELSE 0 END) as total_income,
      SUM(CASE WHEN LOWER(type) = 'expense' THEN CAST(amount AS REAL) ELSE 0 END) as total_expense
     FROM transactions 
     WHERE date LIKE ?`,
    [`${month}%`]
  );

  return {
    income: result?.total_income ?? 0,
    expense: result?.total_expense ?? 0,
    balance: (result?.total_income ?? 0) - (result?.total_expense ?? 0),
  };
}

export async function deleteTransaction(db: SQLiteDatabase, id: number) {
  return await db.runAsync('DELETE FROM transactions WHERE id = ?', [id]);
}

export async function getAllTransactions(db: SQLiteDatabase) {
  return await db.getAllAsync<Transaction>(
    'SELECT * FROM transactions ORDER BY date DESC, id DESC'
  );
}

export async function getAccountBalances(db: SQLiteDatabase, month?: string) {
  // If month is provided, we filter In/Out by that month, but Balance remains all-time.
  // If no month provided, it defaults to all-time stats for everything.

  const monthFilter = month ? `AND date LIKE '${month}%'` : '';

  const results = await db.getAllAsync<{
    account: string;
    balance: number;
    income: number;
    expense: number;
  }>(
    `SELECT 
      account,
      SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance,
      SUM(CASE WHEN type = 'income' ${monthFilter} THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' ${monthFilter} THEN amount ELSE 0 END) as expense
     FROM transactions 
     GROUP BY account
     HAVING balance != 0 OR income != 0 OR expense != 0
     ORDER BY balance DESC`
  );

  // If no results, return default account with 0 values
  if (results.length === 0) {
    return [{ account: 'Cash', balance: 0, income: 0, expense: 0 }];
  }

  return results;
}

export async function getBalanceByAccount(db: SQLiteDatabase, account: string) {
  const result = await db.getFirstAsync<{ balance: number }>(
    `SELECT SUM(CASE WHEN type = 'income' THEN amount ELSE -amount END) as balance 
     FROM transactions 
     WHERE account = ?`,
    [account]
  );
  return result?.balance ?? 0;
}

export async function getArchiveHistory(db: SQLiteDatabase) {
  return await db.getAllAsync<{
    month: string;
    income: number;
    expense: number;
  }>(
    `SELECT 
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense
     FROM transactions 
     GROUP BY month
     ORDER BY month DESC`
  );
}

export async function getCategories(db: SQLiteDatabase) {
  return await db.getAllAsync<{ id: number; name: string }>(
    'SELECT * FROM categories ORDER BY name ASC'
  );
}

export async function addCategory(db: SQLiteDatabase, name: string) {
  return await db.runAsync(
    'INSERT OR IGNORE INTO categories (name) VALUES (?)',
    [name]
  );
}

export async function deleteCategory(db: SQLiteDatabase, id: number) {
  return await db.runAsync('DELETE FROM categories WHERE id = ?', [id]);
}

export async function getAccounts(db: SQLiteDatabase) {
  return await db.getAllAsync<{ id: number; name: string }>(
    'SELECT * FROM accounts ORDER BY id ASC'
  );
}

export async function addAccount(db: SQLiteDatabase, name: string) {
  return await db.runAsync('INSERT OR IGNORE INTO accounts (name) VALUES (?)', [
    name,
  ]);
}

export async function getExpensesByCategory(db: SQLiteDatabase, month: string) {
  const result = await db.getAllAsync<{
    category: string;
    total: number;
  }>(
    `SELECT 
      category,
      SUM(amount) as total
     FROM transactions 
     WHERE type = 'expense' AND date LIKE ?
     GROUP BY category
     ORDER BY total DESC`,
    [`${month}%`]
  );
  return result;
}

export async function getLast6MonthsTrend(db: SQLiteDatabase) {
  return await db.getAllAsync<{
    month: string;
    income: number;
    expense: number;
    label: string;
  }>(
    `SELECT 
      strftime('%Y-%m', date) as month,
      SUM(CASE WHEN type = 'income' THEN amount ELSE 0 END) as income,
      SUM(CASE WHEN type = 'expense' THEN amount ELSE 0 END) as expense,
      CASE strftime('%m', date)
        WHEN '01' THEN 'Jan'
        WHEN '02' THEN 'Feb'
        WHEN '03' THEN 'Mar'
        WHEN '04' THEN 'Apr'
        WHEN '05' THEN 'May'
        WHEN '06' THEN 'Jun'
        WHEN '07' THEN 'Jul'
        WHEN '08' THEN 'Aug'
        WHEN '09' THEN 'Sep'
        WHEN '10' THEN 'Oct'
        WHEN '11' THEN 'Nov'
        WHEN '12' THEN 'Dec'
      END as label
     FROM transactions 
     WHERE date >= date('now', '-5 months', 'start of month')
     GROUP BY month
     ORDER BY month ASC`
  );
}

export async function deleteTransactionsByMonth(
  db: SQLiteDatabase,
  month: string
) {
  return await db.runAsync('DELETE FROM transactions WHERE date LIKE ?', [
    `${month}%`,
  ]);
}

export async function deleteAllTransactions(db: SQLiteDatabase) {
  return await db.runAsync('DELETE FROM transactions');
}
