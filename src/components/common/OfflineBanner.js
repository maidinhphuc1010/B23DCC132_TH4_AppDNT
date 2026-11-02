import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { useNetworkStatus } from '../../hooks/useNetworkStatus';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
export default function OfflineBanner() {
  const { isOnline } = useNetworkStatus();
  return isOnline ? null : (
    <Text accessibilityRole="alert" style={styles.banner}>
      {'Bạn đang offline'}
    </Text>
  );
}
const styles = StyleSheet.create({
  banner: {
    ...typography.label,
    padding: spacing.sm,
    backgroundColor: colors.warningSoft,
    color: colors.warning,
    textAlign: 'center',
  },
});
