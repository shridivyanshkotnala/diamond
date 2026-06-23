export type MasterRatesCategory = 'gold' | 'diamond' | 'labour';
export type MasterFormulaCategory = 'gold' | 'diamond' | 'labour';

export interface MasterNavItem {
  id: string;
  title: string;
  subtitle: string;
  route: string;
}

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
    id: 'rates-labour',
    title: 'Labour',
    subtitle: 'Labour charge reference rates',
    route: '/dashboard/market-rates?tab=labour',
  },
];

export const MASTER_FORMULA_ITEMS: MasterNavItem[] = [
  {
    id: 'formula-gold',
    title: 'Gold',
    subtitle: 'Gold pricing formulas',
    route: '/dashboard/masters/formulas?category=gold',
  },
  {
    id: 'formula-diamond',
    title: 'Diamond',
    subtitle: 'Diamond valuation formulas',
    route: '/dashboard/masters/formulas?category=diamond',
  },
  {
    id: 'formula-labour',
    title: 'Labour',
    subtitle: 'Labour charge formulas',
    route: '/dashboard/masters/formulas?category=labour',
  },
];
