export const dynamic = "force-dynamic";

export function GET(request) {
  const origin = (process.env.NEXT_PUBLIC_SITE_ORIGIN || new URL(request.url).origin).replace(/\/$/, "");
  const configuredContact = String(process.env.NEXT_PUBLIC_SECURITY_CONTACT || "").trim();
  const contact = /^(?:mailto:|https:\/\/)/i.test(configuredContact)
    ? configuredContact
    : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(configuredContact)
      ? `mailto:${configuredContact}`
      : `${origin}/security-information`;
  const expires = new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString();
  const body = [
    `Contact: ${contact}`,
    `Expires: ${expires}`,
    `Canonical: ${origin}/.well-known/security.txt`,
    `Policy: ${origin}/security-information`,
    "Preferred-Languages: id, en"
  ].join("\n");
  return new Response(`${body}\n`, { headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" } });
}
