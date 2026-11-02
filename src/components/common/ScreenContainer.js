import React from 'react';
import { ScrollView, View, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import OfflineBanner from './OfflineBanner';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';

/** @param {{children: React.ReactNode, scroll?: boolean}} props */
export default function ScreenContainer({ children, scroll = false }) {
  return (
    <SafeAreaView edges={['left', 'right', 'bottom']} style={styles.safe}>
      <OfflineBanner />
      {scroll ? (
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={styles.scroll}
        >
          {children}
        </ScrollView>
      ) : (
        <View style={styles.content}>{children}</View>
      )}
    </SafeAreaView>
  );
}
const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  content: { flex: 1, padding: spacing.lg },
  scroll: { flexGrow: 1, padding: spacing.lg },
});
