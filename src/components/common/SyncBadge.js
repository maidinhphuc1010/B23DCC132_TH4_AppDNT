import React from 'react';
import { Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
export default function SyncBadge({ pending = false }) {
  return pending ? <Text style={styles.badge}>{'Chưa đồng bộ'}</Text> : null;
}
const styles = StyleSheet.create({
  badge: {
    ...typography.caption,
    color: colors.warning,
    backgroundColor: colors.warningSoft,
    padding: spacing.xs,
    alignSelf: 'flex-start',
    borderRadius: spacing.xs,
  },
});
