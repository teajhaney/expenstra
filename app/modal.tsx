import { StatusBar } from 'expo-status-bar';
import { Platform, View, Text } from 'react-native';

export default function ModalScreen() {
  return (
    <View className="flex-1 items-center justify-center bg-app px-6">
      <Text className="text-primary text-2xl font-bold">About Tracker</Text>
      <View className="h-px w-4/5 bg-divider my-8" />
      
      <Text className="text-secondary text-center leading-relaxed">
        This is your personal, offline-first expense tracker. All your data is stored securely on this device and synchronized with your local SQLite database.
      </Text>

      <View className="mt-10 bg-surface p-6 rounded-3xl border border-default">
        <Text className="text-accent font-bold mb-2">Tip</Text>
        <Text className="text-muted text-sm">
          Use the 'Add' tab to quickly record daily expenses. You can export your data to CSV anytime from the settings.
        </Text>
      </View>

      {/* Use a light status bar on iOS to account for the black space above the modal */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
    </View>
  );
}
