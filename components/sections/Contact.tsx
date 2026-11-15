"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, animate, motion, useMotionValue, useReducedMotion, useTransform } from "motion/react";
import { chamfer, WMark } from "@/components/brand/design-system";
import dotmap from "@/data/dotmap.json";

// Contact / quote request. Front-end only for now: submit validates and shows a confirmation,
// nothing is sent until a backend is connected (see onSubmit).
const NAVY = "#04042b", PURPLE = "#644ff2", LIME = "#d5f476";

const PaperPlane = ({ className = "h-4 w-4" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M14.536 21.686a.5.5 0 0 0 .937-.024l6.5-19a.497.497 0 0 0-.635-.635l-19 6.5a.5.5 0 0 0-.024.937l7.93 3.18a2 2 0 0 1 1.112 1.11z" />
    <path d="m21.854 2.147-10.94 10.939" />
  </svg>
);

/** The send icon takes off along one smooth cubic curve: it eases back a touch, then accelerates up and
 *  to the right until it leaves the viewport. Same icon and colour throughout; it only turns to follow
 *  its path and grows slightly as it "comes closer". */
function FlyingPlane({ from, onDone }: { from: DOMRect; onDone: () => void }) {
  const t = useMotionValue(0);
  const dx = window.innerWidth - from.left + 160, dy = -(from.top + 200);
  // cubic Bézier control points (relative to the start)
  const P = [[0, 0], [-34, 22], [dx * 0.45, dy * 0.02], [dx, dy]];
  const bez = (u: number, k: 0 | 1) => { const v = 1 - u; return v * v * v * P[0][k] + 3 * v * v * u * P[1][k] + 3 * v * u * u * P[2][k] + u * u * u * P[3][k]; };
  const der = (u: number, k: 0 | 1) => { const v = 1 - u; return 3 * v * v * (P[1][k] - P[0][k]) + 6 * v * u * (P[2][k] - P[1][k]) + 3 * u * u * (P[3][k] - P[2][k]); };
  const x = useTransform(t, (u) => bez(u, 0));
  const y = useTransform(t, (u) => bez(u, 1));
  // icon nose points at -45°; blend from its resting angle into the path heading once it is moving forward
  const rotate = useTransform(t, (u) => {
    const heading = (Math.atan2(der(u, 1), der(u, 0)) * 180) / Math.PI + 45;
    const w = Math.min(1, Math.max(0, (u - 0.18) / 0.3));
    return heading * w * w * (3 - 2 * w);
  });
  const scale = useTransform(t, (u) => 1 + 1.1 * u * u);
  useEffect(() => {
    const c = animate(t, 1, { duration: 1.35, ease: [0.45, 0, 0.8, 0.35], onComplete: onDone });
    return () => c.stop();
  }, [t, onDone]);
  return createPortal(
    <motion.div aria-hidden="true" className="pointer-events-none fixed z-[100] text-white will-change-transform"
      style={{ left: from.left, top: from.top, width: from.width, height: from.height, x, y, rotate, scale,
        filter: "drop-shadow(0 1px 1px rgba(4,4,43,0.45)) drop-shadow(0 6px 10px rgba(4,4,43,0.18))" }}>
      <PaperPlane className="h-full w-full" />
    </motion.div>,
    document.body,
  );
}

// Dotted Eurasia (equirectangular, lon -12..112, lat 8..66) with a single lime point at Tbilisi.
const MAP_W = dotmap.lon[1] - dotmap.lon[0], MAP_H = dotmap.lat[1] - dotmap.lat[0];
const px = ([lon, lat]: number[]) => [lon - dotmap.lon[0], dotmap.lat[1] - lat] as const;
const TBILISI = [44.79, 41.72];
const LAND_PATH = [...dotmap.land, ...dotmap.georgia].map((p) => { const [x, y] = px(p); return `M${x} ${y}h0`; }).join("");

function DotMap() {
  const reduce = useReducedMotion();
  const [gx, gy] = px(TBILISI);
  return (
    <svg viewBox={`0 0 ${MAP_W} ${MAP_H}`} preserveAspectRatio="xMidYMin slice" className="h-full w-full" aria-hidden="true">
      <path d={LAND_PATH} stroke="#ffffff" strokeOpacity="0.14" strokeWidth="0.85" strokeLinecap="round" />
      <circle cx={gx} cy={gy} r="0.7" fill={LIME} />
      {!reduce && (
        <circle cx={gx} cy={gy} r="1" fill="none" stroke={LIME} strokeWidth="0.3">
          <animate attributeName="r" values="1;4.5" dur="2.4s" repeatCount="indefinite" />
          <animate attributeName="stroke-opacity" values="0.9;0" dur="2.4s" repeatCount="indefinite" />
        </circle>
      )}
    </svg>
  );
}

export default function Contact() {
  const reduce = useReducedMotion();
  const [sent, setSent] = useState<{ first: string; email: string } | null>(null);
  const [flight, setFlight] = useState<{ from: DOMRect; first: string; email: string } | null>(null);
  const planeRef = useRef<HTMLSpanElement>(null);
  const flightRef = useRef(flight); flightRef.current = flight;
  const landed = useRef(() => { const f = flightRef.current; if (f) setSent({ first: f.first, email: f.email }); setFlight(null); }).current;

  const FIELD = "h-12 w-full appearance-none bg-white px-4 text-[14px] text-[#04042b] outline-none ring-1 ring-inset ring-[#e4e1ff] transition-[box-shadow] duration-150 placeholder:text-[#9a99ad] [@media(hover:hover)]:hover:ring-[#c9c5ff] focus:ring-2 focus:ring-[#644ff2] [&:user-invalid]:ring-[#e5484d]";
  const LABEL = "mb-2 block text-[13px] font-medium text-[#04042b]";
  const Req = () => <span aria-hidden="true" style={{ color: PURPLE }}> *</span>;

  function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    // TODO: send `f` to the quote endpoint once it exists.
    const data = { first: String(f.get("first") || ""), email: String(f.get("email") || "") };
    const rect = planeRef.current?.getBoundingClientRect();
    if (reduce || !rect) setSent(data);
    else setFlight({ from: rect, ...data });
  }

  return (
    <section id="quote" aria-labelledby="quote-title" className="bg-white px-6 pb-28 pt-10 md:px-10">
      <div className="relative isolate mx-auto grid max-w-[1280px] overflow-hidden lg:grid-cols-[minmax(0,1fr)_minmax(0,1.15fr)]">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-[#f8f7ff]" style={chamfer(40, "tr")} />

        {/* brand panel */}
        <div className="relative flex min-h-[600px] flex-col items-center justify-between gap-10 overflow-hidden px-8 py-10 text-center lg:min-h-[600px]" style={{ background: NAVY }}>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[50%] [mask-image:linear-gradient(to_bottom,transparent,#000_30%)]"><DotMap /></div>
          <WMark className="relative h-9 w-auto" color="#ffffff" />
          <div className="relative">
            <h2 id="quote-title" className="text-[clamp(1.9rem,3.2vw,2.75rem)] font-medium leading-[1.08] tracking-tight text-white">
              Where is your cargo
              <span className="block" style={{ color: "#a296f7" }}>heading next?</span>
            </h2>
            <p className="mx-auto mt-5 max-w-sm text-[15px] leading-7 text-white/75">Share a few details and our team will come back to you with a route and a quote.</p>
          </div>
          <span className="wf-sub relative px-3 py-1.5 text-[11px] font-bold tracking-[0.16em] text-white ring-1 ring-inset ring-white/40">YOU DEAL. WE DELIVER.</span>
        </div>

        {/* form */}
        <div className="relative p-6 md:p-10">
          <AnimatePresence mode="wait" initial={false}>
            {sent ? (
              <motion.div key="done" role="status" initial={reduce ? false : { opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }} className="flex h-full flex-col items-start justify-center py-10">
                <span className="grid h-12 w-12 place-items-center" style={{ background: LIME, color: NAVY, ...chamfer(10, "tr") }}>
                  <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true"><path d="m5 12.5 4.5 4.5L19 7.5" /></svg>
                </span>
                <h3 className="mt-6 text-2xl font-medium tracking-tight" style={{ color: NAVY }}>Thanks{sent.first ? `, ${sent.first}` : ""}.</h3>
                <p className="mt-3 max-w-sm text-[15px] leading-7 text-[#4b4b66]">We’ve got your request. Our team will reply to <strong className="font-medium text-[#04042b]">{sent.email}</strong> with next steps.</p>
                <button type="button" onClick={() => setSent(null)} className="mt-8 text-[13px] font-medium underline decoration-[#c9c5ff] underline-offset-4 hover:decoration-[#644ff2]" style={{ color: PURPLE }}>Send another request</button>
              </motion.div>
            ) : (
              <motion.form key="form" onSubmit={onSubmit} initial={reduce ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={reduce ? undefined : { opacity: 0, y: -8 }} transition={{ duration: 0.25 }}
                className="grid gap-5 sm:grid-cols-2">
                <label className="sm:col-span-2"><span className={LABEL}>Email<Req /></span>
                  <input name="email" type="email" required autoComplete="email" placeholder="you@company.com" className={FIELD} /></label>
                <label><span className={LABEL}>First name<Req /></span>
                  <input name="first" required autoComplete="given-name" placeholder="First name" className={FIELD} /></label>
                <label><span className={LABEL}>Last name<Req /></span>
                  <input name="last" required autoComplete="family-name" placeholder="Last name" className={FIELD} /></label>
                <label className="sm:col-span-2"><span className={LABEL}>Company <span className="font-normal text-[#9a99ad]">(optional)</span></span>
                  <input name="company" autoComplete="organization" placeholder="Company name" className={FIELD} /></label>
                <label className="sm:col-span-2"><span className={LABEL}>What are you shipping?</span>
                  <textarea name="message" rows={4} placeholder="e.g. 2 pallets of electronics from Shenzhen to Tbilisi, ready in March. Add origin, destination, weight or anything we should know."
                    className={`${FIELD} h-auto resize-none py-3 leading-6`} /></label>
                <div className="sm:col-span-2">
                  <button type="submit" disabled={!!flight} className="group flex h-12 w-full items-center justify-center gap-2 text-[14px] font-medium bg-[#04042b] text-white transition-[background-color,transform] duration-150 ease-out hover:bg-[#644ff2] active:scale-[0.99]">
                    {flight ? "Sending…" : "Send request"}
                    <span ref={planeRef} className={`inline-block h-[18px] w-[18px] transition-transform duration-200 ease-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 ${flight ? "opacity-0" : ""}`}><PaperPlane className="h-full w-full" /></span>
                  </button>
                </div>
              </motion.form>
            )}
          </AnimatePresence>
        </div>
      </div>
      {flight && <FlyingPlane from={flight.from} onDone={landed} />}
    </section>
  );
}
