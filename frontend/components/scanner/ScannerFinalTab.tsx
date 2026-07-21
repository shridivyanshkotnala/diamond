import { useMemo, useState } from 'react';
import { Pressable, Text, View } from 'react-native';
import { Check } from 'lucide-react-native';

import { getLaborValuesFromScanData, LaborSection } from '@/components/scanner/LaborSection';
import { LabourChargeResultSection } from '@/components/scanner/LabourChargeResultSection';
import { MrpBreakdownCard } from '@/components/scanner/MrpBreakdownCard';
import { PriceCard } from '@/components/scanner/PriceCard';
import { RawMaterialGoldSectionInteractive } from '@/components/scanner/RawMaterialGoldSection';
import { RawMaterialSection } from '@/components/scanner/RawMaterialSection';
import { StoneTypeRowCard } from '@/components/scanner/StoneTypeRowCard';
import { StoneTypeSequence } from '@/components/scanner/StoneTypeResultSection';
import type { FinalTabPricingResult } from '@/utils/scanPriceCalculation';
import type { GoldRate, TaxSettings } from '@/types/rates';
import type { JewelleryType, ScanItemData, StoneEntry, StructuredScanData } from '@/types/scanner';
import { resolveScannedKarat } from '@/utils/formulaUtils';
import { formatIndianCurrency } from '@/utils/scanPriceCalculation';
import { OtherChargesSection } from '@/components/scanner/OtherChargesSection';

interface ScannerFinalTabProps {
  scanData: ScanItemData;
  structuredData?: StructuredScanData;
  diamonds: StoneEntry[];
  colorstones: StoneEntry[];
  jewelleryType: JewelleryType;
  pricing: FinalTabPricingResult;
  goldRates?: GoldRate[];
  goldTaxSettings?: TaxSettings;
  mcxLiveRate?: number;
  diamondShapeOptions?: { value: string; label?: string }[];
  editable?: boolean;
  canEditPurityPercent?: boolean;
  onFieldChange?: (field: keyof ScanItemData, value: ScanItemData[keyof ScanItemData]) => void;
  onStoneEntryChange?: (
    stoneType: 'diamond' | 'colorstone',
    sourceIndex: number,
    values: Partial<StoneEntry>,
  ) => void;
  onRateErrorChange?: (sequenceIndex: number, hasError: boolean) => void;
  showLabourValidation?: boolean;
  showOtherChargesRemarksError?: boolean;
  gstNote?: string;
  calculationRateAccess?: 'rtgs' | 'cash' | 'both';
  clubDiamonds?: boolean;
  clubColorstones?: boolean;
  onToggleClubDiamonds?: (enabled: boolean) => void;
  onToggleClubColorstones?: (enabled: boolean) => void;
}

export function ScannerFinalTab({
  scanData,
  structuredData,
  diamonds,
  colorstones,
  jewelleryType,
  pricing,
  goldRates,
  goldTaxSettings,
  mcxLiveRate,
  diamondShapeOptions,
  editable = false,
  canEditPurityPercent = true,
  onFieldChange,
  onStoneEntryChange,
  onRateErrorChange,
  showLabourValidation = false,
  showOtherChargesRemarksError = false,
  gstNote = 'MRP = Gold + Stones + Labour + Other Charges (client-side)',
  calculationRateAccess = 'both',
  clubDiamonds = false,
  clubColorstones = false,
  onToggleClubDiamonds,
  onToggleClubColorstones,
}: ScannerFinalTabProps) {
  const [selectedKarat, setSelectedKarat] = useState(
    () => resolveScannedKarat(scanData.karat, scanData.tunch) || '18K',
  );

  // Intentionally left without combined blocks; render by type for clubbing.

  const diamondBlocks = useMemo(
    () => diamonds.map((entry, index) => ({ entry, index })),
    [diamonds],
  );
  const colorstoneBlocks = useMemo(
    () => colorstones.map((entry, index) => ({ entry, index })),
    [colorstones],
  );

  const handleKaratChange = (karat: string) => {
    setSelectedKarat(karat);
    onFieldChange?.('karat', karat);
    onFieldChange?.('customPurityPercent', '');
  };

  return (
    <View>
      {!editable ? (
        <PriceCard
          label="₹ MRP (Final)"
          amount={pricing.ultimateMrpDisplay}
          subtitle={gstNote}
        />
      ) : null}

      {editable ? (
        <RawMaterialSection
          scanData={{ ...scanData, karat: selectedKarat }}
          goldRates={goldRates}
          goldTaxSettings={goldTaxSettings}
          mcxLiveRate={mcxLiveRate}
          calculationMode={scanData.calculationRate}
          calculationRateAccess={calculationRateAccess}
          editable
          canEditPurityPercent={canEditPurityPercent}
          onFieldChange={(field, value) => {
            if (field === 'karat') {
              handleKaratChange(value);
              return;
            }
            onFieldChange?.(field, value);
          }}
        />
      ) : (
        <RawMaterialGoldSectionInteractive
          badge="Gold"
          pricing={pricing}
        />
      )}

      {editable ? (
        <>
          {diamonds.length > 1 || clubDiamonds ? (
            <View className="mb-3 rounded-input border border-border bg-white px-3.5 py-3">
              <Pressable
                onPress={() => onToggleClubDiamonds?.(!clubDiamonds)}
                className="flex-row items-center gap-2"
              >
                <View
                  className={`h-4 w-4 items-center justify-center rounded border ${
                    clubDiamonds ? 'border-primary bg-primary' : 'border-border bg-white'
                  }`}
                >
                  {clubDiamonds ? <Check size={12} color="#FFFFFF" /> : null}
                </View>
                <Text className="text-sm text-text-primary">Club Diamonds</Text>
              </Pressable>
            </View>
          ) : null}

          {diamondBlocks.map((block, idx) => (
            <StoneTypeRowCard
              key={`diamond-${block.index}`}
              title={clubDiamonds ? 'Diamond' : `Diamond ${idx + 1}`}
              stoneType="diamond"
              values={{
                weight: block.entry.weight,
                color: block.entry.color,
                clarity: block.entry.clarity,
                quality: block.entry.quality,
                rate: block.entry.rate,
                discountPercent: block.entry.discountPercent,
                shape: block.entry.shape,
                packetCode: block.entry.packetCode,
              }}
              shapeOptions={diamondShapeOptions}
              editable
              onChange={(values) => onStoneEntryChange?.('diamond', block.index, values)}
              onRateErrorChange={(hasError) =>
                onRateErrorChange?.(idx, hasError)
              }
            />
          ))}

          {colorstones.length > 1 || clubColorstones ? (
            <View className="mb-3 rounded-input border border-border bg-white px-3.5 py-3">
              <Pressable
                onPress={() => onToggleClubColorstones?.(!clubColorstones)}
                className="flex-row items-center gap-2"
              >
                <View
                  className={`h-4 w-4 items-center justify-center rounded border ${
                    clubColorstones ? 'border-primary bg-primary' : 'border-border bg-white'
                  }`}
                >
                  {clubColorstones ? <Check size={12} color="#FFFFFF" /> : null}
                </View>
                <Text className="text-sm text-text-primary">Club Colorstones</Text>
              </Pressable>
            </View>
          ) : null}

          {colorstoneBlocks.map((block, idx) => (
            <StoneTypeRowCard
              key={`colorstone-${block.index}`}
              title={clubColorstones ? 'Colorstone' : `Colorstone ${idx + 1}`}
              stoneType="colorstone"
              values={{
                weight: block.entry.weight,
                color: block.entry.color,
                clarity: block.entry.clarity,
                quality: block.entry.quality,
                rate: block.entry.rate,
              }}
              editable
              onChange={(values) => onStoneEntryChange?.('colorstone', block.index, values)}
              onRateErrorChange={(hasError) =>
                onRateErrorChange?.(diamondBlocks.length + idx, hasError)
              }
            />
          ))}
        </>
      ) : (
        <StoneTypeSequence rows={pricing.stoneRows} />
      )}

      {editable ? (
        <LaborSection
          values={getLaborValuesFromScanData(scanData)}
          onChange={(values) => {
            if (values.labourPurityPercent !== undefined) {
              onFieldChange?.('labourPurityPercent', values.labourPurityPercent);
            }
            if (values.labourChargeAmount !== undefined) {
              onFieldChange?.('labourChargeAmount', values.labourChargeAmount);
            }
            if (values.labourChargeUnit !== undefined) {
              onFieldChange?.('labourChargeUnit', values.labourChargeUnit);
            }
            if (values.labourWeightBasis !== undefined) {
              onFieldChange?.('labourWeightBasis', values.labourWeightBasis);
            }
          }}
          grossWeightGrams={scanData.grossWt}
          netWeightGrams={scanData.netWt}
          pureWeightDisplay={pricing.pureWtDisplay}
          goldAmountDisplay={pricing.goldBasePriceDisplay}
        />
      ) : (
        <LabourChargeResultSection pricing={pricing} />
      )}

      {editable ? (
        <OtherChargesSection
          charges={scanData.otherChargesItems}
          remarks={scanData.otherChargesRemarks}
          onChargesChange={(items) => {
            const total = items.reduce((sum, item) => sum + (item.amount || 0), 0);
            onFieldChange?.('otherChargesItems', items);
            onFieldChange?.('otherChargesAmount', total ? String(total) : '');
            if (items.length === 0) {
              onFieldChange?.('otherChargesRemarks', '');
            }
          }}
          onRemarksChange={(value) => onFieldChange?.('otherChargesRemarks', value)}
          showRemarksError={showOtherChargesRemarksError}
        />
      ) : null}

      {!editable && scanData.otherChargesItems?.length ? (
        <View className="mb-4 overflow-hidden rounded-2xl border border-border bg-white">
          <View className="border-b border-border px-4 py-3">
            <Text className="text-sm font-bold uppercase text-text-primary">Other Charges</Text>
          </View>
          {scanData.otherChargesItems.map((charge) => (
            <View
              key={charge.id}
              className="flex-row items-center justify-between px-4 py-3.5"
            >
              <Text className="text-sm text-text-secondary">{charge.name}</Text>
              <Text className="text-sm font-semibold text-text-primary">
                {formatIndianCurrency(charge.amount || 0)}
              </Text>
            </View>
          ))}
          <View className="border-t border-border" />
          <View className="flex-row items-center justify-between px-4 py-3.5">
            <Text className="text-sm font-semibold text-text-primary">Other Charges Total</Text>
            <Text className="text-sm font-semibold text-text-primary">
              {pricing.otherChargesDisplay}
            </Text>
          </View>
          {scanData.otherChargesRemarks?.trim() ? (
            <View className="border-t border-border px-4 py-3.5">
              <Text className="text-xs font-semibold uppercase text-text-muted">Remarks</Text>
              <Text className="mt-2 text-sm text-text-secondary">
                {scanData.otherChargesRemarks.trim()}
              </Text>
            </View>
          ) : null}
        </View>
      ) : null}

      {!editable ? (
        <MrpBreakdownCard
          goldAmount={pricing.goldBasePriceDisplay}
          diamondAmount={
            pricing.diamondAmount > 0 ? formatIndianCurrency(pricing.diamondAmount) : undefined
          }
          colorstoneAmount={
            pricing.colorstoneAmount > 0
              ? formatIndianCurrency(pricing.colorstoneAmount)
              : undefined
          }
          labourAmount={pricing.labourDisplay}
          otherChargesTotal={
            pricing.otherChargesAmount > 0 ? pricing.otherChargesDisplay : undefined
          }
          ultimateMrp={pricing.ultimateMrpDisplay}
        />
      ) : null}
    </View>
  );
}
