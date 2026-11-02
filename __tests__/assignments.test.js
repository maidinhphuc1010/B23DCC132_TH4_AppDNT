import { sampleAssignments } from '../src/data/assignments';
import { sampleSubjects } from '../src/data/subjects';
const subjectIds = new Set(sampleSubjects.map(subject => subject.id));
const statuses = ['todo', 'in_progress', 'completed'];
test('provides sample assignments with unique identifiers', () => {
  expect(sampleAssignments.length).toBeGreaterThan(0);
  expect(new Set(sampleAssignments.map(assignment => assignment.id)).size).toBe(
    sampleAssignments.length,
  );
});
test.each(sampleAssignments)(
  '$id has valid assignment metadata',
  assignment => {
    expect(assignment.id.trim()).not.toBe('');
    expect(subjectIds.has(assignment.subjectId)).toBe(true);
    expect(assignment.title.trim()).not.toBe('');
    expect(statuses).toContain(assignment.status);
    if (assignment.description !== undefined) {
      expect(assignment.description.trim()).not.toBe('');
    }
    // Demo deadlines consistently use Vietnam time with an explicit UTC offset.
    expect(assignment.dueAt).toMatch(
      /^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d:[0-5]\d\+07:00$/,
    );
    const deadline = new Date(assignment.dueAt);
    expect(Number.isNaN(deadline.getTime())).toBe(false);
    const localDateTime = new Date(deadline.getTime() + 7 * 60 * 60 * 1000);
    expect(localDateTime.toISOString().slice(0, 19)).toBe(
      assignment.dueAt.slice(0, 19),
    );
  },
);
test('samples cover all progress statuses', () => {
  expect(
    new Set(sampleAssignments.map(assignment => assignment.status)),
  ).toEqual(new Set(statuses));
});
test('sample assignments can round-trip through JSON', () => {
  expect(JSON.parse(JSON.stringify(sampleAssignments))).toEqual(
    sampleAssignments,
  );
});
