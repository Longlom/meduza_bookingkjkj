import type { StaffMember, StaffOnShift, StaffRole } from "@/lib/staff";

const CACHE_TTL_MS = 60_000;

type SheetCache = {
  at: number;
  staff: StaffOnShift;
};

let sheetCache: SheetCache | null = null;

export type StaffSheetConfig = {
  sheetId: string;
  gid: string;
};

/** Parse spreadsheet id (and optional gid) from env or a pasted Google Sheets URL. */
export function getStaffSheetConfigFromEnv(): StaffSheetConfig | null {
  const rawUrl = process.env.STAFF_SHEET_URL?.trim();
  const sheetId = process.env.STAFF_SHEET_ID?.trim();
  const gid = process.env.STAFF_SHEET_GID?.trim() || "0";

  if (rawUrl) {
    const parsed = parseGoogleSheetUrl(rawUrl);
    if (parsed) return parsed;
  }

  if (sheetId) {
    return { sheetId, gid };
  }

  return null;
}

export function parseGoogleSheetUrl(url: string): StaffSheetConfig | null {
  const idMatch = /\/spreadsheets\/d\/([a-zA-Z0-9_-]+)/.exec(url);
  if (!idMatch) return null;

  const gidMatch = /[?&#]gid=(\d+)/.exec(url);
  return {
    sheetId: idMatch[1],
    gid: gidMatch?.[1] ?? "0"
  };
}

export function staffSheetCsvUrl(config: StaffSheetConfig) {
  return `https://docs.google.com/spreadsheets/d/${config.sheetId}/export?format=csv&gid=${encodeURIComponent(config.gid)}`;
}

export async function fetchStaffFromSheet(
  config: StaffSheetConfig
): Promise<StaffOnShift | null> {
  const now = Date.now();
  if (sheetCache && now - sheetCache.at < CACHE_TTL_MS) {
    return sheetCache.staff;
  }

  let res: Response;
  try {
    res = await fetch(staffSheetCsvUrl(config), {
      next: { revalidate: 60 }
    });
  } catch {
    return null;
  }

  if (!res.ok) return null;

  const csv = await res.text();
  const staff = parseStaffCsv(csv);
  if (!staff) return null;

  sheetCache = { at: now, staff };
  return staff;
}

export function parseStaffCsv(csv: string): StaffOnShift | null {
  const rows = parseCsv(csv);
  if (rows.length < 2) return null;

  const header = rows[0].map(normalizeHeader);
  const idx = {
    id: header.indexOf("id"),
    name: header.indexOf("name"),
    role: header.indexOf("role"),
    photoUrl: firstIndex(header, ["photourl", "photo", "photo_url", "image"]),
    enabled: header.indexOf("enabled")
  };

  if (idx.name < 0 || idx.role < 0) return null;

  const staff: StaffOnShift = { waiter: [], hookah: [] };
  const usedIds = new Set<string>();

  for (let rowNum = 1; rowNum < rows.length; rowNum += 1) {
    const row = rows[rowNum];
    const name = cell(row, idx.name).trim();
    if (!name) continue;

    const role = parseRole(cell(row, idx.role));
    if (!role) continue;

    const enabledRaw = idx.enabled >= 0 ? cell(row, idx.enabled) : "";
    const enabled = parseEnabled(enabledRaw);

    const photoRaw =
      idx.photoUrl >= 0 ? cell(row, idx.photoUrl).trim() : undefined;
    const photoUrl = photoRaw || undefined;

    let id = (idx.id >= 0 ? cell(row, idx.id).trim() : "") || slugId(name, role);
    let suffix = 1;
    while (usedIds.has(id)) {
      id = `${slugId(name, role)}-${suffix}`;
      suffix += 1;
    }
    usedIds.add(id);

    const member: StaffMember = { id, name, photoUrl, enabled };
    staff[role].push(member);
  }

  if (staff.waiter.length === 0 && staff.hookah.length === 0) {
    return null;
  }

  return staff;
}

function normalizeHeader(value: string) {
  return value.trim().toLowerCase().replaceAll(/\s+/g, "");
}

function firstIndex(header: string[], keys: string[]) {
  for (const key of keys) {
    const i = header.indexOf(key);
    if (i >= 0) return i;
  }
  return -1;
}

function cell(row: string[], index: number) {
  return index >= 0 && index < row.length ? row[index] : "";
}

function parseRole(raw: string): StaffRole | null {
  const v = raw.trim().toLowerCase();
  if (
    v === "waiter" ||
    v === "waiters" ||
    v === "официант" ||
    v === "официанты"
  ) {
    return "waiter";
  }
  if (
    v === "hookah" ||
    v === "hookahmaster" ||
    v === "hookah-master" ||
    v === "hookah master" ||
    v === "кальянщик" ||
    v === "кальян" ||
    v === "кальянщики"
  ) {
    return "hookah";
  }
  return null;
}

function parseEnabled(raw: string) {
  const v = raw.trim().toLowerCase();
  if (!v) return false;
  return v === "true" || v === "yes" || v === "1" || v === "y" || v === "да";
}

function slugId(name: string, role: StaffRole) {
  const slug = name
    .trim()
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "");
  return slug || `${role}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Minimal RFC-style CSV parser (quoted fields, commas). */
export function parseCsv(text: string): string[][] {
  const rows: string[][] = [];
  let row: string[] = [];
  let field = "";
  let inQuotes = false;

  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i];
    const next = text[i + 1];

    if (inQuotes) {
      if (ch === '"' && next === '"') {
        field += '"';
        i += 1;
      } else if (ch === '"') {
        inQuotes = false;
      } else {
        field += ch;
      }
      continue;
    }

    if (ch === '"') {
      inQuotes = true;
    } else if (ch === ",") {
      row.push(field);
      field = "";
    } else if (ch === "\n") {
      row.push(field);
      field = "";
      if (row.some((c) => c.trim().length > 0)) rows.push(row);
      row = [];
    } else if (ch === "\r") {
      // skip
    } else {
      field += ch;
    }
  }

  row.push(field);
  if (row.some((c) => c.trim().length > 0)) rows.push(row);
  return rows;
}
