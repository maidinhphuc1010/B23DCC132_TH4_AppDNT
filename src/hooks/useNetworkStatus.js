import { useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';

let currentOnline = false;
let started = false;
let unsubscribeNetInfo;
const subscribers = new Set();
function publish(state) {
  const next =
    state.isConnected === true && state.isInternetReachable !== false;
  currentOnline = next;
  subscribers.forEach(listener => listener(next));
}
function start() {
  if (started) {
    return;
  }
  started = true;
  try {
    unsubscribeNetInfo = NetInfo.addEventListener(publish);
    NetInfo.fetch?.()
      .then(publish)
      .catch(() => {});
  } catch {
    currentOnline = false;
  }
}
export function useNetworkStatus() {
  const [isOnline, setIsOnline] = useState(currentOnline);
  useEffect(() => {
    start();
    subscribers.add(setIsOnline);
    setIsOnline(currentOnline);
    return () => {
      subscribers.delete(setIsOnline);
      if (subscribers.size === 0 && started) {
        unsubscribeNetInfo?.();
        unsubscribeNetInfo = undefined;
        started = false;
      }
    };
  }, []);
  return { isOnline };
}
