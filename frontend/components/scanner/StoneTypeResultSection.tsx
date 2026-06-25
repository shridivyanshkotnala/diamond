import { DataGridSection } from '@/components/scanner/DataGridSection';
import type { StoneAmountRow } from '@/utils/scanPriceCalculation';

const STONE_TYPE_LABELS: Record<StoneAmountRow['stoneType'], string> = {
  diamond: 'Diamond',
  colorstone: 'Colorstone',
};

interface StoneTypeResultSectionProps {
  row: StoneAmountRow;
}

export function StoneTypeResultSection({ row }: StoneTypeResultSectionProps) {
  const stoneLabel = STONE_TYPE_LABELS[row.stoneType];

  return (
    <DataGridSection
      title={row.displayTitle}
      badge={stoneLabel}
      items={[
        { label: `${stoneLabel} Rate`, value: row.rate },
        { label: `${stoneLabel} Quality`, value: row.quality },
        { label: `${stoneLabel} Wt.`, value: row.weight },
        { label: `${stoneLabel} Amount`, value: row.amountDisplay },
      ]}
    />
  );
}

interface StoneTypeSequenceProps {
  rows: StoneAmountRow[];
}

export function StoneTypeSequence({ rows }: StoneTypeSequenceProps) {
  if (rows.length === 0) return null;

  return (
    <>
      {rows.map((row) => (
        <StoneTypeResultSection key={`stone-result-${row.sequenceIndex}`} row={row} />
      ))}
    </>
  );
}
