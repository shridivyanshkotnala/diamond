import { isDemoScanMode } from '@/constants/scanMode';
import { apiRequest } from '@/utils/apiClient';
import * as mockScanApi from '@/utils/mockScanApi';
import { prepareImageForUpload } from '@/utils/imagePicker';
import type {
  AnalyzeScanResponse,
  ClarificationResponse,
  CreateScanResponse,
  ImageUploadResponse,
  ReviewResponse,
  SubmitClarificationRequest,
  SubmitClarificationResponse,
  SubmitReviewResponse,
  StructuredScanData,
} from '@/types/scanner';
import type { JewelleryType, ScanMode } from '@/types/scanner';
import { toApiJewelleryType, toApiScanType } from '@/utils/scanMappers';

type WrappedCreateScanResponse = {
  success?: boolean;
  data?: CreateScanResponse;
  scanId?: string;
  status?: CreateScanResponse['status'];
};

function unwrapCreateScanResponse(response: WrappedCreateScanResponse): CreateScanResponse {
  if (response.data?.scanId) {
    return response.data;
  }
  if (response.scanId) {
    return {
      scanId: response.scanId,
      status: response.status ?? 'WAITING_FOR_SCAN',
    };
  }
  throw new Error('Invalid scan session response from server');
}

export async function createScan(
  jewelleryType: JewelleryType,
  scanType: ScanMode,
): Promise<CreateScanResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockCreateScan(jewelleryType, scanType);
  }

  const response = await apiRequest<WrappedCreateScanResponse>('/scans', {
    method: 'POST',
    body: {
      jewelleryType: toApiJewelleryType(jewelleryType),
      scanType: toApiScanType(scanType),
    },
  });
  return unwrapCreateScanResponse(response);
}

export async function uploadFrontImage(
  scanId: string,
  imageUri: string,
): Promise<ImageUploadResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockUploadFrontImage(scanId);
  }

  const fileUri = await prepareImageForUpload(imageUri);
  const formData = new FormData();
  formData.append('image', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'front.jpg',
  } as unknown as Blob);

  return apiRequest<ImageUploadResponse>(`/scans/${scanId}/front-image`, {
    method: 'POST',
    body: formData,
  });
}

export async function uploadBackImage(
  scanId: string,
  imageUri: string,
): Promise<ImageUploadResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockUploadBackImage(scanId);
  }

  const fileUri = await prepareImageForUpload(imageUri);
  const formData = new FormData();
  formData.append('image', {
    uri: fileUri,
    type: 'image/jpeg',
    name: 'back.jpg',
  } as unknown as Blob);

  return apiRequest<ImageUploadResponse>(`/scans/${scanId}/back-image`, {
    method: 'POST',
    body: formData,
  });
}

export async function completeDemoCapture(
  scanId: string,
  hasBackImage: boolean,
): Promise<void> {
  await mockScanApi.mockCompleteDemoCapture(scanId, { hasBackImage });
}

export async function analyzeScan(scanId: string): Promise<AnalyzeScanResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockAnalyzeScan(scanId);
  }

  return apiRequest<AnalyzeScanResponse>(`/scans/${scanId}/analyze`, {
    method: 'POST',
    body: null,
  });
}

export async function getClarification(scanId: string): Promise<ClarificationResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockGetClarification(scanId);
  }

  return apiRequest<ClarificationResponse>(`/scans/${scanId}/clarification`);
}

export async function submitClarification(
  scanId: string,
  payload: SubmitClarificationRequest,
): Promise<SubmitClarificationResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockSubmitClarification(scanId, payload.confirmedMappings);
  }

  return apiRequest<SubmitClarificationResponse>(`/scans/${scanId}/clarification`, {
    method: 'POST',
    body: payload as Record<string, unknown>,
  });
}

export async function getReview(scanId: string): Promise<ReviewResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockGetReview(scanId);
  }

  return apiRequest<ReviewResponse>(`/scans/${scanId}/review`);
}

export async function submitReview(
  scanId: string,
  structuredData: StructuredScanData,
): Promise<SubmitReviewResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockSubmitReview(scanId, structuredData);
  }

  return apiRequest<SubmitReviewResponse>(`/scans/${scanId}/review`, {
    method: 'POST',
    body: structuredData,
  });
}
