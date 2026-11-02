import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import { useLearning } from '../src/hooks/useLearning';
import { useLearning as contextHook } from '../src/context/LearningContext';
function Consumer() {
  useLearning();
  return null;
}
test('exposes the same hook as the compatible context import', () => {
  expect(useLearning).toBe(contextHook);
});
test('throws a clear error when used outside LearningProvider', async () => {
  const consoleError = jest
    .spyOn(console, 'error')
    .mockImplementation(() => {});
  try {
    let caught;
    class Boundary extends React.Component {
      state = { failed: false };
      static getDerivedStateFromError() {
        return { failed: true };
      }
      componentDidCatch(error) {
        caught = error;
      }
      render() {
        return this.state.failed ? null : this.props.children;
      }
    }
    let renderer;
    await act(async () => {
      renderer = Renderer.create(
        <Boundary>
          <Consumer />
        </Boundary>,
      );
    });
    expect(caught?.message).toBe(
      'useLearning phải được dùng trong LearningProvider.',
    );
    await act(async () => {
      renderer?.unmount();
    });
  } finally {
    consoleError.mockRestore();
  }
});
