import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useCallback, useMemo, useRef, useState } from 'react';
import {
  Dimensions,
  NativeScrollEvent,
  NativeSyntheticEvent,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import AccountCard from '@/components/ui/AccountCard';
import BalanceCard from '@/components/ui/BalanceCard';
import MonthNavigator from '@/components/ui/MonthNavigator';
import SectionHeader from '@/components/ui/SectionHeader';

// Stores
import { useDashboardStore } from '../../stores/dashboardStore';

export default function DashboardScreen() {
  const {
    summary,
    accountBalances,
    currentMonth,
    isLoading,
    error,
    setMonth,
    navigateMonth,
    refresh,
  } = useDashboardStore();

  const [refreshing, setRefreshing] = useState(false);
  const accountsScrollRef = useRef<ScrollView>(null);
  const [scrollOffset, setScrollOffset] = useState(0);
  const [contentWidth, setContentWidth] = useState(0);
  const [scrollViewWidth, setScrollViewWidth] = useState(0);
  const { width: screenWidth } = Dimensions.get('window');
  const cardScrollAmount = Math.min(220, screenWidth * 0.7);
  const canScrollLeft = accountBalances.length > 1 && scrollOffset > 10;
  const canScrollRight =
    accountBalances.length > 1 &&
    contentWidth > scrollViewWidth &&
    scrollOffset < contentWidth - scrollViewWidth - 10;

  const totalGlobalBalance = useMemo(() => {
    return accountBalances.reduce((sum, item) => sum + item.balance, 0);
  }, [accountBalances]);

  useFocusEffect(
    useCallback(() => {
      refresh();
    }, [refresh])
  );

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await refresh();
    setRefreshing(false);
  }, [refresh]);

  const scrollAccounts = (direction: 1 | -1) => {
    const next = Math.max(
      0,
      Math.min(
        contentWidth - scrollViewWidth,
        scrollOffset + direction * cardScrollAmount
      )
    );
    accountsScrollRef.current?.scrollTo({
      x: next,
      animated: true,
    });
  };

  const onAccountsScroll = useCallback(
    (e: NativeSyntheticEvent<NativeScrollEvent>) => {
      setScrollOffset(e.nativeEvent.contentOffset.x);
      setContentWidth(e.nativeEvent.contentSize.width);
    },
    []
  );

  return (
    <SafeAreaView className="flex-1 bg-app" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor="#64748b"
          />
        }
      >
        {/* Header Section */}
        <View className="px-4 mb-4 mt-6">
          <MonthNavigator
            currentDate={new Date(currentMonth + '-01')}
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
        <View className="mx-4 mb-6 bg-surface rounded-3xl border border-default p-5">
          <View className="flex-row items-center justify-between mb-4">
            <Text
              className="text-muted text-[10px] font-bold uppercase"
              allowFontScaling
              maxFontSizeMultiplier={1.5}
            >
              Accounts (Monthly Flow)
            </Text>
            {accountBalances.length > 1 && (
              <View className="flex-row gap-1">
                {canScrollLeft && (
                  <Pressable
                    onPress={() => scrollAccounts(-1)}
                    className="w-9 h-9 rounded-full bg-scroll-btn items-center justify-center active:bg-scroll-btn-active"
                    accessibilityLabel="Scroll accounts left"
                  >
                    <Ionicons name="chevron-back" size={22} color="#64748b" />
                  </Pressable>
                )}
                <Pressable
                  onPress={() => scrollAccounts(1)}
                  className="w-9 h-9 rounded-full bg-scroll-btn items-center justify-center active:bg-scroll-btn-active"
                  accessibilityLabel="Scroll accounts right"
                >
                  <Ionicons name="chevron-forward" size={22} color="#64748b" />
                </Pressable>
              </View>
            )}
          </View>
          <ScrollView
            ref={accountsScrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            onScroll={onAccountsScroll}
            onContentSizeChange={w => setContentWidth(w)}
            onLayout={e => setScrollViewWidth(e.nativeEvent.layout.width)}
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
                  className={
                    accountBalances.length === 1 ? '' : 'flex-row items-stretch'
                  }
                >
                  {index > 0 && (
                    <View className="w-px bg-divider mx-0.5 self-stretch min-h-[60px]" />
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
              <View className="bg-surface-muted rounded-2xl w-[280px] items-center justify-center py-6 border border-default">
                <Text
                  className="text-muted text-sm italic"
                  allowFontScaling
                  maxFontSizeMultiplier={1.5}
                >
                  No accounts with data yet.
                </Text>
              </View>
            )}
          </ScrollView>
        </View>

        {/* Box 3: Income & Expense summary */}
        {(summary.income > 0 || summary.expense > 0) && (
          <View className="mx-4 mb-24 bg-surface rounded-3xl border border-default p-5">
            <Text
              className="text-muted text-[10px] font-bold uppercase"
              allowFontScaling
              maxFontSizeMultiplier={1.5}
            >
              Summary
            </Text>
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
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
