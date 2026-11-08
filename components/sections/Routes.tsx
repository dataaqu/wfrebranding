"use client";

import { cloneElement, memo, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Reveal, IconPlane, IconShip, IconTrain, IconTruck } from "@/components/brand/design-system";
import { L, loadRoutesEngine, project, type CountryShape, type Leg, type Place, type Route, type RoutesEngine } from "@/lib/routes-engine";

/* Route explorer — ported from weforward-brand-concept (#route-explorer).
   The corridor engine (window.WF_ROUTES) is the concept's own code, loaded unchanged from /public/routes-engine;
   this file is the React UI + SVG map around it. Corridors are illustrative, not live shipments. */

type ModeKey = "road" | "sea" | "rail" | "air";
const MODES: { key: ModeKey; label: string; sub: string; Icon: (p: { className?: string }) => React.ReactElement }[] = [
  { key: "road", label: "Road", sub: "FTL / LTL", Icon: IconTruck },
  { key: "sea", label: "Sea", sub: "FCL / LCL", Icon: IconShip },
  { key: "rail", label: "Rail", sub: "FCL / LCL", Icon: IconTrain },
  { key: "air", label: "Air", sub: "Cargo / Express", Icon: IconPlane },
];
const LEG_LABEL: Record<string, string> = { road: "Road", sea: "Sea", rail: "Rail", air: "Air corridor", ferry: "Ferry crossing", connection: "Gateway connection" };
const KIND_LABEL: Record<string, string> = { warehouse: "Warehouse intake", terminal: "Rail loading terminal" };
const DASHED = new Set(["ferry", "sea", "connection"]);
const NOTE = "Illustrative corridors. Connections and availability are confirmed for each shipment.";
const AIR_NOTE = " Air corridors show representative origins, not direct-flight schedules.";

const INK = "#04042b", PURPLE = "#644ff2", LIME = "#d5f476";

/* ---------- geometry ---------- */
type Built = { leg: Leg; d: string; pts: [number, number][]; cum: number[]; length: number; duration: number; start: number };

function legGeometry(leg: Leg) {
  const a = leg.points.map(project);
  if (leg.arc) {
    const p0 = a[0], p2 = a[a.length - 1];
    const c: [number, number] = [(p0[0] + p2[0]) / 2, Math.min(p0[1], p2[1]) - leg.arc];
    const pts: [number, number][] = [];
    for (let i = 0; i <= 40; i++) {
      const t = i / 40;
      pts.push([(1 - t) ** 2 * p0[0] + 2 * (1 - t) * t * c[0] + t * t * p2[0], (1 - t) ** 2 * p0[1] + 2 * (1 - t) * t * c[1] + t * t * p2[1]]);
    }
    return { d: `M${p0} Q${c} ${p2}`, pts };
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

function focusBox(route: Route, focused: number | null, aspect: number): [number, number, number, number] {
  const legs = focused === null ? route.legs : [route.legs[Math.min(focused, route.legs.length - 1)]];
  const pts = legs.flatMap((l) => legGeometry(l).pts);
  const xs = pts.map((p) => p[0]), ys = pts.map((p) => p[1]);
  const padX = 0.12, padY = 0.16;
  let w = Math.max(50, (Math.max(...xs) - Math.min(...xs)) / (1 - 2 * padX));
  let h = Math.max(38, (Math.max(...ys) - Math.min(...ys)) / (1 - 2 * padY));
  if (w / h < aspect) w = h * aspect; else h = w / aspect;
  const cx = (Math.min(...xs) + Math.max(...xs)) / 2, cy = (Math.min(...ys) + Math.max(...ys)) / 2;
  return [cx - w / 2, cy - h / 2, w, h];
}

/* ---------- small icons ---------- */
const I = {
  pin: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 2a7 7 0 0 0-7 7c0 5.2 7 13 7 13s7-7.8 7-13a7 7 0 0 0-7-7zm0 9.5A2.5 2.5 0 1 1 12 6.5a2.5 2.5 0 0 1 0 5z" /></svg>,
  globe: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>,
  expand: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>,
  close: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M6 6l12 12M18 6L6 18" /></svg>,
  search: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>,
  chevron: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>,
  check: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>,
  play: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M8 5v14l11-7z" /></svg>,
  pause: <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M7 5h4v14H7zM13 5h4v14h-4z" /></svg>,
  warehouse: <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M12 3 2 8v13h4v-9h12v9h4V8zM8 14h8v2H8zm0 3h8v2H8z" /></svg>,
};
const modeIcon = (m: string, cls = "h-5 w-5") => {
  const k = m === "ferry" ? "sea" : m === "connection" ? "sea" : m;
  const M = MODES.find((x) => x.key === k)?.Icon ?? IconTruck;
  return <M className={cls} />;
};
/** Same icon, sized with SVG attributes for use inside the map's <svg> (CSS sizing doesn't apply there). */
const mapIcon = (m: string, size: number) => {
  const k = m === "ferry" || m === "connection" ? "sea" : m;
  const M = MODES.find((x) => x.key === k)?.Icon ?? IconTruck;
  return cloneElement(M({}), { className: undefined, width: size, height: size, x: -size / 2, y: -size / 2 });
};

/* ---------- map layers ---------- */
const Countries = memo(function Countries({ shapes, state, onPick }: { shapes: CountryShape[]; state: (c: CountryShape) => "selected" | "enabled" | "off"; onPick: (id: string) => void }) {
  return (
    <g>
      {shapes.map((c) => {
        const s = state(c);
        return (
          <path
            key={c.id}
            d={c.d}
            vectorEffect="non-scaling-stroke"
            fill={s === "selected" ? "#8573f6" : s === "enabled" ? "#b9b0fb" : "#dcd8fd"}
            stroke="#f6f5ff"
            strokeWidth={0.8}
            style={{ cursor: s === "off" ? "default" : "pointer", transition: "fill 300ms" }}
            onClick={s === "off" ? undefined : () => onPick(c.id)}
          >
            <title>{c.name}</title>
          </path>
        );
      })}
    </g>
  );
});

export default function Routes() {
  const [engine, setEngine] = useState<RoutesEngine | null>(null);
  const [shapes, setShapes] = useState<CountryShape[]>([]);
  const [route, setRoute] = useState<Route | null>(null);
  const [region, setRegion] = useState<string | null>(null);
  const [view, setView] = useState<"focus" | "world">("focus");
  const [focused, setFocused] = useState<number | null>(null);
  const [expanded, setExpanded] = useState(false);
  const [playing, setPlaying] = useState(true);
  const [legIndex, setLegIndex] = useState(0);
  const [query, setQuery] = useState("");
  const [searchOpen, setSearchOpen] = useState(false);
  const [regionsOpen, setRegionsOpen] = useState(false);
  const [stagesOpen, setStagesOpen] = useState(false);
  const familyMemory = useRef<Record<string, Record<string, string>>>({});
  const modeMemory = useRef<Record<string, string>>({});

  // map refs (animated imperatively — the country layer never re-renders per frame)
  const svgRef = useRef<SVGSVGElement>(null);
  const mapBoxRef = useRef<HTMLDivElement>(null);
  const vehicleRef = useRef<SVGGElement>(null);
  const trailRefs = useRef<(SVGPathElement | null)[]>([]);
  const stopRefs = useRef<(SVGGElement | null)[]>([]);
  const progressRef = useRef<HTMLInputElement>(null);
  const outputRef = useRef<HTMLOutputElement>(null);
  const camera = useRef<[number, number, number, number]>([0, 0, 1000, 500]);
  const scale = useRef(1);
  const elapsed = useRef(0);
  const inView = useRef(false);
  const sectionRef = useRef<HTMLElement>(null);

  /* load the engine */
  useEffect(() => {
    let alive = true;
    loadRoutesEngine().then(({ engine, shapes }) => {
      if (!alive) return;
      setEngine(engine);
      setShapes(shapes.filter((s) => s.id !== "ATA"));
      const r = engine.build(engine.families[0].id, {});
      setRoute(r);
      setRegion(r.region);
    });
    return () => { alive = false; };
  }, []);

  const geometry = useMemo(() => (route ? buildGeometry(route) : []), [route]);
  const total = useMemo(() => geometry.reduce((s, b) => s + b.duration, 0) || 1, [geometry]);

  /* ---------- selection ---------- */
  const select = useCallback((id: string, values: Record<string, string> = {}, regionOverride: string | null = null) => {
    if (!engine) return;
    const r = engine.build(id, values);
    familyMemory.current[r.id] = r.options;
    modeMemory.current[r.mode] = r.id;
    elapsed.current = 0;
    setRoute(r);
    setRegion(regionOverride || r.region);
    setView("focus");
    setFocused(null);
    setLegIndex(0);
  }, [engine]);

  const selectCountry = useCallback((id: string) => {
    if (!engine || !route) return;
    const next = engine.forCountry(id, route.mode, route.options);
    if (next) select(next.id, { ...next.values, direction: route.options.direction || "import" });
    setQuery("");
    setSearchOpen(false);
  }, [engine, route, select]);

  const selectRegion = (rid: string) => {
    if (!engine || !route) return;
    const next = engine.forRegion(rid, route.mode);
    select(next.id, { ...(familyMemory.current[next.id] || {}), ...next.values }, rid);
  };

  const selectMode = (key: ModeKey) => {
    if (!engine || !route || key === route.mode) return;
    if (route.country && (key === "air" || key === "sea")) {
      const next = engine.forCountry(route.country, key);
      if (next) return select(next.id, next.values);
    }
    const chosen = engine.forRegion(region || route.region, key);
    const fam = engine.families.find((f) => f.id === chosen.id && f.mode === key);
    if (fam) return select(fam.id, { ...(familyMemory.current[fam.id] || {}), ...chosen.values });
    const fallback = engine.families.find((f) => f.id === modeMemory.current[key]) || engine.families.find((f) => f.mode === key)!;
    select(fallback.id, familyMemory.current[fallback.id] || {});
  };

  const setField = (key: string, value: string) => route && select(route.id, { ...route.options, [key]: value }, region);

  const focusStop = (i: number) => {
    setPlaying(false);
    setView("focus");
    setFocused(i);
    elapsed.current = i >= geometry.length ? total - 0.001 : geometry[i].start;
    draw();
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
    if (progressRef.current) progressRef.current.value = pct.toFixed(1);
    if (outputRef.current) outputRef.current.textContent = Math.round(pct) + "%";
    setLegIndex((prev) => (prev === idx ? prev : idx));
  }, [geometry, total]);

  const applyCamera = useCallback((box: [number, number, number, number]) => {
    const svg = svgRef.current, host = mapBoxRef.current;
    if (!svg || !host) return;
    camera.current = box;
    svg.setAttribute("viewBox", box.map((n) => n.toFixed(3)).join(" "));
    const s = Math.max(box[2] / (host.clientWidth || 1), box[3] / (host.clientHeight || 1));
    scale.current = s;
    trailRefs.current.forEach((tr) => tr?.setAttribute("stroke-width", String(3.2 * s)));
    stopRefs.current.forEach((g, i) => {
      if (!g || !route) return;
      const p = project(route.stops[i].point);
      const hide = view === "world" && i > 0 && i < route.stops.length - 1 && route.stops[i].kind !== "warehouse";
      g.style.display = hide ? "none" : "";
      g.setAttribute("transform", `translate(${p[0]},${p[1]}) scale(${s})`);
    });
    draw();
  }, [route, view, draw]);

  /* camera: animate the viewBox to the focus/world box */
  useLayoutEffect(() => {
    const host = mapBoxRef.current;
    if (!route || !host) return;
    let raf = 0;
    const fit = (animate: boolean) => {
      const aspect = (host.clientWidth || 1) / (host.clientHeight || 1);
      let target: [number, number, number, number];
      if (view === "world") {
        let w = 1000, h = 500;
        if (w / h < aspect) w = h * aspect; else h = w / aspect;
        target = [500 - w / 2, 250 - h / 2, w, h];
      } else target = focusBox(route, focused, aspect);
      cancelAnimationFrame(raf);
      if (!animate || matchMedia("(prefers-reduced-motion: reduce)").matches) return applyCamera(target);
      const from = camera.current.slice() as typeof target, t0 = performance.now();
      const step = (now: number) => {
        const k = Math.min(1, (now - t0) / 720), ease = 1 - Math.pow(1 - k, 4);
        applyCamera(target.map((v, i) => from[i] + (v - from[i]) * ease) as typeof target);
        if (k < 1) raf = requestAnimationFrame(step);
      };
      raf = requestAnimationFrame(step);
    };
    fit(true);
    const ro = new ResizeObserver(() => fit(false));
    ro.observe(host);
    return () => { cancelAnimationFrame(raf); ro.disconnect(); };
  }, [route, view, focused, expanded, applyCamera]);

  /* play loop — only while on screen */
  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return;
    const io = new IntersectionObserver(([en]) => { inView.current = en.isIntersecting; }, { rootMargin: "100px" });
    io.observe(el);
    return () => io.disconnect();
  }, []);
  useEffect(() => {
    if (!playing || !geometry.length || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    let raf = 0, last: number | null = null;
    const tick = (now: number) => {
      raf = requestAnimationFrame(tick);
      if (!inView.current || document.hidden) { last = null; return; }
      const dt = last === null ? 0 : Math.min((now - last) / 1000, 0.1);
      last = now;
      elapsed.current = (elapsed.current + dt) % total;
      draw();
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [playing, geometry, total, draw]);

  /* ---------- derived UI data ---------- */
  const countryState = useCallback((c: CountryShape): "selected" | "enabled" | "off" => {
    if (!engine || !route) return "off";
    if (route.country ? c.id === route.country : c.region === region) return "selected";
    return engine.countryAvailable(c.id, route.mode, route.options) ? "enabled" : "off";
  }, [engine, route, region]);

  const results = useMemo(() => {
    if (!engine || !route || !query.trim()) return [];
    const q = query.trim().toLowerCase();
    return engine.countries.filter((c) => L(c.label).toLowerCase().includes(q) && engine.countryAvailable(c.id, route.mode, route.options)).slice(0, 8);
  }, [engine, route, query]);

  const regions = useMemo(() => {
    if (!engine || !route) return [];
    return engine.regions.filter((r) => route.mode === "air" || route.mode === "sea" || engine.families.some((f) => f.region === r.id && f.mode === route.mode));
  }, [engine, route]);

  if (!engine || !route) {
    return <section id="routes" ref={sectionRef} className="min-h-[900px]" style={{ background: "#f8f7ff" }} aria-busy="true" />;
  }

  const leg = route.legs[Math.min(legIndex, route.legs.length - 1)];
  const warehouses = route.stops.map((s, i) => ({ s, i })).filter(({ s }) => s.kind === "warehouse");
  const inlineFields = route.fields.filter((f) => !f.select && !f.cards);
  const blockFields = route.fields.filter((f) => f.select || f.cards);
  const short = (p: Place) => L(p.name).split(" · ")[0];

  const map = (
    <div className={`relative flex flex-col overflow-hidden border border-brand-100 ${expanded ? "fixed inset-3 z-[70] md:inset-8" : "h-[560px] md:h-[640px]"}`} style={{ background: "#f6f5ff" }}>
      <div className="relative z-10 flex items-center justify-between px-5 py-4">
        <p className="wf-sub flex items-center gap-2 text-[10px] font-bold" style={{ color: "#373650" }}>
          <span className="inline-block h-1.5 w-1.5 rounded-full" style={{ background: LIME, boxShadow: `0 0 0 3px ${LIME}55` }} /> Connected to Georgia
        </p>
        <div className="flex gap-2">
          {([["focus", I.pin, "Focus route"], ["world", I.globe, "World view"]] as const).map(([v, icon, label]) => (
            <button key={v} type="button" aria-pressed={view === v} aria-label={label} onClick={() => { setView(v); setFocused(null); }}
              className="inline-flex h-10 w-10 items-center justify-center border transition-colors"
              style={view === v ? { background: PURPLE, borderColor: PURPLE, color: "#fff" } : { background: "#fff", borderColor: "#e4e1ff", color: INK }}>{icon}</button>
          ))}
          <button type="button" aria-label={expanded ? "Close expanded map" : "Expand map"} aria-expanded={expanded} onClick={() => setExpanded((x) => !x)}
            className="inline-flex h-10 w-10 items-center justify-center border transition-colors" style={{ background: "#fff", borderColor: "#e4e1ff", color: INK }}>{expanded ? I.close : I.expand}</button>
        </div>
      </div>
      <div ref={mapBoxRef} className="relative min-h-0 flex-1">
        <svg ref={svgRef} viewBox="0 0 1000 500" preserveAspectRatio="xMidYMid meet" className="absolute inset-0 h-full w-full" role="img" aria-label={`${L(route.title)}: ${route.stops.map((s) => L(s.name)).join(" → ")}`}>
          <rect x={-2000} y={-1000} width={5000} height={3000} fill="#f6f5ff" />
          <Countries shapes={shapes} state={countryState} onPick={selectCountry} />
          {/* route */}
          {geometry.map((b, i) => (
            <path key={"base" + i} d={b.d} fill="none" stroke={PURPLE} strokeOpacity={0.55} strokeWidth={2} vectorEffect="non-scaling-stroke" strokeDasharray={DASHED.has(b.leg.mode) ? "6 6" : undefined} strokeLinecap="round" />
          ))}
          {geometry.map((b, i) => (
            <path key={"trail" + route.id + i} ref={(el) => { trailRefs.current[i] = el; }} d={b.d} fill="none" stroke={DASHED.has(b.leg.mode) ? INK : PURPLE} pathLength={1} strokeDasharray="0 1" strokeLinecap="round" style={{ opacity: 0 }} />
          ))}
          {/* stops */}
          {route.stops.map((s, i) => {
            const last = i === route.stops.length - 1, wh = s.kind === "warehouse";
            const current = i === legIndex || i === legIndex + 1;
            return (
              <g key={route.id + "s" + i} ref={(el) => { stopRefs.current[i] = el; }} role="button" tabIndex={0} aria-label={L(s.name)} onClick={() => focusStop(i)} onKeyDown={(e) => e.key === "Enter" && focusStop(i)} style={{ cursor: "pointer" }}>
                {wh ? (
                  <>
                    <circle r={13} fill={INK} stroke={current ? LIME : "#fff"} strokeWidth={2} />
                    <path d="M12 3 2 8v13h4v-9h12v9h4V8zM8 14h8v2H8zm0 3h8v2H8z" fill="#fff" transform="translate(-8,-8) scale(0.667)" />
                  </>
                ) : (
                  <>
                    <circle r={last ? 13 : 10} fill={last ? LIME : "#fff"} stroke={INK} strokeWidth={last ? 2 : 1.5} />
                    <text textAnchor="middle" dominantBaseline="central" y={0.5} fontSize={last ? 11 : 9} fontWeight={700} fill={INK}>{i + 1}</text>
                  </>
                )}
                {(i === 0 || last || wh) && (
                  <text y={i === 0 || wh ? -22 : 30} textAnchor="middle" fontSize={12} fontWeight={600} fill={INK} stroke="#f6f5ff" strokeWidth={3} paintOrder="stroke">{short(s)}</text>
                )}
              </g>
            );
          })}
          {/* vehicle */}
          <g ref={vehicleRef} aria-hidden="true">
            <circle r={21} fill={PURPLE} fillOpacity={0.18} />
            <circle r={15} fill={INK} />
            <g style={{ color: "#fff" }}>{mapIcon(leg.mode, 18)}</g>
          </g>
        </svg>
      </div>
      {/* route preview footer */}
      <div className="relative z-10 m-3 flex items-center gap-4 border border-brand-100 bg-white px-4 py-3">
        <span style={{ color: INK }}>{modeIcon(leg.mode, "h-6 w-6")}</span>
        <div className="min-w-0 flex-1">
          <p className="wf-sub text-[9px] font-bold" style={{ color: "#686879" }}>Route preview</p>
          <p className="truncate text-sm font-bold" style={{ color: INK }}>{short(leg.from)} — {short(leg.to)}</p>
        </div>
        <span className="text-xs tabular-nums" style={{ color: "#4b4b66" }}>{String(legIndex + 1).padStart(2, "0")} / {String(route.legs.length).padStart(2, "0")}</span>
      </div>
    </div>
  );

  return (
    <section id="routes" ref={sectionRef} className="relative py-24" style={{ background: "#f8f7ff", color: INK }}>
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal id="routes-head">
            <h2 className="sr-only">Your route. In focus.</h2>
            <div aria-hidden="true">
              <div className="wf-head text-5xl md:text-7xl" style={{ color: INK }}>Your route.</div>
              <div className="wf-head text-5xl md:text-7xl" style={{ color: PURPLE }}>In focus.</div>
            </div>
          </Reveal>
          <p className="max-w-xs text-base leading-7" style={{ color: "#4b4b66" }}>Choose a mode. Explore the corridor. See every stage from warehouse to door.</p>
        </div>

        <div className="mt-12 grid gap-6 lg:grid-cols-[1fr_1.05fr]">
          {/* ---------- left: map + modes ---------- */}
          <div className="min-w-0">
            {expanded && <div className="fixed inset-0 z-[65] bg-ink-950/40" onClick={() => setExpanded(false)} aria-hidden="true" />}
            {map}
            <div className="mt-3 grid grid-cols-[repeat(4,minmax(0,1fr))_auto] gap-2">
              {MODES.map((m) => {
                const on = route.mode === m.key;
                return (
                  <button key={m.key} type="button" aria-pressed={on} onClick={() => selectMode(m.key)}
                    className="flex min-h-[64px] items-center gap-2.5 border px-3 text-left transition-colors"
                    style={on ? { background: PURPLE, borderColor: PURPLE, color: "#fff" } : { background: "#fff", borderColor: "#e4e1ff", color: INK }}>
                    <m.Icon className="h-5 w-5 shrink-0" />
                    <span className="hidden min-w-0 sm:block">
                      <span className="block text-xs font-bold">{m.label}</span>
                      <span className="block whitespace-nowrap text-[10px] leading-tight opacity-80">{m.sub}</span>
                    </span>
                  </button>
                );
              })}
              <button type="button" aria-pressed={playing} aria-label={playing ? "Pause route preview" : "Play route preview"} onClick={() => setPlaying((p) => !p)}
                className="inline-flex min-h-[64px] w-14 items-center justify-center border transition-colors" style={{ background: "#fff", borderColor: "#e4e1ff", color: PURPLE }}>
                {playing ? I.pause : I.play}
              </button>
            </div>
            {warehouses.length > 0 && (
              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 border border-brand-100 bg-white px-4 py-3">
                <p className="text-xs" style={{ color: "#4b4b66" }}>Consolidation stops</p>
                <div className="flex flex-wrap gap-2">
                  {warehouses.map(({ s, i }) => (
                    <button key={i} type="button" onClick={() => focusStop(i)} className="inline-flex items-center gap-2 border border-brand-100 px-3 py-2 text-xs font-bold transition-colors hover:border-brand-500" style={{ color: INK }}>
                      {I.warehouse} {short(s)}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ---------- right: console ---------- */}
          <div className="min-w-0 border border-brand-100 bg-white p-6 md:p-8">
            <p className="wf-sub text-[10px] font-bold" style={{ color: PURPLE }}>Explore your route</p>
            <h3 className="mt-2 text-3xl font-bold tracking-tight" style={{ color: INK }}>{L(route.title)}</h3>

            {/* search */}
            <p className="mt-4 text-sm" style={{ color: "#373650" }}>Where are we starting?</p>
            <div className="relative mt-2">
              <div className="flex items-center gap-3 border border-brand-100 px-4 focus-within:border-brand-500" style={{ color: "#686879" }}>
                {I.search}
                <input value={query} onChange={(e) => { setQuery(e.target.value); setSearchOpen(true); }} onFocus={() => setSearchOpen(true)} onBlur={() => setTimeout(() => setSearchOpen(false), 150)}
                  placeholder="Search a country…" aria-label="Search a country" className="min-h-12 w-full bg-transparent text-sm outline-none" style={{ color: INK }} />
                {query && <button type="button" aria-label="Clear search" onClick={() => setQuery("")} style={{ color: PURPLE }}>{I.close}</button>}
              </div>
              {searchOpen && results.length > 0 && (
                <ul role="listbox" className="absolute inset-x-0 top-full z-20 mt-1 max-h-72 overflow-auto border border-brand-100 bg-white shadow-lg">
                  {results.map((c) => (
                    <li key={c.id}>
                      <button type="button" role="option" aria-selected={false} onMouseDown={(e) => e.preventDefault()} onClick={() => selectCountry(c.id)} className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm hover:bg-brand-50" style={{ color: INK }}>
                        <span aria-hidden="true">{engine.flag(c.id)}</span>{L(c.label)}
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            <p className="mt-2 text-xs" style={{ color: "#686879" }}>{L(route.serviceNote) || { air: "Air cargo · to and from any country", rail: "Rail · China → Georgia, FCL & LCL", sea: "Sea · worldwide origins via a regional gateway", road: "Road · FTL & LTL" }[route.mode]}</p>

            {/* regions */}
            <div className="mt-5 border-y border-brand-100">
              <button type="button" aria-expanded={regionsOpen} onClick={() => setRegionsOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-sm font-bold" style={{ color: INK }}>
                Browse regions & corridors <span className={`transition-transform ${regionsOpen ? "rotate-180" : ""}`} style={{ color: PURPLE }}>{I.chevron}</span>
              </button>
              {regionsOpen && (
                <div className="flex flex-wrap gap-2 pb-4">
                  {regions.map((r) => (
                    <button key={r.id} type="button" aria-pressed={r.id === region} onClick={() => selectRegion(r.id)} className="border px-3 py-1.5 text-xs font-bold transition-colors"
                      style={r.id === region ? { background: PURPLE, borderColor: PURPLE, color: "#fff" } : { borderColor: "#e4e1ff", color: INK }}>{L(r.label)}</button>
                  ))}
                </div>
              )}
            </div>

            {/* corridor */}
            <label className="mt-5 block text-sm" style={{ color: "#373650" }}>Choose a corridor
              <select value={route.id} onChange={(e) => select(e.target.value, familyMemory.current[e.target.value] || {})} className="mt-2 min-h-12 w-full border border-brand-100 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500" style={{ color: INK }}>
                {engine.families.filter((f) => f.mode === route.mode).map((f) => <option key={f.id} value={f.id}>{L(f.label)}</option>)}
              </select>
            </label>

            {/* segmented fields side by side (direction, shipment type…) */}
            {inlineFields.length > 0 && (
              <div className="mt-5 flex flex-wrap gap-x-6 gap-y-4">
                {inlineFields.map((f) => (
                  <fieldset key={f.key}>
                    <legend className="text-sm" style={{ color: "#373650" }}>{L(f.label)}</legend>
                    <div className="mt-2 inline-flex flex-wrap gap-1 border border-brand-100 p-1">
                      {f.options.map((o) => {
                        const on = route.options[f.key] === o.id;
                        const lime = f.key === "load" && on;
                        return (
                          <button key={o.id} type="button" aria-pressed={on} onClick={() => setField(f.key, o.id)} className="px-4 py-2.5 text-xs font-bold transition-colors"
                            style={lime ? { background: LIME, color: INK } : on ? { background: PURPLE, color: "#fff" } : { color: "#4b4b66" }}>{L(o.label)}</button>
                        );
                      })}
                    </div>
                  </fieldset>
                ))}
              </div>
            )}

            {/* selects and route cards */}
            {blockFields.map((f) =>
              f.select ? (
                <label key={f.key} className="mt-5 block text-sm" style={{ color: "#373650" }}>{L(f.label)}
                  <select value={route.options[f.key]} onChange={(e) => setField(f.key, e.target.value)} className="mt-2 block min-h-12 w-full max-w-xs border border-brand-100 bg-white px-4 text-sm font-bold outline-none focus:border-brand-500" style={{ color: INK }}>
                    {f.options.map((o) => <option key={o.id} value={o.id}>{L(o.label)}</option>)}
                  </select>
                </label>
              ) : (
                <fieldset key={f.key} className="mt-5">
                  <legend className="text-sm" style={{ color: "#373650" }}>{L(f.label)}</legend>
                  <div className="mt-2 grid gap-2 sm:grid-cols-3">
                    {f.options.map((o) => {
                      const on = route.options[f.key] === o.id;
                      return (
                        <button key={o.id} type="button" aria-pressed={on} onClick={() => setField(f.key, o.id)} className="relative border p-3 text-left transition-colors"
                          style={on ? { borderColor: PURPLE, boxShadow: `inset 0 0 0 1px ${PURPLE}`, background: "#f8f7ff" } : { borderColor: "#e4e1ff", background: "#fbfaff" }}>
                          <span className="block pr-6 text-xs font-bold" style={{ color: INK }}>{L(o.label)}</span>
                          {o.description && <span className="mt-2 block text-xs leading-5" style={{ color: "#686879" }}>{L(o.description)}</span>}
                          {on && <span className="absolute right-2.5 top-2.5" style={{ color: PURPLE }}>{I.check}</span>}
                        </button>
                      );
                    })}
                  </div>
                </fieldset>
              ),
            )}

            {/* details */}
            <div className="mt-5 flex items-start gap-3 border-t border-brand-100 pt-4">
              {route.load && <span className="shrink-0 px-2.5 py-1.5 text-[11px] font-bold" style={{ background: LIME, color: INK }}>{route.mode === "rail" ? "Rail " : ""}{route.load}</span>}
              <p className="text-xs leading-5" style={{ color: "#4b4b66" }}>{route.notice ? L(route.notice) + " " : ""}{L(route.details)}</p>
            </div>

            {/* stages */}
            <div className="mt-4 border-t border-brand-100">
              <button type="button" aria-expanded={stagesOpen} onClick={() => setStagesOpen((o) => !o)} className="flex w-full items-center justify-between py-4 text-sm font-bold" style={{ color: INK }}>
                Route stages · {route.stops.length} <span className={`transition-transform ${stagesOpen ? "rotate-180" : ""}`} style={{ color: PURPLE }}>{I.chevron}</span>
              </button>
              {stagesOpen && (
                <ol className="space-y-1 pb-3">
                  {route.stops.map((s, i) => {
                    const cur = i === legIndex, done = i < legIndex;
                    return (
                      <li key={i}>
                        <button type="button" onClick={() => focusStop(i)} aria-current={cur ? "step" : undefined} className="flex w-full items-center gap-3 px-2 py-2 text-left text-xs transition-colors hover:bg-brand-50" style={{ background: cur ? "#f1efff" : undefined }}>
                          <span className="w-6 font-bold tabular-nums" style={{ color: done || cur ? PURPLE : "#a99bff" }}>{String(i + 1).padStart(2, "0")}</span>
                          <span className="min-w-0 flex-1">
                            <span className="block truncate font-bold" style={{ color: INK }}>{L(s.name)}</span>
                            {s.kind && <em className="not-italic" style={{ color: "#686879" }}>{KIND_LABEL[s.kind]}</em>}
                          </span>
                          <span className="inline-flex items-center gap-1.5" style={{ color: "#4b4b66" }}>
                            {i < route.legs.length ? <>{modeIcon(route.legs[i].mode, "h-4 w-4")}{LEG_LABEL[route.legs[i].mode]}</> : <>{I.check}{route.options.direction === "export" ? "Arrival" : "Georgia"}</>}
                          </span>
                        </button>
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            {/* scrubber */}
            <div className="mt-2 flex items-center gap-4">
              <input ref={progressRef} type="range" min={0} max={100} step={0.1} defaultValue={0} aria-label="Preview progress"
                onChange={(e) => { setPlaying(false); elapsed.current = (Number(e.target.value) / 100) * total * 0.9999; draw(); }}
                className="h-1.5 w-full cursor-pointer appearance-none bg-brand-100 accent-brand-500" />
              <output ref={outputRef} className="w-10 text-right text-xs tabular-nums" style={{ color: "#4b4b66" }}>0%</output>
            </div>
            <p className="mt-5 text-[11px]" style={{ color: "#686879" }}>{NOTE}{route.mode === "air" ? AIR_NOTE : ""}</p>
          </div>
        </div>
      </div>
    </section>
  );
}
