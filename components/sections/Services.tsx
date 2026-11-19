"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView, useReducedMotion } from "motion/react";
import { Reveal, WMark } from "@/components/brand/design-system";

// Services and copy as on weforward.ge. `media` = clip in /assets/services (sources: videos/services, 1-6 in this order).
// Shared with the /services grid.
export const SERVICES = [
  { title: "Road freight", text: "Flexible trucking services for door-to-door delivery across regional networks.", media: "road" },
  { title: "Sea freight", text: "Cost-effective ocean shipping solutions for your cargo worldwide with reliable transit times.", media: "sea" },
  { title: "Air freight", text: "Fast and secure air cargo services for time-sensitive shipments across the globe.", media: "air" },
  { title: "Rail freight", text: "Eco-friendly rail transport solutions connecting major trade routes efficiently.", media: "rail" },
  { title: "Warehousing", text: "Modern storage facilities with inventory management and distribution services.", media: "warehouse" },
  { title: "Customs brokerage", text: "Expert customs clearance and trade compliance services to expedite your shipments.", media: "customs" },
];
const EASE = [0.45, 0, 0.15, 1] as const;
const NAVY = "#04042b";
const ADVANCE_S = 7; // auto-advance: seconds per service while the section is on screen

const LIME = "#d5f476";
// Brand card band: flat top for ~58% of the width, then a short drop to the right edge.
const BAND = "polygon(0 0, 58% 0, 100% 24%, 100% 100%, 0 100%)";

/** Brand card frame (as in the brand guidelines): white W mark, lime band carrying the uppercase title. */
function CardChrome({ title, reduce }: { title: string; reduce: boolean }) {
  return (
    <>
      <div aria-hidden="true" className="absolute inset-x-0 top-0 z-10 h-40 bg-[linear-gradient(to_bottom,rgba(4,4,43,0.35),rgba(4,4,43,0))]" />
      <WMark className="absolute right-7 top-7 z-10 h-12 w-auto md:h-14" color="#ffffff" />
      <div className="absolute inset-x-0 -bottom-px z-10 h-[19%] min-h-[76px]" style={{ background: LIME, clipPath: BAND }}>
        <div className="absolute inset-0 flex items-center overflow-hidden px-7 md:px-9">
          {/* Mask = one line box; old title leaves first, then the new one rises in (never both visible). */}
          <div data-title-mask className="overflow-hidden py-1">
            <AnimatePresence mode="wait" initial={false}>
              <motion.p key={title} aria-hidden="true" className="wf-head text-[clamp(1.6rem,2.8vw,3rem)] leading-[0.95]" style={{ color: NAVY }}
                initial={reduce ? false : { y: "115%" }}
                animate={{ y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } }}
                exit={reduce ? undefined : { y: "-115%", transition: { duration: 0.25, ease: [0.7, 0, 0.84, 0] } }}>
                {title}
              </motion.p>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </>
  );
}

function Video({ name, active, eager, load }: { name: string; active: boolean; eager: boolean; load: boolean }) {
  const ref = useRef<HTMLVideoElement>(null);
  useEffect(() => {
    const v = ref.current;
    if (!v || !load) return;
    // Fast scrolling flips `active` several times a second; seeking + starting a decoder on every flip is
    // what stutters. So: while active, the (paused) first frame / poster shows and playback only starts
    // once the service has been dwelt on; when it goes inactive it pauses at once and rewinds only after
    // its layer has faded out, ready to start from the top next time without a visible jump.
    if (active) {
      const t = window.setTimeout(() => { void v.play().catch(() => {}); }, 450);
      return () => clearTimeout(t);
    }
    v.pause();
    const t = window.setTimeout(() => { if (v.currentTime > 0) v.currentTime = 0; }, 1300);
    return () => clearTimeout(t);
  }, [active, load]);
  // nothing is fetched (not even the poster) until the section is near the viewport
  if (!load) return <div className="h-full w-full bg-[#0b0b1f]" />;
  return (
    <video ref={ref} muted loop playsInline preload={eager ? "auto" : "metadata"}
      poster={`/assets/services/${name}.jpg`} aria-hidden="true" className="h-full w-full object-cover">
      <source src={`/assets/services/${name}.webm`} type="video/webm" />
      <source src={`/assets/services/${name}.mp4`} type="video/mp4" />
    </video>
  );
}

/** true once `ref` comes within `margin` of the viewport (stays true) */
function useNear(ref: React.RefObject<HTMLElement | null>, margin = "800px") {
  const [near, setNear] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el || near) return;
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) { setNear(true); io.disconnect(); } }, { rootMargin: margin });
    io.observe(el);
    return () => io.disconnect();
  }, [ref, margin, near]);
  return near;
}
/** Accordion (Flexport-style): the open service shows its text, the rest stay collapsed and muted.
 *  A line on the open item fills over ADVANCE_S seconds, then the next one opens; clicking any item opens it
 *  and restarts the timer. The brand card on the right crossfades to that service's clip. */
export default function Services() {
  const [active, setActive] = useState(0);
  const reduce = !!useReducedMotion();
  const sectionRef = useRef<HTMLElement>(null);
  const near = useNear(sectionRef);
  const inView = useInView(sectionRef, { amount: 0.35 });
  const auto = inView && !reduce;
  const next = () => setActive((a) => (a + 1) % SERVICES.length);

  return (
    <section ref={sectionRef} id="services" aria-labelledby="services-title" className="bg-white py-16 md:py-24">
      <div className="mx-auto grid max-w-[1600px] items-start gap-12 px-6 md:px-10 lg:grid-cols-2 lg:gap-14 lg:px-16">
        <div className="lg:order-1">
          <Reveal id="services-head"><h2 id="services-title" className="wf-head text-4xl md:text-6xl" style={{ color: NAVY }}>Services</h2></Reveal>
          <ul className="mt-10 border-b border-[#e7e6f0]">
            {SERVICES.map((s, i) => {
              const on = i === active;
              return (
                <li key={s.title} className="relative border-t border-[#e7e6f0]">
                  {/* progress line on the open item's top border */}
                  {on && (
                    <motion.span key={`p${active}-${auto}`} aria-hidden="true" className="absolute inset-x-0 -top-px h-0.5 origin-left bg-brand-500"
                      initial={{ scaleX: auto ? 0 : 1 }} animate={{ scaleX: 1 }}
                      transition={auto ? { duration: ADVANCE_S, ease: "linear" } : { duration: 0 }}
                      onAnimationComplete={() => { if (auto) next(); }} />
                  )}
                  <button type="button" aria-expanded={on} aria-controls={`service-panel-${i}`} id={`service-tab-${i}`} onClick={() => setActive(i)}
                    className={`flex w-full items-center justify-between py-5 text-left text-lg transition-colors duration-200 md:text-xl ${on ? "" : "[@media(hover:hover)]:hover:text-[#4b4b66]"}`}
                    style={{ color: on ? NAVY : "#9a99b0" }}>
                    {s.title}
                  </button>
                  {/* grid-rows 0fr→1fr animates to the text's natural height */}
                  <div id={`service-panel-${i}`} role="region" aria-labelledby={`service-tab-${i}`} inert={!on}
                    className={`grid transition-[grid-template-rows,opacity] duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                    <div className="overflow-hidden">
                      <p className="max-w-md pb-6 text-base leading-7 text-[#4b4b66]">{s.text}</p>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        </div>
        <div className="relative order-first aspect-square w-full overflow-hidden bg-[#0b0b1f] lg:order-2">{/* square like the clips: nothing cropped */}
          {SERVICES.map((sv, i) => {
            const on = i === active;
            return (
              <motion.div key={sv.title} className="absolute inset-0" initial={false} style={{ zIndex: on ? 2 : 1 }}
                animate={{ opacity: on ? 1 : 0, scale: on ? 1 : 1.06 }}
                transition={reduce ? { duration: 0 } : on
                  ? { opacity: { duration: 0.9, ease: EASE }, scale: { duration: 1.6, ease: EASE } }
                  : { opacity: { duration: 0.5, delay: 0.7, ease: "linear" }, scale: { duration: 0, delay: 1.2 } }}>
                <Video name={sv.media} active={on} eager={Math.abs(i - active) <= 1} load={near} />
              </motion.div>
            );
          })}
          <CardChrome title={SERVICES[active].title} reduce={reduce} />
        </div>
      </div>
    </section>
  );
}
