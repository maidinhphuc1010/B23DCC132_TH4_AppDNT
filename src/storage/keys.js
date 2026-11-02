export const CACHE_KEYS = {
  student: 'cache:students:1',
  courses: 'cache:courses',
  sessions: 'cache:sessions',
  assignments: 'cache:assignments',
  grades: 'cache:grades',
};
export const OUTBOX_KEY = 'outbox';
export const cacheKey = key =>
  key.startsWith('cache:') ? key : `cache:${key}`;
