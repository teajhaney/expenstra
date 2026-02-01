import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface ThemeState {
  // Currently light-only, but structure ready for future theme options
  themePreference: 'light' | 'system';
  resolvedTheme: 'light';
}

interface ThemeActions {
  setThemePreference: (preference: 'light' | 'system') => void;
  // Placeholder for future theme functionality
}

type ThemeStore = ThemeState & ThemeActions;

export const useThemeStore = create<ThemeStore>()(
  persist(
    (set) => ({
      themePreference: 'light',
      resolvedTheme: 'light',
      
      setThemePreference: (preference) =>
        set((state) => ({
          themePreference: preference,
          resolvedTheme: 'light', // Always light for now
        })),
    }),
    {
      name: 'theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
