"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { chamfer, LogoHorizontal, Wordmark } from "@/components/brand/design-system";

// Contact details as published on weforward.ge.
const NAVY = "#04042b";
const EXPLORE = [["Routes", "#routes"], ["Services", "#services"], ["Network", "#network"], ["Track your cargo", "#tracking"], ["Get a quote", "#quote"], ["FAQ", "#faq"]];
const CONTACT = [
  ["sales@weforward.ge", "mailto:sales@weforward.ge"],
  ["+995 591 32 12 92", "tel:+995591321292"],
  ["+995 593 18 81 98", "tel:+995593188198"],
  ["Tbilisi, G. Kartozia #8", "https://maps.app.goo.gl/CgzwPiYwyA9986ta9"],
];
// TODO: Instagram URL not published on weforward.ge yet — set it here.
const INSTAGRAM_URL = "https://www.instagram.com/";
const SOCIAL: { name: string; href: string; d: string }[] = [
  { name: "Facebook", href: "https://www.facebook.com/weforwardllc", d: "M13.5 21v-7.5h2.6l.4-3h-3V8.6c0-.9.3-1.5 1.5-1.5h1.6V4.4c-.3 0-1.2-.1-2.3-.1-2.3 0-3.9 1.4-3.9 4v2.2H7.8v3h2.6V21h3.1Z" },
  { name: "Instagram", href: INSTAGRAM_URL, d: "M12 7.4a4.6 4.6 0 1 0 0 9.2 4.6 4.6 0 0 0 0-9.2Zm0 7.6a3 3 0 1 1 0-6 3 3 0 0 1 0 6Zm4.8-8.9a1.1 1.1 0 1 0 0 2.2 1.1 1.1 0 0 0 0-2.2ZM12 3.5c-2.3 0-2.6 0-3.5.05-2.4.1-3.8 1.5-3.9 3.9C4.5 8.4 4.5 8.7 4.5 12s0 3.6.05 4.5c.1 2.4 1.5 3.8 3.9 3.9.9.05 1.2.05 3.5.05s2.6 0 3.5-.05c2.4-.1 3.8-1.5 3.9-3.9.05-.9.05-1.2.05-4.5s0-3.6-.05-4.5c-.1-2.4-1.5-3.8-3.9-3.9C14.6 3.5 14.3 3.5 12 3.5Zm0 1.5c2.3 0 2.5 0 3.4.05 1.6.07 2.5.9 2.5 2.5.05.9.05 1.1.05 4.45s0 3.55-.05 4.45c-.07 1.6-.9 2.5-2.5 2.5-.9.05-1.1.05-3.4.05s-2.5 0-3.4-.05c-1.6-.07-2.5-.9-2.5-2.5C6 15.55 6 15.35 6 12s0-3.55.05-4.45c.07-1.6.9-2.5 2.5-2.5C9.5 5 9.7 5 12 5Z" },
  { name: "LinkedIn", href: "https://www.linkedin.com/company/weforward/", d: "M6.9 8.9H3.8V20h3.1V8.9ZM5.35 4a1.8 1.8 0 1 0 0 3.6 1.8 1.8 0 0 0 0-3.6ZM20.2 13.6c0-3-.65-5-4.1-5-1.66 0-2.77.9-3.22 1.77h-.05V8.9H9.9V20H13v-5.5c0-1.45.27-2.85 2.07-2.85 1.77 0 1.8 1.66 1.8 2.94V20h3.1l.23-6.4Z" },
];

function Col({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="wf-sub text-[11px] font-bold tracking-[0.16em] text-white/40">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </div>
  );
}
const LINK = "group inline-flex items-center gap-1.5 text-[15px] text-white/75 transition-colors duration-200 hover:text-white";

export default function Footer() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  // giant wordmark rises out of the bottom edge as the footer scrolls in
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end end"] });
  const wordY = useTransform(scrollYProgress, [0.35, 1], ["45%", "0%"]);

  return (
    <footer ref={ref} id="footer" className="relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: NAVY, ...chamfer(56, "tl") }} />

      <div className="mx-auto max-w-6xl px-6 pt-20 md:px-10 md:pt-28">
        {/* CTA + columns */}
        <div className="grid gap-14 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.25fr)]">
          <div>
            <LogoHorizontal size="sm" />
          </div>

          <div className="grid grid-cols-2 gap-x-10 gap-y-12 sm:grid-cols-[minmax(0,0.9fr)_minmax(0,1.3fr)_minmax(0,0.7fr)]">
            <Col title="EXPLORE">
              {EXPLORE.map(([t, h]) => <li key={h}><a href={h} className={LINK}>{t}</a></li>)}
            </Col>
            <Col title="CONTACT">
              {CONTACT.map(([t, h]) => (
                <li key={h}><a href={h} {...(h.startsWith("http") ? { target: "_blank", rel: "noopener noreferrer" } : {})} className={`${LINK} whitespace-nowrap`}>{t}</a></li>
              ))}
            </Col>
            <Col title="FOLLOW">
              <li className="flex gap-2">
                {SOCIAL.map((x) => (
                  <a key={x.name} href={x.href} target="_blank" rel="noopener noreferrer" aria-label={`WEFORWARD on ${x.name}`}
                    className="grid h-11 w-11 place-items-center text-white/75 ring-1 ring-inset ring-white/15 transition-[background-color,color,box-shadow,transform] duration-200 ease-out hover:bg-[#d5f476] hover:text-[#04042b] hover:ring-[#d5f476] active:scale-95">
                    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="currentColor" aria-hidden="true"><path d={x.d} /></svg>
                  </a>
                ))}
              </li>
            </Col>
          </div>
        </div>

        {/* bottom bar */}
        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 py-6 text-[13px] text-white/45">
          <span>© {new Date().getFullYear()} WEFORWARD LLC · Tbilisi, Georgia · Since 2009</span>
          <a href="#main" className="group inline-flex items-center gap-2 text-white/60 transition-colors hover:text-white">
            Back to top
            <span className="grid h-8 w-8 place-items-center ring-1 ring-inset ring-white/20 transition-[background-color,box-shadow] group-hover:bg-white/10 group-hover:ring-white/40">
              <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-200 group-hover:-translate-y-0.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </span>
          </a>
        </div>
      </div>

      {/* giant wordmark, cropped by the bottom edge */}
      <div aria-hidden="true" className="pointer-events-none relative mx-auto -mb-[1.2vw] mt-4 max-w-[1600px] px-4 md:px-6">
        <motion.div style={{ y: reduce ? "0%" : wordY }}>
          <Wordmark className="h-auto w-full" color="#644ff2" />
        </motion.div>
      </div>
    </footer>
  );
}
