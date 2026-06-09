import { en } from "./en";
import { ru } from "./ru";
import type { Locale, Messages } from "./types";

export const LANG_COOKIE = "meduza_lang";
export const DEFAULT_LOCALE: Locale = "en";

const dictionaries: Record<Locale, Messages> = { en, ru };

export function getMessages(locale: Locale): Messages {
  return dictionaries[locale] ?? en;
}

export function parseLocale(value: unknown): Locale {
  return value === "ru" ? "ru" : "en";
}

export function formatMessage(
  template: string,
  params?: Record<string, string | number>
) {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    String(params[key] ?? `{${key}}`)
  );
}

/** Resolve zod/API error keys like "errors.nameMin". */
export function translateError(
  locale: Locale,
  keyOrMessage: string,
  params?: Record<string, string | number>
) {
  const messages = getMessages(locale);
  if (keyOrMessage.startsWith("errors.")) {
    const subKey = keyOrMessage.slice("errors.".length) as keyof Messages["errors"];
    const template = messages.errors[subKey];
    if (template) return formatMessage(template, params);
  }
  return keyOrMessage;
}

export type { Locale, Messages };
