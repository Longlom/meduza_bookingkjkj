"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { openingHoursHint } from "@/lib/openingHours";
import { toISODateLocal } from "@/lib/time";
import { PHONE_ALLOWED } from "@/lib/validation";

type BookingPayload = {
  name: string;
  phone: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  guests: number;
  notes?: string;
};

function buildTimeSlots(stepMinutes = 30) {
  const out: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += stepMinutes) {
      out.push(`${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}`);
    }
  }
  return out;
}

function isWithinOpeningHours(timeHHMM: string) {
  // Opening hours: 12:00–03:00 (cross-midnight)
  return timeHHMM >= "12:00" || timeHHMM <= "03:00";
}

function sanitizePhone(value: string) {
  return value.replaceAll(/[^0-9+()\-.\s#xX]/g, "");
}

function TimeDropdown(props: {
  value: string;
  disabled: boolean;
  options: string[];
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
      {open ? (
        <div className="dropdownMenu" role="listbox" aria-label="Time">
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

export default function BookingPage() {
  const times = useMemo(
    () => buildTimeSlots(30).filter((t) => isWithinOpeningHours(t)),
    []
  );
  const [payload, setPayload] = useState<BookingPayload>({
    name: "",
    phone: "",
    date: toISODateLocal(new Date()),
    time: "12:00",
    guests: 2,
    notes: ""
  });

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<null | { requestId: string }>(null);
  const [openingHint, setOpeningHint] = useState<string>("12:00–03:00");

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setSubmitting(true);
    try {
      const res = await fetch("/api/booking", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });
      const data = (await res.json().catch(() => ({}))) as any;
      if (!res.ok) {
        setOpeningHint(
          typeof data?.openingHours === "string"
            ? data.openingHours
            : openingHint
        );
        throw new Error(data?.error || "Booking failed. Please try again.");
      }
      setOpeningHint(
        typeof data?.openingHours === "string" ? data.openingHours : openingHint
      );
      setSuccess({ requestId: String(data.requestId || "") });
    } catch (err: any) {
      setError(err?.message || "Booking failed. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  const disabled = submitting || !!success;
  const blockNumberChars = new Set(["e", "E", "+", "-", ".", ","]);

  return (
    <main className="page">
      <div className="card">
        <div className="header">
          <div>
            <div className="title">Meduza — Booking</div>
            <div className="subtitle">
              Opening hours: {openingHoursHint({ openFrom: "12:00", openTo: "03:00" })}{" "}
              (Vietnam time)
            </div>
          </div>
          <div className="subtitle">{openingHint}</div>
        </div>

        {success ? (
          <div className="success">
            <div className="title" style={{ fontSize: 16 }}>
              Request sent
            </div>
            <div className="subtitle">
              The hostess received your booking request in Telegram. Reference:{" "}
              <b>{success.requestId || "—"}</b>
            </div>
          </div>
        ) : null}

        <form onSubmit={onSubmit} className="grid" style={{ marginTop: 16 }}>
          <div className="grid two">
            <div className="field">
              <div className="labelRow">
                <div className="label">Name</div>
                <div className="hint">Required</div>
              </div>
              <input
                className="input"
                value={payload.name}
                disabled={disabled}
                onChange={(e) =>
                  setPayload((p) => ({ ...p, name: e.target.value }))
                }
                placeholder="Your name"
                autoComplete="name"
                required
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">Phone</div>
                <div className="hint">Required</div>
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
                placeholder="+84 ..."
                autoComplete="tel"
                required
              />
            </div>
          </div>

          <div className="grid two">
            <div className="field">
              <div className="labelRow">
                <div className="label">Date</div>
                <div className="hint">Required</div>
              </div>
              <input
                type="date"
                className="input inputDate"
                value={payload.date}
                disabled={disabled}
                onChange={(e) =>
                  setPayload((p) => ({ ...p, date: e.target.value }))
                }
                required
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">Time</div>
                <div className="hint">30 min steps (12:00–03:00)</div>
              </div>
              <TimeDropdown
                value={payload.time}
                disabled={disabled}
                options={times}
                onChange={(time) => setPayload((p) => ({ ...p, time }))}
              />
            </div>
          </div>

          <div className="grid two">
            <div className="field">
              <div className="labelRow">
                <div className="label">Guests</div>
                <div className="hint">Required</div>
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
                    guests: Number(String(e.target.value).replaceAll(/\D+/g, "") || 0)
                  }))
                }
                required
              />
            </div>

            <div className="field">
              <div className="labelRow">
                <div className="label">Special requests</div>
                <div className="hint">Optional</div>
              </div>
              <textarea
                className="textarea"
                value={payload.notes || ""}
                disabled={disabled}
                onChange={(e) =>
                  setPayload((p) => ({ ...p, notes: e.target.value }))
                }
                placeholder="Birthday, allergies, seating preference…"
              />
            </div>
          </div>

          {error ? <div className="error">{error}</div> : null}

          <div className="actions">
            <button className="button" disabled={disabled} type="submit">
              {submitting ? "Sending…" : "Send booking request"}
            </button>
            <div className="status">
              {success
                ? "Sent."
                : "We’ll send your request to the hostess in Telegram."}
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}

