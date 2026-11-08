"use client";

import { WGraphic, chamfer, Reveal } from "@/components/brand/design-system";
import { SERVICES } from "@/data/landing";

export default function Services() {
  return (
    <section id="services" className="mx-auto max-w-6xl px-6 pb-24 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal id="services-head">
            <h2 className="sr-only">Every mode. One partner.</h2>
            <div aria-hidden="true"><div className="wf-head text-4xl md:text-6xl" style={{ color: "#644ff2" }}>Every mode.</div><div className="wf-head text-4xl md:text-6xl" style={{ color: "#04042b" }}>One partner.</div></div>
          </Reveal>
          <p className="max-w-sm text-sm leading-6" style={{ color: "#4b4b66" }}>Air, sea, rail, road and customs handled by one team, so your cargo never falls between two providers.</p>
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-6">
          {SERVICES.map((s, i) => {
            const Icon = s.icon;
            // Light page: navy cards become light; purple and lime stay as the two colour accents.
            const c = s.tone === "purple"
              ? { bg: "#644ff2", fg: "#ffffff", sub: "#e4e1ff", num: "#d5f476", iconBg: "rgba(255,255,255,0.14)", icon: "#d5f476", w: "#ffffff", border: "none" }
              : s.tone === "lime"
                ? { bg: "#d5f476", fg: "#04042b", sub: "#1a1a4d", num: "#373650", iconBg: "#04042b", icon: "#d5f476", w: "#04042b", border: "none" }
                : { bg: "#f8f7ff", fg: "#04042b", sub: "#4b4b66", num: "#644ff2", iconBg: "#644ff2", icon: "#ffffff", w: "#644ff2", border: "1px solid #e4e1ff" };
            const span = i < 2 ? "md:col-span-3" : "md:col-span-2";
            return (
              <Reveal key={s.title} id={`service-${i}`} delay={i * 0.06} className={span}>
                <article className="group relative flex h-full min-h-64 flex-col justify-between overflow-hidden p-7" style={{ background: c.bg, color: c.fg, border: c.border, ...chamfer(28, "tr") }}>
                  <WGraphic className="-bottom-10 -right-8 h-48 opacity-15" color={c.w} />
                  <span className="inline-flex h-12 w-12 items-center justify-center" style={{ background: c.iconBg, color: c.icon }}><Icon className="h-6 w-6" /></span>
                  <div className="relative mt-10">
                    <p className="wf-sub text-xs font-bold" style={{ color: c.num }}>0{i + 1}</p>
                    <h3 className="wf-head mt-2 text-2xl" style={{ color: c.fg }}>{s.title}</h3>
                    <p className="mt-3 max-w-xs text-sm leading-6" style={{ color: c.sub }}>{s.text}</p>
                  </div>
                </article>
              </Reveal>
            );
          })}
        </div>
      </section>
  );
}
