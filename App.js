import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import AppNavigator from './src/navigation/AppNavigator';
import OfflineAppDataProvider from './src/context/OfflineAppDataProvider';
import SyncProvider from './src/context/SyncContext';
export default function App() {
  return (
    <SafeAreaProvider>
      <SyncProvider>
        <OfflineAppDataProvider>
          <AppNavigator />
        </OfflineAppDataProvider>
      </SyncProvider>
    </SafeAreaProvider>
  );
}
