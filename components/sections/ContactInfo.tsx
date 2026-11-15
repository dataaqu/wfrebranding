"use client";

import { Reveal, chamfer } from "@/components/brand/design-system";
import { ADDRESS, EMAIL, PHONES } from "@/lib/contact";

const NAVY = "#04042b";
const ICON = { mail: "M3 6h18v12H3zM3 7l9 6 9-6", phone: "M6.6 3.5 9 3l1.5 4.2-2 1.4a12 12 0 0 0 6.9 6.9l1.4-2 4.2 1.5-.5 2.4A2 2 0 0 1 18.5 19 15.5 15.5 0 0 1 5 5.5a2 2 0 0 1 1.6-2Z", pin: "M12 21s-7-6.3-7-11.5a7 7 0 0 1 14 0C19 14.7 12 21 12 21Zm0-9a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5Z" };

/** One contact line: brand-cut white tile with a hairline frame (1px of the outer layer shows as the border). */
function Row({ icon, children }: { icon: keyof typeof ICON; children: React.ReactNode }) {
  return (
    <li className="p-px" style={{ background: "#e9e7f4", ...chamfer(14, "tr") }}>
      <div className="flex min-h-16 flex-wrap items-center gap-x-4 gap-y-1 bg-white px-5 py-4" style={chamfer(13, "tr")}>
        <svg viewBox="0 0 24 24" className="h-5 w-5 shrink-0 text-brand-500" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" aria-hidden="true"><path d={ICON[icon]} /></svg>
        {children}
      </div>
    </li>
  );
}
const LINK = "text-base font-medium underline-offset-4 transition-colors hover:text-brand-500 hover:underline";

/** Contact details next to a Google map of the office. */
export default function ContactInfo() {
  return (
    <section id="contact-details" aria-labelledby="contact-details-title" className="bg-white pb-24 md:pb-28">
      <div className="mx-auto grid max-w-[1360px] items-stretch gap-10 px-6 md:px-10 lg:grid-cols-2 lg:gap-14">
        <Reveal id="contact-details-copy">
          <h2 id="contact-details-title" className="wf-head text-balance text-4xl md:text-5xl" style={{ color: NAVY }}>Let&apos;s build your logistics solution</h2>
          <p className="mt-5 max-w-lg text-base leading-7 text-[#4b4b66]">Our team is ready to optimize your supply chain and accelerate your business growth.</p>
          <ul className="mt-8 space-y-3" style={{ color: NAVY }}>
            <Row icon="mail"><a href={`mailto:${EMAIL}`} className={LINK}>{EMAIL}</a></Row>
            <Row icon="phone">
              {/* side by side with a divider; stacked on narrow screens so both numbers line up with the icon's text */}
              <span className="flex flex-col gap-1 sm:flex-row sm:items-center sm:gap-4">
                {PHONES.map(([t, h], i) => (
                  <span key={h} className="flex items-center gap-4">
                    {i > 0 && <span aria-hidden="true" className="hidden h-4 w-px bg-[#d9d7e8] sm:block" />}
                    <a href={h} className={`${LINK} tabular-nums`}>{t}</a>
                  </span>
                ))}
              </span>
            </Row>
            <Row icon="pin"><a href={ADDRESS.href} target="_blank" rel="noopener noreferrer" className={LINK}>{ADDRESS.label}</a></Row>
          </ul>
        </Reveal>
        <Reveal id="contact-details-map" delay={0.1} className="min-h-[360px] lg:min-h-0">
          <div className="h-full p-px" style={{ background: "#e9e7f4", ...chamfer(32, "tr") }}>
            <iframe
              title={`Map: WEFORWARD office, ${ADDRESS.label}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(ADDRESS.mapQuery)}&z=16&output=embed`}
              className="block h-full min-h-[358px] w-full border-0"
              style={chamfer(31, "tr")}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </Reveal>
      </div>
    </section>
  );
}
