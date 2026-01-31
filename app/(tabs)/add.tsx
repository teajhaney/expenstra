import {
  addCategory,
  addTransaction,
  deleteCategory,
  getCategories,
  getAccounts,
  addAccount,
  getBalanceByAccount,
} from '@/db/transactions';
import { formatNaira } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { useCallback, useEffect, useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

export default function AddTransactionScreen() {
  const db = useSQLiteContext();
  const router = useRouter();

  const [type, setType] = useState<'expense' | 'income'>('expense');
  
  // Expense Draft State
  const [expenseDesc, setExpenseDesc] = useState('');
  const [expenseAmount, setExpenseAmount] = useState('');
  const [expenseAccount, setExpenseAccount] = useState('Cash');
  const [expenseCategory, setExpenseCategory] = useState('');

  // Income Draft State
  const [incomeDesc, setIncomeDesc] = useState('');
  const [incomeAmount, setIncomeAmount] = useState('');
  const [incomeAccount, setIncomeAccount] = useState('Cash');

  // Custom Account State (Shared modal logic)
  const [newAccName, setNewAccName] = useState('');
  const [showAccModal, setShowAccModal] = useState(false);

  // Persistence State
  const [categories, setCategories] = useState<{ id: number; name: string }[]>([]);
  const [accounts, setAccounts] = useState<{ id: number; name: string }[]>([]);
  const [newCatName, setNewCatName] = useState('');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const fetchData = useCallback(async () => {
    const [cats, accs] = await Promise.all([
      getCategories(db),
      getAccounts(db)
    ]);
    setCategories(cats);
    setAccounts(accs);
  }, [db]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSave = async () => {
    const isExp = type === 'expense';
    const amountStr = isExp ? expenseAmount : incomeAmount;
    const desc = isExp ? expenseDesc : incomeDesc;
    const account = isExp ? expenseAccount : incomeAccount;
    
    // Validation
    if (!amountStr || parseFloat(amountStr) <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    if (!account) {
      Alert.alert('Error', 'Please select a source/account');
      return;
    }

    if (isExp && !expenseCategory) {
      Alert.alert('Error', 'Category is required for expenses');
      return;
    }

    // Balance Validation for Expenses
    if (isExp) {
      const currentBalance = await getBalanceByAccount(db, account);
      const amount = parseFloat(amountStr);
      if (amount > currentBalance) {
        Alert.alert(
          'Low Balance',
          `This amount is higher than the ${formatNaira(currentBalance)} available in ${account} based on your records.`
        );
        return;
      }
    }

    const finalDescription = desc.trim() || (isExp ? expenseCategory : 'Income');

    try {
      await addTransaction(db, {
        description: finalDescription,
        amount: parseFloat(amountStr),
        type,
        account,
        category: isExp ? expenseCategory : undefined,
        date,
      });

      // Clear the current tab's state on success
      if (isExp) {
        setExpenseDesc('');
        setExpenseAmount('');
        // We keep the selected account/category as preference for next time? 
        // User asked to "clear", so let's reset amount/desc at least.
      } else {
        setIncomeDesc('');
        setIncomeAmount('');
      }

      Alert.alert('Success', 'Transaction saved!', [
        { text: 'OK', onPress: () => router.back() }
      ]);
    } catch (e) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory(db, newCatName.trim());
    setExpenseCategory(newCatName.trim());
    setNewCatName('');
    fetchData();
  };

  const handleAddAccount = async () => {
    if (!newAccName.trim()) return;
    await addAccount(db, newAccName.trim());
    if (type === 'expense') setExpenseAccount(newAccName.trim());
    else setIncomeAccount(newAccName.trim());
    setNewAccName('');
    setShowAccModal(false);
    fetchData();
  };

  const handleDeleteCategory = async (id: number, name: string) => {
    Alert.alert('Delete Category', `Remove "${name}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          await deleteCategory(db, id);
          if (expenseCategory === name) setExpenseCategory('');
          fetchData();
        },
      },
    ]);
  };

  return (
    <View className="flex-1 bg-slate-950">
      <ScrollView className="flex-1 px-4 pt-6">
        <View className="mb-8">
          <Text className="text-white text-3xl font-bold">New Entry</Text>
        </View>

        {/* Type Toggle */}
        <View className="flex-row bg-slate-900 p-1 rounded-2xl mb-6">
          <Pressable
            onPress={() => setType('expense')}
            className={`flex-1 py-3 rounded-xl items-center ${type === 'expense' ? 'bg-slate-800' : ''}`}
          >
            <Text className={type === 'expense' ? 'text-rose-400 font-bold' : 'text-slate-400'}>
              Expense
            </Text>
          </Pressable>
          <Pressable
            onPress={() => setType('income')}
            className={`flex-1 py-3 rounded-xl items-center ${type === 'income' ? 'bg-slate-800' : ''}`}
          >
            <Text className={type === 'income' ? 'text-emerald-400 font-bold' : 'text-slate-400'}>
              Income
            </Text>
          </Pressable>
        </View>

        <View className="space-y-4">
          {/* Category Dropdown for Expenses */}
          {type === 'expense' && (
            <View className="mb-4">
              <Text className="text-slate-500 text-xs mb-2 ml-1 uppercase font-bold">Category</Text>
              <Pressable
                onPress={() => setShowCatPicker(true)}
                className="bg-slate-900 flex-row items-center justify-between p-4 rounded-2xl border border-slate-800"
              >
                <Text className={expenseCategory ? 'text-white' : 'text-slate-500'}>
                  {expenseCategory || 'Select a category'}
                </Text>
                <Ionicons name="chevron-down" size={18} color="#475569" />
              </Pressable>
            </View>
          )}

          {/* Amount Field */}
          <View className="mt-4">
            <Text className="text-slate-500 text-xs mb-2 ml-1 uppercase font-bold">Amount (₦)</Text>
            <TextInput
              className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800"
              placeholder="0.00"
              placeholderTextColor="#475569"
              keyboardType="numeric"
              value={type === 'expense' ? expenseAmount : incomeAmount}
              onChangeText={type === 'expense' ? setExpenseAmount : setIncomeAmount}
            />
          </View>

          {/* Description Field */}
          <View className="mt-4">
            <Text className="text-slate-500 text-xs mb-2 ml-1 uppercase font-bold">
              {type === 'income' ? 'Description (Optional)' : 'Note (Optional)'}
            </Text>
            <TextInput
              className="bg-slate-900 text-white p-4 rounded-2xl border border-slate-800"
              placeholder={type === 'income' ? 'e.g. Salary bonus, Gift' : 'e.g. Lunch with friends'}
              placeholderTextColor="#475569"
              value={type === 'expense' ? expenseDesc : incomeDesc}
              onChangeText={type === 'expense' ? setExpenseDesc : setIncomeDesc}
            />
          </View>

          {/* Account/Source Selection - Horizontal Scroll */}
          <View className="mt-4">
            <Text className="text-slate-500 text-xs mb-2 ml-1 uppercase font-bold">
              {type === 'income' ? 'Account / Cash' : 'Source'}
            </Text>
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false}
              className="flex-row"
              contentContainerStyle={{ paddingBottom: 10 }}
            >
              <View className="flex-row items-center">
                {accounts.map(acc => {
                  const isSelected = type === 'expense' ? expenseAccount === acc.name : incomeAccount === acc.name;
                  return (
                    <Pressable
                      key={acc.name}
                      onPress={() => type === 'expense' ? setExpenseAccount(acc.name) : setIncomeAccount(acc.name)}
                      className={`mr-2 px-5 py-2.5 rounded-full border ${isSelected ? 'bg-indigo-600 border-indigo-500' : 'bg-slate-900 border-slate-800'}`}
                    >
                      <Text className={isSelected ? 'text-white font-bold' : 'text-slate-400'}>{acc.name}</Text>
                    </Pressable>
                  );
                })}
                {type === 'income' && (
                  <Pressable
                    onPress={() => setShowAccModal(true)}
                    className="w-11 h-11 items-center justify-center rounded-full border border-slate-800 bg-slate-900"
                  >
                    <Ionicons name="add" size={24} color="#94a3b8" />
                  </Pressable>
                )}
              </View>
            </ScrollView>
          </View>
        </View>

        <Pressable
          onPress={handleSave}
          className="bg-indigo-600 mt-10 p-5 rounded-2xl items-center shadow-lg shadow-indigo-500/30 mb-20"
        >
          <Text className="text-white font-bold text-lg">
            Save {type === 'income' ? 'Income' : 'Expense'}
          </Text>
        </Pressable>
      </ScrollView>

      {/* Category Picker Modal */}
      <Modal visible={showCatPicker} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-slate-900 rounded-t-3xl border-t border-slate-800 h-[75%]">
            <View className="p-6 pb-2 flex-row justify-between items-center">
              <Text className="text-white text-xl font-bold">Select Category</Text>
              <Pressable onPress={() => setShowCatPicker(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 mt-2">
              {categories.map(cat => (
                <View key={cat.id} className="flex-row items-center mb-2">
                  <Pressable
                    onPress={() => {
                      setExpenseCategory(cat.name);
                      setShowCatPicker(false);
                    }}
                    className={`flex-1 p-4 rounded-2xl flex-row justify-between items-center ${expenseCategory === cat.name ? 'bg-indigo-600' : 'bg-slate-950 border border-slate-800'}`}
                  >
                    <Text className="text-white font-medium">{cat.name}</Text>
                    {expenseCategory === cat.name && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => handleDeleteCategory(cat.id, cat.name)}
                    className="ml-2 w-12 h-12 bg-slate-950 border border-slate-800 rounded-2xl items-center justify-center active:bg-rose-500/10"
                  >
                    <Ionicons name="trash-outline" size={18} color="#f43f5e" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <View className="p-6 pt-4 border-t border-slate-800 bg-slate-900 rounded-b-3xl">
              <Text className="text-slate-500 text-[10px] font-bold uppercase mb-2 ml-1">Add New Category</Text>
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 mr-2"
                  placeholder="New category..."
                  placeholderTextColor="#475569"
                  value={newCatName}
                  onChangeText={setNewCatName}
                />
                <Pressable onPress={handleAddCategory} className="bg-indigo-600 w-14 h-14 items-center justify-center rounded-2xl">
                  <Ionicons name="add" size={28} color="white" />
                </Pressable>
              </View>
            </View>
          </View>
        </View>
      </Modal>

      {/* Account Modal */}
      <Modal visible={showAccModal} transparent animationType="slide">
        <View className="flex-1 justify-end bg-black/60">
          <View className="bg-slate-900 p-6 rounded-t-3xl border-t border-slate-800">
            <Text className="text-white text-xl font-bold mb-4">Add New {type === 'income' ? 'Account / Cash' : 'Source'}</Text>
            <TextInput
              className="bg-slate-950 text-white p-4 rounded-2xl border border-slate-800 mb-6"
              placeholder="e.g. GTBank, Kuda..."
              placeholderTextColor="#475569"
              value={newAccName}
              onChangeText={setNewAccName}
            />
            <View className="flex-row">
              <Pressable onPress={() => setShowAccModal(false)} className="flex-1 p-4 rounded-2xl items-center bg-slate-800 mr-2">
                <Text className="text-white font-bold">Cancel</Text>
              </Pressable>
              <Pressable onPress={handleAddAccount} className="flex-1 p-4 rounded-2xl items-center bg-indigo-600">
                <Text className="text-white font-bold">Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}
