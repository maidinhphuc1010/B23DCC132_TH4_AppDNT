import React from 'react';
import Renderer, { act } from 'react-test-renderer';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNetworkStatus } from '../src/hooks/useNetworkStatus';
import { useCachedQuery } from '../src/hooks/useCachedQuery';
import { getCache, setCache } from '../src/storage/cache';

jest.mock('@react-native-community/netinfo', () => ({
  addEventListener: jest.fn(),
}));
let listener;
let value;
let renderer;
let online;
const unsubscribe = jest.fn();
function Consumer({ fetcher, networkOnly = false }) {
  const network = useNetworkStatus();
  const query = useCachedQuery('courses', fetcher);
  value = networkOnly ? network : query;
  return null;
}
const listeners = new Set();
beforeEach(async () => {
  await AsyncStorage.clear();
  online = true;
  listeners.clear();
  NetInfo.addEventListener.mockImplementation(callback => {
    listeners.add(callback);
    callback({ isConnected: online, isInternetReachable: online });
    return () => {
      listeners.delete(callback);
      unsubscribe();
    };
  });
  listener = state => listeners.forEach(callback => callback(state));
});
afterEach(async () => {
  await act(async () => {
    renderer?.unmount();
  });
});
async function mount(fetcher, networkOnly = false) {
  await act(async () => {
    renderer = Renderer.create(
      <Consumer fetcher={fetcher} networkOnly={networkOnly} />,
    );
  });
}
test('network status tracks changes including unknown reachability and unsubscribes', async () => {
  await mount(async () => [], true);
  expect(value.isOnline).toBe(true);
  await act(async () => {
    listener({ isConnected: true, isInternetReachable: false });
  });
  expect(value.isOnline).toBe(false);
  await act(async () => {
    listener({ isConnected: true, isInternetReachable: null });
  });
  expect(value.isOnline).toBe(true);
  await act(async () => {
    renderer.unmount();
  });
  expect(unsubscribe).toHaveBeenCalled();
});
test('shows cache before network completes, then updates cache and supports refresh', async () => {
  await setCache('courses', ['cached']);
  let resolve;
  const fetcher = jest.fn(
    () =>
      new Promise(done => {
        resolve = done;
      }),
  );
  await mount(fetcher);
  expect(value.data).toEqual(['cached']);
  await act(async () => {
    resolve(['fresh']);
  });
  expect(value.data).toEqual(['fresh']);
  expect((await getCache('courses')).data).toEqual(['fresh']);
  let refreshing;
  await act(async () => {
    refreshing = value.refresh();
  });
  expect(value.refreshing).toBe(true);
  await act(async () => {
    resolve(['refreshed']);
    await refreshing;
  });
  expect(value.refreshing).toBe(false);
  expect(value.data).toEqual(['refreshed']);
});
test('offline returns cache without fetching, reconnect fetches', async () => {
  online = false;
  await setCache('courses', ['offline']);
  const fetcher = jest.fn().mockResolvedValue(['online']);
  await mount(fetcher);
  expect(value.data).toEqual(['offline']);
  expect(fetcher).not.toHaveBeenCalled();
  await act(async () => {
    await value.refresh();
  });
  expect(fetcher).not.toHaveBeenCalled();
  await act(async () => {
    listener({ isConnected: true, isInternetReachable: true });
  });
  expect(value.data).toEqual(['online']);
});
test('no cache and failed API returns error', async () => {
  const error = { type: 'http', status: 503, message: 'Unavailable' };
  await mount(jest.fn().mockRejectedValue(error));
  expect(value.error).toEqual(error);
  expect(value.loading).toBe(false);
});
test('failed API preserves cached data', async () => {
  await setCache('courses', ['cached']);
  await mount(
    jest
      .fn()
      .mockRejectedValue({ type: 'network', status: null, message: 'Failed' }),
  );
  expect(value.data).toEqual(['cached']);
});
test('offline without cache returns actionable network error', async () => {
  online = false;
  await mount(jest.fn());
  expect(value.error.type).toBe('network');
  expect(value.loading).toBe(false);
});
