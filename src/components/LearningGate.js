import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { theme } from '../theme';
import { useLearning } from '../hooks/useLearning';
import { Screen } from './Screen';
import { ErrorState, LoadingState } from './ui';
/** Do not expose editing screens until persisted data has been validated. */
export function LearningGate({ children }) {
  const { isLoading, isReady, isSaving, error, reload } = useLearning();
  if (isLoading) {
    return (
      <Screen>
        <LoadingState message="Đang khôi phục dữ liệu học tập…" />
      </Screen>
    );
  }
  if (!isReady) {
    return (
      <Screen>
        <ErrorState
          title="Không thể khôi phục dữ liệu"
          message={`${
            error ?? 'Dữ liệu chưa sẵn sàng.'
          } Dữ liệu lưu trữ chưa bị ghi đè. Hãy thử tải lại. Nếu lỗi vẫn tiếp diễn, không xóa dữ liệu ứng dụng để tránh mất thông tin.`}
          retryLabel="Thử tải lại"
          onRetry={() => {
            reload().catch(() => undefined);
          }}
        />
      </Screen>
    );
  }
  return (
    <View style={styles.container}>
      {isSaving && (
        <Text accessibilityLiveRegion="polite" style={styles.notice}>
          Đang lưu thay đổi…
        </Text>
      )}
      {error && (
        <Text
          accessibilityRole="alert"
          accessibilityLiveRegion="polite"
          style={styles.errorNotice}
        >
          Không thể cập nhật dữ liệu: {error} Dữ liệu trước đó được giữ nguyên.
          Vui lòng thử lại thao tác vừa thực hiện.
        </Text>
      )}
      {children}
    </View>
  );
}
const styles = StyleSheet.create({
  container: { flex: 1 },
  notice: {
    ...theme.typography.label,
    color: theme.colors.primary,
    padding: theme.spacing.lg,
  },
  errorNotice: {
    ...theme.typography.body,
    color: theme.colors.error,
    backgroundColor: theme.colors.errorSoft,
    padding: theme.spacing.lg,
  },
});
