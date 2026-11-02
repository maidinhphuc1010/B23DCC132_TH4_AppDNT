import database from '@react-native-async-storage/async-storage';
// Never store passwords or other secrets here.
export const storage = {
  // Returns unknown intentionally: callers must validate persisted data.
  async get(key) {
    const value = await database.getItem(key);
    return value === null ? null : JSON.parse(value);
  },
  async set(key, value) {
    const serialized = JSON.stringify(value);
    if (serialized === undefined) {
      throw new TypeError('Storage value must be JSON serializable');
    }
    await database.setItem(key, serialized);
  },
  async remove(key) {
    await database.removeItem(key);
  },
};
