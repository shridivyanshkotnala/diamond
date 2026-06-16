import { StyleSheet, TextInput, View } from 'react-native';
import { Search, SlidersHorizontal } from 'lucide-react-native';

import { Colors, Radius } from '@/constants/theme';

interface EmployeeSearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
}

export function EmployeeSearchBar({ value, onChangeText }: EmployeeSearchBarProps) {
  return (
    <View style={styles.wrap}>
      <Search size={18} color={Colors.textMuted} />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder="Search Employee"
        placeholderTextColor={Colors.placeholder}
        style={styles.input}
      />
      <SlidersHorizontal size={18} color={Colors.textPrimary} />
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F0F0F0',
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    minHeight: 48,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 15,
    color: Colors.textPrimary,
    paddingVertical: 10,
  },
});
