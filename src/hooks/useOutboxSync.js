import { useCallback, useEffect, useRef, useState } from 'react';
import { request } from '../api/client';
import { getCache, setCache } from '../storage/cache';
import { getAll, remove } from '../storage/outbox';
import { useNetworkStatus } from './useNetworkStatus';
const listeners = new Set();
export function notifyOutboxChanged() {
  listeners.forEach(listener => listener());
}
export function useOutboxSync() {
  const { isOnline } = useNetworkStatus();
  const [pendingCount, setPendingCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [error, setError] = useState(null);
  const [notice, setNotice] = useState(null);
  const mounted = useRef(false);
  const lock = useRef(null);
  const refreshPending = useCallback(async () => {
    try {
      const actions = await getAll();
      if (mounted.current) {
        setPendingCount(actions.length);
        setError(null);
      }
      return actions;
    } catch (failure) {
      if (mounted.current) setError(failure);
      return [];
    }
  }, []);
  const syncNow = useCallback(() => {
    if (!isOnline) return Promise.resolve({ synced: 0 });
    if (lock.current) return lock.current;
    const work = (async () => {
      setSyncing(true);
      let synced = 0;
      let conflicts = 0;
      try {
        const actions = await getAll();
        for (const action of actions) {
          if (!isOnline) break;
          try {
            if (action.method === 'PATCH' && action.meta?.baseUpdatedAt) {
              const server = await request(
                'GET',
                action.meta.url || action.url,
              );
              if (
                server?.updatedAt &&
                Date.parse(server.updatedAt) >
                  Date.parse(action.meta.baseUpdatedAt)
              ) {
                if (action.meta.localKey) {
                  try {
                    await setCache(action.meta.localKey, server);
                  } catch {
                    /* Best effort. */
                  }
                }
                await remove(action.id);
                conflicts += 1;
                continue;
              }
            }
            const result = await request(
              action.method,
              action.url,
              action.body === null ? undefined : action.body,
            );
            if (action.method === 'POST' && result) {
              const collection = action.url.replace(/^\//, '').split('?')[0];
              const cached = await getCache(collection);
              if (cached?.data)
                await setCache(collection, [
                  ...cached.data.filter(
                    row => String(row.id) !== String(action.meta?.tempId),
                  ),
                  result,
                ]);
              if (action.meta?.localKey)
                await setCache(action.meta.localKey, result);
            }
            if (action.method === 'PATCH' && action.meta?.localKey && result)
              await setCache(action.meta.localKey, result);
            await remove(action.id);
            synced += 1;
          } catch (failure) {
            setError(failure);
            break;
          }
        }
        notifyOutboxChanged();
        await refreshPending();
        if (synced + conflicts) {
          setNotice(
            conflicts
              ? `Đã đồng bộ ${synced} thay đổi; ${conflicts} thay đổi xung đột được bỏ qua vì server mới hơn.`
              : `Đã đồng bộ ${synced} thay đổi`,
          );
          setTimeout(() => setNotice(null), 6000);
        }
        return { synced, conflicts };
      } finally {
        if (mounted.current) setSyncing(false);
      }
    })();
    lock.current = work.finally(() => {
      lock.current = null;
    });
    return lock.current;
  }, [isOnline, refreshPending]);
  useEffect(() => {
    mounted.current = true;
    const update = () => refreshPending();
    listeners.add(update);
    refreshPending();
    return () => {
      mounted.current = false;
      listeners.delete(update);
    };
  }, [refreshPending]);
  useEffect(() => {
    if (isOnline) syncNow();
  }, [isOnline, syncNow]);
  return {
    pendingCount,
    syncing,
    syncNow,
    refreshPending,
    error,
    notice,
    syncAvailable: true,
  };
}
