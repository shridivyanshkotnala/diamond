import { useMemo, useState } from 'react';
import { View } from 'react-native';

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
import { buildSequentialStoneBlocks } from '@/utils/stoneSequenceUtils';
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
  onFieldChange?: (field: keyof ScanItemData, value: string) => void;
  onStoneEntryChange?: (
    stoneType: 'diamond' | 'colorstone',
    sourceIndex: number,
    values: Partial<StoneEntry>,
  ) => void;
  onRateErrorChange?: (sequenceIndex: number, hasError: boolean) => void;
  showLabourValidation?: boolean;
  showOtherChargesRemarksError?: boolean;
  gstNote?: string;
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
  onFieldChange,
  onStoneEntryChange,
  onRateErrorChange,
  showLabourValidation = false,
  showOtherChargesRemarksError = false,
  gstNote = 'MRP = Gold + Stones + Labour + Other Charges (client-side)',
}: ScannerFinalTabProps) {
  const [selectedKarat, setSelectedKarat] = useState(
    () => resolveScannedKarat(scanData.karat, scanData.tunch) || '18K',
  );

  const editableStoneBlocks = useMemo(
    () => buildSequentialStoneBlocks(diamonds, colorstones, jewelleryType),
    [diamonds, colorstones, jewelleryType],
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
          editable
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

      {editable
        ? editableStoneBlocks.map((block) => (
            <StoneTypeRowCard
              key={`stone-${block.sequenceIndex}-${block.stoneType}-${block.sourceIndex}`}
              title={block.displayTitle}
              stoneType={block.stoneType}
              values={{
                weight: block.entry.weight,
                color: block.entry.color,
                clarity: block.entry.clarity,
                quality: block.entry.quality,
                rate: block.entry.rate,
                shape: block.entry.shape,
              }}
              shapeOptions={block.stoneType === 'diamond' ? diamondShapeOptions : undefined}
              editable
              onChange={(values) =>
                onStoneEntryChange?.(block.stoneType, block.sourceIndex, values)
              }
              onRateErrorChange={(hasError) =>
                onRateErrorChange?.(block.sequenceIndex, hasError)
              }
            />
          ))
        : <StoneTypeSequence rows={pricing.stoneRows} />}

      {editable && pricing.labourInputMode === 'none' ? (
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
          }}
          showValidationError={showLabourValidation}
          netWeightGrams={scanData.netWt}
        />
      ) : (
        <LabourChargeResultSection pricing={pricing} />
      )}

      {editable ? (
        <OtherChargesSection
          amount={scanData.otherChargesAmount}
          remarks={scanData.otherChargesRemarks}
          onAmountChange={(value) => {
            onFieldChange?.('otherChargesAmount', value);
            if (!value || Number.parseFloat(value.replace(/[^\d.]/g, '')) <= 0) {
              onFieldChange?.('otherChargesRemarks', '');
            }
          }}
          onRemarksChange={(value) => onFieldChange?.('otherChargesRemarks', value)}
          showRemarksError={showOtherChargesRemarksError}
        />
      ) : null}

      {!editable ? (
        <MrpBreakdownCard
          goldBase={pricing.goldBasePriceDisplay}
          stoneTotal={formatIndianCurrency(pricing.totalStoneAmount)}
          labour={pricing.labourDisplay}
          otherCharges={pricing.otherChargesDisplay}
          ultimateMrp={pricing.ultimateMrpDisplay}
        />
      ) : null}
    </View>
  );
}
