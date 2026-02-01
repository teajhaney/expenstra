import GlassCard from '@/components/GlassCard';
import { formatNaira } from '@/utils/format';
import { Text } from 'react-native';

interface BalanceCardProps {
  label: string;
  amount: number;
  variant?: 'default' | 'income' | 'expense';
  className?: string;
}

export default function BalanceCard({ 
  label, 
  amount, 
  variant = 'default',
  className = ''
}: BalanceCardProps) {
  const getAmountColor = () => {
    switch (variant) {
      case 'income':
        return 'text-income';
      case 'expense':
        return 'text-expense';
      default:
        return 'text-primary';
    }
  };

  const getTextSize = () => {
    return variant === 'default' ? 'text-4xl' : 'text-2xl';
  };

  return (
    <GlassCard className={className}>
      <Text className="text-muted text-xs mb-1 font-bold uppercase">
        {label}
      </Text>
      <Text className={`${getAmountColor()} ${getTextSize()} font-bold`}>
        {formatNaira(amount)}
      </Text>
    </GlassCard>
  );
}
