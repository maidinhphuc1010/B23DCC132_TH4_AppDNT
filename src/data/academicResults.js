/** Fictional results for the current profile; no automatic storage writes. */
export const sampleAcademicResults = [
  {
    id: 'result-001',
    subjectId: 'subject-001',
    academicYear: '2026-2027',
    semester: 1,
    components: [
      { id: 'attendance', name: 'Chuyên cần', weight: 10, score: 9 },
      { id: 'midterm', name: 'Giữa kỳ', weight: 30, score: 8 },
      { id: 'final', name: 'Cuối kỳ', weight: 60, score: 8.5 },
    ],
  },
  {
    id: 'result-002',
    subjectId: 'subject-002',
    academicYear: '2026-2027',
    semester: 1,
    components: [
      { id: 'practice', name: 'Thực hành', weight: 20, score: 7.5 },
      { id: 'midterm', name: 'Giữa kỳ', weight: 30, score: 7 },
      { id: 'final', name: 'Cuối kỳ', weight: 50, score: null },
    ],
    notes: 'Chưa có điểm thi cuối kỳ.',
  },
  {
    id: 'result-003',
    subjectId: 'subject-003',
    academicYear: '2026-2027',
    semester: 1,
    components: [
      { id: 'practice', name: 'Thực hành', weight: 30, score: 8 },
      { id: 'midterm', name: 'Giữa kỳ', weight: 20, score: 7.5 },
      { id: 'final', name: 'Cuối kỳ', weight: 50, score: 8 },
    ],
  },
  {
    id: 'result-004',
    subjectId: 'subject-004',
    academicYear: '2026-2027',
    semester: 1,
    components: [
      { id: 'practice', name: 'Thực hành', weight: 20, score: 9 },
      { id: 'project', name: 'Đồ án', weight: 50, score: null },
      { id: 'presentation', name: 'Thuyết trình', weight: 30, score: null },
    ],
  },
  {
    id: 'result-005',
    subjectId: 'subject-005',
    academicYear: '2026-2027',
    semester: 1,
    components: [
      { id: 'attendance', name: 'Chuyên cần', weight: 10, score: 0 },
      { id: 'midterm', name: 'Giữa kỳ', weight: 30, score: 5 },
      { id: 'final', name: 'Cuối kỳ', weight: 60, score: 6 },
    ],
    notes: 'Điểm chuyên cần bằng 0 đã được ghi nhận, không phải chưa nhập.',
  },
  {
    id: 'result-006',
    subjectId: 'subject-006',
    academicYear: '2026-2027',
    semester: 1,
    components: [
      {
        id: 'participation',
        name: 'Tham gia trên lớp',
        weight: 20,
        score: null,
      },
      { id: 'midterm', name: 'Giữa kỳ', weight: 30, score: null },
      { id: 'final', name: 'Cuối kỳ', weight: 50, score: null },
    ],
  },
];
