export function validateAssignment(data, now = Date.now()) {
  const errors = {};
  if (!data.title?.trim()) {
    errors.title = 'Vui lòng nhập tiêu đề.';
  }
  if (!data.courseId) {
    errors.courseId = 'Vui lòng chọn môn học.';
  }
  const date = Date.parse(data.dueDate);
  if (!Number.isFinite(date)) {
    errors.dueDate = 'Nhập hạn nộp hợp lệ, ví dụ 2026-12-30T23:59:00+07:00.';
  } else if (date <= now) {
    errors.dueDate = 'Hạn nộp phải ở tương lai.';
  }
  return errors;
}
export function validateProfile(data) {
  const errors = {};
  if (!data.fullName?.trim()) {
    errors.fullName = 'Vui lòng nhập họ tên.';
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email || '')) {
    errors.email = 'Email không hợp lệ.';
  }
  if (data.phone && !/^[+\d\s()-]{8,20}$/.test(data.phone)) {
    errors.phone = 'Số điện thoại không hợp lệ.';
  }
  return errors;
}
