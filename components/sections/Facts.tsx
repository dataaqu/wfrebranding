"use client";

import { useEffect, useRef, useState } from "react";
import { animate, motion, useInView, useReducedMotion, useScroll, useTransform } from "motion/react";
import FactsGlobe from "./FactsGlobe";

/* Emons-style pinned facts scene: the panel sticks while you scroll ~2 screens;
   figures rise into the centre, a WebGL globe rises from below, rotates and shrinks into a
   full sphere behind them, then locations/routes into Tbilisi and orbit rings fade in. */

const FACTS: { value: number | string; suffix?: string; label: string }[] = [
  { value: 4, label: "Transport modes" },
  { value: 14, label: "Days China → Georgia" },
  { value: 33, suffix: " t", label: "Max load per 40HC" },
  { value: "LCL · FCL", label: "Groupage & full load" },
];
const EASE = [0.16, 1, 0.3, 1] as const;

function CountUp({ to, suffix = "" }: { to: number; suffix?: string }) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true, amount: 0.6 });
  const reduce = useReducedMotion();
  const [n, setN] = useState(0);
  useEffect(() => {
    if (!inView) return;
    if (reduce) { setN(to); return; }
    const c = animate(0, to, { duration: 1.4, ease: EASE, onUpdate: (v) => setN(Math.round(v)) });
    return () => c.stop();
  }, [inView, reduce, to]);
  return <span ref={ref}>{n}{suffix}</span>;
}

export default function Facts() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  // figures rise from the bottom of the pinned panel into the centre during the first part of the scroll
  const figY = useTransform(scrollYProgress, [0, 0.15], reduce ? ["0vh", "0vh"] : ["6vh", "0vh"]);

  return (
    <section id="facts" ref={sectionRef} className="relative" style={{ height: reduce ? "100vh" : "260vh" }}>
      <div className="sticky top-0 h-screen p-2 md:p-3">
        <div className="relative h-full w-full overflow-hidden" style={{ background: "#f1efff" }}>
          <p className="wf-sub absolute left-5 top-5 z-20 flex items-center gap-2 text-[10px] font-bold md:left-7 md:top-6" style={{ color: "#04042b" }}>
            <span className="inline-block h-2 w-2 rounded-full" style={{ background: "#644ff2" }} /> Key figures
          </p>

          <FactsGlobe progress={scrollYProgress} reduce={reduce} />

          {/* figures */}
          <motion.div className="absolute inset-0 z-10 flex items-center justify-center px-4" style={{ y: figY }}>
            <div className="grid w-full max-w-5xl grid-cols-2 gap-y-8 -mt-[34vh] md:-mt-[30vh] md:grid-cols-4">
              {FACTS.map((f, i) => (
                <div key={f.label} className={`flex flex-col items-center text-center ${i > 0 ? "md:border-l" : ""} ${i % 2 === 1 ? "border-l" : ""}`} style={{ borderColor: "rgba(4,4,43,0.35)" }}>
                  <p className="whitespace-nowrap text-4xl leading-none md:text-5xl xl:text-6xl" style={{ fontFamily: '"Loos Wide", Inter, sans-serif', fontWeight: 300, color: "#04042b", letterSpacing: "-0.02em", textShadow: "0 0 24px rgba(241,239,255,0.9)" }}>
                    {typeof f.value === "number" ? <CountUp to={f.value} suffix={f.suffix} /> : f.value}
                  </p>
                  <p className="mt-2 text-xs md:text-sm" style={{ color: "#1d1a55", textShadow: "0 0 12px rgba(241,239,255,0.95)" }}>{f.label}</p>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
