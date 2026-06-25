export const DIAMOND_SHAPE_LABELS: Record<string, string> = {
  RD: 'Round Diamond',
  RB: 'Round Brilliant',
  PR: 'Princess',
  EM: 'Emerald',
  OV: 'Oval',
  MQ: 'Marquise',
  PS: 'Pear',
  AS: 'Asscher',
  CU: 'Cushion',
};

export function formatDiamondShapeLabel(shape: string): string {
  const code = shape.trim().toUpperCase();
  if (!code) return '';
  return DIAMOND_SHAPE_LABELS[code] ?? code;
}
