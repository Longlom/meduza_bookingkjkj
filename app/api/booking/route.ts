import { BookingSchema } from "@/lib/validation";
import {
  getOpeningHoursFromEnv,
  isTimeWithinOpeningHours,
  openingHoursHint
} from "@/lib/openingHours";
import { sendTelegramMessage } from "@/lib/telegram";

type ErrorBody = { error: string; openingHours?: string };

export async function POST(req: Request) {
  const cfg = getOpeningHoursFromEnv();
  const opening = openingHoursHint(cfg);
  const env = (globalThis as any)?.process?.env as
    | Record<string, string | undefined>
    | undefined;
  const botToken = env?.TELEGRAM_BOT_TOKEN;
  const chatId = env?.TELEGRAM_CHAT_ID;

  if (!botToken || !chatId) {
    return Response.json(
      {
        error:
          "Server is not configured. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.",
        openingHours: opening
      } satisfies ErrorBody,
      { status: 500 }
    );
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json(
      { error: "Invalid JSON body.", openingHours: opening } satisfies ErrorBody,
      { status: 400 }
    );
  }

  if (typeof json !== "object" || json === null) {
    return Response.json(
      { error: "Invalid request body.", openingHours: opening } satisfies ErrorBody,
      { status: 400 }
    );
  }

  const body = json as Record<string, unknown>;

  const parsed = BookingSchema.safeParse({
    ...body,
    guests: typeof body.guests === "string" ? Number(body.guests) : body.guests
  });
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "Invalid input.";
    return Response.json(
      { error: first, openingHours: opening } satisfies ErrorBody,
      { status: 400 }
    );
  }

  const booking = parsed.data;

  if (!isTimeWithinOpeningHours(booking.time, cfg)) {
    return Response.json(
      {
        error: `We accept bookings only during opening hours (${opening}, Vietnam time).`,
        openingHours: opening
      } satisfies ErrorBody,
      { status: 400 }
    );
  }

  // Minimal request id, returned to the client and included in Telegram.
  const requestId = globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 12);

  const text = [
    "<b>Meduza booking</b>",
    "",
    `<b>ID:</b> ${requestId}`,
    `<b>Name:</b> ${escapeHtml(booking.name)}`,
    `<b>Phone:</b> ${escapeHtml(booking.phone)}`,
    `<b>Date:</b> ${escapeHtml(booking.date)}`,
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
        error: e?.message || "Failed to send Telegram message.",
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

