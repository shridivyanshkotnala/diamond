import { isDemoScanMode } from '@/constants/scanMode';
import { apiRequest } from '@/utils/apiClient';
import { flattenStructuredData, unwrapApiData } from '@/utils/apiResponse';
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
  CalculateMrpResponse,
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
  const unwrapped = unwrapApiData(response);
  if (unwrapped.scanId) {
    return {
      scanId: unwrapped.scanId,
      status: unwrapped.status ?? 'WAITING_FOR_SCAN',
    };
  }
  throw new Error('Invalid scan session response from server');
}

function unwrapImageUploadResponse(
  response: ImageUploadResponse & { data?: ImageUploadResponse },
): ImageUploadResponse {
  const unwrapped = unwrapApiData(response);
  if (unwrapped.status) {
    return { status: unwrapped.status };
  }
  throw new Error('Invalid image upload response from server');
}

function normalizeAnalyzeResponse(raw: AnalyzeScanResponse): AnalyzeScanResponse {
  const unwrapped = unwrapApiData(raw);
  return {
    scanId: unwrapped.scanId,
    status: unwrapped.status,
    structuredData: flattenStructuredData(unwrapped.structuredData),
    unknownFields: unwrapped.unknownFields ?? [],
  };
}

function normalizeReviewResponse(raw: ReviewResponse): ReviewResponse {
  const unwrapped = unwrapApiData(raw);
  return {
    scanId: unwrapped.scanId,
    status: unwrapped.status,
    structuredData: flattenStructuredData(unwrapped.structuredData),
  };
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

  const response = await apiRequest<ImageUploadResponse>(`/scans/${scanId}/front-image`, {
    method: 'POST',
    body: formData,
  });
  return unwrapImageUploadResponse(response);
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

  const response = await apiRequest<ImageUploadResponse>(`/scans/${scanId}/back-image`, {
    method: 'POST',
    body: formData,
  });
  return unwrapImageUploadResponse(response);
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

  const response = await apiRequest<AnalyzeScanResponse>(`/scans/${scanId}/analyze`, {
    method: 'POST',
    body: null,
  });
  return normalizeAnalyzeResponse(response);
}

export async function getClarification(scanId: string): Promise<ClarificationResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockGetClarification(scanId);
  }

  const response = await apiRequest<ClarificationResponse>(`/scans/${scanId}/clarification`);
  return unwrapApiData(response);
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
    body: payload as unknown as Record<string, unknown>,
  });
}

export async function getReview(scanId: string): Promise<ReviewResponse> {
  if (isDemoScanMode()) {
    return mockScanApi.mockGetReview(scanId);
  }

  const response = await apiRequest<ReviewResponse>(`/scans/${scanId}/review`);
  return normalizeReviewResponse(response);
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

export async function calculateScanMrp(
  scanId: string,
  payload: any,
): Promise<CalculateMrpResponse> {
  if (isDemoScanMode()) {
    // Return dummy data in demo mode
    return {
      breakdown: {
        diamondAmount: 0,
        colorstoneAmount: 0,
        pureWeight: 0,
        goldRateApplied: 0,
        goldAmount: 0,
        labourAmount: 0,
        otherCharges: 0,
        labourChargeType: 'NONE',
      },
      finalMRP: 0,
    };
  }

  const res = await apiRequest<{ data: CalculateMrpResponse }>(`/scans/${scanId}/calculate`, {
    method: 'POST',
    body: payload,
  });
  
  return res.data;
}
