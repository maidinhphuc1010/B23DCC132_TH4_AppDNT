import React from 'react';
import { View, Pressable, Text, StyleSheet } from 'react-native';
import StatusToggle from './StatusToggle';
import SyncBadge from '../common/SyncBadge';
import { formatDateTime, isOverdue } from '../../utils/date';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{assignment: object, pending?: boolean, onPress: Function, onToggleStatus: Function}} props */
function AssignmentItem({
  assignment,
  pending = false,
  onPress,
  onToggleStatus,
}) {
  return (
    <View style={styles.card}>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`Xem bài tập ${assignment.title}`}
        onPress={onPress}
        style={styles.details}
      >
        <Text style={styles.title}>{assignment.title}</Text>
        <Text style={styles.text}>
          {assignment.course?.name || 'Chưa có tên môn'}
        </Text>
        <Text style={[styles.text, isOverdue(assignment) && styles.overdue]}>
          Hạn nộp: {formatDateTime(assignment.dueDate)}
        </Text>
      </Pressable>
      <StatusToggle status={assignment.status} onToggle={onToggleStatus} />
      <SyncBadge pending={pending} />
    </View>
  );
}
export default React.memo(AssignmentItem);
const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  details: { minWidth: spacing.touch, minHeight: spacing.touch },
  title: { ...typography.h3, color: colors.text },
  text: { ...typography.body, color: colors.textMuted },
  overdue: { color: colors.error },
});
