import { useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { ExpenseForm } from '../../components/forms/ExpenseForm';
import { IncomeForm } from '../../components/forms/IncomeForm';

export default function AddTransactionScreen() {
  const [transactionType, setTransactionType] = useState<'income' | 'expense'>(
    'expense'
  );

  const handleFormSubmit = () => {
    // Form is handled internally, no navigation needed
    console.log('Transaction submitted');
  };

  return (
    <SafeAreaView className="flex-1 bg-app" edges={['top', 'bottom']}>
      {/* Type Toggle */}
      <View className="mb-8">
        <Text className="text-primary text-[30px] font-bold">
          New {transactionType === 'income' ? 'Income' : 'Expense'}
        </Text>
      </View>

      {/* Type Toggle */}
      <View className="flex-row bg-surface p-1 rounded-2xl mb-6 border border-default">
        <Pressable
          onPress={() => setTransactionType('expense')}
          className={`flex-1 py-3 rounded-xl items-center ${
            transactionType === 'expense' ? 'bg-surface-hover' : ''
          }`}
        >
          <Text
            className={`${
              transactionType === 'expense' ? 'text-expense' : 'text-muted'
            } font-bold`}
          >
            Expense
          </Text>
        </Pressable>
        <Pressable
          onPress={() => setTransactionType('income')}
          className={`flex-1 py-3 rounded-xl items-center ${
            transactionType === 'income' ? 'bg-surface-hover' : ''
          }`}
        >
          <Text
            className={`${
              transactionType === 'income' ? 'text-income' : 'text-muted'
            } font-bold`}
          >
            Income
          </Text>
        </Pressable>
      </View>

      {/* Form Content - Keep both forms mounted to preserve state */}
      <View className="flex-1 relative">
        <View
          className={`absolute inset-0 ${transactionType === 'expense' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <ExpenseForm onSubmit={handleFormSubmit} />
        </View>
        <View
          className={`absolute inset-0 ${transactionType === 'income' ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        >
          <IncomeForm onSubmit={handleFormSubmit} />
        </View>
      </View>
    </SafeAreaView>
  );
}
