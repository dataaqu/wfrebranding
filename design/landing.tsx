import { useState, useRef, useEffect } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Intro, INTRO_REVEAL_AT, BrandFonts, WMark, LogoHorizontal, WGraphic, chamfer, Tag, Button, Reveal, IconPlane, IconShip, IconTrain, IconTruck, IconDoc, IconContainer, IconShield, IconClock, IconPhone, IconArrow } from "./design-system";

const NAV = [
  ["Services", "#services"],
  ["How it works", "#how"],
  ["Rail from China", "#rail"],
  ["Contact", "#quote"],
];

const SERVICES = [
  { icon: IconPlane, title: "Air freight", text: "Time-critical cargo flown door to door, with full tracking from pickup to delivery.", tone: "navy" },
  { icon: IconShip, title: "Sea freight", text: "LCL and FCL container shipping through the major ports to and from Georgia.", tone: "purple" },
  { icon: IconTrain, title: "Rail freight", text: "China to Georgia by rail in about 14 days. Faster than sea, cheaper than air.", tone: "navy" },
  { icon: IconTruck, title: "Road & container", text: "Trucking and container haulage across the region, under EXW, FCA and FOB terms.", tone: "navy" },
  { icon: IconDoc, title: "Customs brokerage", text: "Declarations, CMR waybills, export documents, re-export and transit paperwork.", tone: "lime" },
];

const STEPS = [
  ["01", "Tell us the deal", "Origin, destination, cargo and timing. That is all we need to quote."],
  ["02", "We plan the route", "We choose the mode, book the capacity and prepare every document."],
  ["03", "We deliver", "Your cargo moves; you get updates at every handoff until it lands."],
];

const RAIL = [
  ["01", "High capacity", "A 40HC container carries up to 33 tonnes of cargo."],
  ["02", "Cost-efficient", "Rail beats air on budget and sea on lead time."],
  ["03", "Secure", "The safest overland route for cargo from China to Georgia."],
];

const MODES = ["Air", "Sea", "Rail", "Road"];

/* ---- Dashboard preview data (hero) ----
   Categorical brand palette, fixed order; adjacent pairs alternate light/dark so they separate
   without colour alone (2px surface gaps + legend + per-segment hover tooltip as secondary encoding). */
const SERIES = [
  { key: "rail", label: "Rail", color: "#8fa93c" },
  { key: "fcl", label: "Sea FCL", color: "#463dc1" },
  { key: "lcl", label: "Sea LCL", color: "#a99bff" },
  { key: "air", label: "Air", color: "#b75cff" },
  { key: "road", label: "Road", color: "#0e0e47" },
];
// Each row sums to its total; each column sums to the KPI above the chart.
const MILESTONES = [
  { label: "Shipments booked", v: [20, 38, 9, 8, 13] },
  { label: "Shipments at origin", v: [52, 120, 21, 14, 34] },
  { label: "Shipments in transit", v: [58, 96, 15, 9, 18] },
  { label: "Shipments at destination", v: [34, 64, 12, 11, 31] },
];
/* ---- Route explorer ("Your route. In focus.") ----
   Stylised map, viewBox 0 0 600 430. Stops: [x, y, name, detail]. */
const ROUTE_MODES = [
  { key: "road", label: "Road", sub: "FTL / LTL", icon: IconTruck },
  { key: "sea", label: "Sea", sub: "FCL / LCL", icon: IconShip },
  { key: "rail", label: "Rail", sub: "FCL / LCL", icon: IconTrain },
  { key: "air", label: "Air", sub: "Cargo / Express", icon: IconPlane },
];
const ROUTES = {
  "road-aktau": {
    title: "China to Georgia", note: "Yiwu, Dongguan or Khorgos consolidation. Trailers cross from China into Kazakhstan at Khorgos, then take the Aktau–Alat ferry over the Caspian.",
    segments: [["M535 320 L470 270 L420 220 L360 190 L300 175 L250 150 L210 140 L172 170", false], ["M172 170 L130 225", true], ["M130 225 L95 212 L70 205", false]],
    stops: [[535, 320, "Yiwu", "China · consolidation warehouse"], [300, 175, "Khorgos", "China → Kazakhstan border"], [172, 170, "Aktau", "Kazakhstan · Caspian ferry port"], [130, 225, "Alat", "Ferry arrives · Azerbaijan"], [95, 212, "Red Bridge", "Azerbaijan → Georgia border"], [70, 205, "Tbilisi", "Customs clearance & delivery"]],
  },
  "road-russia": {
    title: "China to Georgia", note: "Overland through Kazakhstan and Russia, entering Georgia at Upper Lars. No sea leg; border queues depend on season.",
    segments: [["M535 320 L470 270 L420 220 L360 190 L300 175 L250 130 L190 95 L140 85 L100 120 L75 160 L70 205", false]],
    stops: [[535, 320, "Yiwu", "China · consolidation warehouse"], [300, 175, "Khorgos", "China → Kazakhstan border"], [190, 95, "Atyrau", "Kazakhstan · transit"], [140, 85, "Astrakhan", "Russia · transit"], [75, 160, "Upper Lars", "Russia → Georgia border"], [70, 205, "Tbilisi", "Customs clearance & delivery"]],
  },
  rail: {
    title: "China to Georgia", note: "Block trains from Xi'an via Altynkol to Aktau, Caspian ferry to Baku, then rail to Tbilisi — about 14 days door to door.",
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
const WAREHOUSES = ["Yiwu", "Dongguan", "Khorgos"];

const KPIS = [["Rail", 164], ["Sea FCL", 318], ["Sea LCL", 57], ["Air", 42], ["Road", 96]];
const AXIS_MAX = 250;
const SIDEBAR = [
  { title: "Shipments", n: "677", alert: "3 with exceptions", items: ["Map", "Milestones", "Exceptions", "Quotes & bookings"], active: 1 },
  { title: "Containers", n: "128", ok: "$0 est. D&D cost", items: ["Demurrage & detention", "Container tracking"] },
  { title: "Customs declarations", n: "214", alert: "2 under hold or exam", items: ["Release status", "Customs exceptions"] },
  { title: "Rail · China → GE", n: "36", ok: "Next departure Thu", items: ["Departures", "Wagon tracking"] },
];

const field = "mt-2 min-h-12 w-full rounded-field border border-white/15 bg-ink-900 px-4 text-sm text-white placeholder:text-ink-400 focus:border-volt-500 focus:outline-none";
const label = "wf-sub block text-[10px] font-bold text-brand-200";

export default function Landing() {
  const reduce = useReducedMotion();
  const [mode, setMode] = useState("Rail");
  const [sent, setSent] = useState(false);
  const [lang, setLang] = useState("EN");
  const [hover, setHover] = useState(null);
  const [tourTip, setTourTip] = useState(true);
  const [routeMode, setRouteMode] = useState("road");
  const [overland, setOverland] = useState("aktau");
  const [load, setLoad] = useState(1);
  const [warehouse, setWarehouse] = useState("Yiwu");
  const [stage, setStage] = useState(2);
  const routeKey = routeMode === "road" ? `road-${overland}` : routeMode;
  const route = ROUTES[routeKey];
  const stageIdx = Math.min(stage, route.stops.length - 1);
  const ModeIcon = ROUTE_MODES.find((m) => m.key === routeMode).icon;
  const videoDesktop = useRef(null);
  const videoMobile = useRef(null);
  const [playing, setPlaying] = useState(!reduce);
  // React does not reliably set the `muted` attribute; browsers block unmuted autoplay.
  useEffect(() => {
    [videoDesktop.current, videoMobile.current].forEach((v) => {
      if (!v) return;
      v.muted = true;
      if (reduce) { v.pause(); } else { const p = v.play(); if (p && p.catch) p.catch(() => {}); }
    });
    setPlaying(!reduce);
  }, [reduce]);

  return (
    <main id="main" className="font-sans antialiased" style={{ background: "#ffffff", color: "#04042b" }}>
      <BrandFonts />
      <Intro />

      {/* ---------------- Hero (full-bleed photo · centred promise · product preview) ---------------- */}
      <section id="hero" className="relative overflow-hidden" style={{ background: "#f8f7ff" }}>
        {/* Light hero. The port video/photo is a band behind the product preview (lower part of the hero),
            with a light navy scrim. Reduced motion: no autoplay, poster only. */}
        <div aria-hidden="true" style={{ position: "absolute", top: "42%", left: 0, right: 0, bottom: 0, overflow: "hidden" }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/assets/hero-port.png')", backgroundSize: "cover", backgroundPosition: "center 55%" }} />
          <video ref={videoDesktop} className="hidden md:block" src="/assets/hero-720.webm" poster="/assets/hero-port.png" muted loop playsInline autoPlay={!reduce} preload="metadata"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <video ref={videoMobile} className="md:hidden" src="/assets/hero-540.webm" poster="/assets/hero-port.png" muted loop playsInline autoPlay={!reduce} preload="metadata"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "rgba(4, 4, 43, 0.25)" }} />
        </div>

        {/* header */}
        <header id="header" className="relative z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-5 md:gap-6 md:px-10" style={{ borderBottom: "1px solid #e4e1ff" }}>
            <a href="#main" aria-label="WEFORWARD home"><LogoHorizontal size="sm" wordColor="#04042b" /></a>
            <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
              {[["Services", "#services"], ["Rail from China", "#rail"], ["Customs", "#brokerage"], ["How it works", "#how"], ["Contact", "#quote"]].map(([t, h]) => (
                <a key={h} href={h} className="wf-sub whitespace-nowrap text-xs font-bold transition-colors hover:text-brand-500" style={{ color: "#04042b" }}>{t}</a>
              ))}
            </nav>
            <div className="flex items-center gap-3 md:gap-5">
              <button
                type="button"
                data-anim="lang-switch"
                onClick={() => setLang(lang === "EN" ? "KA" : "EN")}
                aria-label={`Language: ${lang === "EN" ? "English" : "Georgian"}. Switch to ${lang === "EN" ? "Georgian" : "English"}`}
                className="wf-sub inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-xs font-bold transition-colors hover:text-brand-500"
                style={{ color: "#04042b" }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
                {lang}
              </button>
              <Button id="nav-quote" href="#quote" variant="purple">Get a quote <IconArrow /></Button>
            </div>
          </div>
        </header>

        {/* centred promise + inline quote capture */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-16 pt-16 text-center md:pt-20">
          <h1 className="sr-only">You deal. We deliver. Freight forwarding in Georgia.</h1>
          <div aria-hidden="true">
            {["You deal.", "We deliver."].map((line, i) => (
              <div key={line} style={{ overflow: "hidden" }}>
                <motion.div
                  data-anim={`hero-line-${i}`}
                  className="wf-head text-5xl md:text-8xl"
                  style={{ color: i === 0 ? "#644ff2" : "#04042b" }}
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: "0%" }}
                  transition={{ duration: 0.9, delay: reduce ? 0 : INTRO_REVEAL_AT + i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >{line}</motion.div>
              </div>
            ))}
          </div>
          <motion.div
            data-anim="hero-copy"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : INTRO_REVEAL_AT + 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mx-auto mt-8 max-w-xl text-base leading-7 md:text-lg" style={{ color: "#4b4b66" }}>
              Air, sea, rail and road freight plus customs brokerage — one partner moving your cargo from China, Europe and beyond to your door in Georgia.
            </p>
          </motion.div>
        </div>

        {/* product preview — WEFORWARD Track (cropped at the bottom like a window) */}
        <motion.div
          data-anim="hero-dashboard"
          className="relative z-10 mx-auto max-w-6xl px-6 pb-16 md:px-10"
          initial={reduce ? false : { opacity: 0, y: 80 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: reduce ? 0 : INTRO_REVEAL_AT + 0.35, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="overflow-hidden border border-white/15 bg-ink-900 p-2" style={chamfer(28, "tr")}>
           <div style={{ minWidth: 960 }}>
            {/* ---- app bar ---- */}
            <div className="flex items-center gap-5 bg-ink-950 px-6" style={{ height: 60 }}>
              <LogoHorizontal size="sm" />
              <div className="flex shrink-0 items-center gap-2 overflow-hidden whitespace-nowrap border-2 border-brand-400 px-3 text-sm" style={{ height: 36, width: 170, color: "#d7d7e1" }}>
                <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>
                Search or ask
              </div>
              <div className="flex items-center gap-1 whitespace-nowrap text-sm" style={{ color: "#ebebf1" }}>
                {["Overview", "Bookings", "Freight", "Customs", "Tasks"].map((t, i) => (
                  <span key={t} className={`inline-flex items-center gap-1 px-2.5 py-1.5 ${i === 0 ? "bg-brand-500" : ""}`} style={{ color: "#ffffff" }}>
                    {t}{i > 0 && <svg viewBox="0 0 24 24" className="h-3 w-3 opacity-70" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>}
                  </span>
                ))}
              </div>
              <div className="ml-auto flex items-center gap-4" style={{ color: "#ffffff" }}>
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 14v2h2v-2h-2zm1-10a4 4 0 0 0-4 4h2a2 2 0 1 1 3 1.7c-1.2.7-2 1.6-2 3.3h2c0-1 .4-1.4 1.3-2A4 4 0 0 0 12 6z" /></svg>
                <span className="relative inline-flex">
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.8V3h-3v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z" /></svg>
                  <span className="absolute -right-2 -top-2 inline-flex h-4 w-4 items-center justify-center rounded-pill text-xs font-bold" style={{ background: "#d5f476", color: "#04042b", fontSize: 10 }}>4</span>
                </span>
                <span className="h-6 w-px" style={{ background: "rgba(255,255,255,0.2)" }} />
                <span className="inline-flex h-9 w-9 items-center justify-center rounded-pill text-xs font-bold" style={{ background: "#1a1a4d", color: "#ffffff" }}>NB</span>
              </div>
            </div>

            {/* ---- app body ---- */}
            <div className="bg-white px-7 pb-0 pt-7" style={{ color: "#04042b" }}>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="font-bold" style={{ fontSize: 28, lineHeight: 1.1, color: "#04042b" }}>Hello, Nino!</p>
                  <p className="mt-2 text-sm" style={{ color: "#4b4b66" }}>There are <span className="font-bold" style={{ color: "#463dc1" }}>2 containers arriving</span> and <span className="font-bold" style={{ color: "#463dc1" }}>1 customs task due today</span></p>
                </div>
                <div className="flex gap-2">
                  <span className="border px-4 py-2 text-sm font-bold" style={{ borderColor: "#c9c5ff", color: "#463dc1" }}>Get a quote</span>
                  <span className="px-4 py-2 text-sm font-bold" style={{ background: "#644ff2", color: "#ffffff" }}>Book a shipment</span>
                </div>
              </div>

              <div className="mt-6 grid border border-ink-200" style={{ gridTemplateColumns: "200px 40px 1fr", height: 520 }}>
                {/* summary column */}
                <div className="overflow-hidden border-r border-ink-200 px-4 py-4">
                  {SIDEBAR.map((g, gi) => (
                    <div key={g.title} className={gi > 0 ? "mt-5" : ""}>
                      <p className="font-bold" style={{ fontSize: 15, color: gi === 0 ? "#463dc1" : "#04042b" }}>{g.title}</p>
                      <p className="font-bold" style={{ fontSize: 26, lineHeight: 1.2, color: "#04042b" }}>{g.n}</p>
                      <p className="mt-1 flex items-center gap-2 text-xs" style={{ color: "#1a1a4d" }}>
                        <span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: g.alert ? "#d6334a" : "#8fa93c" }} aria-hidden="true" />
                        {g.alert || g.ok}
                      </p>
                      <div className="mt-1.5 space-y-0.5">
                        {g.items.map((it, ii) => (
                          <p key={it} className="px-2 py-1 text-xs" style={{ color: "#1a1a4d", background: g.active === ii ? "#f1efff" : "transparent", fontWeight: g.active === ii ? 700 : 400 }}>{it}</p>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>

                {/* icon rail */}
                <div className="flex flex-col items-center gap-4 border-r border-ink-200 py-3" style={{ color: "#686879" }}>
                  <span className="inline-flex h-8 w-full items-center justify-center" style={{ color: "#644ff2", boxShadow: "inset -2px 0 0 #644ff2" }}>
                    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
                  </span>
                  <IconShip className="h-5 w-5" />
                  <IconPlane className="h-5 w-5" />
                  <IconTrain className="h-5 w-5" />
                  <IconTruck className="h-5 w-5" />
                  <IconContainer className="h-5 w-5" />
                  <IconDoc className="h-5 w-5" />
                  <IconClock className="h-5 w-5" />
                  <IconShield className="h-5 w-5" />
                  <svg viewBox="0 0 24 24" className="h-5 w-5" fill="currentColor" aria-hidden="true"><path d="M12 22a2.5 2.5 0 0 0 2.5-2.5h-5A2.5 2.5 0 0 0 12 22zm7-6V11a7 7 0 0 0-5.5-6.8V3h-3v1.2A7 7 0 0 0 5 11v5l-2 2v1h18v-1l-2-2z" /></svg>
                </div>

                {/* main panel — Shipment milestones */}
                <div className="relative px-7 py-6">
                  <p className="font-bold" style={{ fontSize: 22, color: "#04042b" }}>Shipment milestones</p>

                  {/* KPI row */}
                  <div className="mt-6 grid grid-cols-5 gap-4">
                    {KPIS.map(([l, n]) => (
                      <div key={l} className="pl-3" style={{ borderLeft: "2px solid #c9c5ff" }}>
                        <p className="text-xs font-bold" style={{ color: "#373650" }}>{l}</p>
                        <p className="mt-1 font-bold" style={{ fontSize: 24, color: "#04042b" }}>{n}</p>
                      </div>
                    ))}
                  </div>

                  {/* stacked horizontal bars */}
                  <div className="relative mt-8" role="img" aria-label="Shipments per milestone by transport mode: booked 88, at origin 241, in transit 196, at destination 152">
                    <div className="relative" style={{ marginLeft: 150, height: 250 }}>
                      {/* recessive grid */}
                      {[0, 50, 100, 150, 200, 250].map((t) => (
                        <span key={t} aria-hidden="true" style={{ position: "absolute", top: 0, bottom: 0, left: `${(t / AXIS_MAX) * 100}%`, width: 1, background: "#ebebf1" }} />
                      ))}
                      {MILESTONES.map((row, ri) => {
                        const total = row.v.reduce((a, b) => a + b, 0);
                        return (
                          <div key={row.label} style={{ position: "absolute", left: 0, right: 0, top: 14 + ri * 60, height: 34 }}>
                            <span className="text-xs" style={{ position: "absolute", right: "100%", marginRight: 14, top: 9, whiteSpace: "nowrap", color: "#373650" }}>{row.label}</span>
                            <div className="flex h-full" style={{ width: `${(total / AXIS_MAX) * 100}%`, gap: 2 }}>
                              {row.v.map((val, si) => (
                                <button
                                  key={si}
                                  type="button"
                                  data-anim={`bar-${ri}-${si}`}
                                  onMouseEnter={() => setHover({ ri, si })}
                                  onMouseLeave={() => setHover(null)}
                                  onFocus={() => setHover({ ri, si })}
                                  onBlur={() => setHover(null)}
                                  aria-label={`${row.label}, ${SERIES[si].label}: ${val}`}
                                  className="h-full"
                                  style={{ flexGrow: val, flexBasis: 0, background: SERIES[si].color, opacity: hover && !(hover.ri === ri && hover.si === si) ? 0.55 : 1, borderRadius: si === row.v.length - 1 ? "0 4px 4px 0" : 0, transition: "opacity 150ms" }}
                                />
                              ))}
                            </div>
                            <span className="text-xs font-bold" style={{ position: "absolute", top: 9, left: `calc(${(total / AXIS_MAX) * 100}% + 10px)`, color: "#04042b" }}>{total}</span>
                            {hover && hover.ri === ri && (
                              <div className="pointer-events-none px-3 py-2 text-xs" style={{ position: "absolute", bottom: "calc(100% + 8px)", left: `${(row.v.slice(0, hover.si).reduce((a, b) => a + b, 0) / AXIS_MAX) * 100}%`, background: "#04042b", color: "#ffffff", whiteSpace: "nowrap", zIndex: 5 }}>
                                <span className="mr-2 inline-block h-2 w-2" style={{ background: SERIES[hover.si].color, outline: "1px solid #ffffff" }} />
                                {SERIES[hover.si].label} · <b>{row.v[hover.si]}</b>
                              </div>
                            )}
                          </div>
                        );
                      })}
                      {/* x axis */}
                      {[0, 50, 100, 150, 200, 250].map((t) => (
                        <span key={`x${t}`} className="text-xs" style={{ position: "absolute", top: 256, left: `${(t / AXIS_MAX) * 100}%`, transform: "translateX(-50%)", color: "#686879" }}>{t}</span>
                      ))}
                      <span className="text-xs" style={{ position: "absolute", top: 256, right: "100%", marginRight: 14, whiteSpace: "nowrap", color: "#686879" }}># of shipments</span>
                    </div>

                    {/* legend */}
                    <div className="mt-10 flex justify-center gap-5 text-xs" style={{ color: "#373650" }}>
                      {SERIES.map((s) => (
                        <span key={s.key} className="inline-flex items-center gap-1.5"><span className="inline-block h-2.5 w-2.5 rounded-pill" style={{ background: s.color }} />{s.label}</span>
                      ))}
                    </div>

                    {/* guided-tour callout */}
                    {tourTip && (
                      <div className="absolute flex items-start gap-3 px-4 py-3 text-sm" style={{ left: 150, top: -30, background: "#1a1a4d", color: "#ffffff", zIndex: 6 }}>
                        Drill down into specific shipments.
                        <button type="button" data-anim="tour-close" aria-label="Close tip" onClick={() => setTourTip(false)} className="leading-none" style={{ color: "#ffffff" }}>×</button>
                        <span aria-hidden="true" style={{ position: "absolute", left: 28, bottom: -6, width: 12, height: 12, background: "#1a1a4d", transform: "rotate(45deg)" }} />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
           </div>
          </div>
        </motion.div>
      </section>

      {/* ---------------- Facts ---------------- */}
      <section id="facts" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="grid grid-cols-2 gap-px md:grid-cols-4" style={{ background: "#e4e1ff" }}>
          {[["4", "Transport modes"], ["14", "Days China → Georgia"], ["33 t", "Max load per 40HC"], ["LCL · FCL", "Groupage & full load"]].map(([n, t], i) => (
            <Reveal key={t} id={`fact-${i}`} delay={i * 0.08} className="p-6" style={{ background: "#ffffff" }}>
              <p className="wf-head text-3xl md:text-4xl" style={{ color: "#644ff2" }}>{n}</p>
              <p className="wf-sub mt-3 text-xs font-bold" style={{ color: "#686879" }}>{t}</p>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------- Services ---------------- */}
      <section id="services" className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal id="services-head">
            <h2 className="sr-only">Every mode. One partner.</h2>
            <div aria-hidden="true"><div className="wf-head text-4xl md:text-6xl" style={{ color: "#644ff2" }}>Every mode.</div><div className="wf-head text-4xl md:text-6xl" style={{ color: "#04042b" }}>One partner.</div></div>
          </Reveal>
          <p className="max-w-sm text-sm leading-6" style={{ color: "#4b4b66" }}>Air, sea, rail, road and customs handled by one team, so your cargo never falls between two providers.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            // Light page: navy cards become light; purple and lime stay as the two colour accents.
            const c = s.tone === "purple"
              ? { bg: "#644ff2", fg: "#ffffff", sub: "#e4e1ff", num: "#d5f476", iconBg: "rgba(255,255,255,0.14)", icon: "#d5f476", w: "#ffffff", border: "none" }
              : s.tone === "lime"
                ? { bg: "#d5f476", fg: "#04042b", sub: "#1a1a4d", num: "#373650", iconBg: "#04042b", icon: "#d5f476", w: "#04042b", border: "none" }
                : { bg: "#f8f7ff", fg: "#04042b", sub: "#4b4b66", num: "#644ff2", iconBg: "#644ff2", icon: "#ffffff", w: "#644ff2", border: "1px solid #e4e1ff" };
            const span = i < 2 ? "md:col-span-3" : "md:col-span-2";
            return (
              <Reveal key={s.title} id={`service-${i}`} delay={i * 0.06} className={span}>
                <article className="group relative flex h-full min-h-64 flex-col justify-between overflow-hidden p-7" style={{ background: c.bg, color: c.fg, border: c.border, ...chamfer(28, "tr") }}>
                  <WGraphic className="-bottom-10 -right-8 h-48 opacity-15" color={c.w} />
                  <span className="inline-flex h-12 w-12 items-center justify-center" style={{ background: c.iconBg, color: c.icon }}><Icon className="h-6 w-6" /></span>
                  <div className="relative mt-10">
                    <p className="wf-sub text-xs font-bold" style={{ color: c.num }}>0{i + 1}</p>
                    <h3 className="wf-head mt-2 text-2xl" style={{ color: c.fg }}>{s.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-6" style={{ color: c.sub }}>{s.text}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- Route explorer — "Your route. In focus." ---------------- */}
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
                China · {ROUTE_MODES.find((m) => m.key === routeMode).label} {ROUTE_MODES.find((m) => m.key === routeMode).sub}
                <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="#04042b" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
              </div>

              <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <p className="text-sm" style={{ color: "#373650" }}>Shipment type</p>
                  <div className="mt-2 grid grid-cols-2 gap-1 p-1" style={{ border: "1px solid #e4e1ff" }}>
                    {ROUTE_MODES.find((m) => m.key === routeMode).sub.split(" / ").map((t, i) => (
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
                <span className="wf-sub shrink-0 px-2 py-1 text-xs font-bold" style={{ background: "#d5f476", color: "#04042b" }}>{ROUTE_MODES.find((m) => m.key === routeMode).sub.split(" / ")[load] || "LTL"}</span>
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

      {/* ---------------- Rail highlight ---------------- */}
      <section id="rail" className="relative overflow-hidden bg-brand-500 py-24 text-ink-950">
        <WGraphic className="-right-24 -top-10 hidden h-[640px] md:block" color="var(--color-brand-600)" />
        <div className="relative mx-auto max-w-6xl px-6 md:px-10">
          <Reveal id="rail-head">
            <Tag tone="white"><IconTrain className="h-3.5 w-3.5" />Rail line</Tag>
            <h2 className="sr-only">Cargo from China in 14 days</h2>
            <div aria-hidden="true" className="mt-6"><div className="wf-head text-4xl text-white md:text-6xl">Cargo from China</div><div className="wf-head text-4xl text-ink-950 md:text-6xl">in 14 days</div></div>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {RAIL.map(([n, t, d], i) => (
              <Reveal key={n} id={`rail-${n}`} delay={i * 0.08}>
                <div className="h-full p-7" style={{ background: "#ffffff", color: "#04042b", ...chamfer(24, "bl") }}>
                  <div className="flex items-center gap-4"><span className="wf-head text-4xl" style={{ color: "#644ff2" }}>{n}</span><span className="h-px flex-1" style={{ background: "#e4e1ff" }} /></div>
                  <h3 className="wf-head mt-6 text-xl" style={{ color: "#04042b" }}>{t}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: "#4b4b66" }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ---------------- Brokerage ---------------- */}
      <section id="brokerage" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr] md:px-10">
        <Reveal id="broker-head">
          <h2 className="sr-only">Brokerage handled</h2>
          <div aria-hidden="true"><div className="wf-head text-4xl md:text-5xl" style={{ color: "#644ff2" }}>Brokerage</div><div className="wf-head text-4xl md:text-5xl" style={{ color: "#04042b" }}>handled</div></div>
          <p className="mt-6 max-w-sm text-sm leading-6" style={{ color: "#4b4b66" }}>Our brokers take the paperwork off your desk — so customs is a step, not a delay.</p>
        </Reveal>
        <div className="grid gap-px sm:grid-cols-2" style={{ background: "#e4e1ff", border: "1px solid #e4e1ff" }}>
          {[[IconDoc, "Cargo declaration"], [IconContainer, "Temporary storage"], [IconDoc, "CMR waybills"], [IconShield, "Re-export & transit"], [IconDoc, "Export documents"], [IconClock, "Annotations & closure"]].map(([Icon, t], i) => {
            const I = Icon as typeof IconDoc;
            return (
              <Reveal key={t as string} id={`broker-${i}`} delay={i * 0.05} className="p-6" style={{ background: "#ffffff" }}>
                <div className="flex items-center gap-4" style={{ color: "#644ff2" }}><I className="h-6 w-6" /><span className="wf-sub text-xs font-bold" style={{ color: "#04042b" }}>{t as string}</span></div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* ---------------- Quote form ---------------- */}
      <section id="quote" className="relative overflow-hidden bg-ink-900 py-24">
        <WGraphic className="-left-20 bottom-[-120px] hidden h-[560px] md:block" color="var(--color-brand-500)" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_1.3fr] md:px-10">
          <Reveal id="quote-head">
            <h2 className="sr-only">Get your quote</h2>
            <div aria-hidden="true"><div className="wf-head text-4xl text-white md:text-6xl">Get your</div><div className="wf-head text-4xl text-volt-500 md:text-6xl">quote</div></div>
            <p className="mt-6 max-w-xs text-sm leading-6 text-ink-200">Send the details and our team replies with a price and route within one business day.</p>
            <a href="#quote" className="wf-sub mt-8 inline-flex items-center gap-3 whitespace-nowrap rounded-pill border border-white/40 px-5 py-3 text-xs font-bold text-white" style={{ color: "#ffffff" }}><span style={{ color: "#d5f476", display: "inline-flex" }}><IconPhone className="h-4 w-4" /></span>591 32 12 92</a>
          </Reveal>
          <Reveal id="quote-form" delay={0.1}>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="bg-ink-950 p-7 md:p-10" style={chamfer(40, "tr")}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className={label}>From<input required className={field} placeholder="e.g. Shanghai, China" /></label>
                <label className={label}>To<input required className={field} placeholder="e.g. Tbilisi, Georgia" /></label>
                <fieldset className="md:col-span-2">
                  <legend className={label}>Transport mode</legend>
                  <div className="mt-2 grid grid-cols-4 gap-px bg-white/10">
                    {MODES.map((m) => (
                      <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
                        className={`wf-sub min-h-12 text-[11px] font-bold transition-colors ${mode === m ? "bg-brand-500 text-white" : "bg-ink-900 text-ink-300 hover:text-white"}`}>{m}</button>
                    ))}
                  </div>
                </fieldset>
                <label className={label}>Cargo type<input className={field} placeholder="e.g. 2 pallets, electronics" /></label>
                <label className={label}>Weight (kg)<input inputMode="numeric" className={field} placeholder="e.g. 850" /></label>
                <label className={label}>Name<input required className={field} placeholder="Your full name" /></label>
                <label className={label}>Phone or email<input required className={field} placeholder="How we reach you" /></label>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Button id="quote-submit" type="submit">Request quote <IconArrow /></Button>
                <p role="status" className="text-sm text-volt-500">{sent ? `Thanks — ${mode.toLowerCase()} quote request received (preview).` : ""}</p>
              </div>
            </form>
          </Reveal>
        </div>
      </section>

      {/* ---------------- Footer ---------------- */}
      <footer id="footer" className="bg-ink-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-10 px-6 py-14 md:px-10">
          <div>
            <LogoHorizontal tagline />
            <p className="mt-6 max-w-xs text-sm leading-6 text-ink-400">Cargo & freight forwarding from Tbilisi to the world.</p>
          </div>
          <WMark className="hidden h-24 w-auto md:block" color="var(--color-brand-500)" />
        </div>
        <div className="bg-brand-500">
          <div className="wf-sub mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-4 text-[10px] font-bold text-white md:px-10">
            <span className="whitespace-nowrap">+995 591 32 12 92</span><span>info@weforward.ge</span><span>weforward.ge</span><span>© 2026 WEFORWARD</span>
          </div>
        </div>
      </footer>
    </main>
  );
}
