export type Locale = "en" | "ru";

export type Messages = {
  common: {
    required: string;
    optional: string;
    vietnamTime: string;
    reference: string;
  };
  lang: {
    en: string;
    ru: string;
    switchLabel: string;
  };
  home: {
    subtitle: string;
    description: string;
    openBooking: string;
  };
  booking: {
    title: string;
    openingHours: string;
    requestSent: string;
    requestSentDetail: string;
    name: string;
    phone: string;
    date: string;
    time: string;
    timeHint: string;
    guests: string;
    specialRequests: string;
    namePlaceholder: string;
    phonePlaceholder: string;
    notesPlaceholder: string;
    noTimes: string;
    noTimesLeft: string;
    submit: string;
    submitting: string;
    timeAriaLabel: string;
  };
  call: {
    scanQrTitle: string;
    scanQrDescription: string;
    noStaffTitle: string;
    noStaffDescription: string;
    title: string;
    subtitle: string;
    table: string;
    notified: string;
    successDetail: string;
    callPerson: string;
    callWaiter: string;
    callHookah: string;
    anyAvailable: string;
    genericHint: string;
    calling: string;
  };
  staff: {
    waiters: string;
    hookahMasters: string;
    waiter: string;
    hookahMaster: string;
  };
  errors: {
    bookingFailed: string;
    callFailed: string;
    nameMin: string;
    phoneRequired: string;
    phoneInvalidChars: string;
    phoneNeedDigit: string;
    dateInvalid: string;
    timeInvalid: string;
    guestsMin: string;
    guestsMax: string;
    notesTooLong: string;
    invalidInput: string;
    staffRequired: string;
    staffInvalid: string;
    tableRequired: string;
    tableInvalid: string;
    serverNotConfigured: string;
    invalidJson: string;
    invalidBody: string;
    bookingsAvailable: string;
    slotTooSoon: string;
    telegramFailed: string;
    staffNotOnShift: string;
    rateLimited: string;
  };
};
