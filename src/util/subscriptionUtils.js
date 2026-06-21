function clampedDate(year, month, day) {
  const lastDay = new Date(year, month + 1, 0).getDate();
  return new Date(year, month, Math.min(day, lastDay));
}

export function nextExpiryDate(day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const candidate = clampedDate(today.getFullYear(), today.getMonth(), day);
  if (candidate < today) {
    const nm = today.getMonth() + 1;
    return clampedDate(nm > 11 ? today.getFullYear() + 1 : today.getFullYear(), nm % 12, day);
  }
  return candidate;
}

export function nextExpiryDateAfter(day, afterDate) {
  const after = new Date(afterDate);
  after.setHours(0, 0, 0, 0);
  const sameMonth = clampedDate(after.getFullYear(), after.getMonth(), day);
  if (sameMonth > after) return sameMonth;
  const nm = after.getMonth() + 1;
  return clampedDate(nm > 11 ? after.getFullYear() + 1 : after.getFullYear(), nm % 12, day);
}

export function daysUntil(day) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Math.round((nextExpiryDate(day) - today) / 86400000);
}
