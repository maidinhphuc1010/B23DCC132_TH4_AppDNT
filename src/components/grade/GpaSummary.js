import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{gpa: number, totalCredits: number}} props */
export default function GpaSummary({ gpa, totalCredits }) {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>GPA: {Number(gpa).toFixed(2)} / 4.00</Text>
      <Text style={styles.text}>Tín chỉ tích lũy: {totalCredits}</Text>
    </View>
  );
}
const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.primarySoft,
    padding: spacing.lg,
    marginVertical: spacing.sm,
    borderRadius: spacing.md,
  },
  title: { ...typography.h3, color: colors.primary },
  text: { ...typography.body, color: colors.text },
});
