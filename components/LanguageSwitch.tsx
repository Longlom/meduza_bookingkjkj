"use client";

import { useLanguage } from "./LanguageProvider";
import type { Locale } from "@/lib/i18n";

const LOCALES: Locale[] = ["en", "ru"];

export default function LanguageSwitch() {
  const { locale, setLocale, messages } = useLanguage();

  return (
    <div
      className="langSwitch"
      role="group"
      aria-label={messages.lang.switchLabel}
    >
      {LOCALES.map((code) => (
        <button
          key={code}
          type="button"
          className={`langSwitch__btn${locale === code ? " langSwitch__btn--active" : ""}`}
          aria-pressed={locale === code}
          onClick={() => setLocale(code)}
        >
          {messages.lang[code]}
        </button>
      ))}
    </div>
  );
}
