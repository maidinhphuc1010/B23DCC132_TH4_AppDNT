import { useCachedQuery } from './useCachedQuery';
import * as assignments from '../api/assignmentService';
import * as grades from '../api/gradeService';
import * as sessions from '../api/sessionService';
const services = { assignments, grades, sessions };
export function useRecordDetail(resource, id) {
  return useCachedQuery(`${resource}:${id}`, () =>
    services[resource].getById(id),
  );
}
