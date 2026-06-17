import type { Messages } from "./types";

export const ru: Messages = {
  common: {
    required: "Обязательно",
    optional: "Необязательно",
    preferredContact: "Необязательно · предпочтительный способ связи",
    vietnamTime: "Время Вьетнама",
    reference: "Номер"
  },
  lang: {
    en: "EN",
    ru: "RU",
    switchLabel: "Язык"
  },
  home: {
    subtitle: "Бронирование ресторана-лаунжа",
    description:
      "Заполните форму, чтобы забронировать стол. Администратор подтвердит бронь в Telegram или по телефону.",
    openBooking: "Открыть форму бронирования"
  },
  booking: {
    title: "Meduza — Бронирование",
    openingHours: "Часы работы",
    requestSent: "Заявка отправлена",
    requestSentDetail:
      "Администратор получил вашу заявку на бронирование в Telegram.",
    name: "Имя",
    phone: "Телефон",
    instagram: "Instagram",
    date: "Дата",
    time: "Время",
    timeHint: "Не ранее чем через 1,5 ч",
    guests: "Гости",
    specialRequests: "Особые пожелания",
    namePlaceholder: "Ваше имя",
    phonePlaceholder: "+84 ...",
    instagramPlaceholder: "@username",
    notesPlaceholder: "День рождения, аллергии, предпочтения по столу…",
    noTimes: "Нет времени",
    noTimesLeft: "На эту дату нет свободного времени. Выберите другую дату.",
    submit: "Забронировать",
    submitting: "Бронирование…",
    timeAriaLabel: "Время"
  },
  call: {
    scanQrTitle: "Отсканируйте QR-код на столе",
    scanQrDescription:
      "Откройте ссылку из QR-кода на вашем столе, чтобы позвать официанта или кальянщика.",
    noStaffTitle: "Нет сотрудников на смене",
    noStaffDescription: "Обратитесь к администратору за помощью.",
    title: "Вызов персонала",
    subtitle: "Позовите любого свободного сотрудника или выберите по имени",
    table: "Стол",
    notified: "уведомлён(а)",
    successDetail: "Ваш запрос отправлен команде.",
    callPerson: "Позвать {name}",
    callWaiter: "Позвать официанта",
    callHookah: "Позвать кальянщика",
    anyAvailable: "Кто свободен",
    genericHint: "Придёт первый свободный сотрудник",
    calling: "Вызов…"
  },
  staff: {
    waiters: "Официанты",
    hookahMasters: "Кальянщики",
    waiter: "Официант",
    hookahMaster: "Кальянщик"
  },
  errors: {
    bookingFailed: "Не удалось забронировать. Попробуйте ещё раз.",
    callFailed: "Не удалось отправить вызов. Попробуйте ещё раз.",
    nameMin: "Введите ваше имя.",
    phoneRequired: "Введите номер телефона.",
    phoneInvalidChars: "Телефон содержит недопустимые символы.",
    phoneNeedDigit: "Телефон должен содержать хотя бы одну цифру.",
    dateInvalid: "Неверный формат даты (ГГГГ-ММ-ДД).",
    timeInvalid: "Неверный формат времени (ЧЧ:ММ).",
    guestsMin: "Минимум 1 гость.",
    guestsMax: "Для больших групп свяжитесь с администратором.",
    notesTooLong: "Слишком длинный комментарий.",
    instagramTooLong: "Слишком длинный ник в Instagram.",
    instagramInvalid: "Ник в Instagram содержит недопустимые символы.",
    invalidInput: "Неверные данные.",
    staffRequired: "Укажите сотрудника.",
    staffInvalid: "Неверный сотрудник.",
    tableRequired: "Укажите стол.",
    tableInvalid: "Неверный стол.",
    serverNotConfigured:
      "Сервер не настроен. Отсутствуют TELEGRAM_BOT_TOKEN или TELEGRAM_CHAT_ID.",
    invalidJson: "Неверное тело JSON.",
    invalidBody: "Неверный запрос.",
    bookingsAvailable: "Бронирование доступно {from}–{to} ({tz}).",
    slotTooSoon:
      "Выберите время не ранее чем через 1,5 часа от текущего момента ({tz}).",
    telegramFailed: "Не удалось отправить сообщение в Telegram.",
    staffNotOnShift: "{role} сейчас не на смене.",
    rateLimited: "Подождите немного перед повторным вызовом."
  }
};
