"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import FactsGlobe from "./FactsGlobe";
import { Wordmark } from "@/components/brand/design-system";

/* Pinned globe scene.
   - While the section scrolls into view, WEFORWARD slides down out from under the hero and settles above the globe.
   - Once pinned (progress 0..1): the globe, already touching the wordmark, rotates and shrinks 0.05–0.70;
     Georgia lights up in phosphor lime 0.40–0.75 (FactsGlobe);
     the about copy slides in from both sides 0.45–0.70, then rises and fades out as the section scrolls away. */

const ABOUT_LEFT =
  "WEFORWARD founded in 2009, we take pride in our exceptional journey, rooted in experience, loyalty, and teamwork. Our seasoned team brings decades of industry expertise, ensuring your cargo is in capable hands.";
const ABOUT_RIGHT =
  "Our unwavering commitment to loyalty ensures we prioritize your interests above all else, while our seamless teamwork guarantees efficient and reliable shipping solutions. Trust us to navigate your logistics needs with precision and dedication, making your cargo's journey our top priority.";

export default function Facts() {
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start start", "end end"] });
  const { scrollYProgress: enter } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  // the hero sits on a higher layer (z-20): the text starts hidden just above this panel's top edge, i.e. under the
  // hero's bottom edge, and slides down out from under it into its resting place at 8vh
  const textY = useTransform(enter, [0.15, 0.8], reduce ? ["0vh", "0vh"] : ["-22vh", "0vh"]);
  // about copy appears with Georgia's glow, sliding in from either side
  // …then, once the section unpins and scrolls away, it rises faster than the page and fades out
  const { scrollYProgress: leave } = useScroll({ target: sectionRef, offset: ["end end", "end start"] });
  const aboutIn = useTransform(scrollYProgress, [0.45, 0.7], reduce ? [1, 1] : [0, 1]);
  const aboutOut = useTransform(leave, [0, 0.45], reduce ? [1, 1] : [1, 0]);
  const aboutOpacity = useTransform(() => aboutIn.get() * aboutOut.get());
  const aboutRise = useTransform(leave, [0, 0.45], reduce ? [0, 0] : [0, -140]);
  const leftX = useTransform(scrollYProgress, [0.45, 0.7], reduce ? [0, 0] : [-40, 0]);
  const rightX = useTransform(scrollYProgress, [0.45, 0.7], reduce ? [0, 0] : [40, 0]);
  const aboutYIn = useTransform(scrollYProgress, [0.45, 0.7], reduce ? [0, 0] : [24, 0]);
  const aboutY = useTransform(() => aboutYIn.get() + aboutRise.get());

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
        {/* about copy: left and right of the globe on desktop, stacked under it on mobile */}
        <div className="pointer-events-none absolute inset-x-0 top-1/2 hidden -translate-y-1/2 items-center justify-between px-[4vw] md:flex">
          <motion.p className="max-w-[22vw] text-sm leading-7 lg:text-base lg:leading-8" style={{ opacity: aboutOpacity, x: leftX, y: aboutRise, color: "#1d1a55" }}>{ABOUT_LEFT}</motion.p>
          <motion.p className="max-w-[22vw] text-right text-sm leading-7 lg:text-base lg:leading-8" style={{ opacity: aboutOpacity, x: rightX, y: aboutRise, color: "#1d1a55" }}>{ABOUT_RIGHT}</motion.p>
        </div>
        <motion.div className="pointer-events-none absolute inset-x-0 top-[42vh] space-y-4 px-6 text-[13px] leading-6 md:hidden" style={{ opacity: aboutOpacity, y: aboutY, color: "#1d1a55" }}>
          <p>{ABOUT_LEFT}</p>
          <p>{ABOUT_RIGHT}</p>
        </motion.div>
      </div>
    </section>
  );
}
