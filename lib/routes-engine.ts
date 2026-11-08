/* Loads the WEFORWARD route engine (window.WF_ROUTES) from the brand-concept site, unchanged.
   The scripts are classic browser scripts that extend each other, so they are injected in order
   (same order as weforward-brand-concept): base engine → country shapes → ISO codes → patches. */

export type Bi = [string, string];
export type Point = [number, number]; // [lon, lat]
export type Place = { name: Bi; point: Point; kind?: "warehouse" | "terminal" };
export type Leg = { mode: "road" | "sea" | "rail" | "air" | "ferry" | "connection"; from: Place; to: Place; points: Point[]; arc?: number };
export type FieldOption = { id: string; label: Bi; description?: Bi };
export type Field = { key: string; label: Bi; options: FieldOption[]; select?: boolean; cards?: boolean };
export type Family = { id: string; region: string; mode: string; label: Bi; title: Bi };
export type Region = { id: string; label: Bi; point: Point; offset: Point; transit?: boolean };
export type Country = { id: string; name: string; label: Bi; point: Point; region: string; primary: boolean; d?: string };
export type Route = {
  id: string; mode: "road" | "sea" | "rail" | "air"; region: string; country: string | null; title: Bi; load: string | null;
  options: Record<string, string>; fields: Field[]; details: Bi; legs: Leg[]; stops: Place[]; serviceNote?: Bi; notice?: Bi | null;
};
export type RoutesEngine = {
  families: Family[]; regions: Region[]; countries: Country[]; optionKeys: string[];
  build(id: string, values?: Record<string, string>): Route;
  fieldsFor(id: string, values?: Record<string, string>): Field[];
  forRegion(region: string, mode: string): { id: string; values: Record<string, string> };
  forCountry(id: string, mode: string, opts?: Record<string, string>): { id: string; values: Record<string, string> } | null;
  countryAvailable(id: string, mode: string, opts?: Record<string, string>): boolean;
  flag(id: string): string;
};
export type CountryShape = { id: string; name: string; d: string; region: string; primary: boolean };

const FILES = ["routes-v19.js", "route-countries-v19.js", "country-codes-v27.js", "routes-v27.js", "routes-v28.js", "routes-v29.js"];

let loading: Promise<{ engine: RoutesEngine; shapes: CountryShape[] }> | null = null;

function inject(src: string) {
  return new Promise<void>((resolve, reject) => {
    const s = document.createElement("script");
    s.src = src;
    s.async = false;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("Failed to load " + src));
    document.head.appendChild(s);
  });
}

export function loadRoutesEngine() {
  if (!loading) {
    loading = (async () => {
      const w = window as unknown as { WF_ROUTES?: RoutesEngine; WF_ROUTE_COUNTRIES?: CountryShape[] };
      if (!w.WF_ROUTES) for (const f of FILES) await inject("/routes-engine/" + f);
      return { engine: w.WF_ROUTES as RoutesEngine, shapes: (w.WF_ROUTE_COUNTRIES || []) as CountryShape[] };
    })();
  }
  return loading;
}

/** English label (index 0); the site is EN for now. */
export const L = (v: Bi | string | undefined | null) => (Array.isArray(v) ? v[0] : v ?? "");

/** Same equirectangular projection as the concept map: viewBox 0 0 1000 500. */
export const project = ([lon, lat]: Point): Point => [((lon + 180) * 1000) / 360, ((85 - lat) * 500) / 145];
