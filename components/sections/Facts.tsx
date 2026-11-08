"use client";

import { useRef } from "react";
import { useReducedMotion, useScroll } from "motion/react";
import FactsGlobe from "./FactsGlobe";
import { Wordmark } from "@/components/brand/design-system";

/* Emons-style pinned globe scene (no copy): the panel sticks while you scroll ~1.6 screens;
   a WebGL globe rises from below, rotates and shrinks into a full sphere, then locations,
   routes into Tbilisi and orbit rings fade in. */

export default function Facts() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });

  return (
    <section id="facts" ref={sectionRef} aria-label="WEFORWARD routes into Georgia" className="relative" style={{ height: reduce ? "100vh" : "260vh" }}>
      <div className="sticky top-0 h-screen">
        <div className="relative h-full w-full overflow-hidden">
          {/* WEFORWARD wordmark on the layer behind the globe (canvas is transparent) */}
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-[8vh] flex justify-center">
            <Wordmark className="h-auto w-[82vw] md:w-[60vw]" color="#04042b" />
          </div>
          <FactsGlobe progress={scrollYProgress} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}
