import { sampleSubjects } from '../src/data/subjects';
import { sampleStudySessions } from '../src/data/studySessions';
import { sampleAssignments } from '../src/data/assignments';
import { sampleAcademicResults } from '../src/data/academicResults';
const collections = [
  { name: 'subjects', records: sampleSubjects },
  { name: 'studySessions', records: sampleStudySessions },
  { name: 'assignments', records: sampleAssignments },
  { name: 'academicResults', records: sampleAcademicResults },
];
const references = [
  { name: 'studySessions', records: sampleStudySessions },
  { name: 'assignments', records: sampleAssignments },
  { name: 'academicResults', records: sampleAcademicResults },
];
const subjectIds = new Set(sampleSubjects.map(subject => subject.id));
test.each(collections)(
  '$name IDs are nonempty, trimmed and unique',
  ({ records }) => {
    const invalid = records.filter(
      record => !record.id || record.id !== record.id.trim(),
    );
    expect(invalid).toEqual([]);
    expect(new Set(records.map(record => record.id)).size).toBe(records.length);
  },
);
test.each(references)('$name references existing subjects', ({ records }) => {
  const danglingReferences = records
    .filter(record => !subjectIds.has(record.subjectId))
    .map(record => ({ id: record.id, subjectId: record.subjectId }));
  expect(danglingReferences).toEqual([]);
});
test('subject codes are unique and distinct from internal IDs', () => {
  const codes = sampleSubjects.map(subject => subject.subjectCode);
  expect(new Set(codes).size).toBe(codes.length);
  expect(codes.filter(code => !code.trim() || code !== code.trim())).toEqual(
    [],
  );
  expect(codes.filter(code => subjectIds.has(code))).toEqual([]);
});
test('academic results are unique per subject, year and semester', () => {
  const keys = sampleAcademicResults.map(result =>
    JSON.stringify([result.subjectId, result.academicYear, result.semester]),
  );
  expect(new Set(keys).size).toBe(keys.length);
});
test.each(sampleAcademicResults)(
  '$id component IDs are unique within their result',
  result => {
    const ids = result.components.map(component => component.id);
    expect(ids.filter(id => !id.trim() || id !== id.trim())).toEqual([]);
    expect(new Set(ids).size).toBe(ids.length);
  },
);
// Fixture coverage only: a real subject need not have sessions, assignments or grades yet.
test.each(references)(
  '$name demo data covers every sample subject',
  ({ records }) => {
    expect(new Set(records.map(record => record.subjectId))).toEqual(
      subjectIds,
    );
  },
);
