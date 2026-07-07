import {
  ActivityIndicator,
  Modal,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { X } from 'lucide-react-native';

import { StoneOptionSelect } from '@/components/dashboard/market-rates/StoneOptionSelect';
import {
  type StoneRateKind,
  type StoneSelectOption,
} from '@/constants/stoneRateOptions';
import { Colors, Radius } from '@/constants/theme';

interface StoneRateFormModalProps {
  visible: boolean;
  mode: StoneRateKind;
  isNew: boolean;
  color: string;
  clarity: string;
  shape?: string;
  rateValue: string;
  errors: { color?: string; clarity?: string; shape?: string; rate?: string };
  saving?: boolean;
  colorOptions: readonly StoneSelectOption[];
  clarityOptions: readonly StoneSelectOption[];
  shapeOptions?: readonly StoneSelectOption[];
  onColorChange: (value: string) => void;
  onClarityChange: (value: string) => void;
  onShapeChange?: (value: string) => void;
  onRateChange: (value: string) => void;
  onClose: () => void;
  onSave: () => void;
  onAddCustomColor?: (value: string) => void;
  onAddCustomClarity?: (value: string) => void;
  onAddCustomShape?: (value: string) => void;
  validateCustomValue?: (value: string, type: 'color' | 'clarity' | 'shape') => string | null;
}

export function StoneRateFormModal({
  visible,
  mode,
  isNew,
  color,
  clarity,
  shape,
  rateValue,
  errors,
  saving = false,
  colorOptions,
  clarityOptions,
  shapeOptions,
  onColorChange,
  onClarityChange,
  onShapeChange,
  onRateChange,
  onClose,
  onSave,
  onAddCustomColor,
  onAddCustomClarity,
  onAddCustomShape,
  validateCustomValue,
}: StoneRateFormModalProps) {
  const title = mode === 'diamond' ? 'Diamond' : 'Colorstone';
  const allowCustom = true;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <Pressable onPress={onClose} hitSlop={8} style={styles.close}>
            <X size={20} color={Colors.textSecondary} />
          </Pressable>
          <Text style={styles.title}>
            {isNew ? 'Add' : 'Edit'} {title} Rate
          </Text>
          <Text style={styles.hint}>
            Select Color only, Clarity only, or both. At least one is required.
          </Text>

          <StoneOptionSelect
            label="Color"
            value={color}
            options={colorOptions}
            onChange={onColorChange}
            placeholder={`Select ${title.toLowerCase()} color`}
            error={errors.color}
            allowCustom={allowCustom}
            customLabel="Add Custom Color"
            customInputLabel="Add Custom Color"
            customPlaceholder="e.g. AB"
            onAddCustom={onAddCustomColor}
            normalizeCustomValue={(input) =>
              mode === 'diamond' ? input.trim().toUpperCase() : input.trim()
            }
            validateCustomValue={(value) => validateCustomValue?.(value, 'color') ?? null}
          />
          <StoneOptionSelect
            label="Clarity"
            value={clarity}
            options={clarityOptions}
            onChange={onClarityChange}
            placeholder="Select clarity"
            error={errors.clarity}
            allowCustom={allowCustom}
            customLabel="Add Custom Clarity"
            customInputLabel="Add Custom Clarity"
            customPlaceholder="e.g. IF"
            onAddCustom={onAddCustomClarity}
            normalizeCustomValue={(input) => input.trim().toUpperCase()}
            validateCustomValue={(value) => validateCustomValue?.(value, 'clarity') ?? null}
          />
          {mode === 'diamond' && shapeOptions && onShapeChange ? (
            <StoneOptionSelect
              label="Shape"
              value={shape ?? ''}
              options={shapeOptions}
              onChange={onShapeChange}
              placeholder="Select shape"
              error={errors.shape}
              allowClear
              allowCustom={allowCustom}
              customLabel="Add Custom Shape"
              customInputLabel="Add Custom Shape"
              customPlaceholder="e.g. HS"
              onAddCustom={onAddCustomShape}
              normalizeCustomValue={(input) => input.trim().toUpperCase()}
              validateCustomValue={(value) => validateCustomValue?.(value, 'shape') ?? null}
            />
          ) : null}

          <Text style={styles.fieldLabel}>Rate / ct (₹)</Text>
          <TextInput
            value={rateValue}
            onChangeText={onRateChange}
            keyboardType="decimal-pad"
            placeholder="5000"
            placeholderTextColor={Colors.placeholder}
            style={[styles.input, errors.rate ? styles.inputError : null]}
          />
          {errors.rate ? <Text style={styles.error}>{errors.rate}</Text> : null}

          <View style={styles.actions}>
            <Pressable onPress={onClose} style={styles.cancelBtn}>
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
            <TouchableOpacity
              activeOpacity={0.9}
              onPress={onSave}
              disabled={saving}
              style={[styles.saveBtn, saving && styles.saveBtnDisabled]}
            >
              {saving ? (
                <ActivityIndicator color={Colors.white} />
              ) : (
                <Text style={styles.saveText}>Save</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  card: {
    width: '100%',
    backgroundColor: Colors.white,
    borderRadius: Radius.input,
    padding: 20,
  },
  close: { alignSelf: 'flex-end' },
  title: { fontSize: 16, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  hint: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: Colors.textMuted,
    textTransform: 'uppercase',
    marginBottom: 6,
  },
  input: {
    minHeight: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingHorizontal: 14,
    fontSize: 16,
    color: Colors.textPrimary,
  },
  inputError: { borderColor: '#D93025' },
  error: { fontSize: 12, color: '#D93025', marginTop: 4 },
  actions: { flexDirection: 'row', gap: 10, marginTop: 20 },
  cancelBtn: {
    flex: 1,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cancelText: { fontSize: 15, fontWeight: '600', color: Colors.textSecondary },
  saveBtn: {
    flex: 1,
    height: 48,
    backgroundColor: '#1B3022',
    borderRadius: Radius.button,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveBtnDisabled: { opacity: 0.7 },
  saveText: { fontSize: 15, fontWeight: '600', color: Colors.white },
});
