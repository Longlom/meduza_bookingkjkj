import { z } from "zod";

/** Digits and common phone symbols; no length limit. */
export const PHONE_ALLOWED = /^[0-9+()\-.\s#xX]*$/;

export const BookingSchema = z.object({
  name: z.string().trim().min(2, "errors.nameMin"),
  phone: z
    .string()
    .trim()
    .min(1, "errors.phoneRequired")
    .regex(PHONE_ALLOWED, "errors.phoneInvalidChars")
    .refine((v) => /\d/.test(v), "errors.phoneNeedDigit"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "errors.dateInvalid"),
  time: z.string().regex(/^\d{2}:\d{2}$/, "errors.timeInvalid"),
  guests: z
    .number()
    .int()
    .min(1, "errors.guestsMin")
    .max(50, "errors.guestsMax"),
  notes: z.string().trim().max(800, "errors.notesTooLong").optional().default("")
});

export type BookingInput = z.infer<typeof BookingSchema>;

export const CallStaffSchema = z.object({
  role: z.enum(["waiter", "hookah"]),
  staffId: z
    .string()
    .trim()
    .min(1, "errors.staffRequired")
    .max(64, "errors.staffInvalid")
    .regex(/^[a-zA-Z0-9_-]+$/, "errors.staffInvalid"),
  table: z
    .string()
    .trim()
    .min(1, "errors.tableRequired")
    .max(12, "errors.tableInvalid")
    .regex(/^[a-zA-Z0-9]+$/, "errors.tableInvalid")
});

export type CallStaffInput = z.infer<typeof CallStaffSchema>;
