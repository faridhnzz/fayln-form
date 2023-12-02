export default async function discordWebhook(
  webhook: string,
  payload: string | string[]
) {
  const res = await fetch(webhook, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  return res;
}
