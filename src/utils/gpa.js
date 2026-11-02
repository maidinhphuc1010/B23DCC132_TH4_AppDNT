export function toScale4(score10) {
  if (!Number.isFinite(score10) || score10 < 0 || score10 > 10) {
    return 0;
  }
  for (const [minimum, point] of [
    [8.5, 4],
    [8, 3.5],
    [7, 3],
    [6.5, 2.5],
    [5.5, 2],
    [5, 1.5],
    [4, 1],
  ]) {
    if (score10 >= minimum) {
      return point;
    }
  }
  return 0;
}
export function calcGpa(grades = [], courses = []) {
  let weighted = 0;
  let attemptedCredits = 0;
  let totalCredits = 0;
  for (const grade of grades) {
    const course =
      grade.course ||
      courses.find(item => String(item.id) === String(grade.courseId));
    const credits = Number(course?.credits);
    if (!(credits > 0) || !Number.isFinite(grade.total)) {
      continue;
    }
    const points = toScale4(grade.total);
    weighted += points * credits;
    attemptedCredits += credits;
    if (points > 0) {
      totalCredits += credits;
    }
  }
  return {
    gpa: attemptedCredits ? weighted / attemptedCredits : 0,
    totalCredits,
  };
}
