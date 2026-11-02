import React from 'react';
import { ScrollView, Pressable, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{options: Array<{label: string, value: string|number}>, selected: string|number, onSelect: Function}} props */
export default function FilterChips({ options, selected, onSelect }) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      style={styles.scroll}
      contentContainerStyle={styles.row}
    >
      {options.map(option => (
        <Pressable
          key={String(option.value)}
          accessibilityRole="button"
          accessibilityLabel={option.label}
          accessibilityState={{ selected: selected === option.value }}
          onPress={() => onSelect(option.value)}
          style={[styles.chip, selected === option.value && styles.selected]}
        >
          <Text
            style={[
              styles.text,
              selected === option.value && styles.selectedText,
            ]}
          >
            {option.label}
          </Text>
        </Pressable>
      ))}
    </ScrollView>
  );
}
const styles = StyleSheet.create({
  scroll: { flexGrow: 0, flexShrink: 0 },
  row: { gap: spacing.sm, paddingVertical: spacing.sm },
  chip: {
    minWidth: spacing.touch,
    minHeight: spacing.touch,
    paddingHorizontal: spacing.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: spacing.xl,
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: colors.border,
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  text: { ...typography.label, color: colors.text },
  selectedText: { color: colors.onPrimary },
});
