import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{grade: object, onPress: Function}} props */
function GradeRow({ grade, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem điểm ${grade.course?.name || ''}`}
      onPress={onPress}
      style={styles.row}
    >
      <Text style={styles.title}>
        {grade.course?.name || 'Chưa có tên môn'}
      </Text>
      <Text style={styles.text}>
        {grade.course?.credits ?? '—'} tín chỉ · Tổng kết: {grade.total} ·{' '}
        {grade.letter}
      </Text>
    </Pressable>
  );
}
export default React.memo(GradeRow);
const styles = StyleSheet.create({
  row: {
    minHeight: spacing.touch,
    minWidth: spacing.touch,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    backgroundColor: colors.surface,
    borderRadius: spacing.md,
  },
  title: { ...typography.h3, color: colors.text },
  text: { ...typography.body, color: colors.textMuted },
});
