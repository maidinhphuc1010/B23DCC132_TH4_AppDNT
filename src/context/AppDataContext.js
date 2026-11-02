import React from 'react';
import OfflineAppDataProvider, { useAppData } from './OfflineAppDataProvider';
export default function AppDataProvider({ children }) {
  return <OfflineAppDataProvider>{children}</OfflineAppDataProvider>;
}
export { useAppData };
