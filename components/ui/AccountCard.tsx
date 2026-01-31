import GlassCard from '@/components/GlassCard';
import { formatNaira } from '@/utils/format';
import { Text, View } from 'react-native';

interface AccountCardProps {
  account: string;
  balance: number;
  income: number;
  expense: number;
  className?: string;
  /** When true, card expands to fill container (e.g. when only one in list) */
  fullWidth?: boolean;
}

export default function AccountCard({
  account,
  balance,
  income,
  expense,
  className = '',
  fullWidth = false,
}: AccountCardProps) {
  const widthClass = fullWidth ? 'flex-1 min-w-0' : 'min-w-[200px]';
  return (
    <GlassCard className={`${widthClass} ${className}`}>
      <Text className="text-slate-400 text-[10px] uppercase font-bold mb-3 tracking-widest">
        {account}
      </Text>
      <Text className="text-white text-2xl font-bold mb-3">
        {formatNaira(balance)}
      </Text>
      <View className="flex-row justify-between border-t border-white/5 pt-3">
        <View>
          <Text className="text-slate-500 text-[10px] uppercase font-bold mb-0.5">
            In
          </Text>
          <Text className="text-emerald-400 text-sm font-bold">
            +{formatNaira(income)}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-slate-500 text-[10px] uppercase font-bold mb-0.5">
            Out
          </Text>
          <Text className="text-rose-400 text-sm font-bold">
            -{formatNaira(expense)}
          </Text>
        </View>
      </View>
    </GlassCard>
  );
}
