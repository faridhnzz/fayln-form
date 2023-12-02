const TURNSTILE_VERIFY_URL =
  "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type Turnstile = {
  success: boolean;
  "error-code": any;
  challenge_ts: string;
  hostname: string;
};

export async function turnstile({
  secretKey,
  token,
  remoteip,
}: {
  secretKey: string;
  token: string;
  remoteip?: string;
}) {
  let formData = new FormData();
  formData.append("secret", secretKey);
  formData.append("response", token);

  const res = await fetch(TURNSTILE_VERIFY_URL, {
    method: "POST",
    body: formData,
  });

  const data: Turnstile = await res.json();
  console.log(formData);
  console.log(data);

  return data?.success;
}
