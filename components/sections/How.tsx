"use client";

import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { chamfer, Reveal, IconContainer } from "@/components/brand/design-system";
import { ROUTE_MODES, ROUTES, WAREHOUSES } from "@/data/landing";

export default function How() {
  const reduce = useReducedMotion();
  const [routeMode, setRouteMode] = useState("road");
  const [overland, setOverland] = useState("aktau");
  const [load, setLoad] = useState(1);
  const [warehouse, setWarehouse] = useState("Yiwu");
  const [stage, setStage] = useState(2);
  const routeKey = routeMode === "road" ? `road-${overland}` : routeMode;
  const route = ROUTES[routeKey];
  const stageIdx = Math.min(stage, route.stops.length - 1);
  const ModeIcon = ROUTE_MODES.find((m) => m.key === routeMode)!.icon;
  return (
    <section id="how" className="relative overflow-hidden py-24" style={{ background: "#f1efff", color: "#04042b" }}>
        <div className="mx-auto max-w-6xl px-6 md:px-10">
          {/* heading row */}
          <div className="flex flex-wrap items-end justify-between gap-6">
            <Reveal id="route-head">
              <h2 className="sr-only">Your route. In focus.</h2>
              <div aria-hidden="true">
                <div className="wf-head text-5xl md:text-7xl" style={{ color: "#04042b" }}>Your route.</div>
                <div className="wf-head text-5xl md:text-7xl" style={{ color: "#644ff2" }}>In focus.</div>
              </div>
            </Reveal>
            <p className="max-w-xs text-base leading-7" style={{ color: "#4b4b66" }}>Choose a mode. Explore the corridor. See every stage from warehouse to door.</p>
          </div>

          <div className="mt-12 grid gap-5 lg:grid-cols-2">
            {/* ===== left: map + modes ===== */}
            <div className="min-w-0">
              <div className="relative overflow-hidden bg-white" style={{ border: "1px solid #e4e1ff", ...chamfer(32, "tr") }}>
                {/* map toolbar */}
                <div className="flex items-center justify-between px-5 py-4">
                  <p className="wf-sub inline-flex items-center gap-2 text-xs font-bold" style={{ color: "#373650" }}>
                    <span className="inline-block h-2 w-2 rounded-pill" style={{ background: "#8fa93c" }} aria-hidden="true" />Connected to Georgia
                  </p>
                  <div className="flex gap-2">
                    {["Focus", "World", "Expand"].map((t, i) => (
                      <span key={t} aria-label={t} className="inline-flex h-10 w-10 items-center justify-center" style={{ background: i === 0 ? "#644ff2" : "#f1efff", color: i === 0 ? "#ffffff" : "#463dc1" }}>
                        {i === 0 && <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 21s-7-6.5-7-12a7 7 0 0 1 14 0c0 5.5-7 12-7 12z" /><circle cx="12" cy="9" r="2.5" /></svg>}
                        {i === 1 && <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>}
                        {i === 2 && <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5" /></svg>}
                      </span>
                    ))}
                  </div>
                </div>

                {/* stylised map */}
                <svg viewBox="0 0 600 430" className="block w-full" role="img" aria-label={`${route.title} by ${routeMode}: ${route.stops.map((s) => s[2]).join(", ")}`}>
                  <defs>
                    <pattern id="wf-map-dots" width="10" height="10" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#d7d7e1" /></pattern>
                  </defs>
                  <rect width="600" height="430" fill="#fbfaff" />
                  <rect width="600" height="430" fill="url(#wf-map-dots)" />
                  {/* land masses (stylised) */}
                  <polygon points="0,60 120,40 250,70 330,110 290,175 270,230 240,300 160,300 100,270 40,260 0,240" fill="#ebebf1" />
                  <polygon points="330,110 400,85 470,62 545,55 595,90 600,130 600,330 560,385 500,412 430,400 380,360 330,330 300,280 270,230 290,175" fill="#c9c5ff" />
                  {/* seas */}
                  <polygon points="125,110 150,98 166,140 158,190 172,240 150,272 128,240 118,190" fill="#e4e1ff" />
                  <polygon points="0,150 40,140 55,175 45,215 15,235 0,230" fill="#e4e1ff" />
                  <text x="132" y="160" fontSize="9" fill="#9c9ca6" transform="rotate(-80 132 160)">CASPIAN</text>
                  <text x="440" y="250" fontSize="11" fontWeight="700" fill="#463dc1" opacity="0.6">CHINA</text>
                  <text x="190" y="215" fontSize="10" fontWeight="700" fill="#9c9ca6">KAZAKHSTAN</text>

                  {/* route segments — line drawing (guide:recipes-svg.md#0) */}
                  {route.segments.map(([d, dashed], i) => (
                    <motion.path
                      key={`${routeKey}-${i}`}
                      data-anim={`route-seg-${i}`}
                      d={d}
                      fill="none"
                      stroke="#644ff2"
                      strokeWidth="3"
                      strokeLinejoin="round"
                      strokeDasharray={dashed ? "6 6" : undefined}
                      initial={reduce ? false : { pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.9, delay: i * 0.25, ease: "easeInOut" }}
                    />
                  ))}

                  {/* stops */}
                  {route.stops.map(([x, y, name], i) => {
                    const active = i === stageIdx;
                    const end = i === route.stops.length - 1;
                    return (
                      <g key={`${routeKey}-s${i}`} onClick={() => setStage(i)} style={{ cursor: "pointer" }}>
                        {active && <circle cx={x} cy={y} r="22" fill="#644ff2" opacity="0.15" />}
                        <circle cx={x} cy={y} r={active || end ? 13 : 10} fill={end ? "#d5f476" : active ? "#04042b" : "#ffffff"} stroke="#04042b" strokeWidth="1.5" />
                        <text x={x} y={y + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill={active && !end ? "#ffffff" : "#04042b"}>{i + 1}</text>
                        {(active || i === 0 || end) && <text x={x} y={y - 20} textAnchor="middle" fontSize="12" fontWeight="700" fill="#04042b">{name}</text>}
                      </g>
                    );
                  })}
                </svg>

                {/* route preview */}
                <div className="m-4 flex items-center gap-4 bg-white px-5 py-4" style={{ border: "1px solid #e4e1ff" }}>
                  <span style={{ color: "#644ff2", display: "inline-flex" }}><ModeIcon className="h-7 w-7" /></span>
                  <div className="min-w-0 flex-1">
                    <p className="wf-sub text-xs font-bold" style={{ color: "#686879" }}>Route preview</p>
                    <p className="mt-0.5 truncate font-bold" style={{ color: "#04042b" }}>{route.stops[stageIdx][2]} — <span style={{ fontWeight: 400, color: "#4b4b66" }}>{route.stops[stageIdx][3]}</span></p>
                  </div>
                  <div className="flex items-center gap-2 text-sm" style={{ color: "#373650" }}>
                    <button type="button" data-anim="stage-prev" aria-label="Previous stage" onClick={() => setStage(Math.max(0, stageIdx - 1))} className="inline-flex h-9 w-9 items-center justify-center" style={{ background: "#f1efff", color: "#463dc1" }}>‹</button>
                    <span className="tabular-nums">{String(stageIdx + 1).padStart(2, "0")} / {String(route.stops.length).padStart(2, "0")}</span>
                    <button type="button" data-anim="stage-next" aria-label="Next stage" onClick={() => setStage(Math.min(route.stops.length - 1, stageIdx + 1))} className="inline-flex h-9 w-9 items-center justify-center" style={{ background: "#f1efff", color: "#463dc1" }}>›</button>
                  </div>
                </div>
              </div>

              {/* mode tabs — sliding active background (guide:recipes-layout.md#3) */}
              <div role="tablist" aria-label="Transport mode" className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {ROUTE_MODES.map((m) => {
                  const I = m.icon;
                  const on = routeMode === m.key;
                  return (
                    <button key={m.key} type="button" role="tab" aria-selected={on} data-anim={`mode-${m.key}`}
                      onClick={() => { setRouteMode(m.key); setStage(0); }}
                      className="relative flex items-center gap-2.5 px-3 py-4 text-left" style={{ background: on ? "transparent" : "#ffffff", border: on ? "1px solid #644ff2" : "1px solid #e4e1ff", color: on ? "#ffffff" : "#04042b" }}>
                      {on && <motion.span layoutId="wf-mode-active" aria-hidden="true" style={{ position: "absolute", inset: 0, background: "#644ff2", zIndex: 0 }} transition={{ duration: reduce ? 0 : 0.18, ease: "easeInOut" }} />}
                      <span className="relative inline-flex" style={{ zIndex: 1, color: on ? "#ffffff" : "#463dc1" }}><I className="h-6 w-6" /></span>
                      <span className="relative" style={{ zIndex: 1 }}>
                        <span className="block text-sm font-bold">{m.label}</span>
                        <span className="block whitespace-nowrap text-xs" style={{ opacity: 0.75 }}>{m.sub}</span>
                      </span>
                    </button>
                  );
                })}
              </div>

              {/* consolidation stops */}
              <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4" style={{ border: "1px solid #e4e1ff" }}>
                <p className="text-sm" style={{ color: "#373650" }}>Consolidation stops</p>
                <div className="flex gap-2">
                  {route.stops.slice(0, 2).map((s, i) => (
                    <button key={s[2]} type="button" data-anim={`chip-${i}`} onClick={() => setStage(i)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-bold" style={{ border: "1px solid #e4e1ff", color: "#04042b" }}>
                      <span style={{ color: "#644ff2", display: "inline-flex" }}><IconContainer className="h-4 w-4" /></span>{s[2]}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* ===== right: configurator ===== */}
            <div className="min-w-0 bg-white p-5 md:p-7" style={{ border: "1px solid #e4e1ff" }}>
              <p className="wf-sub text-xs font-bold" style={{ color: "#644ff2" }}>Explore your route</p>
              <p className="mt-2 font-bold" style={{ fontSize: 30, color: "#04042b" }}>{route.title}</p>

              <label className="mt-5 block text-sm" style={{ color: "#373650" }} htmlFor="route-country">Where are we starting?</label>
              <div className="mt-2 flex items-center gap-3 px-4" style={{ border: "1px solid #e4e1ff", height: 50, color: "#686879" }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
                <input id="route-country" className="h-full flex-1 bg-white text-sm focus:outline-none" style={{ color: "#04042b" }} placeholder="Search a country…" defaultValue="" />
              </div>
              <p className="mt-2 text-xs" style={{ color: "#686879" }}>Import from Europe, Türkiye, China & Ukraine</p>

              <div className="mt-5 flex items-center justify-between py-4 text-sm" style={{ borderTop: "1px solid #ebebf1", borderBottom: "1px solid #ebebf1", color: "#04042b" }}>
                Browse regions & corridors
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#644ff2" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </div>

              <p className="mt-5 text-sm" style={{ color: "#373650" }}>Choose a corridor</p>
              <div className="mt-2 flex items-center justify-between px-4 text-sm" style={{ border: "1px solid #e4e1ff", height: 50, color: "#04042b", background: "#f8f7ff" }}>
                China · {ROUTE_MODES.find((m) => m.key === routeMode)!.label} {ROUTE_MODES.find((m) => m.key === routeMode)!.sub}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#04042b" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm" style={{ color: "#373650" }}>Shipment type</p>
                  <div className="mt-2 grid grid-cols-2 gap-1 p-1" style={{ border: "1px solid #e4e1ff" }}>
                    {ROUTE_MODES.find((m) => m.key === routeMode)!.sub.split(" / ").map((t, i) => (
                      <button key={t} type="button" data-anim={`load-${i}`} aria-pressed={load === i} onClick={() => setLoad(i)} className="px-3 py-2.5 text-sm" style={{ background: load === i ? "#d5f476" : "transparent", color: "#04042b", fontWeight: load === i ? 700 : 400 }}>{t}</button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-sm" style={{ color: "#373650" }} htmlFor="route-wh">Consolidation warehouse</label>
                  <select id="route-wh" value={warehouse} onChange={(e) => setWarehouse(e.target.value)} className="mt-2 w-full bg-white px-3 text-sm" style={{ border: "1px solid #e4e1ff", height: 46, color: "#04042b" }}>
                    {WAREHOUSES.map((w) => <option key={w}>{w}</option>)}
                  </select>
                </div>
              </div>

              {routeMode === "road" ? (
                <>
                  <p className="mt-5 text-sm" style={{ color: "#373650" }}>Overland corridor</p>
                  <div className="mt-2 grid grid-cols-2 gap-3">
                    {[["aktau", "Via Aktau ferry", "Caspian crossing"], ["russia", "Via Russia", "Upper Lars border"]].map(([k, t, s]) => (
                      <button key={k} type="button" data-anim={`corridor-${k}`} aria-pressed={overland === k} onClick={() => { setOverland(k); setStage(0); }}
                        className="flex items-start justify-between px-4 py-4 text-left" style={{ minHeight: 78, border: overland === k ? "2px solid #644ff2" : "1px solid #e4e1ff", background: overland === k ? "#ffffff" : "#f8f7ff", color: "#04042b" }}>
                        <span><span className="block text-sm font-bold">{t}</span><span className="mt-1 block text-xs" style={{ color: "#686879" }}>{s}</span></span>
                        {overland === k && <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="#644ff2" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="m8 12 3 3 5-6" /></svg>}
                      </button>
                    ))}
                  </div>
                </>
              ) : null}

              <div className="mt-5 flex items-start gap-3 pt-5" style={{ borderTop: "1px solid #ebebf1" }}>
                <span className="wf-sub shrink-0 px-2 py-1 text-xs font-bold" style={{ background: "#d5f476", color: "#04042b" }}>{ROUTE_MODES.find((m) => m.key === routeMode)!.sub.split(" / ")[load] || "LTL"}</span>
                <p className="text-xs leading-5" style={{ color: "#4b4b66" }}>{route.note}</p>
              </div>

              <div className="mt-5 flex items-center justify-between pt-4 text-sm" style={{ borderTop: "1px solid #ebebf1", color: "#04042b" }}>
                Route stages · {route.stops.length}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#644ff2" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </div>
              <div className="mt-4 flex items-center gap-4">
                <input type="range" min={0} max={route.stops.length - 1} step={1} value={stageIdx} onChange={(e) => setStage(Number(e.target.value))} aria-label="Route stage" className="flex-1" style={{ accentColor: "#644ff2" }} />
                <span className="w-10 text-right text-sm tabular-nums" style={{ color: "#373650" }}>{Math.round((stageIdx / (route.stops.length - 1)) * 100)}%</span>
              </div>
              <p className="mt-4 text-xs" style={{ color: "#9c9ca6" }}>Illustrative corridors. Connections and transit times are confirmed for each shipment.</p>
            </div>
          </div>
        </div>
      </section>
  );
}
