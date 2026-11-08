"use client";

import { useId, useMemo, useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { chamfer, IconContainer, IconPlane, IconShip, Reveal } from "@/components/brand/design-system";
import { PROVIDERS, detectAirline, normalizeReference, trackingURL, validReference, type Provider, type RefType } from "@/lib/tracking";

// Tracking desk: validates a reference and opens the carrier's official tracker. No live status is shown here.
type Mode = "sea" | "air" | "vessel" | "flight";
const NAVY = "#04042b", LIME = "#d5f476";

const IconFlight = ({ className = "h-5 w-5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M3 17h18M5.5 13.5 3 9l2-.5 3 2.5 4.5-1.5L9 3l2.5-.5 6 6.5 3.2-.9a1.6 1.6 0 0 1 .9 3.1L7 15Z" />
  </svg>
);

const MODES: Record<Mode, { label: string; title: string; desc: string; types: RefType[]; Icon: (p: { className?: string }) => React.ReactNode }> = {
  sea: { label: "Container / B/L", title: "Follow your sea freight.", desc: "Choose the shipping line on your booking, then enter your reference.", types: ["container", "bill_of_lading", "booking"], Icon: IconContainer },
  air: { label: "Air cargo · AWB", title: "Your air cargo, in focus.", desc: "Enter the master AWB from your carrier. Its first three digits identify the airline.", types: ["awb"], Icon: IconPlane },
  vessel: { label: "Vessels", title: "Find the vessel.", desc: "Use the vessel name, IMO or MMSI from your shipping details.", types: ["vessel_name", "imo", "mmsi"], Icon: IconShip },
  flight: { label: "Flights", title: "Follow the flight.", desc: "Use a flight number or aircraft registration to open Flightradar24 details.", types: ["flight_number", "aircraft_registration"], Icon: IconFlight },
};
const NAMES: Record<RefType, string> = {
  container: "Container number", bill_of_lading: "Bill of lading", booking: "Booking number", awb: "Air waybill · AWB", vessel_name: "Vessel name",
  imo: "IMO number", mmsi: "MMSI number", flight_number: "Flight number", aircraft_registration: "Aircraft registration",
};
const EXAMPLES: Record<RefType, string> = {
  container: "MSKU1234567", bill_of_lading: "Your B/L number", booking: "Your booking number", awb: "157-12345678", vessel_name: "MSC VANESSA",
  imo: "1234567", mmsi: "123456789", flight_number: "TK123", aircraft_registration: "TC-LJA",
};
const STEPS: Record<"carrier" | Mode, string[]> = {
  carrier: ["Select the carrier named on your shipping document.", "Enter your reference exactly as it appears.", "Open official tracking. Paste the copied number if needed."],
  sea: [], air: [],
  vessel: ["Find the vessel name in your carrier’s shipment details.", "Copy the name or vessel identifier.", "Open MarineTraffic, search, then choose “Show on map”."],
  flight: ["Find the flight number in your cargo tracking.", "Enter the flight number or aircraft registration.", "Check the flight date and available details on Flightradar24."],
};
const NOTES: Record<Mode, string> = {
  sea: "The container’s owner code may differ from the booked carrier. Always choose the line on your booking.",
  air: "Use a master AWB: 3 airline digits + 8 shipment digits. House AWBs may need your forwarder’s tracking.",
  vessel: "Coverage and access depend on the provider. A vessel position alone does not confirm cargo loading.",
  flight: "Coverage and access depend on the provider. A flight position alone does not confirm cargo loading.",
};
const QUICK = [["MarineTraffic", "https://www.marinetraffic.com/"], ["Flightradar24", "https://www.flightradar24.com/"], ["Track-trace", "https://www.track-trace.com/"]];

const available = (mode: Mode, type: RefType) =>
  PROVIDERS.filter((p) => p.referenceTypes.includes(type) && (p.category === mode || (p.category === "hub" && (mode === "sea" || mode === "air"))));

export default function Tracking() {
  const reduce = useReducedMotion();
  const uid = useId();
  const [mode, setMode] = useState<Mode>("sea");
  const [types, setTypes] = useState<Record<Mode, RefType>>({ sea: "container", air: "awb", vessel: "vessel_name", flight: "flight_number" });
  const [values, setValues] = useState<Record<Mode, string>>({ sea: "", air: "", vessel: "", flight: "" });
  const [picked, setPicked] = useState<Record<Mode, string>>({ sea: "maersk", air: "tracktrace-awb", vessel: "marinetraffic", flight: "flightradar24" });
  const [manualAir, setManualAir] = useState(false);
  const [status, setStatus] = useState("");

  const type = types[mode], raw = values[mode];
  const list = useMemo(() => available(mode, type), [mode, type]);
  const providerId = mode === "air" && !manualAir ? (detectAirline(PROVIDERS, raw)?.id ?? "tracktrace-awb") : (list.some((p) => p.id === picked[mode]) ? picked[mode] : list[0]?.id);
  const provider = PROVIDERS.find((p) => p.id === providerId);
  const ref = normalizeReference(raw, type, provider?.id);
  const valid = validReference(ref, type);
  const target = provider && valid ? trackingURL(provider, type, ref) : null;
  const fallbackId = type === "container" ? "tracktrace-container" : type === "awb" ? "tracktrace-awb" : type === "bill_of_lading" ? "tracktrace-bl" : "";
  const fallback = PROVIDERS.find((p) => p.id === fallbackId);
  const showFallback = !!(target && fallback && provider?.category !== "hub");

  const hint = raw && !valid ? `Check the format. Example: ${EXAMPLES[type]}`
    : type === "awb" ? "11 digits, with or without a hyphen."
    : type === "container" ? "4 letters + 7 digits. Choose the shipping line yourself."
    : type === "bill_of_lading" && provider?.id === "one" ? "ONE: use the carrier B/L without the ONEY prefix."
    : "Your reference stays on this page until you open the provider.";
  const destNote = !target ? "" : target.prefilled
    ? provider!.category === "flight" ? "Opens flight details and available history. Check the date to find the relevant flight."
      : provider!.category === "hub" ? "Your number will be filled in. Click Track on Track-trace to continue."
      : "Your reference is included in the official tracking link."
    : "Copy your number, open the official page and paste it into their search.";

  const setValue = (v: string) => { setValues((s) => ({ ...s, [mode]: v })); setStatus(""); };
  const switchMode = (m: Mode) => { setMode(m); setStatus(""); };
  const copy = async () => {
    try { await navigator.clipboard.writeText(ref); setStatus(`Copied: ${ref}`); }
    catch { setStatus(`Copy manually: ${ref}`); }
  };
  const choose = (p: Provider) => {
    const m = p.category as Mode;
    setMode(m); setPicked((s) => ({ ...s, [m]: p.id }));
    if (!p.referenceTypes.includes(types[m])) { setTypes((s) => ({ ...s, [m]: p.referenceTypes[0] })); setValues((s) => ({ ...s, [m]: "" })); }
    if (m === "air") setManualAir(true);
    document.getElementById(`${uid}-ref`)?.focus();
  };
  const directory = PROVIDERS.filter((p) => p.category === mode && (mode === "sea" || mode === "air") && p.referenceTypes.length);
  const steps = mode === "vessel" || mode === "flight" ? STEPS[mode] : STEPS.carrier;
  const M = MODES[mode];

  const PRESS = "transition-[transform,background-color,color,box-shadow] duration-150 ease-out active:scale-[0.97]";
  const FIELD = "h-12 w-full appearance-none bg-white/[0.06] px-4 text-[14px] text-white outline-none ring-1 ring-inset ring-white/15 transition-[box-shadow,background-color] duration-150 [@media(hover:hover)]:hover:ring-white/30 focus:bg-white/[0.09] focus:ring-2 focus:ring-[#d5f476]";
  const LABEL = "mb-2 block text-[12px] font-medium text-white/60";

  return (
    <section id="tracking" aria-labelledby="tracking-title" className="bg-white pb-24 pt-10">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <Reveal id="tracking-head"><h2 id="tracking-title" className="wf-head text-4xl md:text-6xl" style={{ color: NAVY }}>Track your cargo</h2></Reveal>
          <p className="max-w-sm text-sm leading-6 text-[#4b4b66]">Container, air waybill, vessel or flight. Open the right official tracker from one place.</p>
        </div>

        <div className="relative isolate mt-10" style={{ color: "#fff" }}>
          <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: NAVY, ...chamfer(40, "tr") }} />

          {/* mode tabs */}
          <div role="tablist" aria-label="What are you tracking?" className="grid grid-cols-2 gap-px border-b border-white/10 md:grid-cols-4">
            {(Object.keys(MODES) as Mode[]).map((m) => {
              const { Icon } = MODES[m], on = m === mode;
              return (
                <button key={m} type="button" role="tab" aria-selected={on} onClick={() => switchMode(m)}
                  className={`relative flex h-16 items-center justify-center gap-2.5 text-[13px] font-medium outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#d5f476] ${PRESS} ${on ? "text-[#04042b]" : "text-white/60 hover:text-white"}`}>
                  {on && <motion.span layoutId={reduce ? undefined : `${uid}-tab`} className="absolute inset-0" style={{ background: LIME }} transition={{ type: "spring", stiffness: 500, damping: 40 }} />}
                  <span className="relative flex items-center gap-2.5"><Icon className="h-5 w-5" />{MODES[m].label}</span>
                </button>
              );
            })}
          </div>

          <div className="grid lg:grid-cols-[minmax(0,1.45fr)_minmax(0,1fr)]">
            {/* form */}
            <form className="p-6 md:p-10" onSubmit={(e) => { e.preventDefault(); if (target) document.getElementById(`${uid}-open`)?.click(); else { document.getElementById(`${uid}-ref`)?.focus(); setStatus("Enter a valid reference first."); } }}>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={mode} initial={reduce ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: -6 }} transition={{ duration: 0.2 }}>
                  <p className="wf-sub text-[11px] font-bold tracking-[0.14em]" style={{ color: LIME }}>WEFORWARD / {mode === "sea" ? "OCEAN" : mode.toUpperCase()}</p>
                  <h3 className="mt-3 text-2xl font-medium tracking-tight md:text-3xl">{M.title}</h3>
                  <p className="mt-2 max-w-md text-sm leading-6 text-white/60">{M.desc}</p>
                </motion.div>
              </AnimatePresence>

              <div className="mt-8 grid gap-5 md:grid-cols-2">
                {M.types.length > 1 && (
                  <fieldset className="md:col-span-2">
                    <legend className={LABEL}>Reference type</legend>
                    <div className="flex flex-wrap gap-1.5">
                      {M.types.map((t) => (
                        <button key={t} type="button" aria-pressed={type === t} onClick={() => { setTypes((s) => ({ ...s, [mode]: t })); setValue(""); }}
                          className={`h-10 px-3.5 text-[13px] ${PRESS} ${type === t ? "bg-white text-[#04042b]" : "bg-white/[0.06] text-white/70 ring-1 ring-inset ring-white/15 hover:text-white"}`}>
                          {NAMES[t]}
                        </button>
                      ))}
                    </div>
                  </fieldset>
                )}
                {(mode === "sea" || mode === "air") && (
                  <div className="md:col-span-2 md:max-w-sm">
                    <label htmlFor={`${uid}-prov`} className={LABEL}>Carrier / provider</label>
                    <div className="relative">
                      <select id={`${uid}-prov`} className={`${FIELD} pr-10`} value={providerId}
                        onChange={(e) => { setPicked((s) => ({ ...s, [mode]: e.target.value })); if (mode === "air") setManualAir(true); }}>
                        {list.map((p) => <option key={p.id} value={p.id} className="text-[#04042b]">{p.name}</option>)}
                      </select>
                      <svg viewBox="0 0 24 24" className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-white/60" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                    </div>
                    {mode === "air" && (
                      <label className="mt-3 flex cursor-pointer items-center gap-2.5 text-[13px] text-white/70">
                        <input type="checkbox" checked={!manualAir} onChange={(e) => setManualAir(!e.target.checked)} className="h-4 w-4 accent-[#d5f476]" />
                        Detect the airline from the AWB prefix
                      </label>
                    )}
                  </div>
                )}
              </div>

              <div className="mt-6">
                <label htmlFor={`${uid}-ref`} className={LABEL}>{NAMES[type]}</label>
                <div className="relative">
                  <input id={`${uid}-ref`} value={raw} onChange={(e) => setValue(e.target.value)} placeholder={EXAMPLES[type]} autoComplete="off" spellCheck={false}
                    aria-invalid={!!raw && !valid} aria-describedby={`${uid}-hint`}
                    className={`${FIELD} h-16 pr-12 text-xl tracking-wide placeholder:text-white/25 ${type !== "vessel_name" ? "uppercase" : ""} ${raw && !valid ? "ring-[#ff8a8a]/60" : ""}`} />
                  {raw && (
                    <button type="button" aria-label="Clear reference" onClick={() => { setValue(""); document.getElementById(`${uid}-ref`)?.focus(); }}
                      className={`absolute right-2 top-1/2 grid h-10 w-10 -translate-y-1/2 place-items-center text-white/50 hover:text-white ${PRESS}`}>
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M6 6l12 12M18 6 6 18" /></svg>
                    </button>
                  )}
                </div>
                <p id={`${uid}-hint`} className={`mt-2 text-[12px] ${raw && !valid ? "text-[#ffb3b3]" : "text-white/50"}`}>{hint}</p>
              </div>

              {/* result */}
              <AnimatePresence initial={false}>
                {target && provider && (
                  <motion.div initial={reduce ? false : { opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={reduce ? undefined : { opacity: 0, y: 6 }} transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                    className="mt-7 flex flex-wrap items-center gap-x-6 gap-y-3">
                    <a id={`${uid}-open`} href={target.url} target="_blank" rel="noopener noreferrer" onClick={() => { if (!target.prefilled) void copy(); }}
                      className={`wf-sub inline-flex min-h-12 items-center gap-2.5 px-5 text-[12px] font-bold ${PRESS}`} style={{ background: LIME, color: NAVY, ...chamfer(12, "tr") }}>
                      {target.prefilled ? `Open ${provider.name} tracking` : `Copy & open ${provider.name}`}
                      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                    </a>
                    {showFallback && (
                      <a href={trackingURL(fallback!, type, ref).url} target="_blank" rel="noopener noreferrer" onClick={() => { if (type === "bill_of_lading") void copy(); }}
                        className="text-[13px] text-white/70 underline decoration-white/30 underline-offset-4 hover:text-white">Also search with Track-trace ↗</a>
                    )}
                    {!target.prefilled && <button type="button" onClick={copy} className="text-[13px] text-white/70 hover:text-white">Copy number</button>}
                    <p className="w-full text-[12px] text-white/50">{destNote}</p>
                  </motion.div>
                )}
              </AnimatePresence>
              <p role="status" aria-live="polite" className="mt-3 min-h-5 text-[12px]" style={{ color: LIME }}>{status}</p>
              <p className="mt-4 text-[12px] text-white/40">Tracking opens on the provider’s website. Live statuses are not displayed on this page.</p>
            </form>

            {/* guide */}
            <aside className="border-t border-white/10 p-6 md:p-10 lg:border-l lg:border-t-0">
              <p className="wf-sub text-[11px] font-bold tracking-[0.14em] text-white/50">HOW IT WORKS</p>
              <ol className="mt-6 space-y-5">
                {steps.map((s, i) => (
                  <li key={s} className="flex gap-4 text-[14px] leading-6 text-white/80">
                    <span className="wf-sub mt-0.5 grid h-6 w-6 shrink-0 place-items-center text-[11px] font-bold" style={{ background: i === 2 ? LIME : "rgba(255,255,255,0.1)", color: i === 2 ? NAVY : "#fff" }}>{i + 1}</span>
                    {s}
                  </li>
                ))}
              </ol>
              <p className="mt-8 border-t border-white/10 pt-6 text-[13px] leading-6 text-white/55">{NOTES[mode]}</p>
              <ul className="mt-8">
                {QUICK.map(([name, url]) => (
                  <li key={name}>
                    <a href={url} target="_blank" rel="noopener noreferrer" className="group flex items-center justify-between border-b border-white/10 py-3.5 text-[14px] text-white/80 hover:text-white">
                      {name}
                      <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
                    </a>
                  </li>
                ))}
              </ul>
            </aside>
          </div>
        </div>

        {/* carriers for the current mode */}
        {directory.length > 0 && (
          <div className="mt-8">
            <p className="text-[12px] font-medium text-[#4b4b66]">{mode === "sea" ? "Ocean lines" : "Air cargo carriers"} · pick yours</p>
            <div className="mt-3 flex flex-wrap gap-2">
              {directory.map((p) => {
                const on = p.id === providerId;
                return (
                  <button key={p.id} type="button" aria-pressed={on} onClick={() => choose(p)}
                    className={`h-10 px-3.5 text-[13px] ${PRESS} ${on ? "text-white" : "text-[#04042b] ring-1 ring-inset ring-[#e4e1ff] hover:ring-[#c9c5ff]"}`} style={{ background: on ? "#644ff2" : "#f8f7ff" }}>
                    {p.name}{p.awbPrefixes ? <span className={on ? "text-white/70" : "text-[#8a89a6]"}> · {p.awbPrefixes.join(" / ")}</span> : null}
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
