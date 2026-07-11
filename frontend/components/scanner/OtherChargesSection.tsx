import { Modal, Pressable, Text, TextInput, View } from 'react-native';
import { useMemo, useState } from 'react';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormSection } from '@/components/scanner/FormSection';
import { Colors } from '@/constants/theme';
import type { OtherChargeItem } from '@/types/scanner';

interface OtherChargesSectionProps {
  charges: OtherChargeItem[];
  remarks: string;
  onChargesChange: (items: OtherChargeItem[]) => void;
  onRemarksChange: (value: string) => void;
  showRemarksError?: boolean;
}

function sanitizeAmountInput(text: string): string {
  return text.replace(/[₹,\s]/g, '');
}

function formatInr(amount: number): string {
  if (!Number.isFinite(amount)) return '₹0';
  return `₹${Math.round(amount).toLocaleString('en-IN')}`;
}

export function OtherChargesSection({
  charges,
  remarks,
  onChargesChange,
  onRemarksChange,
  showRemarksError = false,
}: OtherChargesSectionProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [nameInput, setNameInput] = useState('');
  const [amountInput, setAmountInput] = useState('');
  const [errors, setErrors] = useState<{ name?: string; amount?: string }>({});

  const total = useMemo(
    () => charges.reduce((sum, item) => sum + (item.amount || 0), 0),
    [charges],
  );

  const openAdd = () => {
    setEditingIndex(null);
    setNameInput('');
    setAmountInput('');
    setErrors({});
    setModalVisible(true);
  };

  const openEdit = (index: number) => {
    const item = charges[index];
    if (!item) return;
    setEditingIndex(index);
    setNameInput(item.name);
    setAmountInput(String(item.amount));
    setErrors({});
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setEditingIndex(null);
    setErrors({});
  };

  const handleSave = () => {
    const trimmedName = nameInput.trim();
    const numericAmount = Number.parseFloat(amountInput.replace(/[^\d.]/g, '')) || 0;
    const nextErrors: { name?: string; amount?: string } = {};
    if (!trimmedName) nextErrors.name = 'Charge name is required.';
    if (!numericAmount || numericAmount <= 0) nextErrors.amount = 'Enter a valid amount.';
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    if (editingIndex === null) {
      const next: OtherChargeItem = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        name: trimmedName,
        amount: numericAmount,
      };
      onChargesChange([...charges, next]);
    } else {
      const next = charges.map((item, index) =>
        index === editingIndex
          ? { ...item, name: trimmedName, amount: numericAmount }
          : item,
      );
      onChargesChange(next);
    }

    closeModal();
  };

  const handleDelete = (index: number) => {
    const next = charges.filter((_, i) => i !== index);
    onChargesChange(next);
  };

  return (
    <FormSection variant="card">
      <View className="mb-3 flex-row items-center justify-between">
        <Text className="text-sm font-bold uppercase text-text-primary">Other Charges</Text>
        <Pressable onPress={openAdd} className="rounded-full bg-primary/10 px-3 py-1.5">
          <Text className="text-xs font-semibold text-primary">+ Add Other Charge</Text>
        </Pressable>
      </View>

      {charges.length > 0 ? (
        <View className="mb-3 gap-2">
          {charges.map((item, index) => (
            <View
              key={item.id}
              className="flex-row items-center justify-between rounded-input border border-border bg-white px-3 py-2"
            >
              <View className="flex-1 pr-2">
                <Text className="text-sm font-medium text-text-primary" numberOfLines={1}>
                  {item.name}
                </Text>
              </View>
              <Text className="text-sm font-semibold text-text-primary">
                {formatInr(item.amount)}
              </Text>
              <View className="ml-3 flex-row items-center gap-2">
                <Pressable onPress={() => openEdit(index)}>
                  <Text className="text-sm text-text-primary">✏</Text>
                </Pressable>
                <Pressable onPress={() => handleDelete(index)}>
                  <Text className="text-sm text-danger-text">🗑</Text>
                </Pressable>
              </View>
            </View>
          ))}

          <View className="flex-row items-center justify-between rounded-input border border-border bg-surface-muted px-3 py-2">
            <Text className="text-sm font-semibold text-text-secondary">Total Other Charges</Text>
            <Text className="text-sm font-bold text-text-primary">{formatInr(total)}</Text>
          </View>
        </View>
      ) : null}

      <View>
        <FieldLabel label="Remarks" required={charges.length > 0} />
        <TextInput
          value={remarks}
          onChangeText={onRemarksChange}
          placeholder="Add remarks"
          placeholderTextColor={Colors.placeholder}
          multiline
          textAlignVertical="top"
          className={`min-h-[96px] rounded-input border bg-surface-input px-3.5 py-3 text-sm text-text-primary ${
            showRemarksError ? 'border-danger-text' : 'border-border'
          }`}
        />
        {showRemarksError ? (
          <Text className="mt-2 text-xs text-danger-text">
            Remarks are required when other charges are added.
          </Text>
        ) : null}
      </View>

      <Modal visible={modalVisible} transparent animationType="fade" onRequestClose={closeModal}>
        <View className="flex-1 items-center justify-center bg-black/40 px-6">
          <View className="w-full rounded-2xl bg-white p-4">
            <Text className="mb-3 text-sm font-bold uppercase text-text-primary">Other Charge</Text>

            <View className="mb-3">
              <FieldLabel label="Charge Name" required />
              <TextInput
                value={nameInput}
                onChangeText={(text) => {
                  setNameInput(text);
                  if (errors.name) setErrors((prev) => ({ ...prev, name: undefined }));
                }}
                placeholder="Enter name"
                placeholderTextColor={Colors.placeholder}
                className={`h-11 rounded-input border px-3.5 text-sm text-text-primary ${
                  errors.name ? 'border-danger-text bg-danger-bg' : 'border-border bg-surface-input'
                }`}
              />
              {errors.name ? <Text className="mt-1 text-xs text-danger-text">{errors.name}</Text> : null}
            </View>

            <View className="mb-3">
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
                onPress={closeModal}
                className="flex-1 items-center rounded-button border border-border bg-white py-3"
              >
                <Text className="text-sm font-semibold text-text-secondary">Cancel</Text>
              </Pressable>
              <Pressable
                onPress={handleSave}
                className="flex-1 items-center rounded-button bg-primary py-3"
              >
                <Text className="text-sm font-semibold text-white">OK</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </FormSection>
  );
}
