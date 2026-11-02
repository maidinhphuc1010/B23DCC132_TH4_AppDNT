import { useCachedQuery } from './useCachedQuery';
import { getById } from '../api/courseService';
export function useCourseDetail(id) {
  return useCachedQuery(`courses:${id}`, () => getById(id));
}
