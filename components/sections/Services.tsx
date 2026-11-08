"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Reveal } from "@/components/brand/design-system";

// Services and copy as on weforward.ge. `media` = clip in /assets/services (warehousing reuses road until its own clip exists).
const SERVICES = [
  { title: "Road freight", text: "Flexible trucking services for door-to-door delivery across regional networks.", media: "road" },
  { title: "Sea freight", text: "Cost-effective ocean shipping solutions for your cargo worldwide with reliable transit times.", media: "sea" },
  { title: "Air freight", text: "Fast and secure air cargo services for time-sensitive shipments across the globe.", media: "air" },
  { title: "Rail freight", text: "Eco-friendly rail transport solutions connecting major trade routes efficiently.", media: "rail" },
  { title: "Warehousing", text: "Modern storage facilities with inventory management and distribution services.", media: "road" },
  { title: "Customs brokerage", text: "Expert customs clearance and trade compliance services to expedite your shipments.", media: "customs" },
];
const EASE = [0.45, 0, 0.15, 1] as const;
const NAVY = "#04042b", PURPLE = "#644ff2", MUTED = "#c9c8d6";

// Left-edge notch of the media panel (brand chamfer, cut into the side like a docking bay).
const NOTCH = "polygon(0 0, 100% 0, 100% 100%, 0 100%, 0 64%, 28px calc(64% - 28px), 28px calc(16% + 28px), 0 16%)";

function Video({ name, active, eager }: { name: string; active: boolean; eager: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) void v.play().catch(() => {});
    else v.pause();
  }, [active]);
  return (
    <video ref={ref} muted loop playsInline preload={eager ? "auto" : "metadata"}
      poster={`/assets/services/${name}.jpg`} aria-hidden="true" className="h-full w-full object-cover">
      <source src={`/assets/services/${name}.webm`} type="video/webm" />
      <source src={`/assets/services/${name}.mp4`} type="video/mp4" />
    </video>
  );
}

// One word whose colour follows scroll: muted → purple (leading edge) → navy.
function Word({ children, progress, start, end }: { children: string; progress: MotionValue<number>; start: number; end: number }) {
  const color = useTransform(progress, [start, end, Math.min(1, end + 0.25)], [MUTED, PURPLE, NAVY]);
  return <motion.span style={{ color }}>{children} </motion.span>;
}

function Step({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const s = SERVICES[index];
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ["start 0.8", "center 0.45"] });
  const scrollYProgress = useSpring(raw, { stiffness: 90, damping: 26, mass: 0.6 });
  const headColor = useTransform(scrollYProgress, [0, 0.12, 0.3], [MUTED, PURPLE, NAVY]);
  const words = s.text.split(" ");

  return (
    <div ref={ref} className="relative flex min-h-svh flex-col justify-center py-24">
      <motion.h3 className="text-[clamp(1.5rem,2.3vw,2.25rem)] font-medium leading-tight tracking-tight" style={{ color: reduce ? NAVY : headColor }}>
        {s.title}
      </motion.h3>
      <div className="relative mt-10">
        <p className="max-w-[460px] text-[clamp(1.6rem,2.5vw,2.4rem)] leading-[1.18] tracking-tight" style={{ color: NAVY }}>
          {reduce ? s.text : words.map((w, i) => (
            <Word key={i} progress={scrollYProgress} start={0.15 + (i / words.length) * 0.6} end={0.15 + ((i + 1) / words.length) * 0.6}>{w}</Word>
          ))}
        </p>
      </div>
    </div>
  );
}

export default function Services() {
  const [active, setActive] = useState(0);
  const reduce = useReducedMotion();
  const steps = useRef<HTMLDivElement>(null);
  // Active step = the one crossing the viewport centre; derived from scroll so jumps never leave it stale.
  const { scrollYProgress } = useScroll({ target: steps, offset: ["start center", "end center"] });
  useMotionValueEvent(scrollYProgress, "change", (v) => setActive(Math.min(SERVICES.length - 1, Math.max(0, Math.floor(v * SERVICES.length)))));

  return (
    <section id="services" className="bg-white pb-24 pt-16 md:pt-24">
      <div className="mx-auto max-w-[1440px] px-6 md:px-10 lg:pl-[120px] xl:pl-[176px]">
        <Reveal id="services-head">
          <h2 className="wf-head text-4xl md:text-6xl" style={{ color: NAVY }}>Services</h2>
        </Reveal>
      </div>

      {/* Desktop: scrolling steps left, sticky notched video right */}
      <div className="mx-auto mt-8 hidden max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-16 px-10 lg:grid xl:px-16">
        <div ref={steps} className="pl-20 xl:pl-28">
          {SERVICES.map((s, i) => <Step key={s.title} index={i} />)}
        </div>
        <div className="relative">
          <div className="sticky top-[6svh] h-[88svh] overflow-hidden rounded-lg bg-[#0b0b1f]" style={{ clipPath: NOTCH }}>
            {SERVICES.map((sv, i) => {
              const on = i === active;
              return (
                <motion.div key={sv.title} className="absolute inset-0" initial={false} style={{ zIndex: on ? 2 : 1 }}
                  animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.06 }}
                  transition={reduce ? { duration: 0 } : on
                    ? { opacity: { duration: 0.9, ease: EASE }, scale: { duration: 1.6, ease: EASE } }
                    : { opacity: { duration: 0.5, delay: 0.7, ease: "linear" }, scale: { duration: 0, delay: 1.2 } }}>
                  <Video name={sv.media} active={on} eager={Math.abs(i - active) <= 1} />
                </motion.div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="mx-auto mt-12 max-w-6xl space-y-14 px-6 md:px-10 lg:hidden">
        {SERVICES.map((s, i) => (
          <article key={s.title}>
            <h3 className="text-2xl font-medium tracking-tight" style={{ color: NAVY }}>{s.title}</h3>
            <p className="mt-4 text-xl leading-snug tracking-tight" style={{ color: NAVY }}>{s.text}</p>
            <div className="mt-6 aspect-[4/5] overflow-hidden rounded-lg bg-[#0b0b1f]" style={{ clipPath: NOTCH }}>
              <video muted loop playsInline autoPlay preload="none" poster={`/assets/services/${s.media}.jpg`} aria-hidden="true" className="h-full w-full object-cover">
                <source src={`/assets/services/${s.media}.webm`} type="video/webm" />
                <source src={`/assets/services/${s.media}.mp4`} type="video/mp4" />
              </video>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
