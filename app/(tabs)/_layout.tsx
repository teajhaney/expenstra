import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Tabs } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';
import { Platform, StyleSheet } from 'react-native';
// @ts-ignore
import { GlassView } from 'expo-glass-effect';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

const TAB_BAR_HEIGHT = 60;

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  const tabBarBottomPadding = insets.bottom;
  const tabBarBg = Platform.OS === 'ios' ? 'transparent' : '#f8fafc';

  return (
    <>
      <StatusBar style="dark" />
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: '#4f46e5',
          tabBarInactiveTintColor: '#64748b',
          tabBarStyle: {
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            elevation: 0,
            borderTopWidth: 0,
            backgroundColor: tabBarBg,
            height: TAB_BAR_HEIGHT + tabBarBottomPadding,
            paddingTop: 10,
            paddingBottom: tabBarBottomPadding,
          },
          tabBarBackground: () =>
            Platform.OS === 'ios' ? (
              <GlassView
                style={StyleSheet.absoluteFill}
                glassEffectStyle={'light' as any}
              />
            ) : null,
          headerShown: false, // Cleaner full-screen look
        }}
      >
        <Tabs.Screen
          name="index"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="dashboard" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="logs"
          options={{
            title: 'Logs',
            tabBarIcon: ({ color }) => <TabBarIcon name="list" color={color} />,
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            title: 'Add',
            tabBarIcon: ({ color }) => (
              <TabBarIcon name="plus-circle" color={color} />
            ),
          }}
        />
        <Tabs.Screen
          name="settings"
          options={{
            title: 'Settings',
            tabBarIcon: ({ color }) => <TabBarIcon name="gear" color={color} />,
          }}
        />
      </Tabs>
    </>
  );
}
