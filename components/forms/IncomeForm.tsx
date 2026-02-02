import { TransactionRepo } from '@/data/transactionsRepo';
import {
  TransactionFormData,
  transactionSchema,
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

interface IncomeFormProps {
  onSubmit?: (data: TransactionFormData) => void;
}

export function IncomeForm({ onSubmit }: IncomeFormProps) {
  const db = useSQLiteContext();
  const { accounts, addAccount } = useReferenceStore();
  const [showAccModal, setShowAccModal] = useState(false);
  const [newAccName, setNewAccName] = useState('');

  const {
    control,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
    defaultValues: {
      description: '',
      amount: 0,
      type: 'income',
      account: 'Cash',
      category: '',
      date: new Date().toISOString().split('T')[0],
    },
  });

  const watchedAccount = watch('account');

  const handleFormSubmit = async (data: TransactionFormData) => {
    try {
      const repo = new TransactionRepo(db);

      const transactionData = {
        ...data,
        description: data.description?.trim() || 'Income',
      };

      await repo.addTransaction(transactionData);

      Alert.alert('Success', 'Income transaction saved!');

      onSubmit?.(data);

      // Reset form after successful submission
      reset({
        description: '',
        amount: 0,
        type: 'income',
        account: 'Cash',
        category: '',
        date: new Date().toISOString().split('T')[0],
      });
    } catch (error) {
      Alert.alert('Error', 'Failed to save transaction');
    }
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
            Description (Optional)
          </Text>
          <Controller
            control={control}
            name="description"
            render={({ field: { onChange, onBlur, value } }) => (
              <TextInput
                className="bg-surface text-primary p-4 rounded-2xl border border-default"
                placeholder="e.g. Salary bonus, Gift"
                placeholderTextColor="#64748b"
                value={value || ''}
                onChangeText={onChange}
                onBlur={onBlur}
              />
            )}
          />
        </View>

        {/* Account Selection */}
        <View className="mt-4 ">
          <Text className="text-muted text-xs mb-2 ml-1 uppercase font-bold">
            Account / Cash
          </Text>
          <View className='flex-row items-cente gap-2'>
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
            <Pressable
              onPress={() => setShowAccModal(true)}
              className="w-11 h-11 items-center justify-center rounded-full border border-default bg-surface"
            >
              <Ionicons name="add" size={24} color="#94a3b8" />
            </Pressable>
          </View>
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
        <Text className="text-on-accent font-bold text-lg">Save Income</Text>
      </Pressable>

      {/* Account Modal */}
      <Modal
        visible={showAccModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAccModal(false)}
      >
        <Pressable
          className="flex-1 justify-end bg-black/60"
          onPress={() => setShowAccModal(false)}
        >
          <View className="bg-surface rounded-t-3xl border-t border-default h-[50%]">
            {/* Fixed Header */}
            <View className="p-6 pb-2 flex-row justify-between items-center">
              <Text className="text-primary text-xl font-bold">
                Add Account
              </Text>
              <Pressable onPress={() => setShowAccModal(false)}>
                <Ionicons name="close" size={24} color="#94a3b8" />
              </Pressable>
            </View>

            {/* Fixed Bottom Section */}
            <View className="px-6 mt-4 pb-6">
              <TextInput
                className="bg-card-inner border border-default rounded-2xl p-4 text-primary mb-4"
                placeholder="Account name"
                value={newAccName}
                onChangeText={setNewAccName}
              />
              <Pressable
                onPress={handleAddAccount}
                className="bg-accent p-4 rounded-2xl items-center"
              >
                <Text className="text-on-accent font-bold">Add Account</Text>
              </Pressable>
            </View>
          </View>
        </Pressable>
      </Modal>
    </ScrollView>
  );
}
