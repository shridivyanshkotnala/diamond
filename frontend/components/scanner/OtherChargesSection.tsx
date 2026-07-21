import { useEffect, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { Plus, Trash2 } from 'lucide-react-native';

import { FormSection } from '@/components/scanner/FormSection';
import { FieldLabel } from '@/components/scanner/FieldLabel';
import { SearchableSelectDropdown } from '@/components/scanner/SearchableSelectDropdown';
import { Colors } from '@/constants/theme';
import {
  ADD_CUSTOM_CHARGE_LABEL,
  ADD_CUSTOM_CHARGE_VALUE,
  DEFAULT_OTHER_CHARGE_OPTIONS,
} from '@/constants/otherCharges';
import type { OtherChargeItem } from '@/types/scanner';
import {
  createOtherChargeMaster,
  fetchOtherChargeMasters,
  type OtherChargeMaster,
} from '@/utils/otherChargesApi';

interface OtherChargesSectionProps {
  charges?: OtherChargeItem[];
  onChargesChange: (items: OtherChargeItem[]) => void;
}

const normalizeName = (name: string) => name.trim().replace(/\s+/g, ' ');

function buildChargeId() {
  return `oc-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function OtherChargesSection({ charges = [], onChargesChange }: OtherChargesSectionProps) {
  const [customCharges, setCustomCharges] = useState<OtherChargeMaster[]>([]);
  const [loading, setLoading] = useState(false);
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customName, setCustomName] = useState('');
  const [customError, setCustomError] = useState('');
  const [savingCustom, setSavingCustom] = useState(false);
  const [pendingRowId, setPendingRowId] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setLoading(true);
    fetchOtherChargeMasters()
      .then((list) => {
        if (!active) return;
        setCustomCharges(list);
      })
      .catch(() => {
        if (!active) return;
        setCustomCharges([]);
      })
      .finally(() => {
        if (!active) return;
        setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const optionList = useMemo(() => {
    const defaults = DEFAULT_OTHER_CHARGE_OPTIONS.map((name) => ({ value: name, label: name }));
    const existingNames = new Set(defaults.map((option) => option.value.toLowerCase()));
    const customOptions = customCharges
      .map((item) => ({ value: item.name, label: item.name }))
      .filter((option) => {
        const key = option.value.toLowerCase();
        if (existingNames.has(key)) return false;
        existingNames.add(key);
        return true;
      });

    // Include any currently selected names that might not be in masters yet.
    charges.forEach((item) => {
      const key = item.name.trim().toLowerCase();
      if (!key || existingNames.has(key)) return;
      customOptions.push({ value: item.name, label: item.name });
      existingNames.add(key);
    });

    return [
      ...defaults,
      ...customOptions,
      { value: ADD_CUSTOM_CHARGE_VALUE, label: ADD_CUSTOM_CHARGE_LABEL },
    ];
  }, [customCharges, charges]);

  const updateCharges = (next: OtherChargeItem[]) => {
    onChargesChange(next);
  };

  const handleAddRow = () => {
    updateCharges([
      ...charges,
      { id: buildChargeId(), name: '', amount: 0 },
    ]);
  };

  const handleDeleteRow = (id: string) => {
    updateCharges(charges.filter((item) => item.id !== id));
  };

  const handleNameChange = (id: string, value: string) => {
    if (value === ADD_CUSTOM_CHARGE_VALUE) {
      setPendingRowId(id);
      setCustomName('');
      setCustomError('');
      setCustomModalOpen(true);
      return;
    }

    updateCharges(
      charges.map((item) => (item.id === id ? { ...item, name: value } : item)),
    );
  };

  const handleAmountChange = (id: string, value: string) => {
    const numeric = Number.parseFloat(value.replace(/[^\d.]/g, ''));
    updateCharges(
      charges.map((item) =>
        item.id === id
          ? {
              ...item,
              amount: Number.isFinite(numeric) ? numeric : 0,
            }
          : item,
      ),
    );
  };

  const closeCustomModal = () => {
    setCustomModalOpen(false);
    setCustomName('');
    setCustomError('');
    setPendingRowId(null);
  };

  const handleSaveCustomCharge = async () => {
    const normalized = normalizeName(customName);
    if (!normalized) {
      setCustomError('Enter a charge name.');
      return;
    }

    setSavingCustom(true);
    try {
      const created = await createOtherChargeMaster(normalized);
      setCustomCharges((prev) => {
        const exists = prev.some((item) => item.name.toLowerCase() === created.name.toLowerCase());
        return exists ? prev : [...prev, created];
      });

      if (pendingRowId) {
        updateCharges(
          charges.map((item) =>
            item.id === pendingRowId ? { ...item, name: created.name } : item,
          ),
        );
      }
      closeCustomModal();
    } catch {
      setCustomError('Unable to save custom charge.');
    } finally {
      setSavingCustom(false);
    }
  };

  return (
    <FormSection title="Other Charges" variant="card">
      {charges.length === 0 ? (
        <Text className="mb-3 text-xs text-text-muted">No other charges added yet.</Text>
      ) : null}

      {charges.map((item) => (
        <View key={item.id} className="mb-3">
          <View className="flex-row items-end gap-2">
            <View className="flex-1">
              <SearchableSelectDropdown
                label="Charge Name"
                value={item.name}
                options={optionList}
                onChange={(value) => handleNameChange(item.id, value)}
                placeholder="Select charge"
                containerClassName="flex-1"
              />
            </View>

            <View className="w-[34%]">
              <FieldLabel label="Amount (₹)" />
              <View className="h-11 flex-row items-center rounded-input border border-border bg-surface-input px-3.5">
                <TextInput
                  value={item.amount ? String(item.amount) : ''}
                  onChangeText={(value) => handleAmountChange(item.id, value)}
                  placeholder="0"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="decimal-pad"
                  className="flex-1 text-sm text-text-primary"
                />
              </View>
            </View>

            <Pressable
              onPress={() => handleDeleteRow(item.id)}
              className="mb-[2px] h-11 w-11 items-center justify-center rounded-input border border-border bg-white"
            >
              <Trash2 size={16} color="#9E9E9E" />
            </Pressable>
          </View>
        </View>
      ))}

      <Pressable
        onPress={handleAddRow}
        className="flex-row items-center justify-center gap-2 rounded-input border border-dashed border-border bg-white py-3"
      >
        <Plus size={16} color="#1B3022" />
        <Text className="text-sm font-semibold text-text-primary">Add Other Charge</Text>
      </Pressable>

      <Modal visible={customModalOpen} transparent animationType="fade" onRequestClose={closeCustomModal}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white px-5 py-4 shadow-lg">
            <Text className="text-base font-bold text-text-primary">Add Custom Charge</Text>
            <Text className="mt-1 text-xs text-text-muted">Charge name</Text>
            <TextInput
              value={customName}
              onChangeText={(value) => {
                setCustomName(value);
                if (customError) setCustomError('');
              }}
              placeholder="Enter name"
              placeholderTextColor={Colors.placeholder}
              className="mt-2 h-11 rounded-input border border-border bg-surface-input px-3.5 text-sm text-text-primary"
            />
            {customError ? (
              <Text className="mt-2 text-xs text-danger-text">{customError}</Text>
            ) : null}

            <View className="mt-4 flex-row gap-3">
              <Pressable
                onPress={closeCustomModal}
                className="flex-1 items-center rounded-button border border-border bg-white py-3"
              >
                <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveCustomCharge}
                disabled={savingCustom}
                className="flex-1 items-center rounded-button bg-primary py-3"
              >
                {savingCustom ? (
                  <ActivityIndicator color="#FFFFFF" />
                ) : (
                  <Text className="text-sm font-semibold text-white">Save</Text>
                )}
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {loading ? (
        <Text className="mt-2 text-xs text-text-muted">Loading custom charges…</Text>
      ) : null}
    </FormSection>
  );
}
