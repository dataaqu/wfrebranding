"use client";

import { Reveal, chamfer } from "@/components/brand/design-system";

// Logos as published on weforward.ge (memberships + carriers), shown in their own colours.
// The files carry a white background, so every logo sits on a white tile. `h` evens out visual weight:
// wide wordmarks stay short, square marks get more height.
type Logo = { src: string; name: string; h: string };
const MEMBERSHIPS: Logo[] = [
  { src: "m1", name: "WCA China Global", h: "h-14 md:h-16" },
  { src: "m2", name: "JCtrans", h: "h-9 md:h-10" },
  { src: "m3", name: "WCA World", h: "h-12 md:h-14" },
  { src: "m4", name: "All World Shipping", h: "h-9 md:h-10" },
  { src: "ungc", name: "United Nations Global Compact", h: "h-14 md:h-16" },
];
const CARRIERS: Logo[] = [
  { src: "maersk", name: "Maersk", h: "h-8" },
  { src: "hapag", name: "Hapag-Lloyd", h: "h-6" },
  { src: "cmacgm", name: "CMA CGM", h: "h-12" },
  { src: "cosco", name: "COSCO Shipping", h: "h-12" },
  { src: "evergreen", name: "Evergreen Marine", h: "h-14" },
  { src: "turkish", name: "Turkish Airlines", h: "h-9" },
  { src: "qatar", name: "Qatar Airways", h: "h-10" },
  { src: "lufthansa", name: "Lufthansa", h: "h-7" },
  { src: "airfrance", name: "Air France", h: "h-5" },
  { src: "flydubai", name: "flydubai", h: "h-8" },
];
const NAVY = "#04042b";

/** White tile with a hairline frame and the brand's cut top-right corner (frame = 1px of the outer layer). */
function Tile({ logo, className, hidden }: { logo: Logo; className: string; hidden?: boolean }) {
  return (
    <div className={`p-px transition-colors duration-200 [@media(hover:hover)]:hover:bg-[#c9c1fb] ${className}`} style={{ background: "#e9e7f4", ...chamfer(18, "tr") }}>
      <div className="flex h-full w-full items-center justify-center bg-white px-6" style={chamfer(17, "tr")}>{/* 1px smaller cut so the frame also shows along the diagonal */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={`/assets/logos/${logo.src}.webp`} alt={hidden ? "" : logo.name} loading="lazy" decoding="async" className={`${logo.h} w-auto max-w-full object-contain`} />
      </div>
    </div>
  );
}

function GroupTitle({ children }: { children: string }) {
  return (
    <div className="flex items-center gap-5">
      <h3 className="shrink-0 text-sm font-semibold" style={{ color: NAVY }}>{children}</h3>
      <span aria-hidden="true" className="h-px flex-1 bg-[#e9e7f4]" />
    </div>
  );
}

export default function Network() {
  return (
    <section id="network" aria-labelledby="network-title" className="overflow-hidden bg-white pb-16 pt-8 md:pb-24 md:pt-12">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16">
        <Reveal id="network-head" className="mx-auto max-w-5xl text-center">
          <h2 id="network-title" className="wf-head text-balance text-4xl leading-[1.05] md:text-5xl" style={{ color: NAVY }}>A global network behind every shipment</h2>
        </Reveal>

        <div className="mt-10 md:mt-12">
          <GroupTitle>Network memberships</GroupTitle>
          <ul className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-5">
            {MEMBERSHIPS.map((m) => <li key={m.src}><Tile logo={m} className="h-32 md:h-40" /></li>)}
          </ul>
        </div>

        <div className="mt-14 md:mt-16">
          <GroupTitle>Leading global carriers</GroupTitle>
        </div>
      </div>

      {/* carriers: a slow, endless row that pauses under the pointer; reduced motion gets a static wrapped grid */}
      <div className="group mt-6 [mask-image:linear-gradient(to_right,transparent,#000_8%,#000_92%,transparent)] motion-reduce:[mask-image:none]">
        <ul className="wf-marquee flex w-max gap-4 motion-reduce:mx-auto motion-reduce:w-auto motion-reduce:max-w-[1600px] motion-reduce:flex-wrap motion-reduce:justify-center motion-reduce:px-6 md:motion-reduce:px-10 lg:motion-reduce:px-16">
          {[...CARRIERS, ...CARRIERS].map((c, i) => {
            const copy = i >= CARRIERS.length; // second pass only closes the loop
            return (
              <li key={`${c.src}-${i}`} aria-hidden={copy || undefined} className={copy ? "motion-reduce:hidden" : undefined}>
                <Tile logo={c} hidden={copy} className="h-28 w-52 md:h-32 md:w-60" />
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
