const WEBHOOK_URL = process.env.DISCORD_WEBHOOK_URL;

export async function notify(message: string) {
  if (!WEBHOOK_URL) return;

  try {
    await fetch(WEBHOOK_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ content: message }),
    });
  } catch (err) {
    console.error("Discord webhook error:", err);
  }
}
