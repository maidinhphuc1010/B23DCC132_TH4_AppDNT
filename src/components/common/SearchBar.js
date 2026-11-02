import React from 'react';
import { View, TextInput, Pressable, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{value: string, onChangeText: Function, placeholder?: string}} props */
export default function SearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm',
}) {
  return (
    <View style={styles.row}>
      <TextInput
        accessibilityLabel={placeholder}
        placeholder={placeholder}
        placeholderTextColor={colors.textMuted}
        value={value}
        onChangeText={onChangeText}
        style={styles.input}
      />
      {value ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Xóa tìm kiếm"
          onPress={() => onChangeText('')}
          style={styles.clear}
        >
          <Text style={styles.text}>✕</Text>
        </Pressable>
      ) : null}
    </View>
  );
}
const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: spacing.sm,
    backgroundColor: colors.surface,
    marginBottom: spacing.sm,
  },
  input: {
    ...typography.body,
    color: colors.text,
    flex: 1,
    minHeight: spacing.touch,
    paddingHorizontal: spacing.md,
  },
  clear: {
    minWidth: spacing.touch,
    minHeight: spacing.touch,
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: { ...typography.body, color: colors.primary },
});
