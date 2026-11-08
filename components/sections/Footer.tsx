"use client";

import { useRef } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "motion/react";
import { chamfer, LogoHorizontal, Wordmark } from "@/components/brand/design-system";

// Contact details as published on weforward.ge.
const NAVY = "#04042b", LIME = "#d5f476";
const EXPLORE = [["Routes", "#routes"], ["Services", "#services"], ["Network", "#network"], ["Track your cargo", "#tracking"], ["Get a quote", "#quote"], ["FAQ", "#faq"]];
const CONTACT = [
  ["sales@weforward.ge", "mailto:sales@weforward.ge"],
  ["+995 591 32 12 92", "tel:+995591321292"],
  ["+995 593 18 81 98", "tel:+995593188198"],
  ["Tbilisi, G. Kartozia #8", "https://maps.app.goo.gl/CgzwPiYwyA9986ta9"],
];
const SOCIAL = [["LinkedIn", "https://www.linkedin.com/company/weforward/"], ["Facebook", "https://www.facebook.com/weforwardllc"]];

const Arrow = ({ className = "h-3.5 w-3.5" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M7 17 17 7M8 7h9v9" /></svg>
);

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
            <p className="wf-head mt-10 text-[clamp(2.2rem,4.4vw,4rem)] leading-[0.95]">
              You deal.<span className="block" style={{ color: LIME }}>We deliver.</span>
            </p>
            <a href="#quote" className="wf-sub mt-10 inline-flex min-h-12 items-center gap-2.5 px-6 text-[12px] font-bold text-[#04042b] bg-[#d5f476] transition-[transform,background-color] duration-150 ease-out hover:bg-white active:scale-[0.98]"
              style={chamfer(12, "tr")}>
              Get a quote <Arrow />
            </a>
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
              {SOCIAL.map(([t, h]) => (
                <li key={h}><a href={h} target="_blank" rel="noopener noreferrer" className={LINK}>{t}<Arrow className="h-3 w-3 opacity-0 transition-[opacity,transform] duration-200 group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:opacity-100" /></a></li>
              ))}
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
