"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { createTimeline, stagger, svg, utils, type Timeline } from "animejs";
import { markIntroDone, preloadCritical } from "@/lib/intro";

/* ------------------------------------------------------------------ */
/* Fonts — Loos Wide from assets/fonts (preview only; web licence is   */
/* the owner's responsibility). Falls back to Inter until files exist. */
/* ------------------------------------------------------------------ */
export function BrandFonts() {
  return (
    <style>{`
.wf-head{font-family:"Loos Wide","Inter",ui-sans-serif,system-ui,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-0.01em;line-height:0.95 !important}
@font-face{font-family:"Loos Wide";src:url("/assets/fonts/loos-wide-light.woff2") format("woff2");font-weight:300;font-display:swap}
@font-face{font-family:"Loos Wide";src:url("/assets/fonts/loos-wide-medium.woff2") format("woff2");font-weight:400 500;font-display:swap}
@font-face{font-family:"Loos Wide";src:url("/assets/fonts/loos-wide-bold.woff2") format("woff2");font-weight:600 900;font-display:swap}
.wf-head span{font-size:inherit !important;line-height:inherit !important;font-weight:inherit;letter-spacing:inherit}
.wf-sub{font-family:"Loos Wide","Inter",ui-sans-serif,system-ui,sans-serif;font-weight:500;text-transform:uppercase;letter-spacing:0.04em}
`}</style>
  );
}

/* ------------------------------------------------------------------ */
/* Logo — W mark traced from the brand guideline (viewBox 184×237).    */
/* ------------------------------------------------------------------ */
export const MARK_BODY = "5,71 41,87 38,167 71,77 108,68 132,157 131,44 184,63 162,229 103,237 86,133 52,227 0,197";
export const MARK_DOT_L = "5,28 45,28 45,67 5,60";
export const MARK_DOT_R = "144,0 184,0 184,46 144,39";

export function WMark({ className = "", color = "var(--color-brand-500)", title }: { className?: string; color?: string; title?: string }) {
  return (
    <svg viewBox="0 0 184 237" className={className} role={title ? "img" : undefined} aria-label={title} aria-hidden={title ? undefined : true}>
      <polygon points={MARK_DOT_L} fill={color} />
      <polygon points={MARK_DOT_R} fill={color} />
      <polygon points={MARK_BODY} fill={color} />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/* Wordmark — geometric WEFORWARD letterforms redrawn from the logo    */
/* (cap height 100, viewBox 992×100). Letters are separate paths so    */
/* they can be animated one by one (class "wf-letter").                */
/* ------------------------------------------------------------------ */
const L_W = "M0 0H30L44 62L60 0H90L106 62L120 0H150L124 100H92L75 40L58 100H26Z";
const L_E = "M0 0H70V22H24V39H64V61H24V78H70V100H0Z";
const L_F = "M0 0H66V22H24V40H60V62H24V100H0Z";
const L_O = "M52 0A50 50 0 1 1 52 100A50 50 0 1 1 52 0ZM52 24A26 26 0 1 0 52 76A26 26 0 1 0 52 24Z";
const L_R = "M0 0H54A31 31 0 0 1 64 60L88 100H60L40 62H24V100H0ZM24 22H52A9 9 0 0 1 52 40H24Z";
const L_A = "M0 100V46A46 46 0 0 1 46 0H54A46 46 0 0 1 100 46V100H76V76H24V100ZM24 54H76V46A22 22 0 0 0 54 24H46A22 22 0 0 0 24 46Z";
const L_D = "M0 0H46A50 50 0 0 1 46 100H0ZM24 24H46A26 26 0 0 1 46 76H24Z";
export const WORDMARK: [string, number][] = [[L_W, 0], [L_E, 160], [L_F, 240], [L_O, 316], [L_R, 430], [L_W, 528], [L_A, 688], [L_R, 798], [L_D, 896]];

export function Wordmark({ className = "", color = "#ffffff", animated = false }: { className?: string; color?: string; animated?: boolean }) {
  return (
    <svg viewBox="0 0 992 100" className={className} role="img" aria-label="WEFORWARD" style={{ overflow: "visible" }}>
      {WORDMARK.map(([d, x], i) => (
        <g key={i} transform={`translate(${x} 0)`}>
          <path className={animated ? "wf-letter" : undefined} d={d} fill={color} fillRule="evenodd" style={animated ? { opacity: 0 } : undefined} />
        </g>
      ))}
    </svg>
  );
}

/** Horizontal secondary logo. Approved combos: navy bg → purple mark + white word. */
export function LogoHorizontal({ markColor = "var(--color-brand-500)", wordColor = "#ffffff", tagline = false, size = "md" }: { markColor?: string; wordColor?: string; tagline?: boolean; size?: "sm" | "md" | "lg" }) {
  const h = size === "lg" ? "h-14" : size === "sm" ? "h-8" : "h-10";
  const w = size === "lg" ? "h-6" : size === "sm" ? "h-3.5" : "h-4";
  return (
    <span className="inline-flex items-center gap-3" aria-label="WEFORWARD - You deal. We deliver.">
      <WMark className={`${h} w-auto`} color={markColor} />
      <span className="flex flex-col">
        <Wordmark className={`${w} w-auto`} color={wordColor} />
        {tagline && <span className="mt-1.5 text-xs font-semibold uppercase" style={{ color: wordColor, letterSpacing: "0.12em", fontSize: 9 }}>You deal. We deliver.</span>}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Intro — brand loader + transition, an Anime.js v4 timeline.         */
/* Writing — a hero signing their emblem: four fast, separate strokes  */
/* (down, up, down, up). Each stroke owns a slice of the W (clipPath)  */
/* and is revealed by its own pen (svg.createDrawable), so no stroke   */
/* bleeds into the next.                                              */
/*   0.00  4 strokes, 50 ms apart                  inOut(2.5) .21–.23   */
/*   ~1.1  dots tapped in, 90 ms apart             outBack .40          */
/*   ~1.3  WEFORWARD typed letter by letter        .26 each, 55 ms      */
/*   ~2.0  logo written; if critical assets (lib/intro) are still       */
/*         loading, a lime progress bar shows and the intro waits       */
/*         (max 6 s).                                                   */
/* Exit: the word drops away, then the mark turns into a window — the  */
/* dark backdrop gets a W-shaped hole exactly where the logo was, and  */
/* the hole zooms past the camera until the page fills the screen.     */
/* markIntroDone() fires part-way so the page's entrances overlap.     */
/* Reduced motion: static logo, then a 300 ms fade.                    */
/* ------------------------------------------------------------------ */
// The W's four strokes in writing order (mark viewBox units). `clip` is the slice of the W the
// stroke owns (slices overlap by ~1.5 so no seam shows); the pen runs a→b, a little past the
// shape at both ends, with butt caps so it reveals nothing ahead of itself.
const STROKES: { clip: string; a: [number, number]; b: [number, number]; ms: number }[] = [
  { clip: "-20,-10 42.5,-10 42.5,87 39.5,167 27.5,250 -20,250", a: [22, 20], b: [25, 250], ms: 210 },  // left arm, down
  { clip: "41,-10 89.5,-10 89.5,250 26,250 38,167 41,87", a: [10, 236], b: [100, 40], ms: 230 },        // up to the peak
  { clip: "88,-10 130,-10 130.5,150 134,165 129.5,250 88,250", a: [82, 40], b: [128, 256], ms: 220 },         // down into the valley
  { clip: "131,-10 200,-10 200,250 128,250 132,157", a: [124, 256], b: [164, 10], ms: 230 },            // right arm, up
];
const PEN_WIDTH = 100;
// zoom origin: a point well inside the mark (middle peak), so the hole always grows over it
const ZOOM_X = 90, ZOOM_Y = 112;
const VIEW_X = -4, VIEW_Y = -4, VIEW_H = 245; // mark viewBox origin + height

export function Intro({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const scope = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0);
  const [waiting, setWaiting] = useState(false);
  const [hydrated, setHydrated] = useState(false); // until then a CSS fallback fades the logo in (slow JS)

  useEffect(() => {
    let alive = true;
    const root = scope.current!;
    const $ = (sel: string) => Array.from(root.querySelectorAll<SVGElement>(sel));
    const html = document.documentElement, prevOverflow = html.style.overflow;
    html.style.overflow = "hidden"; // no scrolling under the loader
    // assets load in the background while the logo is written; on slow networks the reveal waits for
    // them (progress bar), but never longer than MAX_WAIT so the page is always reachable
    const MAX_WAIT = 6000;
    const ready = Promise.race([preloadCritical((p) => alive && setProgress(p)), new Promise<void>((r) => setTimeout(r, MAX_WAIT))]);
    const reveal = () => { html.style.overflow = prevOverflow; markIntroDone(); };
    // JS arrived late (slow network): the CSS fallback already showed the logo, so don't rewrite it
    const late = performance.now() > 1100;
    setHydrated(true);
    let write: Timeline | null = null, exit: Timeline | null = null, startTimer = 0;

    if (reduce) {
      // same markup as the animated intro (so SSR and hydration agree); just show the finished logo
      utils.set($(".wf-mark-body, .wf-mark-dot, .wf-letter"), { opacity: 1 });
      ready.then(() => {
        if (!alive) return;
        reveal();
        exit = createTimeline({ onComplete: () => onDone?.() }).add(root, { opacity: [1, 0], duration: 300, ease: "linear" });
      });
      return () => { alive = false; exit?.revert(); html.style.overflow = prevOverflow; };
    }

    // 1) write the logo (≈1.9 s) — skipped when the static fallback is already showing it
    if (late) utils.set($(".wf-mark-body, .wf-mark-dot, .wf-letter"), { opacity: 1 });
    else {
      utils.set($(".wf-mark-body"), { opacity: 1 }); // hidden by the pen masks until written
      const pens = svg.createDrawable($(".wf-pen"));
      utils.set(pens, { draw: "0 0" });
      // paused until the page settles: hydration blocks the main thread for the first few hundred ms,
      // and a timeline started then skips its opening frames, so the first stroke looks already begun
      write = createTimeline({ autoplay: false });
      let t = 0;
      STROKES.forEach(({ ms }, i) => {
        write!.add(pens[i], { draw: ["0 0", "0 1"], duration: ms, ease: "inOut(2.5)" }, t);
        t += ms + 50;
      });
      write
        .add($(".wf-mark-dot"), { scale: [0, 1], opacity: [1, 1], duration: 400, ease: "outBack(2.5)", delay: stagger(90) }, t + 40)
        .add($(".wf-letter"), { opacity: [0, 1], y: [10, 0], duration: 260, ease: "out(3)", delay: stagger(55) }, t + 240);
      // start once 6 frames in a row arrive on time (max 1.2 s), after a short empty beat
      const t0 = performance.now();
      let last = t0, calm = 0;
      const watch = (now: number) => {
        if (!alive) return;
        calm = now - last < 40 ? calm + 1 : 0; // hydration stalls are 50 ms+
        last = now;
        if (calm >= 6 || now - t0 > 1200) startTimer = window.setTimeout(() => alive && write?.play(), 150);
        else requestAnimationFrame(watch);
      };
      requestAnimationFrame(watch);
    }

    let revealTimer = 0;
    (write ?? Promise.resolve()).then(() => {
      if (!alive) return;
      // 2) still loading? show the progress bar and wait
      let loaded = false;
      ready.then(() => { loaded = true; });
      setTimeout(() => { if (alive && !loaded) setWaiting(true); }, 250);
      return ready;
    }).then(() => {
      if (!alive) return;
      setWaiting(false);
      // 3) window zoom: place the hole exactly over the on-screen mark, swap the purple mark for
      //    the hole (the page shows through the W), then zoom the hole past the camera
      const box = root.querySelector(".wf-intro-mark")!.getBoundingClientRect();
      const k = box.height / VIEW_H; // px per mark unit
      const cx = box.left + (ZOOM_X - VIEW_X) * k, cy = box.top + (ZOOM_Y - VIEW_Y) * k;
      const hole = root.querySelector<SVGGElement>(".wf-hole")!;
      const z = { s: 1 };
      const place = () => hole.setAttribute("transform", `translate(${cx} ${cy}) scale(${k * z.s}) translate(${-ZOOM_X} ${-ZOOM_Y})`);
      place();
      // big enough that the hole's nearest edge (~21 units from the zoom point) clears the far corner
      const far = Math.hypot(Math.max(cx, innerWidth - cx), Math.max(cy, innerHeight - cy));
      const S = (far / (20 * k)) * 1.1;
      exit = createTimeline({ onComplete: () => { root.style.visibility = "hidden"; onDone?.(); } })
        .add($(".wf-letter"), { opacity: 0, y: 14, duration: 280, ease: "in(2)", delay: stagger(25) }, 0)
        .add($(".wf-progress"), { opacity: 0, duration: 200 }, 0)
        .set($(".wf-intro-mark"), { opacity: 0 }, 380)
        .set(hole, { opacity: 1 }, 380)
        .add(z, { s: [1, S], duration: 1300, ease: "inOut(4)", onUpdate: place }, 380);
      revealTimer = window.setTimeout(reveal, 380 + 650);
    });
    return () => { alive = false; write?.revert(); exit?.revert(); clearTimeout(revealTimer); clearTimeout(startTimer); html.style.overflow = prevOverflow; };
  }, []);

  const dotStyle = { transformBox: "fill-box", transformOrigin: "center" } as const;
  return (
    <div ref={scope} className={`pointer-events-none fixed inset-0 z-50 overflow-hidden ${hydrated ? "" : "wf-intro-static"}`}>
      {/* backdrop: solid until the exit, when the W-shaped hole in its mask turns on and zooms */}
      <svg className="wf-intro-bg absolute inset-0 h-full w-full" aria-hidden>
        <defs>
          <mask id="wf-intro-window" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">
            <rect width="100%" height="100%" fill="#fff" />
            <g className="wf-hole" fill="#000" style={{ opacity: 0 }}>
              <polygon points={MARK_BODY} />
              <polygon points={MARK_DOT_L} />
              <polygon points={MARK_DOT_R} />
            </g>
          </mask>
        </defs>
        <rect width="100%" height="100%" fill="var(--color-ink-950)" mask="url(#wf-intro-window)" />
      </svg>
      <div className="wf-intro-logo absolute inset-0 flex flex-col items-center justify-center gap-7">
        <svg viewBox={`${VIEW_X} ${VIEW_Y} 192 ${VIEW_H}`} className="wf-intro-mark h-28 w-auto overflow-visible md:h-36">
          {/* the server can't know about reduced motion, so the markup never branches on it */}
          <>
            {/* pens start fully drawn (so the CSS fallback shows the whole W); JS rewinds and writes them */}
            <defs>
              {STROKES.map(({ clip, a, b }, i) => (
                <g key={i}>
                  <clipPath id={`wf-intro-slice-${i}`}><polygon points={clip} /></clipPath>
                  <mask id={`wf-intro-pen-${i}`} maskUnits="userSpaceOnUse" x={-60} y={-60} width={320} height={380}>
                    <path className="wf-pen" d={`M${a[0]},${a[1]} L${b[0]},${b[1]}`} fill="none" stroke="#fff" strokeWidth={PEN_WIDTH} strokeLinecap="butt" />
                  </mask>
                </g>
              ))}
            </defs>
            {STROKES.map((_, i) => (
              <g key={i} clipPath={`url(#wf-intro-slice-${i})`}>
                <polygon className="wf-mark-body" points={MARK_BODY} fill="var(--color-brand-500)" mask={`url(#wf-intro-pen-${i})`} style={{ opacity: 0 }} />
              </g>
            ))}
          </>
          <polygon className="wf-mark-dot" points={MARK_DOT_L} fill="var(--color-brand-500)" style={{ ...dotStyle, opacity: 0 }} />
          <polygon className="wf-mark-dot" points={MARK_DOT_R} fill="var(--color-brand-500)" style={{ ...dotStyle, opacity: 0 }} />
        </svg>
        <Wordmark className="h-8 w-auto md:h-11" animated />
        {/* shown only if assets are still loading once the logo is written */}
        <div role="progressbar" aria-label="Loading" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress * 100)}
          className={`wf-progress h-[2px] w-40 overflow-hidden bg-white/10 transition-opacity duration-300 md:w-56 ${waiting ? "opacity-100" : "opacity-0"}`}>
          <div className="h-full origin-left bg-[#d5f476] transition-transform duration-500 ease-out" style={{ transform: `scaleX(${Math.max(0.04, progress)})` }} />
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/* Chamfer — 45° cut corner used on frames, tags and header bars.      */
/* ------------------------------------------------------------------ */
export function chamfer(size = 32, corner: "tr" | "bl" | "br" | "tl" = "tr"): React.CSSProperties {
  const s = `${size}px`;
  const map = {
    tr: `polygon(0 0, calc(100% - ${s}) 0, 100% ${s}, 100% 100%, 0 100%)`,
    br: `polygon(0 0, 100% 0, 100% calc(100% - ${s}), calc(100% - ${s}) 100%, 0 100%)`,
    bl: `polygon(0 0, 100% 0, 100% 100%, ${s} 100%, 0 calc(100% - ${s}))`,
    tl: `polygon(${s} 0, 100% 0, 100% 100%, 0 100%, 0 ${s})`,
  };
  return { clipPath: map[corner] };
}

/* ------------------------------------------------------------------ */
/* Buttons                                                             */
/* ------------------------------------------------------------------ */
export function Button({ children, id, variant = "lime", type = "button", href, onClick }: { children: React.ReactNode; id: string; variant?: "lime" | "purple" | "ghost"; type?: "button" | "submit"; href?: string; onClick?: () => void }) {
  const reduce = useReducedMotion();
  const styles = {
    lime: "bg-volt-500 text-ink-950 hover:bg-volt-400",
    purple: "bg-brand-500 text-white hover:bg-brand-400",
    ghost: "border border-white/40 text-white hover:border-white",
  }[variant];
  const cls = `wf-sub inline-flex min-h-12 shrink-0 whitespace-nowrap items-center justify-center gap-3 rounded-btn px-6 text-[13px] font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt-500 ${styles}`;
  const tap = reduce ? undefined : { scale: 0.98 };
  if (href) {
    return <motion.a data-anim={id} href={href} whileTap={tap} transition={{ duration: 0.12 }} className={cls} style={variant !== "ghost" ? chamfer(14, "br") : undefined}>{children}</motion.a>;
  }
  return <motion.button data-anim={id} type={type} onClick={onClick} whileTap={tap} transition={{ duration: 0.12 }} className={cls} style={variant !== "ghost" ? chamfer(14, "br") : undefined}>{children}</motion.button>;
}

/* ------------------------------------------------------------------ */
/* Reveal on view — from guide:recipes-scroll.md#0 (Motion React).     */
/* Reduced motion: no travel, content shown immediately.               */
/* ------------------------------------------------------------------ */
export function Reveal({ children, id, delay = 0, className = "", style }: { children: React.ReactNode; id: string; delay?: number; className?: string; style?: React.CSSProperties }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      data-anim={id}
      className={className}
      style={style}
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5, delay: reduce ? 0 : delay, ease: [0.22, 1, 0.36, 1] }}
    >
      {children}
    </motion.div>
  );
}

/* ------------------------------------------------------------------ */
/* Icons — solid glyph style, like the guideline's logistics set.      */
/* ------------------------------------------------------------------ */
type IconProps = { className?: string };
export const IconPlane = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M21.5 15.5v-2L13.5 8.5V3.8a1.5 1.5 0 0 0-3 0v4.7L2.5 13.5v2l8-2.5v5.2l-2 1.5v1.8l3.5-1 3.5 1v-1.8l-2-1.5V13l8 2.5z" /></svg>
);
export const IconShip = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M9 2h6v3h3v5.2l2.6.9-2.3 6.4c-.9 0-1.8-.4-2.5-1.1a3.5 3.5 0 0 1-5 0 3.5 3.5 0 0 1-5 0c-.6.6-1.4 1-2.2 1.1L1.4 11.1 6 9.6V5h3V2zm-1 5v2l4-1.3 4 1.3V7H8zM2 20.5c1.2 0 2.2-.5 3-1.2a4.3 4.3 0 0 0 6 0 4.3 4.3 0 0 0 6 0c.8.7 1.8 1.2 3 1.2V22c-1.1 0-2.1-.3-3-.9a5.8 5.8 0 0 1-6 0 5.8 5.8 0 0 1-6 0c-.9.6-1.9.9-3 .9v-1.5z" /></svg>
);
export const IconTrain = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M7 2h10a3 3 0 0 1 3 3v10a3 3 0 0 1-2.2 2.9L20 21h-2.5l-2-3h-7l-2 3H4l2.2-3.1A3 3 0 0 1 4 15V5a3 3 0 0 1 3-3zm-1 4v4h5V6H6zm7 0v4h5V6h-5zM7.5 13a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3zm9 0a1.5 1.5 0 1 0 0 3 1.5 1.5 0 0 0 0-3z" /></svg>
);
export const IconTruck = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M1 5h13v11H1V5zm14 3h4l4 4.5V16h-8V8zm2 1.5V12h3.6l-2.2-2.5H17zM5.5 15.5a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5zm12 0a2.5 2.5 0 1 1 0 5 2.5 2.5 0 0 1 0-5z" /></svg>
);
export const IconDoc = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M5 2h9l5 5v15H5V2zm8 1.5V8h4.5L13 3.5zM8 12v1.5h8V12H8zm0 3.5V17h8v-1.5H8zm0-7V10h4V8.5H8z" /></svg>
);
export const IconContainer = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M11 1h2v3l7 5H4l7-5V1zM2 10h20v12H2V10zm3 2v8h1.5v-8H5zm3.5 0v8H10v-8H8.5zm3.5 0v8h1.5v-8H12zm3.5 0v8H17v-8h-1.5z" /></svg>
);
export const IconShield = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M12 1.5 21 5v6.5c0 5.2-3.8 9.7-9 11-5.2-1.3-9-5.8-9-11V5l9-3.5zm-1.2 13.8 5.7-5.7-1.4-1.4-4.3 4.3-2.1-2.1-1.4 1.4 3.5 3.5z" /></svg>
);
export const IconClock = ({ className = "h-6 w-6" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 1 1 0 20 10 10 0 0 1 0-20zm-1 4.5V13l4.6 3.2.9-1.3-3.5-2.4V6.5h-2z" /></svg>
);
export const IconArrow = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>
);
