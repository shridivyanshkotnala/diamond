import { apiRequest } from '@/utils/apiClient';
import { unwrapApiData } from '@/utils/apiResponse';

export interface OtherChargeMaster {
  id: string;
  name: string;
}

type ApiEnvelope = Record<string, unknown> & {
  success?: boolean;
  data?: unknown;
};

function normalizeCharge(raw: Record<string, unknown>): OtherChargeMaster | null {
  const id = typeof raw.id === 'string' ? raw.id : typeof raw._id === 'string' ? raw._id : undefined;
  const name = typeof raw.name === 'string' ? raw.name.trim() : '';
  if (!id || !name) return null;
  return { id, name };
}

export async function fetchOtherChargeMasters(): Promise<OtherChargeMaster[]> {
  const response = await apiRequest<ApiEnvelope>('/settings/other-charges', { method: 'GET' });
  const unwrapped = unwrapApiData(response);
  const list = Array.isArray(unwrapped) ? unwrapped : (unwrapped?.data as unknown);
  const entries = Array.isArray(list) ? list : [];
  return entries
    .filter((item): item is Record<string, unknown> => !!item && typeof item === 'object')
    .map(normalizeCharge)
    .filter((item): item is OtherChargeMaster => item !== null);
}

export async function createOtherChargeMaster(name: string): Promise<OtherChargeMaster> {
  const response = await apiRequest<ApiEnvelope>('/settings/other-charges', {
    method: 'POST',
    body: { name },
  });
  const unwrapped = unwrapApiData(response);
  const normalized = normalizeCharge(unwrapped as Record<string, unknown>);
  if (normalized) return normalized;

  if (unwrapped && typeof unwrapped === 'object') {
    const nested = (unwrapped as Record<string, unknown>).data as Record<string, unknown> | undefined;
    if (nested) {
      const nestedNormalized = normalizeCharge(nested);
      if (nestedNormalized) return nestedNormalized;
    }
  }

  throw new Error('Invalid other charge response from server');
}
