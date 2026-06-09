import {
  findCallableMember,
  getStaffOnShift,
  type StaffRole
} from "@/lib/staff";
import { parseLocale, translateError, getMessages } from "@/lib/i18n";
import { DEFAULT_TZ } from "@/lib/time";
import { sendTelegramMessage } from "@/lib/telegram";
import { CallStaffSchema } from "@/lib/validation";

type ErrorBody = { error: string };

const COOLDOWN_MS = 30_000;
const recentCalls = new Map<string, number>();

function escapeHtml(s: string) {
  return s
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;");
}

function formatNowInTz(tz: string) {
  return new Intl.DateTimeFormat("en-GB", {
    timeZone: tz,
    hour: "2-digit",
    minute: "2-digit",
    hour12: false
  }).format(new Date());
}

function callKey(table: string, role: StaffRole, staffId: string) {
  return `${table}:${role}:${staffId}`;
}

function isRateLimited(table: string, role: StaffRole, staffId: string) {
  const last = recentCalls.get(callKey(table, role, staffId));
  if (last != null && Date.now() - last < COOLDOWN_MS) return true;
  return false;
}

function markCalled(table: string, role: StaffRole, staffId: string) {
  recentCalls.set(callKey(table, role, staffId), Date.now());
}

function staffRoleLabel(locale: ReturnType<typeof parseLocale>, role: StaffRole) {
  const m = getMessages(locale).staff;
  return role === "waiter" ? m.waiter : m.hookahMaster;
}

function err(locale: ReturnType<typeof parseLocale>, key: string, params?: Record<string, string | number>) {
  return translateError(locale, key, params);
}

export async function POST(req: Request) {
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
      { error: err("en", "errors.invalidJson") } satisfies ErrorBody,
      { status: 400 }
    );
  }

  if (typeof json !== "object" || json === null) {
    return Response.json(
      { error: err("en", "errors.invalidBody") } satisfies ErrorBody,
      { status: 400 }
    );
  }

  const body = json as Record<string, unknown>;
  const locale = parseLocale(body.locale);

  if (!botToken || !chatId) {
    return Response.json(
      { error: err(locale, "errors.serverNotConfigured") } satisfies ErrorBody,
      { status: 500 }
    );
  }

  const parsed = CallStaffSchema.safeParse(json);
  if (!parsed.success) {
    const first = parsed.error.issues[0]?.message || "errors.invalidInput";
    return Response.json({ error: err(locale, first) } satisfies ErrorBody, { status: 400 });
  }

  const { role, table, staffId } = parsed.data;
  const staff = await getStaffOnShift();
  const member = findCallableMember(staff, role, staffId);

  if (!member) {
    return Response.json(
      {
        error: err(locale, "errors.staffNotOnShift", {
          role: staffRoleLabel(locale, role)
        })
      } satisfies ErrorBody,
      { status: 400 }
    );
  }

  if (isRateLimited(table, role, staffId)) {
    return Response.json(
      { error: err(locale, "errors.rateLimited") } satisfies ErrorBody,
      { status: 429 }
    );
  }

  const requestId = globalThis.crypto.randomUUID().replaceAll("-", "").slice(0, 12);
  const tz = env?.BOOKING_TZ || DEFAULT_TZ;
  const timeLabel = formatNowInTz(tz);
  const callMessages = getMessages(locale).call;
  const staffLine = member.generic
    ? `${staffRoleLabel(locale, role)} (${callMessages.anyAvailable})`
    : member.name;

  const text = [
    "<b>Meduza staff call</b>",
    "",
    `<b>Table:</b> ${escapeHtml(table)}`,
    `<b>Role:</b> ${escapeHtml(staffRoleLabel("en", role))}`,
    `<b>Staff:</b> ${escapeHtml(staffLine)}`,
    `<b>Time:</b> ${escapeHtml(timeLabel)} (Vietnam)`,
    `<b>ID:</b> ${requestId}`
  ].join("\n");

  try {
    await sendTelegramMessage({ botToken, chatId, text });
  } catch {
    return Response.json(
      { error: err(locale, "errors.telegramFailed") } satisfies ErrorBody,
      { status: 502 }
    );
  }

  markCalled(table, role, staffId);

  return Response.json({ ok: true, requestId, staffName: member.name }, { status: 200 });
}
