import type { StructuredScanData } from '@/types/scanner';

type ApiFieldValue = string | number | { value?: string | number | null; confidence?: number };

/** Gemini returns { field: { value, confidence } }; review API uses flat strings. */
export function flattenStructuredData(data: unknown): StructuredScanData {
  if (!data || typeof data !== 'object') {
    return {};
  }

  const result: StructuredScanData = {};

  for (const [key, raw] of Object.entries(data as Record<string, ApiFieldValue>)) {
    if (raw == null) continue;

    if (typeof raw === 'object' && 'value' in raw) {
      const value = raw.value;
      if (value != null && String(value).trim() !== '') {
        result[key] = String(value);
      }
      continue;
    }

    if (typeof raw === 'string' || typeof raw === 'number') {
      const value = String(raw).trim();
      if (value) {
        result[key] = value;
      }
    }
  }

  return result;
}

export function unwrapApiData<T extends Record<string, unknown>>(response: T): T {
  if (
    'data' in response &&
    response.data &&
    typeof response.data === 'object' &&
    !Array.isArray(response.data)
  ) {
    return response.data as T;
  }
  return response;
}
