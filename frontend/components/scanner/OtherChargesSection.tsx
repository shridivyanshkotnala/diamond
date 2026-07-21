import { Alert, Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useEffect, useMemo, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react-native';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormSection } from '@/components/scanner/FormSection';
import { SearchableSelectDropdown } from '@/components/scanner/SearchableSelectDropdown';
import { Colors } from '@/constants/theme';
import { DEFAULT_CHARGE_OPTIONS } from '@/constants/otherCharges';
import type { OtherChargeItem } from '@/types/scanner';
import { createCustomCharge, fetchChargeNames } from '@/utils/customChargesApi';

interface OtherChargesSectionProps {
  charges: OtherChargeItem[];
  onChargesChange: (items: OtherChargeItem[]) => void;
}

function sanitizeAmountInput(text: string): string {
  return text.replace(/[₹,\s]/g, '');
}

function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

const ADD_CUSTOM_CHARGE_VALUE = '__ADD_CUSTOM__';

export function OtherChargesSection({
  charges,
  onChargesChange,
}: OtherChargesSectionProps) {
  const [allChargeOptions, setAllChargeOptions] = useState<string[]>([...DEFAULT_CHARGE_OPTIONS]);
  const [loadingCharges, setLoadingCharges] = useState(true);
  
  const [addModalVisible, setAddModalVisible] = useState(false);
  const [customChargeModalVisible, setCustomChargeModalVisible] = useState(false);
  
  const [selectedChargeName, setSelectedChargeName] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [customChargeInput, setCustomChargeInput] = useState('');
  
  const [errors, setErrors] = useState<{ amount?: string; customName?: string }>({});
  const [savingCustomCharge, setSavingCustomCharge] = useState(false);

  // Load charge names on mount
  useEffect(() => {
    let cancelled = false;
    
    const loadChargeNames = async () => {
      try {
        const data = await fetchChargeNames();
        if (!cancelled) {
          setAllChargeOptions(data.allCharges);
        }
      } catch (error) {
        if (!cancelled) {
          console.error('Failed to load charge names:', error);
          // Fallback to default options
          setAllChargeOptions([...DEFAULT_CHARGE_OPTIONS]);
        }
      } finally {
        if (!cancelled) {
          setLoadingCharges(false);
        }
      }
    };

    void loadChargeNames();
    
    return () => {
      cancelled = true;
    };
  }, []);

  const total = useMemo(
    () => charges.reduce((sum, item) => sum + (item.amount || 0), 0),
    [charges],
  );

  const chargeDropdownOptions = useMemo(() => {
    // Create options list with all charges + "Add Custom Charge"
    const options = allChargeOptions.map((name) => ({
      value: name,
      label: name,
    }));
    
    // Add the "Add Custom Charge" option at the end
    options.push({
      value: ADD_CUSTOM_CHARGE_VALUE,
      label: '+ Add Custom Charge',
    });
    
    return options;
  }, [allChargeOptions]);

  const openAddCharge = () => {
    setSelectedChargeName('');
    setAmountInput('');
    setErrors({});
    setAddModalVisible(true);
  };

  const closeAddModal = () => {
    setAddModalVisible(false);
    setSelectedChargeName('');
    setAmountInput('');
    setErrors({});
  };

  const openCustomChargeModal = () => {
    setCustomChargeInput('');
    setErrors({});
    setCustomChargeModalVisible(true);
  };

  const closeCustomChargeModal = () => {
    setCustomChargeModalVisible(false);
    setCustomChargeInput('');
    setErrors({});
  };

  const handleChargeNameSelect = (value: string) => {
    if (value === ADD_CUSTOM_CHARGE_VALUE) {
      // Open custom charge creation modal
      openCustomChargeModal();
      return;
    }
    setSelectedChargeName(value);
  };

  const handleSaveCustomCharge = async () => {
    const trimmedName = customChargeInput.trim();
    
    if (!trimmedName) {
      setErrors({ customName: 'Charge name is required' });
      return;
    }

    setSavingCustomCharge(true);
    try {
      await createCustomCharge({ name: trimmedName });
      
      // Refresh charge names
      const data = await fetchChargeNames();
      setAllChargeOptions(data.allCharges);
      
      // Auto-select the newly created charge
      setSelectedChargeName(trimmedName);
      
      closeCustomChargeModal();
      Alert.alert('Success', 'Custom charge created successfully');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create custom charge';
      Alert.alert('Error', message);
    } finally {
      setSavingCustomCharge(false);
    }
  };

  const handleSaveCharge = () => {
    const numericAmount = Number.parseFloat(amountInput.replace(/[^\d.]/g, '')) || 0;
    const nextErrors: { amount?: string } = {};
    
    if (!selectedChargeName) {
      Alert.alert('Error', 'Please select a charge name');
      return;
    }
    
    if (!numericAmount || numericAmount <= 0) {
      nextErrors.amount = 'Enter a valid amount';
      setErrors(nextErrors);
      return;
    }

    const newCharge: OtherChargeItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      name: selectedChargeName,
      amount: numericAmount,
    };
    
    onChargesChange([...charges, newCharge]);
    closeAddModal();
  };

  const handleDeleteCharge = (index: number) => {
    const next = charges.filter((_, i) => i !== index);
    onChargesChange(next);
  };

  return (
    <FormSection variant="card">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold uppercase text-text-primary">Other Charges</Text>
        <Pressable
          onPress={openAddCharge}
          disabled={loadingCharges}
          className="rounded-full bg-primary/10 px-3 py-1.5 disabled:opacity-50"
        >
          <Text className="text-xs font-semibold text-primary">+ Add Other Charge</Text>
        </Pressable>
      </View>

      {charges.length > 0 ? (
        <View className="gap-2">
          {charges.map((item, index) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between rounded-input border border-border bg-white px-3 py-2.5"
            >
              <View className="flex-1 pr-2">
                <Text className="text-sm font-medium text-text-primary" numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text className="mr-2 text-sm font-semibold text-text-primary">
                {formatInr(item.amount)}
              </Text>
              <Pressable
                onPress={() => handleDeleteCharge(index)}
                className="h-8 w-8 items-center justify-center rounded-full border border-danger-text/30 bg-danger-bg"
              >
                <Trash2 size={14} color={Colors.dangerText} />
              </Pressable>
            </View>
          ))}

          <View className="mt-1 flex-row items-center justify-between rounded-input border border-border bg-surface-muted px-3 py-2.5">
            <Text className="text-sm font-semibold text-text-secondary">Total Other Charges</Text>
            <Text className="text-sm font-bold text-text-primary">{formatInr(total)}</Text>
          </View>
        </View>
      ) : null}

      {/* Add Charge Modal */}
      <Modal visible={addModalVisible} transparent animationType="fade" onRequestClose={closeAddModal}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            <Text className="mb-4 text-sm font-bold uppercase text-text-primary">Add Other Charge</Text>

            <View className="mb-4">
              <SearchableSelectDropdown
                label="Charge Name"
                value={selectedChargeName}
                options={chargeDropdownOptions}
                onChange={handleChargeNameSelect}
                placeholder="Select charge"
                searchPlaceholder="Search charge"
                containerClassName="w-full"
              />
            </View>

            <View className="mb-4">
              <FieldLabel label="Amount (₹)" required />
              <View className={`h-11 flex-row items-center rounded-input border px-3.5 ${
                errors.amount ? 'border-danger-text bg-danger-bg' : 'border-border bg-surface-input'
              }`}>
                <Text className="mr-1.5 text-sm font-medium text-text-muted">₹</Text>
                <TextInput
                  value={amountInput}
                  onChangeText={(text) => {
                    setAmountInput(sanitizeAmountInput(text));
                    if (errors.amount) setErrors((prev) => ({ ...prev, amount: undefined }));
                  }}
                  placeholder="Enter amount"
                  placeholderTextColor={Colors.placeholder}
                  keyboardType="number-pad"
                  className="flex-1 text-sm text-text-primary"
                />
              </View>
              {errors.amount ? (
                <Text className="mt-1 text-xs text-danger-text">{errors.amount}</Text>
              ) : null}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={closeAddModal}
                className="flex-1 items-center rounded-button border border-border bg-white py-3"
              >
                <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveCharge}
                className="flex-1 items-center rounded-button bg-primary py-3"
              >
                <Text className="text-sm font-semibold text-white">Add</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>

      {/* Custom Charge Modal */}
      <Modal
        visible={customChargeModalVisible}
        transparent
        animationType="fade"
        onRequestClose={closeCustomChargeModal}
      >
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            <Text className="mb-4 text-sm font-bold uppercase text-text-primary">
              Add Custom Charge
            </Text>

            <View className="mb-4">
              <FieldLabel label="Charge Name" required />
              <TextInput
                value={customChargeInput}
                onChangeText={(text) => {
                  setCustomChargeInput(text);
                  if (errors.customName) setErrors((prev) => ({ ...prev, customName: undefined }));
                }}
                placeholder="Enter charge name"
                placeholderTextColor={Colors.placeholder}
                autoFocus
                className={`h-11 rounded-input border px-3.5 text-sm text-text-primary ${
                  errors.customName ? 'border-danger-text bg-danger-bg' : 'border-border bg-surface-input'
                }`}
              />
              {errors.customName ? (
                <Text className="mt-1 text-xs text-danger-text">{errors.customName}</Text>
              ) : null}
            </View>

            <View className="flex-row gap-3">
              <Pressable
                onPress={closeCustomChargeModal}
                disabled={savingCustomCharge}
                className="flex-1 items-center rounded-button border border-border bg-white py-3 disabled:opacity-50"
              >
                <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSaveCustomCharge}
                disabled={savingCustomCharge}
                className="flex-1 items-center rounded-button bg-primary py-3 disabled:opacity-60"
              >
                <Text className="text-sm font-semibold text-white">
                  {savingCustomCharge ? 'Saving...' : 'Save'}
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </FormSection>
  );
}
