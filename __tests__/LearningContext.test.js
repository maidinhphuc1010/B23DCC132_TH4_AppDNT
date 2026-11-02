import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import {
  LearningProvider,
  LEARNING_STORAGE_KEY,
} from '../src/context/LearningContext';
import { useLearning } from '../src/hooks/useLearning';
import { storage } from '../src/utils/storage';
import { createLearningData } from '../src/utils/learningData';
let context;
let renderer;
function Probe() {
  context = useLearning();
  return null;
}
async function mount() {
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <Probe />
      </LearningProvider>,
    );
  });
}
beforeEach(async () => {
  await storage.remove(LEARNING_STORAGE_KEY);
});
afterEach(async () => {
  jest.restoreAllMocks();
  if (renderer) {
    await act(async () => renderer.unmount());
  }
});
test('changes assignment progress, reopens completed work and persists only the target status', async () => {
  await mount();
  const before = context.data;
  const id = before.assignments[0].id;
  for (const status of ['in_progress', 'completed', 'todo', 'todo']) {
    await act(async () => {
      await context.updateAssignmentStatus(id, status);
      await context.reload();
    });
    expect(context.data).toEqual({
      ...before,
      assignments: before.assignments.map(item =>
        item.id === id ? { ...item, status } : item,
      ),
    });
  }
});
test('rejects missing assignments and invalid statuses without writing', async () => {
  await mount();
  const before = context.data;
  const write = jest.spyOn(storage, 'set');
  await act(async () => {
    await expect(
      context.updateAssignmentStatus('missing', 'completed'),
    ).rejects.toThrow('Bài tập không tồn tại');
    await expect(
      // @ts-expect-error Exercise runtime validation for untrusted input.
      context.updateAssignmentStatus(before.assignments[0].id, 'overdue'),
    ).rejects.toThrow('Trạng thái bài tập không hợp lệ');
  });
  expect(context.data).toBe(before);
  expect(write).not.toHaveBeenCalled();
  expect(context.error).not.toBeNull();
  expect(context.isSaving).toBe(false);
});
test('retains assignment state on write failure and permits retry', async () => {
  await mount();
  const before = context.data;
  const id = before.assignments[0].id;
  jest.spyOn(storage, 'set').mockRejectedValueOnce(new Error('Disk full'));
  await act(async () => {
    await expect(
      context.updateAssignmentStatus(id, 'completed'),
    ).rejects.toThrow('Disk full');
  });
  expect(context.data).toBe(before);
  await act(async () => {
    await context.updateAssignmentStatus(id, 'completed');
  });
  expect(context.data.assignments[0].status).toBe('completed');
  expect(context.error).toBeNull();
});
test('serializes assignment status changes without losing other updates', async () => {
  await mount();
  const [first, second] = context.data.assignments;
  await act(async () => {
    await Promise.all([
      context.updateAssignmentStatus(first.id, 'in_progress'),
      context.updateAssignmentStatus(second.id, 'completed'),
      context.updateAssignmentStatus(first.id, 'completed'),
    ]);
  });
  expect(context.data.assignments[0].status).toBe('completed');
  expect(context.data.assignments[1].status).toBe('completed');
  expect(await storage.get(LEARNING_STORAGE_KEY)).toEqual({
    version: 1,
    data: context.data,
  });
});
const profile = {
  studentCode: '001',
  fullName: 'Nguyễn An',
  email: 'an@example.com',
};
test('restores saved profile and assignment changes in a new provider', async () => {
  await mount();
  const id = context.data.assignments[0].id;
  await act(async () => {
    await context.updateStudent(profile);
    await context.updateAssignmentStatus(id, 'completed');
  });
  const savedData = context.data;
  expect(await storage.get(LEARNING_STORAGE_KEY)).toEqual({
    version: 1,
    data: savedData,
  });
  await act(async () => renderer.unmount());
  const write = jest.spyOn(storage, 'set');
  await mount();
  expect(context.isReady).toBe(true);
  expect(context.error).toBeNull();
  expect(context.data).toEqual(savedData);
  expect(write).not.toHaveBeenCalled();
});
test('preserves saved changes on read failure and restores them on retry', async () => {
  await mount();
  await act(async () => {
    await context.updateStudent(profile);
  });
  const savedData = context.data;
  await act(async () => renderer.unmount());
  jest.spyOn(storage, 'get').mockRejectedValueOnce(new Error('Read failed'));
  const write = jest.spyOn(storage, 'set');
  await mount();
  expect(context.isReady).toBe(false);
  expect(context.isLoading).toBe(false);
  expect(context.error).toBe('Read failed');
  await expect(context.updateStudent({ fullName: 'Changed' })).rejects.toThrow(
    'chưa sẵn sàng',
  );
  expect(write).not.toHaveBeenCalled();
  expect(await storage.get(LEARNING_STORAGE_KEY)).toEqual({
    version: 1,
    data: savedData,
  });
  await act(async () => {
    await context.reload();
  });
  expect(context.data).toEqual(savedData);
  expect(context.isReady).toBe(true);
  expect(context.error).toBeNull();
});
test('creates, patches and reloads a student without changing other data', async () => {
  await mount();
  const subjects = context.data.subjects;
  await act(async () => {
    await context.updateStudent({
      ...profile,
      fullName: ' Nguyễn An ',
      phone: '123',
    });
  });
  const id = context.data.student?.id;
  await act(async () => {
    await Promise.all([
      context.updateStudent({ major: 'CNTT' }),
      context.updateStudent({ phone: '', className: 'A1' }),
    ]);
    await context.reload();
  });
  expect(context.data.student).toEqual({
    ...profile,
    id,
    major: 'CNTT',
    className: 'A1',
  });
  expect(context.data.subjects).toEqual(subjects);
});
test.each([
  { fullName: '' },
  { email: 'invalid' },
  { dateOfBirth: '2025-02-30' },
  { dateOfBirth: '2999-01-01' },
])('rejects invalid student update %j without writing', async patch => {
  await mount();
  await act(async () => {
    await context.updateStudent(profile);
  });
  const before = context.data;
  const write = jest.spyOn(storage, 'set');
  await act(async () => {
    await expect(context.updateStudent(patch)).rejects.toThrow();
  });
  expect(context.data).toBe(before);
  expect(write).not.toHaveBeenCalled();
});
test('requires complete initial profile and retains profile on save failure', async () => {
  await mount();
  await act(async () => {
    await expect(context.updateStudent({ fullName: 'An' })).rejects.toThrow();
  });
  expect(context.data.student).toBeNull();
  await act(async () => {
    await context.updateStudent(profile);
  });
  const before = context.data.student;
  jest.spyOn(storage, 'set').mockRejectedValueOnce(new Error('Disk full'));
  await act(async () => {
    await expect(context.updateStudent({ fullName: 'Bình' })).rejects.toThrow(
      'Disk full',
    );
  });
  expect(context.data.student).toBe(before);
  await act(async () => {
    await context.updateStudent({ fullName: 'Bình' });
  });
  expect(context.data.student?.fullName).toBe('Bình');
});
test('loads isolated sample data without writing during hydration', async () => {
  const write = jest.spyOn(storage, 'set');
  await mount();
  expect(context.isReady).toBe(true);
  expect(context.isLoading).toBe(false);
  expect(context.data).toEqual(createLearningData());
  expect(write).not.toHaveBeenCalled();
});
test('loads saved data including deliberately empty collections', async () => {
  const data = {
    student: null,
    subjects: [],
    studySessions: [],
    assignments: [],
    academicResults: [],
  };
  await storage.set(LEARNING_STORAGE_KEY, { version: 1, data });
  await mount();
  expect(context.data).toEqual(data);
});
test('serializes concurrent updates and persists the latest snapshot', async () => {
  await mount();
  await act(async () => {
    await Promise.all([
      context.updateData(draft => {
        draft.subjects[0].name = 'Updated';
        return draft;
      }),
      context.updateData(draft => {
        draft.assignments[0].status = 'todo';
        return draft;
      }),
    ]);
  });
  expect(context.data.subjects[0].name).toBe('Updated');
  expect(context.data.assignments[0].status).toBe('todo');
  expect(await storage.get(LEARNING_STORAGE_KEY)).toEqual({
    version: 1,
    data: context.data,
  });
  expect(context.isSaving).toBe(false);
});
test('rejects broken references without changing data', async () => {
  await mount();
  const before = context.data;
  await act(async () => {
    await expect(
      context.updateData(draft => {
        draft.subjects = [];
        return draft;
      }),
    ).rejects.toThrow('Môn học không tồn tại');
  });
  expect(context.data).toBe(before);
  expect(context.error).not.toBeNull();
});
test('write failure keeps previous state and permits retry', async () => {
  await mount();
  const before = context.data;
  jest.spyOn(storage, 'set').mockRejectedValueOnce(new Error('Disk full'));
  await act(async () => {
    await expect(
      context.updateData(draft => {
        draft.subjects[0].name = 'Changed';
        return draft;
      }),
    ).rejects.toThrow('Disk full');
  });
  expect(context.data).toBe(before);
  await act(async () => {
    await context.updateData(draft => draft);
  });
  expect(context.error).toBeNull();
});
test('invalid saved data is preserved and blocks edits until reload succeeds', async () => {
  await storage.set(LEARNING_STORAGE_KEY, { version: 99 });
  await mount();
  expect(context.isReady).toBe(false);
  expect(context.error).not.toBeNull();
  await expect(context.updateData(draft => draft)).rejects.toThrow(
    'chưa sẵn sàng',
  );
  expect(await storage.get(LEARNING_STORAGE_KEY)).toEqual({ version: 99 });
  await storage.remove(LEARNING_STORAGE_KEY);
  await act(async () => {
    await context.reload();
  });
  expect(context.isReady).toBe(true);
});
