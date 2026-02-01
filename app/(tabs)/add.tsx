import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

// Components
import { TransactionForm } from '../../components/forms/TransactionForm';

export default function AddTransactionScreen() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-app" edges={['top', 'bottom']}>
      <TransactionForm
        type="expense" // Default to expense, user can toggle
        onSubmit={() => router.back()}
        onCancel={() => router.back()}
      />
    </SafeAreaView>
  );
}
