import { Transaction } from '@/db/transactions';
import { formatMonthDisplayName } from '@/utils/format';
import { File, Paths } from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface ExportSummary {
  totalIncome: number;
  totalExpense: number;
  balance: number;
  transactionCount: number;
}

export async function exportToCSV(
  transactions: Transaction[],
  monthLabel: string,
  isAllTime: boolean = false
) {
  if (transactions.length === 0) {
    throw new Error('No transactions to export');
  }

  // Calculate summary
  const summary = calculateSummary(transactions);

  // Generate CSV content
  let csvContent = '';

  if (isAllTime) {
    csvContent = generateAllTimeCSV(transactions, summary);
  } else {
    csvContent = generateMonthlyCSV(transactions, monthLabel, summary);
  }

  const fileName = isAllTime
    ? `Expense_Tracker_All_Time_${new Date().toISOString().split('T')[0]}.csv`
    : `Expense_Tracker_${monthLabel.replace(/\s+/g, '_')}.csv`;

  const file = new File(Paths.document, fileName);

  try {
    file.write(csvContent);

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(file.uri);
    } else {
      throw new Error('Sharing is not available on this device');
    }
  } catch (error) {
    console.error('Export Error:', error);
    throw error;
  }
}

function calculateSummary(transactions: Transaction[]): ExportSummary {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    transactionCount: transactions.length,
  };
}

function generateMonthlyCSV(
  transactions: Transaction[],
  monthLabel: string,
  summary: ExportSummary
): string {
  const headers = [
    'Date',
    'Description',
    'Amount',
    'Type',
    'Account',
    'Category',
  ];

  // Title and summary section
  const titleSection = [
    `EXPENSE TRACKER - ${monthLabel.toUpperCase()}`,
    '',
    'SUMMARY',
    `Total Income,${summary.totalIncome}`,
    `Total Expense,${summary.totalExpense}`,
    `Current Balance,${summary.balance}`,
    `Transaction Count,${summary.transactionCount}`,
    '',
    'TRANSACTIONS',
    headers.join(','),
  ];

  // Transaction rows - separate income and expenses for better organization
  const incomeTransactions = transactions.filter(t => t.type === 'income');
  const expenseTransactions = transactions.filter(t => t.type === 'expense');

  const rows = [
    '',
    'INCOME TRANSACTIONS',
    headers.join(','),
    ...incomeTransactions.map(t =>
      [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
        t.amount,
        t.type,
        t.account || '',
        t.category || '',
      ].join(',')
    ),
    '',
    'EXPENSE TRANSACTIONS',
    headers.join(','),
    ...expenseTransactions.map(t =>
      [
        t.date,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount,
        t.type,
        t.account || '',
        t.category || '',
      ].join(',')
    ),
  ];

  return [...titleSection, ...rows].join('\n');
}

function generateAllTimeCSV(
  transactions: Transaction[],
  summary: ExportSummary
): string {
  // Group transactions by month and year
  const groupedTransactions = groupTransactionsByMonth(transactions);

  const headers = [
    'Date',
    'Description',
    'Amount',
    'Type',
    'Account',
    'Category',
  ];

  let csvContent = [
    'EXPENSE TRACKER - ALL TIME DATA',
    '',
    'OVERALL SUMMARY',
    `Total Income,${summary.totalIncome}`,
    `Total Expense,${summary.totalExpense}`,
    `Current Balance,${summary.balance}`,
    `Transaction Count,${summary.transactionCount}`,
    '',
  ];

  // Add monthly sections
  Object.entries(groupedTransactions).forEach(
    ([monthKey, monthTransactions]) => {
      const monthSummary = calculateSummary(monthTransactions);
      const [year, month] = monthKey.split('-');
      const monthName = formatMonthDisplayName(`${year}-${month}`);

      // Separate income and expenses for this month
      const monthIncome = monthTransactions.filter(t => t.type === 'income');
      const monthExpenses = monthTransactions.filter(t => t.type === 'expense');

      csvContent.push(
        `${monthName.toUpperCase()} (${year})`,
        '',
        'MONTHLY SUMMARY',
        `Income,${monthSummary.totalIncome}`,
        `Expense,${monthSummary.totalExpense}`,
        `Balance,${monthSummary.balance}`,
        `Transactions,${monthTransactions.length}`,
        '',
        'INCOME TRANSACTIONS',
        headers.join(',')
      );

      // Add income transaction rows for this month
      if (monthIncome.length > 0) {
        const incomeRows = monthIncome.map(t =>
          [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.amount,
            t.type,
            t.account || '',
            t.category || '',
          ].join(',')
        );
        csvContent.push(...incomeRows);
      }

      csvContent.push('', 'EXPENSE TRANSACTIONS', headers.join(','));

      // Add expense transaction rows for this month
      if (monthExpenses.length > 0) {
        const expenseRows = monthExpenses.map(t =>
          [
            t.date,
            `"${t.description.replace(/"/g, '""')}"`,
            t.amount,
            t.type,
            t.account || '',
            t.category || '',
          ].join(',')
        );
        csvContent.push(...expenseRows);
      }

      csvContent.push('');
    }
  );

  return csvContent.join('\n');
}

function groupTransactionsByMonth(
  transactions: Transaction[]
): Record<string, Transaction[]> {
  return transactions.reduce(
    (groups, transaction) => {
      const monthKey = transaction.date.substring(0, 7); // YYYY-MM
      if (!groups[monthKey]) {
        groups[monthKey] = [];
      }
      groups[monthKey].push(transaction);
      return groups;
    },
    {} as Record<string, Transaction[]>
  );
}
