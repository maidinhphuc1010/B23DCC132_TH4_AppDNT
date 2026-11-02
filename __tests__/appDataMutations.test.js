import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import AppDataProvider, { useAppData } from '../src/context/AppDataContext';
import * as service from '../src/api/assignmentService';
import { setCache } from '../src/storage/cache';
jest.mock('../src/hooks/useNetworkStatus', () => ({
  useNetworkStatus: () => ({ isOnline: true }),
}));
jest.mock('../src/storage/cache', () => ({
  setCache: jest.fn().mockResolvedValue({}),
}));
jest.mock('../src/api/assignmentService', () => ({
  update: jest.fn(),
  create: jest.fn(),
}));
const mockRefresh = jest.fn();
const mockAssignment = {
  id: 1,
  courseId: 1,
  title: 'API assignment',
  status: 'todo',
  dueDate: '2027-01-01',
};
jest.mock('../src/hooks/useCachedQuery', () => ({
  useCachedQuery: key => ({
    data: key === 'assignments' ? [mockAssignment] : [],
    refresh: mockRefresh,
  }),
}));
let value;
let renderer;
function Consumer() {
  value = useAppData();
  return null;
}
beforeEach(async () => {
  jest.clearAllMocks();
  await act(async () => {
    renderer = Renderer.create(
      <AppDataProvider>
        <Consumer />
      </AppDataProvider>,
    );
  });
});
afterEach(async () => {
  await act(async () => renderer.unmount());
});
test('updates immediately, rolls back on PATCH error and does not cache optimistic data', async () => {
  let reject;
  service.update.mockImplementation(
    () =>
      new Promise((resolve, fail) => {
        reject = fail;
      }),
  );
  let pending;
  await act(async () => {
    pending = value.saveAssignment({ status: 'done' }, 1).catch(error => error);
  });
  expect(value.assignments.data[0].status).toBe('done');
  expect(setCache).not.toHaveBeenCalled();
  await act(async () => {
    reject(new Error('Server failed'));
    await pending;
  });
  expect(value.assignments.data[0].status).toBe('todo');
  expect((await pending).message).toBe('Server failed');
});
test('successful PATCH survives failed refresh and caches confirmed data', async () => {
  service.update.mockResolvedValue({ ...mockAssignment, status: 'done' });
  await act(async () => {
    await value.saveAssignment({ status: 'done' }, 1);
  });
  mockRefresh.mockResolvedValue(undefined);
  await act(async () => {
    await value.assignments.refresh();
  });
  expect(value.assignments.data[0].status).toBe('done');
  expect(setCache).toHaveBeenCalledWith(
    'assignments:1',
    expect.objectContaining({ status: 'done' }),
  );
});
test('POST adds the returned API record to the shared list', async () => {
  service.create.mockResolvedValue({ ...mockAssignment, id: 2 });
  await act(async () => {
    await value.saveAssignment({
      title: 'API assignment',
      courseId: 1,
      status: 'todo',
      dueDate: '2027-01-01',
    });
  });
  expect(value.assignments.data.map(item => item.id)).toEqual([1, 2]);
  expect(service.create).toHaveBeenCalled();
});
