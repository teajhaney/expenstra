import {
  deleteAllTransactions,
  deleteTransactionsByMonth,
  getAllTransactions,
  getTransactionsByMonth,
} from '@/db/transactions';
import { exportToCSV } from '@/utils/export';
import {
  formatMonthDisplayName,
  getCurrentMonth,
  getRecentMonths,
} from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { Link } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Alert, Modal, Pressable, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SettingsScreen() {
  const db = useSQLiteContext();
  const [showMonthPicker, setShowMonthPicker] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonth());

  const handleExportMonth = async (month: string) => {
    try {
      const transactions = await getTransactionsByMonth(db, month);

      if (transactions.length === 0) {
        Alert.alert(
          'No Data Available',
          `There are no transactions to export for ${formatMonthDisplayName(month)}.`
        );
        return;
      }

      await exportToCSV(transactions, formatMonthDisplayName(month), false);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Export Failed', message);
    }
  };

  const handleExportAll = async () => {
    try {
      const transactions = await getAllTransactions(db);
      await exportToCSV(transactions, 'All Time', true);
    } catch (e: unknown) {
      const message = e instanceof Error ? e.message : 'Unknown error';
      Alert.alert('Export Failed', message);
    }
  };

  const handleResetMonth = async () => {
    Alert.alert(
      'Reset Selected Month',
      `Delete all transactions for ${formatMonthDisplayName(selectedMonth)}? This action cannot be undone.`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteTransactionsByMonth(db, selectedMonth);
              Alert.alert(
                'Success',
                'Data for selected month has been deleted'
              );
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : 'Unknown error';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
  };

  const handleResetAll = async () => {
    Alert.alert(
      'Reset All Data',
      'Delete ALL transactions, accounts, and categories? This will completely reset your app and cannot be undone.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete Everything',
          style: 'destructive',
          onPress: async () => {
            try {
              await deleteAllTransactions(db);
              Alert.alert(
                'Success',
                'All data has been deleted. You can start fresh!'
              );
            } catch (e: unknown) {
              const message = e instanceof Error ? e.message : 'Unknown error';
              Alert.alert('Delete Failed', message);
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView className="flex-1 bg-app" edges={['top', 'bottom']}>
      <ScrollView
        className="flex-1 px-4 pt-6"
        contentContainerStyle={{ paddingBottom: 100 }}
      >
        <View className="mb-8">
          <Text className="text-primary text-[30px] font-bold">Settings</Text>
        </View>

        <View className="bg-surface rounded-3xl overflow-hidden border border-default mb-6">
          <Text className="text-muted text-xs font-bold uppercase p-4 pb-2">
            Data Portability
          </Text>

          <Pressable
            onPress={() => setShowMonthPicker(true)}
            className="flex-row items-center p-4 border-b border-default active:bg-surface-hover"
          >
            <View className="w-10 h-10 bg-icon-accent rounded-full items-center justify-center">
              <Ionicons name="download-outline" size={20} color="#818cf8" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-primary font-medium">
                Export Selected Month
              </Text>
              <Text className="text-muted text-xs mt-1">
                Generate CSV for {formatMonthDisplayName(selectedMonth)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </Pressable>

          <Pressable
            onPress={handleExportAll}
            className="flex-row items-center p-4 active:bg-surface-hover"
          >
            <View className="w-10 h-10 bg-icon-accent rounded-full items-center justify-center">
              <Ionicons name="archive-outline" size={20} color="#818cf8" />
            </View>
            <View className="ml-4">
              <Text className="text-primary font-medium">Export All Data</Text>
              <Text className="text-muted text-xs mt-1">
                Full backup of all transactions in CSV
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="bg-surface rounded-3xl overflow-hidden border border-default mb-6">
          <Text className="text-muted text-xs font-bold uppercase p-4 pb-2">
            Data Management
          </Text>

          <Pressable
            onPress={() => setShowMonthPicker(true)}
            className="flex-row items-center p-4 border-b border-default active:bg-surface-hover"
          >
            <View className="w-10 h-10 bg-icon-container rounded-full items-center justify-center">
              <Ionicons name="refresh-outline" size={20} color="#f43f5e" />
            </View>
            <View className="ml-4 flex-1">
              <Text className="text-primary font-medium">
                Reset Selected Month
              </Text>
              <Text className="text-muted text-xs mt-1">
                Delete all transactions for{' '}
                {formatMonthDisplayName(selectedMonth)}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={16} color="#94a3b8" />
          </Pressable>

          <Pressable
            onPress={handleResetAll}
            className="flex-row items-center p-4 active:bg-surface-hover"
          >
            <View className="w-10 h-10 bg-icon-container rounded-full items-center justify-center">
              <Ionicons name="trash-outline" size={20} color="#f43f5e" />
            </View>
            <View className="ml-4">
              <Text className="text-primary font-medium">Reset All Data</Text>
              <Text className="text-muted text-xs mt-1">
                Delete everything and start fresh
              </Text>
            </View>
          </Pressable>
        </View>

        <View className="bg-surface rounded-3xl overflow-hidden border border-default mb-6">
          <Text className="text-muted text-xs font-bold uppercase p-4 pb-2">
            About
          </Text>

          <Link href="/modal" asChild>
            <Pressable className="flex-row items-center p-4 active:bg-surface-hover">
              <View className="w-10 h-10 bg-icon-container rounded-full items-center justify-center">
                <Ionicons
                  name="information-circle-outline"
                  size={20}
                  color="#94a3b8"
                />
              </View>
              <View className="ml-4">
                <Text className="text-primary font-medium">
                  App Information
                </Text>
                <Text className="text-muted text-xs mt-1">
                  Version 1.0.0 • Offline-first
                </Text>
              </View>
            </Pressable>
          </Link>
        </View>

        <Text className="text-muted-dim text-center text-xs mt-4 mb-10 italic">
          "Simple tracking, powerful financial clarity."
        </Text>
      </ScrollView>

      {/* Month Picker Modal */}
      <Modal
        visible={showMonthPicker}
        transparent
        animationType="slide"
        onRequestClose={() => setShowMonthPicker(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setShowMonthPicker(false)}
        >
          <View className="bg-surface rounded-t-3xl border-t border-default h-[80%]">
            <View className="p-6 pb-2 flex-row justify-between items-center">
              <Text className="text-primary text-xl font-bold">
                Select Month
              </Text>
              <Pressable onPress={() => setShowMonthPicker(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 mt-2">
              {getRecentMonths(24).map(
                (month: { value: string; label: string }) => (
                  <Pressable
                    key={month.value}
                    onPress={() => {
                      setSelectedMonth(month.value);
                      setShowMonthPicker(false);
                      // Trigger export with the selected month
                      setTimeout(() => handleExportMonth(month.value), 100);
                    }}
                    className={`p-4 rounded-2xl mb-2 ${
                      selectedMonth === month.value
                        ? 'bg-accent'
                        : 'bg-card-inner border border-default'
                    }`}
                  >
                    <Text
                      className={
                        selectedMonth === month.value
                          ? 'text-on-accent font-medium'
                          : 'text-primary font-medium'
                      }
                    >
                      {month.label}
                    </Text>
                  </Pressable>
                )
              )}
            </ScrollView>
          </View>
        </Pressable>
      </Modal>
    </SafeAreaView>
  );
}
