"use client";

import { useRef } from "react";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { chamfer } from "@/components/brand/design-system";
import { SERVICES } from "./Services";

/* /services: every service as a card in a grid (the home page keeps the accordion).
   Card = hairline-framed white tile with the brand's cut corner; the service photo on top plays its
   clip on hover (pointer devices only, never with reduced motion), then name, description and a quote link. */

const NAVY = "#04042b";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function Card({ s, index }: { s: (typeof SERVICES)[number]; index: number }) {
  const reduce = useReducedMotion();
  const video = useRef<HTMLVideoElement>(null);
  const play = () => {
    const v = video.current;
    if (!v || reduce || !matchMedia("(hover: hover)").matches) return;
    v.preload = "auto";
    void v.play().catch(() => {});
  };
  const stop = () => { const v = video.current; if (v) { v.pause(); v.currentTime = 0; } };

  return (
    <motion.li
      initial={reduce ? false : { opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.6, ease: EASE_OUT, delay: reduce ? 0 : (index % 3) * 0.08 }}
      onPointerEnter={play}
      onPointerLeave={stop}
      className="group h-full bg-[#e9e7f4] p-px transition-colors duration-300 [@media(hover:hover)]:hover:bg-brand-500"
      style={chamfer(28, "tr")}
    >
      <article className="flex h-full flex-col bg-white" style={chamfer(27, "tr")}>
        {/* media: photo at rest, the service clip fades in over it on hover */}
        <div className="relative aspect-square overflow-hidden bg-[#0b0b1f]">{/* square like the photos and clips, so nothing (e.g. the plane's wings) is cropped */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={`/assets/services/${s.media}.jpg`} alt="" width={720} height={720} loading="lazy" decoding="async"
            className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:group-hover:scale-[1.04]" />
          <video ref={video} muted loop playsInline preload="none" aria-hidden="true"
            className="absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 [@media(hover:hover)]:group-hover:opacity-100">
            <source src={`/assets/services/${s.media}.webm`} type="video/webm" />
            <source src={`/assets/services/${s.media}.mp4`} type="video/mp4" />
          </video>
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#04042b]/45 to-transparent" />
        </div>

        <div className="flex flex-1 flex-col p-6 md:p-7">
          <h2 className="wf-head text-2xl md:text-[1.7rem]" style={{ color: NAVY }}>{s.title}</h2>
          <p className="mt-3 text-[15px] leading-7 text-[#4b4b66]">{s.text}</p>
          <Link href="/contact#quote"
            className="wf-sub mt-auto inline-flex items-center gap-2 pt-6 text-[12px] font-bold text-brand-500 transition-colors hover:text-[#04042b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-500">
            Request a quote
            <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-x-1" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
      </article>
    </motion.li>
  );
}

export default function ServicesGrid() {
  return (
    <section aria-label="Services" className="bg-white pb-20 md:pb-28">
      <ul className="mx-auto grid max-w-[1600px] gap-5 px-6 sm:grid-cols-2 md:px-10 lg:grid-cols-3 lg:gap-6 lg:px-16">
        {SERVICES.map((s, i) => <Card key={s.media} s={s} index={i} />)}
      </ul>
    </section>
  );
}
