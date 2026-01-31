import { Ionicons } from '@expo/vector-icons';
import { Pressable, Text, View } from 'react-native';

interface MonthNavigatorProps {
  currentDate: Date;
  onNavigate: (direction: -1 | 1) => void;
  disableFuture?: boolean;
}

export default function MonthNavigator({
  currentDate,
  onNavigate,
  disableFuture = true,
}: MonthNavigatorProps) {
  const isCurrentMonth =
    currentDate.getMonth() === new Date().getMonth() &&
    currentDate.getFullYear() === new Date().getFullYear();

  return (
    <View className="items-center mb-2">
      <View className="flex-row items-center justify-center bg-slate-900/50 rounded-full px-4 py-1 border border-white/5">
        <Pressable
          onPress={() => onNavigate(-1)}
          className="p-2 active:bg-slate-800 rounded-full"
        >
          <Ionicons name="chevron-back" size={18} color="#94a3b8" />
        </Pressable>
        <Text className="text-slate-300 text-sm font-bold uppercase tracking-widest mx-4 min-w-[100px] text-center">
          {currentDate.toLocaleString('default', {
            month: 'long',
            year: 'numeric',
          })}
        </Text>
        <Pressable
          onPress={() => onNavigate(1)}
          className={`p-2 rounded-full ${
            disableFuture && isCurrentMonth
              ? 'opacity-30'
              : 'active:bg-slate-800'
          }`}
          disabled={disableFuture && isCurrentMonth}
        >
          <Ionicons name="chevron-forward" size={18} color="#94a3b8" />
        </Pressable>
      </View>
    </View>
  );
}
