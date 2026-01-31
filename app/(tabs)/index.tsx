import {
  getAccountBalances,
  getMonthlySummary,
  getExpensesByCategory,
  getLast6MonthsTrend,
} from '@/db/transactions';
import {
  formatFullDate,
  formatNaira,
  getCurrentMonth,
  addMonths,
} from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useState, useMemo } from 'react';
import {
  Dimensions,
  Pressable,
  RefreshControl,
  ScrollView,
  Text,
  View,
} from 'react-native';
import { BarChart, PieChart } from 'react-native-gifted-charts';

const SCREEN_WIDTH = Dimensions.get('window').width;

export default function DashboardScreen() {
  const db = useSQLiteContext();
  const [summary, setSummary] = useState({ income: 0, expense: 0, balance: 0 });
  const [accountBalances, setAccountBalances] = useState<
    { account: string; balance: number; income: number; expense: number }[]
  >([]);
  const [pieData, setPieData] = useState<{ value: number; color: string; text?: string }[]>([]);
  const [barData, setBarData] = useState<any[]>([]);
  const [currentDate, setCurrentDate] = useState(new Date());
  
  // Format YYYY-MM for queries
  const currentMonth = useMemo(() => {
    return `${currentDate.getFullYear()}-${String(currentDate.getMonth() + 1).padStart(2, '0')}`;
  }, [currentDate]);

  const [refreshing, setRefreshing] = useState(false);
  const [chartType, setChartType] = useState<'category' | 'trend'>('category');

  const totalGlobalBalance = useMemo(() => {
    return accountBalances.reduce((sum, item) => sum + item.balance, 0);
  }, [accountBalances]);

  const fetchSummary = useCallback(async () => {
    // Pass currentMonth to filters, but getAccountBalances handles mixed logic (balance is global, in/out is monthly)
    const [summaryData, balancesData, categoryData, trendData] =
      await Promise.all([
        getMonthlySummary(db, currentMonth),
        getAccountBalances(db, currentMonth),
        getExpensesByCategory(db, currentMonth),
        getLast6MonthsTrend(db),
      ]);

    setSummary(summaryData);
    setAccountBalances(balancesData);

    // Prepare Pie Data
    const colors = ['#f43f5e', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899'];
    const pData = categoryData.map((item, index) => ({
      value: item.total,
      color: colors[index % colors.length],
      text: `${((item.total / summaryData.expense) * 100).toFixed(0)}%`,
      category: item.category
    }));
    setPieData(pData);

    // Prepare Bar Data
    const bData: any[] = [];
    trendData.forEach((item) => {
      bData.push({
        value: item.income,
        label: item.label,
        spacing: 2,
        labelWidth: 30,
        labelTextStyle: { color: 'gray', fontSize: 10 },
        frontColor: '#10b981',
      });
      bData.push({
        value: item.expense,
        frontColor: '#f43f5e',
      });
    });
    setBarData(bData);

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
    if (newDate > new Date()) return; // Prevent future
    setCurrentDate(newDate);
  };

  return (
    <ScrollView
      className="flex-1 bg-slate-950 pt-6"
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor="#fff"
        />
      }
    >
      <View className="px-4 mb-6">
        <View className="items-center mb-2">
          <View className="flex-row items-center justify-center bg-slate-900/50 rounded-full px-4 py-1 border border-white/5">
             <Pressable 
                onPress={() => navigateMonth(-1)}
                className="p-2 active:bg-slate-800 rounded-full"
             >
                <Ionicons name="chevron-back" size={18} color="#94a3b8" />
             </Pressable>
             <Text className="text-slate-300 text-sm font-bold uppercase tracking-widest mx-4 min-w-[100px] text-center">
               {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
             </Text>
             <Pressable 
                onPress={() => navigateMonth(1)}
                className={`p-2 rounded-full ${currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear() ? 'opacity-30' : 'active:bg-slate-800'}`}
                disabled={currentDate.getMonth() === new Date().getMonth() && currentDate.getFullYear() === new Date().getFullYear()}
             >
                <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
             </Pressable>
          </View>
        </View>
        <Text className="text-white text-3xl font-bold">Overview</Text>
      </View>

      {/* Main Balance Card - Global Balance */}
      <View className="mx-4 bg-indigo-600 p-6 rounded-3xl mb-6 shadow-xl shadow-indigo-500/20">
        <Text className="text-indigo-100 text-sm">Total Balance</Text>
        <Text className="text-white text-4xl font-bold mt-2">
          {formatNaira(totalGlobalBalance)}
        </Text>
      </View>

      {/* Account Balances Section - Horizontal Carousel */}
      <View className="mb-8">
        <Text className="px-4 text-slate-500 text-xs font-bold uppercase mb-4 ml-1">
          Accounts (Monthly Flow)
        </Text>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={{ paddingLeft: 16, paddingRight: 16 }}
        >
          {accountBalances.length > 0 ? (
            accountBalances.map((item) => (
              <View
                key={item.account}
                className="bg-slate-900 px-5 py-4 rounded-3xl border border-slate-800 mr-3 min-w-[200px]"
              >
                <Text className="text-slate-400 text-[10px] uppercase font-bold mb-3 tracking-widest">
                  {item.account}
                </Text>
                <Text className="text-white text-2xl font-bold mb-3">
                  {formatNaira(item.balance)}
                </Text>
                <View className="flex-row justify-between border-t border-white/5 pt-3">
                  <View>
                    <Text className="text-slate-500 text-[8px] uppercase font-bold mb-0.5">
                      In ({currentDate.toLocaleString('default', { month: 'short' })})
                    </Text>
                    <Text className="text-emerald-400 text-xs font-bold">
                      +{formatNaira(item.income)}
                    </Text>
                  </View>
                  <View className="items-end">
                    <Text className="text-slate-500 text-[8px] uppercase font-bold mb-0.5">
                      Out ({currentDate.toLocaleString('default', { month: 'short' })})
                    </Text>
                    <Text className="text-rose-400 text-xs font-bold">
                      -{formatNaira(item.expense)}
                    </Text>
                  </View>
                </View>
              </View>
            ))
          ) : (
            <View className="bg-slate-900 px-6 py-8 rounded-3xl border border-slate-800 mr-4 w-[280px] items-center">
              <Text className="text-slate-500 text-sm italic">
                No accounts with data yet.
              </Text>
            </View>
          )}
        </ScrollView>
      </View>

      {/* Charts Section */}
      <View className="mb-8 px-4">
        <View className="flex-row justify-between items-center mb-4 ml-1">
            <Text className="text-slate-500 text-xs font-bold uppercase">Analytics ({currentDate.toLocaleString('default', { month: 'short' })})</Text>
            <View className="flex-row bg-slate-900 rounded-lg p-0.5 border border-slate-800">
                <Pressable 
                    onPress={() => setChartType('category')}
                    className={`px-3 py-1 rounded-md ${chartType === 'category' ? 'bg-indigo-600' : ''}`}
                >
                    <Text className={`text-[10px] font-bold ${chartType === 'category' ? 'text-white' : 'text-slate-500'}`}>Pie</Text>
                </Pressable>
                <Pressable 
                    onPress={() => setChartType('trend')}
                    className={`px-3 py-1 rounded-md ${chartType === 'trend' ? 'bg-indigo-600' : ''}`}
                >
                    <Text className={`text-[10px] font-bold ${chartType === 'trend' ? 'text-white' : 'text-slate-500'}`}>Trend</Text>
                </Pressable>
            </View>
        </View>

        <View className="bg-slate-900 p-5 rounded-3xl border border-slate-800 items-center">
            {chartType === 'category' ? (
                pieData.length > 0 ? (
                    <View className="items-center">
                        <PieChart
                            data={pieData}
                            donut
                            showText
                            textColor="white"
                            radius={SCREEN_WIDTH * 0.18}
                            innerRadius={SCREEN_WIDTH * 0.1}
                            textSize={10}
                            focusOnPress
                            strokeWidth={2}
                            strokeColor="#0f172a"
                        />
                        <View className="flex-row flex-wrap justify-center mt-6 gap-2">
                           {pieData.map((p: any, i) => (
                               <View key={i} className="flex-row items-center mr-3 mb-1">
                                    <View style={{ width: 8, height: 8, backgroundColor: p.color, borderRadius: 4, marginRight: 4 }} />
                                    <Text className="text-slate-400 text-[10px]">{p.category}</Text>
                               </View>
                           ))}
                        </View>
                    </View>
                ) : (
                    <Text className="text-slate-500 text-xs italic py-10">No expenses for {currentDate.toLocaleString('default', { month: 'long' })}</Text>
                )
            ) : (
                <View className="items-center w-full overflow-hidden">
                    {barData.length > 0 ? (
                        <BarChart
                            data={barData}
                            barWidth={12}
                            spacing={14}
                            roundedTop
                            roundedBottom
                            hideRules
                            xAxisThickness={0}
                            yAxisThickness={0}
                            yAxisTextStyle={{ color: 'gray', fontSize: 10 }}
                            noOfSections={3}
                            maxValue={Math.max(...barData.map(d => d.value)) * 1.2}
                            width={SCREEN_WIDTH - 80}
                            height={180}
                            isAnimated
                        />
                    ) : (
                         <Text className="text-slate-500 text-xs italic py-10">No history available</Text>
                    )}
                </View>
            )}
        </View>
      </View>

      {/* Total In/Out Cards - Scoped to Selected Month */}
      <View className="flex-row justify-between px-4 mb-8">
        <View className="bg-slate-900 flex-1 mr-2 p-5 rounded-3xl border border-slate-800 shadow-sm">
          <Text className="text-slate-400 text-xs mb-1 font-medium">
            Income ({currentDate.toLocaleString('default', { month: 'short' })})
          </Text>
          <Text className="text-emerald-400 text-xl font-bold">
            {formatNaira(summary.income)}
          </Text>
        </View>
        <View className="bg-slate-900 flex-1 ml-2 p-5 rounded-3xl border border-slate-800 shadow-sm">
          <Text className="text-slate-400 text-xs mb-1 font-medium">
            Expense ({currentDate.toLocaleString('default', { month: 'short' })})
          </Text>
          <Text className="text-rose-400 text-xl font-bold">
            {formatNaira(summary.expense)}
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}
