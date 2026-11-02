import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCache, setCache } from '../src/storage/cache';
import * as outbox from '../src/storage/outbox';

beforeEach(async () => {
  await AsyncStorage.clear();
});
test('cache round trip includes ISO savedAt and uses one prefix', async () => {
  expect(await getCache('courses')).toBeNull();
  const entry = await setCache('courses', [{ id: 1 }]);
  expect(await getCache('cache:courses')).toEqual(entry);
  expect(Number.isFinite(Date.parse(entry.savedAt))).toBe(true);
});
test('corrupt cache is treated as a cache miss', async () => {
  await AsyncStorage.setItem('cache:courses', '{bad');
  expect(await getCache('courses')).toBeNull();
});
test('concurrent enqueue and remove preserve FIFO without lost writes', async () => {
  const entries = await Promise.all(
    [1, 2, 3].map(id =>
      outbox.enqueue({
        method: 'PATCH',
        url: `/assignments/${id}`,
        body: { status: 'done' },
      }),
    ),
  );
  expect(await outbox.getAll()).toEqual(entries);
  await Promise.all([
    outbox.remove(entries[0].id),
    outbox.enqueue({ method: 'POST', url: '/assignments', body: {} }),
  ]);
  const remaining = await outbox.getAll();
  expect(remaining.slice(0, 2)).toEqual(entries.slice(1));
  expect(remaining).toHaveLength(3);
});
