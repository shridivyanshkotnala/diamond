import { useMemo } from 'react';
import { Text, View } from 'react-native';

import { useFormulaStore } from '@/store/formulaStore';

import { FieldLabel } from '@/components/scanner/FieldLabel';
import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { SearchableSelectDropdown } from '@/components/scanner/SearchableSelectDropdown';
import type { SearchableSelectOption } from '@/components/scanner/SearchableSelectDropdown';
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
  canEditPurityPercent?: boolean;
  onFieldChange?: (field: keyof ScanItemData, value: ScanItemData[keyof ScanItemData]) => void;
  goldRates?: GoldRate[];
  goldTaxSettings?: TaxSettings;
  mcxLiveRate?: number;
  calculationMode?: 'rtgs' | 'cash';
}

function normalizeRateKarat(carat: string): string {
  return carat.replace(/kt/i, 'k').toUpperCase();
}

function sanitizePurityInput(text: string): string {
  const cleaned = text.replace(/[^0-9.]/g, '');
  if (!cleaned) return '';

  const [integerPart = '', ...decimalParts] = cleaned.split('.');
  const decimalPart = decimalParts.join('').replace(/\./g, '');
  let next = integerPart;

  if (cleaned.includes('.')) {
    next = `${integerPart}.${decimalPart}`;
  }

  if (next === '.') return '';

  const parsed = Number.parseFloat(next);
  if (!Number.isFinite(parsed)) return next;
  if (parsed > 100) return '100';
  if (parsed < 0) return '';

  return next;
}

export function RawMaterialSection({
  scanData,
  editable = false,
  canEditPurityPercent = true,
  onFieldChange,
  goldRates,
  goldTaxSettings,
  mcxLiveRate = 0,
  calculationMode,
}: RawMaterialSectionProps) {
  const activeFormula = useFormulaStore((s) => s.activeFormula);
  const formula2Rules = useFormulaStore((s) => s.formula2Rules);

  const displayedKaratOptions = useMemo<readonly SearchableSelectOption[]>(() => {
    const options =
      activeFormula === 'F2' && formula2Rules.length > 0
        ? KARAT_DROPDOWN_OPTIONS.filter((option) => formula2Rules.includes(option))
        : KARAT_DROPDOWN_OPTIONS;
    return options.map((option) => ({ value: option, label: option }));
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
      return String(defaultPurity);
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
  };

  const handlePurityEdit = (text: string) => {
    const next = sanitizePurityInput(text);
    onFieldChange?.('customPurityPercent', next);
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
            placeholder="Net weight and purity"
            containerClassName="mb-2.5"
          />
        </FormFieldGridItem>
        <FormFieldGridItem>
          {editable ? (
            <SearchableSelectDropdown
              label="Tunch Purity"
              value={resolvedKarat}
              options={displayedKaratOptions}
              onChange={handleKaratSelect}
              placeholder="Select karat"
              containerClassName="mb-2.5"
            />
          ) : (
            <View className="mb-2.5">
              <FieldLabel label="Tunch Purity" />
              <View className="min-h-11 justify-center rounded-input border border-border bg-surface-input px-3.5">
                <Text className="text-sm text-text-primary">{resolvedKarat || '—'}</Text>
              </View>
            </View>
          )}
        </FormFieldGridItem>
        <FormFieldGridItem>
          <FormInput
            label="Purity"
            value={purityInputValue}
            onChangeText={handlePurityEdit}
            editable={editable && canEditPurityPercent}
            placeholder="e.g. 91.6"
            keyboardType="decimal-pad"
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
