import {
  deleteTransaction,
  getArchiveHistory,
  getTransactionsByMonth,
  Transaction,
} from '@/db/transactions';
import {
  formatMonthDisplayName,
  formatNaira,
  getCurrentMonth,
} from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type ViewMode = 'records' | 'history';

const TAB_BAR_HEIGHT = 60;

export default function LogsScreen() {
  const db = useSQLiteContext();
  const [viewMode, setViewMode] = useState<ViewMode>('records');
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [history, setHistory] = useState<
    { month: string; income: number; expense: number }[]
  >([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const fetchData = useCallback(async () => {
    if (viewMode === 'records') {
      const data = await getTransactionsByMonth(db, selectedMonth);
      setTransactions(data);
    } else {
      const data = await getArchiveHistory(db);
      setHistory(data);
    }
  }, [db, selectedMonth, viewMode]);

  useFocusEffect(
    useCallback(() => {
      fetchData();
    }, [fetchData])
  );

  const totals = useMemo(() => {
    let income = 0;
    let expense = 0;
    transactions.forEach(t => {
      if (t.type === 'income') income += t.amount;
      else expense += t.amount;
    });
    return { income, expense, balance: income - expense };
  }, [transactions]);

  const handleDelete = (id: number) => {
    Alert.alert('Delete Record', 'Move to trash?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteTransaction(db, id);
          fetchData();
        },
      },
    ]);
  };

  const renderRecordsHeader = () => (
    <View className="flex-row bg-slate-900 border-b border-white/10 px-2 py-3 rounded-t-xl mb-1">
      <Text className="text-slate-500 text-[10px] font-bold uppercase flex-[0.8]">
        Date
      </Text>
      <Text className="text-slate-500 text-[10px] font-bold uppercase flex-[1.5]">
        Item / Cat
      </Text>
      <Text className="text-slate-500 text-[10px] font-bold uppercase flex-[1]">
        Source
      </Text>
      <Text className="text-slate-500 text-[10px] font-bold uppercase flex-[1.2] text-right">
        Amount
      </Text>
    </View>
  );

  // Group transactions by date for the "middle row" separators
  const dataWithSeparators = useMemo(() => {
    const result: ListItem[] = [];
    let lastDate = '';

    // Sort transactions by date descending (already done by query, but ensure)
    const sorted = [...transactions].sort((a, b) =>
      b.date.localeCompare(a.date)
    );

    sorted.forEach(item => {
      if (item.date !== lastDate) {
        const dateParts = item.date.split('-');
        const displayDate = `${dateParts[2]} ${new Date(parseInt(dateParts[0]), parseInt(dateParts[1]) - 1, parseInt(dateParts[2])).toLocaleString('default', { month: 'short' })}`;
        result.push({ isSeparator: true, date: displayDate });
        lastDate = item.date;
      }
      result.push(item);
    });
    return result;
  }, [transactions]);

  type Separator = { isSeparator: true; date: string };
  type ListItem = Transaction | Separator;

  const renderRecordItem = ({
    item,
    index,
  }: {
    item: ListItem;
    index: number;
  }) => {
    if ('isSeparator' in item) {
      return (
        <View className="bg-slate-950/50 py-2 items-center border-b border-white/5">
          <Text className="text-slate-600 text-[10px] font-bold tracking-[2px] uppercase">
            {item.date}
          </Text>
        </View>
      );
    }

    const isLast = index === dataWithSeparators.length - 1;
    // casting to Transaction or just using item because TS knows it's not Separator
    const t = item as Transaction;
    const dateParts = t.date.split('-');
    const shortDate = `${dateParts[2]}/${dateParts[1]}`;
    const displayLabel =
      t.type === 'expense' ? t.category || t.description : t.description;

    return (
      <Pressable
        onLongPress={() => handleDelete(t.id)}
        className={`flex-row items-center bg-slate-900 border-b border-white/5 active:bg-slate-800 px-2 py-3 ${isLast ? 'rounded-b-xl border-b-0' : ''}`}
      >
        <Text className="text-slate-500 text-[10px] flex-[0.8] font-medium">
          {shortDate}
        </Text>
        <Text className="text-white text-xs flex-[1.5] pr-1" numberOfLines={1}>
          {displayLabel}
        </Text>
        <Text
          className="text-slate-400 text-[10px] flex-[1] uppercase"
          numberOfLines={1}
        >
          {t.account}
        </Text>
        <Text
          className={`text-xs font-bold flex-[1.2] text-right ${t.type === 'income' ? 'text-emerald-400' : 'text-slate-200'}`}
        >
          {t.type === 'income' ? '+' : '-'}
          {formatNaira(t.amount)}
        </Text>
      </Pressable>
    );
  };

  const renderHistoryItem = ({ item }: { item: (typeof history)[0] }) => (
    <Pressable
      onPress={() => {
        setSelectedMonth(item.month);
        setViewMode('records');
      }}
      className="bg-slate-900 mb-2 p-4 rounded-2xl border border-slate-800 flex-row justify-between items-center active:bg-slate-800"
    >
      <View>
        <Text className="text-white font-bold">
          {formatMonthDisplayName(item.month)}
        </Text>
        <Text className="text-slate-500 text-xs mt-1">Tap to view sheet</Text>
      </View>
      <View className="items-end">
        <Text className="text-emerald-400 text-xs font-medium">
          +{formatNaira(item.income)}
        </Text>
        <Text className="text-rose-400 text-xs font-medium">
          -{formatNaira(item.expense)}
        </Text>
      </View>
    </Pressable>
  );

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'bottom']}>
      <View className="flex-1 pt-4">
        {/* Sub-tabs Toggle */}
        <View className="flex-row bg-slate-900 p-1 rounded-2xl mb-4 mx-4">
          <Pressable
            onPress={() => setViewMode('records')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${viewMode === 'records' ? 'bg-slate-800' : ''}`}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'records' ? '#fff' : '#475569'}
            />
            <Text
              className={`ml-2 text-sm ${viewMode === 'records' ? 'text-white font-bold' : 'text-slate-500'}`}
            >
              Records
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('history')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${viewMode === 'history' ? 'bg-slate-800' : ''}`}
          >
            <Ionicons
              name="grid"
              size={16}
              color={viewMode === 'history' ? '#fff' : '#475569'}
            />
            <Text
              className={`ml-2 text-sm ${viewMode === 'history' ? 'text-white font-bold' : 'text-slate-500'}`}
            >
              History
            </Text>
          </Pressable>
        </View>

        {viewMode === 'records' ? (
          <View className="flex-1 min-h-0">
            <View className="flex-row justify-between items-center mb-2 px-5">
              <Text className="text-slate-400 font-bold uppercase text-[10px] tracking-widest" allowFontScaling maxFontSizeMultiplier={1.5}>
                {formatMonthDisplayName(selectedMonth)} Sheet
              </Text>
              {selectedMonth !== getCurrentMonth() && (
                <Pressable onPress={() => setSelectedMonth(getCurrentMonth())}>
                  <Text className="text-indigo-400 text-[10px] font-bold uppercase" allowFontScaling maxFontSizeMultiplier={1.5}>
                    Back to Today
                  </Text>
                </Pressable>
              )}
            </View>

            <View className="flex-1 min-h-0 px-4">
              <FlatList
                data={dataWithSeparators}
                keyExtractor={item =>
                  'isSeparator' in item
                    ? `sep-${item.date}`
                    : item.id.toString()
                }
                renderItem={renderRecordItem}
                ListHeaderComponent={renderRecordsHeader}
                ListEmptyComponent={
                  <View className="mt-20 items-center">
                    <Ionicons
                      name="receipt-outline"
                      size={48}
                      color="#1e293b"
                    />
                    <Text className="text-slate-600 mt-4" allowFontScaling maxFontSizeMultiplier={1.5}>
                      No records found.
                    </Text>
                  </View>
                }
                showsVerticalScrollIndicator={false}
                stickyHeaderIndices={[0]}
                contentContainerStyle={{ paddingBottom: 16 }}
              />
            </View>

            {/* Fixed Footer Summary - always visible above tab bar */}
            <View
              className="bg-slate-900 border-t border-white/10 p-5"
              style={{ paddingBottom: TAB_BAR_HEIGHT + 24 }}
            >
              <View className="flex-row justify-between mb-4">
                <View>
                  <Text className="text-slate-500 text-[10px] font-bold uppercase mb-1" allowFontScaling maxFontSizeMultiplier={1.5}>
                    Total Income
                  </Text>
                  <Text className="text-emerald-400 text-lg font-bold" allowFontScaling maxFontSizeMultiplier={1.5}>
                    +{formatNaira(totals.income)}
                  </Text>
                </View>
                <View className="items-end">
                  <Text className="text-slate-500 text-[10px] font-bold uppercase mb-1" allowFontScaling maxFontSizeMultiplier={1.5}>
                    Total Expenses
                  </Text>
                  <Text className="text-rose-400 text-lg font-bold" allowFontScaling maxFontSizeMultiplier={1.5}>
                    -{formatNaira(totals.expense)}
                  </Text>
                </View>
              </View>
              <View className="bg-slate-950 p-4 rounded-2xl flex-row justify-between items-center border border-white/5">
                <Text className="text-slate-300 font-medium" allowFontScaling maxFontSizeMultiplier={1.5}>
                  Monthly Savings
                </Text>
                <Text
                  className={`text-xl font-bold ${totals.balance >= 0 ? 'text-white' : 'text-rose-500'}`}
                  allowFontScaling
                  maxFontSizeMultiplier={1.5}
                >
                  {formatNaira(totals.balance)}
                </Text>
              </View>
            </View>
          </View>
        ) : (
          <View className="flex-1 px-4">
            <Text className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">
              Monthly Archive
            </Text>
            <FlatList
              data={history}
              keyExtractor={item => item.month}
              renderItem={renderHistoryItem}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}
