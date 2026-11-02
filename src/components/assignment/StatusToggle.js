import React from 'react';
import { Pressable, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
export default function StatusToggle({ status, onToggle }) {
  const done = status === 'done';
  return (
    <Pressable
      accessibilityRole="checkbox"
      accessibilityLabel={done ? 'Đánh dấu chưa xong' : 'Đánh dấu đã xong'}
      accessibilityState={{ checked: done }}
      onPress={() => onToggle(done ? 'todo' : 'done')}
      style={styles.button}
    >
      <Text style={[styles.text, done && styles.done]}>
        {done ? '☑ Đã xong' : '☐ Chưa xong'}
      </Text>
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minWidth: spacing.touch,
    minHeight: spacing.touch,
    padding: spacing.sm,
    justifyContent: 'center',
  },
  text: { ...typography.label, color: colors.primary },
  done: { color: colors.success },
});
