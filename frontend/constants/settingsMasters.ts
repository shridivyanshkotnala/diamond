export type MasterRatesCategory = 'gold' | 'diamond' | 'colorstone' | 'labour';
export type MasterFormulaCategory = 'gold' | 'diamond' | 'colorstone' | 'labour';

export interface MasterNavItem {
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

export const MASTER_SECTION_ITEMS: MasterNavItem[] = [
  {
    id: 'section-rates',
    title: 'Rates',
    subtitle: 'Gold, Diamond, Colorstone and Labour charges',
    route: '/dashboard/masters/rates',
  },
  {
    id: 'section-formulas',
    title: 'Formulas',
    subtitle: 'Gold amount calculation formulas',
    route: '/dashboard/masters/formulas',
  },
];

export const MASTER_RATES_ITEMS: MasterNavItem[] = [
  {
    id: 'rates-gold',
    title: 'Gold',
    subtitle: 'Karat-wise purity and final rates',
    route: '/dashboard/market-rates?tab=gold',
  },
  {
    id: 'rates-diamond',
    title: 'Diamond',
    subtitle: 'Color and clarity based diamond rates',
    route: '/dashboard/market-rates?tab=diamond',
  },
  {
    id: 'rates-colorstone',
    title: 'Colorstone',
    subtitle: 'Color and clarity based colorstone rates',
    route: '/dashboard/market-rates?tab=colorstone',
  },
  {
    id: 'rates-labour',
    title: 'Labour Charges',
    subtitle: 'Labour charge reference rates',
    route: '/dashboard/market-rates?tab=labour',
  },
];

export const MASTER_FORMULA_ITEMS: MasterNavItem[] = [
  {
    id: 'formula-gold',
    title: 'Gold',
    subtitle: 'Gold pricing formulas',
    route: '/dashboard/masters/formulas/gold',
  },
  {
    id: 'formula-diamond',
    title: 'Diamond',
    subtitle: 'Diamond valuation formulas',
    route: '/dashboard/masters/formulas/diamond',
  },
  {
    id: 'formula-colorstone',
    title: 'Colorstone',
    subtitle: 'Colorstone valuation formulas',
    route: '/dashboard/masters/formulas/colorstone',
  },
  {
    id: 'formula-labour',
    title: 'Labour Charges',
    subtitle: 'Labour charge formulas',
    route: '/dashboard/masters/formulas/labour',
  },
];

export const MASTER_CATEGORY_LABELS: Record<MasterFormulaCategory, string> = {
  gold: 'Gold',
  diamond: 'Diamond',
  colorstone: 'Colorstone',
  labour: 'Labour Charges',
};

export const MASTER_FORMULA_LABELS: Record<MasterFormulaCategory, string> = {
  gold: 'Gold Formulas',
  diamond: 'Diamond Formulas',
  colorstone: 'Colorstone Formulas',
  labour: 'Labour Charge Formulas',
};

export function parseFormulaCategory(value?: string): MasterFormulaCategory {
  if (value === 'diamond' || value === 'colorstone' || value === 'labour') {
    return value;
  }
  return 'gold';
}
