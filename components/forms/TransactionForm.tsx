import { TransactionRepo } from '@/data/transactionsRepo';
import { getBalanceByAccount } from '@/db/transactions';
import {
  expenseTransactionSchema,
  TransactionFormData,
  transactionSchema,
} from '@/schemas/transactionSchema';
import { useReferenceStore } from '@/stores/referenceStore';
import { formatNaira } from '@/utils/format';
import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import { useSQLiteContext } from 'expo-sqlite';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import {
  Alert,
  Modal,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from 'react-native';

interface TransactionFormProps {
  type: 'income' | 'expense';
  defaultValues?: Partial<TransactionFormData>;
  onSubmit?: (data: TransactionFormData) => void;
  onCancel?: () => void;
}

export function TransactionForm({
  type,
  defaultValues,
  onSubmit,
  onCancel,
}: TransactionFormProps) {
  const db = useSQLiteContext();
  const { accounts, categories, addCategory } = useReferenceStore();
  const [currentType, setCurrentType] = useState<'income' | 'expense'>(type);

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(
      currentType === 'expense' ? expenseTransactionSchema : transactionSchema
    ),
    defaultValues: {
      description: '',
      amount: 0,
      type: currentType,
      account: 'Cash',
      category: '',
      date: new Date().toISOString().split('T')[0], // Auto-set to today
      ...defaultValues,
    },
    mode: 'onChange',
  });

  const watchedAmount = watch('amount');
  const watchedAccount = watch('account');
  const watchedCategory = watch('category');
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [showAccModal, setShowAccModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      // Balance validation for expenses
      if (currentType === 'expense') {
        const balance = await getBalanceByAccount(db, data.account);
        if (data.amount > balance) {
          Alert.alert(
            'Low Balance',
            `This amount is higher than the ${formatNaira(balance)} available in ${data.account} based on your records.`
          );
          return;
        }
      }

      const repo = new TransactionRepo(db);

      const transactionData = {
        ...data,
        description:
          data.description?.trim() ||
          (currentType === 'expense' && data.category
            ? data.category
            : 'Income'),
      };

      await repo.addTransaction(transactionData);

      Alert.alert('Success', 'Transaction saved!', [
        { text: 'OK', onPress: () => onCancel?.() },
      ]);

      onSubmit?.(data);
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    setValue('category', newCatName.trim());
    setNewCatName('');
  };

  const handleAddAccount = async () => {
    if (!newAccName.trim()) return;
    // Note: We need to add addAccount to reference store
    setValue('account', newAccName.trim());
    setNewAccName('');
    setShowAccModal(false);
  };

  return (
    <ScrollView
      className="flex-1 px-4 pt-6"
      contentContainerStyle={{ paddingBottom: 100 }}
    >
      <View className="mb-8">
        <Text className="text-primary text-[30px] font-bold">
          New {currentType === 'income' ? 'Income' : 'Expense'}
        </Text>
      </View>

      {/* Type Toggle */}
      <View className="flex-row bg-surface p-1 rounded-2xl mb-6 border border-default">
        <Pressable
          onPress={() => {
            setCurrentType('expense');
            setValue('type', 'expense');
          }}
          className={`flex-1 py-3 rounded-xl items-center ${
            currentType === 'expense' ? 'bg-surface-hover' : ''
          }`}
        >
          <Text
            className={`${
              currentType === 'expense' ? 'text-expense' : 'text-muted'
            } font-bold`}
          >
            Expense
          </Text>
        </Pressable>
        <Pressable
          onPress={() => {
            setCurrentType('income');
            setValue('type', 'income');
          }}
          className={`flex-1 py-3 rounded-xl items-center ${
            currentType === 'income' ? 'bg-surface-hover' : ''
          }`}
        >
          <Text
            className={`${
              currentType === 'income' ? 'text-income' : 'text-muted'
            } font-bold`}
          >
            Income
          </Text>
        </Pressable>
      </View>

      <View className="space-y-4">
        {/* Category Dropdown for Expenses */}
        {currentType === 'expense' && (
          <View className="mb-4">
            <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
              Category
            </Text>
            <Controller
              control={control}
              name="category"
              render={({ field: { onChange, onBlur, value } }) => (
                <Pressable
                  onPress={() => setShowCatPicker(true)}
                  className="bg-surface flex-row items-center justify-between p-4 rounded-2xl border border-default"
                >
                  <Text className={value ? 'text-primary' : 'text-muted'}>
                    {value || 'Select a category'}
                  </Text>
                  <Ionicons name="chevron-down" size={18} color="#64748b" />
                </Pressable>
              )}
            />
            {errors.category && (
              <Text className="text-expense text-xs mt-1 ml-1">
                {errors.category.message}
              </Text>
            )}
          </View>
        )}

        {/* Amount Field */}
        <View className="mt-4">
          <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
            Amount (₦)
          </Text>
          <Controller
            control={control}
            name="amount"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface text-primary p-4 rounded-2xl border border-default"
                placeholder="0.00"
                placeholderTextColor="#64748b"
                keyboardType="numeric"
                value={value ? value.toString() : ''}
                onChangeText={text => {
                  const num = parseFloat(text) || 0;
                  onChange(num);
                }}
                onBlur={onBlur}
              />
            )}
          />
          {errors.amount && (
            <Text className="text-expense text-xs mt-1 ml-1">
              {errors.amount.message}
            </Text>
          )}
        </View>

        {/* Description Field */}
        <View className="mt-4">
          <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
            {currentType === 'income'
              ? 'Description (Optional)'
              : 'Note (Optional)'}
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface text-primary p-4 rounded-2xl border border-default"
                placeholder={
                  currentType === 'income'
                    ? 'e.g. Salary bonus, Gift'
                    : 'e.g. Lunch with friends'
                }
                placeholderTextColor="#64748b"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>

        {/* Account/Source Selection */}
        <View className="mt-4">
          <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
            {currentType === 'income' ? 'Account / Cash' : 'Source'}
          </Text>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            className="flex-row"
            contentContainerStyle={{ paddingBottom: 10 }}
          >
            <View className="flex-row items-center">
              {accounts.map((acc: { id: number; name: string }) => {
                const isSelected = watchedAccount === acc.name;
                return (
                  <Pressable
                    key={acc.name}
                    onPress={() => setValue('account', acc.name)}
                    className={`mr-2 px-5 py-2.5 rounded-full border ${
                      isSelected
                        ? 'bg-accent border-accent'
                        : 'bg-surface border-default'
                    }`}
                  >
                    <Text
                      className={
                        isSelected
                          ? 'text-on-accent font-bold'
                          : 'text-secondary'
                      }
                    >
                      {acc.name}
                    </Text>
                  </Pressable>
                );
              })}
              {currentType === 'income' && (
                <Pressable
                  onPress={() => setShowAccModal(true)}
                  className="w-11 h-11 items-center justify-center rounded-full border border-default bg-surface"
                >
                  <Ionicons name="add" size={24} color="#94a3b8" />
                </Pressable>
              )}
            </View>
          </ScrollView>
        </View>
      </View>

      {/* Save Button */}
      <Pressable
        onPress={handleSubmit(handleFormSubmit)}
        disabled={!isValid}
        className={`bg-accent mt-10 p-5 rounded-2xl items-center shadow-lg mb-20 ${
          !isValid ? 'opacity-50' : ''
        }`}
      >
        <Text className="text-on-accent font-bold text-lg">
          Save {currentType === 'income' ? 'Income' : 'Expense'}
        </Text>
      </Pressable>

      {/* Category Picker Modal */}
      <Modal visible={showCatPicker} transparent animationType="slide">
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setShowCatPicker(false)}
        >
          <Pressable
            className="bg-surface rounded-t-3xl border-t border-default h-[75%]"
            onPress={e => e.stopPropagation()}
          >
            <View className="p-6 pb-2 flex-row justify-between items-center">
              <Text className="text-primary text-xl font-bold">
                Select Category
              </Text>
              <Pressable onPress={() => setShowCatPicker(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </Pressable>
            </View>

            <ScrollView className="flex-1 px-6 mt-2">
              {categories.map((cat: { id: number; name: string }) => (
                <View key={cat.id} className="flex-row items-center mb-2">
                  <Pressable
                    onPress={() => {
                      setValue('category', cat.name);
                      setShowCatPicker(false);
                    }}
                    className={`flex-1 p-4 rounded-2xl flex-row justify-between items-center ${
                      watchedCategory === cat.name
                        ? 'bg-accent'
                        : 'bg-card-inner border border-default'
                    }`}
                  >
                    <Text
                      className={
                        watchedCategory === cat.name
                          ? 'text-on-accent font-medium'
                          : 'text-primary font-medium'
                      }
                    >
                      {cat.name}
                    </Text>
                    {watchedCategory === cat.name && (
                      <Ionicons name="checkmark" size={18} color="white" />
                    )}
                  </Pressable>
                  <Pressable
                    onPress={() => {
                      Alert.alert('Delete Category', `Remove "${cat.name}"?`, [
                        { text: 'Cancel', style: 'cancel' },
                        {
                          text: 'Delete',
                          style: 'destructive',
                          onPress: async () => {
                            const { deleteCategory } =
                              useReferenceStore.getState();
                            await deleteCategory(cat.id);
                            if (watchedCategory === cat.name) {
                              setValue('category', '');
                            }
                          },
                        },
                      ]);
                    }}
                    className="ml-2 w-12 h-12 bg-card-inner border border-default rounded-2xl items-center justify-center active:bg-rose-500/10"
                  >
                    <Ionicons name="trash-outline" size={18} color="#f43f5e" />
                  </Pressable>
                </View>
              ))}
            </ScrollView>

            <View className="p-6 pt-4 border-t border-default bg-surface rounded-b-3xl">
              <Text className="text-muted text-[10px] font-bold uppercase mb-2 ml-1">
                Add New Category
              </Text>
              <View className="flex-row">
                <TextInput
                  className="flex-1 bg-card-inner text-primary p-4 rounded-2xl border border-default mr-2"
                  placeholder="New category..."
                  placeholderTextColor="#64748b"
                  value={newCatName}
                  onChangeText={setNewCatName}
                />
                <Pressable
                  onPress={handleAddCategory}
                  className="bg-accent w-14 h-14 items-center justify-center rounded-2xl"
                >
                  <Ionicons name="add" size={28} color="#fff" />
                </Pressable>
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
