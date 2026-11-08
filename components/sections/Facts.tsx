"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import FactsGlobe from "./FactsGlobe";
import { Wordmark } from "@/components/brand/design-system";

/* Pinned globe scene.
   - While the section scrolls into view, WEFORWARD slides down out from under the hero and settles above the globe.
   - Once pinned (progress 0..1): the globe, already touching the wordmark, rotates and shrinks 0.05–0.70;
     locations and routes into Tbilisi fade in 0.40–0.75 (FactsGlobe). */

export default function Facts() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  // the hero sits on a higher layer (z-20): the text starts hidden just above this panel's top edge, i.e. under the
  // hero's bottom edge, and slides down out from under it into its resting place at 8vh
  const textY = useTransform(enter, [0.15, 0.8], reduce ? ["0vh", "0vh"] : ["-22vh", "0vh"]);

  return (
    <section id="facts" ref={sectionRef} aria-label="WEFORWARD routes into Georgia" className="relative" style={{ height: reduce ? "100vh" : "260vh" }}>
      <div className="sticky top-0 h-screen">
        {/* WEFORWARD on the layer behind the globe (canvas is transparent); not clipped so it can travel over the hero */}
        <motion.div className="pointer-events-none absolute inset-x-0 top-[8vh] flex justify-center" style={{ y: textY }}>
          <Wordmark className="block h-auto w-[72vw] md:w-[50vw]" color="#04042b" />
        </motion.div>
        <div className="relative h-full w-full overflow-hidden">
          <FactsGlobe progress={scrollYProgress} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}
