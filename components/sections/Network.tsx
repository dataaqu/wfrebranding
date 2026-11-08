"use client";

import { Reveal } from "@/components/brand/design-system";

// Logos as published on weforward.ge (memberships + carriers). Grey by default, colour on hover.
const MEMBERSHIPS = [
  { src: "m1", name: "WCA China Global" },
  { src: "m2", name: "JCtrans" },
  { src: "m3", name: "WCA World" },
  { src: "m4", name: "All World Shipping" },
];
const CARRIERS = [
  { src: "maersk", name: "Maersk" },
  { src: "hapag", name: "Hapag-Lloyd" },
  { src: "cmacgm", name: "CMA CGM" },
  { src: "cosco", name: "COSCO Shipping" },
  { src: "evergreen", name: "Evergreen Marine" },
  { src: "turkish", name: "Turkish Airlines" },
  { src: "qatar", name: "Qatar Airways" },
  { src: "lufthansa", name: "Lufthansa" },
  { src: "airfrance", name: "Air France" },
  { src: "flydubai", name: "flydubai" },
];
const NAVY = "#04042b";

const Plus = ({ className }: { className: string }) => (
  <svg viewBox="0 0 11 11" className={`pointer-events-none absolute z-10 h-[11px] w-[11px] text-[#b9b8c9] ${className}`} aria-hidden="true">
    <path d="M5.5 0v11M0 5.5h11" stroke="currentColor" strokeWidth="1" />
  </svg>
);

function Grid({ label, items, cols }: { label: string; items: { src: string; name: string }[]; cols: string }) {
  return (
    <div className="relative">
      <p className="wf-sub mb-5 text-[11px] font-bold tracking-[0.14em] text-[#8a89a6]">{label}</p>
      <div className="relative">
      {/* full-bleed hairlines that fade out past the grid */}
      <div aria-hidden="true" className="pointer-events-none absolute -inset-x-[50vw] inset-y-0 [mask-image:linear-gradient(to_right,transparent,#000_30%,#000_70%,transparent)]">
        <div className="absolute inset-x-0 top-0 h-px bg-[#e6e5ef]" />
        <div className="absolute inset-x-0 bottom-0 h-px bg-[#e6e5ef]" />
      </div>
      <ul className={`relative grid border-l border-[#e6e5ef] pt-px ${cols}`}>
        {items.map((it) => (
          <li key={it.src} className="group relative flex h-32 items-center justify-center border-b border-r border-t border-[#e6e5ef] -mt-px px-6 md:h-40 md:px-8">
            <Plus className="-left-[6px] -top-[6px]" />
            <Plus className="-right-[6px] -top-[6px]" />
            <Plus className="-bottom-[6px] -left-[6px]" />
            <Plus className="-bottom-[6px] -right-[6px]" />
            <span aria-hidden="true" className="absolute inset-x-0 -top-px h-px origin-left scale-x-0 bg-[#644ff2] transition-transform duration-500 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-x-100" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={`/assets/logos/${it.src}.webp`} alt={it.name} loading="lazy"
              className="max-h-10 w-auto max-w-[78%] object-contain opacity-55 grayscale transition-[filter,opacity] duration-300 group-hover:opacity-100 group-hover:grayscale-0 md:max-h-12" />
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}

export default function Network() {
  return (
    <section id="network" aria-labelledby="network-title" className="overflow-hidden bg-white py-24 md:py-32">
      <div className="mx-auto max-w-6xl px-6 md:px-10">
        <Reveal id="network-head" className="mx-auto max-w-3xl text-center">
          <h2 id="network-title" className="wf-head text-4xl leading-[1.05] md:text-6xl" style={{ color: NAVY }}>A global network behind every shipment</h2>
        </Reveal>
        <div className="mt-16 space-y-16 md:mt-24 md:space-y-20">
          <Grid label="GLOBAL NETWORK MEMBERSHIPS" items={MEMBERSHIPS} cols="grid-cols-2 md:grid-cols-4" />
          <Grid label="WITH LEADING GLOBAL CARRIERS" items={CARRIERS} cols="grid-cols-2 md:grid-cols-5" />
        </div>
      </div>
    </section>
  );
}
