import { getAllTransactions, getTransactionsByMonth } from '@/db/transactions';
import { exportToCSV } from '@/utils/export';
import { formatMonthDisplayName, getCurrentMonth } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Alert, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const currentMonth = getCurrentMonth();

  const handleExportMonth = async () => {
    try {
      const transactions = await getTransactionsByMonth(db, currentMonth);
      await exportToCSV(transactions, formatMonthDisplayName(currentMonth));
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Export Failed', message);
    }
  };

  const handleExportAll = async () => {
    try {
      const transactions = await getAllTransactions(db);
      await exportToCSV(transactions, 'All_Time');
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Export Failed', message);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-slate-950" edges={['top', 'bottom']}>
      <ScrollView className="flex-1 px-4 pt-6" contentContainerStyle={{ paddingBottom: 100 }}>
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold">Settings</Text>
        </View>

        <View className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase p-4 pb-2">
            Data Portability
          </Text>

          <Pressable
            onPress={handleExportMonth}
            className="flex-row items-center p-4 border-b border-slate-800 active:bg-slate-800"
          >
            <View className="w-10 h-10 bg-indigo-500/10 rounded-full items-center justify-center">
              <Ionicons name="download-outline" size={20} color="#818cf8" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-medium">
                Export Current Month
              </Text>
              <Text className="text-slate-500 text-xs mt-1">
                Generate CSV for {formatMonthDisplayName(currentMonth)}
              </Text>
            </View>
          </Pressable>

          <Pressable
            onPress={handleExportAll}
            className="flex-row items-center p-4 active:bg-slate-800"
          >
            <View className="w-10 h-10 bg-indigo-500/10 rounded-full items-center justify-center">
              <Ionicons name="archive-outline" size={20} color="#818cf8" />
            </View>
            <View className="ml-4">
              <Text className="text-white font-medium">Export All Data</Text>
              <Text className="text-slate-500 text-xs mt-1">
                Full backup of all transactions in CSV
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="bg-slate-900 rounded-3xl overflow-hidden border border-slate-800 mb-6">
          <Text className="text-slate-500 text-xs font-bold uppercase p-4 pb-2">
            About
          </Text>

          <Link href="/modal" asChild>
            <Pressable className="flex-row items-center p-4 active:bg-slate-800">
              <View className="w-10 h-10 bg-slate-800 rounded-full items-center justify-center">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#94a3b8"
                />
              </View>
              <View className="ml-4">
                <Text className="text-white font-medium">App Information</Text>
                <Text className="text-slate-500 text-xs mt-1">
                  Version 1.0.0 • Offline-first
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>

        <Text className="text-slate-600 text-center text-xs mt-4 mb-10 italic">
          "Simple tracking, powerful financial clarity."
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}
