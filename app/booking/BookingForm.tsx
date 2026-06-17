"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useLanguage } from "@/components/LanguageProvider";
import {
  filterBookableSlots,
  toISODateInTz
} from "@/lib/bookingSlots";
import {
  buildOpeningTimeSlots,
  openingHoursHint,
  type OpeningHoursConfig
} from "@/lib/openingHours";
import { DEFAULT_TZ } from "@/lib/time";
import { PHONE_ALLOWED } from "@/lib/validation";

type BookingPayload = {
  name: string;
  phone: string;
  instagram?: string;
  date: string;
  time: string;
  guests: number;
  notes?: string;
};

type BookingFormProps = {
  openingHours: OpeningHoursConfig;
};

function sanitizePhone(value: string) {
  return value.replaceAll(/[^0-9+()\-.\s#xX]/g, "");
}

function sanitizeInstagram(value: string) {
  return value.replaceAll(/[^@a-zA-Z0-9._]/g, "");
}

function TimeDropdown(props: {
  value: string;
  disabled: boolean;
  options: string[];
  ariaLabel: string;
  onChange: (v: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDocMouseDown(e: MouseEvent) {
      if (!rootRef.current) return;
      if (!(e.target instanceof Node)) return;
      if (!rootRef.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener("mousedown", onDocMouseDown);
    return () => document.removeEventListener("mousedown", onDocMouseDown);
  }, []);

  return (
    <div className="dropdown" ref={rootRef}>
      <button
        type="button"
        className="dropdownButton"
        disabled={props.disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
      >
        {props.value}
      </button>
      {open && props.options.length > 0 ? (
        <div className="dropdownMenu" role="listbox" aria-label={props.ariaLabel}>
          {props.options.map((t) => (
            <button
              type="button"
              key={t}
              className="dropdownItem"
              aria-selected={t === props.value}
              onClick={() => {
                props.onChange(t);
                setOpen(false);
              }}
            >
              {t}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  );
}

export default function BookingForm({ openingHours }: BookingFormProps) {
  const { locale, messages: m, messages: { common: c, booking: b } } = useLanguage();
  const hoursLabel = openingHoursHint(openingHours);
  const [nowTick, setNowTick] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setNowTick((n) => n + 1), 60_000);
    return () => clearInterval(id);
  }, []);

  const openingSlots = useMemo(
    () => buildOpeningTimeSlots(openingHours, 30),
    [openingHours]
  );

  const [payload, setPayload] = useState<BookingPayload>({
    name: "",
    phone: "",
    instagram: "",
    date: toISODateInTz(Date.now(), DEFAULT_TZ),
    time: openingHours.openFrom,
    guests: 2,
    notes: ""
  });

  const minDate = useMemo(
    () => toISODateInTz(Date.now(), DEFAULT_TZ),
    [nowTick]
  );

  const availableTimes = useMemo(
    () =>
      filterBookableSlots(
        payload.date,
        openingSlots,
        openingHours,
        DEFAULT_TZ
      ),
    [payload.date, openingSlots, openingHours, nowTick]
  );

  useEffect(() => {
    if (availableTimes.length === 0) return;
    if (!availableTimes.includes(payload.time)) {
      setPayload((p) => ({ ...p, time: availableTimes[0] }));
    }
  }, [availableTimes, payload.time]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | { requestId: string }>(null);
  const [openingHint, setOpeningHint] = useState(hoursLabel);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...payload, locale })
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setOpeningHint(
          typeof data?.openingHours === "string"
            ? data.openingHours
            : openingHint
        );
        throw new Error(data?.error || m.errors.bookingFailed);
      }
      setOpeningHint(
        typeof data?.openingHours === "string" ? data.openingHours : openingHint
      );
      setSuccess({ requestId: String(data.requestId || "") });
    } catch (err: any) {
      setError(err?.message || m.errors.bookingFailed);
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = submitting || !!success;
  const noTimesAvailable = availableTimes.length === 0;
  const blockNumberChars = new Set(["e", "E", "+", "-", ".", ","]);

  return (
    <main className="page">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">{b.title}</div>
            <div className="subtitle">
              {b.openingHours}: {hoursLabel} ({c.vietnamTime})
            </div>
          </div>
          <div className="subtitle">{openingHint}</div>
        </div>

        {success ? (
          <div className="success">
            <div className="title" style={{ fontSize: 16 }}>
              {b.requestSent}
            </div>
            <div className="subtitle">
              {b.requestSentDetail} {c.reference}:{" "}
              <b>{success.requestId || "—"}</b>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 16 }}>
          <div className="grid two">
            <div className="field">
              <div className="labelRow">
                <div className="label">{b.name}</div>
                <div className="hint">{c.required}</div>
              </div>
              <input
                className="input"
                value={payload.name}
                disabled={disabled}
                onChange={(e) =>
                  setPayload((p) => ({ ...p, name: e.target.value }))
                }
                placeholder={b.namePlaceholder}
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">{b.phone}</div>
                <div className="hint">{c.required}</div>
              </div>
              <input
                className="input"
                value={payload.phone}
                disabled={disabled}
                inputMode="tel"
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  const cleaned = sanitizePhone(text);
                  if (cleaned !== text) {
                    e.preventDefault();
                    setPayload((p) => ({ ...p, phone: cleaned }));
                  }
                }}
                onKeyDown={(e) => {
                  if (
                    e.key === "Backspace" ||
                    e.key === "Delete" ||
                    e.key === "Tab" ||
                    e.key === "Enter" ||
                    e.key === "ArrowLeft" ||
                    e.key === "ArrowRight" ||
                    e.key === "Home" ||
                    e.key === "End"
                  ) {
                    return;
                  }
                  if (e.ctrlKey || e.metaKey) return;
                  if (e.key.length === 1 && !PHONE_ALLOWED.test(e.key)) {
                    e.preventDefault();
                  }
                }}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    phone: sanitizePhone(e.target.value)
                  }))
                }
                placeholder={b.phonePlaceholder}
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <div className="field">
            <div className="labelRow">
              <div className="label">{b.instagram}</div>
              <div className="hint">{c.preferredContact}</div>
            </div>
            <input
              className="input"
              value={payload.instagram || ""}
              disabled={disabled}
              onChange={(e) =>
                setPayload((p) => ({
                  ...p,
                  instagram: sanitizeInstagram(e.target.value)
                }))
              }
              placeholder={b.instagramPlaceholder}
              autoComplete="username"
            />
          </div>

          <div className="grid two">
            <div className="field">
              <div className="labelRow">
                <div className="label">{b.date}</div>
                <div className="hint">{c.required}</div>
              </div>
              <input
                type="date"
                className="input inputDate"
                value={payload.date}
                min={minDate}
                disabled={disabled}
                onChange={(e) => {
                  const date =
                    e.target.value < minDate ? minDate : e.target.value;
                  setPayload((p) => ({ ...p, date }));
                }}
                required
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">{b.time}</div>
                <div className="hint">
                  {b.timeHint} · {hoursLabel}
                </div>
              </div>
              <TimeDropdown
                value={noTimesAvailable ? b.noTimes : payload.time}
                disabled={disabled || noTimesAvailable}
                options={availableTimes}
                ariaLabel={b.timeAriaLabel}
                onChange={(time) => setPayload((p) => ({ ...p, time }))}
              />
              {noTimesAvailable ? (
                <div className="hint">{b.noTimesLeft}</div>
              ) : null}
            </div>
          </div>

          <div className="grid two">
            <div className="field">
              <div className="labelRow">
                <div className="label">{b.guests}</div>
                <div className="hint">{c.required}</div>
              </div>
              <input
                type="number"
                className="input"
                value={String(payload.guests)}
                disabled={disabled}
                min={1}
                max={50}
                inputMode="numeric"
                pattern="[0-9]*"
                onWheel={(e) => (e.currentTarget as HTMLInputElement).blur()}
                onKeyDown={(e) => {
                  if (blockNumberChars.has(e.key)) e.preventDefault();
                }}
                onPaste={(e) => {
                  const text = e.clipboardData.getData("text");
                  const digits = text.replaceAll(/\D+/g, "");
                  if (digits !== text) {
                    e.preventDefault();
                    const n = Number(digits || "0");
                    setPayload((p) => ({ ...p, guests: n }));
                  }
                }}
                onChange={(e) =>
                  setPayload((p) => ({
                    ...p,
                    guests: Number(
                      String(e.target.value).replaceAll(/\D+/g, "") || 0
                    )
                  }))
                }
                required
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">{b.specialRequests}</div>
                <div className="hint">{c.optional}</div>
              </div>
              <textarea
                className="textarea"
                value={payload.notes || ""}
                disabled={disabled}
                onChange={(e) =>
                  setPayload((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder={b.notesPlaceholder}
              />
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="actions">
            <button
              className="button"
              disabled={disabled || noTimesAvailable}
              type="submit"
            >
              {submitting ? b.submitting : b.submit}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
