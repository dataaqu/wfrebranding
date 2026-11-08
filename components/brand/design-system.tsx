"use client";

import { useEffect } from "react";
import { motion, useReducedMotion, useAnimate } from "motion/react";
import { stagger } from "motion";

/* ------------------------------------------------------------------ */
/* Fonts — Loos Wide from assets/fonts (preview only; web licence is   */
/* the owner's responsibility). Falls back to Inter until files exist. */
/* ------------------------------------------------------------------ */
export function BrandFonts() {
  return (
    <style>{`
.wf-head{font-family:"Loos Wide","Inter",ui-sans-serif,system-ui,sans-serif;font-weight:700;text-transform:uppercase;letter-spacing:-0.01em;line-height:0.95 !important}
@font-face{font-family:"Loos Wide";src:url("/assets/fonts/fonnts.com-Loos_Wide_Light.otf") format("opentype");font-weight:300;font-display:swap}
@font-face{font-family:"Loos Wide";src:url("/assets/fonts/fonnts.com-Loos_Wide_Medium.otf") format("opentype");font-weight:400 500;font-display:swap}
@font-face{font-family:"Loos Wide";src:url("/assets/fonts/fonnts.com-Loos_Wide_Bold.otf") format("opentype");font-weight:600 900;font-display:swap}
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
    <span className="inline-flex items-center gap-3" aria-label="WEFORWARD — You deal. We deliver.">
      <WMark className={`${h} w-auto`} color={markColor} />
      <span className="flex flex-col">
        <Wordmark className={`${w} w-auto`} color={wordColor} />
        {tagline && <span className="mt-1.5 text-xs font-semibold uppercase" style={{ color: wordColor, letterSpacing: "0.12em", fontSize: 9 }}>You deal. We deliver.</span>}
      </span>
    </span>
  );
}

/* ------------------------------------------------------------------ */
/* Intro — brand loader + transition, GSAP-style timeline built with   */
/* Motion useAnimate sequences (guide:gsap-to-motion.md#3, #7) and     */
/* line drawing with pathLength (guide:recipes-svg.md#0).              */
/* The logo is "written": only the W uses an outline draw (person's    */
/* exception to the no-outline rule); dots and name just appear.       */
/*   0.00  W outline draws                        easeInOut .80         */
/*   0.60  W fills                                .30                   */
/*   0.85  dots appear, 100 ms apart              .15                   */
/*   1.05  WEFORWARD typed letter by letter       .12 each, 70 ms       */
/*   2.20  logo scales down + fades               power-in .40          */
/*   2.35  4 purple-tint panels wipe up           expo-inOut .55, 70 ms */
/*   3.15  panels continue up, revealing page     expo-inOut .65, 70 ms */
/* Reduced motion: static logo, then a 300 ms fade; no panels.         */
/* ------------------------------------------------------------------ */
export const INTRO_REVEAL_AT = 3.35;
const EXPO_OUT = [0.16, 1, 0.3, 1] as const;
const EXPO_IN_OUT = [0.87, 0, 0.13, 1] as const;
const BACK_OUT = [0.34, 1.56, 0.64, 1] as const;
const POWER_IN = [0.7, 0, 0.84, 0] as const;
// One colour, stepped through its guideline tints (Accent Purple 100 / 80 / 60 / 40 %).
const PANELS = ["#644ff2", "#8373f5", "#a296f7", "#c1b9fa"];

export function Intro({ onDone }: { onDone?: () => void }) {
  const reduce = useReducedMotion();
  const [scope, animate] = useAnimate();

  useEffect(() => {
    if (reduce) {
      const c = animate(scope.current, { opacity: [1, 0] }, { duration: 0.3, delay: 0.8 });
      c.then(() => onDone?.());
      return () => c.stop();
    }
    const c = animate([
      [".wf-mark-body-line", { pathLength: [0, 1], opacity: [1, 1] }, { duration: 0.8, ease: "easeInOut", at: 0 }],
      [".wf-mark-body", { opacity: [0, 1] }, { duration: 0.3, ease: "easeOut", at: 0.6 }],
      [".wf-mark-body-line", { opacity: [1, 0] }, { duration: 0.2, ease: "easeOut", at: 0.85 }],
      [".wf-mark-dot", { opacity: [0, 1] }, { duration: 0.15, ease: "easeOut", delay: stagger(0.1), at: 0.85 }],
      [".wf-letter", { opacity: [0, 1] }, { duration: 0.12, ease: "easeOut", delay: stagger(0.07), at: 1.05 }],
      [".wf-intro-logo", { scale: [1, 0.9], opacity: [1, 0], y: [0, -24] }, { duration: 0.4, ease: POWER_IN, at: 2.2 }],
      [".wf-panel", { y: ["100%", "0%"] }, { duration: 0.55, ease: EXPO_IN_OUT, delay: stagger(0.07), at: 2.35 }],
      [".wf-intro-bg", { opacity: [1, 0] }, { duration: 0.01, at: 3.1 }],
      [".wf-panel", { y: ["0%", "-100%"] }, { duration: 0.65, ease: EXPO_IN_OUT, delay: stagger(0.07), at: 3.15 }],
    ]);
    c.then(() => onDone?.());
    return () => c.stop();
  }, []);

  return (
    <div ref={scope} className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden="true">
      <div className="wf-intro-bg absolute inset-0 bg-ink-950" />
      <div className="wf-intro-logo absolute inset-0 flex flex-col items-center justify-center gap-7">
        <svg viewBox="-4 -4 192 245" className="h-28 w-auto overflow-visible md:h-36">
          <polygon className="wf-mark-body" points={MARK_BODY} fill="var(--color-brand-500)" style={reduce ? undefined : { opacity: 0 }} />
          <polygon className="wf-mark-dot" points={MARK_DOT_L} fill="var(--color-brand-500)" style={reduce ? undefined : { opacity: 0 }} />
          <polygon className="wf-mark-dot" points={MARK_DOT_R} fill="var(--color-brand-500)" style={reduce ? undefined : { opacity: 0 }} />
          {!reduce && (
            <g fill="none" stroke="var(--color-brand-500)" strokeWidth={3} strokeLinejoin="miter">
              <polygon className="wf-mark-body-line" points={MARK_BODY} style={{ opacity: 0 }} />
            </g>
          )}
        </svg>
        <Wordmark className="h-8 w-auto md:h-11" animated={!reduce} />
      </div>
      {!reduce && (
        <div className="absolute inset-0 flex">
          {PANELS.map((c, i) => (
            <div key={i} className="wf-panel h-full flex-1" style={{ background: c, transform: "translateY(100%)" }} />
          ))}
        </div>
      )}
    </div>
  );
}

/** Oversized cropped W — the signature graphic element. Place inside a relative, overflow-hidden parent. */
export function WGraphic({ className = "", color = "var(--color-brand-500)" }: { className?: string; color?: string }) {
  return (
    <svg viewBox="0 0 184 237" preserveAspectRatio="xMinYMin meet" className={`pointer-events-none absolute ${className}`} aria-hidden="true">
      <polygon points={MARK_DOT_L} fill={color} />
      <polygon points={MARK_DOT_R} fill={color} />
      <polygon points={MARK_BODY} fill={color} />
    </svg>
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

export function Tag({ children, tone = "lime" }: { children: React.ReactNode; tone?: "lime" | "purple" | "white" }) {
  const c = tone === "lime" ? "bg-volt-500 text-ink-950" : tone === "purple" ? "bg-brand-500 text-white" : "bg-white text-ink-950";
  return (
    <span className={`wf-sub inline-flex items-center gap-2 whitespace-nowrap px-3 py-1.5 pr-5 text-xs font-bold ${c}`} style={chamfer(10, "br")}>
      {children}
    </span>
  );
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
export const IconPhone = ({ className = "h-5 w-5" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true"><path d="M6.6 2.5 9.8 6l-1.9 2.6a12 12 0 0 0 7.5 7.5L18 14.2l3.5 3.2-1.8 3.6c-.4.6-1 .9-1.7.9C9.9 21.9 2.1 14.1 2.1 6c0-.7.3-1.3.9-1.7l3.6-1.8z" /></svg>
);
export const IconArrow = ({ className = "h-4 w-4" }: IconProps) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="M4 12h15M13 5l7 7-7 7" /></svg>
);
