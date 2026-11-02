const pad = value => String(value).padStart(2, '0');
export function formatDate(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : `${pad(date.getDate())}/${pad(
        date.getMonth() + 1,
      )}/${date.getFullYear()}`;
}
export function formatTime(value) {
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ''
    : `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}
export function formatDateTime(value) {
  return value ? `${formatTime(value)}, ${formatDate(value)}` : '';
}
export function currentDay() {
  const day = new Date().getDay();
  return day === 0 ? 8 : day + 1;
}
export function isOverdue(assignment, now = Date.now()) {
  const due = Date.parse(assignment?.dueDate);
  return assignment?.status !== 'done' && Number.isFinite(due) && due < now;
}
export function daysLeft(value, now = Date.now()) {
  const timestamp = Date.parse(value);
  if (!Number.isFinite(timestamp)) return null;
  const startToday = new Date(now);
  startToday.setHours(0, 0, 0, 0);
  const target = new Date(timestamp);
  target.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - startToday.getTime()) / 86400000);
}
