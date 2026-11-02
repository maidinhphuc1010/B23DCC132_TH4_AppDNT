import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Screen } from '../components/Screen';
import {
  Badge,
  Card,
  StatusBadge,
  Header,
  Row,
  Section,
  EmptyState,
} from '../components/ui';
import { useLearning } from '../hooks/useLearning';
import { theme } from '../theme';
export function HomeScreen() {
  const { data } = useLearning();
  const student = data.student;
  const subjects = data.subjects;
  const assignments = data.assignments
    .filter(item => item.status !== 'completed')
    .sort((left, right) => Date.parse(left.dueAt) - Date.parse(right.dueAt));
  const credits = subjects.reduce(
    (total, subject) => total + subject.credits,
    0,
  );
  return (
    <Screen>
      <Header
        eyebrow="GÓC HỌC TẬP CỦA BẠN"
        title="Quản lý học tập"
        subtitle="Sắp xếp việc học, dành thời gian cho những điều quan trọng."
      />

      <View style={styles.banner}>
        <Text accessibilityRole="header" style={styles.bannerTitle}>
          Mỗi ngày một bước tiến
        </Text>
        <Text style={styles.bannerBody}>
          Bắt đầu từ một mục tiêu nhỏ để xây dựng thói quen học tập bền vững.
        </Text>
      </View>

      <Section title="Thông tin sinh viên">
        {student ? (
          <Card>
            <Badge label="Sinh viên" variant="primary" />
            <Text accessibilityRole="header" style={styles.heading}>
              {student.fullName}
            </Text>
            <Row label="Mã sinh viên" value={student.studentCode} />
            <Row label="Email" value={student.email} />
            {student.phone ? (
              <Row label="Điện thoại" value={student.phone} />
            ) : null}
            {student.className ? (
              <Row label="Lớp" value={student.className} />
            ) : null}
            {student.major ? (
              <Row label="Ngành học" value={student.major} />
            ) : null}
          </Card>
        ) : (
          <EmptyState
            title="Chưa có hồ sơ sinh viên"
            message="Thông tin sinh viên sẽ hiển thị tại đây khi được cập nhật."
          />
        )}
      </Section>

      <Section title="Môn học">
        <Card>
          <Badge
            label={`${subjects.length} môn · ${credits} tín chỉ`}
            variant="success"
          />
          {subjects.length === 0 ? (
            <EmptyState message="Chưa có môn học." />
          ) : (
            subjects.map(subject => (
              <View key={subject.id} style={styles.subject}>
                <Text style={styles.heading}>{subject.name}</Text>
                <Text style={styles.body}>
                  {subject.subjectCode} · {subject.credits} tín chỉ
                </Text>
                {subject.teacherName ? (
                  <Text style={styles.body}>
                    Giảng viên: {subject.teacherName}
                  </Text>
                ) : null}
              </View>
            ))
          )}
        </Card>
      </Section>
      <Section title="Bài tập sắp đến hạn">
        {assignments.length === 0 ? (
          <EmptyState message="Không có bài tập nào cần hoàn thành." />
        ) : (
          assignments.map(assignment => {
            const subject = subjects.find(
              item => item.id === assignment.subjectId,
            );
            return (
              <Card key={assignment.id}>
                <Text accessibilityRole="header" style={styles.heading}>
                  {assignment.title}
                </Text>
                {subject ? (
                  <Text style={styles.body}>{subject.name}</Text>
                ) : null}
                <Row
                  label="Hạn nộp"
                  value={new Date(assignment.dueAt).toLocaleString('vi-VN')}
                />
                <StatusBadge status={assignment.status} />
              </Card>
            );
          })
        )}
      </Section>

      <Text style={styles.caption}>
        Học theo nhịp độ của bạn. Tiến bộ từng ngày.
      </Text>
    </Screen>
  );
}
const styles = StyleSheet.create({
  heading: { ...theme.typography.heading, color: theme.colors.text },
  body: { ...theme.typography.body, color: theme.colors.textSecondary },
  banner: {
    backgroundColor: theme.colors.primary,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xl,
    gap: theme.spacing.md,
  },
  bannerTitle: { ...theme.typography.heading, color: theme.colors.onPrimary },
  bannerBody: { ...theme.typography.body, color: theme.colors.onPrimary },
  subject: {
    gap: theme.spacing.xs,
    paddingVertical: theme.spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: theme.colors.border,
  },
  caption: {
    ...theme.typography.caption,
    color: theme.colors.textSecondary,
    textAlign: 'center',
  },
});
