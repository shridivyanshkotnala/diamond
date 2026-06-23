import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import type { StoneRate } from '@/types/rates';
import { formatInr } from '@/utils/rateMappers';
import { Colors, Radius } from '@/constants/theme';

interface StoneRatesTableProps {
  title: string;
  rates: StoneRate[];
  onEdit: (rate: StoneRate) => void;
  onAdd: () => void;
}

export function StoneRatesTable({ title, rates, onEdit, onAdd }: StoneRatesTableProps) {
  return (
    <View>
      <Pressable onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>Add {title} Rate</Text>
      </Pressable>
      {rates.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyText}>No {title.toLowerCase()} rates configured yet.</Text>
        </View>
      ) : (
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.table}>
            <View style={styles.headerRow}>
              <Text style={[styles.headerCell, styles.colorCol]}>Color</Text>
              <Text style={[styles.headerCell, styles.clarityCol]}>Clarity</Text>
              <Text style={[styles.headerCell, styles.rateCol]}>Rate</Text>
              <Text style={[styles.headerCell, styles.actionsCol]}>Actions</Text>
            </View>
            {rates.map((rate, index) => (
              <View
                key={rate.id ?? `${rate.color}-${rate.clarity}`}
                style={[styles.dataRow, index < rates.length - 1 && styles.rowBorder]}
              >
                <Text style={[styles.cell, styles.colorCol]}>{rate.color}</Text>
                <Text style={[styles.cell, styles.clarityCol]}>{rate.clarity}</Text>
                <Text style={[styles.cell, styles.rateCol, styles.rateText]}>
                  {formatInr(rate.rate)}
                </Text>
                <View style={styles.actionsCol}>
                  <Pressable onPress={() => onEdit(rate)} style={styles.actionBtn}>
                    <Text style={styles.actionText}>Edit</Text>
                  </Pressable>
                </View>
              </View>
            ))}
          </View>
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    height: 44,
    borderRadius: Radius.button,
    backgroundColor: '#1B3022',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  addBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  emptyCard: {
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: Radius.input,
    padding: 16,
    backgroundColor: Colors.white,
  },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center' },
  table: {
    minWidth: 420,
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
  headerCell: { fontSize: 12, fontWeight: '700', color: Colors.textPrimary, textTransform: 'uppercase' },
  dataRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  rowBorder: { borderBottomWidth: 1, borderBottomColor: Colors.border },
  cell: { fontSize: 13, color: Colors.textPrimary },
  colorCol: { width: 90 },
  clarityCol: { width: 90 },
  rateCol: { width: 110 },
  actionsCol: { flex: 1, minWidth: 72 },
  rateText: { fontWeight: '600' },
  actionBtn: {
    backgroundColor: '#1B3022',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    alignSelf: 'flex-start',
  },
  actionText: { color: Colors.white, fontSize: 11, fontWeight: '600' },
});
