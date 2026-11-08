"use client";

import { Reveal, IconDoc, IconContainer, IconShield, IconClock } from "@/components/brand/design-system";

export default function Brokerage() {
  return (
    <section id="brokerage" className="mx-auto grid max-w-6xl gap-12 px-6 py-24 md:grid-cols-[1fr_1.4fr] md:px-10">
        <Reveal id="broker-head">
          <h2 className="sr-only">Brokerage handled</h2>
          <div aria-hidden="true"><div className="wf-head text-4xl md:text-5xl" style={{ color: "#644ff2" }}>Brokerage</div><div className="wf-head text-4xl md:text-5xl" style={{ color: "#04042b" }}>handled</div></div>
          <p className="mt-6 max-w-sm text-sm leading-6" style={{ color: "#4b4b66" }}>Our brokers take the paperwork off your desk — so customs is a step, not a delay.</p>
        </Reveal>
        <div className="grid gap-px sm:grid-cols-2" style={{ background: "#e4e1ff", border: "1px solid #e4e1ff" }}>
          {[[IconDoc, "Cargo declaration"], [IconContainer, "Temporary storage"], [IconDoc, "CMR waybills"], [IconShield, "Re-export & transit"], [IconDoc, "Export documents"], [IconClock, "Annotations & closure"]].map(([Icon, t], i) => {
            const I = Icon as typeof IconDoc;
            return (
              <Reveal key={t as string} id={`broker-${i}`} delay={i * 0.05} className="p-6" style={{ background: "#ffffff" }}>
                <div className="flex items-center gap-4" style={{ color: "#644ff2" }}><I className="h-6 w-6" /><span className="wf-sub text-xs font-bold" style={{ color: "#04042b" }}>{t as string}</span></div>
              </Reveal>
            );
          })}
        </div>
      </section>
  );
}
