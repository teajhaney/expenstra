import { Text } from 'react-native';

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
}

export default function SectionHeader({ title, subtitle }: SectionHeaderProps) {
  return (
    <>
      <Text className="text-primary text-3xl font-bold">{title}</Text>
      {subtitle && (
        <Text className="text-secondary text-sm mt-1">{subtitle}</Text>
      )}
    </>
  );
}
