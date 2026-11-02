// Android emulator default. Set EXPO_PUBLIC_API_URL to your LAN URL for Expo Go.
export const BASE_URL =
  process.env.EXPO_PUBLIC_API_URL || 'http://10.0.2.2:3000';
export const TIMEOUT = 10000;
// Informational only: stale cache remains usable offline; online always revalidates.
export const CACHE_TTL = 5 * 60 * 1000;
