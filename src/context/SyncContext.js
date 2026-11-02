import React, { createContext, useContext, useEffect, useState } from 'react';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useOutboxSync } from '../hooks/useOutboxSync';
import { getAll } from '../storage/outbox';
import { request } from '../api/client';
import { setCache } from '../storage/cache';
const SyncContext = createContext(null);
export default function SyncProvider({ children }) {
  const network = useNetworkStatus();
  const sync = useOutboxSync();
  const [revision, setRevision] = useState(0);
  useEffect(() => {
    let active = true;
    if (sync.notice) {
      getAll()
        .then(actions => {
          const resources = new Set(
            actions.map(action => action.url.split('/')[1]),
          );
          return Promise.all(
            [...resources].map(async resource => {
              if (!resource) return;
              const url =
                resource === 'assignments'
                  ? '/assignments?_expand=course&_sort=dueDate'
                  : resource === 'students'
                  ? '/students/1'
                  : `/${resource}`;
              const data = await request('GET', url);
              await setCache(
                resource === 'students' ? 'students:1' : resource,
                data,
              );
            }),
          );
        })
        .then(() => {
          if (active) setRevision(value => value + 1);
        })
        .catch(() => {});
    }
    return () => {
      active = false;
    };
  }, [sync.notice]);
  return (
    <SyncContext.Provider value={{ ...network, ...sync, revision }}>
      {children}
    </SyncContext.Provider>
  );
}
export function useSync() {
  const value = useContext(SyncContext);
  return (
    value || {
      isOnline: true,
      pendingCount: 0,
      syncing: false,
      syncNow: async () => ({ synced: 0 }),
      refreshPending: async () => [],
      error: null,
      notice: null,
      syncAvailable: true,
      revision: 0,
    }
  );
}
