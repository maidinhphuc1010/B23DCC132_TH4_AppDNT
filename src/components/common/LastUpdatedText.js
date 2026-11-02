import React from 'react';
import { Text, StyleSheet } from 'react-native';
import { formatDateTime } from '../../utils/date';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
export default function LastUpdatedText({ timestamp = null }) {
  return timestamp ? (
    <Text style={styles.text}>
      {'Cập nhật lần cuối: '}
      {formatDateTime(timestamp)}
    </Text>
  ) : null;
}
const styles = StyleSheet.create({
  text: {
    ...typography.caption,
    color: colors.textMuted,
    marginVertical: spacing.sm,
  },
});
