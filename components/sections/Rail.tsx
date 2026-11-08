"use client";

import { WGraphic, chamfer, Tag, Reveal, IconTrain } from "@/components/brand/design-system";
import { RAIL } from "@/data/landing";

export default function Rail() {
  return (
    <section id="rail" className="relative overflow-hidden bg-brand-500 py-24 text-ink-950">
        <WGraphic className="-right-24 -top-10 hidden h-[640px] md:block" color="var(--color-brand-600)" />
        <div className="relative mx-auto max-w-6xl px-6 md:px-10">
          <Reveal id="rail-head">
            <Tag tone="white"><IconTrain className="h-3.5 w-3.5" />Rail line</Tag>
            <h2 className="sr-only">Cargo from China in 14 days</h2>
            <div aria-hidden="true" className="mt-6"><div className="wf-head text-4xl text-white md:text-6xl">Cargo from China</div><div className="wf-head text-4xl text-ink-950 md:text-6xl">in 14 days</div></div>
          </Reveal>
          <div className="mt-14 grid gap-4 md:grid-cols-3">
            {RAIL.map(([n, t, d], i) => (
              <Reveal key={n} id={`rail-${n}`} delay={i * 0.08}>
                <div className="h-full p-7" style={{ background: "#ffffff", color: "#04042b", ...chamfer(24, "bl") }}>
                  <div className="flex items-center gap-4"><span className="wf-head text-4xl" style={{ color: "#644ff2" }}>{n}</span><span className="h-px flex-1" style={{ background: "#e4e1ff" }} /></div>
                  <h3 className="wf-head mt-6 text-xl" style={{ color: "#04042b" }}>{t}</h3>
                  <p className="mt-3 text-sm leading-6" style={{ color: "#4b4b66" }}>{d}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>
  );
}
