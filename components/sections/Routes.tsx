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
  return { d: a.map((p, i) => (i ? "L" : "M") + p.join(",")).join(" "), pts: a };
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
    const narrow = box[2] / s < 470;
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
        const x = Math.max(box[0] + w / 2 + 5 * s, Math.min(box[0] + box[2] - w / 2 - 5 * s, pref[0] + dx * 40 * s));
        const y = Math.max(box[1] + h / 2 + 5 * s, Math.min(box[1] + box[3] - h / 2 - 5 * s, pref[1] + dyy * 26 * s));
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
      const target: Box = view === "focus" ? focusBox(route, focused, width, height) : [0, 0, 1000, 500];
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
  const playing = !paused;
  const setOption = (key: string, value: string) => selectRoute(route.id, { ...route.options, [key]: value });
  const chooseCountry = (id: string) => { selectCountry(id); setListOpen(false); setActive(-1); inputRef.current?.focus(); };
  const caption = L(route.notice || route.serviceNote) || (route.mode === "sea" || route.mode === "air" ? "Choose on the map or search any country." : "Search available overland corridors.");
  const motionLabel = playing ? "Pause world animation" : "Play world animation";

  /* ---------- presentational tokens ---------- */
  const PRESS = "transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97]";
  const LABEL = "wf-sub block text-[10px] font-bold tracking-[0.08em]";
  const FIELD = "min-h-12 w-full appearance-none bg-[#f3f2fd] px-4 text-sm outline-none ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-150 focus:bg-white focus:ring-brand-500";
  const SURFACE = "shadow-[0_1px_0_rgba(4,4,43,0.04),0_24px_60px_-32px_rgba(4,4,43,0.22)]";
  const Caret = () => <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2" style={{ color: PURPLE }}>{I.caret}</span>;
  const pct = Math.round(((legIndex + 1) / route.legs.length) * 100);

  return (
    <section id="routes" className="relative pb-24 pt-4 md:pt-6" style={{ background: "#f8f7ff", color: INK }}>
      {/* rounded transition: a dome of the section colour rising behind the globe (Facts sits on a higher layer) */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-full h-[22vw] overflow-hidden">
        <div className="absolute left-1/2 top-0 h-[60vw] w-[125vw] -translate-x-1/2 rounded-[50%]" style={{ background: "#f8f7ff" }} />
      </div>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal id="routes-head">
            <p className={LABEL} style={{ color: PURPLE }}>Routes / Road · Sea · Rail · Air</p>
            <h2 className="sr-only">Your route. In focus.</h2>
            <div aria-hidden="true" className="mt-4">
              <div className="wf-head text-5xl md:text-7xl" style={{ color: INK }}>Your route.</div>
              <div className="wf-head text-5xl md:text-7xl" style={{ color: PURPLE }}>In focus.</div>
            </div>
          </Reveal>
          <p className="max-w-[17rem] text-[15px] leading-7" style={{ color: "#4b4b66" }}>Choose a country. Explore the connections. See every stage.</p>
        </div>

        <div className="mt-10 grid items-start gap-5 lg:grid-cols-[1fr_1.02fr]">
          {/* ================= scene: map + modes + consolidation strip ================= */}
          <div className="min-w-0 lg:sticky lg:top-6">
            {expanded && <div className="fixed inset-0 z-[65] bg-ink-950/40 backdrop-blur-[2px]" onClick={() => setExpanded(false)} aria-hidden="true" />}
            <div ref={worldRef} data-mode={route.mode} className={`relative flex flex-col overflow-hidden ${SURFACE} ${expanded ? "fixed inset-3 z-[70] md:inset-8" : "h-[540px] md:h-[600px]"}`} style={{ background: "#f1effd", ...chamfer(28, "tr") }}>
              {/* top bar: status + map tools grouped */}
              <div className="absolute inset-x-0 top-0 z-10 flex items-center justify-between p-4">
                <p className="wf-sub flex items-center gap-2 rounded-full bg-white/80 px-3 py-1.5 text-[9px] font-bold backdrop-blur" style={{ color: "#373650" }}>
                  <span className="relative inline-flex h-1.5 w-1.5">
                    <span className="absolute inset-0 animate-ping rounded-full motion-reduce:hidden" style={{ background: LIME }} />
                    <span className="relative h-1.5 w-1.5 rounded-full" style={{ background: "#9dc22a" }} />
                  </span>
                  Connected to Georgia
                </p>
                <div className="flex items-center gap-0.5 bg-white/90 p-1 backdrop-blur" style={chamfer(8, "br")}>
                  {([["focus", I.pin, "Focus route"], ["world", I.globe, "World view"]] as const).map(([v, icon, label]) => (
                    <button key={v} type="button" aria-pressed={view === v} aria-label={label} title={label}
                      onClick={() => { animateNext.current = true; setView(v); setFocused(null); writeURL(route, v); }}
                      className={`inline-flex h-8 w-8 items-center justify-center ${PRESS}`}
                      style={view === v ? { background: INK, color: LIME } : { color: INK }}>{icon}</button>
                  ))}
                  <span className="mx-0.5 h-4 w-px" style={{ background: "#e4e1ff" }} />
                  <button ref={expandRef} type="button" aria-label={expanded ? "Close expanded map" : "Expand map"} title={expanded ? "Close expanded map" : "Expand map"} aria-expanded={expanded}
                    onClick={() => setExpanded((x) => !x)} className={`inline-flex h-8 w-8 items-center justify-center ${PRESS}`} style={{ color: INK }}>{expanded ? I.close : I.expand}</button>
                </div>
              </div>
              <div ref={mapBoxRef} className="relative min-h-0 flex-1">
                <svg ref={svgRef} viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="group" aria-label={`${L(route.title)}. ${route.stops.map((s) => L(s.name)).join(" → ")}. ${COPY.note}`}>
                  <rect x={-500} y={-300} width={2000} height={1100} fill="#f8f7ff" />
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
                          {wh ? (
                            <>
                              <circle r={13} fill={INK} stroke={current ? LIME : "#fff"} strokeWidth={2} />
                              <path d={WAREHOUSE_D} fill={LIME} transform="translate(-8,-8) scale(0.667)" />
                              <title>{L(s.name)}</title>
                            </>
                          ) : (
                            <>
                              <circle r={last ? 13 : 10} fill={last ? LIME : "#fff"} stroke={INK} strokeWidth={last ? 2 : 1.5} />
                              <text textAnchor="middle" dominantBaseline="central" y={0.5} fontSize={last ? 11 : 9} fontWeight={700} fill={INK}>{i + 1}</text>
                            </>
                          )}
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
                {view === "world" && <p className="wf-sub pointer-events-none absolute inset-x-0 bottom-24 text-center text-[9px] font-bold" style={{ color: "#686879" }}>Select a country to explore routes</p>}
              </div>
              {/* route preview: floating chip with leg progress */}
              <div className="absolute inset-x-3 bottom-3 z-10 flex items-center gap-3 bg-white/90 px-4 py-3 backdrop-blur" style={chamfer(14, "br")}>
                <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center" style={{ background: INK, color: LIME }}>{modeIcon(leg.mode, "h-5 w-5")}</span>
                <div className="min-w-0 flex-1">
                  <p className={LABEL} style={{ color: "#686879" }}>Route preview</p>
                  <strong data-leg-name className="mt-0.5 block truncate text-sm font-semibold" style={{ color: INK }}>{first(leg.from)} — {first(leg.to)}</strong>
                </div>
                <span className="text-xs tabular-nums" style={{ color: "#4b4b66" }}><b style={{ color: INK }}>{String(legIndex + 1).padStart(2, "0")}</b> / {String(route.legs.length).padStart(2, "0")}</span>
                <span aria-hidden="true" className="absolute inset-x-0 bottom-0 h-[2px] origin-left transition-transform duration-300 ease-out" style={{ background: PURPLE, transform: `scaleX(${pct / 100})` }} />
              </div>
            </div>

            {/* transport modes: one bar */}
            <div className={`mt-3 flex items-stretch bg-white p-1 ${SURFACE}`} style={chamfer(14, "br")}>
              <div className="grid flex-1 grid-cols-4 gap-1">
                {MODES.map((m) => {
                  const on = route.mode === m.key;
                  return (
                    <button key={m.key} type="button" aria-pressed={on} onClick={() => selectMode(m.key)}
                      className={`relative flex min-h-[56px] items-center justify-center gap-2.5 px-2 text-left sm:justify-start sm:px-3 ${PRESS} ${on ? "" : "[@media(hover:hover)]:hover:bg-[#f3f2fd]"}`}
                      style={on ? { background: INK, color: "#fff" } : { color: INK }}>
                      <span style={{ color: on ? LIME : PURPLE }}><m.Icon className="h-5 w-5 shrink-0" /></span>
                      <span className="hidden min-w-0 sm:block">
                        <span className="block text-xs font-semibold">{m.label}</span>
                        <small className="block truncate text-[10px] leading-tight opacity-70">{m.sub}</small>
                      </span>
                    </button>
                  );
                })}
              </div>
              <span className="mx-1 w-px self-stretch" style={{ background: "#ecebf8" }} />
              <button type="button" aria-pressed={playing} aria-label={motionLabel} onClick={() => setPaused((p) => !p)}
                className={`inline-flex w-12 items-center justify-center ${PRESS} [@media(hover:hover)]:hover:bg-[#f3f2fd]`} style={{ color: PURPLE }}>
                {playing ? I.pause : I.play}
              </button>
            </div>

            {warehouses.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center gap-3 px-1">
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

          {/* ================= route-console ================= */}
          <section id="route-explorer" aria-labelledby="route-title" className={`min-w-0 bg-white p-6 md:p-9 ${SURFACE}`} style={chamfer(28, "tr")}>
            <p className={LABEL} style={{ color: PURPLE }}>Explore your route</p>
            <h3 id="route-title" className="mt-3 text-[28px] leading-tight md:text-[34px]" style={{ color: INK, fontFamily: '"Loos Wide", Inter, sans-serif', fontWeight: 500, letterSpacing: "-0.02em" }}>{A(L(route.title))}</h3>

            <div ref={searchRef} className="relative mt-7">
              <label htmlFor="route-country-search" className={LABEL} style={{ color: "#686879" }}>{route.options.direction === "export" ? "Where are we delivering?" : "Where are we starting?"}</label>
              <div className="relative mt-2.5 flex items-center gap-3 bg-[#f3f2fd] px-4 ring-1 ring-inset ring-transparent transition-[box-shadow,background-color] duration-150 focus-within:bg-white focus-within:ring-brand-500" style={{ color: "#686879" }}>
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
                  className="min-h-12 w-full bg-transparent text-sm outline-none placeholder:text-[#9a99b3] [&::-webkit-search-cancel-button]:hidden" style={{ color: INK }} />
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
              <p data-caption className="mt-2.5 text-xs leading-5" style={{ color: "#686879" }}>{A(caption)}</p>
            </div>

            {route.mode === "air" && (
              <div className="mt-5 flex items-center gap-3 px-4 py-3" style={{ background: INK, ...chamfer(12, "br") }}>
                <span style={{ color: LIME }}><IconPlane className="h-5 w-5" /></span>
                <div><strong className="wf-sub block text-[10px]" style={{ color: "#fff" }}>Worldwide coverage</strong><span className="text-xs" style={{ color: "#c9c5ff" }}>To and from Georgia</span></div>
              </div>
            )}

            <details className="group/regions mt-6 border-y" style={{ borderColor: "#ecebf8" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                <span className={LABEL} style={{ color: INK }}>Browse regions & corridors</span>
                <span className="transition-transform duration-200 ease-out group-open/regions:rotate-180" style={{ color: PURPLE }}>{I.caret}</span>
              </summary>
              <div role="group" aria-label="Select a country or region" className="flex flex-wrap gap-1.5 pb-5">
                {regionButtons.map((r) => (
                  <button key={r.id} type="button" aria-pressed={r.id === region} onClick={() => { selectRegion(r.id); scrollToMap(); }}
                    className={`rounded-full px-3 py-1.5 text-xs ${PRESS} ${r.id === region ? "" : "[@media(hover:hover)]:hover:bg-[#e9e6fc]"}`}
                    style={r.id === region ? { background: INK, color: "#fff" } : { background: "#f3f2fd", color: INK }}>
                    {L(r.label)}{r.transit && route.mode !== "air" ? <small className="ml-1 opacity-60">Transit</small> : null}
                  </button>
                ))}
              </div>
            </details>

            <label className="mt-6 block">
              <span className={LABEL} style={{ color: "#686879" }}>Choose a corridor</span>
              <span className="relative mt-2.5 block">
                <select id="route-family" value={route.id} onChange={(e) => selectRoute(e.target.value)} className={`${FIELD} pr-10 font-semibold`} style={{ color: INK }}>
                  {engine.families.filter((f) => f.mode === route.mode).map((f) => <option key={f.id} value={f.id}>{L(f.label)}</option>)}
                </select>
                <Caret />
              </span>
            </label>

            {segFields.length > 0 && (
              <div className="mt-6 flex flex-wrap gap-x-5 gap-y-5">
                {segFields.map((f) => (
                  <fieldset key={f.key} className="min-w-0">
                    <legend className={LABEL} style={{ color: "#686879" }}>{L(f.label)}</legend>
                    <div role="group" aria-label={L(f.label)} className="mt-2.5 inline-flex flex-wrap gap-1 bg-[#f3f2fd] p-1">
                      {f.options.map((o) => {
                        const on = route.options[f.key] === o.id;
                        return (
                          <button key={o.id} type="button" aria-pressed={on} onClick={() => setOption(f.key, o.id)}
                            className={`px-4 py-2.5 text-xs ${PRESS}`}
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
              <label key={f.key} className="mt-6 block">
                <span className={LABEL} style={{ color: "#686879" }}>{L(f.label)}</span>
                <span className="relative mt-2.5 block max-w-xs">
                  <select data-route-field={f.key} aria-label={L(f.label)} value={route.options[f.key]} onChange={(e) => setOption(f.key, e.target.value)} className={`${FIELD} pr-10`} style={{ color: INK }}>
                    {f.options.map((o) => <option key={o.id} value={o.id}>{L(o.label)}</option>)}
                  </select>
                  <Caret />
                </span>
              </label>
            ))}
            {cardFields.map((f) => (
              <fieldset key={f.key} className="mt-6">
                <legend className={LABEL} style={{ color: "#686879" }}>{L(f.label)}</legend>
                <div role="group" aria-label={L(f.label)} className="mt-2.5 grid gap-2 sm:grid-cols-3">
                  {f.options.map((o, i) => {
                    const on = route.options[f.key] === o.id;
                    return (
                      <button key={o.id} type="button" aria-pressed={on} onClick={() => setOption(f.key, o.id)}
                        className={`relative flex flex-col p-4 text-left ${PRESS} ${on ? "" : "[@media(hover:hover)]:hover:bg-[#ecebfc]"}`}
                        style={on ? { background: "#fff", boxShadow: `inset 0 0 0 2px ${PURPLE}` } : { background: "#f3f2fd" }}>
                        <span className="wf-sub text-[10px] font-bold tabular-nums" style={{ color: on ? PURPLE : "#a3a2bd" }}>{String(i + 1).padStart(2, "0")}</span>
                        <strong className="mt-2 block pr-5 text-[13px] font-semibold leading-snug" style={{ color: INK }}>{A(L(o.label))}</strong>
                        {o.description && <small className="mt-1.5 block text-[11px] leading-5" style={{ color: "#686879" }}>{A(L(o.description))}</small>}
                        <span className={`absolute right-3 top-3 transition-[opacity,transform] duration-200 ease-out ${on ? "scale-100 opacity-100" : "scale-90 opacity-0"}`} style={{ color: PURPLE }}>{I.check}</span>
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            ))}

            <div className="mt-6 flex items-start gap-3 p-4" style={{ background: "#f8f7ff" }}>
              {route.load && <span className="wf-sub shrink-0 px-2 py-1 text-[10px] font-bold" style={{ background: LIME, color: INK }}>{route.mode === "rail" ? "Rail " : ""}{route.load}</span>}
              <p data-details className="text-xs leading-5" style={{ color: "#4b4b66" }}>{A(L(route.details))}</p>
            </div>

            <details className="group/stages mt-6 border-t" style={{ borderColor: "#ecebf8" }}>
              <summary className="flex cursor-pointer list-none items-center justify-between py-4 [&::-webkit-details-marker]:hidden">
                <span className={LABEL} style={{ color: INK }}>Route stages · {route.stops.length}</span>
                <span className="transition-transform duration-200 ease-out group-open/stages:rotate-180" style={{ color: PURPLE }}>{I.caret}</span>
              </summary>
              <div className="flex gap-1.5">
                <button type="button" onClick={() => { elapsed.current = 0; setPaused(false); draw(); }} className={`inline-flex items-center gap-2 bg-[#f3f2fd] px-3 py-2 text-xs ${PRESS}`} style={{ color: INK }}>{I.replay}Replay route</button>
                <button type="button" aria-pressed={playing} aria-label={motionLabel} onClick={() => setPaused((p) => !p)} className={`inline-flex items-center justify-center bg-[#f3f2fd] px-3 py-2 ${PRESS}`} style={{ color: PURPLE }}>{playing ? I.pause : I.play}</button>
              </div>
              <ol className="relative mt-5 flex gap-3 overflow-x-auto pb-4">
                {route.stops.map((s, i) => {
                  const cur = i === legIndex, done = i < legIndex;
                  return (
                    <li key={i} className="min-w-[128px] flex-1">
                      <button type="button" aria-label={`${i + 1}. ${L(s.name)}`} aria-current={cur ? "step" : undefined} onClick={() => { focusRouteStop(i); scrollToMap(); }} className="group w-full text-left">
                        <span className="flex items-center">
                          <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold tabular-nums transition-[background-color,color,box-shadow] duration-200 ease-out"
                            style={cur ? { background: PURPLE, color: "#fff", boxShadow: `0 0 0 4px ${PURPLE}22` } : done ? { background: INK, color: LIME } : { background: "#f3f2fd", color: "#686879" }}>{String(i + 1).padStart(2, "0")}</span>
                          {i < route.stops.length - 1 && <span className="ml-2 h-[2px] flex-1 transition-colors duration-300" style={{ background: done ? INK : "#ecebf8" }} />}
                        </span>
                        <strong className="mt-3 block text-[13px] font-semibold leading-snug" style={{ color: INK }}>{L(s.name)}</strong>
                        {s.kind && <em className="mt-0.5 block text-[11px] not-italic" style={{ color: PURPLE }}>{COPY[s.kind]}</em>}
                        {i < route.legs.length
                          ? <small className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]" style={{ color: "#686879" }}>{modeIcon(route.legs[i].mode, "h-3.5 w-3.5")}{COPY[route.legs[i].mode]}</small>
                          : <small className="mt-1.5 inline-flex items-center gap-1.5 text-[11px]" style={{ color: "#686879" }}>{I.check}{COPY[route.mode === "air" && route.options.direction === "export" ? "arrival" : "gateway"]}</small>}
                      </button>
                    </li>
                  );
                })}
              </ol>
            </details>

            <div className="mt-3 flex items-center gap-4">
              <input id="route-progress" ref={progressRef} type="range" min={0} max={100} step={0.1} defaultValue={0} aria-label="Preview progress"
                onInput={(e) => { setPaused(true); elapsed.current = Math.min(total - 0.001, (total * Number((e.target as HTMLInputElement).value)) / 100); draw(); }}
                className="wf-range h-1 w-full cursor-pointer appearance-none bg-[#ecebf8] accent-brand-500" />
              <output ref={outputRef} htmlFor="route-progress" className="w-10 text-right text-xs tabular-nums" style={{ color: "#4b4b66" }}>0%</output>
            </div>
            <p id="route-note" className="mt-6 text-[11px] leading-5" style={{ color: "#8a89a3" }}>{COPY.note}{route.mode === "air" ? " " + COPY.airNote : ""}</p>
          </section>
        </div>
      </div>
    </section>
  );
}
