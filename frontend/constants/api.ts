import Constants from 'expo-constants';
import { Platform } from 'react-native';

export const API_V1_PREFIX = '/api/v1';

function getMetroHost(): string | null {
  const hostUri =
    Constants.expoConfig?.hostUri ??
    (Constants.expoConfig as { hostUri?: string } | null)?.hostUri ??
    (Constants.manifest2 as { extra?: { expoClient?: { hostUri?: string } } } | null)?.extra
      ?.expoClient?.hostUri ??
    (Constants.manifest as { debuggerHost?: string } | null)?.debuggerHost;

  if (!hostUri) return null;
  return hostUri.split(':')[0] ?? null;
}

export function resolveApiBaseUrl(): string {
  // 1. ALWAYS prioritize explicitly set .env variables first!
  const envUrl = process.env.EXPO_PUBLIC_API_URL?.trim();
  console.log('[API] EXPO_PUBLIC_API_URL:', envUrl ?? 'undefined');
  if (envUrl) {
    console.log('[API] Using EXPO_PUBLIC_API_URL as base:', envUrl.replace(/\/$/, ''));
    return envUrl.replace(/\/$/, '');
  }

  // 2. Fallbacks for local development
  if (__DEV__) {
    const metroHost = getMetroHost();
    console.log('[API] __DEV__ metroHost:', metroHost ?? 'undefined');
    if (metroHost && metroHost !== 'localhost' && metroHost !== '127.0.0.1') {
      console.log('[API] Using Metro host base:', `http://${metroHost}:3000`);
      return `http://${metroHost}:3000`;
    }

    if (Platform.OS === 'android') {
      console.log('[API] Using Android emulator base:', 'http://10.0.2.2:3000');
      return 'http://10.0.2.2:3000';
    }
  }

  console.log('[API] Falling back to localhost base:', 'http://localhost:3000');
  return 'http://localhost:3000';
}

export const API_BASE_URL = resolveApiBaseUrl();

export function getApiUrl(path: string): string {
  return `${API_BASE_URL}${API_V1_PREFIX}${path}`;
}

export async function waitForMockDelay(ms = 800): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}
