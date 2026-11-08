"use client";

import { cloneElement, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Reveal, chamfer, IconPlane, IconShip, IconTrain, IconTruck } from "@/components/brand/design-system";
import { L, loadRoutesEngine, project, type CountryShape, type Leg, type Place, type Region, type Route, type RoutesEngine } from "@/lib/routes-engine";

/* Route explorer — 1:1 behavioural port of weforward-brand-concept #route-explorer
   (cinematic-v19.js renderer + studio-v27.js workspace: country search, regions disclosure,
   consolidation strip, route-stages disclosure). The corridor engine (window.WF_ROUTES) is the
   concept's own code, loaded unchanged from /public/routes-engine. Corridors are illustrative. */

type ModeKey = "road" | "sea" | "rail" | "air";
type Box = [number, number, number, number];
const MODES: { key: ModeKey; label: string; sub: string; Icon: (p: { className?: string }) => React.ReactElement }[] = [
  { key: "road", label: "Road", sub: "FTL / LTL", Icon: IconTruck },
  { key: "sea", label: "Sea", sub: "FCL / LCL", Icon: IconShip },
  { key: "rail", label: "Rail", sub: "FCL / LCL", Icon: IconTrain },
  { key: "air", label: "Air", sub: "Air Cargo / Express", Icon: IconPlane },
];
const COPY = {
  road: "Road", sea: "Sea", rail: "Rail", air: "Air corridor", ferry: "Ferry crossing", connection: "Gateway connection",
  warehouse: "Warehouse intake", terminal: "Rail loading terminal", arrival: "Arrival", gateway: "GEORGIA",
  note: "Illustrative corridors. Connections and availability are confirmed for each shipment.",
  airNote: "Air corridors show representative origins, not direct-flight schedules.",
} as Record<string, string>;
const DASHED = new Set(["ferry", "sea", "connection"]);
const CORE_LABELS = ["europe", "china", "uae", "turkey", "usa", "kazakhstan"];
const INK = "#04042b", PURPLE = "#644ff2", LIME = "#d5f476";
const reducedMotion = () => typeof window !== "undefined" && matchMedia("(prefers-reduced-motion: reduce)").matches;

/* ---------- geometry (same maths as the concept) ---------- */
type Built = { leg: Leg; d: string; pts: [number, number][]; cum: number[]; length: number; duration: number; start: number };
/** Centripetal Catmull-Rom through the waypoints: organic curves that never overshoot sharp turns. */
function smooth(a: [number, number][], samples = 14): [number, number][] {
  if (a.length < 3) return a;
  const P = [a[0], ...a, a[a.length - 1]];
  const out: [number, number][] = [a[0]];
  const tj = (ti: number, p: [number, number], q: [number, number]) => ti + Math.max(1e-4, Math.sqrt(Math.hypot(q[0] - p[0], q[1] - p[1])));
  for (let i = 0; i < P.length - 3; i++) {
    const [p0, p1, p2, p3] = [P[i], P[i + 1], P[i + 2], P[i + 3]];
    const t0 = 0, t1 = tj(t0, p0, p1), t2 = tj(t1, p1, p2), t3 = tj(t2, p2, p3);
    for (let k = 1; k <= samples; k++) {
      const t = t1 + ((t2 - t1) * k) / samples;
      const lerp = (u: [number, number], v: [number, number], ta: number, tb: number): [number, number] => {
        const w = (t - ta) / (tb - ta || 1);
        return [u[0] + (v[0] - u[0]) * w, u[1] + (v[1] - u[1]) * w];
      };
      const A1 = lerp(p0, p1, t0, t1), A2 = lerp(p1, p2, t1, t2), A3 = lerp(p2, p3, t2, t3);
      const B1 = lerp(A1, A2, t0, t2), B2 = lerp(A2, A3, t1, t3);
      out.push(lerp(B1, B2, t1, t2));
    }
  }
  return out;
}

function legGeometry(leg: Leg) {
  const a = leg.points.map(project);
  if (leg.arc) {
    const p0 = a[0], p2 = a[a.length - 1];
    const c: [number, number] = [(p0[0] + p2[0]) / 2, Math.min(p0[1], p2[1]) - leg.arc];
    const pts: [number, number][] = [];
    for (let i = 0; i <= 48; i++) {
      const t = i / 48;
      pts.push([(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1]]);
    }
    return { d: `M${p0} Q${c[0]},${c[1]} ${p2}`, pts };
  }
  const pts = smooth(a);
  return { d: pts.map((p, i) => (i ? "L" : "M") + p[0].toFixed(2) + "," + p[1].toFixed(2)).join(" "), pts };
}
function buildGeometry(route: Route): Built[] {
  let start = 0;
  return route.legs.map((leg) => {
    const { d, pts } = legGeometry(leg);
    const cum = [0];
    for (let i = 1; i < pts.length; i++) cum.push(cum[i - 1] + Math.hypot(pts[i][0] - pts[i - 1][0], pts[i][1] - pts[i - 1][1]));
    const length = cum[cum.length - 1] || 1;
    const duration = Math.max(4, Math.min(24, Math.sqrt(length) * 1.2));
    const b = { leg, d, pts, cum, length, duration, start };
    start += duration;
    return b;
  });
}
function pointAt(b: Built, t: number): [number, number] {
  const target = b.length * t;
  for (let i = 1; i < b.pts.length; i++) {
    if (b.cum[i] >= target || i === b.pts.length - 1) {
      const seg = b.cum[i] - b.cum[i - 1] || 1, r = Math.min(1, Math.max(0, (target - b.cum[i - 1]) / seg));
      return [b.pts[i - 1][0] + (b.pts[i][0] - b.pts[i - 1][0]) * r, b.pts[i - 1][1] + (b.pts[i][1] - b.pts[i - 1][1]) * r];
    }
  }
  return b.pts[0];
}
function focusBox(route: Route, focused: number | null, width: number, height: number): Box {
  const legs = focused === null ? route.legs : [route.legs[Math.min(focused, route.legs.length - 1)]];
  const points = legs.flatMap((l) => l.points.map(project));
  legs.filter((l) => l.arc).forEach((l) => {
    const a = project(l.points[0]), b = project(l.points[l.points.length - 1]);
    points.push([(a[0] + b[0]) / 2, Math.min(a[1], b[1]) - (l.arc as number) * 0.55]);
  });
  const xs = points.map((p) => p[0]), ys = points.map((p) => p[1]);
  const aspect = width / height, padX = Math.min(0.28, 65 / width), padY = Math.min(0.3, 58 / height);
  let w = Math.max(50, (Math.max(...xs) - Math.min(...xs)) / (1 - 2 * padX));
  let h = Math.max(38, (Math.max(...ys) - Math.min(...ys)) / (1 - 2 * padY));
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return [cx - w / 2, cy - h / 2, w, h];
}
const GRATICULE = (() => {
  const d: string[] = [];
  for (let lon = -180; lon <= 180; lon += 20) d.push(`M${project([lon, 85])} L${project([lon, -60])}`);
  for (let lat = -60; lat <= 80; lat += 20) d.push(`M${project([-180, lat])} L${project([180, lat])}`);
  return d.join(" ");
})();

/* ---------- icons ---------- */
const WAREHOUSE_D = "M12 3 2 8v13h4v-9h12v9h4V8zM8 14h8v2H8zm0 3h8v2H8z";
const PIN_D = "M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z";
const FLAG_D = "M5 3h2v18H5zM8 4h11l-2.6 4.2L19 12.5H8z";
const ANCHOR_D = "M12 2.5a2.75 2.75 0 0 0-1 5.31V10H8v2h3v7.85A7.5 7.5 0 0 1 4.6 14H7L3.75 9.5.5 14h2.07A9.5 9.5 0 0 0 12 22a9.5 9.5 0 0 0 9.43-8h2.07l-3.25-4.5L17 14h2.4A7.5 7.5 0 0 1 13 19.85V12h3v-2h-3V7.81A2.75 2.75 0 0 0 12 2.5zm0 1.75a1 1 0 1 1 0 2 1 1 0 0 1 0-2z";
const SHIELD_D = "M12 2 4 5v6c0 5.1 3.4 9.7 8 11 4.6-1.3 8-5.9 8-11V5zm-1 14.2-3.7-3.7 1.4-1.4 2.3 2.3 4.6-4.6 1.4 1.4z";
type StopType = "origin" | "destination" | "warehouse" | "terminal" | "border" | "port" | "air" | "stop";
/** What a stop is, from the engine's data: kind, adjacent leg modes, and its name. */
function stopType(route: Route, i: number): StopType {
  const s = route.stops[i], name = L(s.name);
  if (i === route.stops.length - 1) return "destination";
  if (s.kind === "warehouse") return "warehouse";
  if (s.kind === "terminal") return "terminal";
  if (i === 0) return "origin";
  if (/border|lars|kapıkule|kapikule|sarpi|bridge|sadakhlo/i.test(name)) return "border";
  const before = route.legs[i - 1]?.mode, after = route.legs[i]?.mode;
  if (/air gateway/i.test(name) || before === "air" || after === "air") return "air";
  if ([before, after].some((m) => m === "ferry" || m === "sea" || m === "connection") || /port|gateway/i.test(name)) return "port";
  return "stop";
}
const STOP_LABEL: Record<StopType, string> = { origin: "Origin", destination: "Destination", warehouse: "Warehouse", terminal: "Rail terminal", border: "Border crossing", port: "Port", air: "Air gateway", stop: "Stop" };
const I = {
  pin: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>,
  globe: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>,
  expand: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>,
  close: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  search: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>,
  caret: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>,
  check: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>,
  play: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>,
  pause: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>,
  replay: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" /></svg>,
  arrowUR: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>,
  zoom: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4M11 8v6M8 11h6" /></svg>,
  warehouse: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d={WAREHOUSE_D} /></svg>,
};
/** "→" in engine copy is shown as the Lucide arrow-right icon, as on the concept site. */
const A = (text: string) =>
  text.includes("→")
    ? text.split("→").flatMap((part, i) => (i ? [<svg key={i} viewBox="0 0 24 24" className="mx-[0.12em] inline-block h-[0.85em] w-[0.85em] -translate-y-[0.06em] align-middle" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" focusable="false"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>, part] : [part]))
    : text;
const modeOf = (m: string) => (m === "ferry" || m === "connection" ? "sea" : m);
const modeIcon = (m: string, cls = "h-5 w-5") => {
  const M = MODES.find((x) => x.key === modeOf(m))?.Icon ?? IconTruck;
  return <M className={cls} />;
};
const mapIcon = (m: string, size: number) => {
  const M = MODES.find((x) => x.key === modeOf(m))?.Icon ?? IconTruck;
  return cloneElement(M({}), { className: undefined, width: size, height: size, x: -size / 2, y: -size / 2 });
};

/* ---------- map layers ---------- */
type CountryState = "selected" | "enabled" | "off";
const Countries = memo(function Countries({ shapes, state, onPick }: { shapes: CountryShape[]; state: (c: CountryShape) => CountryState; onPick: (id: string) => void }) {
  return (
    <g>
      {shapes.map((c) => {
        const s = state(c);
        return (
          <path key={c.id} d={c.d} vectorEffect="non-scaling-stroke" aria-label={c.name} aria-disabled={s === "off"}
            fill={s === "selected" ? "#b6acfa" : s === "enabled" ? "#e4e0fd" : "#ecebf8"} stroke="#f8f7ff" strokeWidth={0.8}
            style={{ cursor: s === "off" ? "default" : "pointer", transition: "fill 300ms" }}
            onClick={s === "off" ? undefined : () => onPick(c.id)}>
            <title>{c.name}</title>
          </path>
        );
      })}
    </g>
  );
});

type StopRef = { g: SVGGElement | null; inner: SVGGElement | null; leader: SVGPathElement | null };
type LabelRef = { g: SVGGElement | null; leader: SVGPathElement | null; dot: SVGCircleElement | null; label: SVGGElement | null };

export default function Routes() {
  const [engine, setEngine] = useState<RoutesEngine | null>(null);
  const [shapes, setShapes] = useState<CountryShape[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [view, setView] = useState<"focus" | "world">("focus");
  const [focused, setFocused] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [paused, setPaused] = useState(false);
  const [legIndex, setLegIndex] = useState(0);
  const animateNext = useRef(false);
  // country search (studio-v27)
  const [query, setQuery] = useState("");
  const [listOpen, setListOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const familyMemory = useRef<Record<string, Record<string, string>>>({});
  const modeMemory = useRef<Record<string, { id: string; values: Record<string, string> }>>({});

  const worldRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const expandRef = useRef<HTMLButtonElement>(null);
  const vehicleRef = useRef<SVGGElement>(null);
  const trailRefs = useRef<(SVGPathElement | null)[]>([]);
  const stopRefs = useRef<StopRef[]>([]);
  const labelRefs = useRef<Record<string, LabelRef>>({});
  const progressRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const camera = useRef<Box>([0, 0, 1000, 500]);
  const insets = useRef({ left: 0, top: 0, right: 0, bottom: 0 });
  const panelRef = useRef<HTMLElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const scale = useRef(1);
  const elapsed = useRef(0);
  const visible = useRef(false);
  const setStopRef = (i: number, k: keyof StopRef, el: Element | null) => { stopRefs.current[i] = { ...(stopRefs.current[i] || { g: null, inner: null, leader: null }), [k]: el }; };
  const setLabelRef = (id: string, k: keyof LabelRef, el: Element | null) => { labelRefs.current[id] = { ...(labelRefs.current[id] || { g: null, leader: null, dot: null, label: null }), [k]: el }; };

  /* ---------- engine + initial state from URL (route, option keys, mapView) ---------- */
  useEffect(() => {
    let alive = true;
    loadRoutesEngine().then(({ engine, shapes }) => {
      if (!alive) return;
      const params = new URLSearchParams(location.search);
      const initial = engine.families.find((f) => f.id === params.get("route")) || engine.families[0];
      const values = Object.fromEntries(engine.optionKeys.map((k) => [k, params.get(k)]).filter(([, v]) => v)) as Record<string, string>;
      const r = engine.build(initial.id, values);
      familyMemory.current[r.id] = r.options;
      modeMemory.current[r.mode] = { id: r.id, values: r.options };
      setEngine(engine);
      setShapes(shapes);
      fetch("/routes-engine/world-50m.json").then((r) => r.json()).then((world: { id: string; name: string; d: string }[]) => {
        if (!alive) return;
        const meta = new Map(shapes.map((c) => [c.id, c]));
        setShapes(world.map((w) => ({ id: w.id, name: w.name, d: w.d, region: meta.get(w.id)?.region ?? "", primary: meta.get(w.id)?.primary ?? false })));
      }).catch(() => {});
      setRoute(r);
      setRegion(r.region);
      setView(params.get("mapView") === "world" ? "world" : "focus");
      setPaused(reducedMotion());
    });
    return () => { alive = false; };
  }, []);

  const geometry = useMemo(() => (route ? buildGeometry(route) : []), [route]);
  const total = useMemo(() => geometry.reduce((s, b) => s + b.duration, 0) || 1, [geometry]);

  const writeURL = useCallback((r: Route, v: string) => {
    if (!engine) return;
    const url = new URL(location.href);
    url.searchParams.set("route", r.id);
    [...engine.optionKeys, "last"].forEach((k) => {
      url.searchParams.delete(k);
      if (r.options[k]) url.searchParams.set(k, r.options[k]);
    });
    url.searchParams.set("mapView", v);
    history.replaceState(history.state, "", url);
  }, [engine]);

  const scrollToMap = () => worldRef.current?.scrollIntoView({ block: "center", behavior: reducedMotion() ? "auto" : "smooth" });

  /* ---------- selection (selectRoute / selectCountry / selectRegion / selectMode) ---------- */
  const selectRoute = useCallback((id: string, values: Record<string, string> = {}, regionOverride: string | null = null) => {
    if (!engine) return;
    const r = engine.build(id, values);
    modeMemory.current[r.mode] = { id: r.id, values: r.options };
    familyMemory.current[r.id] = r.options;
    elapsed.current = 0;
    animateNext.current = true;
    setRoute(r);
    setRegion(regionOverride || r.region);
    setView("focus");
    setFocused(null);
    setLegIndex(0);
    writeURL(r, "focus");
  }, [engine, writeURL]);

  const selectCountry = useCallback((id: string) => {
    if (!engine || !route) return;
    const next = engine.forCountry(id, route.mode, route.options);
    if (!next) return;
    selectRoute(next.id, { ...next.values, direction: route.options.direction || "import" });
  }, [engine, route, selectRoute]);

  const selectRegion = useCallback((rid: string) => {
    if (!engine || !route) return;
    const next = engine.forRegion(rid, route.mode);
    selectRoute(next.id, { ...(familyMemory.current[next.id] || {}), ...next.values }, rid);
  }, [engine, route, selectRoute]);

  const selectMode = (key: ModeKey) => {
    if (!engine || !route) return;
    if (route.country && (key === "air" || key === "sea")) {
      const next = engine.forCountry(route.country, key);
      if (next) return selectRoute(next.id, next.values);
    }
    const chosen = engine.forRegion(region || route.region, key);
    let fam = engine.families.find((f) => f.id === chosen.id && f.mode === key);
    if (fam) return selectRoute(fam.id, { ...(familyMemory.current[fam.id] || {}), ...chosen.values });
    fam = engine.families.find((f) => f.id === modeMemory.current[key]?.id) || engine.families.find((f) => f.mode === key)!;
    selectRoute(fam.id, familyMemory.current[fam.id] || {});
  };

  /* ---------- drawing ---------- */
  const draw = useCallback(() => {
    if (!geometry.length) return;
    const e = elapsed.current;
    let idx = geometry.findIndex((b) => e < b.start + b.duration);
    if (idx === -1) idx = geometry.length - 1;
    const b = geometry[idx], t = Math.max(0, Math.min(1, (e - b.start) / b.duration));
    const [x, y] = pointAt(b, t);
    vehicleRef.current?.setAttribute("transform", `translate(${x.toFixed(2)},${y.toFixed(2)}) scale(${scale.current})`);
    geometry.forEach((_, i) => {
      const tr = trailRefs.current[i];
      if (!tr) return;
      const f = i < idx ? 1 : i === idx ? t : 0;
      tr.setAttribute("stroke-dasharray", `${f} 1`);
      tr.style.opacity = f > 0 ? "1" : "0";
    });
    const pct = (e / total) * 100;
    if (progressRef.current) {
      progressRef.current.value = pct.toFixed(1);
      progressRef.current.setAttribute("aria-valuetext", `${Math.round(pct)}% · ${COPY[b.leg.mode]} · ${L(b.leg.from.name)} — ${L(b.leg.to.name)}`);
    }
    if (outputRef.current) outputRef.current.textContent = Math.round(pct) + "%";
    setLegIndex((prev) => (prev === idx ? prev : idx));
  }, [geometry, total]);

  const focusRouteStop = (n: number) => {
    setPaused(true);
    setView("focus");
    setFocused(n);
    animateNext.current = true;
    if (route) writeURL(route, "focus");
    elapsed.current = n >= geometry.length ? total - 0.001 : geometry[n].start;
    draw();
  };

  /* camera apply: viewBox, marker scale + collision offsets, region labels (layoutRegionLabels) */
  const applyCamera = useCallback((box: Box) => {
    const svg = svgRef.current, host = mapBoxRef.current;
    if (!svg || !host || !route || !engine) return;
    const width = host.clientWidth || 1, height = host.clientHeight || 1;
    camera.current = box;
    svg.setAttribute("viewBox", box.map((n) => n.toFixed(3)).join(" "));
    const s = Math.max(box[2] / width, box[3] / height);
    scale.current = s;
    trailRefs.current.forEach((tr) => tr?.setAttribute("stroke-width", String(3.2 * s)));
    const placed: [number, number][] = [];
    route.stops.forEach((stop, i) => {
      const m = stopRefs.current[i];
      if (!m?.g || !m.inner) return;
      const p = project(stop.point);
      m.g.setAttribute("transform", `translate(${p[0]},${p[1]})`);
      const hide = view === "world" && i > 0 && i < route.stops.length - 1 && stop.kind !== "warehouse";
      m.g.style.display = hide ? "none" : "";
      m.g.setAttribute("tabindex", hide ? "-1" : "0");
      let dy = 0, attempt = 0;
      while (view !== "world" && placed.some((q) => Math.hypot(q[0] - p[0] / s, q[1] - (p[1] / s + dy)) < 32) && attempt < 12) {
        attempt++;
        dy = (attempt % 2 ? 1 : -1) * Math.ceil(attempt / 2) * 30;
      }
      placed.push([p[0] / s, p[1] / s + dy]);
      m.inner.setAttribute("transform", `translate(0,${dy * s}) scale(${s})`);
      m.leader?.setAttribute("d", dy ? `M0,0 L0,${dy * s}` : "");
    });
    // labels stay inside the unoccluded area (floating console/overlays cover part of the map on desktop)
    const ins = insets.current;
    const vis: Box = [box[0] + ins.left * s, box[1] + ins.top * s, Math.max(1, width - ins.left - ins.right) * s, Math.max(1, height - ins.top - ins.bottom) * s];
    const narrow = vis[2] / s < 470;
    const taken: { x: number; y: number; w: number; h: number }[] = [];
    engine.regions.forEach((r: Region) => {
      const item = labelRefs.current[r.id];
      if (!item?.g) return;
      const extra = route.mode === "air"
        ? ["africa", "india", "asia-pacific", "oceania", "canada", "south-america"].includes(r.id) && (!narrow || ["africa", "oceania"].includes(r.id))
        : route.mode === "sea" && !narrow && ["canada", "south-america"].includes(r.id);
      const show = view === "world" && (CORE_LABELS.includes(r.id) || extra || region === r.id)
        && (route.mode === "air" || route.mode === "sea" || engine.families.some((f) => f.region === r.id && f.mode === route.mode));
      item.g.style.display = show ? "" : "none";
      item.g.setAttribute("tabindex", show ? "0" : "-1");
      if (!show) return;
      const lines = r.id === "uae" ? ["United Arab", "Emirates"] : [L(r.label)];
      const lw = Math.max(47, Math.max(...lines.map((v) => v.length)) * 6.2 + 22), lh = lines.length > 1 ? 37 : 27;
      const a = project(r.point), w = lw * s, h = lh * s, pref = [a[0] + r.offset[0] * s, a[1] + r.offset[1] * s];
      let best: { x: number; y: number; score: number } | null = null;
      for (let dx = -4; dx <= 4; dx++) for (let dyy = -5; dyy <= 5; dyy++) {
        const x = Math.max(vis[0] + w / 2 + 5 * s, Math.min(vis[0] + vis[2] - w / 2 - 5 * s, pref[0] + dx * 40 * s));
        const y = Math.max(vis[1] + h / 2 + 5 * s, Math.min(vis[1] + vis[3] - h / 2 - 5 * s, pref[1] + dyy * 26 * s));
        const overlaps = taken.reduce((sum, q) => sum + (Math.abs(x - q.x) < (w + q.w) / 2 + 4 * s && Math.abs(y - q.y) < (h + q.h) / 2 + 4 * s ? 1 : 0), 0);
        const score = overlaps * 1e9 + ((x - pref[0]) / s) ** 2 + ((y - pref[1]) / s) ** 2;
        if (!best || score < best.score) best = { x, y, score };
      }
      const { x, y } = best!;
      taken.push({ x, y, w, h });
      item.leader?.setAttribute("d", `M${a} L${x},${y}`);
      item.dot?.setAttribute("cx", String(a[0]));
      item.dot?.setAttribute("cy", String(a[1]));
      item.dot?.setAttribute("r", String(2.1 * s));
      item.label?.setAttribute("transform", `translate(${x},${y}) scale(${s})`);
    });
    draw();
  }, [route, engine, view, region, draw]);

  /* fitMap: animated camera to the focus box / world */
  useLayoutEffect(() => {
    const host = mapBoxRef.current;
    if (!route || !host) return;
    let raf = 0;
    const fit = (animate: boolean) => {
      const width = host.clientWidth || 680, height = host.clientHeight || 420;
      // keep the route clear of the faded edges, the title (top) and the preview dock (bottom)
      const dockH = dockRef.current?.offsetHeight || 0;
      const fadeX = expanded ? 24 : width * 0.1, fadeY = expanded ? 24 : height * 0.14;
      insets.current = { left: fadeX, right: fadeX, top: fadeY + (expanded ? 0 : 90), bottom: height * 0.08 + dockH + 24 };
      const ins = insets.current, visW = Math.max(200, width - ins.left - ins.right), visH = Math.max(160, height - ins.top - ins.bottom);
      let vb: Box;
      if (view === "focus") vb = focusBox(route, focused, visW, visH);
      else {
        let w = 1000, h = 500;
        if (w / h < visW / visH) w = h * (visW / visH); else h = w / (visW / visH);
        vb = [500 - w / 2, 250 - h / 2, w, h];
      }
      const k = vb[2] / visW;
      const target: Box = [vb[0] - ins.left * k, vb[1] - ins.top * k, width * k, height * k];
      cancelAnimationFrame(raf);
      if (!animate || reducedMotion()) return applyCamera(target);
      const from = camera.current.slice() as Box, t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 720), ease = 1 - Math.pow(1 - k, 4);
        applyCamera(target.map((v, i) => from[i] + (v - from[i]) * ease) as Box);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    fit(animateNext.current);
    animateNext.current = false;
    const ro = new ResizeObserver(() => fit(false));
    ro.observe(host);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [route, view, focused, expanded, applyCamera]);

  /* tick: runs while visible, not paused, tab visible */
  useEffect(() => {
    const el = worldRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => { visible.current = en.isIntersecting; }, { rootMargin: "80px" });
    io.observe(el);
    return () => io.disconnect();
  }, [engine]);
  useEffect(() => {
    if (paused || !geometry.length) return;
    let raf = 0, last: number | null = null;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!visible.current || document.hidden) { last = null; return; }
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed.current = (elapsed.current + dt) % total;
      draw();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [paused, geometry, total, draw]);

  /* Escape closes the expanded map and returns focus to the expand button */
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape" && expanded) { setExpanded(false); expandRef.current?.focus(); }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [expanded]);

  /* search input shows the selected country; any route change closes the list; outside pointerdown closes */
  useEffect(() => {
    if (!engine || !route) return;
    const c = engine.countries.find((x) => x.id === route.country);
    setQuery(c ? L(c.label) : "");
    setListOpen(false);
    setActive(-1);
  }, [engine, route]);
  useEffect(() => {
    const onDown = (e: PointerEvent) => { if (searchRef.current && !searchRef.current.contains(e.target as Node)) { setListOpen(false); setActive(-1); } };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
  }, []);

  /* ---------- derived ---------- */
  const countryState = useCallback((c: CountryShape): CountryState => {
    if (!engine || !route) return "off";
    if (route.country ? c.id === route.country : c.region === region) return "selected";
    return engine.countryAvailable(c.id, route.mode, route.options) ? "enabled" : "off";
  }, [engine, route, region]);
  const filtered = useMemo(() => {
    if (!engine || !route) return [];
    const q = query.trim().toLocaleLowerCase();
    return engine.countries.filter((c) => engine.countryAvailable(c.id, route.mode, route.options) && c.label.some((n) => n.toLocaleLowerCase().includes(q))).slice(0, 40);
  }, [engine, route, query]);
  const regionButtons = useMemo(() => (engine && route
    ? engine.regions.filter((r) => route.mode === "air" || route.mode === "sea" || engine.families.some((f) => f.region === r.id && f.mode === route.mode))
    : []), [engine, route]);
  const airCoverage = useMemo(() => (engine ? ((engine as unknown as { airCoverage?: (Leg & { region: string })[] }).airCoverage || []) : []), [engine]);

  if (!engine || !route) return <section id="routes" className="min-h-[900px]" style={{ background: "#f8f7ff" }} aria-busy="true" />;

  const leg = route.legs[Math.min(legIndex, route.legs.length - 1)];
  const warehouses = route.stops.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "warehouse");
  const segFields = route.fields.filter((f) => !f.select && !f.cards);
  const selectFields = route.fields.filter((f) => f.select);
  const cardFields = route.fields.filter((f) => !f.select && f.cards);
  const first = (p: Place) => L(p.name).split(" · ")[0];
  const setOption = (key: string, value: string) => selectRoute(route.id, { ...route.options, [key]: value });
  const chooseCountry = (id: string) => { selectCountry(id); setListOpen(false); setActive(-1); inputRef.current?.focus(); };
  const caption = L(route.notice || route.serviceNote) || (route.mode === "sea" || route.mode === "air" ? "Choose on the map or search any country." : "Search available overland corridors.");

  /* ---------- presentational tokens ---------- */
  const PRESS = "transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97]";
  const LABEL = "block text-[12px] font-medium";
  const FIELD = "h-11 w-full appearance-none bg-[#f6f5fc] px-3.5 text-[14px] outline-none ring-1 ring-inset ring-[#e9e7f7] transition-[box-shadow,background-color] duration-150 [@media(hover:hover)]:hover:ring-[#d6d1fa] focus:bg-white focus:ring-2 focus:ring-brand-500";
  const SURFACE = "shadow-[0_1px_0_rgba(4,4,43,0.04),0_24px_60px_-32px_rgba(4,4,43,0.22)]";
  const Caret = () => <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: PURPLE }}>{I.caret}</span>;
  const pct = Math.round(((legIndex + 1) / route.legs.length) * 100);

  return (
    <section id="routes" className="relative pb-16 pt-4 md:pt-6" style={{ background: "#f8f7ff", color: INK }}>
      {/* rounded transition: a dome of the section colour rising behind the globe (Facts sits on a higher layer) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full h-[22vw] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[60vw] w-[125vw] -translate-x-1/2 rounded-[50%]" style={{ background: "#f8f7ff" }} />
      </div>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal id="routes-head">
            <h2 className="sr-only">Your route. In focus.</h2>
            <div aria-hidden="true">
              <div className="wf-head text-5xl md:text-7xl" style={{ color: INK }}>Your route.</div>
              <div className="wf-head text-5xl md:text-7xl" style={{ color: PURPLE }}>In focus.</div>
            </div>
          </Reveal>
          <p className="max-w-[17rem] text-[15px] leading-7" style={{ color: "#4b4b66" }}>Choose a country. Explore the connections. See every stage.</p>
        </div>


        {/* ===== 1. controls: choose ===== */}
        <section ref={panelRef} id="route-explorer" aria-labelledby="route-title" className="relative isolate z-20 mt-10 p-5 md:p-6">
          {/* chamfered surface lives on its own layer: clip-path on the card itself would clip the country dropdown */}
          <div aria-hidden="true" className="absolute inset-0 -z-10 bg-white" style={chamfer(24, "tr")} />
          <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
            <div className="shrink-0">
              <span className={LABEL} style={{ color: "#686879" }}>Transport</span>
              <div role="group" aria-label="Transport mode" className="mt-2 inline-flex gap-0.5 bg-[#f6f5fc] p-1 ring-1 ring-inset ring-[#e9e7f7]">
                {MODES.map((m) => {
                  const on = route.mode === m.key;
                  return (
                    <button key={m.key} type="button" aria-pressed={on} aria-label={`${m.label} · ${m.sub}`} title={`${m.label} · ${m.sub}`} onClick={() => selectMode(m.key)}
                      className={`inline-flex h-9 w-11 items-center justify-center ${PRESS} ${on ? "" : "[@media(hover:hover)]:hover:bg-white"}`}
                      style={on ? { background: INK, color: LIME, boxShadow: "0 1px 2px rgba(4,4,43,0.18)" } : { color: "#5a49e6" }}>
                      <m.Icon className="h-[18px] w-[18px]" />
                    </button>
                  );
                })}
              </div>
            </div>
            <div ref={searchRef} className="relative min-w-0 flex-1">
              <label htmlFor="route-country-search" className={LABEL} style={{ color: "#686879" }}>{route.options.direction === "export" ? "Where are we delivering?" : "Where are we starting?"}</label>
              <div className="relative mt-2 flex h-11 items-center gap-2.5 bg-[#f6f5fc] px-3.5 ring-1 ring-inset ring-[#e9e7f7] transition-[box-shadow,background-color] duration-150 [@media(hover:hover)]:hover:ring-[#d6d1fa] focus-within:bg-white focus-within:ring-2 focus-within:ring-brand-500" style={{ color: "#8a89a3" }}>
                {I.search}
                <input id="route-country-search" ref={inputRef} type="search" autoComplete="off" role="combobox" aria-autocomplete="list" aria-expanded={listOpen} aria-controls="route-country-results"
                  aria-activedescendant={listOpen && active >= 0 ? `country-result-${active}` : undefined} placeholder="Search a country…" value={query}
                  onChange={(e) => { setQuery(e.target.value); setListOpen(true); setActive(-1); }}
                  onFocus={(e) => { e.target.select(); setListOpen(true); setActive(-1); }}
                  onKeyDown={(e) => {
                    if (e.key === "Escape") { setListOpen(false); setActive(-1); return; }
                    if (e.key === "ArrowDown" || e.key === "ArrowUp") {
                      e.preventDefault();
                      setListOpen(true);
                      if (!filtered.length) return;
                      const next = (active + (e.key === "ArrowDown" ? 1 : -1) + filtered.length) % filtered.length;
                      setActive(next);
                      requestAnimationFrame(() => document.getElementById(`country-result-${next}`)?.scrollIntoView({ block: "nearest" }));
                    }
                    if (e.key === "Enter" && filtered.length) { e.preventDefault(); chooseCountry(filtered[Math.max(0, active)].id); }
                  }}
                  className="h-full w-full bg-transparent text-[14px] outline-none placeholder:text-[#8a89a3] [&::-webkit-search-cancel-button]:hidden" style={{ color: INK }} />
                <button type="button" aria-label="Clear search" onClick={() => { setQuery(""); inputRef.current?.focus(); setListOpen(true); setActive(-1); }} className={`inline-flex h-7 w-7 items-center justify-center ${PRESS} ${query ? "opacity-100" : "pointer-events-none opacity-0"}`} style={{ color: PURPLE }}>{I.close}</button>
              </div>
              <div id="route-country-results" role="listbox" hidden={!listOpen}
                className="absolute inset-x-0 top-full z-20 mt-2 max-h-72 origin-top overflow-auto bg-white py-1 shadow-[0_24px_48px_-16px_rgba(4,4,43,0.28)] ring-1 ring-[#ecebf8] transition-[opacity,transform] duration-150 ease-out [@starting-style]:scale-[0.98] [@starting-style]:opacity-0">
                {filtered.length ? filtered.map((c, i) => (
                  <button key={c.id} id={`country-result-${i}`} type="button" role="option" aria-selected={i === active} onClick={() => chooseCountry(c.id)}
                    className="group flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left text-sm [@media(hover:hover)]:hover:bg-[#f3f2fd]" style={{ color: INK, background: i === active ? "#f1efff" : undefined }}>
                    <span className="flex items-center gap-3"><span aria-hidden="true" className="text-base">{engine.flag(c.id)}</span>{L(c.label)}</span>
                    <span className="opacity-40 transition-opacity duration-150 group-hover:opacity-100" style={{ color: PURPLE }}>{I.arrowUR}</span>
                  </button>
                )) : <p className="px-4 py-3 text-sm" style={{ color: "#686879" }}>No matching country</p>}
              </div>
              <p data-caption className="mt-2 text-[12px] leading-5" style={{ color: "#6f6e88" }}>{A(caption)}</p>
            </div>
            <label className="block w-full lg:w-72">
              <span className={LABEL} style={{ color: "#686879" }}>Choose a corridor</span>
              <span className="relative mt-2 block">
                <select id="route-family" value={route.id} onChange={(e) => selectRoute(e.target.value)} className={`${FIELD} pr-10`} style={{ color: INK }}>
                  {engine.families.filter((f) => f.mode === route.mode).map((f) => <option key={f.id} value={f.id}>{L(f.label)}</option>)}
                </select>
                <Caret />
              </span>
            </label>
          </div>
          <div className="mt-5 flex flex-wrap items-start gap-x-6 gap-y-5 border-t pt-5" style={{ borderColor: "#f0eef9" }}>
            {segFields.length > 0 && (
              <div className="flex flex-wrap gap-x-5 gap-y-4">
                {segFields.map((f) => (
                  <fieldset key={f.key} className="min-w-0">
                    <legend className={LABEL} style={{ color: "#686879" }}>{L(f.label)}</legend>
                    <div role="group" aria-label={L(f.label)} className="mt-2 inline-flex flex-wrap gap-0.5 bg-[#f6f5fc] p-1 ring-1 ring-inset ring-[#e9e7f7]">
                      {f.options.map((o) => {
                        const on = route.options[f.key] === o.id;
                        return (
                          <button key={o.id} type="button" aria-pressed={on} onClick={() => setOption(f.key, o.id)}
                            className={`h-9 px-3.5 text-[13px] ${PRESS}`}
                            style={f.key === "load" && on ? { background: LIME, color: INK, boxShadow: "0 1px 2px rgba(4,4,43,0.12)" } : on ? { background: INK, color: "#fff" } : { color: "#4b4b66" }}>
                            <strong className={on ? "font-semibold" : "font-normal"}>{A(L(o.label))}</strong>{o.description && <small className="block">{A(L(o.description))}</small>}
                          </button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}
            {selectFields.map((f) => (
              <label key={f.key} className="block">
                <span className={LABEL} style={{ color: "#686879" }}>{L(f.label)}</span>
                <span className="relative mt-2 block max-w-xs">
                  <select data-route-field={f.key} aria-label={L(f.label)} value={route.options[f.key]} onChange={(e) => setOption(f.key, e.target.value)} className={`${FIELD} pr-10`} style={{ color: INK }}>
                    {f.options.map((o) => <option key={o.id} value={o.id}>{L(o.label)}</option>)}
                  </select>
                  <Caret />
                </span>
              </label>
            ))}
            {cardFields.map((f) => (
              <fieldset key={f.key} className="min-w-0 flex-1 basis-[420px]">
                <legend className={LABEL} style={{ color: "#686879" }}>{L(f.label)}</legend>
                <div role="group" aria-label={L(f.label)} className="mt-2 grid gap-2 sm:grid-cols-3">
                  {f.options.map((o) => {
                    const on = route.options[f.key] === o.id;
                    return (
                      <button key={o.id} type="button" aria-pressed={on} onClick={() => setOption(f.key, o.id)}
                        className={`relative flex flex-col p-4 text-left ${PRESS} ${on ? "" : "[@media(hover:hover)]:hover:bg-[#ecebfc]"}`}
                        style={on ? { background: "#fff", boxShadow: `inset 0 0 0 2px ${PURPLE}` } : { background: "#f3f2fd" }}>
                        <strong className="block pr-5 text-[13px] font-semibold leading-snug" style={{ color: INK }}>{A(L(o.label))}</strong>
                        {o.description && <small className="mt-1.5 block text-[11px] leading-5" style={{ color: "#686879" }}>{A(L(o.description))}</small>}
                        <span className={`absolute right-3 top-3 transition-[opacity,transform] duration-200 ease-out ${on ? "scale-100 opacity-100" : "scale-90 opacity-0"}`} style={{ color: PURPLE }}>{I.check}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
            <details className="group/regions">
              <summary className="inline-flex cursor-pointer list-none items-center gap-2 py-1 [&::-webkit-details-marker]:hidden">
                <span className={LABEL} style={{ color: INK }}>Browse regions & corridors</span>
                <span className="transition-transform duration-200 ease-out group-open/regions:rotate-180" style={{ color: PURPLE }}>{I.caret}</span>
              </summary>
              <div role="group" aria-label="Select a country or region" className="flex flex-wrap gap-1.5 pt-3">
                {regionButtons.map((r) => (
                  <button key={r.id} type="button" aria-pressed={r.id === region} onClick={() => { selectRegion(r.id); scrollToMap(); }}
                    className={`rounded-full px-3 py-1.5 text-xs ${PRESS} ${r.id === region ? "" : "[@media(hover:hover)]:hover:bg-[#e9e6fc]"}`}
                    style={r.id === region ? { background: INK, color: "#fff" } : { background: "#f3f2fd", color: INK }}>
                    {L(r.label)}{r.transit && route.mode !== "air" ? <small className="ml-1 opacity-60">Transit</small> : null}
                  </button>
                ))}
              </div>
            </details>
            {route.mode === "air" && (
              <div className="flex items-center gap-3 px-4 py-2.5" style={{ background: INK, ...chamfer(12, "br") }}>
                <span style={{ color: LIME }}><IconPlane className="h-5 w-5" /></span>
                <div><strong className="wf-sub block text-[10px]" style={{ color: "#fff" }}>Worldwide coverage</strong><span className="text-xs" style={{ color: "#c9c5ff" }}>To and from Georgia</span></div>
              </div>
            )}
          </div>
        </section>
      </div>

      {/* ===== 2. map: see ===== */}
      <div className="relative -mt-6">
        <div ref={worldRef} data-mode={route.mode} className={`relative overflow-hidden ${expanded ? `fixed inset-3 z-[70] md:inset-8 ${SURFACE}` : "h-[62vh] min-h-[440px] lg:h-[74vh] lg:min-h-[620px] lg:max-h-[860px]"}`} style={{ background: "#f8f7ff" }}>
          <div ref={mapBoxRef} className="absolute inset-0" style={{
            maskImage: "linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to bottom, transparent 0, #000 14%, #000 86%, transparent 100%), linear-gradient(to right, transparent 0, #000 10%, #000 90%, transparent 100%)",
            maskComposite: "intersect",
            WebkitMaskComposite: "source-in",
          }}>
            <svg ref={svgRef} viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="group" aria-label={`${L(route.title)}. ${route.stops.map((s) => L(s.name)).join(" → ")}. ${COPY.note}`}>
                  <rect x={-6000} y={-4000} width={13000} height={9000} fill="#f8f7ff" />
                  <path d={GRATICULE} fill="none" stroke="#e8e5fb" strokeWidth={1} vectorEffect="non-scaling-stroke" />
                  <Countries shapes={shapes} state={countryState} onPick={selectCountry} />
                  {route.mode === "air" && (
                    <g fill="none" aria-hidden="true">
                      {airCoverage.map((l, i) => (
                        <path key={i} d={legGeometry(l).d} stroke={l.region === region ? PURPLE : "#a99bff"} strokeOpacity={l.region === region ? 0.9 : 0.45} strokeWidth={1.2} strokeDasharray="3 4" vectorEffect="non-scaling-stroke" />
                      ))}
                    </g>
                  )}
                  {geometry.map((b, i) => <path key={"glow" + i} d={b.d} fill="none" stroke={PURPLE} strokeOpacity={0.12} strokeWidth={9} strokeLinecap="round" vectorEffect="non-scaling-stroke" />)}
                  {geometry.map((b, i) => (
                    <path key={"base" + i} d={b.d} fill="none" stroke={PURPLE} strokeOpacity={i === legIndex ? 0.95 : 0.55} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeDasharray={DASHED.has(b.leg.mode) ? "6 6" : undefined} strokeLinecap="round" />
                  ))}
                  {geometry.map((b, i) => (
                    <path key={"trail" + route.id + i} ref={(el) => { trailRefs.current[i] = el; }} d={b.d} fill="none" stroke={DASHED.has(b.leg.mode) ? INK : PURPLE} pathLength={1} strokeDasharray="0 1" strokeLinecap="round" style={{ opacity: 0 }} />
                  ))}
                  {route.stops.map((s, i) => {
                    const last = i === route.stops.length - 1, wh = s.kind === "warehouse";
                    const current = i === legIndex || i === legIndex + 1;
                    return (
                      <g key={route.id + "s" + i} ref={(el) => setStopRef(i, "g", el)} role="button" tabIndex={0} aria-label={L(s.name)} onClick={() => focusRouteStop(i)}
                        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); focusRouteStop(i); } }} style={{ cursor: "pointer" }}>
                        <path ref={(el) => setStopRef(i, "leader", el)} fill="none" stroke={INK} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" />
                        <g ref={(el) => setStopRef(i, "inner", el)}>
                          {(() => {
                            const t = stopType(route, i);
                            const glyph = (d: string, color: string, size = 14) => <path d={d} fill={color} transform={`translate(${-size / 2},${-size / 2}) scale(${size / 24})`} />;
                            if (t === "destination") return (<><circle r={14} fill={LIME} stroke={INK} strokeWidth={2} />{glyph(FLAG_D, INK, 15)}</>);
                            if (t === "warehouse") return (<><circle r={13} fill={INK} stroke={current ? LIME : "#fff"} strokeWidth={2} />{glyph(WAREHOUSE_D, LIME, 15)}</>);
                            return (
                              <>
                                <circle r={11} fill="#fff" stroke={current ? PURPLE : INK} strokeWidth={1.5} />
                                {t === "terminal" ? <g style={{ color: PURPLE }}>{mapIcon("rail", 13)}</g>
                                  : t === "air" ? <g style={{ color: PURPLE }}>{mapIcon("air", 13)}</g>
                                  : t === "stop" ? <circle r={3.5} fill={PURPLE} />
                                  : glyph(t === "origin" ? PIN_D : t === "border" ? SHIELD_D : ANCHOR_D, PURPLE, 13)}
                              </>
                            );
                          })()}
                          <title>{`${STOP_LABEL[stopType(route, i)]} · ${L(s.name)}`}</title>
                          {(i === 0 || last || wh) && (
                            <text y={i === 0 || wh ? -22 : 29} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK} stroke="#f8f7ff" strokeWidth={3} paintOrder="stroke">{first(s)}</text>
                          )}
                        </g>
                      </g>
                    );
                  })}
                  <g ref={vehicleRef} aria-hidden="true" data-mode={leg.mode}>
                    <circle r={22} fill={PURPLE} fillOpacity={0.16} />
                    <circle r={15} fill={INK} stroke={LIME} strokeWidth={1.5} />
                    <g style={{ color: LIME }}>{mapIcon(leg.mode, 18)}</g>
                  </g>
                  {engine.regions.map((r) => {
                    const sel = !route.country && r.id === region;
                    const lines = r.id === "uae" ? ["United Arab", "Emirates"] : [L(r.label)];
                    const w = Math.max(47, Math.max(...lines.map((v) => v.length)) * 6.2 + 22), h = lines.length > 1 ? 37 : 27;
                    return (
                      <g key={r.id} ref={(el) => setLabelRef(r.id, "g", el)} role="button" tabIndex={-1} aria-label={L(r.label)} aria-pressed={sel} style={{ display: "none", cursor: "pointer" }}
                        onClick={() => selectRegion(r.id)} onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); selectRegion(r.id); } }}>
                        <path ref={(el) => setLabelRef(r.id, "leader", el)} stroke={PURPLE} strokeOpacity={0.5} vectorEffect="non-scaling-stroke" />
                        <circle ref={(el) => setLabelRef(r.id, "dot", el)} fill={PURPLE} />
                        <g ref={(el) => setLabelRef(r.id, "label", el)}>
                          <rect x={-w / 2} y={-h / 2} width={w} height={h} rx={7} fill={sel ? PURPLE : "#fff"} stroke={sel ? PURPLE : "#e4e1ff"} />
                          <text textAnchor="middle" fontSize={10.5} fontWeight={600} fill={sel ? "#fff" : INK}>
                            {lines.map((line, k) => <tspan key={k} x={0} y={lines.length > 1 ? (k ? 10 : -3) : 4}>{line}</tspan>)}
                          </text>
                        </g>
                      </g>
                    );
                  })}
                </svg>
          </div>
          {/* route title on the map */}
          <div className="pointer-events-none absolute left-0 right-0 top-[14%] z-10 mx-auto max-w-6xl px-6 md:px-10">
            <h3 id="route-title" className="text-[26px] leading-tight md:text-[34px]" style={{ color: INK, fontFamily: '"Loos Wide", Inter, sans-serif', fontWeight: 500, letterSpacing: "-0.02em" }}>{A(L(route.title))}</h3>
          </div>
          {/* preview + consolidation stops, bottom */}
          <div ref={dockRef} className="absolute inset-x-0 bottom-[8%] z-10 mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-3 px-4 md:px-10">
            <div className="w-full sm:w-[420px]">
              <div className="relative flex items-center gap-3 bg-white/90 px-4 py-3 backdrop-blur" style={chamfer(14, "br")}>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center" style={{ background: INK, color: LIME }}>{modeIcon(leg.mode, "h-5 w-5")}</span>
                <div className="min-w-0 flex-1">
                  <p className={LABEL} style={{ color: "#686879" }}>Route preview</p>
                  <strong data-leg-name className="mt-0.5 block truncate text-sm font-semibold" style={{ color: INK }}>{first(leg.from)} — {first(leg.to)}</strong>
                </div>
                <span className="text-xs tabular-nums" style={{ color: "#4b4b66" }}><b style={{ color: INK }}>{String(legIndex + 1).padStart(2, "0")}</b> / {String(route.legs.length).padStart(2, "0")}</span>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300 ease-out" style={{ background: PURPLE, transform: `scaleX(${pct / 100})` }} />
              </div>
            </div>
            {warehouses.length > 0 && (
              <div className="flex flex-wrap items-center gap-3 px-1">
                <span className={LABEL} style={{ color: "#686879" }}>Consolidation stops</span>
                {warehouses.map(({ s, i }) => (
                  <button key={i} type="button" onClick={() => { focusRouteStop(i); scrollToMap(); }}
                    className={`inline-flex items-center gap-2 bg-white px-3 py-2 text-xs font-semibold ${PRESS} ${SURFACE}`} style={{ color: INK, ...chamfer(8, "br") }}>
                    <span style={{ color: PURPLE }}>{I.warehouse}</span><span>{first(s)}</span><span style={{ color: "#a99bff" }}>{I.zoom}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

    </section>
  );
}
