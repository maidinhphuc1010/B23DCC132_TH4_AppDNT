import AsyncStorage from '@react-native-async-storage/async-storage';
import { OUTBOX_KEY } from './keys';

let queue = Promise.resolve();
let sequence = 0;
function serialize(operation) {
  const result = queue.then(operation);
  queue = result.catch(() => {});
  return result;
}
async function read() {
  const raw = await AsyncStorage.getItem(OUTBOX_KEY);
  const actions = raw === null ? [] : JSON.parse(raw);
  if (!Array.isArray(actions)) {
    throw new TypeError('Invalid outbox data');
  }
  return actions;
}
export function enqueue(action) {
  return serialize(async () => {
    const actions = await read();
    const entry = {
      id:
        action.id ??
        `${Date.now()}-${++sequence}-${Math.random().toString(36).slice(2)}`,
      method: action.method,
      url: action.url,
      body: action.body ?? null,
      createdAt: action.createdAt ?? new Date().toISOString(),
      ...(action.meta ? { meta: action.meta } : {}),
    };
    if (actions.some(item => item.id === entry.id)) {
      throw new Error('Duplicate outbox id');
    }
    await AsyncStorage.setItem(OUTBOX_KEY, JSON.stringify([...actions, entry]));
    return entry;
  });
}
export function getAll() {
  return serialize(read);
}
export function remove(id) {
  return serialize(async () => {
    const actions = await read();
    await AsyncStorage.setItem(
      OUTBOX_KEY,
      JSON.stringify(actions.filter(item => item.id !== id)),
    );
  });
}
