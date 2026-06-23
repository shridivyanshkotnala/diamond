import { Pressable, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { TrendingUp } from 'lucide-react-native';

import type { GoldRate } from '@/types/rates';
import { formatInr } from '@/utils/rateMappers';
import { formatKaratLabel } from '@/utils/goldRateUtils';
import { Colors, Radius } from '@/constants/theme';

interface GoldRatesTableProps {
  rates: GoldRate[];
  onEdit: (rate: GoldRate) => void;
  onIncreaseBy: (rate: GoldRate) => void;
}

function TableHeader() {
  return (
    <View style={styles.headerRow}>
      <Text style={[styles.headerCell, styles.karatCol]}>Karat</Text>
      <Text style={[styles.headerCell, styles.purityCol]}>Purity (%)</Text>
      <Text style={[styles.headerCell, styles.rateCol]}>Final Rate</Text>
      <Text style={[styles.headerCell, styles.actionsCol]}>Actions</Text>
    </View>
  );
}

export function GoldRatesTable({ rates, onEdit, onIncreaseBy }: GoldRatesTableProps) {
  if (rates.length === 0) {
    return null;
  }

  return (
    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
      <View style={styles.table}>
        <TableHeader />
        {rates.map((rate, index) => (
          <View
            key={rate.id ?? rate.carat}
            style={[styles.dataRow, index < rates.length - 1 && styles.rowBorder]}
          >
            <Text style={[styles.cell, styles.karatCol, styles.karatText]}>
              {formatKaratLabel(rate.carat)}
            </Text>
            <Text style={[styles.cell, styles.purityCol]}>{rate.purity.toFixed(1)}</Text>
            <Text style={[styles.cell, styles.rateCol, styles.rateText]}>
              {formatInr(rate.finalRate)}
            </Text>
            <View style={[styles.actionsCol, styles.actionsWrap]}>
              <Pressable onPress={() => onEdit(rate)} style={styles.actionBtn}>
                <Text style={styles.actionText}>Edit</Text>
              </Pressable>
              <Pressable onPress={() => onIncreaseBy(rate)} style={styles.actionBtnOutline}>
                <Text style={styles.actionTextOutline}>Increase By</Text>
              </Pressable>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

interface McxLiveBannerProps {
  mcxLiveRate: number;
}

export function McxLiveBanner({ mcxLiveRate }: McxLiveBannerProps) {
  return (
    <View style={styles.mcxBanner}>
      <View style={styles.mcxIconWrap}>
        <TrendingUp size={18} color="#D4C19C" />
      </View>
      <View style={styles.mcxTextWrap}>
        <Text style={styles.mcxLabel}>MCX Live Rate (24K Gold)</Text>
        <Text style={styles.mcxValue}>
          ₹{mcxLiveRate.toLocaleString('en-IN')} per 10gm
        </Text>
      </View>
    </View>
  );
}

interface GoldEditModalFieldsProps {
  karatLabel: string;
  purity: string;
  finalRate: string;
  purityError: string | null;
  finalRateError: string | null;
  onPurityChange: (value: string) => void;
  onFinalRateChange: (value: string) => void;
}

export function GoldEditModalFields({
  karatLabel,
  purity,
  finalRate,
  purityError,
  finalRateError,
  onPurityChange,
  onFinalRateChange,
}: GoldEditModalFieldsProps) {
  return (
    <View>
      <Text style={styles.modalMeta}>Karat: {karatLabel}</Text>
      <Text style={styles.fieldLabel}>Purity (%)</Text>
      <TextInput
        value={purity}
        onChangeText={onPurityChange}
        keyboardType="decimal-pad"
        placeholder="91.6"
        placeholderTextColor={Colors.placeholder}
        style={[styles.input, purityError ? styles.inputError : null]}
      />
      {purityError ? <Text style={styles.errorText}>{purityError}</Text> : null}
      <Text style={styles.fieldLabel}>Final Rate (₹)</Text>
      <TextInput
        value={finalRate}
        onChangeText={onFinalRateChange}
        keyboardType="number-pad"
        placeholder="150000"
        placeholderTextColor={Colors.placeholder}
        style={[styles.input, finalRateError ? styles.inputError : null]}
      />
      {finalRateError ? <Text style={styles.errorText}>{finalRateError}</Text> : null}
    </View>
  );
}

interface GoldIncreaseModalFieldsProps {
  currentFinalRate: number;
  increaseAmount: string;
  increaseType: 'FLAT' | 'PERCENTAGE';
  increaseError: string | null;
  onIncreaseAmountChange: (value: string) => void;
  onIncreaseTypeChange: (type: 'FLAT' | 'PERCENTAGE') => void;
}

export function GoldIncreaseModalFields({
  currentFinalRate,
  increaseAmount,
  increaseType,
  increaseError,
  onIncreaseAmountChange,
  onIncreaseTypeChange,
}: GoldIncreaseModalFieldsProps) {
  return (
    <View>
      <Text style={styles.fieldLabel}>Current Final Rate</Text>
      <Text style={styles.currentRate}>{formatInr(currentFinalRate)}</Text>
      <Text style={styles.fieldLabel}>Increase By</Text>
      <TextInput
        value={increaseAmount}
        onChangeText={onIncreaseAmountChange}
        keyboardType="decimal-pad"
        placeholder={increaseType === 'PERCENTAGE' ? '5' : '500'}
        placeholderTextColor={Colors.placeholder}
        style={[styles.input, increaseError ? styles.inputError : null]}
      />
      {increaseError ? <Text style={styles.errorText}>{increaseError}</Text> : null}
      <Text style={styles.fieldLabel}>Type</Text>
      <View style={styles.typeRow}>
        <Pressable
          onPress={() => onIncreaseTypeChange('PERCENTAGE')}
          style={[styles.typeBtn, increaseType === 'PERCENTAGE' && styles.typeBtnActive]}
        >
          <Text
            style={[
              styles.typeBtnText,
              increaseType === 'PERCENTAGE' && styles.typeBtnTextActive,
            ]}
          >
            Percentage (%)
          </Text>
        </Pressable>
        <Pressable
          onPress={() => onIncreaseTypeChange('FLAT')}
          style={[styles.typeBtn, increaseType === 'FLAT' && styles.typeBtnActive]}
        >
          <Text
            style={[styles.typeBtnText, increaseType === 'FLAT' && styles.typeBtnTextActive]}
          >
            Rupees (₹)
          </Text>
        </Pressable>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  table: {
    minWidth: 520,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    overflow: 'hidden',
    backgroundColor: Colors.white,
  },
  headerRow: {
    flexDirection: 'row',
    backgroundColor: '#F0F0F0',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  headerCell: {
    fontSize: 12,
    fontWeight: '700',
    color: Colors.textPrimary,
    textTransform: 'uppercase',
  },
  dataRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  cell: { fontSize: 13, color: Colors.textPrimary },
  karatCol: { width: 72 },
  purityCol: { width: 88 },
  rateCol: { width: 110 },
  actionsCol: { flex: 1, minWidth: 160 },
  karatText: { fontWeight: '700' },
  rateText: { fontWeight: '600' },
  actionsWrap: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  actionBtn: {
    backgroundColor: '#1B3022',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  actionBtnOutline: {
    borderWidth: 1,
    borderColor: '#1B3022',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  actionText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
  actionTextOutline: { color: '#1B3022', fontSize: 11, fontWeight: '600' },
  mcxBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1B3022',
    borderRadius: Radius.input,
    padding: 16,
    gap: 12,
  },
  mcxIconWrap: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mcxTextWrap: { flex: 1 },
  mcxLabel: { fontSize: 12, color: 'rgba(255,255,255,0.85)', marginBottom: 4 },
  mcxValue: { fontSize: 20, fontWeight: '700', color: Colors.white },
  modalMeta: { fontSize: 13, color: Colors.textMuted, marginBottom: 12 },
  fieldLabel: {
    fontSize: 12,
    color: Colors.textMuted,
    marginBottom: 6,
    marginTop: 8,
    fontWeight: '600',
    textTransform: 'uppercase',
  },
  currentRate: { fontSize: 18, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
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
  errorText: { fontSize: 12, color: '#D93025', marginTop: 4 },
  typeRow: { flexDirection: 'row', gap: 8 },
  typeBtn: {
    flex: 1,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    paddingVertical: 10,
  },
  typeBtnActive: { borderColor: '#1B3022', backgroundColor: '#E8F0EC' },
  typeBtnText: { fontSize: 12, fontWeight: '600', color: Colors.textSecondary },
  typeBtnTextActive: { color: '#1B3022' },
});
