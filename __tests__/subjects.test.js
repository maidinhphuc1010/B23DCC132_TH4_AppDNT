import { sampleSubjects } from '../src/data/subjects';
test('provides sample subjects with unique identifiers and codes', () => {
  expect(sampleSubjects.length).toBeGreaterThan(0);
  expect(new Set(sampleSubjects.map(subject => subject.id)).size).toBe(
    sampleSubjects.length,
  );
  expect(new Set(sampleSubjects.map(subject => subject.subjectCode)).size).toBe(
    sampleSubjects.length,
  );
});
test.each(sampleSubjects)(
  '$subjectCode has valid subject metadata',
  subject => {
    expect(subject.id.trim()).not.toBe('');
    expect(subject.subjectCode.trim()).not.toBe('');
    expect(subject.name.trim()).not.toBe('');
    expect(Number.isInteger(subject.credits)).toBe(true);
    expect(subject.credits).toBeGreaterThan(0);
    if (subject.teacherName !== undefined) {
      expect(subject.teacherName.trim()).not.toBe('');
    }
  },
);
test('sample subjects can round-trip through JSON', () => {
  expect(JSON.parse(JSON.stringify(sampleSubjects))).toEqual(sampleSubjects);
});
