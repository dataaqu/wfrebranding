/* Tracking desk rules, ported unchanged from the brand-concept site (tracking-core.mjs v39).
   Providers live in data/tracking-providers.json. Nothing here fetches live status: it only
   validates a reference and builds the official tracker URL for the chosen provider. */
import providersJson from "@/data/tracking-providers.json";

export type RefType = "container" | "bill_of_lading" | "booking" | "awb" | "vessel_name" | "imo" | "mmsi" | "flight_number" | "aircraft_registration";
export type Provider = {
  id: string; name: string; category: "sea" | "air" | "hub" | "vessel" | "flight"; url: string;
  referenceTypes: RefType[]; prefill?: Partial<Record<RefType, string>>; awbPrefixes?: string[];
};
export const PROVIDERS = providersJson as Provider[];

export function normalizeReference(value: string, type: RefType, provider = "") {
  let ref = String(value).trim().toUpperCase();
  if (type !== "vessel_name") ref = ref.replace(/\s+/g, "");
  if (type === "awb") { ref = ref.replace(/-/g, ""); if (/^\d{11}$/.test(ref)) ref = ref.slice(0, 3) + "-" + ref.slice(3); }
  if (provider === "one" && type === "bill_of_lading" && ref.startsWith("ONEY")) ref = ref.slice(4);
  return ref;
}

const PATTERNS: Record<RefType, RegExp> = {
  container: /^[A-Z]{4}\d{7}$/, awb: /^\d{3}-\d{8}$/, bill_of_lading: /^[A-Z0-9][A-Z0-9\/-]{2,39}$/, booking: /^[A-Z0-9][A-Z0-9\/-]{2,39}$/,
  vessel_name: /^[\p{L}\p{N} .'-]{2,70}$/u, imo: /^\d{7}$/, mmsi: /^\d{9}$/, flight_number: /^[A-Z0-9]{2,3}\d{1,4}[A-Z]?$/, aircraft_registration: /^[A-Z0-9][A-Z0-9-]{2,9}$/,
};
export function validReference(ref: string, type: RefType) {
  if (!ref || ref.length > 80) return false;
  return !!PATTERNS[type]?.test(ref);
}

export function trackingURL(provider: Provider, type: RefType, reference: string) {
  if (!provider.referenceTypes.includes(type)) throw new Error("Unsupported reference type");
  const ref = normalizeReference(reference, type, provider.id);
  if (!validReference(ref, type)) throw new Error("Invalid reference");
  const template = provider.prefill?.[type];
  const encoded = encodeURIComponent(provider.category === "flight" ? ref.toLowerCase() : ref);
  const url = template ? template.replaceAll("{reference}", encoded) : provider.url;
  if (new URL(url).protocol !== "https:") throw new Error("Invalid provider URL");
  return { url, reference: ref, prefilled: !!template };
}

export function detectAirline(providers: Provider[], reference: string) {
  const prefix = String(reference).replace(/[\s-]/g, "").slice(0, 3);
  return providers.find((p) => p.category === "air" && p.awbPrefixes?.includes(prefix));
}
