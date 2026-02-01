import { formatMonthDisplayName, formatNaira } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo } from 'react';
import { Alert, FlatList, Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Stores
import { Transaction } from '@/db/transactions';
import { useLogsStore } from '../../stores/logsStore';

type ViewMode = 'records' | 'history';

const TAB_BAR_HEIGHT = 60;

export default function LogsScreen() {
  const {
    selectedMonth,
    viewMode,
    transactions,
    history,
    setViewMode,
    setSelectedMonth,
    deleteTransaction,
    refresh,
  } = useLogsStore();

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
          await deleteTransaction(id);
        },
      },
    ]);
  };

  const renderRecordsHeader = () => (
    <View className="flex-row bg-surface border-b border-subtle px-2 py-3 rounded-t-xl mb-1">
      <Text className="text-muted text-[10px] font-bold uppercase flex-[0.8]">
        Date
      </Text>
      <Text className="text-muted text-[10px] font-bold uppercase flex-[1.5]">
        Item / Cat
      </Text>
      <Text className="text-muted text-[10px] font-bold uppercase flex-[1]">
        Source
      </Text>
      <Text className="text-muted text-[10px] font-bold uppercase flex-[1.2] text-right">
        Amount
      </Text>
    </View>
  );

  // Group transactions by date for the "middle row" separators
  const dataWithSeparators = useMemo(() => {
    const result: (Transaction | { isSeparator: true; date: string })[] = [];
    let lastDate = '';

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

  const renderRecordItem = ({
    item,
    index,
  }: {
    item: Transaction | { isSeparator: true; date: string };
    index: number;
  }) => {
    if ('isSeparator' in item) {
      return (
        <View className="bg-card-inner py-2 items-center border-b border-card-inner">
          <Text className="text-muted-dim text-[10px] font-bold tracking-[2px] uppercase">
            {item.date}
          </Text>
        </View>
      );
    }

    const isLast = index === dataWithSeparators.length - 1;
    const t = item as Transaction;
    const dateParts = t.date.split('-');
    const shortDate = `${dateParts[2]}/${dateParts[1]}`;
    const displayLabel =
      t.type === 'expense' ? t.category || t.description : t.description;

    return (
      <Pressable
        onLongPress={() => handleDelete(t.id)}
        className={`flex-row items-center bg-surface border-b border-card-inner active:bg-surface-hover px-2 py-3 ${isLast ? 'rounded-b-xl border-b-0' : ''}`}
      >
        <Text className="text-muted text-[10px] flex-[0.8] font-medium">
          {shortDate}
        </Text>
        <Text
          className="text-primary text-xs flex-[1.5] pr-1"
          numberOfLines={1}
        >
          {displayLabel}
        </Text>
        <Text
          className="text-secondary text-[10px] flex-[1] uppercase"
          numberOfLines={1}
        >
          {t.account}
        </Text>
        <Text
          className={`text-xs font-bold flex-[1.2] text-right ${
            t.type === 'income' ? 'text-income' : 'text-expense'
          }`}
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
      className="bg-surface mb-2 p-4 rounded-2xl border border-default flex-row justify-between items-center active:bg-surface-hover"
    >
      <View>
        <Text className="text-primary font-bold">
          {formatMonthDisplayName(item.month)}
        </Text>
        <Text className="text-muted text-xs mt-1">Tap to view sheet</Text>
      </View>
      <View className="items-end">
        <Text className="text-income text-xs font-medium">
          +{formatNaira(item.income)}
        </Text>
        <Text className="text-expense text-xs font-medium">
          -{formatNaira(item.expense)}
        </Text>
      </View>
    </Pressable>
  );

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  return (
    <SafeAreaView className="flex-1 bg-app" edges={['top', 'bottom']}>
      <View className="flex-1 pt-4">
        {/* Sub-tabs Toggle */}
        <View className="flex-row bg-surface p-1 rounded-2xl mb-4 mx-4 border border-default">
          <Pressable
            onPress={() => setViewMode('records')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
              viewMode === 'records' ? 'bg-surface-hover' : ''
            }`}
          >
            <Ionicons
              name="list"
              size={16}
              color={viewMode === 'records' ? '#ffffff' : '#64748b'}
            />
            <Text
              className={`ml-2 text-sm ${
                viewMode === 'records' ? 'text-primary font-bold' : 'text-muted'
              }`}
            >
              Records
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setViewMode('history')}
            className={`flex-1 py-2.5 rounded-xl items-center flex-row justify-center ${
              viewMode === 'history' ? 'bg-surface-hover' : ''
            }`}
          >
            <Ionicons
              name="grid"
              size={16}
              color={viewMode === 'history' ? '#ffffff' : '#64748b'}
            />
            <Text
              className={`ml-2 text-sm ${
                viewMode === 'history' ? 'text-primary font-bold' : 'text-muted'
              }`}
            >
              History
            </Text>
          </Pressable>
        </View>

        {viewMode === 'records' ? (
          <View className="flex-1 min-h-0">
            <View className="flex-row justify-between items-center mb-2 px-5">
              <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">
                {formatMonthDisplayName(selectedMonth)}
              </Text>
              <View className="bg-card-inner rounded-xl px-4 py-2">
                <Text
                  className="text-muted text-[10px] font-bold uppercase tracking-widest"
                  allowFontScaling
                  maxFontSizeMultiplier={1.5}
                >
                  Monthly Summary
                </Text>
                <View className="flex-row justify-between items-center mt-1">
                  <View className="items-center">
                    <Text
                      className="text-income text-xs font-bold"
                      allowFontScaling
                      maxFontSizeMultiplier={1.5}
                    >
                      Income
                    </Text>
                    <Text
                      className="text-primary text-xs font-bold"
                      allowFontScaling
                      maxFontSizeMultiplier={1.5}
                    >
                      {formatNaira(totals.income)}
                    </Text>
                  </View>
                  <View className="items-center">
                    <Text
                      className="text-expense text-xs font-bold"
                      allowFontScaling
                      maxFontSizeMultiplier={1.5}
                    >
                      Expense
                    </Text>
                    <Text
                      className="text-expense text-xs font-bold"
                      allowFontScaling
                      maxFontSizeMultiplier={1.5}
                    >
                      -{formatNaira(totals.expense)}
                    </Text>
                  </View>
                </View>
                <View className="border-t border-default mt-2 pt-2">
                  <Text
                    className="text-muted text-[10px] font-bold uppercase tracking-widest"
                    allowFontScaling
                    maxFontSizeMultiplier={1.5}
                  >
                    Savings
                  </Text>
                  <Text
                    className={`text-lg font-bold ${totals.balance >= 0 ? 'text-primary' : 'text-expense-negative'}`}
                    allowFontScaling
                    maxFontSizeMultiplier={1.5}
                  >
                    {formatNaira(totals.balance)}
                  </Text>
                </View>
              </View>
            </View>

            <FlatList
              data={dataWithSeparators}
              keyExtractor={(item, index) =>
                'isSeparator' in item ? `sep-${index}` : `item-${item.id}`
              }
              renderItem={renderRecordItem}
              showsVerticalScrollIndicator={false}
              ListHeaderComponent={renderRecordsHeader}
              contentContainerStyle={{ paddingBottom: 100 }}
            />
          </View>
        ) : (
          <View className="flex-1 px-4">
            <Text className="text-muted text-[10px] font-bold uppercase tracking-widest mb-4 ml-1">
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
