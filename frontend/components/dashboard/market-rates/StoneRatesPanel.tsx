import { useEffect, useMemo, useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import { Pencil, Trash2 } from 'lucide-react-native';

import { DeleteStoneRateModal } from '@/components/dashboard/market-rates/DeleteStoneRateModal';
import { StoneRateFormModal } from '@/components/dashboard/market-rates/StoneRateFormModal';
import type { ToastType } from '@/components/scanner/ToastNotification';
import {
  deleteColorstoneRate,
  deleteDiamondRate,
  fetchColorstoneRates,
  fetchDiamondRates,
  upsertColorstoneRate,
  upsertDiamondRate,
} from '@/utils/ratesApi';
import {
  DIAMOND_SHAPE_OPTIONS,
  STONE_CLARITY_OPTIONS,
  getColorOptionsForStoneType,
  type StoneRateKind,
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

interface StoneRatesTableProps {
  title: string;
  rates: StoneRate[];
  showShape: boolean;
  onEdit: (rate: StoneRate) => void;
  onDelete: (rate: StoneRate) => void;
  onAdd: () => void;
}

function StoneRatesTable({ title, rates, showShape, onEdit, onDelete, onAdd }: StoneRatesTableProps) {
  const shapeLabelMap = useMemo(
    () =>
      new Map(
        DIAMOND_SHAPE_OPTIONS.map((option) => [option.value.toUpperCase(), option.label]),
      ),
    [],
  );

  return (
    <View>
      <Pressable onPress={onAdd} style={styles.addBtn}>
        <Text style={styles.addBtnText}>+ Add {title} Rate</Text>
      </Pressable>

      {rates.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No {title.toLowerCase()} rates yet</Text>
          <Text style={styles.emptyText}>
            Tap Add {title} Rate to configure color, clarity, or combined rates per carat.
          </Text>
        </View>
      ) : (
        <View style={styles.cardList}>
          {rates.map((rate) => {
            const shapeValue = (() => {
              if (!showShape) return null;
              const rawShape = rate.shape ?? '';
              const normalized = String(rawShape).trim();
              if (!normalized || normalized === '0') return 'None';
              const label = shapeLabelMap.get(normalized.toUpperCase());
              return label ? label : normalized;
            })();

            return (
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

                {showShape ? (
                  <View style={styles.cardRow}>
                    <View style={styles.cardField}>
                      <Text style={styles.cardLabel}>Shape</Text>
                      <Text style={styles.cardValue}>{shapeValue}</Text>
                    </View>
                    <View style={styles.cardField}>
                      <Text style={styles.cardLabel}>Rate</Text>
                      <Text style={styles.cardValue}>{formatStoneRatePerCt(rate.rate)}</Text>
                    </View>
                  </View>
                ) : (
                  <View style={styles.cardRow}>
                    <View style={styles.cardField}>
                      <Text style={styles.cardLabel}>Rate</Text>
                      <Text style={styles.cardValue}>{formatStoneRatePerCt(rate.rate)}</Text>
                    </View>
                  </View>
                )}

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
            );
          })}
        </View>
      )}
    </View>
  );
}

interface StoneRatesPanelProps {
  stoneType: StoneRateKind;
  onToast?: (message: string, type?: ToastType) => void;
}

export function StoneRatesPanel({ stoneType, onToast }: StoneRatesPanelProps) {
  const title = stoneType === 'diamond' ? 'Diamond' : 'Colorstone';
  const [rates, setRates] = useState<StoneRate[]>([]);
  const [editingRate, setEditingRate] = useState<StoneRate | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [color, setColor] = useState('');
  const [clarity, setClarity] = useState('');
  const [shape, setShape] = useState('');
  const [rateValue, setRateValue] = useState('');
  const [formErrors, setFormErrors] = useState<{
    color?: string;
    clarity?: string;
    shape?: string;
    rate?: string;
  }>({});
  const [deletingRate, setDeletingRate] = useState<StoneRate | null>(null);
  const [saving, setSaving] = useState(false);

  const [customColors, setCustomColors] = useState<string[]>([]);
  const [customClarities, setCustomClarities] = useState<string[]>([]);
  const [customShapes, setCustomShapes] = useState<string[]>([]);

  const showShape = stoneType === 'diamond';

  const normalizeDiamondOption = (value: string) => value.trim().toUpperCase();
  const normalizeColorOption = (value: string) =>
    stoneType === 'diamond' ? normalizeDiamondOption(value) : value.trim();

  const colorOptions = useMemo<StoneSelectOption[]>(() => {
    const defaults = getColorOptionsForStoneType(stoneType);
    const fromRates = rates.map((rate) => rate.color).filter(Boolean);
    const merged = [...defaults, ...fromRates, ...customColors]
      .map(normalizeColorOption)
      .filter(Boolean);
    const unique = Array.from(new Set(merged));
    return unique.map((option) => ({ value: option, label: option }));
  }, [stoneType, rates, customColors]);

  const clarityOptions = useMemo<StoneSelectOption[]>(() => {
    const fromRates = rates.map((rate) => rate.clarity).filter(Boolean);
    const merged = [...STONE_CLARITY_OPTIONS, ...fromRates, ...customClarities]
      .map(normalizeDiamondOption)
      .filter(Boolean);
    const unique = Array.from(new Set(merged));
    return unique.map((option) => ({ value: option, label: option }));
  }, [rates, customClarities]);

  const shapeOptions = useMemo<StoneSelectOption[]>(() => {
    if (!showShape) return [];
    const defaultShapes = DIAMOND_SHAPE_OPTIONS.map((option) => option.value);
    const fromRates = rates.map((rate) => rate.shape ?? '').filter(Boolean);
    const shapeMap = new Map(
      DIAMOND_SHAPE_OPTIONS.map((option) => [option.value.toUpperCase(), option.value]),
    );
    const normalizeShape = (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) return '';
      const upper = trimmed.toUpperCase();
      return shapeMap.get(upper) ?? upper;
    };
    const merged = [...defaultShapes, ...fromRates, ...customShapes]
      .map(normalizeShape)
      .filter(Boolean);
    const unique = Array.from(new Set(merged));
    const labelMap = new Map<string, string>(
      DIAMOND_SHAPE_OPTIONS.map((option) => [option.value, option.label]),
    );
    return unique.map((option) => ({
      value: option,
      label: labelMap.get(option) ?? option,
    }));
  }, [rates, customShapes, showShape]);

  const notify = (message: string, type: ToastType = 'info') => {
    onToast?.(message, type);
  };

  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        const data =
          stoneType === 'diamond' ? await fetchDiamondRates() : await fetchColorstoneRates();
        if (active) setRates(data);
      } catch (err) {
        if (active) notify('Failed to load rates', 'error');
      }
    };
    load();
    return () => {
      active = false;
    };
  }, [stoneType]);

  const openAdd = () => {
    setIsNew(true);
    setEditingRate(null);
    setColor('');
    setClarity('');
    setShape('');
    setRateValue('');
    setFormErrors({});
  };

  const openEdit = (rate: StoneRate) => {
    setIsNew(false);
    setEditingRate(rate);
    setColor(rate.color);
    setClarity(rate.clarity);
    setShape(rate.shape ?? '');
    setRateValue(String(rate.rate));
    setFormErrors({});
  };

  const closeForm = () => {
    setIsNew(false);
    setEditingRate(null);
    setFormErrors({});
  };

  const handleSave = async () => {
    const errors = validateStoneRateForm(color, clarity, rateValue, shape, false);
    if (errors) {
      setFormErrors(errors);
      return;
    }

    const trimmedColor =
      stoneType === 'diamond' ? color.trim().toUpperCase() : color.trim();
    const trimmedClarity = clarity.trim().toUpperCase();
    const trimmedShape = showShape ? shape.trim().toUpperCase() : '';
    const rate = Number(rateValue);

    if (
      findDuplicateStoneRate(
        rates,
        trimmedColor,
        trimmedClarity,
        trimmedShape,
        editingRate?.id,
      )
    ) {
      notify(
        showShape
          ? 'A rate with the same color, clarity, and shape already exists.'
          : 'A rate with the same color and clarity already exists.',
        'error',
      );
      return;
    }

    setSaving(true);
    try {
      const payload: UpsertStoneRatePayload = {
        color: trimmedColor,
        clarity: trimmedClarity,
        rate,
      };
      // Only include shape if it's not empty and for diamond rates
      if (showShape && trimmedShape) {
        payload.shape = trimmedShape;
      }
      const savedRate =
        stoneType === 'diamond'
          ? await upsertDiamondRate(payload)
          : await upsertColorstoneRate(payload);

      setRates((prev) => {
        if (editingRate) {
          return prev.map((item) => (item.id === editingRate.id ? savedRate : item));
        }
        return [...prev, savedRate];
      });

      closeForm();
      notify(`${title} rate ${editingRate ? 'updated' : 'added'}`, 'success');
    } catch (err) {
      notify(`Failed to save ${title.toLowerCase()} rate`, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmDelete = async () => {
    if (!deletingRate) return;
    setSaving(true);
    try {
      if (stoneType === 'diamond') {
        await deleteDiamondRate(deletingRate.id);
      } else {
        await deleteColorstoneRate(deletingRate.id);
      }
      setRates((prev) => prev.filter((item) => item.id !== deletingRate.id));
      notify(`${title} rate deleted`, 'success');
      setDeletingRate(null);
    } catch (err) {
      notify(`Failed to delete ${title.toLowerCase()} rate`, 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <>
      <StoneRatesTable
        title={title}
        rates={rates}
        showShape={showShape}
        onEdit={openEdit}
        onDelete={setDeletingRate}
        onAdd={openAdd}
      />

      <StoneRateFormModal
        visible={isNew || editingRate !== null}
        mode={stoneType}
        isNew={isNew}
        color={color}
        clarity={clarity}
        shape={shape}
        rateValue={rateValue}
        errors={formErrors}
        saving={saving}
        colorOptions={colorOptions}
        clarityOptions={clarityOptions}
        shapeOptions={showShape ? shapeOptions : undefined}
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
        onShapeChange={(value) => {
          setShape(value);
          if (formErrors.shape) {
            setFormErrors((prev) => ({ ...prev, shape: undefined }));
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
        onAddCustomShape={(value) => {
          if (!customShapes.includes(value)) setCustomShapes((prev) => [...prev, value]);
        }}
        validateCustomValue={(value, type) => {
          const normalized = value.trim().toUpperCase();
          const existing =
            type === 'color'
              ? colorOptions
              : type === 'clarity'
                ? clarityOptions
                : shapeOptions;
          if (existing?.some((option) => option.value.toUpperCase() === normalized)) {
            return 'Value already exists.';
          }
          return null;
        }}
        onClose={closeForm}
        onSave={handleSave}
      />

      <DeleteStoneRateModal
        visible={deletingRate !== null}
        title={`Delete ${title} Rate?`}
        subtitle={
          deletingRate
            ? `This will permanently remove ${stoneRateSummary(deletingRate)}.`
            : ''
        }
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
