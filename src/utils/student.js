const requiredFields = ['studentCode', 'fullName', 'email'];
const optionalFields = [
  'phone',
  'dateOfBirth',
  'className',
  'major',
  'avatarUrl',
];
/** Merge a partial profile update without mutating the original or changing its ID. */
export function mergeStudent(current, changes) {
  if (!changes || typeof changes !== 'object' || Array.isArray(changes)) {
    throw new Error('Thông tin sinh viên không hợp lệ.');
  }
  const next = current
    ? { ...current }
    : {
        id: 'student-local',
        studentCode: '',
        fullName: '',
        email: '',
      };
  for (const key of [...requiredFields, ...optionalFields]) {
    const value = changes[key];
    if (value === undefined) {
      continue;
    }
    if (typeof value !== 'string') {
      throw new Error(`Trường ${key} phải là chuỗi.`);
    }
    next[key] = value.trim();
  }
  for (const key of requiredFields) {
    if (!next[key]) {
      throw new Error(`Vui lòng nhập ${key}.`);
    }
  }
  for (const key of optionalFields) {
    if (next[key] === '') {
      delete next[key];
    }
  }
  return next;
}
