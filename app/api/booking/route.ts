import { BookingSchema } from "@/lib/validation";
import {
  getOpeningHoursFromEnv,
  isTimeBookable,
  openingHoursHint
} from "@/lib/openingHours";
import {
  getResolvedCalendarDate,
  isSlotBookable
} from "@/lib/bookingSlots";
import { parseLocale, translateError } from "@/lib/i18n";
import { sendTelegramMessage } from "@/lib/telegram";

type ErrorBody = { error: string; openingHours?: string };

function err(locale: ReturnType<typeof parseLocale>, key: string, params?: Record<string, string | number>) {
  return translateError(locale, key, params);
}

export async function POST(req: Request) {
  const cfg = getOpeningHoursFromEnv();
  const opening = openingHoursHint(cfg);
  const env = (globalThis as any)?.process?.env as
    | Record<string, string | undefined>
    | undefined;
  const botToken = env?.TELEGRAM_BOT_TOKEN;
  const chatId = env?.TELEGRAM_CHAT_ID;

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json(
      { error: err("en", "errors.invalidJson"), openingHours: opening } satisfies ErrorBody,
      { status: 400 }
    );
  }

  if (typeof json !== "object" || json === null) {
    return Response.json(
      { error: err("en", "errors.invalidBody"), openingHours: opening } satisfies ErrorBody,
      { status: 400 }
    );
  }

  const body = json as Record<string, unknown>;
  const locale = parseLocale(body.locale);
  const tzLabel =
    locale === "ru" ? "время Вьетнама" : "Vietnam time";

  if (!botToken || !chatId) {
    return Response.json(
      {
        error: err(locale, "errors.serverNotConfigured"),
        openingHours: opening
      } satisfies ErrorBody,
      { status: 500 }
    );
  }

  const parsed = BookingSchema.safeParse({
    ...body,
    guests: typeof body.guests === "string" ? Number(body.guests) : body.guests
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "errors.invalidInput";
    return Response.json(
      { error: err(locale, first), openingHours: opening } satisfies ErrorBody,
      { status: 400 }
    );
  }

  const booking = parsed.data;

  if (!isTimeBookable(booking.time, cfg)) {
    return Response.json(
      {
        error: err(locale, "errors.bookingsAvailable", {
          from: cfg.openFrom,
          to: cfg.lastBookable,
          tz: tzLabel
        }),
        openingHours: opening
      } satisfies ErrorBody,
      { status: 400 }
    );
  }

  if (!isSlotBookable(booking.date, booking.time, cfg)) {
    return Response.json(
      {
        error: err(locale, "errors.slotTooSoon", { tz: tzLabel }),
        openingHours: opening
      } satisfies ErrorBody,
      { status: 400 }
    );
  }

  const requestId = globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  const resolvedDate = getResolvedCalendarDate(booking.date, booking.time, cfg);

  const text = [
    "<b>Meduza booking</b>",
    "",
    `<b>ID:</b> ${requestId}`,
    `<b>Name:</b> ${escapeHtml(booking.name)}`,
    `<b>Phone:</b> ${escapeHtml(booking.phone)}`,
    `<b>Date:</b> ${escapeHtml(resolvedDate)}`,
    `<b>Time:</b> ${escapeHtml(booking.time)} (Vietnam)`,
    `<b>Guests:</b> ${booking.guests}`,
    booking.notes?.trim()
      ? `<b>Notes:</b> ${escapeHtml(booking.notes.trim())}`
      : "<b>Notes:</b> —"
  ].join("\n");
  try {
    await sendTelegramMessage({ botToken, chatId, text });
  } catch (e: any) {
    return Response.json(
      {
        error: err(locale, "errors.telegramFailed"),
        openingHours: opening
      } satisfies ErrorBody,
      { status: 502 }
    );
  }

  return Response.json(
    {
      ok: true,
      requestId,
      openingHours: opening
    },
    { status: 200 }
  );
}

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}
