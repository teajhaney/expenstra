import { TransactionRepo } from '@/data/transactionsRepo';
import {
  expenseTransactionSchema,
  TransactionFormData,
} from '@/schemas/transactionSchema';
import { useReferenceStore } from '@/stores/referenceStore';
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

interface ExpenseFormProps {
  onSubmit?: (data: TransactionFormData) => void;
}

export function ExpenseForm({ onSubmit }: ExpenseFormProps) {
  const db = useSQLiteContext();
  const { accounts, categories, addCategory, addAccount } = useReferenceStore();
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showAccModal, setShowAccModal] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newAccName, setNewAccName] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(expenseTransactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'expense',
      account: 'Cash',
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedCategory = watch('category');
  const watchedAccount = watch('account');

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      const repo = new TransactionRepo(db);

      const transactionData = {
        ...data,
        description: data.description?.trim() || data.category || 'Expense',
      };

      await repo.addTransaction(transactionData);

      Alert.alert('Success', 'Expense transaction saved!');

      onSubmit?.(data);

      // Reset form after successful submission
      reset({
        description: '',
        amount: 0,
        type: 'expense',
        account: 'Cash',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
  };

  const handleAddCategory = async () => {
    if (!newCatName.trim()) return;
    await addCategory(newCatName.trim());
    setValue('category', newCatName.trim());
    setNewCatName('');
    setShowCatPicker(false);
  };

  const handleAddAccount = async () => {
    if (!newAccName.trim()) return;
    await addAccount(newAccName.trim());
    setValue('account', newAccName.trim());
    setNewAccName('');
    setShowAccModal(false);
  };

  return (
    <ScrollView className="flex-1 px-4">
      <View className="py-4">
        {/* Category Field */}
        <View className="mt-4">
          <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
            Category
          </Text>
          <Pressable
            onPress={() => setShowCatPicker(true)}
            className="bg-surface p-4 rounded-2xl border border-default flex-row justify-between items-center"
          >
            <Text className={watchedCategory ? 'text-primary' : 'text-muted'}>
              {watchedCategory || 'Select category'}
            </Text>
            <Ionicons name="chevron-down" size={18} color="#64748b" />
          </Pressable>
          {errors.category && (
            <Text className="text-expense text-xs mt-1 ml-1">
              {errors.category.message}
            </Text>
          )}
        </View>

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
            Note (Optional)
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface text-primary p-4 rounded-2xl border border-default"
                placeholder="e.g. Lunch with friends"
                placeholderTextColor="#64748b"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>

        {/* Source Selection */}
        <View className="mt-4">
          <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
            Source
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
        <Text className="text-on-accent font-bold text-lg">Save Expense</Text>
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
            {/* Add Category Section */}
            <View className="my-4 py-4 px-6  bg-card-inner rounded-2xl border border-default">
              <TextInput
                className="bg-surface border border-default rounded-xl p-3 text-primary mb-3"
                placeholder="New category name"
                value={newCatName}
                onChangeText={setNewCatName}
              />
              <Pressable
                onPress={handleAddCategory}
                className="bg-accent p-3 rounded-xl items-center"
              >
                <Text className="text-on-accent font-bold">Add Category</Text>
              </Pressable>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
