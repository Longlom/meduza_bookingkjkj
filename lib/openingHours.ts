import { minutesSinceMidnight, minutesToHHMM } from "@/lib/time";

export type OpeningHoursConfig = {
  openFrom: string; // HH:MM
  openTo: string; // HH:MM (may be next day)
};

export function getOpeningHoursFromEnv(): OpeningHoursConfig {
  return {
    openFrom: process.env.OPEN_FROM || "12:00",
    openTo: process.env.OPEN_TO || "03:00"
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

export function openingHoursHint(cfg: OpeningHoursConfig) {
  return `${cfg.openFrom}–${cfg.openTo}`;
}

/** All 30-min slots within opening hours only (e.g. 12:00…23:30, then 00:00…03:00). */
export function buildOpeningTimeSlots(
  cfg: OpeningHoursConfig,
  stepMinutes = 30
): string[] {
  const from = minutesSinceMidnight(cfg.openFrom);
  const to = minutesSinceMidnight(cfg.openTo);
  const slots: string[] = [];

  if (from <= to) {
    for (let m = from; m <= to; m += stepMinutes) {
      slots.push(minutesToHHMM(m));
    }
    return slots;
  }

  for (let m = from; m < 24 * 60; m += stepMinutes) {
    slots.push(minutesToHHMM(m));
  }
  for (let m = 0; m <= to; m += stepMinutes) {
    slots.push(minutesToHHMM(m));
  }
  return slots;
}

