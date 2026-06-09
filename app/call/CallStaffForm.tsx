"use client";

import { useCallback, useMemo, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import { formatMessage } from "@/lib/i18n";
import type { Messages } from "@/lib/i18n";
import type { CallableStaffEntry, StaffRole } from "@/lib/staff";
import { getStaffPhotoSrc, stubAvatarUrl } from "@/lib/staffPhoto";

type CallStaffFormProps = {
  table: string | null;
  callableStaff: CallableStaffEntry[];
};

const CLIENT_COOLDOWN_MS = 30_000;

function roleLabel(
  role: StaffRole,
  staff: Messages["staff"],
  plural: boolean
) {
  if (role === "waiter") return plural ? staff.waiters : staff.waiter;
  return plural ? staff.hookahMasters : staff.hookahMaster;
}

function StaffCard(props: {
  entry: CallableStaffEntry;
  table: string;
  disabled: boolean;
  callLabel: string;
  callingLabel: string;
  roleSingular: string;
  locale: string;
  onSuccess: (entry: CallableStaffEntry, requestId: string) => void;
  onError: (message: string) => void;
  callFailed: string;
}) {
  const { role, member } = props.entry;
  const [photoSrc, setPhotoSrc] = useState(() =>
    getStaffPhotoSrc(member, role)
  );
  const [submitting, setSubmitting] = useState(false);

  const onPhotoError = useCallback(() => {
    setPhotoSrc(stubAvatarUrl(member.name, role));
  }, [member.name, role]);

  async function onCall() {
    props.onError("");
    setSubmitting(true);
    try {
      const res = await fetch("/api/call-staff", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          role,
          staffId: member.id,
          table: props.table,
          locale: props.locale
        })
      });
      const data = (await res.json().catch(() => ({}))) as {
        error?: string;
        requestId?: string;
      };
      if (!res.ok) {
        throw new Error(data?.error || props.callFailed);
      }
      props.onSuccess(props.entry, String(data.requestId || ""));
    } catch (err: any) {
      props.onError(err?.message || props.callFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const buttonLabel = submitting
    ? props.callingLabel
    : formatMessage(props.callLabel, { name: member.name });

  return (
    <article className="staffCard">
      <img
        className="staffPhoto"
        src={photoSrc}
        alt={member.name}
        referrerPolicy="no-referrer"
        onError={onPhotoError}
      />
      <div className="staffRole">{props.roleSingular}</div>
      <div className="staffName">{member.name}</div>
      <button
        type="button"
        className="button staffCallButton"
        disabled={props.disabled || submitting}
        onClick={onCall}
      >
        {buttonLabel}
      </button>
    </article>
  );
}

export default function CallStaffForm({
  table,
  callableStaff
}: CallStaffFormProps) {
  const {
    locale,
    messages: m,
    messages: { call: c, staff: s, common: common, errors: e }
  } = useLanguage();
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | {
    entry: CallableStaffEntry;
    requestId: string;
  }>(null);
  const [cooldownUntil, setCooldownUntil] = useState<Record<string, number>>({});

  const sections = useMemo(() => {
    const byRole = new Map<StaffRole, CallableStaffEntry[]>();
    for (const entry of callableStaff) {
      const list = byRole.get(entry.role) ?? [];
      list.push(entry);
      byRole.set(entry.role, list);
    }
    return (["waiter", "hookah"] as const)
      .filter((role) => (byRole.get(role)?.length ?? 0) > 0)
      .map((role) => ({ role, entries: byRole.get(role)! }));
  }, [callableStaff]);

  function isOnCooldown(staffId: string) {
    const until = cooldownUntil[staffId];
    return until != null && Date.now() < until;
  }

  function handleSuccess(entry: CallableStaffEntry, requestId: string) {
    setSuccess({ entry, requestId });
    setCooldownUntil((prev) => ({
      ...prev,
      [entry.member.id]: Date.now() + CLIENT_COOLDOWN_MS
    }));
  }

  if (!table) {
    return (
      <main className="page">
        <div className="card">
          <div className="title">{c.scanQrTitle}</div>
          <p className="subtitle">{c.scanQrDescription}</p>
        </div>
      </main>
    );
  }

  if (callableStaff.length === 0) {
    return (
      <main className="page">
        <div className="card">
          <div className="title">{c.noStaffTitle}</div>
          <p className="subtitle">{c.noStaffDescription}</p>
        </div>
      </main>
    );
  }

  return (
    <main className="page">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">{c.title}</div>
            <div className="subtitle">{c.subtitle}</div>
          </div>
          <div className="tableBadge">
            {c.table} {table}
          </div>
        </div>

        {success ? (
          <div className="success">
            <div className="title" style={{ fontSize: 16 }}>
              {success.entry.member.name} {c.notified}
            </div>
            <div className="subtitle">
              {c.successDetail} {common.reference}:{" "}
              <b>{success.requestId || "—"}</b>
            </div>
          </div>
        ) : null}

        {sections.map(({ role, entries }) => (
          <section key={role} className="staffSection">
            <h2 className="staffSectionTitle">{roleLabel(role, s, true)}</h2>
            <div className="staffGrid">
              {entries.map((entry) => (
                <StaffCard
                  key={entry.member.id}
                  entry={entry}
                  table={table}
                  disabled={isOnCooldown(entry.member.id)}
                  callLabel={c.callPerson}
                  callingLabel={c.calling}
                  roleSingular={roleLabel(role, s, false)}
                  locale={locale}
                  callFailed={e.callFailed}
                  onSuccess={handleSuccess}
                  onError={(message) => setError(message || null)}
                />
              ))}
            </div>
          </section>
        ))}

        {error ? <div className="error">{error}</div> : null}
      </div>
    </main>
  );
}
