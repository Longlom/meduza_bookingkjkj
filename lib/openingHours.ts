import { minutesSinceMidnight, minutesToHHMM } from "@/lib/time";

export type OpeningHoursConfig = {
  openFrom: string; // HH:MM
  openTo: string; // HH:MM (may be next day)
  /** Latest time customers can book (default 23:30). */
  lastBookable: string;
};

export function getOpeningHoursFromEnv(): OpeningHoursConfig {
  return {
    openFrom: process.env.OPEN_FROM || "12:00",
    openTo: process.env.OPEN_TO || "03:00",
    lastBookable: process.env.BOOKING_LAST_TIME || "23:30"
  };
}

export function isTimeWithinOpeningHours(
  timeHHMM: string,
  cfg: OpeningHoursConfig
) {
  const t = minutesSinceMidnight(timeHHMM);
  const from = minutesSinceMidnight(cfg.openFrom);
  const to = minutesSinceMidnight(cfg.openTo);

  // Same-day window (e.g. 10:00–22:00)
  if (from < to) return t >= from && t <= to;

  // Cross-midnight window (e.g. 12:00–03:00): valid if >= from OR <= to
  if (from > to) return t >= from || t <= to;

  // from == to means "open 24 hours" (treat as always valid)
  return true;
}

/** Whether this time can be chosen on the booking form. */
export function isTimeBookable(timeHHMM: string, cfg: OpeningHoursConfig) {
  if (!isTimeWithinOpeningHours(timeHHMM, cfg)) return false;

  const t = minutesSinceMidnight(timeHHMM);
  const last = minutesSinceMidnight(cfg.lastBookable);
  const from = minutesSinceMidnight(cfg.openFrom);
  const to = minutesSinceMidnight(cfg.openTo);

  if (from > to) {
    return t >= from && t <= last;
  }

  return t >= from && t <= Math.min(to, last);
}

export function openingHoursHint(cfg: OpeningHoursConfig) {
  return `${cfg.openFrom}–${cfg.openTo}`;
}

/** Bookable 30-min slots (capped at lastBookable, e.g. 23:30). */
export function buildOpeningTimeSlots(
  cfg: OpeningHoursConfig,
  stepMinutes = 30
): string[] {
  const from = minutesSinceMidnight(cfg.openFrom);
  const to = minutesSinceMidnight(cfg.openTo);
  const last = minutesSinceMidnight(cfg.lastBookable);
  const slots: string[] = [];

  if (from <= to) {
    for (let m = from; m <= Math.min(to, last); m += stepMinutes) {
      slots.push(minutesToHHMM(m));
    }
    return slots;
  }

  for (let m = from; m <= last && m < 24 * 60; m += stepMinutes) {
    slots.push(minutesToHHMM(m));
  }
  return slots;
}

