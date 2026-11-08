"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useMotionValueEvent, useReducedMotion, useScroll } from "motion/react";
import { chamfer, Reveal } from "@/components/brand/design-system";
import { SERVICES } from "@/data/landing";

const MEDIA = ["air", "sea", "rail", "road", "customs"];

function ServiceVideo({ index, active, reduced, mobile = false }: {
  index: number; active: boolean; reduced: boolean; mobile?: boolean;
}) {
  const ref = useRef<HTMLVideoElement>(null);
  const [nearby, setNearby] = useState(!mobile);
  const [loaded, setLoaded] = useState(!mobile);
  useEffect(() => {
    if (!mobile || !ref.current) return;
    const observer = new IntersectionObserver(([entry]) => {
      setNearby(entry.isIntersecting);
      if (entry.isIntersecting) setLoaded(true);
    });
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [mobile]);
  useEffect(() => {
    if (loaded) ref.current?.load();
  }, [loaded]);
  useEffect(() => {
    const video = ref.current;
    if (!video) return;
    video.muted = true;
    if (loaded && active && nearby && !reduced) void video.play().catch(() => {});
    else video.pause();
  }, [active, nearby, reduced, loaded]);
  return <video ref={ref} data-service-video={MEDIA[index]} muted loop playsInline
    autoPlay={active && nearby && !reduced} preload={active && nearby ? "auto" : "metadata"}
    poster={`/assets/services/${MEDIA[index]}.jpg`}
    aria-label={`${SERVICES[index].title} aerial view`}
    className="h-full w-full object-cover">
    {loaded && <>
      <source src={`/assets/services/${MEDIA[index]}.webm`} type="video/webm" />
      <source src={`/assets/services/${MEDIA[index]}.mp4`} type="video/mp4" />
    </>}
  </video>;
}

export default function Services() {
  const scene = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(0);
  const [desktop, setDesktop] = useState(false);
  const reduce = !!useReducedMotion();
  const { scrollYProgress } = useScroll({ target: scene, offset: ["start start", "end end"] });
  useMotionValueEvent(scrollYProgress, "change", (progress) => {
    setActiveIndex(Math.min(SERVICES.length - 1, Math.max(0, Math.floor(progress * SERVICES.length))));
  });
  useEffect(() => {
    const media = window.matchMedia("(min-width: 1024px)");
    const update = () => setDesktop(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  function selectService(index: number) {
    const element = scene.current;
    if (!element) return;
    const top = element.getBoundingClientRect().top + window.scrollY;
    const segment = (element.offsetHeight - window.innerHeight) / SERVICES.length;
    window.scrollTo({ top: top + segment * (index + 0.5), behavior: reduce ? "instant" : "smooth" });
  }
  return (
    <section id="services" className="bg-white pb-24">
      <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-6 px-6 md:px-10">
        <Reveal id="services-head">
          <h2 className="sr-only">Every mode. One partner.</h2>
          <div aria-hidden="true"><div className="wf-head text-4xl text-[#644ff2] md:text-6xl">Every mode.</div><div className="wf-head text-4xl text-[#04042b] md:text-6xl">One partner.</div></div>
        </Reveal>
        <p className="max-w-sm text-sm leading-6 text-[#4b4b66]">Air, sea, rail, road and customs handled by one team, so your cargo never falls between two providers.</p>
      </div>

      <div ref={scene} data-services-scene className="relative mt-12 hidden h-[600svh] lg:block">
        <div className="sticky top-0 flex h-svh items-center">
          <div className="mx-auto grid w-full max-w-[1440px] grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] items-center gap-12 px-10 xl:gap-16 xl:px-16">
            <div aria-label="Freight services">
              {SERVICES.map((service, index) => {
                const active = index === activeIndex;
                return <div key={service.title} className="border-t border-[#04042b]/15 py-5">
                  <h3><button type="button" onClick={() => selectService(index)}
                    aria-current={active ? "step" : undefined} aria-expanded={active}
                    aria-controls={`service-description-${index}`}
                    className={`group flex w-full items-start gap-5 text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#644ff2] ${active ? "text-[#04042b]" : "text-[#04042b]/40 hover:text-[#04042b]/70"}`}>
                    <span className={`mt-1 font-mono text-xs ${active ? "text-[#644ff2]" : ""}`}>0{index + 1}</span>
                    <span className="wf-head text-[clamp(1.35rem,2.1vw,2rem)]">{service.title}</span>
                  </button></h3>
                  <p id={`service-description-${index}`} hidden={!active} className="ml-9 mt-4 max-w-[340px] text-sm leading-6 text-[#4b4b66]">{service.text}</p>
                </div>;
              })}
            </div>
            <div data-services-media className="relative h-[min(72svh,720px)] overflow-hidden bg-[#f8f7ff]" style={chamfer(64, "bl")}>
              {SERVICES.map((service, index) => <motion.div key={service.title}
                aria-hidden={index !== activeIndex} initial={false}
                animate={{ opacity: index === activeIndex ? 1 : 0 }} transition={{ duration: reduce ? 0 : 0.45 }}
                className="absolute inset-0">
                {desktop && <ServiceVideo index={index} active={index === activeIndex} reduced={reduce} />}
              </motion.div>)}
              <span aria-hidden="true" className="absolute right-6 top-6 bg-[#d5f476] px-3 py-2 font-mono text-xs text-[#04042b]">0{activeIndex + 1} / 05</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto mt-12 max-w-6xl space-y-12 px-6 md:px-10 lg:hidden">
        {SERVICES.map((service, index) => <article key={service.title}>
          <div className="mb-5 border-t border-[#04042b]/15 pt-5">
            <span className="font-mono text-xs text-[#644ff2]">0{index + 1}</span>
            <h3 className="wf-head mt-3 text-2xl text-[#04042b]">{service.title}</h3>
            <p className="mt-4 max-w-md text-sm leading-6 text-[#4b4b66]">{service.text}</p>
          </div>
          <div className="aspect-[4/3] overflow-hidden bg-[#f8f7ff]" style={chamfer(36, "bl")}>
            {!desktop && <ServiceVideo index={index} active reduced={reduce} mobile />}
          </div>
        </article>)}
      </div>
    </section>
  );
}
