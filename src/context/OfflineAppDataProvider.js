import React, {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import * as studentApi from '../api/studentService';
import * as courseApi from '../api/courseService';
import * as sessionApi from '../api/sessionService';
import * as assignmentApi from '../api/assignmentService';
import * as gradeApi from '../api/gradeService';
import { useCachedQuery } from '../hooks/useCachedQuery';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { notifyOutboxChanged } from '../hooks/useOutboxSync';
import { setCache } from '../storage/cache';
import { enqueue, getAll } from '../storage/outbox';
import { useSync } from './SyncContext';
const Data = createContext(null);
export default function OfflineAppDataProvider({ children }) {
  const { isOnline } = useNetworkStatus();
  const sync = useSync();
  const studentQuery = useCachedQuery('students:1', () =>
    studentApi.getById(1),
  );
  const courses = useCachedQuery('courses', courseApi.getAll);
  const sessions = useCachedQuery('sessions', sessionApi.getAll);
  const assignmentsQuery = useCachedQuery('assignments', assignmentApi.getAll);
  const grades = useCachedQuery('grades', gradeApi.getAll);
  const [overrides, setOverrides] = useState({});
  const [studentOverride, setStudentOverride] = useState(null);
  const [mutationWarning, setMutationWarning] = useState(null);
  const busy = useRef(false);
  const refreshers = useRef({
    assignments: assignmentsQuery.refresh,
    student: studentQuery.refresh,
  });
  refreshers.current = {
    assignments: assignmentsQuery.refresh,
    student: studentQuery.refresh,
  };
  const assignmentsData = [
    ...(assignmentsQuery.data || []).filter(
      item => !overrides[String(item.id)],
    ),
    ...Object.values(overrides),
  ].sort((a, b) => String(a.dueDate).localeCompare(String(b.dueDate)));
  const assignments = {
    ...assignmentsQuery,
    data:
      assignmentsQuery.data || Object.keys(overrides).length
        ? assignmentsData
        : null,
    refresh: async () => {
      const fresh = await assignmentsQuery.refresh();
      if (fresh) {
        const queued = await getAll();
        const ids = new Set(
          queued.map(action => String(action.meta?.localRecord?.id)),
        );
        setOverrides(current =>
          Object.fromEntries(
            Object.entries(current).filter(([id]) => ids.has(id)),
          ),
        );
      }
      return fresh;
    },
  };
  const student = {
    ...studentQuery,
    data: studentOverride || studentQuery.data,
  };
  const cache = async (key, value) => {
    try {
      await setCache(key, value);
      setMutationWarning(null);
    } catch {
      setMutationWarning('Đã lưu nhưng không thể cập nhật cache.');
    }
  };
  useEffect(() => {
    let active = true;
    getAll()
      .then(actions => {
        if (!active) return;
        const records = actions
          .map(action => action.meta?.localRecord)
          .filter(Boolean);
        setOverrides(
          Object.fromEntries(
            records
              .filter(record => record.resource === 'assignment')
              .map(record => [String(record.id), record]),
          ),
        );
        const profile = records.find(record => record.resource === 'student');
        if (profile) setStudentOverride(profile.data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);
  useEffect(() => {
    if (!sync.notice) return;
    let active = true;
    getAll()
      .then(actions => {
        if (!active) return;
        const records = actions
          .map(action => action.meta?.localRecord)
          .filter(Boolean);
        setOverrides(
          Object.fromEntries(
            records
              .filter(record => record.resource === 'assignment')
              .map(record => [String(record.id), record]),
          ),
        );
        if (!records.some(record => record.resource === 'student'))
          setStudentOverride(null);
        return Promise.all([
          refreshers.current.assignments(),
          refreshers.current.student(),
        ]);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [sync.notice]);
  async function saveAssignment(fields, id, detail) {
    if (busy.current) throw new Error('Đang lưu bài tập, vui lòng chờ.');
    busy.current = true;
    const old =
      assignmentsData.find(item => String(item.id) === String(id)) || detail;
    const creating = id === undefined;
    const localId = creating
      ? `local-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
      : id;
    const body = { ...fields, updatedAt: new Date().toISOString() };
    const row = {
      ...(old || {}),
      ...body,
      id: localId,
      course:
        courses.data?.find(
          course => String(course.id) === String(body.courseId),
        ) || old?.course,
      pending: !isOnline,
    };
    setOverrides(previous => ({ ...previous, [String(localId)]: row }));
    try {
      if (!isOnline) {
        const action = await enqueue({
          method: creating ? 'POST' : 'PATCH',
          url: creating ? '/assignments' : `/assignments/${id}`,
          body,
          meta: {
            localRecord: { resource: 'assignment', ...row },
            tempId: creating ? localId : undefined,
            baseUpdatedAt: old?.updatedAt,
            localKey: creating ? undefined : `assignments:${id}`,
            url: creating ? undefined : `/assignments/${id}`,
          },
        });
        await cache('assignments', [
          ...assignmentsData.filter(
            item => String(item.id) !== String(localId),
          ),
          row,
        ]);
        if (!creating) await cache(`assignments:${id}`, row);
        notifyOutboxChanged();
        return { ...row, outboxId: action.id };
      }
      const saved = creating
        ? await assignmentApi.create(body)
        : await assignmentApi.update(id, body);
      const confirmed = { ...saved, course: row.course };
      setOverrides(previous => {
        const next = { ...previous };
        delete next[String(localId)];
        next[String(saved.id)] = confirmed;
        return next;
      });
      await cache('assignments', [
        ...assignmentsData.filter(
          item =>
            String(item.id) !== String(localId) &&
            String(item.id) !== String(saved.id),
        ),
        confirmed,
      ]);
      await cache(`assignments:${saved.id}`, confirmed);
      return confirmed;
    } catch (error) {
      if (isOnline)
        setOverrides(previous => {
          const next = { ...previous };
          delete next[String(localId)];
          if (old) next[String(id)] = old;
          return next;
        });
      throw error;
    } finally {
      busy.current = false;
    }
  }
  async function saveStudent(fields) {
    const old = student.data || {};
    const body = { ...old, ...fields, updatedAt: new Date().toISOString() };
    if (!isOnline) {
      setStudentOverride(body);
      await cache('students:1', body);
      const action = await enqueue({
        method: 'PATCH',
        url: '/students/1',
        body,
        meta: {
          localRecord: { resource: 'student', data: body },
          baseUpdatedAt: old.updatedAt,
          localKey: 'students:1',
          url: '/students/1',
        },
      });
      notifyOutboxChanged();
      return { ...body, outboxId: action.id };
    }
    const saved = await studentApi.update(1, body);
    setStudentOverride(saved);
    await cache('students:1', saved);
    return saved;
  }
  return (
    <Data.Provider
      value={{
        student,
        courses,
        sessions,
        assignments,
        grades,
        saveAssignment,
        saveStudent,
        mutationWarning,
        syncNotice: sync.notice,
      }}
    >
      {children}
    </Data.Provider>
  );
}
export function useAppData() {
  const value = useContext(Data);
  if (!value) throw new Error('useAppData requires OfflineAppDataProvider');
  return value;
}
