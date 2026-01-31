import { getAccountBalances, getMonthlySummary } from '@/db/transactions';
import { addMonths } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useMemo, useRef, useState } from 'react';
import { Dimensions, NativeSyntheticEvent, NativeScrollEvent, RefreshControl, ScrollView, Text, View } from 'react-native';
import { Pressable } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import AccountCard from '@/components/ui/AccountCard';
import BalanceCard from '@/components/ui/BalanceCard';
import MonthNavigator from '@/components/ui/MonthNavigator';
import SectionHeader from '@/components/ui/SectionHeader';

// Types
import type { AccountBalance, MonthlySummary } from '@/types';

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState<MonthlySummary>({ 
    income: 0, 
    expense: 0, 
    balance: 0 
  });
  const [accountBalances, setAccountBalances] = useState<AccountBalance[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const accountsScrollRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const cardScrollAmount = Math.min(220, screenWidth * 0.7);
  const canScrollLeft = accountBalances.length > 1 && scrollOffset > 10;
  const canScrollRight = accountBalances.length > 1 && contentWidth > scrollViewWidth && scrollOffset < contentWidth - scrollViewWidth - 10;

  // Format YYYY-MM for queries
  const currentMonth = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }, [currentDate]);

  const totalGlobalBalance = useMemo(() => {
    return accountBalances.reduce((sum, item) => sum + item.balance, 0);
  }, [accountBalances]);

  const fetchSummary = useCallback(async () => {
    const [summaryData, balancesData] = await Promise.all([
      getMonthlySummary(db, currentMonth),
      getAccountBalances(db, currentMonth),
    ]);

    setSummary(summaryData);
    setAccountBalances(balancesData);
  }, [db, currentMonth]);

  useFocusEffect(
    useCallback(() => {
      fetchSummary();
    }, [fetchSummary])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchSummary();
    setRefreshing(false);
  }, [fetchSummary]);

  const navigateMonth = (direction: -1 | 1) => {
    const newDate = addMonths(currentDate, direction);
    if (newDate > new Date()) return;
    setCurrentDate(newDate);
  };

  const scrollAccounts = (direction: 1 | -1) => {
    const next = Math.max(0, Math.min(contentWidth - scrollViewWidth, scrollOffset + direction * cardScrollAmount));
    accountsScrollRef.current?.scrollTo({
      x: next,
      animated: true,
    });
  };

  const onAccountsScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    setScrollOffset(e.nativeEvent.contentOffset.x);
    setContentWidth(e.nativeEvent.contentSize.width);
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#fff"
          />
        }
      >
        {/* Header Section */}
        <View className="px-4 mb-4 mt-6">
          <MonthNavigator 
            currentDate={currentDate} 
            onNavigate={navigateMonth} 
          />
          <SectionHeader title="Overview" />
        </View>

        {/* Box 1: Total Balance */}
        <BalanceCard
          label="Total Balance"
          amount={totalGlobalBalance}
          variant="default"
          className="mx-4 mb-6"
        />

        {/* Box 2: Accounts (Monthly Flow) - own card, scrolls horizontally */}
        <View className="mx-4 mb-6 bg-slate-900 rounded-3xl border border-slate-800 p-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-slate-500 text-xs font-bold uppercase" allowFontScaling maxFontSizeMultiplier={1.5}>
              Accounts (Monthly Flow)
            </Text>
            {accountBalances.length > 1 && (
              <View className="flex-row gap-1">
                {canScrollLeft && (
                  <Pressable
                    onPress={() => scrollAccounts(-1)}
                    className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
                    accessibilityLabel="Scroll accounts left"
                  >
                    <Ionicons name="chevron-back" size={22} color="#94a3b8" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => scrollAccounts(1)}
                  className="w-9 h-9 rounded-full bg-slate-800 items-center justify-center active:bg-slate-700"
                  accessibilityLabel="Scroll accounts right"
                >
                  <Ionicons name="chevron-forward" size={22} color="#94a3b8" />
                </Pressable>
              </View>
            )}
          </View>
          <ScrollView
            ref={accountsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onAccountsScroll}
            onContentSizeChange={(w) => setContentWidth(w)}
            onLayout={(e) => setScrollViewWidth(e.nativeEvent.layout.width)}
            scrollEventThrottle={16}
            contentContainerStyle={
              accountBalances.length === 1 && scrollViewWidth > 0
                ? { width: scrollViewWidth, paddingRight: 8 }
                : { paddingRight: 8 }
            }
          >
            {accountBalances.length > 0 ? (
              accountBalances.map((item, index) => (
                <View
                  key={item.account}
                  style={
                    accountBalances.length === 1 && scrollViewWidth > 0
                      ? { width: scrollViewWidth - 8 }
                      : undefined
                  }
                  className={accountBalances.length === 1 ? '' : 'flex-row items-stretch'}
                >
                  {index > 0 && (
                    <View className="w-px bg-slate-700 mx-0.5 self-stretch min-h-[60px]" />
                  )}
                  <AccountCard
                    account={item.account}
                    balance={item.balance}
                    income={item.income}
                    expense={item.expense}
                    className={accountBalances.length === 1 ? '' : 'mr-3'}
                    fullWidth={accountBalances.length === 1}
                  />
                </View>
              ))
            ) : (
              <View className="bg-slate-800/50 rounded-2xl w-[280px] items-center justify-center py-6 border border-slate-700">
                <Text className="text-slate-500 text-sm italic" allowFontScaling maxFontSizeMultiplier={1.5}>
                  No accounts with data yet.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Box 3: Income & Expense summary */}
        <View className="mx-4 mb-24 bg-slate-900 rounded-3xl border border-slate-800 p-5">
          <View className="flex-row justify-between gap-3">
            <BalanceCard
              label="Income"
              amount={summary.income}
              variant="income"
              className="flex-1"
            />
            <BalanceCard
              label="Expense"
              amount={summary.expense}
              variant="expense"
              className="flex-1"
            />
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
