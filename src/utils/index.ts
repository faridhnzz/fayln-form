export async function pastelColor() {
  const R = Math.floor(Math.random() * 127 + 127);
  const G = Math.floor(Math.random() * 127 + 127);
  const B = Math.floor(Math.random() * 127 + 127);
  const rgb = (R << 16) + (G << 8) + B;
  return parseInt(rgb.toString(16), 16);
}

export async function gravatar(email: string) {
  const emailEncode = new TextEncoder().encode(email);
  const hash = await crypto.subtle.digest({ name: "SHA-256" }, emailEncode);
  const hexString = [...new Uint8Array(hash)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
  return `https://gravatar.com/avatar/${hexString}?d=mp&s=150`;
}
