import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { ChevronDown } from 'lucide-react-native';

import { useFormulaStore } from '@/store/formulaStore';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import {
  KARAT_DROPDOWN_OPTIONS,
  computePureWeightGrams,
  formatIndianCurrency,
  formatWeightGrams,
} from '@/utils/scanPriceCalculation';
import { parseNumericLabourValue } from '@/utils/labourUtils';
import { resolveScannedKarat, parseWeightValue, normalizeKarat } from '@/utils/formulaUtils';
import type { ScanItemData } from '@/types/scanner';
import type { GoldRate, TaxSettings } from '@/types/rates';

interface RawMaterialSectionProps {
  scanData: Pick<
    ScanItemData,
    'grossWt' | 'netWt' | 'karat' | 'tunch' | 'customPurityPercent' | 'labourPurityPercent'
  >;
  editable?: boolean;
  onFieldChange?: (field: keyof ScanItemData, value: string) => void;
  goldRates?: GoldRate[];
  goldTaxSettings?: TaxSettings;
  mcxLiveRate?: number;
  calculationMode?: 'rtgs' | 'cash';
}

function formatPurityLabel(percent: number): string {
  return `${percent}%`;
}

function normalizeRateKarat(carat: string): string {
  return carat.replace(/kt/i, 'k').toUpperCase();
}

export function RawMaterialSection({
  scanData,
  editable = false,
  onFieldChange,
  goldRates,
  goldTaxSettings,
  mcxLiveRate = 0,
  calculationMode,
}: RawMaterialSectionProps) {
  const [karatOpen, setKaratOpen] = useState(false);

  const activeFormula = useFormulaStore((s) => s.activeFormula);
  const formula2Rules = useFormulaStore((s) => s.formula2Rules);

  const displayedKaratOptions = useMemo(() => {
    if (activeFormula === 'F2' && formula2Rules.length > 0) {
      return KARAT_DROPDOWN_OPTIONS.filter((option) => formula2Rules.includes(option));
    }
    return KARAT_DROPDOWN_OPTIONS;
  }, [activeFormula, formula2Rules]);

  const resolvedKarat = resolveScannedKarat(scanData.karat, scanData.tunch);
  const normalizedKarat = normalizeKarat(resolvedKarat);
  const defaultPurity = useMemo(() => {
    if (!normalizedKarat) return 0;
    if (normalizedKarat === '24K') return 99.9;
    const match = goldRates?.find(
      (rate) => normalizeRateKarat(rate.carat) === normalizedKarat,
    );
    return match?.purity ?? 0;
  }, [goldRates, normalizedKarat]);

  const customPurityValue = parseNumericLabourValue(scanData.customPurityPercent) ?? 0;
  const effectivePurity = customPurityValue > 0 ? customPurityValue : defaultPurity;
  const netWtGrams = parseWeightValue(scanData.netWt);
  const pureWeightGrams = computePureWeightGrams(netWtGrams, effectivePurity);

  const purityInputValue = useMemo(() => {
    if (scanData.customPurityPercent.trim()) {
      return scanData.customPurityPercent;
    }
    if (defaultPurity > 0) {
      return formatPurityLabel(defaultPurity);
    }
    return '';
  }, [scanData.customPurityPercent, defaultPurity]);

  const scannerUse = calculationMode ?? 'rtgs';
  const baseFinalRate =
    scannerUse === 'cash' ? goldTaxSettings?.cashFinalRate : goldTaxSettings?.rtgsFinalRate;
  const fallbackBase = mcxLiveRate
    ? mcxLiveRate +
      (scannerUse === 'cash'
        ? goldTaxSettings?.cashChangeBy ?? 0
        : goldTaxSettings?.rtgsChangeBy ?? 0)
    : 0;
  const finalBaseRate = baseFinalRate ?? fallbackBase;
  const currentGoldRate =
    finalBaseRate > 0 && effectivePurity > 0
      ? finalBaseRate * (effectivePurity / 100)
      : 0;
  const currentGoldRateDisplay =
    currentGoldRate > 0 ? `${formatIndianCurrency(currentGoldRate)} /10gm` : '—';
  const goldAmount =
    currentGoldRate > 0 && pureWeightGrams > 0
      ? (currentGoldRate / 10) * pureWeightGrams
      : 0;

  const handleKaratSelect = (karat: string) => {
    onFieldChange?.('karat', karat);
    onFieldChange?.('customPurityPercent', '');
    setKaratOpen(false);
  };

  const handlePurityEdit = (text: string) => {
    const digits = text.replace(/[^0-9.]/g, '');
    if (!digits) {
      onFieldChange?.('customPurityPercent', '');
      return;
    }
    onFieldChange?.('customPurityPercent', `${digits}%`);
  };

  return (
    <FormSection title="Gold" variant="card">
      <FormFieldGrid>
        <FormFieldGridItem>
          <FormInput
            label="Gross Weight"
            value={scanData.grossWt}
            onChangeText={(value) => onFieldChange?.('grossWt', value)}
            editable={editable}
            placeholder="from scanner"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Net Weight"
            value={scanData.netWt}
            onChangeText={(value) => onFieldChange?.('netWt', value)}
            editable={editable}
            placeholder="from scanner"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Pure Weight"
            value={pureWeightGrams > 0 ? formatWeightGrams(pureWeightGrams) : ''}
            editable={false}
            placeholder="Net weight × purity %"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <View className="mb-2.5">
            <FieldLabel label="Tunch Purity" />
            {editable ? (
              <>
                <Pressable
                  onPress={() => setKaratOpen((prev) => !prev)}
                  className="mb-2 min-h-11 flex-row items-center justify-between rounded-input border border-border bg-surface-input px-3.5 py-2"
                >
                  <Text className="flex-1 text-sm text-text-primary">
                    {resolvedKarat || 'Select karat'}
                  </Text>
                  <ChevronDown size={18} color="#757575" />
                </Pressable>
                {karatOpen ? (
                  <View className="mb-2 overflow-hidden rounded-input border border-border bg-white">
                    {displayedKaratOptions.map((option) => {
                      const purity = normalizeKarat(option) === '24K'
                        ? 99.9
                        : goldRates?.find((rate) => normalizeRateKarat(rate.carat) === normalizeKarat(option))
                            ?.purity ?? 0;
                      return (
                        <Pressable
                          key={option}
                          onPress={() => handleKaratSelect(option)}
                          className={`flex-row items-center justify-between px-3.5 py-3 ${
                            resolvedKarat === option ? 'bg-[#E8F0EC]' : ''
                          }`}
                        >
                          <Text
                            className={`text-sm ${
                              resolvedKarat === option
                                ? 'font-bold text-primary'
                                : 'text-text-primary'
                            }`}
                          >
                            {option}
                          </Text>
                          {purity > 0 ? (
                            <Text className="text-xs text-text-muted">
                              {formatPurityLabel(purity)}
                            </Text>
                          ) : null}
                        </Pressable>
                      );
                    })}
                  </View>
                ) : null}
              </>
            ) : (
              <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
                <Text className="text-sm text-text-primary">
                  {resolvedKarat || '—'}
                </Text>
              </View>
            )}
          </View>
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Purity (%)"
            value={purityInputValue}
            onChangeText={handlePurityEdit}
            editable={editable}
            placeholder="e.g. 91.6"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          <View className="mb-2.5">
            <FieldLabel label="Gold Amount" />
            <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
              <Text className="text-sm font-semibold text-text-primary">
                {goldAmount > 0 ? formatIndianCurrency(goldAmount) : '—'}
              </Text>
              <Text className="mt-0.5 text-[10px] text-text-muted">
                {pureWeightGrams > 0 && currentGoldRate > 0
                  ? `${formatWeightGrams(pureWeightGrams)} × ${currentGoldRateDisplay}`
                  : 'Pure weight × current rate'}
              </Text>
            </View>
          </View>
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Current Gold Rate"
            value={currentGoldRateDisplay}
            editable={false}
            placeholder="Calculated"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
      </FormFieldGrid>
    </FormSection>
  );
}
