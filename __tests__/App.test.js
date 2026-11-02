/**
 * @format
 */
import React from 'react';
import ReactTestRenderer from 'react-test-renderer';
import App from '../App';
jest.mock('@react-native-community/netinfo', () =>
  require('@react-native-community/netinfo/jest/netinfo-mock'),
);
jest.mock(
  'react-native-safe-area-context',
  () => require('react-native-safe-area-context/jest/mock').default,
);
jest.mock('../src/api/client', () => ({
  request: jest
    .fn()
    .mockRejectedValue({
      type: 'network',
      message: 'Không có máy chủ trong test.',
    }),
}));
test('renders correctly', async () => {
  let renderer;
  await ReactTestRenderer.act(async () => {
    renderer = ReactTestRenderer.create(<App />);
  });
  expect(renderer.toJSON()).not.toBeNull();
  await ReactTestRenderer.act(async () => renderer.unmount());
});
