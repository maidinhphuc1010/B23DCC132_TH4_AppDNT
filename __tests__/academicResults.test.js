import { sampleAcademicResults } from '../src/data/academicResults';
import { sampleSubjects } from '../src/data/subjects';
const subjectIds = new Set(sampleSubjects.map(subject => subject.id));
test('provides unique results and subject-term combinations', () => {
  expect(sampleAcademicResults.length).toBeGreaterThan(0);
  expect(new Set(sampleAcademicResults.map(result => result.id)).size).toBe(
    sampleAcademicResults.length,
  );
  const terms = sampleAcademicResults.map(
    result => `${result.subjectId}:${result.academicYear}:${result.semester}`,
  );
  expect(new Set(terms).size).toBe(terms.length);
});
test.each(sampleAcademicResults)('$id has valid grades and weights', result => {
  expect(result.id.trim()).not.toBe('');
  expect(subjectIds.has(result.subjectId)).toBe(true);
  expect(result.academicYear).toMatch(/^\d{4}-\d{4}$/);
  const [start, end] = result.academicYear.split('-').map(Number);
  expect(end).toBe(start + 1);
  expect([1, 2, 3]).toContain(result.semester);
  expect(result.components.length).toBeGreaterThan(0);
  expect(new Set(result.components.map(component => component.id)).size).toBe(
    result.components.length,
  );
  expect(
    result.components.reduce((total, component) => total + component.weight, 0),
  ).toBeCloseTo(100);
  for (const component of result.components) {
    expect(component.id.trim()).not.toBe('');
    expect(component.name.trim()).not.toBe('');
    expect(Number.isFinite(component.weight)).toBe(true);
    expect(component.weight).toBeGreaterThan(0);
    expect(component.weight).toBeLessThanOrEqual(100);
    if (component.score !== null) {
      expect(Number.isFinite(component.score)).toBe(true);
      expect(component.score).toBeGreaterThanOrEqual(0);
      expect(component.score).toBeLessThanOrEqual(10);
    }
  }
});
test('includes complete, partial and ungraded results, plus a real zero score', () => {
  expect(
    sampleAcademicResults.some(r => r.components.every(c => c.score !== null)),
  ).toBe(true);
  expect(
    sampleAcademicResults.some(r => r.components.every(c => c.score === null)),
  ).toBe(true);
  expect(
    sampleAcademicResults.some(
      r =>
        r.components.some(c => c.score === null) &&
        r.components.some(c => c.score !== null),
    ),
  ).toBe(true);
  expect(
    sampleAcademicResults.some(r => r.components.some(c => c.score === 0)),
  ).toBe(true);
});
test('sample results can round-trip through JSON', () => {
  expect(JSON.parse(JSON.stringify(sampleAcademicResults))).toEqual(
    sampleAcademicResults,
  );
});
