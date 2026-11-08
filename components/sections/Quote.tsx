"use client";

import { useState } from "react";
import { WGraphic, chamfer, Button, Reveal, IconPhone, IconArrow } from "@/components/brand/design-system";
import { MODES } from "@/data/landing";

const field = "mt-2 min-h-12 w-full rounded-field border border-white/15 bg-ink-900 px-4 text-sm text-white placeholder:text-ink-400 focus:border-volt-500 focus:outline-none";
const label = "wf-sub block text-[10px] font-bold text-brand-200";

export default function Quote() {
  const [mode, setMode] = useState("Rail");
  const [sent, setSent] = useState(false);
  return (
    <section id="quote" className="relative overflow-hidden bg-ink-900 py-24">
        <WGraphic className="-left-20 bottom-[-120px] hidden h-[560px] md:block" color="var(--color-brand-500)" />
        <div className="relative mx-auto grid max-w-6xl gap-12 px-6 md:grid-cols-[1fr_1.3fr] md:px-10">
          <Reveal id="quote-head">
            <h2 className="sr-only">Get your quote</h2>
            <div aria-hidden="true"><div className="wf-head text-4xl text-white md:text-6xl">Get your</div><div className="wf-head text-4xl text-volt-500 md:text-6xl">quote</div></div>
            <p className="mt-6 max-w-xs text-sm leading-6 text-ink-200">Send the details and our team replies with a price and route within one business day.</p>
            <a href="#quote" className="wf-sub mt-8 inline-flex items-center gap-3 whitespace-nowrap rounded-pill border border-white/40 px-5 py-3 text-xs font-bold text-white" style={{ color: "#ffffff" }}><span style={{ color: "#d5f476", display: "inline-flex" }}><IconPhone className="h-4 w-4" /></span>591 32 12 92</a>
          </Reveal>
          <Reveal id="quote-form" delay={0.1}>
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }} className="bg-ink-950 p-7 md:p-10" style={chamfer(40, "tr")}>
              <div className="grid gap-5 md:grid-cols-2">
                <label className={label}>From<input required className={field} placeholder="e.g. Shanghai, China" /></label>
                <label className={label}>To<input required className={field} placeholder="e.g. Tbilisi, Georgia" /></label>
                <fieldset className="md:col-span-2">
                  <legend className={label}>Transport mode</legend>
                  <div className="mt-2 grid grid-cols-4 gap-px bg-white/10">
                    {MODES.map((m) => (
                      <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)}
                        className={`wf-sub min-h-12 text-[11px] font-bold transition-colors ${mode === m ? "bg-brand-500 text-white" : "bg-ink-900 text-ink-300 hover:text-white"}`}>{m}</button>
                    ))}
                  </div>
                </fieldset>
                <label className={label}>Cargo type<input className={field} placeholder="e.g. 2 pallets, electronics" /></label>
                <label className={label}>Weight (kg)<input inputMode="numeric" className={field} placeholder="e.g. 850" /></label>
                <label className={label}>Name<input required className={field} placeholder="Your full name" /></label>
                <label className={label}>Phone or email<input required className={field} placeholder="How we reach you" /></label>
              </div>
              <div className="mt-8 flex flex-wrap items-center gap-5">
                <Button id="quote-submit" type="submit">Request quote <IconArrow /></Button>
                <p role="status" className="text-sm text-volt-500">{sent ? `Thanks — ${mode.toLowerCase()} quote request received (preview).` : ""}</p>
              </div>
            </form>
          </Reveal>
        </div>
      </section>
  );
}
