import React from 'react';
import { Text, ActivityIndicator } from 'react-native';
import Renderer, { act } from 'react-test-renderer';
import { LearningGate } from '../src/components/LearningGate';
import {
  LearningProvider,
  LEARNING_STORAGE_KEY,
} from '../src/context/LearningContext';
import { storage } from '../src/utils/storage';
import { useLearning } from '../src/hooks/useLearning';
// Keep the test focused on the gate, not native safe-area layout.
jest.mock('../src/components/Screen', () => ({
  Screen: ({ children }) => children,
}));
let renderer;
let context;
function Probe() {
  context = useLearning();
  return <Text>Ready content</Text>;
}
async function mount() {
  await act(async () => {
    renderer = Renderer.create(
      <LearningProvider>
        <LearningGate>
          <Probe />
        </LearningGate>
      </LearningProvider>,
    );
  });
}
function contentVisible() {
  return renderer.root.findAllByType(Probe).length > 0;
}
beforeEach(async () => {
  await storage.remove(LEARNING_STORAGE_KEY);
});
afterEach(async () => {
  await act(async () => renderer?.unmount());
  jest.restoreAllMocks();
});
test('waits for hydration before exposing content', async () => {
  let resolve;
  jest.spyOn(storage, 'get').mockReturnValueOnce(
    new Promise(done => {
      resolve = done;
    }),
  );
  await mount();
  expect(contentVisible()).toBe(false);
  expect(renderer.root.findAllByType(ActivityIndicator)).toHaveLength(1);
  await act(async () => {
    resolve(null);
  });
  expect(contentVisible()).toBe(true);
});
test('shows read errors and retries without an unhandled rejection', async () => {
  jest
    .spyOn(storage, 'get')
    .mockRejectedValueOnce(new Error('Read failed'))
    .mockRejectedValueOnce(new Error('Still unavailable'));
  await mount();
  expect(contentVisible()).toBe(false);
  await act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Thử tải lại' })
      .props.onPress();
  });
  expect(contentVisible()).toBe(false);
  expect(JSON.stringify(renderer.toJSON())).toContain('Still unavailable');
  await act(async () => {
    renderer.root
      .findByProps({ accessibilityLabel: 'Thử tải lại' })
      .props.onPress();
  });
  expect(contentVisible()).toBe(true);
});
test('preserves malformed saved data and blocks content', async () => {
  const invalid = { version: 1, data: { student: null } };
  await storage.set(LEARNING_STORAGE_KEY, invalid);
  const write = jest.spyOn(storage, 'set');
  await mount();
  expect(contentVisible()).toBe(false);
  expect(write).not.toHaveBeenCalled();
  expect(await storage.get(LEARNING_STORAGE_KEY)).toEqual(invalid);
});
test('shows save errors without hiding content and permits retry', async () => {
  await mount();
  const before = context.data;
  jest.spyOn(storage, 'set').mockRejectedValueOnce(new Error('Disk full'));
  await act(async () => {
    await expect(context.updateData(draft => draft)).rejects.toThrow(
      'Disk full',
    );
  });
  expect(contentVisible()).toBe(true);
  expect(context.data).toBe(before);
  expect(JSON.stringify(renderer.toJSON())).toContain('Disk full');
  await act(async () => {
    await context.updateData(draft => draft);
  });
  expect(context.error).toBeNull();
});
