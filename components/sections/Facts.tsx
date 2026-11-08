"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform, type MotionValue } from "motion/react";
import FactsGlobe from "./FactsGlobe";
import { WORDMARK } from "@/components/brand/design-system";

/* Pinned globe scene, scroll timeline (progress 0..1 of the section):
     0.00–0.28  WEFORWARD is drawn letter by letter (outline, then fill)
     0.22–0.45  the globe rises from below until it touches the wordmark   (FactsGlobe)
     0.45–0.85  the globe rotates and shrinks into a full sphere           (FactsGlobe)
     0.78–0.95  locations and routes into Tbilisi fade in                  (FactsGlobe) */

const INK = "#04042b";

function Letter({ d, x, i, progress, reduce }: { d: string; x: number; i: number; progress: MotionValue<number>; reduce: boolean }) {
  const a = 0.01 + i * 0.018;
  const draw = useTransform(progress, [a, a + 0.1], [0, 1]);
  const fill = useTransform(progress, [a + 0.07, a + 0.13], [0, 1]);
  return (
    <g transform={`translate(${x} 0)`}>
      <motion.path
        d={d}
        fill={INK}
        fillRule="evenodd"
        stroke={INK}
        strokeWidth={1.5}
        vectorEffect="non-scaling-stroke"
        style={reduce ? undefined : { pathLength: draw, fillOpacity: fill }}
      />
    </g>
  );
}

export default function Facts() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  return (
    <section id="facts" ref={sectionRef} aria-label="WEFORWARD routes into Georgia" className="relative" style={{ height: reduce ? "100vh" : "340vh" }}>
      <div className="sticky top-0 h-screen">
        <div className="relative h-full w-full overflow-hidden">
          {/* WEFORWARD wordmark on the layer behind the globe (canvas is transparent) */}
          <div className="pointer-events-none absolute inset-x-0 top-[8vh] flex justify-center">
            <svg viewBox="0 0 992 100" className="h-auto w-[72vw] md:w-[50vw]" role="img" aria-label="WEFORWARD" style={{ overflow: "visible" }}>
              {WORDMARK.map(([d, x], i) => (
                <Letter key={i} d={d} x={x} i={i} progress={scrollYProgress} reduce={reduce} />
              ))}
            </svg>
          </div>
          <FactsGlobe progress={scrollYProgress} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}
