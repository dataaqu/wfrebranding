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
export const KPIS = [["Rail", 164], ["Sea FCL", 318], ["Sea LCL", 57], ["Air", 42], ["Road", 96]];
export const AXIS_MAX = 250;
export const SIDEBAR = [
  { title: "Shipments", n: "677", alert: "3 with exceptions", items: ["Map", "Milestones", "Exceptions", "Quotes & bookings"], active: 1 },
  { title: "Containers", n: "128", ok: "$0 est. D&D cost", items: ["Demurrage & detention", "Container tracking"] },
  { title: "Customs declarations", n: "214", alert: "2 under hold or exam", items: ["Release status", "Customs exceptions"] },
  { title: "Rail · China → GE", n: "36", ok: "Next departure Thu", items: ["Departures", "Wagon tracking"] },
];

