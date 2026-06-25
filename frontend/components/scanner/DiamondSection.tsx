import { useCallback, useEffect } from 'react';

import { FormFieldGrid, FormFieldGridItem } from '@/components/scanner/FormFieldGrid';
import { FormInput } from '@/components/scanner/FormInput';
import { FormSection } from '@/components/scanner/FormSection';
import { QualityField } from '@/components/scanner/QualityField';
import { RateField } from '@/components/scanner/RateField';
import { RateNotFoundModal } from '@/components/scanner/RateNotFoundModal';
import { useStoneRateFetch } from '@/hooks/useStoneRateFetch';
import { buildQuality } from '@/utils/qualityUtils';

export interface DiamondSectionValues {
  weight: string;
  shape: string;
  color: string;
  clarity: string;
  quality: string;
  rate: string;
}

interface DiamondSectionProps {
  title?: string;
  values: DiamondSectionValues;
  onChange: (values: Partial<DiamondSectionValues>) => void;
  onRateErrorChange?: (hasError: boolean) => void;
  disabled?: boolean;
}

export function DiamondSection({
  title = 'Diamond Details',
  values,
  onChange,
  onRateErrorChange,
  disabled = false,
}: DiamondSectionProps) {
  const hasColorClarity = Boolean(values.color.trim() && values.clarity.trim());
  const quality = buildQuality(values.color, values.clarity);

  const handleRateFetched = useCallback(
    (fetchedRate: string) => {
      onChange({ rate: fetchedRate });
    },
    [onChange],
  );

  const {
    isFetching,
    rateNotFound,
    showRateNotFoundModal,
    notFoundQuality,
    fetchRate,
    dismissRateNotFoundModal,
  } = useStoneRateFetch({
    type: 'diamond',
    color: values.color,
    clarity: values.clarity,
    enabled: hasColorClarity && !disabled,
    onRateFetched: handleRateFetched,
  });

  const handleColorChange = (color: string) => {
    onChange({ color, quality: buildQuality(color, values.clarity) });
  };

  const handleClarityChange = (clarity: string) => {
    onChange({ clarity, quality: buildQuality(values.color, clarity) });
  };

  useEffect(() => {
    onRateErrorChange?.(rateNotFound);
  }, [rateNotFound, onRateErrorChange]);

  const inputsDisabled = disabled || isFetching;

  return (
    <>
      <FormSection title={title} variant="card">
        <FormFieldGrid>
          <FormFieldGridItem>
            <FormInput
              label="Diamond Weight (ct)"
              value={values.weight}
              onChangeText={(weight) => onChange({ weight })}
              editable={!inputsDisabled}
              placeholder="e.g. 0.46"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label="Diamond Shape"
              value={values.shape}
              onChangeText={(shape) => onChange({ shape: shape.toUpperCase() })}
              editable={!inputsDisabled}
              placeholder="e.g. RD"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label="Diamond Color"
              value={values.color}
              onChangeText={handleColorChange}
              editable={!inputsDisabled}
              placeholder="e.g. IJ"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <FormFieldGridItem>
            <FormInput
              label="Diamond Clarity"
              value={values.clarity}
              onChangeText={handleClarityChange}
              editable={!inputsDisabled}
              placeholder="e.g. VVS1"
              containerClassName="mb-2.5"
            />
          </FormFieldGridItem>
          <QualityField label="Diamond Quality" value={quality} />
        </FormFieldGrid>
        <RateField label="Diamond Rate (₹/ct)" value={values.rate} isFetching={isFetching} />
      </FormSection>

      <RateNotFoundModal
        visible={showRateNotFoundModal}
        quality={notFoundQuality}
        onCancel={dismissRateNotFoundModal}
        onRefresh={fetchRate}
        onRetry={fetchRate}
      />
    </>
  );
}
