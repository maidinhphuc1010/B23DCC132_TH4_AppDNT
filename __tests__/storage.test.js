import database from '@react-native-async-storage/async-storage';
import { storage } from '../src/utils/storage';
beforeEach(async () => {
  await database.clear();
});
afterEach(() => {
  jest.restoreAllMocks();
});
test('returns null for a missing key', async () => {
  await expect(storage.get('missing')).resolves.toBeNull();
});
test('stores and reads JSON data', async () => {
  const value = { name: 'Math', completed: false, lessons: [1, 2] };
  await storage.set('subject', value);
  await expect(database.getItem('subject')).resolves.toBe(
    JSON.stringify(value),
  );
  await expect(storage.get('subject')).resolves.toEqual(value);
});
test('preserves falsy values', async () => {
  for (const value of [false, 0, '', null]) {
    await storage.set('value', value);
    await expect(storage.get('value')).resolves.toBe(value);
  }
});
test('removes only the requested key', async () => {
  await storage.set('first', 1);
  await storage.set('second', 2);
  await storage.remove('first');
  await expect(storage.get('first')).resolves.toBeNull();
  await expect(storage.get('second')).resolves.toBe(2);
});
test('rejects malformed JSON without overwriting it', async () => {
  await database.setItem('broken', '{');
  await expect(storage.get('broken')).rejects.toThrow(SyntaxError);
  await expect(database.getItem('broken')).resolves.toBe('{');
});
test('propagates native read, write and removal errors', async () => {
  const error = new Error('Storage unavailable');
  jest.spyOn(database, 'getItem').mockRejectedValueOnce(error);
  jest.spyOn(database, 'setItem').mockRejectedValueOnce(error);
  jest.spyOn(database, 'removeItem').mockRejectedValueOnce(error);
  await expect(storage.get('key')).rejects.toThrow(error);
  await expect(storage.set('key', 'value')).rejects.toThrow(error);
  await expect(storage.remove('key')).rejects.toThrow(error);
});
