import React from 'react';
import { Text, StyleSheet } from 'react-native';
import ScreenContainer from '../../components/common/ScreenContainer';
import QueryStatus from '../../components/common/QueryStatus';
import EmptyState from '../../components/common/EmptyState';
import ErrorView from '../../components/common/ErrorView';
import CourseCard from '../../components/course/CourseCard';
import AssignmentItem from '../../components/assignment/AssignmentItem';
import InfoRow from '../../components/profile/InfoRow';
import { useAppData } from '../../context/AppDataContext';
import { useSync } from '../../context/SyncContext';
import { useMutation } from '../../hooks/useMutation';
import { ROUTES } from '../../navigation/routes';
import colors from '../../theme/colors';
import spacing from '../../theme/spacing';
import typography from '../../theme/typography';

/** @param {{navigation: object}} props */
export default function HomeScreen({ navigation }) {
  const { student, courses, assignments, saveAssignment, mutationWarning } =
    useAppData();
  const { pendingCount, error, refreshPending } = useSync();
  const mutation = useMutation();
  const now = Date.now();
  const upcoming = (assignments.data || []).filter(
    item =>
      item.status !== 'done' &&
      Date.parse(item.dueDate) >= now &&
      Date.parse(item.dueDate) <= now + 7 * 86400000,
  );
  return (
    <ScreenContainer scroll>
      <Text style={styles.title}>Tổng quan học tập</Text>
      <QueryStatus query={student} />
      <InfoRow label="Họ tên" value={student.data?.fullName} />
      <InfoRow label="Mã sinh viên" value={student.data?.studentCode} />
      <InfoRow label="Thay đổi chưa đồng bộ" value={pendingCount} />
      {error ? (
        <ErrorView message={error.message} onRetry={refreshPending} />
      ) : null}
      {mutationWarning ? (
        <Text style={styles.warning}>{mutationWarning}</Text>
      ) : null}
      <Text style={styles.heading}>Môn đang học</Text>
      <QueryStatus query={courses} />
      {(courses.data || []).map(course => (
        <CourseCard
          key={course.id}
          course={course}
          onPress={() =>
            navigation.navigate(ROUTES.CourseDetail, { id: course.id })
          }
        />
      ))}
      <Text style={styles.heading}>Bài tập đến hạn trong 7 ngày</Text>
      <QueryStatus query={assignments} />
      {mutation.error ? (
        <ErrorView message={mutation.error} onRetry={assignments.refresh} />
      ) : null}
      {upcoming.length ? (
        upcoming.map(assignment => (
          <AssignmentItem
            key={assignment.id}
            assignment={assignment}
            pending={!!assignment.pending}
            onPress={() =>
              navigation.navigate(ROUTES.AssignmentDetail, {
                id: assignment.id,
              })
            }
            onToggleStatus={status =>
              mutation.run(() => saveAssignment({ status }, assignment.id))
            }
          />
        ))
      ) : (
        <EmptyState title="Không có bài tập sắp đến hạn" />
      )}
    </ScreenContainer>
  );
}
const styles = StyleSheet.create({
  title: { ...typography.title, color: colors.text },
  heading: { ...typography.h3, color: colors.text, marginTop: spacing.lg },
  warning: {
    ...typography.body,
    color: colors.warning,
    marginVertical: spacing.sm,
  },
});
