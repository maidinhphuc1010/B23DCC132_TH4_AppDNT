import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{course: object, onPress: Function}} props */
function CourseCard({ course, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem môn ${course.name}`}
      onPress={onPress}
      style={styles.card}
    >
      <Text style={styles.title}>
        {course.code} · {course.name}
      </Text>
      <Text style={styles.text}>{course.credits} tín chỉ</Text>
      <Text style={styles.text}>Giảng viên: {course.lecturer}</Text>
    </Pressable>
  );
}
export default React.memo(CourseCard);
const styles = StyleSheet.create({
  card: {
    minHeight: spacing.touch,
    minWidth: spacing.touch,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
  },
  title: { ...typography.h3, color: colors.text },
  text: { ...typography.body, color: colors.textMuted },
});
