# Meduza booking

Public booking form for **Meduza** (restaurant-lounge).

## What it does
- Customers fill a booking form at `/booking`
- The server validates required fields and opening hours (**12:00–03:00**, Vietnam time)
- A Telegram bot sends the booking request to the hostess (your aggregated source for now)

## Setup (local)
1. Install dependencies:

```bash
cd meduza-booking
npm install
```

2. Configure environment variables:
- Copy `.env.example` to `.env.local` and fill:
  - `TELEGRAM_BOT_TOKEN`
  - `TELEGRAM_CHAT_ID`

3. Run dev server:

```bash
npm run dev
```

Open `http://localhost:3000/booking`.

## Telegram bot setup
1. Create a bot via **BotFather** and get `TELEGRAM_BOT_TOKEN`.
2. Get `TELEGRAM_CHAT_ID`:
   - If messaging the hostess directly: open chat with the bot and send any message, then use a helper like `getUpdates` to read the chat id.
   - If sending to a group: add the bot to the group, send a message, then read the group chat id (usually negative).

## Deploy (Vercel)
1. Create a new Vercel project and select the **`meduza-booking`** folder as the root.
2. Add environment variables in Vercel Project Settings:
   - `TELEGRAM_BOT_TOKEN`
   - `TELEGRAM_CHAT_ID`
   - `BOOKING_TZ=Asia/Ho_Chi_Minh`
   - `OPEN_FROM=12:00`
   - `OPEN_TO=03:00`
3. Deploy. The resulting Vercel URL is **the booking link** you share with customers.

## Vercel Analytics & Speed Insights
The app includes `@vercel/analytics` and `@vercel/speed-insights` in `app/layout.tsx`.

After deploy, enable them in the Vercel dashboard:
- Project → **Analytics** → Enable
- Project → **Speed Insights** → Enable

Data appears after production traffic (not on localhost).

