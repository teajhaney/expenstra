import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-slate-950 px-6">
      <Text className="text-white text-2xl font-bold">About Tracker</Text>
      <View className="h-px w-4/5 bg-slate-800 my-8" />
      
      <Text className="text-slate-400 text-center leading-relaxed">
        This is your personal, offline-first expense tracker. All your data is stored securely on this device and synchronized with your local SQLite database.
      </Text>

      <View className="mt-10 bg-slate-900 p-6 rounded-3xl border border-slate-800">
        <Text className="text-indigo-400 font-bold mb-2">Tip</Text>
        <Text className="text-slate-500 text-sm">
          Use the 'Add' tab to quickly record daily expenses. You can export your data to CSV anytime from the settings.
        </Text>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
