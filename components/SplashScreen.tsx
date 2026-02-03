import { Ionicons } from '@expo/vector-icons';
import React, { useEffect } from 'react';
import { Animated, Dimensions, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SplashScreenProps {
  onFinish: () => void;
}

const { width, height } = Dimensions.get('window');

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = new Animated.Value(0);
  const scaleAnim = new Animated.Value(0.8);

  useEffect(() => {
    // Add a small delay before starting animations
    const startDelay = setTimeout(() => {
      // Fade in and scale animation
      Animated.parallel([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 1000,
          useNativeDriver: true,
        }),
        Animated.spring(scaleAnim, {
          toValue: 1,
          tension: 100,
          friction: 8,
          useNativeDriver: true,
        }),
      ]).start();
    }, 300);

    // Auto-hide after 3 seconds (longer display)
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }).start(() => {
        onFinish();
      });
    }, 3500);

    return () => {
      clearTimeout(startDelay);
      clearTimeout(timer);
    };
  }, []);

  return (
    <SafeAreaView className="flex-1 bg-indigo-600 justify-center items-center">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Logo Icon */}
        <View className="w-24 h-24 bg-white rounded-3xl items-center justify-center mb-6 shadow-2xl">
          <Ionicons name="wallet-outline" size={48} color="#4F46E5" />
        </View>

        {/* App Name */}
        <Text className="text-white text-4xl font-bold mb-2 tracking-tight">
          Expenstra
        </Text>

        {/* Tagline */}
        <Text className="text-indigo-200 text-lg text-center px-8">
          Smart Expense Tracking
        </Text>

        {/* Loading Dots */}
        <View className="flex-row mt-8 space-x-2">
          {[0, 1, 2].map(index => (
            <Animated.View
              key={index}
              className="w-2 h-2 bg-white rounded-full"
              style={{
                opacity: fadeAnim,
                transform: [
                  {
                    translateY: fadeAnim.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, index % 2 === 0 ? -10 : 10],
                    }),
                  },
                ],
              }}
            />
          ))}
        </View>
      </Animated.View>

      {/* Version Info */}
      <Text className="text-indigo-300 text-sm absolute bottom-8">
        Version 1.0.0
      </Text>
    </SafeAreaView>
  );
}
