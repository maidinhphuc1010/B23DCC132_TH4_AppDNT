import React from 'react';
import {
  ActivityIndicator,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { theme } from '../theme';
export function Header({ eyebrow, title, subtitle }) {
  return (
    <View style={styles.header}>
      {eyebrow != null && <Text style={styles.eyebrow}>{eyebrow}</Text>}
      <Text accessibilityRole="header" style={styles.title}>
        {title}
      </Text>
      {subtitle != null && <Text style={styles.body}>{subtitle}</Text>}
    </View>
  );
}
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}
export function Section({ title, children }) {
  return (
    <View style={styles.section}>
      <Text accessibilityRole="header" style={styles.heading}>
        {title}
      </Text>
      {children}
    </View>
  );
}
const badgeColors = {
  primary: {
    backgroundColor: theme.colors.primarySoft,
    color: theme.colors.primary,
  },
  success: {
    backgroundColor: theme.colors.successSoft,
    color: theme.colors.success,
  },
  warning: {
    backgroundColor: theme.colors.warningSoft,
    color: theme.colors.warning,
  },
  error: { backgroundColor: theme.colors.errorSoft, color: theme.colors.error },
};
export function Badge({ label, variant = 'primary' }) {
  return (
    <View
      style={[
        styles.badge,
        { backgroundColor: badgeColors[variant].backgroundColor },
      ]}
    >
      <Text style={[styles.badgeText, { color: badgeColors[variant].color }]}>
        {label}
      </Text>
    </View>
  );
}
export function SearchBar({
  value,
  onChangeText,
  placeholder = 'Tìm kiếm…',
  accessibilityLabel = 'Tìm kiếm',
}) {
  return (
    <TextInput
      accessibilityLabel={accessibilityLabel}
      accessibilityRole="search"
      value={value}
      onChangeText={onChangeText}
      placeholder={placeholder}
      placeholderTextColor={theme.colors.textSecondary}
      returnKeyType="search"
      clearButtonMode="while-editing"
      style={styles.searchBar}
    />
  );
}
export function Row({ label, value }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}
export function LoadingState({ message = 'Đang tải…' }) {
  return (
    <View accessibilityRole="progressbar" style={styles.stateContainer}>
      <ActivityIndicator
        accessibilityLabel={message}
        color={theme.colors.primary}
      />
      <Text style={styles.body}>{message}</Text>
    </View>
  );
}
export function ErrorState({
  title = 'Đã xảy ra lỗi',
  message,
  onRetry,
  retryLabel = 'Thử lại',
}) {
  return (
    <View accessibilityRole="alert" style={styles.stateContainer}>
      <Text accessibilityRole="header" style={styles.errorTitle}>
        {title}
      </Text>
      <Text style={styles.errorMessage}>{message}</Text>
      {onRetry && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={retryLabel}
          onPress={onRetry}
          style={styles.actionButton}
        >
          <Text style={styles.actionText}>{retryLabel}</Text>
        </Pressable>
      )}
    </View>
  );
}
export function BackButton({ onPress, label = 'Quay lại' }) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={label}
      onPress={onPress}
      style={styles.backButton}
    >
      <Text style={styles.backButtonText}>‹ {label}</Text>
    </Pressable>
  );
}
export function EmptyState({ title, message = 'Chưa có dữ liệu.' }) {
  return (
    <View accessibilityRole="summary" style={styles.emptyState}>
      {title != null && <Text style={styles.emptyTitle}>{title}</Text>}
      <Text style={styles.empty}>{message}</Text>
    </View>
  );
}
const statusConfig = {
  todo: { label: 'Chưa thực hiện', variant: 'warning' },
  in_progress: { label: 'Đang thực hiện', variant: 'primary' },
  completed: { label: 'Đã hoàn thành', variant: 'success' },
};
export function StatusBadge({ status }) {
  const config = statusConfig[status];
  return <Badge label={config.label} variant={config.variant} />;
}
const styles = StyleSheet.create({
  header: { gap: theme.spacing.sm, paddingTop: theme.spacing.lg },
  eyebrow: { ...theme.typography.label, color: theme.colors.primary },
  title: { ...theme.typography.title, color: theme.colors.text },
  body: { ...theme.typography.body, color: theme.colors.textSecondary },
  heading: { ...theme.typography.heading, color: theme.colors.text },
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  section: { gap: theme.spacing.md },
  badge: {
    alignSelf: 'flex-start',
    borderRadius: theme.radius.sm,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.xs,
  },
  badgeText: { ...theme.typography.label },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  rowLabel: {
    ...theme.typography.label,
    color: theme.colors.textSecondary,
    flex: 1,
  },
  rowValue: {
    ...theme.typography.body,
    color: theme.colors.text,
    flex: 2,
    textAlign: 'right',
  },
  searchBar: {
    ...theme.typography.body,
    minHeight: theme.layout.minTouchTarget,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: theme.colors.surface,
    color: theme.colors.text,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  stateContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.xl,
  },
  errorTitle: { ...theme.typography.heading, color: theme.colors.error },
  errorMessage: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
  actionButton: {
    minHeight: theme.layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.xl,
  },
  actionText: { ...theme.typography.label, color: theme.colors.onPrimary },
  backButton: {
    minHeight: theme.layout.minTouchTarget,
    alignSelf: 'flex-start',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  backButtonText: { ...theme.typography.label, color: theme.colors.primary },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    gap: theme.spacing.xs,
    paddingHorizontal: theme.spacing.lg,
    paddingVertical: theme.spacing.xl,
  },
  emptyTitle: { ...theme.typography.heading, color: theme.colors.text },
  empty: {
    ...theme.typography.body,
    color: theme.colors.textSecondary,
    textAlign: 'center',
    paddingVertical: theme.spacing.xl,
  },
  pressed: { opacity: 0.8 },
});
export function PressableCard({
  onPress,
  accessibilityLabel,
  children,
  style,
}) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={accessibilityLabel}
      onPress={onPress}
      style={({ pressed }) => [styles.card, pressed && styles.pressed, style]}
    >
      {children}
    </Pressable>
  );
}
