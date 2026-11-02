import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { mergeStudent } from '../utils/student';
import {
  createLearningData,
  validateLearningData,
} from '../utils/learningData';
import { storage } from '../utils/storage';
export const LEARNING_STORAGE_KEY = 'learning:v1';
const LearningContext = createContext(undefined);
const emptyData = {
  student: null,
  subjects: [],
  studySessions: [],
  assignments: [],
  academicResults: [],
};
export function LearningProvider({ children }) {
  const [data, setData] = useState(emptyData);
  const [isLoading, setLoading] = useState(true);
  const [isSaving, setSaving] = useState(false);
  const [isReady, setReady] = useState(false);
  const [error, setError] = useState(null);
  const current = useRef(data);
  const ready = useRef(false);
  const mounted = useRef(false);
  const queue = useRef(Promise.resolve());
  const enqueue = useCallback(task => {
    const next = queue.current.then(task);
    queue.current = next.catch(() => undefined);
    return next;
  }, []);
  const reload = useCallback(
    () =>
      enqueue(async () => {
        if (!mounted.current) {
          return;
        }
        ready.current = false;
        setReady(false);
        setLoading(true);
        setError(null);
        try {
          const saved = await storage.get(LEARNING_STORAGE_KEY);
          let next;
          if (saved === null) {
            next = createLearningData();
          } else {
            if (
              typeof saved !== 'object' ||
              !('version' in saved) ||
              saved.version !== 1 ||
              !('data' in saved)
            ) {
              throw new Error('Phiên bản dữ liệu học tập không được hỗ trợ.');
            }
            next = saved.data;
          }
          validateLearningData(next);
          if (mounted.current) {
            current.current = next;
            setData(next);
            ready.current = true;
            setReady(true);
          }
        } catch (cause) {
          if (mounted.current) {
            setError(
              cause instanceof Error ? cause.message : 'Không thể tải dữ liệu.',
            );
          }
          throw cause;
        } finally {
          if (mounted.current) {
            setLoading(false);
          }
        }
      }),
    [enqueue],
  );
  const updateData = useCallback(
    update =>
      enqueue(async () => {
        if (!mounted.current || !ready.current) {
          throw new Error('Dữ liệu chưa sẵn sàng.');
        }
        setSaving(true);
        setError(null);
        try {
          const draft = JSON.parse(JSON.stringify(current.current));
          const next = update(draft);
          validateLearningData(next);
          // JSON projection also isolates state from references retained by callers.
          const snapshot = JSON.parse(
            JSON.stringify({ version: 1, data: next }),
          );
          await storage.set(LEARNING_STORAGE_KEY, snapshot);
          if (mounted.current) {
            current.current = snapshot.data;
            setData(snapshot.data);
          }
        } catch (cause) {
          if (mounted.current) {
            setError(
              cause instanceof Error ? cause.message : 'Không thể lưu dữ liệu.',
            );
          }
          throw cause;
        } finally {
          if (mounted.current) {
            setSaving(false);
          }
        }
      }),
    [enqueue],
  );
  useEffect(() => {
    mounted.current = true;
    reload().catch(() => undefined);
    return () => {
      mounted.current = false;
      ready.current = false;
    };
  }, [reload]);
  const updateStudent = useCallback(
    changes => {
      const patch = { ...changes };
      return updateData(draft => {
        draft.student = mergeStudent(draft.student, patch);
        return draft;
      });
    },
    [updateData],
  );
  const updateAssignmentStatus = useCallback(
    (id, status) =>
      updateData(draft => {
        if (
          typeof status !== 'string' ||
          !['todo', 'in_progress', 'completed'].includes(status)
        ) {
          throw new Error('Trạng thái bài tập không hợp lệ.');
        }
        const assignment = draft.assignments.find(item => item.id === id);
        if (!assignment) {
          throw new Error('Bài tập không tồn tại.');
        }
        assignment.status = status;
        return draft;
      }),
    [updateData],
  );
  const value = useMemo(
    () => ({
      data,
      isLoading,
      isSaving,
      isReady,
      error,
      updateData,
      updateStudent,
      updateAssignmentStatus,
      reload,
    }),
    [
      data,
      isLoading,
      isSaving,
      isReady,
      error,
      updateData,
      updateStudent,
      updateAssignmentStatus,
      reload,
    ],
  );
  return (
    <LearningContext.Provider value={value}>
      {children}
    </LearningContext.Provider>
  );
}
export function useLearning() {
  const context = useContext(LearningContext);
  if (!context) {
    throw new Error('useLearning phải được dùng trong LearningProvider.');
  }
  return context;
}
