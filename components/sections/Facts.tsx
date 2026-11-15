"use client";

import { Reveal, chamfer } from "@/components/brand/design-system";

/* About: text on one side, a photo on the other (stacked on phones, text first).
   Copy and photo are placeholders until the real team content arrives. */

const NAVY = "#04042b";
const ABOUT = [
  "We are freight forwarders, customs brokers and operations specialists who plan every shipment end to end, from the first quote to delivery at your door.",
  "One team, one point of contact: we keep your cargo moving across air, sea, rail and road, and keep you informed at every step.",
];

export default function Facts() {
  return (
    <section id="about" aria-labelledby="about-title" className="relative z-10 bg-white py-24 md:py-32">
      <div className="mx-auto grid max-w-[1360px] items-center gap-12 px-6 md:grid-cols-2 md:gap-14 md:px-10">
        <Reveal id="about-copy">
          <h2 id="about-title" className="wf-head text-4xl md:text-5xl" style={{ color: NAVY }}>The team behind your cargo</h2>
          {ABOUT.map((t) => (
            <p key={t.slice(0, 20)} className="mt-6 max-w-xl text-base leading-7 text-[#4b4b66]">{t}</p>
          ))}
        </Reveal>
        <Reveal id="about-photo" delay={0.1}>
          {/* placeholder: Unsplash photo by Annie Spratt (photo-1522071820081-009f0129c71c) */}
          <img
            src="/assets/about-team.jpg"
            alt="A team working together at a table with laptops"
            width={1600}
            height={1067}
            loading="lazy"
            decoding="async"
            className="aspect-[4/3] w-full object-cover"
            style={chamfer(40, "tr")}
          />
        </Reveal>
      </div>
    </section>
  );
}
