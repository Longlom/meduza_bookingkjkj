# Meduza booking

Public booking form for **Meduza** (restaurant-lounge).

## What it does
- Customers fill a booking form at `/booking`
- Guests at a table scan a QR code → `/call?table=N` to call waiter or hookah master on shift
- The server validates required fields and opening hours (**12:00–03:00**, Vietnam time)
- A Telegram bot sends booking and staff-call requests to the hostess

## Staff on shift (Google Sheet)

The hostess updates who is working **from a phone** — no Vercel redeploy.

### 1. Create the sheet

Create a Google Sheet with this header row (row 1):

| id | name | role | photoUrl | enabled |
|----|------|------|----------|---------|
| anna | Anna | waiter | https://drive.google.com/... | TRUE |
| bob | Bob | waiter | | TRUE |
| mike | Mike | hookah | | FALSE |

- **id** — optional short id (auto-generated from name if empty)
- **name** — display name on the call page
- **role** — `waiter` or `hookah` (also `официант` / `кальянщик`)
- **photoUrl** — Google Drive share link (optional; stub avatar if empty)
- **enabled** — `TRUE` / `FALSE` — hostess toggles this daily (`да` also works)

### 2. Share the sheet

- **Share → General access → Anyone with the link → Viewer** (app reads CSV export)
- Give the hostess **Editor** access so she can change `enabled` on her phone

### 3. Connect to the app

In Vercel (or `.env.local`), set:

```bash
STAFF_SHEET_URL=https://docs.google.com/spreadsheets/d/YOUR_SHEET_ID/edit#gid=0
```

Or `STAFF_SHEET_ID` + optional `STAFF_SHEET_GID`.

Changes appear on the call page within ~1 minute (cached).

**Default call buttons:** Each role always shows an **“Any available”** card first — guests can call without picking a name; any free waiter or hookah master can respond. Named rows in the sheet (with `enabled=TRUE`) appear as additional cards below.

### Hostess daily routine

1. Open the Google Sheet app on phone
2. Set **enabled** to TRUE for staff working tonight, FALSE for others
3. Done — QR call pages update automatically

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
  - `STAFF_SHEET_URL` (Google Sheet for named staff + daily shift)

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
   - `STAFF_SHEET_URL` (Google Sheet for staff on shift)
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

