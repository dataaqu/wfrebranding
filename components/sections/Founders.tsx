"use client";

import { motion, useReducedMotion } from "motion/react";
import { Reveal, chamfer } from "@/components/brand/design-system";

/* /about, first section: the founders. Navy panel, copy on the left, two staggered portraits on the right
   that open upward out of a clip and settle from a slight zoom as they scroll in.
   Names, roles, bios and photos are PLACEHOLDERS (Unsplash test portraits) until the real ones arrive. */

const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const FOUNDERS = [
  { name: "Founder name", role: "Co-founder", src: "/assets/founder-1.webp", bio: "A few lines about their background in freight forwarding and the part of the business they lead today." },
  { name: "Founder name", role: "Co-founder", src: "/assets/founder-2.webp", bio: "A few lines about their background in freight forwarding and the part of the business they lead today." },
];

function Portrait({ f, index }: { f: (typeof FOUNDERS)[number]; index: number }) {
  const reduce = useReducedMotion();
  const delay = reduce ? 0 : index * 0.15;
  // the whole figure watches the viewport (a fully clipped frame never counts as "in view") and hands
  // the reveal down to its parts through variants
  return (
    <motion.figure className={index === 1 ? "sm:mt-24" : undefined}
      initial={reduce ? false : "hidden"} whileInView="shown" viewport={{ once: true, amount: 0.25 }}>
      {/* outer layer cuts the brand corner; the inner one animates its own clip (two clip-paths can't share an element) */}
      <div className="relative aspect-[4/5]" style={chamfer(40, "tr")}>
        {/* frame opens bottom-up; the photo inside settles from a slight zoom at the same time */}
        <motion.div className="absolute inset-0 overflow-hidden bg-[#0e0e47]"
          variants={{ hidden: { clipPath: "inset(100% 0% 0% 0%)" }, shown: { clipPath: "inset(0% 0% 0% 0%)", transition: { duration: 1.1, ease: EASE_OUT, delay } } }}>
          <motion.img
            src={f.src} alt={`${f.name}, ${f.role}`} width={800} height={1000} loading="lazy" decoding="async"
            className="absolute inset-0 h-full w-full object-cover"
            variants={{ hidden: { scale: 1.18 }, shown: { scale: 1, transition: { duration: 1.5, ease: EASE_OUT, delay } } }}
          />
          <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-[#04042b]/60 to-transparent" />
        </motion.div>
      </div>
      <motion.figcaption className="mt-5"
        variants={{ hidden: { opacity: 0, y: 12 }, shown: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT, delay: delay + 0.45 } } }}>
        <p className="wf-sub flex items-center gap-2 text-[11px] font-bold text-volt-500"><span aria-hidden="true" className="h-1.5 w-1.5 bg-volt-500" />{f.role}</p>
        <p className="mt-2 text-xl font-medium tracking-tight text-white md:text-2xl">{f.name}</p>
        <p className="mt-2 max-w-sm text-[14px] leading-6 text-white/60">{f.bio}</p>
      </motion.figcaption>
    </motion.figure>
  );
}

export default function Founders() {
  return (
    <section id="founders" aria-labelledby="founders-title" className="bg-white px-0 md:px-4">
      <div className="relative isolate text-white">
        <div aria-hidden="true" className="absolute inset-0 -z-10 bg-ink-950" style={chamfer(64, "tr")} />
        <div className="mx-auto grid max-w-[1600px] items-center gap-14 px-6 py-20 md:px-10 md:py-28 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-20 lg:px-12">
          <Reveal id="founders-copy">
            <h2 id="founders-title" className="wf-head text-4xl md:text-6xl">The founders</h2>
            <p className="mt-6 max-w-md text-base leading-7 text-white/70">
              WEFORWARD was founded in Tbilisi in 2009. Meet the people who started it.
            </p>
          </Reveal>
          <div className="grid gap-10 sm:grid-cols-2 sm:gap-6 lg:gap-8">
            {FOUNDERS.map((f, i) => <Portrait key={f.src} f={f} index={i} />)}
          </div>
        </div>
      </div>
    </section>
  );
}
