import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';

import { DeleteStoneRateModal } from '@/components/dashboard/market-rates/DeleteStoneRateModal';
import { ColorstoneRateFormModal } from '@/components/dashboard/market-rates/ColorstoneRateFormModal';
import type { ToastType } from '@/components/scanner/ToastNotification';
import {
  deleteColorstoneRate,
  fetchColorstoneRates,
  upsertColorstoneRate,
} from '@/utils/ratesApi';
import {
  STONE_CLARITY_OPTIONS,
  getColorOptionsForStoneType,
  type StoneSelectOption,
} from '@/constants/stoneRateOptions';
import { screenStyles } from '@/constants/screenLayout';
import { Colors, Radius, Spacing } from '@/constants/theme';
import type { StoneRate, UpsertStoneRatePayload } from '@/types/rates';
import {
  displayStoneField,
  findDuplicateStoneRate,
  formatStoneRatePerCt,
  stoneRateSummary,
  validateStoneRateForm,
} from '@/utils/stoneRateUtils';

const DELETE_RED = '#EA4335';
const BUTTON_GREEN = '#1B3022';

interface ColorstoneRatesPanelProps {
  onToast?: (message: string, type?: ToastType) => void;
}

interface ColorstoneRatesTableProps {
  rates: StoneRate[];
  onEdit: (rate: StoneRate) => void;
  onDelete: (rate: StoneRate) => void;
  onAdd: () => void;
}

function ColorstoneRatesTable({ rates, onEdit, onDelete, onAdd }: ColorstoneRatesTableProps) {
  return (
    <View>
      <Pressable onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add Colorstone Rate</Text>
      </Pressable>

      {rates.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No colorstone rates yet</Text>
          <Text style={styles.emptyText}>
            Tap Add Colorstone Rate to configure color, clarity, or combined rates per carat.
          </Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {rates.map((rate) => (
            <View key={rate.id} style={styles.rateCard}>
              <View style={styles.cardRow}>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Color</Text>
                  <Text style={styles.cardValue}>{displayStoneField(rate.color)}</Text>
                </View>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Clarity</Text>
                  <Text style={styles.cardValue}>{displayStoneField(rate.clarity)}</Text>
                </View>
              </View>

              <View style={styles.cardRow}>
                <View style={styles.cardField}>
                  <Text style={styles.cardLabel}>Rate</Text>
                  <Text style={styles.cardValue}>{formatStoneRatePerCt(rate.rate)}</Text>
                </View>
              </View>

              <View style={styles.cardDivider} />

              <View style={styles.cardActions}>
                <Pressable onPress={() => onEdit(rate)} style={styles.editBtn}>
                  <Pencil size={14} color={Colors.white} />
                  <Text style={styles.editText}>Edit</Text>
                </Pressable>
                <Pressable onPress={() => onDelete(rate)} style={styles.deleteBtn}>
                  <Trash2 size={14} color={DELETE_RED} />
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

export function ColorstoneRatesPanel({ onToast }: ColorstoneRatesPanelProps) {
  const [rates, setRates] = useState<StoneRate[]>([]);
  const [editingRate, setEditingRate] = useState<StoneRate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [color, setColor] = useState('');
  const [clarity, setClarity] = useState('');
  const [rateValue, setRateValue] = useState('');
  const [formErrors, setFormErrors] = useState<{
    color?: string;
    clarity?: string;
    rate?: string;
  }>({});
  const [deletingRate, setDeletingRate] = useState<StoneRate | null>(null);
  const [saving, setSaving] = useState(false);

  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customClarities, setCustomClarities] = useState<string[]>([]);

  const notify = (message: string, type: ToastType = 'info') => {
    onToast?.(message, type);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data = await fetchColorstoneRates();
        if (active) setRates(data);
      } catch (err) {
        if (active) notify('Failed to load rates', 'error');
      }
    };
    load();
    return () => {
      active = false;
    };
  }, []);

  const colorOptions = useMemo<StoneSelectOption[]>(() => {
    const defaults = getColorOptionsForStoneType('colorstone');
    const fromRates = rates.map((rate) => rate.color).filter(Boolean);
    const merged = [...defaults, ...fromRates, ...customColors]
      .map((value) => value.trim())
      .filter(Boolean);
    const unique = Array.from(new Set(merged));
    return unique.map((option) => ({ value: option, label: option }));
  }, [rates, customColors]);

  const clarityOptions = useMemo<StoneSelectOption[]>(() => {
    const fromRates = rates.map((rate) => rate.clarity).filter(Boolean);
    const merged = [...STONE_CLARITY_OPTIONS, ...fromRates, ...customClarities]
      .map((value) => value.trim().toUpperCase())
      .filter(Boolean);
    const unique = Array.from(new Set(merged));
    return unique.map((option) => ({ value: option, label: option }));
  }, [rates, customClarities]);

  const openAdd = () => {
    setIsNew(true);
    setEditingRate(null);
    setColor('');
    setClarity('');
    setRateValue('');
    setFormErrors({});
  };

  const openEdit = (rate: StoneRate) => {
    setIsNew(false);
    setEditingRate(rate);
    setColor(rate.color);
    setClarity(rate.clarity);
    setRateValue(String(rate.rate));
    setFormErrors({});
  };

  const closeForm = () => {
    setIsNew(false);
    setEditingRate(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    const errors = validateStoneRateForm(color, clarity, rateValue, undefined, false);
    if (errors) {
      setFormErrors(errors);
      return;
    }

    const trimmedColor = color.trim();
    const trimmedClarity = clarity.trim().toUpperCase();
    const rate = Number(rateValue);

    if (
      findDuplicateStoneRate(
        rates,
        trimmedColor,
        trimmedClarity,
        '',
        editingRate?.id,
      )
    ) {
      notify('A rate with the same color and clarity already exists.', 'error');
      return;
    }

    setSaving(true);
    try {
      const payload: UpsertStoneRatePayload = {
        color: trimmedColor,
        clarity: trimmedClarity,
        rate,
      };

      const savedRate = await upsertColorstoneRate(payload);

      setRates((prev) => {
        if (editingRate) {
          return prev.map((item) => (item.id === editingRate.id ? savedRate : item));
        }
        return [...prev, savedRate];
      });

      closeForm();
      notify(`Colorstone rate ${editingRate ? 'updated' : 'added'}`, 'success');
    } catch (err) {
      notify('Failed to save colorstone rate', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRate) return;
    setSaving(true);
    try {
      await deleteColorstoneRate(deletingRate.id);
      setRates((prev) => prev.filter((item) => item.id !== deletingRate.id));
      notify('Colorstone rate deleted', 'success');
      setDeletingRate(null);
    } catch (err) {
      notify('Failed to delete colorstone rate', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <ColorstoneRatesTable
        rates={rates}
        onEdit={openEdit}
        onDelete={setDeletingRate}
        onAdd={openAdd}
      />

      <ColorstoneRateFormModal
        visible={isNew || editingRate !== null}
        isNew={isNew}
        color={color}
        clarity={clarity}
        rateValue={rateValue}
        errors={formErrors}
        saving={saving}
        colorOptions={colorOptions}
        clarityOptions={clarityOptions}
        onColorChange={(value) => {
          setColor(value);
          if (formErrors.color || formErrors.clarity) {
            setFormErrors((prev) => ({ ...prev, color: undefined, clarity: undefined }));
          }
        }}
        onClarityChange={(value) => {
          setClarity(value);
          if (formErrors.color || formErrors.clarity) {
            setFormErrors((prev) => ({ ...prev, color: undefined, clarity: undefined }));
          }
        }}
        onRateChange={(value) => {
          setRateValue(value.replace(/[^\d.]/g, ''));
          if (formErrors.rate) {
            setFormErrors((prev) => ({ ...prev, rate: undefined }));
          }
        }}
        onAddCustomColor={(value) => {
          if (!customColors.includes(value)) setCustomColors((prev) => [...prev, value]);
        }}
        onAddCustomClarity={(value) => {
          if (!customClarities.includes(value)) setCustomClarities((prev) => [...prev, value]);
        }}
        validateCustomValue={(value, type) => {
          const normalized = type === 'clarity' ? value.trim().toUpperCase() : value.trim();
          const existing = type === 'color' ? colorOptions : clarityOptions;
          if (existing.some((option) => option.value.toUpperCase() === normalized.toUpperCase())) {
            return 'Value already exists.';
          }
          return null;
        }}
        onClose={closeForm}
        onSave={handleSave}
      />

      <DeleteStoneRateModal
        visible={deletingRate !== null}
        title="Delete Colorstone Rate?"
        subtitle={deletingRate ? `This will permanently remove ${stoneRateSummary(deletingRate)}.` : ''}
        onClose={() => setDeletingRate(null)}
        onConfirm={handleConfirmDelete}
        confirming={saving}
      />
    </>
  );
}

const styles = StyleSheet.create({
  addBtn: {
    height: Spacing.buttonHeight,
    borderRadius: Radius.button,
    backgroundColor: BUTTON_GREEN,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.md,
  },
  addBtnText: { color: Colors.white, fontWeight: '600', fontSize: 14 },
  emptyCard: {
    ...screenStyles.emptyCard,
    alignItems: 'center',
  },
  emptyTitle: { fontSize: 15, fontWeight: '700', color: Colors.textPrimary, marginBottom: 6 },
  emptyText: { fontSize: 14, color: Colors.textMuted, textAlign: 'center', lineHeight: 20 },
  cardList: {
    gap: Spacing.md,
  },
  rateCard: {
    borderRadius: 18,
    padding: Spacing.lg,
    backgroundColor: Colors.white,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
    gap: Spacing.lg,
    marginBottom: Spacing.md,
  },
  cardField: {
    flex: 1,
    minWidth: 0,
  },
  cardLabel: {
    fontSize: 12,
    textTransform: 'uppercase',
    letterSpacing: 0.4,
    fontWeight: '600',
    color: Colors.textMuted,
  },
  cardValue: {
    marginTop: 6,
    fontSize: 16,
    fontWeight: '700',
    color: Colors.textPrimary,
  },
  cardDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: Spacing.md,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: BUTTON_GREEN,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  editText: { color: Colors.white, fontSize: 13, fontWeight: '600' },
  deleteBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: '#F5C6C2',
    backgroundColor: '#FCE8E6',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flex: 1,
  },
  deleteText: { color: DELETE_RED, fontSize: 13, fontWeight: '600' },
});
