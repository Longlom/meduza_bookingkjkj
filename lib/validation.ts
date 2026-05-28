import { z } from "zod";

/** Digits and common phone symbols; no length limit. */
export const PHONE_ALLOWED = /^[0-9+()\-.\s#xX]*$/;

export const BookingSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name."),
  phone: z
    .string()
    .trim()
    .min(1, "Please enter a phone number.")
    .regex(PHONE_ALLOWED, "Phone contains invalid characters.")
    .refine((v) => /\d/.test(v), "Phone must contain at least one digit."),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, "Invalid date format (YYYY-MM-DD)."),
  time: z
    .string()
    .regex(/^\d{2}:\d{2}$/, "Invalid time format (HH:MM)."),
  guests: z
    .number()
    .int()
    .min(1, "Guests must be at least 1.")
    .max(50, "For large groups, please contact the hostess."),
  notes: z.string().trim().max(800, "Notes are too long.").optional().default("")
});

export type BookingInput = z.infer<typeof BookingSchema>;

