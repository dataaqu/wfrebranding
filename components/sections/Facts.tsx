"use client";

import { Reveal } from "@/components/brand/design-system";

export default function Facts() {
  return (
    <section id="facts" className="mx-auto max-w-6xl px-6 py-16 md:px-10">
        <div className="grid grid-cols-2 gap-px md:grid-cols-4" style={{ background: "#e4e1ff" }}>
          {[["4", "Transport modes"], ["14", "Days China → Georgia"], ["33 t", "Max load per 40HC"], ["LCL · FCL", "Groupage & full load"]].map(([n, t], i) => (
            <Reveal key={t} id={`fact-${i}`} delay={i * 0.08} className="p-6" style={{ background: "#ffffff" }}>
              <p className="wf-head text-3xl md:text-4xl" style={{ color: "#644ff2" }}>{n}</p>
              <p className="wf-sub mt-3 text-xs font-bold" style={{ color: "#686879" }}>{t}</p>
            </Reveal>
          ))}
        </div>
      </section>
  );
}
