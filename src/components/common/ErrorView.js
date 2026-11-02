import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import AppButton from './AppButton';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';
export default function ErrorView({ message, onRetry }) {
  return (
    <View accessibilityRole="alert" style={styles.container}>
      <Text style={styles.icon}>!</Text>
      <Text style={styles.text}>{message}</Text>
      <AppButton title={'Thử lại'} onPress={onRetry} variant="outline" />
    </View>
  );
}
const styles = StyleSheet.create({
  container: { padding: spacing.lg, alignItems: 'center' },
  icon: { ...typography.title, color: colors.error },
  text: {
    ...typography.body,
    color: colors.error,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
});
