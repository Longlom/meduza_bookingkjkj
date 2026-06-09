import type { StaffMember, StaffRole } from "@/lib/staff";

const DRIVE_FILE_RE =
  /drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/;
const DRIVE_UC_RE =
  /drive\.google\.com\/uc\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/;
const DRIVE_THUMB_RE =
  /drive\.google\.com\/thumbnail\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/;
const DRIVE_USERCONTENT_RE =
  /drive\.usercontent\.google\.com\/download\?(?:[^#]*&)?id=([a-zA-Z0-9_-]+)/;
const LH3_DRIVE_RE =
  /lh3\.googleusercontent\.com\/d\/([a-zA-Z0-9_-]+)/;

export function stubAvatarUrl(name: string, role: StaffRole) {
  const bg = role === "waiter" ? "2a6bff" : "7b2cff";
  const label = encodeURIComponent(name.trim() || role);
  return `https://ui-avatars.com/api/?name=${label}&background=${bg}&color=fff&size=256&bold=true`;
}

/** Extract a Google Drive file id from common link formats. */
export function extractDriveFileId(url: string): string | null {
  for (const re of [
    DRIVE_FILE_RE,
    DRIVE_UC_RE,
    DRIVE_THUMB_RE,
    DRIVE_USERCONTENT_RE,
    LH3_DRIVE_RE
  ]) {
    const match = re.exec(url);
    if (match) return match[1];
  }
  return null;
}

export function driveThumbnailUrl(fileId: string, size = 400) {
  return `https://drive.google.com/thumbnail?id=${fileId}&sz=w${size}`;
}

/** Same-origin proxy avoids browser blocks on Drive download redirects. */
export function drivePhotoProxyUrl(fileId: string) {
  return `/api/staff-photo?id=${encodeURIComponent(fileId)}`;
}

/**
 * Resolve a staff photo URL.
 * Google Drive links are served via /api/staff-photo (server-side fetch).
 */
export function normalizePhotoUrl(url: string | undefined | null): string | null {
  const trimmed = url?.trim();
  if (!trimmed) return null;

  const driveId = extractDriveFileId(trimmed);
  if (driveId) return drivePhotoProxyUrl(driveId);

  if (/^https?:\/\//i.test(trimmed)) return trimmed;
  return null;
}

export function getStaffPhotoSrc(member: StaffMember, role: StaffRole) {
  return normalizePhotoUrl(member.photoUrl) ?? stubAvatarUrl(member.name, role);
}
