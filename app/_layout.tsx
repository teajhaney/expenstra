import SplashScreenComponent from '@/components/SplashScreen';
import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { SQLiteProvider } from 'expo-sqlite';
import { useState } from 'react';
import { Text } from 'react-native';
import 'react-native-reanimated';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import '../global.css';

import { migrateDbIfNeeded } from '@/db';
import { StoreProvider } from '../providers/StoreProvider';

export {
  // Catch any errors thrown by the Layout component.
  ErrorBoundary,
} from 'expo-router';

export const unstable_settings = {
  // Ensure that reloading on `/modal` keeps a back button present.
  initialRouteName: '(tabs)',
};

// Respect user system font size (accessibility) with a cap to avoid layout break
// Text.defaultProps exists at runtime; RN types omit it, so we cast.
const RNText = Text as typeof Text & {
  defaultProps?: { allowFontScaling?: boolean; maxFontSizeMultiplier?: number };
};
if (RNText.defaultProps == null) RNText.defaultProps = {};
RNText.defaultProps.allowFontScaling = true;
RNText.defaultProps.maxFontSizeMultiplier = 1.5;

export default function RootLayout() {
  const [showSplash, setShowSplash] = useState(true);

  const handleSplashFinish = () => {
    setShowSplash(false);
  };

  // Show custom splash screen
  if (showSplash) {
    return <SplashScreenComponent onFinish={handleSplashFinish} />;
  }

  return <RootLayoutNav />;
}

function RootLayoutNav() {
  return (
    <SafeAreaProvider>
      <SQLiteProvider databaseName="expenses.db" onInit={migrateDbIfNeeded}>
        <StoreProvider>
          <ThemeProvider value={DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
            </Stack>
          </ThemeProvider>
        </StoreProvider>
      </SQLiteProvider>
    </SafeAreaProvider>
  );
}
