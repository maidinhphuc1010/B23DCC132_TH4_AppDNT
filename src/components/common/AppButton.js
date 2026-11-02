import React from 'react';
import { Pressable, Text, ActivityIndicator, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{title: string, onPress: Function, variant?: string, loading?: boolean, disabled?: boolean}} props */
export default function AppButton({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
}) {
  const outline = variant === 'outline';
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={title}
      accessibilityState={{ disabled: disabled || loading, busy: loading }}
      disabled={disabled || loading}
      onPress={onPress}
      style={[
        styles.button,
        outline && styles.outline,
        (disabled || loading) && styles.disabled,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          color={outline ? colors.primary : colors.onPrimary}
        />
      ) : (
        <Text style={[styles.text, outline && styles.outlineText]}>
          {title}
        </Text>
      )}
    </Pressable>
  );
}
const styles = StyleSheet.create({
  button: {
    minHeight: spacing.touch,
    minWidth: spacing.touch,
    padding: spacing.md,
    marginVertical: spacing.xs,
    borderRadius: spacing.sm,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: colors.primary,
  },
  outline: { backgroundColor: colors.surface },
  disabled: { opacity: 0.5 },
  text: { ...typography.label, color: colors.onPrimary },
  outlineText: { color: colors.primary },
});
