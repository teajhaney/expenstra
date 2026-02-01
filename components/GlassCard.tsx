import { View, ViewProps } from 'react-native';
// @ts-ignore - Library might not have types immediately available
import { GlassView } from 'expo-glass-effect';

const opaqueCardClass =
  'bg-surface rounded-3xl border border-default p-5 shadow-sm elevation-4';

interface GlassCardProps extends ViewProps {
  children: React.ReactNode;
  className?: string; // For passing tailwind classes (layout mostly)
  variant?: 'surface' | 'highlight'; // Optional styling variants
  /** Use opaque card on all platforms (e.g. when glass doesn't show on iOS) */
  forceOpaque?: boolean;
}

export default function GlassCard({
  children,
  style,
  className,
  variant = 'surface',
  forceOpaque = false,
  ...props
}: GlassCardProps) {
  const useOpaque = forceOpaque !== false;

  // Opaque card: reliable on both platforms (glass effect often doesn't render on iOS)
  if (useOpaque) {
    return (
      <View
        className={`${opaqueCardClass} ${className ?? ''}`}
        style={style}
        {...props}
      >
        {children}
      </View>
    );
  }

  // iOS: try glass effect (may not render on some iOS versions/simulators)
  return (
    <GlassView
      style={[{ borderRadius: 24, overflow: 'hidden' }, style]}
      glassEffectStyle={'dark' as any}
      {...props}
    >
      <View className={`p-5 ${className ?? ''}`}>{children}</View>
    </GlassView>
  );
}
