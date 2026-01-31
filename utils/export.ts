import { Paths, File } from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { Transaction } from '@/db/transactions';

export async function exportToCSV(transactions: Transaction[], monthLabel: string) {
  if (transactions.length === 0) {
    throw new Error('No transactions to export');
  }

  // Header
  const headers = ['Date', 'Description', 'Amount', 'Type', 'Account', 'Category'];
  
  // Rows
  const rows = transactions.map(t => [
    t.date,
    `"${t.description.replace(/"/g, '""')}"`, // Escape quotes
    t.amount,
    t.type,
    t.account || '',
    t.category || ''
  ].join(','));

  const csvString = [headers.join(','), ...rows].join('\n');
  
  const fileName = `Expenses_${monthLabel.replace(/\s+/g, '_')}.csv`;
  const file = new File(Paths.document, fileName);

  try {
    // New API in SDK 52+
    file.write(csvString);

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
