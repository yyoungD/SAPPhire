export function isEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export function required(value) {
  return value !== undefined && value !== null && String(value).trim() !== '';
}
