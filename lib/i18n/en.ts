import type { Messages } from "./types";

export const en: Messages = {
  common: {
    required: "Required",
    optional: "Optional",
    preferredContact: "Optional · preferred contact",
    vietnamTime: "Vietnam time",
    reference: "Reference"
  },
  lang: {
    en: "EN",
    ru: "RU",
    switchLabel: "Language"
  },
  home: {
    subtitle: "Restaurant-lounge booking",
    description:
      "Use the booking form to request a table. A hostess will confirm your booking in Telegram/phone.",
    openBooking: "Open booking form"
  },
  booking: {
    title: "Meduza — Booking",
    openingHours: "Opening hours",
    requestSent: "Request sent",
    requestSentDetail:
      "The hostess received your booking request in Telegram.",
    name: "Name",
    phone: "Phone",
    instagram: "Instagram",
    date: "Date",
    time: "Time",
    timeHint: "From 1.5h ahead",
    guests: "Guests",
    specialRequests: "Special requests",
    namePlaceholder: "Your name",
    phonePlaceholder: "+84 ...",
    instagramPlaceholder: "@username",
    notesPlaceholder: "Birthday, allergies, seating preference…",
    noTimes: "No times",
    noTimesLeft: "No times left for this date. Pick a later date.",
    submit: "Book",
    submitting: "Booking…",
    timeAriaLabel: "Time",
    partnerOfferTitle: "Exclusive partner offer",
    partnerOfferText:
      "We'd like to offer you an exclusive discount on fast track services at Cam Ranh International Airport from our partner NT Insider. Use promo code {code} when booking to receive your discount.",
    partnerPromoLabel: "Promo code",
    partnerOfferCta: "Book Fast Track at NT Insider"
  },
  call: {
    scanQrTitle: "Scan the QR on your table",
    scanQrDescription:
      "Open the link from the QR code at your table to call the waiter or hookah master.",
    noStaffTitle: "No staff on shift",
    noStaffDescription: "Please ask the hostess for assistance.",
    title: "Call staff",
    subtitle: "Call any available team member, or choose someone by name",
    table: "Table",
    notified: "notified",
    successDetail: "Your request was sent to the team.",
    callPerson: "Call {name}",
    callWaiter: "Call waiter",
    callHookah: "Call hookah master",
    anyAvailable: "Any available",
    genericHint: "First free team member will come",
    calling: "Calling…"
  },
  staff: {
    waiters: "Waiters",
    hookahMasters: "Hookah masters",
    waiter: "Waiter",
    hookahMaster: "Hookah master"
  },
  errors: {
    bookingFailed: "Booking failed. Please try again.",
    callFailed: "Call failed. Please try again.",
    nameMin: "Please enter your name.",
    phoneRequired: "Please enter a phone number.",
    phoneInvalidChars: "Phone contains invalid characters.",
    phoneNeedDigit: "Phone must contain at least one digit.",
    dateInvalid: "Invalid date format (YYYY-MM-DD).",
    timeInvalid: "Invalid time format (HH:MM).",
    guestsMin: "Guests must be at least 1.",
    guestsMax: "For large groups, please contact the hostess.",
    notesTooLong: "Notes are too long.",
    instagramTooLong: "Instagram username is too long.",
    instagramInvalid: "Instagram username contains invalid characters.",
    invalidInput: "Invalid input.",
    staffRequired: "Staff is required.",
    staffInvalid: "Invalid staff.",
    tableRequired: "Table is required.",
    tableInvalid: "Invalid table.",
    serverNotConfigured:
      "Server is not configured. Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID.",
    invalidJson: "Invalid JSON body.",
    invalidBody: "Invalid request body.",
    bookingsAvailable:
      "Bookings are available {from}–{to} ({tz}).",
    slotTooSoon: "Please choose a time at least 1.5 hours from now ({tz}).",
    telegramFailed: "Failed to send Telegram message.",
    staffNotOnShift: "{role} is not on shift right now.",
    rateLimited: "Please wait a moment before calling again."
  }
};
