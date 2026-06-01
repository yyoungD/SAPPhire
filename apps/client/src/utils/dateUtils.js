export function formatDate(value) {
  if (!value) return '';
  return new Intl.DateTimeFormat('ko-KR').format(new Date(value));
}
