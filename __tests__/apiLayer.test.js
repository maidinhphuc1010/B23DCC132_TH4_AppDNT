import { request } from '../src/api/client';
import * as students from '../src/api/studentService';
import * as courses from '../src/api/courseService';
import * as sessions from '../src/api/sessionService';
import * as assignments from '../src/api/assignmentService';
import * as grades from '../src/api/gradeService';

const originalFetch = global.fetch;
beforeEach(() => {
  global.fetch = jest
    .fn()
    .mockResolvedValue({
      ok: true,
      status: 200,
      json: async () => ({ id: 1 }),
    });
});
afterEach(() => {
  global.fetch = originalFetch;
  jest.useRealTimers();
});
test('services use exactly the specified GET, PATCH and POST endpoints', async () => {
  const body = { title: 'Test' };
  const cases = [
    [() => students.getById(1), 'GET', '/students/1'],
    [() => students.update(1, body), 'PATCH', '/students/1', body],
    [courses.getAll, 'GET', '/courses'],
    [() => courses.getById(2), 'GET', '/courses/2'],
    [sessions.getAll, 'GET', '/sessions?_expand=course'],
    [assignments.getAll, 'GET', '/assignments?_expand=course&_sort=dueDate'],
    [() => assignments.update(3, body), 'PATCH', '/assignments/3', body],
    [() => assignments.create(body), 'POST', '/assignments', body],
    [grades.getAll, 'GET', '/grades?_expand=course'],
  ];
  for (const [call, method, url, data] of cases) {
    expect(await call()).toEqual({ id: 1 });
    expect(global.fetch).toHaveBeenLastCalledWith(
      expect.stringContaining(url),
      expect.objectContaining({
        method,
        ...(data ? { body: JSON.stringify(data) } : {}),
      }),
    );
  }
});
test('normalizes HTTP errors', async () => {
  global.fetch.mockResolvedValue({ ok: false, status: 500 });
  await expect(request('GET', '/courses')).rejects.toEqual({
    type: 'http',
    status: 500,
    message: expect.any(String),
  });
});
test('normalizes network errors', async () => {
  global.fetch.mockRejectedValue(new TypeError('Failed to fetch'));
  await expect(request('GET', '/courses')).rejects.toEqual({
    type: 'network',
    status: null,
    message: 'Failed to fetch',
  });
});
test('times out and aborts at 10 seconds even when fetch never settles', async () => {
  jest.useFakeTimers();
  global.fetch.mockImplementation(() => new Promise(() => {}));
  const pending = request('GET', '/courses').catch(error => error);
  await jest.advanceTimersByTimeAsync(10000);
  expect(await pending).toMatchObject({ type: 'timeout', status: null });
  expect(global.fetch.mock.calls[0][1].signal.aborted).toBe(true);
});
test('invalid JSON is a normalized HTTP error', async () => {
  global.fetch.mockResolvedValue({
    ok: true,
    status: 200,
    json: async () => {
      throw new SyntaxError();
    },
  });
  await expect(request('GET', '/courses')).rejects.toMatchObject({
    type: 'http',
    status: 200,
  });
});
