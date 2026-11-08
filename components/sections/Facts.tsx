"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion } from "motion/react";
import { Reveal } from "@/components/brand/design-system";

/* Key figures over a brand-tinted globe (Emons-style "facts on the planet").
   Globe: GPT Image 2.6 render, recoloured to a brand-500 → white duotone (public/assets/globe-brand*.webp).
   Route overlay coordinates are in the image's 2048×1024 space. */

const FACTS: { value: number | string; suffix?: string; label: string }[] = [
  { value: 4, label: "Transport modes" },
  { value: 14, label: "Days China → Georgia" },
  { value: 33, suffix: " t", label: "Max load per 40HC" },
  { value: "LCL · FCL", label: "Groupage & full load" },
];

const TBILISI = { x: 950, y: 552 };
const ORIGINS = [
  { key: "china", label: "China", x: 1560, y: 600, d: "M1560 600 Q1260 470 950 552" },
  { key: "europe", label: "Europe", x: 600, y: 452, d: "M600 452 Q770 420 950 552" },
];
const EASE = [0.16, 1, 0.3, 1] as const;

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(reduce ? to : 0);
  useEffect(() => {
    if (!inView || reduce) { if (reduce) setN(to); return; }
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export default function Facts() {
  const reduce = useReducedMotion();
  const globeRef = useRef<HTMLDivElement>(null);
  const globeIn = useInView(globeRef, { once: true, amount: 0.3 });
  const draw = reduce || globeIn;

  return (
    <section id="facts" className="relative overflow-hidden pt-20 md:pt-28" style={{ background: "#ffffff" }}>
      {/* figures */}
      <div className="relative z-10 mx-auto grid max-w-6xl grid-cols-2 gap-y-10 px-6 md:grid-cols-4 md:px-10">
        {FACTS.map((f, i) => (
          <Reveal key={f.label} id={`fact-${i}`} delay={i * 0.08} className={`flex flex-col items-center text-center ${i > 0 ? "md:border-l" : ""} ${i % 2 === 1 ? "border-l md:border-l" : ""}`} style={{ borderColor: "#c9c5ff" }}>
            <p className="whitespace-nowrap text-4xl leading-none md:text-5xl xl:text-6xl" style={{ fontFamily: '"Loos Wide", Inter, sans-serif', fontWeight: 300, color: "#04042b", letterSpacing: "-0.02em" }}>
              {typeof f.value === "number" ? <CountUp to={f.value} suffix={f.suffix} /> : f.value}
            </p>
            <p className="mt-3 text-xs md:text-sm" style={{ color: "#4b4b66" }}>{f.label}</p>
          </Reveal>
        ))}
      </div>

      {/* globe — top ~72% shown, figures overlap its upper edge */}
      <div ref={globeRef} className="relative -mt-2 aspect-[16/9] overflow-hidden md:mx-auto md:-mt-24 md:aspect-[2048/740] md:max-w-[1400px]">
        <div className="absolute left-1/2 top-0 w-[160%] -translate-x-1/2 md:w-full" style={{ aspectRatio: "2 / 1" }}>
        <motion.div
          className="absolute inset-0"
          initial={reduce ? false : { opacity: 0, y: 60 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.05 }}
          transition={{ duration: 1.1, ease: EASE }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/assets/globe-brand.webp"
            srcSet="/assets/globe-brand-1200.webp 1200w, /assets/globe-brand.webp 2048w"
            sizes="(min-width: 1400px) 1400px, 100vw"
            alt=""
            aria-hidden="true"
            className="absolute inset-0 h-full w-full select-none"
            draggable={false}
          />
          {/* routes into Tbilisi */}
          <svg viewBox="0 0 2048 1024" className="absolute inset-0 h-full w-full" aria-hidden="true">
            <defs>
              {ORIGINS.map((o, i) => (
                <mask key={o.key} id={`route-${o.key}`} maskUnits="userSpaceOnUse" x="0" y="0" width="2048" height="1024">
                  <motion.path
                    d={o.d}
                    fill="none"
                    stroke="#ffffff"
                    strokeWidth={14}
                    initial={reduce ? false : { pathLength: 0 }}
                    animate={draw ? { pathLength: 1 } : {}}
                    transition={{ duration: 1.6, delay: 0.4 + i * 0.3, ease: EASE }}
                  />
                </mask>
              ))}
            </defs>
            {ORIGINS.map((o) => (
              <g key={o.key}>
                {/* dashed route, revealed by the animated mask stroke */}
                <path d={o.d} fill="none" stroke="#644ff2" strokeWidth={4} strokeLinecap="round" strokeDasharray="14 14" mask={`url(#route-${o.key})`} />
                <circle cx={o.x} cy={o.y} r={9} fill="#644ff2" />
                <text x={o.x} y={o.y - 22} textAnchor="middle" fontSize={26} fontWeight={600} fill="#04042b" style={{ fontFamily: '"Loos Wide", Inter, sans-serif', letterSpacing: "0.04em" }}>{o.label.toUpperCase()}</text>
              </g>
            ))}
            {/* Tbilisi marker with pulse */}
            {!reduce && (
              <motion.circle
                cx={TBILISI.x} cy={TBILISI.y} r={14} fill="none" stroke="#d5f476" strokeWidth={4}
                animate={{ r: [14, 46], opacity: [0.9, 0] }}
                transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
              />
            )}
            <circle cx={TBILISI.x} cy={TBILISI.y} r={14} fill="#d5f476" stroke="#04042b" strokeWidth={4} />
            <text x={TBILISI.x} y={TBILISI.y + 52} textAnchor="middle" fontSize={28} fontWeight={700} fill="#04042b" style={{ fontFamily: '"Loos Wide", Inter, sans-serif', letterSpacing: "0.04em" }}>TBILISI</text>
          </svg>
        </motion.div>
        </div>
        {/* fade the cut edge into the next section */}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24" style={{ background: "linear-gradient(180deg, rgba(255,255,255,0) 0%, #ffffff 100%)" }} />
      </div>
    </section>
  );
}
