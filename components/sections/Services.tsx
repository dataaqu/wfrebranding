"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useReducedMotion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Reveal, WMark } from "@/components/brand/design-system";

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
const NAVY = "#04042b", GREEN = "#9fc31f", MUTED = "#c9c8d6";

const LIME = "#d5f476";
// Brand card band: flat top for ~58% of the width, then a short drop to the right edge.
const BAND = "polygon(0 0, 58% 0, 100% 24%, 100% 100%, 0 100%)";

/** Brand card frame (as in the brand guidelines): white W mark, lime band carrying the uppercase title. */
function CardChrome({ title, reduce }: { title: string; reduce: boolean }) {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-40 bg-[linear-gradient(to_bottom,rgba(4,4,43,0.35),rgba(4,4,43,0))]" />
      <WMark className="absolute right-7 top-7 z-10 h-12 w-auto md:h-14" color="#ffffff" />
      <div className="absolute inset-x-0 -bottom-px z-10 h-[19%] min-h-[120px]" style={{ background: LIME, clipPath: BAND }}>
        <div className="absolute inset-x-0 bottom-0 overflow-hidden px-7 pb-6 md:px-9 md:pb-7">
          <AnimatePresence mode="popLayout" initial={false}>
            <motion.p key={title} aria-hidden="true" className="wf-head text-[clamp(1.6rem,2.8vw,3rem)] leading-[0.95]" style={{ color: NAVY }}
              initial={reduce ? false : { y: "110%" }} animate={{ y: 0 }} exit={reduce ? undefined : { y: "-110%" }}
              transition={{ duration: 0.7, ease: EASE }}>
              {title}
            </motion.p>
          </AnimatePresence>
        </div>
      </div>
    </>
  );
}

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

// One word whose colour follows scroll: muted → brand green (leading edge) → navy.
function Word({ children, progress, start, end }: { children: string; progress: MotionValue<number>; start: number; end: number }) {
  const color = useTransform(progress, [start, end, Math.min(1, end + 0.12)], [MUTED, GREEN, NAVY]);
  return <motion.span style={{ color }}>{children} </motion.span>;
}

function Step({ index }: { index: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const s = SERVICES[index];
  const { scrollYProgress: raw } = useScroll({ target: ref, offset: ["start 0.8", "center 0.45"] });
  const scrollYProgress = useSpring(raw, { stiffness: 90, damping: 26, mass: 0.6 });
  const words = s.text.split(" ");

  return (
    <div ref={ref} className="relative flex min-h-[62svh] flex-col justify-center py-10">
      <h3 className="sr-only">{s.title}</h3>
      <div className="relative">
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
    <section id="services" aria-labelledby="services-title" className="bg-white pb-16 pt-6">
      <h2 id="services-title" className="sr-only">Services</h2>
      <div className="mx-auto max-w-6xl px-6 md:px-10 lg:hidden">
        <Reveal id="services-head"><p aria-hidden="true" className="wf-head text-4xl" style={{ color: NAVY }}>Services</p></Reveal>
      </div>

      {/* Desktop: descriptions left, sticky brand card (video + lime title band) right */}
      <div className="mx-auto hidden max-w-[1440px] grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] gap-16 px-10 lg:grid xl:px-16">
        <div className="pl-20 pt-[6svh] xl:pl-28">
          <Reveal id="services-head-desktop"><p aria-hidden="true" className="wf-head text-6xl" style={{ color: NAVY }}>Services</p></Reveal>
          <div ref={steps}>{SERVICES.map((s, i) => <Step key={s.title} index={i} />)}</div>
        </div>
        <div className="relative">
          <div className="sticky top-[6svh] h-[88svh] overflow-hidden bg-[#0b0b1f]">
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
            <CardChrome title={SERVICES[active].title} reduce={!!reduce} />
          </div>
        </div>
      </div>

      {/* Mobile: stacked */}
      <div className="mx-auto mt-12 max-w-6xl space-y-14 px-6 md:px-10 lg:hidden">
        {SERVICES.map((s, i) => (
          <article key={s.title}>
            <h3 className="sr-only">{s.title}</h3>
            <p className="text-xl leading-snug tracking-tight" style={{ color: NAVY }}>{s.text}</p>
            <div className="relative mt-6 aspect-[4/5] overflow-hidden bg-[#0b0b1f]">
              <video muted loop playsInline autoPlay preload="none" poster={`/assets/services/${s.media}.jpg`} aria-hidden="true" className="h-full w-full object-cover">
                <source src={`/assets/services/${s.media}.webm`} type="video/webm" />
                <source src={`/assets/services/${s.media}.mp4`} type="video/mp4" />
              </video>
              <CardChrome title={s.title} reduce />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
