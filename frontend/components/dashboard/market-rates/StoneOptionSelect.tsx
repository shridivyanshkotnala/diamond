import { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { Colors, Radius } from '@/constants/theme';

interface StoneOptionSelectProps {
  label: string;
  value: string;
  options: readonly string[];
  onChange: (value: string) => void;
  placeholder?: string;
  allowClear?: boolean;
  error?: string;
}

export function StoneOptionSelect({
  label,
  value,
  options,
  onChange,
  placeholder = 'Select',
  allowClear = true,
  error,
}: StoneOptionSelectProps) {
  const [open, setOpen] = useState(false);

  return (
    <View style={styles.wrap}>
      <Text style={styles.label}>{label}</Text>
      <Pressable
        onPress={() => setOpen((prev) => !prev)}
        style={[styles.trigger, error ? styles.triggerError : null]}
      >
        <Text style={[styles.triggerText, !value && styles.placeholder]}>
          {value || placeholder}
        </Text>
        <ChevronDown size={16} color={Colors.textMuted} />
      </Pressable>
      {open ? (
        <ScrollView 
          style={styles.menu} 
          nestedScrollEnabled 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          {allowClear ? (
            <Pressable
              onPress={() => {
                onChange('');
                setOpen(false);
              }}
              style={styles.menuItem}
            >
              <Text style={styles.menuItemMuted}>None</Text>
            </Pressable>
          ) : null}
          {options.map((option) => (
            <Pressable
              key={option}
              onPress={() => {
                onChange(option);
                setOpen(false);
              }}
              style={[styles.menuItem, value === option && styles.menuItemActive]}
            >
              <Text style={[styles.menuItemText, value === option && styles.menuItemTextActive]}>
                {option}
              </Text>
            </Pressable>
          ))}
        </ScrollView>
      ) : null}
      {error ? <Text style={styles.error}>{error}</Text> : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { marginBottom: 12 },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  trigger: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.white,
  },
  triggerError: { borderColor: '#D93025' },
  triggerText: { fontSize: 15, color: Colors.textPrimary },
  placeholder: { color: Colors.placeholder },
  menu: {
    marginTop: 4,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    backgroundColor: Colors.white,
    overflow: 'hidden',
    maxHeight: 220,
  },
  menuItem: { paddingHorizontal: 14, paddingVertical: 12 },
  menuItemActive: { backgroundColor: '#E8F0EC' },
  menuItemText: { fontSize: 14, color: Colors.textPrimary },
  menuItemTextActive: { fontWeight: '700', color: '#1B3022' },
  menuItemMuted: { fontSize: 14, color: Colors.textMuted },
  error: { fontSize: 12, color: '#D93025', marginTop: 4 },
});
