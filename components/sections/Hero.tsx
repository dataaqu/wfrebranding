"use client";

import { useState, useRef, useEffect } from "react";
import { AnimatePresence, animate, motion, useReducedMotion } from "motion/react";
import { useIntroDone } from "@/lib/intro";
import { LogoHorizontal, WMark, chamfer, Button, IconPlane, IconShip, IconTrain, IconTruck, IconDoc, IconContainer, IconShield, IconClock, IconArrow } from "@/components/brand/design-system";
import { SERIES, MILESTONES, KPIS, AXIS_MAX, SIDEBAR } from "@/data/landing";

const EASE = [0.16, 1, 0.3, 1] as const;
// macOS-style genie: while animating, the window is drawn as GENIE_STRIPS horizontal slices of itself.
// Each slice is narrowed to the width of a funnel at its current height and slid up into the Open
// button, so the content itself bends (not just the outline). Slices exist only during the animation.
const GENIE_STRIPS = 150;
const clamp01 = (x: number) => Math.min(1, Math.max(0, x));
const smooth = (x: number) => { const c = clamp01(x); return c * c * (3 - 2 * c); };
// Placeholder until real TMS screens are ready; flip to true to show the mock dashboard again.
const SHOW_TMS_MOCK = false;

export default function Hero() {
  const reduce = useReducedMotion();
  const introDone = useIntroDone(); // entrances start when the loader reveals the page
  const [lang, setLang] = useState("EN");
  const [hover, setHover] = useState<{ ri: number; si: number } | null>(null);
  const [tourTip, setTourTip] = useState(true);
  // macOS-style window controls on the product preview
  const [closed, setClosed] = useState(true); // platform window starts closed
  const [minimized, setMinimized] = useState(false);
  const [zoomed, setZoomed] = useState(false);
  const collapsed = closed || minimized;
  const [genie, setGenie] = useState<null | "open" | "close">(null);
  const stripsRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = stripsRef.current;
    if (!genie || !el) return;
    const strips = Array.from(el.children) as HTMLElement[];
    const W = el.offsetWidth, H = el.offsetHeight, h = Math.ceil(H / GENIE_STRIPS); // whole-pixel slices: no resampled seams
    const slot = Math.min(230, W * 0.22); // width of the throat at the top (≈ the Open button)
    // exact pixel slices with 1px overlap (no hairline seams)
    strips.forEach((st, i) => {
      st.style.top = `${i * h}px`; st.style.height = `${h + 1}px`;
      (st.firstElementChild as HTMLElement).style.top = `${-i * h}px`;
    });
    const widthAt = (y: number, funnel: number) => {
      const throat = slot + (W - slot) * Math.pow(smooth(Math.max(0, y) / (H * 0.9)), 0.85);
      return 1 + (throat / W - 1) * funnel; // fraction of full width
    };
    const apply = (p: number) => {
      const funnel = smooth(p / 0.4);                                   // sides bend in first…
      const slide = Math.pow(clamp01((p - 0.18) / 0.82), 1.55) * (H + h); // …then the content pours up the throat
      const dy = Math.round(slide);
      for (let i = 0; i < strips.length; i++) {
        const top = i * h - slide, bot = top + h;
        if (bot < 0) { strips[i].style.transform = "scaleX(0)"; continue; }
        const kt = widthAt(top, funnel), kb = widthAt(bot, funnel), k = Math.max(kt, kb);
        // scale by the wider edge, then taper the slice to a trapezoid: the outline becomes one smooth curve.
        // The clip bleeds 1px above/below so neighbouring slices overlap without hairlines.
        const it = (((1 - kt / k) / 2) * 100).toFixed(3), ib = (((1 - kb / k) / 2) * 100).toFixed(3);
        strips[i].style.transform = `translateY(${-dy}px) scaleX(${k})`;
        strips[i].style.clipPath = `polygon(${it}% -1px, ${100 - +it}% -1px, ${100 - +ib}% calc(100% + 1px), ${ib}% calc(100% + 1px))`;
      }
    };
    const closing = genie === "close";
    apply(closing ? 0 : 1);
    const c = animate(closing ? 0 : 1, closing ? 1 : 0, {
      duration: closing ? 0.5 : 0.48, ease: closing ? [0.45, 0, 0.85, 0.5] : [0.15, 0.5, 0.3, 1], onUpdate: apply,
      onComplete: () => { if (closing) { setClosed(true); setMinimized(false); setZoomed(false); } setGenie(null); },
    });
    return () => c.stop();
  }, [genie]);
  // Closed/minimised: the hero is one screen tall and the video fills it. Open: the video band stops
  // `overlap` px above the hero bottom so the window runs past it into the page.
  const videoDesktop = useRef<HTMLVideoElement>(null);
  const videoMobile = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    // only the layout's visible video downloads and plays; the hidden twin stays at preload="none"
    [videoDesktop.current, videoMobile.current].forEach((v) => {
      if (!v) return;
      v.muted = true;
      const shown = v.offsetParent !== null;
      if (reduce || !shown) { v.pause(); return; }
      v.preload = "auto";
      const p = v.play(); if (p && p.catch) p.catch(() => {});
    });
  }, [reduce]);
  const windowFrame = (
          <div
            className="overflow-hidden border border-white/15 bg-ink-900 p-2 pt-0 shadow-[0_30px_80px_-20px_rgba(4,4,43,0.45)]"
            style={chamfer(28, "tr")}
          >
            {/* ---- window title bar (traffic lights) ---- */}
            <div className="group/tl relative flex h-9 items-center px-1">
              <div className="relative z-10 flex items-center gap-2">
                {([
                  { key: "close", color: "#ff5f57", label: "Close preview window", onClick: () => { if (genie) return; if (reduce) { setClosed(true); setMinimized(false); setZoomed(false); } else setGenie("close"); }, glyph: <path d="M3.5 3.5l5 5M8.5 3.5l-5 5" /> },
                  { key: "minimize", color: "#febc2e", label: minimized ? "Restore preview window" : "Minimise preview window", onClick: () => setMinimized((m) => !m), glyph: <path d="M3 6h6" /> },
                  { key: "zoom", color: "#28c840", label: zoomed ? "Exit full width" : "Expand to full width", onClick: () => { setZoomed((z) => !z); setMinimized(false); }, glyph: <path d="M3.5 8.5V5l3.5 3.5H3.5zM8.5 3.5V7L5 3.5h3.5z" fill="currentColor" stroke="none" /> },
                ] as const).map((b) => (
                  <button
                    key={b.key}
                    type="button"
                    data-anim={`window-${b.key}`}
                    aria-label={b.label}
                    onClick={b.onClick}
                    className="inline-flex h-3 w-3 items-center justify-center rounded-full transition-transform hover:scale-110 active:scale-95"
                    style={{ background: b.color, color: "rgba(0,0,0,0.6)", boxShadow: "inset 0 0 0 0.5px rgba(0,0,0,0.25)" }}
                  >
                    <svg viewBox="0 0 12 12" className="h-2 w-2 opacity-0 transition-opacity group-hover/tl:opacity-100" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" aria-hidden="true">{b.glyph}</svg>
                  </button>
                ))}
              </div>
              <span className="pointer-events-none absolute inset-x-0 text-center text-xs" style={{ color: "#8b8ba3" }}>tms.weforward</span>
            </div>
            <div className="overflow-hidden">
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

            {/* ---- app body (collapses on minimise) ---- */}
            <motion.div
              initial={false}
              animate={{ height: minimized ? 0 : "auto", opacity: minimized ? 0 : 1 }}
              transition={{ duration: reduce ? 0 : 0.5, ease: EASE }}
              style={{ overflow: "hidden" }}
            >
            {SHOW_TMS_MOCK ? (
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
            ) : (
            <div className="flex h-[460px] items-center justify-start bg-white px-7 md:h-[600px] md:justify-center">
              <div className="flex flex-col items-start gap-4 border-2 border-dashed border-brand-200 px-8 py-10 md:items-center md:px-16" style={{ maxWidth: "calc(100vw - 110px)" }}>
                <WMark className="h-10 w-auto" />
                <p className="wf-head text-xl md:text-3xl md:text-center" style={{ color: "#04042b" }}>Here will be TMS platform user viewpoint</p>
                <p className="wf-sub text-[10px] font-bold" style={{ color: "#8373f5" }}>tms.weforward · coming soon</p>
              </div>
            </div>
            )}
            </motion.div>
           </div>
            </div>
          </div>
  );

  return (
    <section id="hero" className={`relative z-20 overflow-hidden transition-[min-height] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${collapsed ? "min-h-[90svh]" : ""}`}>
        {/* Full-bleed hero: the port video covers header, headline and the top of the product preview;
            the preview runs on past the video into the page (Flexport-style). Navy scrim for legibility. Reduced motion: no autoplay, poster only. */}
        <div aria-hidden="true" className={`absolute inset-x-0 top-0 overflow-hidden ${collapsed ? "bottom-0" : "bottom-[180px] md:bottom-[280px]"}`} style={{ background: "#04042b", ...chamfer(72, "br") }}>
          <div style={{ position: "absolute", inset: 0, backgroundImage: "url('/assets/hero-port.webp')", backgroundSize: "cover", backgroundPosition: "center 55%" }} />
          <video ref={videoDesktop} className="hidden md:block" src="/assets/hero-720.webm" poster="/assets/hero-port.webp" muted loop playsInline preload="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <video ref={videoMobile} className="md:hidden" src="/assets/hero-540.webm" poster="/assets/hero-port.webp" muted loop playsInline preload="none"
            style={{ position: "absolute", top: 0, left: 0, width: "100%", height: "100%", objectFit: "cover" }} />
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(4,4,43,0.62) 0%, rgba(4,4,43,0.46) 45%, rgba(4,4,43,0.3) 100%)" }} />
        </div>

        {/* header */}
        <header id="header" className="relative z-20">
          <div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-5 py-4 md:gap-6 md:px-10">
            <a href="#main" aria-label="WEFORWARD home"><LogoHorizontal size="sm" wordColor="#ffffff" /></a>
            <nav aria-label="Main" className="hidden items-center gap-7 lg:flex">
              {/* labels only for now — links get wired once the target pages/sections are decided */}
              {["About us", "Services", "Track your cargo", "News", "Contact"].map((t) => (
                <span key={t} className="wf-sub cursor-default whitespace-nowrap text-xs font-bold" style={{ color: "#ffffff" }}>{t}</span>
              ))}
            </nav>
            <div className="flex items-center gap-3 md:gap-5">
              <button
                type="button"
                data-anim="lang-switch"
                onClick={() => setLang(lang === "EN" ? "KA" : "EN")}
                aria-label={`Language: ${lang === "EN" ? "English" : "Georgian"}. Switch to ${lang === "EN" ? "Georgian" : "English"}`}
                className="wf-sub inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-xs font-bold transition-colors hover:text-volt-500"
                style={{ color: "#ffffff" }}
              >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
                {lang}
              </button>
              <Button id="nav-quote" href="#quote" variant="purple">Get a quote <IconArrow /></Button>
            </div>
          </div>
        </header>

        {/* centred promise + inline quote capture */}
        <div className="relative z-10 mx-auto max-w-4xl px-6 pb-10 pt-10 text-center md:pb-12 md:pt-14">
          <h1 className="sr-only">You deal. We deliver. Freight forwarding in Georgia.</h1>
          <div aria-hidden="true">
            {["You deal.", "We deliver."].map((line, i) => (
              <div key={line} style={{ overflow: "hidden" }}>
                <motion.div
                  data-anim={`hero-line-${i}`}
                  className="wf-head text-4xl md:text-6xl"
                  style={{ color: i === 0 ? "#a296f7" : "#ffffff" }}
                  initial={reduce ? false : { y: "110%" }}
                  animate={{ y: reduce || introDone ? "0%" : "110%" }}
                  transition={{ duration: 0.9, delay: reduce ? 0 : i * 0.08, ease: [0.16, 1, 0.3, 1] }}
                >{line}</motion.div>
              </div>
            ))}
          </div>
          <motion.div
            data-anim="hero-copy"
            initial={reduce ? false : { opacity: 0, y: 16 }}
            animate={reduce || introDone ? { opacity: 1, y: 0 } : { opacity: 0, y: 16 }}
            transition={{ duration: 0.6, delay: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          >
            <p className="mx-auto mt-5 max-w-xl text-base leading-7 md:text-lg" style={{ color: "rgba(255,255,255,0.85)" }}>
              Air, sea, rail and road freight plus customs brokerage - one partner moving your cargo from China, Europe and beyond to your door in Georgia.
            </p>
          </motion.div>
        </div>

        {/* product preview — tms.weforward preview as a macOS-style window: close / minimise / zoom */}
        <motion.div
          data-anim="hero-dashboard"
          className="relative z-10 mx-auto flex flex-col px-6 md:px-10"
          initial={reduce ? false : { y: 40, maxWidth: 1152 }} // transform only: an opacity fade on an ancestor disables the button's backdrop blur until it ends
          animate={{ y: reduce || introDone ? 0 : 40, maxWidth: zoomed ? 1440 : 1152 }}
          transition={{ default: { duration: 1, delay: reduce ? 0 : 0.35, ease: EASE }, maxWidth: { duration: reduce ? 0 : 0.55, ease: EASE } }}
        >
          <AnimatePresence mode="popLayout" initial={false}>
          {closed ? (
            <motion.div
              key="dock"
              className="flex justify-center"
              initial={{ y: 16, scale: 0.96 }}
              animate={{ y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 16 }}
              transition={{ duration: reduce ? 0 : 0.35, ease: EASE }}
            >
              <button
                type="button"
                data-anim="window-reopen"
                onClick={() => { setClosed(false); if (!reduce) setGenie("open"); }}
                className="wf-sub inline-flex min-h-11 items-center gap-3 border border-white/25 bg-white/10 px-5 text-xs font-bold text-white backdrop-blur transition-colors hover:bg-white/20"
              >
                <WMark className="h-5 w-5" color="#ffffff" /> Open tms.weforward
              </button>
            </motion.div>
          ) : (
          <motion.div key="window" className="relative" exit={{ opacity: 0, transition: { duration: 0 } }}>
            <div style={{ visibility: genie ? "hidden" : "visible" }}>{windowFrame}</div>
            {genie && (
              <div ref={stripsRef} aria-hidden="true" inert className="pointer-events-none absolute inset-0 overflow-hidden">
                {Array.from({ length: GENIE_STRIPS }, (_, i) => (
                  <div key={i} className="absolute inset-x-0 overflow-hidden" style={{ transformOrigin: "50% 50%", willChange: "transform" }}>
                    <div className="absolute inset-x-0">{windowFrame}</div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
          )}
          </AnimatePresence>
        </motion.div>
      </section>
  );
}
