export function todayISO() {
  return new Date().toISOString().slice(0, 10);
}

export function formatDateIT(isoDate) {
  if (!isoDate) return "-";
  const d = new Date(isoDate);
  return d.toLocaleDateString("it-IT", { day: "2-digit", month: "short", year: "numeric" });
}

export function isSameMonth(isoDate, refDate = new Date()) {
  const d = new Date(isoDate);
  return d.getFullYear() === refDate.getFullYear() && d.getMonth() === refDate.getMonth();
}

export function monthKey(isoDate) {
  const d = new Date(isoDate);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
}

export function monthLabel(key) {
  const [year, month] = key.split("-");
  const d = new Date(Number(year), Number(month) - 1, 1);
  return d.toLocaleDateString("it-IT", { month: "short" }).replace(".", "");
}

export function lastNMonthKeys(n) {
  const keys = [];
  const now = new Date();
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`);
  }
  return keys;
}
