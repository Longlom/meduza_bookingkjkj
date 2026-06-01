export const DEFAULT_TZ = process.env.BOOKING_TZ || "Asia/Ho_Chi_Minh";

export function pad2(n: number) {
  return String(n).padStart(2, "0");
}

export function toISODateLocal(d: Date) {
  // Uses local machine time to generate yyyy-mm-dd for initial UI convenience.
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`;
}

export function parseHHMM(hhmm: string): { hour: number; minute: number } {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm);
  if (!m) throw new Error("Invalid HH:MM");
  const hour = Number(m[1]);
  const minute = Number(m[2]);
  if (hour < 0 || hour > 23 || minute < 0 || minute > 59) {
    throw new Error("Invalid HH:MM");
  }
  return { hour, minute };
}

export function minutesSinceMidnight(hhmm: string) {
  const { hour, minute } = parseHHMM(hhmm);
  return hour * 60 + minute;
}

export function minutesToHHMM(totalMinutes: number) {
  const h = Math.floor(totalMinutes / 60);
  const mi = totalMinutes % 60;
  return `${pad2(h)}:${pad2(mi)}`;
}

export function addDaysToIsoDate(isoDate: string, days: number) {
  const [y, mo, d] = isoDate.split("-").map(Number);
  const dt = new Date(Date.UTC(y, mo - 1, d + days));
  return `${dt.getUTCFullYear()}-${pad2(dt.getUTCMonth() + 1)}-${pad2(dt.getUTCDate())}`;
}

