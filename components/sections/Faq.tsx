"use client";

import { useState } from "react";
import { Reveal } from "@/components/brand/design-system";

// Answers stick to confirmed facts (weforward.ge services, corridor engine notes, tracking desk).
// No prices, transit times or volumes: those are confirmed per shipment.
const NAVY = "#04042b", PURPLE = "#644ff2";
const FAQ = [
  {
    q: "Which transport modes do you handle?",
    a: "Road, sea, air and rail freight, plus warehousing and customs brokerage. One team plans the whole journey, so your cargo never falls between two providers.",
  },
  {
    q: "Can I ship less than a full truck or container?",
    a: "Yes. By road we run groupage (LTL) imports from Europe, Turkey, China and Ukraine, and LTL exports to Armenia, Azerbaijan and Europe. By sea, LCL is available from China; other origins ship as full containers (FCL).",
  },
  {
    q: "Where can you ship from?",
    a: "Our core corridors connect Georgia with Europe, China, Turkey, Central Asia and the Gulf. Sea and air freight cover origins worldwide, except Russia and Iran. Explore the routes above, then we confirm the exact option for your shipment.",
  },
  {
    q: "Do you handle customs clearance?",
    a: "Yes. Our customs brokerage team takes care of clearance and trade compliance, so your shipment isn’t held up at the border.",
  },
  {
    q: "How do I track my shipment?",
    a: "Open the “Track your cargo” page: choose container, air waybill, vessel or flight, enter your reference and we open the carrier’s official tracker for you.",
  },
  {
    q: "How do I get a quote?",
    a: "Send the form above with your origin, destination and what you’re shipping. Our team replies with a route and a quote. Private senders are welcome too, not only businesses.",
  },
];

export default function Faq() {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <section id="faq" aria-labelledby="faq-title" className="scroll-mt-24 bg-white px-6 pb-32 pt-10 md:px-10">{/* scroll-mt: anchor jumps land below the fixed header */}
      <div className="mx-auto max-w-[1280px]">
        <Reveal id="faq-head" className="flex flex-wrap items-end gap-x-5 gap-y-2">
          <h2 id="faq-title" className="wf-head text-4xl leading-none md:text-6xl" style={{ color: NAVY }}>Questions? Answered.</h2>
          <span className="wf-sub mb-1 text-[11px] font-bold tracking-[0.16em] text-[#8a89a6]">( FAQ )</span>
        </Reveal>

        <ul className="mt-12 border-b-2 md:mt-16" style={{ borderColor: NAVY }}>
          {FAQ.map((item, i) => {
            const on = open === i;
            return (
              <li key={item.q} className="border-t-2" style={{ borderColor: NAVY }}>
                <h3>
                  <button type="button" aria-expanded={on} aria-controls={`faq-a-${i}`} id={`faq-q-${i}`} onClick={() => setOpen(on ? null : i)}
                    className="group flex w-full items-center justify-between gap-6 py-6 text-left outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#644ff2] md:py-7">
                    <span className={`text-[clamp(1.15rem,1.9vw,1.6rem)] font-medium leading-snug tracking-tight transition-colors duration-200 ${on ? "" : "group-hover:text-[#644ff2]"}`} style={{ color: on ? NAVY : undefined }}>{item.q}</span>
                    {/* plus that turns into × */}
                    <span aria-hidden="true" className={`grid h-9 w-9 shrink-0 place-items-center transition-colors duration-300 ${on ? "bg-[#d5f476]" : "bg-transparent group-hover:bg-[#f3f2fd]"}`}>
                      <span className={`relative grid h-3.5 w-3.5 place-items-center transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] ${on ? "rotate-45" : ""}`}>
                        <span className="absolute h-[2px] w-3.5" style={{ background: on ? NAVY : PURPLE }} />
                        <span className="absolute h-3.5 w-[2px]" style={{ background: on ? NAVY : PURPLE }} />
                      </span>
                    </span>
                  </button>
                </h3>
                <div id={`faq-a-${i}`} role="region" aria-labelledby={`faq-q-${i}`} inert={!on}
                  className={`grid transition-[grid-template-rows,opacity] duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] motion-reduce:transition-none ${on ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"}`}>
                  <div className="overflow-hidden">
                    <p className="max-w-2xl pb-7 text-[15px] leading-7 text-[#4b4b66]">{item.a}</p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
