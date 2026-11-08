import { IconPlane, IconShip, IconTrain, IconTruck, IconDoc } from "@/components/brand/design-system";

export const NAV = [
  ["Services", "#services"],
  ["How it works", "#routes"],
  ["Rail from China", "#rail"],
  ["Contact", "#quote"],
];

export const SERVICES = [
  { icon: IconPlane, title: "Air freight", text: "Time-critical cargo flown door to door, with full tracking from pickup to delivery.", tone: "navy" },
  { icon: IconShip, title: "Sea freight", text: "LCL and FCL container shipping through the major ports to and from Georgia.", tone: "purple" },
  { icon: IconTrain, title: "Rail freight", text: "China to Georgia by rail in about 14 days. Faster than sea, cheaper than air.", tone: "navy" },
  { icon: IconTruck, title: "Road & container", text: "Trucking and container haulage across the region, under EXW, FCA and FOB terms.", tone: "navy" },
  { icon: IconDoc, title: "Customs brokerage", text: "Declarations, CMR waybills, export documents, re-export and transit paperwork.", tone: "lime" },
];

export const STEPS = [
  ["01", "Tell us the deal", "Origin, destination, cargo and timing. That is all we need to quote."],
  ["02", "We plan the route", "We choose the mode, book the capacity and prepare every document."],
  ["03", "We deliver", "Your cargo moves; you get updates at every handoff until it lands."],
];

export const RAIL = [
  ["01", "High capacity", "A 40HC container carries up to 33 tonnes of cargo."],
  ["02", "Cost-efficient", "Rail beats air on budget and sea on lead time."],
  ["03", "Secure", "The safest overland route for cargo from China to Georgia."],
];

export const MODES = ["Air", "Sea", "Rail", "Road"];

/* ---- Dashboard preview data (hero) ----
   Categorical brand palette, fixed order; adjacent pairs alternate light/dark so they separate
   without colour alone (2px surface gaps + legend + per-segment hover tooltip as secondary encoding). */
export const SERIES = [
  { key: "rail", label: "Rail", color: "#8fa93c" },
  { key: "fcl", label: "Sea FCL", color: "#463dc1" },
  { key: "lcl", label: "Sea LCL", color: "#a99bff" },
  { key: "air", label: "Air", color: "#b75cff" },
  { key: "road", label: "Road", color: "#0e0e47" },
];
// Each row sums to its total; each column sums to the KPI above the chart.
export const MILESTONES = [
  { label: "Shipments booked", v: [20, 38, 9, 8, 13] },
  { label: "Shipments at origin", v: [52, 120, 21, 14, 34] },
  { label: "Shipments in transit", v: [58, 96, 15, 9, 18] },
  { label: "Shipments at destination", v: [34, 64, 12, 11, 31] },
];
/* ---- Route explorer ("Your route. In focus.") ----
   Stylised map, viewBox 0 0 600 430. Stops: [x, y, name, detail]. */
export const ROUTE_MODES = [
  { key: "road", label: "Road", sub: "FTL / LTL", icon: IconTruck },
  { key: "sea", label: "Sea", sub: "FCL / LCL", icon: IconShip },
  { key: "rail", label: "Rail", sub: "FCL / LCL", icon: IconTrain },
  { key: "air", label: "Air", sub: "Cargo / Express", icon: IconPlane },
];
export type Route = { title: string; note: string; segments: [string, boolean][]; stops: [number, number, string, string][] };
export const ROUTES: Record<string, Route> = {
  "road-aktau": {
    title: "China to Georgia", note: "Yiwu, Dongguan or Khorgos consolidation. Trailers cross from China into Kazakhstan at Khorgos, then take the Aktau-Alat ferry over the Caspian.",
    segments: [["M535 320 L470 270 L420 220 L360 190 L300 175 L250 150 L210 140 L172 170", false], ["M172 170 L130 225", true], ["M130 225 L95 212 L70 205", false]],
    stops: [[535, 320, "Yiwu", "China · consolidation warehouse"], [300, 175, "Khorgos", "China → Kazakhstan border"], [172, 170, "Aktau", "Kazakhstan · Caspian ferry port"], [130, 225, "Alat", "Ferry arrives · Azerbaijan"], [95, 212, "Red Bridge", "Azerbaijan → Georgia border"], [70, 205, "Tbilisi", "Customs clearance & delivery"]],
  },
  "road-russia": {
    title: "China to Georgia", note: "Overland through Kazakhstan and Russia, entering Georgia at Upper Lars. No sea leg; border queues depend on season.",
    segments: [["M535 320 L470 270 L420 220 L360 190 L300 175 L250 130 L190 95 L140 85 L100 120 L75 160 L70 205", false]],
    stops: [[535, 320, "Yiwu", "China · consolidation warehouse"], [300, 175, "Khorgos", "China → Kazakhstan border"], [190, 95, "Atyrau", "Kazakhstan · transit"], [140, 85, "Astrakhan", "Russia · transit"], [75, 160, "Upper Lars", "Russia → Georgia border"], [70, 205, "Tbilisi", "Customs clearance & delivery"]],
  },
  rail: {
    title: "China to Georgia", note: "Block trains from Xi'an via Altynkol to Aktau, Caspian ferry to Baku, then rail to Tbilisi - about 14 days door to door.",
    segments: [["M450 250 L380 205 L300 175 L250 150 L210 140 L172 170", false], ["M172 170 L130 225", true], ["M130 225 L95 212 L70 205", false]],
    stops: [[450, 250, "Xi'an", "China · rail terminal"], [300, 175, "Altynkol", "China → Kazakhstan gauge change"], [172, 170, "Aktau", "Kazakhstan · Caspian ferry port"], [130, 225, "Baku", "Azerbaijan · rail"], [95, 212, "Gardabani", "Azerbaijan → Georgia border"], [70, 205, "Tbilisi", "Rail terminal & delivery"]],
  },
  sea: {
    title: "China to Georgia", note: "FCL or LCL from Shanghai and Ningbo through Suez to Poti on the Black Sea, then trucked to your door.",
    segments: [["M565 290 L590 420", true], ["M0 345 L28 262 L42 200", true], ["M42 200 L70 205", false]],
    stops: [[565, 290, "Shanghai", "China · port of loading"], [14, 330, "Suez", "Transit · Suez Canal"], [42, 200, "Poti", "Georgia · Black Sea port"], [70, 205, "Tbilisi", "Customs clearance & delivery"]],
  },
  air: {
    title: "China to Georgia", note: "Direct and one-stop air cargo from Shanghai PVG to Tbilisi TBS, with express options for urgent freight.",
    segments: [["M565 290 Q 320 20 70 205", true]],
    stops: [[565, 290, "Shanghai PVG", "China · airport of departure"], [319, 134, "Transit hub", "Almaty or Istanbul connection"], [70, 205, "Tbilisi TBS", "Customs clearance & delivery"]],
  },
};
export const WAREHOUSES = ["Yiwu", "Dongguan", "Khorgos"];

export const KPIS = [["Rail", 164], ["Sea FCL", 318], ["Sea LCL", 57], ["Air", 42], ["Road", 96]];
export const AXIS_MAX = 250;
export const SIDEBAR = [
  { title: "Shipments", n: "677", alert: "3 with exceptions", items: ["Map", "Milestones", "Exceptions", "Quotes & bookings"], active: 1 },
  { title: "Containers", n: "128", ok: "$0 est. D&D cost", items: ["Demurrage & detention", "Container tracking"] },
  { title: "Customs declarations", n: "214", alert: "2 under hold or exam", items: ["Release status", "Customs exceptions"] },
  { title: "Rail · China → GE", n: "36", ok: "Next departure Thu", items: ["Departures", "Wagon tracking"] },
];

