import { useCallback, useEffect, useRef, useState } from 'react';
import { getCache, setCache } from '../storage/cache';
import { useNetworkStatus } from './useNetworkStatus';

const initial = {
  data: null,
  loading: true,
  error: null,
  refreshing: false,
  lastUpdated: null,
};
const offlineError = {
  type: 'network',
  status: null,
  message: 'Bạn đang offline và chưa có dữ liệu lưu.',
};

export function useCachedQuery(key, fetcher) {
  const { isOnline } = useNetworkStatus();
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;
  const generation = useRef(0);
  const active = useRef(null);
  const [state, setState] = useState(initial);

  const run = useCallback(
    (context, refreshing) => {
      if (context.pending) {
        return context.pending;
      }
      const valid = () => generation.current === context.id;
      const publish = patch => {
        if (valid()) {
          setState(previous => ({ ...previous, ...patch }));
        }
      };
      publish({ refreshing, error: null });
      const work = async () => {
        try {
          // Always finish reading cache before starting the network request.
          let cached;
          try {
            cached = await getCache(key);
          } catch {
            /* A storage failure must not block the API. */
          }
          if (!cached && /^(assignments|sessions|grades):/.test(key)) {
            try {
              const [resource, id] = key.split(':');
              const list = await getCache(resource);
              const record = list?.data?.find(item => String(item.id) === id);
              if (record) {
                cached = { data: record, savedAt: list.savedAt };
              }
            } catch {
              /* Fall back to the detail API if cache is unavailable. */
            }
          }
          if (!valid()) {
            return;
          }
          if (cached) {
            context.hasData = true;
            publish({
              data: cached.data,
              lastUpdated: cached.savedAt,
              loading: false,
            });
          }
          if (!isOnline) {
            publish({ error: context.hasData ? null : offlineError });
            return;
          }
          const data = await fetcherRef.current();
          if (!valid()) {
            return;
          }
          context.hasData = true;
          const savedAt = new Date().toISOString();
          publish({ data, lastUpdated: savedAt, loading: false, error: null });
          try {
            const saved = await setCache(key, data);
            publish({ lastUpdated: saved.savedAt });
          } catch {
            publish({
              error: {
                type: 'storage',
                status: null,
                message: 'Đã tải dữ liệu nhưng không lưu được cache.',
              },
            });
          }
          return data;
        } catch (error) {
          publish({
            error: ['network', 'timeout', 'http'].includes(error?.type)
              ? error
              : {
                  type: 'network',
                  status: null,
                  message: error?.message || 'Không thể tải dữ liệu.',
                },
          });
        } finally {
          publish({ loading: false, refreshing: false });
        }
      };
      context.pending = work().finally(() => {
        context.pending = null;
      });
      return context.pending;
    },
    [key, isOnline],
  );

  useEffect(() => {
    const context = { id: ++generation.current, hasData: false, pending: null };
    active.current = context;
    setState(initial);
    run(context, false);
    return () => {
      generation.current = context.id + 1;
      active.current = null;
    };
  }, [run]);

  const refresh = useCallback(() => {
    return active.current ? run(active.current, true) : Promise.resolve();
  }, [run]);

  return { ...state, refresh };
}
