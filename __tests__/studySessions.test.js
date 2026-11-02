import { sampleStudySessions } from '../src/data/studySessions';
import { sampleSubjects } from '../src/data/subjects';
const subjectIds = new Set(sampleSubjects.map(subject => subject.id));
test('provides sample sessions with unique identifiers', () => {
  expect(sampleStudySessions.length).toBeGreaterThan(0);
  expect(new Set(sampleStudySessions.map(session => session.id)).size).toBe(
    sampleStudySessions.length,
  );
});
test.each(sampleStudySessions)(
  '$id has valid metadata and time range',
  session => {
    expect(session.id.trim()).not.toBe('');
    expect(subjectIds.has(session.subjectId)).toBe(true);
    expect(session.room.trim()).not.toBe('');
    expect(session.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    const date = new Date(`${session.date}T00:00:00.000Z`);
    expect(Number.isNaN(date.getTime())).toBe(false);
    expect(date.toISOString().slice(0, 10)).toBe(session.date);
    expect(session.startTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect(session.endTime).toMatch(/^([01]\d|2[0-3]):[0-5]\d$/);
    expect(session.startTime < session.endTime).toBe(true);
  },
);
test('sample timetable has no overlapping classes', () => {
  for (let index = 0; index < sampleStudySessions.length; index++) {
    const session = sampleStudySessions[index];
    for (const other of sampleStudySessions.slice(index + 1)) {
      if (session.date === other.date) {
        expect(
          session.endTime <= other.startTime ||
            other.endTime <= session.startTime,
        ).toBe(true);
      }
    }
  }
});
test('sample sessions can round-trip through JSON', () => {
  expect(JSON.parse(JSON.stringify(sampleStudySessions))).toEqual(
    sampleStudySessions,
  );
});
