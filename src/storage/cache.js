import AsyncStorage from '@react-native-async-storage/async-storage';
import { cacheKey } from './keys';

export async function getCache(key) {
  const raw = await AsyncStorage.getItem(cacheKey(key));
  if (raw === null) {
    return null;
  }
  try {
    const value = JSON.parse(raw);
    return value &&
      Object.prototype.hasOwnProperty.call(value, 'data') &&
      typeof value.savedAt === 'string' &&
      Number.isFinite(Date.parse(value.savedAt))
      ? value
      : null;
  } catch {
    return null;
  }
}

export async function setCache(key, data) {
  if (data === undefined) {
    throw new TypeError('Cache data must be JSON serializable');
  }
  const value = { data, savedAt: new Date().toISOString() };
  await AsyncStorage.setItem(cacheKey(key), JSON.stringify(value));
  return value;
}
