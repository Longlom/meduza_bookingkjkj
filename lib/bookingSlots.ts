import {
  isTimeWithinOpeningHours,
  type OpeningHoursConfig
} from "@/lib/openingHours";
import { addDaysToIsoDate, DEFAULT_TZ, minutesSinceMidnight } from "@/lib/time";

/** Minimum time before booking: now + 1.5 hours */
export const MIN_BOOKING_ADVANCE_MS = 90 * 60 * 1000;
const SLOT_STEP_MINUTES = 30;

const TZ_UTC_OFFSET_HOURS: Record<string, number> = {
  "Asia/Ho_Chi_Minh": 7
};

function utcOffsetHours(timeZone: string): number {
  return TZ_UTC_OFFSET_HOURS[timeZone] ?? 7;
}

/** Wall-clock date + time in booking timezone → UTC ms */
export function bookingInstantUtcMs(
  date: string,
  timeHHMM: string,
  timeZone = DEFAULT_TZ
): number {
  const off = utcOffsetHours(timeZone);
  const [y, mo, d] = date.split("-").map(Number);
  const [h, mi] = timeHHMM.split(":").map(Number);
  return Date.UTC(y, mo - 1, d, h - off, mi);
}

/**
 * Map service date + time to real calendar instant.
 * For cross-midnight hours (12:00–03:00), times after midnight (≤ openTo)
 * belong to the next calendar day but same service night.
 */
export function resolveBookingInstantUtcMs(
  serviceDate: string,
  timeHHMM: string,
  cfg: OpeningHoursConfig,
  timeZone = DEFAULT_TZ
): number {
  const fromMin = minutesSinceMidnight(cfg.openFrom);
  const toMin = minutesSinceMidnight(cfg.openTo);
  const slotMin = minutesSinceMidnight(timeHHMM);

  let calendarDate = serviceDate;
  if (fromMin > toMin && slotMin <= toMin) {
    calendarDate = addDaysToIsoDate(serviceDate, 1);
  }

  return bookingInstantUtcMs(calendarDate, timeHHMM, timeZone);
}

export function getResolvedCalendarDate(
  serviceDate: string,
  timeHHMM: string,
  cfg: OpeningHoursConfig
): string {
  const fromMin = minutesSinceMidnight(cfg.openFrom);
  const toMin = minutesSinceMidnight(cfg.openTo);
  const slotMin = minutesSinceMidnight(timeHHMM);

  if (fromMin > toMin && slotMin <= toMin) {
    return addDaysToIsoDate(serviceDate, 1);
  }
  return serviceDate;
}

export function toISODateInTz(ms: number, timeZone = DEFAULT_TZ): string {
  const formatter = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit"
  });
  const parts = formatter.formatToParts(new Date(ms));
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "00";
  return `${get("year")}-${get("month")}-${get("day")}`;
}

function roundUpToSlotMs(ms: number, stepMinutes = SLOT_STEP_MINUTES): number {
  const step = stepMinutes * 60 * 1000;
  return Math.ceil(ms / step) * step;
}

export function minBookableSlotUtcMs(
  advanceMs = MIN_BOOKING_ADVANCE_MS,
  stepMinutes = SLOT_STEP_MINUTES
): number {
  return roundUpToSlotMs(Date.now() + advanceMs, stepMinutes);
}

export function isSlotBookable(
  serviceDate: string,
  timeHHMM: string,
  cfg: OpeningHoursConfig,
  timeZone = DEFAULT_TZ,
  advanceMs = MIN_BOOKING_ADVANCE_MS
): boolean {
  if (!isTimeWithinOpeningHours(timeHHMM, cfg)) return false;
  const slotMs = resolveBookingInstantUtcMs(
    serviceDate,
    timeHHMM,
    cfg,
    timeZone
  );
  return slotMs >= minBookableSlotUtcMs(advanceMs);
}

export function filterBookableSlots(
  serviceDate: string,
  slots: string[],
  cfg: OpeningHoursConfig,
  timeZone = DEFAULT_TZ
): string[] {
  return slots.filter((t) => isSlotBookable(serviceDate, t, cfg, timeZone));
}
