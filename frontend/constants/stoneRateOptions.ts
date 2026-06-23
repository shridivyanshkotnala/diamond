export const DIAMOND_COLOR_OPTIONS = [
  'D',
  'E',
  'F',
  'G',
  'H',
  'I',
  'J',
  'EF',
  'FG',
  'GH',
  'HI',
  'IJ',
] as const;

export const STONE_CLARITY_OPTIONS = ['SI', 'VS', 'VS1', 'VVS', 'VVS1'] as const;

export const COLORSTONE_COLOR_OPTIONS = ['Red', 'Blue', 'Green', 'Pink'] as const;

export type DiamondColorOption = (typeof DIAMOND_COLOR_OPTIONS)[number];
export type StoneClarityOption = (typeof STONE_CLARITY_OPTIONS)[number];
export type ColorstoneColorOption = (typeof COLORSTONE_COLOR_OPTIONS)[number];

export type StoneRateKind = 'diamond' | 'colorstone';

export function getColorOptionsForStoneType(type: StoneRateKind): readonly string[] {
  return type === 'diamond' ? DIAMOND_COLOR_OPTIONS : COLORSTONE_COLOR_OPTIONS;
}
