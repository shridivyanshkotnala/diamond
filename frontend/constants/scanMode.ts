/**
 * Demo/mock scan mode — no imports from other app modules (avoids require cycles).
 * Real API is used only when EXPO_PUBLIC_API_URL is set to a non-empty URL.
 */
export function isDemoScanMode(): boolean {
  const url = process.env.EXPO_PUBLIC_API_URL;
  if (url == null) return true;
  return url.trim().length === 0;
}
