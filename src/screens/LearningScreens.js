import React, { useState } from 'react';
import {
  Text,
  StyleSheet,
  FlatList,
  Pressable,
  View,
  TextInput,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Screen } from '../components/Screen';
import { useLearning } from '../hooks/useLearning';
import { theme } from '../theme';
import {
  Card,
  EmptyState,
  Header,
  PressableCard,
  Row,
  Section,
  SearchBar,
  StatusBadge,
} from '../components/ui';
function ListScreen({ title, rows, onRowPress }) {
  const [query, setQuery] = useState('');
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredRows = rows.filter(row =>
    `${row.title} ${row.detail} ${row.searchText ?? ''}`
      .toLocaleLowerCase()
      .includes(normalizedQuery),
  );
  return (
    <Screen>
      <Header title={title} />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder={`Tìm ${title.toLocaleLowerCase()}…`}
      />
      {filteredRows.length === 0 && (
        <EmptyState
          message={
            rows.length === 0
              ? 'Chưa có dữ liệu.'
              : 'Không tìm thấy kết quả phù hợp.'
          }
        />
      )}
      {filteredRows.map(row =>
        onRowPress ? (
          <PressableCard
            key={row.id}
            accessibilityLabel={`Mở kết quả ${row.title}`}
            onPress={() => onRowPress(row.id)}
          >
            <Text style={styles.title}>{row.title}</Text>
            {row.status}
            <Text style={styles.body}>{row.detail}</Text>
          </PressableCard>
        ) : (
          <Card key={row.id}>
            <Text style={styles.title}>{row.title}</Text>
            {row.status}
            <Text style={styles.body}>{row.detail}</Text>
          </Card>
        ),
      )}
    </Screen>
  );
}
function normalizeSearch(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLocaleLowerCase();
}
export function SubjectsScreen() {
  const { data } = useLearning();
  const [query, setQuery] = useState('');
  const navigation = useNavigation();
  const normalizedQuery = normalizeSearch(query.trim());
  const subjects = data.subjects.filter(subject =>
    normalizeSearch(
      `${subject.name} ${subject.subjectCode} ${subject.credits} ${
        subject.teacherName ?? ''
      } ${subject.description ?? ''}`,
    ).includes(normalizedQuery),
  );
  const openSubject = subject =>
    navigation.navigate('SubjectDetail', { subjectId: subject.id });
  return (
    <Screen>
      <Header title="Môn học" />
      <SearchBar
        value={query}
        onChangeText={setQuery}
        placeholder="Tìm môn học…"
      />
      {subjects.length === 0 ? (
        <EmptyState
          message={
            data.subjects.length === 0
              ? 'Chưa có dữ liệu.'
              : 'Không tìm thấy kết quả phù hợp.'
          }
        />
      ) : null}
      <FlatList
        data={subjects}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <PressableCard
            accessibilityLabel={`Mở môn học ${item.name}`}
            onPress={() => openSubject(item)}
          >
            <Text style={styles.title}>{item.name}</Text>
            <Text style={styles.body}>
              {item.subjectCode} · {item.credits} tín chỉ
            </Text>
          </PressableCard>
        )}
      />
    </Screen>
  );
}
export function SubjectDetailScreen({ route }) {
  const { data } = useLearning();
  const subject = data.subjects.find(
    item => item.id === route.params.subjectId,
  );
  if (!subject) {
    return (
      <Screen>
        <Header title="Không tìm thấy môn học" />
        <EmptyState message="Môn học có thể đã bị xóa." />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title={subject.name} subtitle={subject.subjectCode} />
      <Card>
        <Row label="Mã môn học" value={subject.subjectCode} />
        <Row label="Số tín chỉ" value={String(subject.credits)} />
        <Row
          label="Giảng viên"
          value={subject.teacherName ?? 'Chưa cập nhật'}
        />
        <Section title="Mô tả">
          <Text style={styles.body}>
            {subject.description ?? 'Chưa có mô tả.'}
          </Text>
        </Section>
      </Card>
    </Screen>
  );
}
export function StudySessionDetailScreen({ route }) {
  const { data } = useLearning();
  const session = data.studySessions.find(
    item => item.id === route.params.studySessionId,
  );
  if (!session) {
    return (
      <Screen>
        <Header title="Không tìm thấy buổi học" />
        <EmptyState message="Buổi học có thể đã bị xóa." />
      </Screen>
    );
  }
  const subject = data.subjects.find(item => item.id === session.subjectId);
  return (
    <Screen>
      <Header title="Chi tiết buổi học" />
      <Card>
        <Row label="Môn học" value={subject?.name ?? session.subjectId} />
        <Row label="Ngày học" value={session.date} />
        <Row
          label="Thời gian"
          value={`${session.startTime}–${session.endTime}`}
        />
        <Row label="Phòng học" value={session.room} />
      </Card>
    </Screen>
  );
}
function AssignmentStatusActions({ assignmentId, status, updateStatus }) {
  const actions = [
    { status: 'todo', label: 'Chưa thực hiện' },
    { status: 'in_progress', label: 'Đang thực hiện' },
    { status: 'completed', label: 'Hoàn thành' },
  ];
  return (
    <View style={styles.actions}>
      {actions
        .filter(action => action.status !== status)
        .map(action => (
          <Pressable
            key={action.status}
            accessibilityRole="button"
            accessibilityLabel={`Cập nhật trạng thái: ${action.label}`}
            onPress={() => {
              void updateStatus(assignmentId, action.status);
            }}
            style={styles.action}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </Pressable>
        ))}
    </View>
  );
}
const WEEKDAYS = [
  { label: 'Thứ 2', value: 1 },
  { label: 'Thứ 3', value: 2 },
  { label: 'Thứ 4', value: 3 },
  { label: 'Thứ 5', value: 4 },
  { label: 'Thứ 6', value: 5 },
  { label: 'Thứ 7', value: 6 },
  { label: 'Chủ nhật', value: 0 },
];
export function ScheduleScreen() {
  const { data } = useLearning();
  const navigation = useNavigation();
  const [selectedDay, setSelectedDay] = useState(new Date().getDay());
  const sessions = data.studySessions
    .filter(
      session => new Date(`${session.date}T12:00:00`).getDay() === selectedDay,
    )
    .sort((a, b) => a.startTime.localeCompare(b.startTime));
  return (
    <Screen>
      <Header
        title="Thời khóa biểu"
        subtitle="Chọn thứ để xem lịch học và phòng học"
      />
      <View style={styles.weekdays}>
        {WEEKDAYS.map(day => {
          const selected = day.value === selectedDay;
          return (
            <Pressable
              key={day.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setSelectedDay(day.value)}
              style={[styles.weekday, selected && styles.weekdaySelected]}
            >
              <Text
                style={[
                  styles.weekdayText,
                  selected && styles.weekdayTextSelected,
                ]}
              >
                {day.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {sessions.length === 0 ? (
        <EmptyState
          message={`Không có lịch học vào ${
            WEEKDAYS.find(day => day.value === selectedDay)?.label
          }.`}
        />
      ) : (
        sessions.map(session => (
          <PressableCard
            key={session.id}
            accessibilityLabel={`Mở buổi học ${session.id}`}
            onPress={() =>
              navigation.navigate('StudySessionDetail', {
                studySessionId: session.id,
              })
            }
          >
            <Text style={styles.title}>
              {data.subjects.find(subject => subject.id === session.subjectId)
                ?.name ?? session.subjectId}
            </Text>
            <Row
              label="Thời gian"
              value={`${session.startTime}–${session.endTime}`}
            />
            <Row label="Phòng học" value={session.room} />
            {session.topic ? (
              <Text style={styles.body}>{session.topic}</Text>
            ) : null}
          </PressableCard>
        ))
      )}
    </Screen>
  );
}
const ASSIGNMENT_FILTERS = [
  { label: 'Tất cả', value: 'all' },
  { label: 'Chưa thực hiện', value: 'todo' },
  { label: 'Đang thực hiện', value: 'in_progress' },
  { label: 'Đã hoàn thành', value: 'completed' },
];
export function AssignmentDetailScreen({ route }) {
  const { data, updateAssignmentStatus } = useLearning();
  const assignment = data.assignments.find(
    item => item.id === route.params.assignmentId,
  );
  if (!assignment) {
    return (
      <Screen>
        <Header title="Không tìm thấy bài tập" />
        <EmptyState message="Bài tập có thể đã bị xóa." />
      </Screen>
    );
  }
  return (
    <Screen>
      <Header title={assignment.title} />
      <Card>
        <Section title="Nội dung">
          <Text style={styles.body}>
            {assignment.description ?? 'Chưa có nội dung.'}
          </Text>
        </Section>
        <Row
          label="Hạn nộp"
          value={new Date(assignment.dueAt).toLocaleString('vi-VN')}
        />
        <View>
          <Text style={styles.body}>Trạng thái</Text>
          <StatusBadge status={assignment.status} />
        </View>
        <AssignmentStatusActions
          assignmentId={assignment.id}
          status={assignment.status}
          updateStatus={updateAssignmentStatus}
        />
      </Card>
    </Screen>
  );
}
export function AssignmentsScreen() {
  const { data, updateAssignmentStatus } = useLearning();
  const navigation = useNavigation();
  const [filter, setFilter] = useState('all');
  const assignments = data.assignments.filter(
    item => filter === 'all' || item.status === filter,
  );
  return (
    <Screen>
      <Header title="Bài tập" />
      <View style={styles.filters}>
        {ASSIGNMENT_FILTERS.map(item => {
          const selected = item.value === filter;
          return (
            <Pressable
              key={item.value}
              accessibilityRole="button"
              accessibilityState={{ selected }}
              onPress={() => setFilter(item.value)}
              style={[styles.filter, selected && styles.filterSelected]}
            >
              <Text
                style={[
                  styles.filterText,
                  selected && styles.filterTextSelected,
                ]}
              >
                {item.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {assignments.length === 0 ? (
        <EmptyState
          message={
            data.assignments.length === 0
              ? 'Chưa có bài tập.'
              : 'Không có bài tập ở trạng thái này.'
          }
        />
      ) : null}
      <FlatList
        data={assignments}
        keyExtractor={item => item.id}
        scrollEnabled={false}
        renderItem={({ item }) => (
          <PressableCard
            accessibilityLabel={`Mở bài tập ${item.title}`}
            onPress={() =>
              navigation.navigate('AssignmentDetail', { assignmentId: item.id })
            }
          >
            <Text style={styles.title}>{item.title}</Text>
            <StatusBadge status={item.status} />
            <Text style={styles.body}>
              Hạn nộp: {new Date(item.dueAt).toLocaleString('vi-VN')}
            </Text>
            {item.description ? (
              <Text style={styles.body}>{item.description}</Text>
            ) : null}
            <View style={styles.actions}>
              {item.status !== 'in_progress' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Đánh dấu đang thực hiện: ${item.title}`}
                  onPress={() =>
                    void updateAssignmentStatus(item.id, 'in_progress')
                  }
                  style={styles.action}
                >
                  <Text style={styles.actionText}>Đang thực hiện</Text>
                </Pressable>
              ) : null}
              {item.status !== 'completed' ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Đánh dấu hoàn thành: ${item.title}`}
                  onPress={() =>
                    void updateAssignmentStatus(item.id, 'completed')
                  }
                  style={[styles.action, styles.completeAction]}
                >
                  <Text style={styles.completeActionText}>Hoàn thành</Text>
                </Pressable>
              ) : (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={`Mở lại bài tập: ${item.title}`}
                  onPress={() => void updateAssignmentStatus(item.id, 'todo')}
                  style={styles.action}
                >
                  <Text style={styles.actionText}>Mở lại</Text>
                </Pressable>
              )}
            </View>
          </PressableCard>
        )}
      />
    </Screen>
  );
}
export function AcademicResultDetailScreen({ route }) {
  const { data } = useLearning();
  const result = data.academicResults.find(
    item => item.id === route.params.academicResultId,
  );
  if (!result) {
    return (
      <Screen>
        <Header title="Không tìm thấy kết quả" />
        <EmptyState message="Kết quả học tập có thể đã bị xóa." />
      </Screen>
    );
  }
  const subject = data.subjects.find(item => item.id === result.subjectId);
  const complete = result.components.every(item => item.score !== null);
  const finalScore = complete
    ? result.components.reduce(
        (total, item) => total + ((item.score ?? 0) * item.weight) / 100,
        0,
      )
    : null;
  return (
    <Screen>
      <Header
        title={subject?.name ?? result.subjectId}
        subtitle={`Học kỳ ${result.semester} · ${result.academicYear}`}
      />
      <Section title="Điểm thành phần">
        {result.components.map(component => (
          <Card key={component.id}>
            <Row label="Thành phần" value={component.name} />
            <Row
              label="Điểm"
              value={
                component.score === null
                  ? 'Chưa có điểm'
                  : String(component.score)
              }
            />
            <Row label="Trọng số" value={`${component.weight}%`} />
          </Card>
        ))}
      </Section>
      <Card>
        <Row
          label="Điểm tổng kết"
          value={
            finalScore === null
              ? 'Chưa đủ điểm thành phần'
              : finalScore.toFixed(2)
          }
        />
        {result.notes ? <Text style={styles.body}>{result.notes}</Text> : null}
      </Card>
    </Screen>
  );
}
export function ResultsScreen() {
  const { data } = useLearning();
  const navigation = useNavigation();
  return (
    <ListScreen
      title="Kết quả"
      onRowPress={id =>
        navigation.navigate('AcademicResultDetail', { academicResultId: id })
      }
      rows={data.academicResults.map(item => ({
        id: item.id,
        title:
          data.subjects.find(subject => subject.id === item.subjectId)?.name ??
          item.subjectId,
        detail: `Học kỳ ${item.semester} · ${
          item.academicYear
        }\n${item.components
          .map(
            component =>
              `${component.name}: ${component.score ?? 'Chưa có điểm'} (${
                component.weight
              }%)`,
          )
          .join('\n')}`,
      }))}
    />
  );
}
export function StudentProfileScreen() {
  const { data, updateStudent, isSaving } = useLearning();
  const student = data.student;
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({
    studentCode: '',
    fullName: '',
    email: '',
    phone: '',
    dateOfBirth: '',
    className: '',
    major: '',
  });
  const [error, setError] = useState(null);
  const fields = [
    ['studentCode', 'Mã sinh viên'],
    ['fullName', 'Họ và tên'],
    ['email', 'Email'],
    ['phone', 'Số điện thoại'],
    ['dateOfBirth', 'Ngày sinh (YYYY-MM-DD)'],
    ['className', 'Lớp'],
    ['major', 'Ngành học'],
  ];
  const beginEdit = () => {
    setDraft({
      studentCode: student?.studentCode ?? '',
      fullName: student?.fullName ?? '',
      email: student?.email ?? '',
      phone: student?.phone ?? '',
      dateOfBirth: student?.dateOfBirth ?? '',
      className: student?.className ?? '',
      major: student?.major ?? '',
    });
    setError(null);
    setEditing(true);
  };
  const cancelEdit = () => {
    setEditing(false);
    setError(null);
  };
  const save = async () => {
    if (
      !draft.email.includes('@') ||
      !draft.email.split('@')[1]?.includes('.')
    ) {
      setError('Email không hợp lệ.');
      return;
    }
    if (draft.phone.trim() && !/^[+0-9 ()-]{7,20}$/.test(draft.phone.trim())) {
      setError('Số điện thoại không hợp lệ.');
      return;
    }
    try {
      await updateStudent(draft);
      setEditing(false);
      setError(null);
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Không thể lưu hồ sơ.',
      );
    }
  };
  return (
    <Screen>
      <Header title="Thông tin sinh viên" subtitle="Hồ sơ cá nhân" />
      {editing ? (
        <Card>
          {fields.map(([key, label]) => (
            <View key={key} style={styles.profileField}>
              <Text style={styles.body}>{label}</Text>
              <TextInput
                accessibilityLabel={label}
                value={draft[key]}
                onChangeText={value =>
                  setDraft(current => ({ ...current, [key]: value }))
                }
                style={styles.profileInput}
              />
            </View>
          ))}
          {error ? (
            <Text accessibilityRole="alert" style={styles.profileError}>
              {error}
            </Text>
          ) : null}
          <View style={styles.actions}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Lưu hồ sơ"
              disabled={isSaving}
              onPress={() => void save()}
              style={styles.profileButton}
            >
              <Text style={styles.completeActionText}>
                {isSaving ? 'Đang lưu…' : 'Lưu'}
              </Text>
            </Pressable>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Hủy chỉnh sửa"
              onPress={cancelEdit}
              style={styles.profileButton}
            >
              <Text style={styles.actionText}>Hủy</Text>
            </Pressable>
          </View>
        </Card>
      ) : student ? (
        <Card>
          <Text style={styles.title}>{student.fullName}</Text>
          <Row label="Mã sinh viên" value={student.studentCode} />
          <Row label="Email" value={student.email} />
          {student.phone ? (
            <Row label="Số điện thoại" value={student.phone} />
          ) : null}
          {student.dateOfBirth ? (
            <Row label="Ngày sinh" value={student.dateOfBirth} />
          ) : null}
          {student.className ? (
            <Row label="Lớp" value={student.className} />
          ) : null}
          {student.major ? (
            <Row label="Ngành học" value={student.major} />
          ) : null}
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Chỉnh sửa hồ sơ"
            onPress={beginEdit}
            style={styles.profileButton}
          >
            <Text style={styles.actionText}>Chỉnh sửa hồ sơ</Text>
          </Pressable>
          <Section title="Kết quả học tập">
            {data.academicResults.length === 0 ? (
              <EmptyState message="Chưa có kết quả học tập." />
            ) : (
              data.academicResults.map(result => {
                const subjectName =
                  data.subjects.find(subject => subject.id === result.subjectId)
                    ?.name ?? result.subjectId;
                const graded = result.components.every(
                  component => component.score !== null,
                );
                const total = graded
                  ? result.components
                      .reduce(
                        (sum, component) =>
                          sum +
                          ((component.score ?? 0) * component.weight) / 100,
                        0,
                      )
                      .toFixed(2)
                  : 'Chưa đủ điểm';
                return (
                  <Card key={result.id}>
                    <Text style={styles.title}>{subjectName}</Text>
                    <Row
                      label="Học kỳ"
                      value={`${result.semester} · ${result.academicYear}`}
                    />
                    {result.components.map(component => (
                      <Row
                        key={component.id}
                        label={`${component.name} (${component.weight}%)`}
                        value={
                          component.score === null
                            ? 'Chưa có điểm'
                            : String(component.score)
                        }
                      />
                    ))}
                    <Row label="Điểm tổng kết" value={total} />
                    {result.notes ? (
                      <Text style={styles.body}>{result.notes}</Text>
                    ) : null}
                  </Card>
                );
              })
            )}
          </Section>
        </Card>
      ) : (
        <>
          <EmptyState
            title="Chưa có hồ sơ sinh viên"
            message="Tạo hồ sơ cá nhân để hiển thị thông tin sinh viên."
          />
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Tạo hồ sơ"
            onPress={beginEdit}
            style={styles.profileButton}
          >
            <Text style={styles.actionText}>Tạo hồ sơ</Text>
          </Pressable>
        </>
      )}
    </Screen>
  );
}
const styles = StyleSheet.create({
  filters: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.xs },
  filter: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  filterSelected: {
    backgroundColor: theme.colors.primary,
    borderColor: theme.colors.primary,
  },
  filterText: { ...theme.typography.caption, color: theme.colors.text },
  filterTextSelected: { color: theme.colors.onPrimary },
  actions: { flexDirection: 'row', flexWrap: 'wrap', gap: theme.spacing.sm },
  action: {
    minHeight: theme.layout.minTouchTarget,
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.radius.md,
    borderWidth: 1,
    borderColor: theme.colors.primary,
  },
  completeAction: { backgroundColor: theme.colors.primary },
  actionText: { ...theme.typography.label, color: theme.colors.primary },
  completeActionText: {
    ...theme.typography.label,
    color: theme.colors.onPrimary,
  },
  weekdays: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.xs,
    marginBottom: theme.spacing.md,
  },
  weekday: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.radius.md,
    backgroundColor: theme.colors.surface,
  },
  weekdaySelected: { backgroundColor: theme.colors.primary },
  weekdayText: { ...theme.typography.caption, color: theme.colors.text },
  weekdayTextSelected: { color: theme.colors.onPrimary },
  title: { ...theme.typography.heading, color: theme.colors.text },
  body: { ...theme.typography.body, color: theme.colors.textSecondary },
  profileField: { gap: theme.spacing.xs },
  profileInput: {
    ...theme.typography.body,
    minHeight: theme.layout.minTouchTarget,
    color: theme.colors.text,
    backgroundColor: theme.colors.surface,
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
  },
  profileButton: {
    minHeight: theme.layout.minTouchTarget,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.primary,
    borderRadius: theme.radius.md,
  },
  profileError: { ...theme.typography.body, color: theme.colors.error },
});
