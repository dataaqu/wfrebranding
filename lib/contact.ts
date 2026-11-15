/* Contact details and social profiles as published on weforward.ge (shared by the footer and /contact). */

export const EMAIL = "sales@weforward.ge";
export const PHONES: [string, string][] = [["+995 591 32 12 92", "tel:+995591321292"], ["+995 593 18 81 98", "tel:+995593188198"]];
export const ADDRESS = { label: "Tbilisi, G. Kartozia #8", href: "https://maps.app.goo.gl/CgzwPiYwyA9986ta9", mapQuery: "G. Kartozia St 8, Tbilisi, Georgia" };

export const CONTACT: [string, string][] = [[EMAIL, `mailto:${EMAIL}`], ...PHONES, [ADDRESS.label, ADDRESS.href]];
// TODO: Instagram URL not published on weforward.ge yet — set it here.
export const INSTAGRAM_URL = "https://www.instagram.com/";
export const SOCIAL: { name: string; href: string; d: string }[] = [
  { name: "Facebook", href: "https://www.facebook.com/weforwardllc", d: "M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" },
  { name: "Instagram", href: INSTAGRAM_URL, d: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 3.5c-2.3 0-2.6 0-3.5.05-2.4.1-3.8 1.5-3.9 3.9C4.5 8.4 4.5 8.7 4.5 12s0 3.6.05 4.5c.1 2.4 1.5 3.8 3.9 3.9.9.05 1.2.05 3.5.05s2.6 0 3.5-.05c2.4-.1 3.8-1.5 3.9-3.9.05-.9.05-1.2.05-4.5s0-3.6-.05-4.5c-.1-2.4-1.5-3.8-3.9-3.9C14.6 3.5 14.3 3.5 12 3.5Zm0 1.5c2.3 0 2.5 0 3.4.05 1.6.07 2.5.9 2.5 2.5.05.9.05 1.1.05 4.45s0 3.55-.05 4.45c-.07 1.6-.9 2.5-2.5 2.5-.9.05-1.1.05-3.4.05s-2.5 0-3.4-.05c-1.6-.07-2.5-.9-2.5-2.5C6 15.55 6 15.35 6 12s0-3.55.05-4.45c.07-1.6.9-2.5 2.5-2.5C9.5 5 9.7 5 12 5Z" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/weforward/", d: "M6.9 8.9H3.8V20h3.1V8.9ZM5.35 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.6c0-3-.65-5-4.1-5-1.66 0-2.77.9-3.22 1.77h-.05V8.9H9.9V20H13v-5.5c0-1.45.27-2.85 2.07-2.85 1.77 0 1.8 1.66 1.8 2.94V20h3.1l.23-6.4Z" },
];
