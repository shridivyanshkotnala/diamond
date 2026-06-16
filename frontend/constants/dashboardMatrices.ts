export type MatrixKey =
  | '24k_with_tax'
  | '24k_without_tax'
  | '22k_with_tax'
  | '22k_without_tax'
  | '18k_with_tax'
  | '18k_without_tax'
  | '14k_with_tax'
  | '14k_without_tax'
  | 'silver_with_tax'
  | 'silver_without_tax'
  | 'edit_market_prices'
  | 'net_pure_weight_access'
  | 'gross_weight_access';

export interface MatrixRow {
  key: MatrixKey;
  label: string;
}

export interface MatrixSection {
  sectionLabel: string;
  rows: MatrixRow[];
}

export const GOLD_MATRIX_SECTIONS: MatrixSection[] = [
  {
    sectionLabel: '24K GOLD',
    rows: [
      { key: '24k_with_tax', label: '24K With Tax' },
      { key: '24k_without_tax', label: '24K Without Tax' },
    ],
  },
  {
    sectionLabel: '22K GOLD',
    rows: [
      { key: '22k_with_tax', label: '22K With Tax' },
      { key: '22k_without_tax', label: '22K Without Tax' },
    ],
  },
  {
    sectionLabel: '18K GOLD',
    rows: [
      { key: '18k_with_tax', label: '18K With Tax' },
      { key: '18k_without_tax', label: '18K Without Tax' },
    ],
  },
  {
    sectionLabel: '14K GOLD',
    rows: [
      { key: '14k_with_tax', label: '14K With Tax' },
      { key: '14k_without_tax', label: '14K Without Tax' },
    ],
  },
];

export const SILVER_MATRIX_SECTION: MatrixSection = {
  sectionLabel: 'SILVER',
  rows: [
    { key: 'silver_with_tax', label: 'Silver With Tax' },
    { key: 'silver_without_tax', label: 'Silver Without Tax' },
  ],
};

export const WEIGHT_ACCESS_ROWS: MatrixRow[] = [
  { key: 'net_pure_weight_access', label: 'Net Weight & Pure Weight Edit Access' },
  { key: 'gross_weight_access', label: 'Gross Weight Edit Access' },
];

export const DEFAULT_MATRIX_VALUES: Record<MatrixKey, boolean> = {
  '24k_with_tax': true,
  '24k_without_tax': false,
  '22k_with_tax': true,
  '22k_without_tax': false,
  '18k_with_tax': true,
  '18k_without_tax': false,
  '14k_with_tax': true,
  '14k_without_tax': false,
  'silver_with_tax': true,
  'silver_without_tax': false,
  'edit_market_prices': true,
  'net_pure_weight_access': true,
  'gross_weight_access': true,
};
