type TelegramSendMessageResponse = {
  ok: boolean;
  description?: string;
};

export async function sendTelegramMessage(opts: {
  botToken: string;
  chatId: string;
  text: string;
}) {
  const url = `https://api.telegram.org/bot${opts.botToken}/sendMessage`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      chat_id: opts.chatId,
      text: opts.text,
      parse_mode: "HTML",
      disable_web_page_preview: true
    })
  });

  const data = (await res.json().catch(() => ({}))) as TelegramSendMessageResponse;
  if (!res.ok || !data.ok) {
    throw new Error(data.description || `Telegram send failed (HTTP ${res.status}).`);
  }
}

