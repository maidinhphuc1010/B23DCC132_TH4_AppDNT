import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{session: object, onPress: Function}} props */
function SessionCard({ session, onPress }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={`Xem buổi học ${session.course?.name || ''}`}
      onPress={onPress}
      style={styles.card}
    >
      <Text style={styles.title}>
        {session.course?.name || 'Chưa có tên môn'}
      </Text>
      <Text style={styles.text}>
        {session.startTime} – {session.endTime}
      </Text>
      <Text style={styles.text}>Phòng: {session.room}</Text>
    </Pressable>
  );
}
export default React.memo(SessionCard);
const styles = StyleSheet.create({
  card: {
    minHeight: spacing.touch,
    minWidth: spacing.touch,
    backgroundColor: colors.surface,
    padding: spacing.lg,
    marginVertical: spacing.xs,
    borderRadius: spacing.md,
  },
  title: { ...typography.h3, color: colors.text },
  text: { ...typography.body, color: colors.textMuted },
});
