import { sampleSubjects } from '../data/subjects';
import { sampleStudySessions } from '../data/studySessions';
import { sampleAssignments } from '../data/assignments';
import { sampleAcademicResults } from '../data/academicResults';
export function createLearningData() {
  return JSON.parse(
    JSON.stringify({
      student: null,
      subjects: sampleSubjects,
      studySessions: sampleStudySessions,
      assignments: sampleAssignments,
      academicResults: sampleAcademicResults,
    }),
  );
}
function record(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error('Dữ liệu học tập không hợp lệ.');
  }
}
function text(value) {
  if (typeof value !== 'string' || !value.trim() || value !== value.trim()) {
    throw new Error('Trường văn bản hoặc ID không hợp lệ.');
  }
}
function optional(value, keys) {
  for (const key of keys) {
    if (value[key] !== undefined && typeof value[key] !== 'string') {
      throw new Error(`Trường ${key} phải là chuỗi.`);
    }
  }
}
function rows(value) {
  if (!Array.isArray(value)) {
    throw new Error('Danh sách không hợp lệ.');
  }
  const ids = new Set();
  for (const item of value) {
    record(item);
    text(item.id);
    if (ids.has(item.id)) {
      throw new Error(`ID trùng: ${item.id}`);
    }
    ids.add(item.id);
  }
  return value;
}
function date(value) {
  text(value);
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(value) ||
    !Number.isFinite(Date.parse(value)) ||
    new Date(value).toISOString().slice(0, 10) !== value
  ) {
    throw new Error('Ngày không hợp lệ.');
  }
}
export function validateLearningData(value) {
  record(value);
  if (value.student !== null) {
    record(value.student);
    for (const key of ['id', 'studentCode', 'fullName', 'email']) {
      text(value.student[key]);
    }
    optional(value.student, [
      'phone',
      'dateOfBirth',
      'className',
      'major',
      'avatarUrl',
    ]);
    if (
      typeof value.student.email !== 'string' ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.student.email)
    ) {
      throw new Error('Email không hợp lệ.');
    }
    if (value.student.dateOfBirth !== undefined) {
      date(value.student.dateOfBirth);
      if (
        String(value.student.dateOfBirth) >
        new Date().toISOString().slice(0, 10)
      ) {
        throw new Error('Ngày sinh không được ở tương lai.');
      }
    }
  }
  const subjects = rows(value.subjects);
  const codes = new Set();
  for (const subject of subjects) {
    text(subject.name);
    text(subject.subjectCode);
    if (codes.has(subject.subjectCode)) {
      throw new Error('Mã môn học trùng.');
    }
    codes.add(subject.subjectCode);
    if (
      typeof subject.credits !== 'number' ||
      !Number.isInteger(subject.credits) ||
      subject.credits <= 0
    ) {
      throw new Error('Số tín chỉ không hợp lệ.');
    }
    optional(subject, ['teacherName', 'description']);
  }
  const ids = new Set(subjects.map(subject => subject.id));
  const sessions = rows(value.studySessions);
  const assignments = rows(value.assignments);
  const results = rows(value.academicResults);
  for (const item of [...sessions, ...assignments, ...results]) {
    if (!ids.has(item.subjectId)) {
      throw new Error(`Môn học không tồn tại: ${String(item.subjectId)}`);
    }
  }
  for (const session of sessions) {
    date(session.date);
    text(session.room);
    text(session.startTime);
    text(session.endTime);
    if (
      ![session.startTime, session.endTime].every(time =>
        /^([01]\d|2[0-3]):[0-5]\d$/.test(time),
      ) ||
      session.startTime >= session.endTime
    ) {
      throw new Error('Giờ học không hợp lệ.');
    }
    optional(session, ['topic', 'notes']);
  }
  for (const assignment of assignments) {
    text(assignment.title);
    text(assignment.dueAt);
    if (
      !/T.*(Z|[+-]\d{2}:\d{2})$/.test(assignment.dueAt) ||
      !Number.isFinite(Date.parse(assignment.dueAt))
    ) {
      throw new Error('Hạn nộp không hợp lệ.');
    }
    if (
      !['todo', 'in_progress', 'completed'].includes(String(assignment.status))
    ) {
      throw new Error('Trạng thái không hợp lệ.');
    }
    optional(assignment, ['description']);
  }
  const terms = new Set();
  for (const result of results) {
    text(result.academicYear);
    const [start, end] = result.academicYear.split('-').map(Number);
    if (
      !/^\d{4}-\d{4}$/.test(result.academicYear) ||
      end !== start + 1 ||
      ![1, 2, 3].includes(Number(result.semester)) ||
      typeof result.semester !== 'number'
    ) {
      throw new Error('Học kỳ không hợp lệ.');
    }
    const term = JSON.stringify([
      result.subjectId,
      result.academicYear,
      result.semester,
    ]);
    if (terms.has(term)) {
      throw new Error('Kết quả học tập trùng.');
    }
    terms.add(term);
    const components = rows(result.components);
    let total = 0;
    for (const component of components) {
      text(component.name);
      if (
        typeof component.weight !== 'number' ||
        !Number.isFinite(component.weight) ||
        component.weight <= 0 ||
        component.weight > 100
      ) {
        throw new Error('Trọng số không hợp lệ.');
      }
      total += component.weight;
      if (
        component.score !== null &&
        (typeof component.score !== 'number' ||
          !Number.isFinite(component.score) ||
          component.score < 0 ||
          component.score > 10)
      ) {
        throw new Error('Điểm không hợp lệ.');
      }
    }
    if (Math.abs(total - 100) > 0.000001) {
      throw new Error('Tổng trọng số phải bằng 100%.');
    }
    optional(result, ['notes']);
  }
}
