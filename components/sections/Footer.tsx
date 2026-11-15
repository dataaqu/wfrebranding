"use client";

import { useRef } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { CONTACT, SOCIAL } from "@/lib/contact";
import { cubicBezier, motion, useInView, useReducedMotion, type Variants } from "motion/react";

// Isometric cube field behind the footer (three.js, ~600 KB): loaded only once the footer comes near,
// and unmounted while it is far off screen so the WebGL loop never runs for nothing.
const BackgroundCubesGrid = dynamic(() => import("@/components/ui/background-cubes-grid").then((m) => m.BackgroundCubesGrid), { ssr: false });


// Contact details as published on weforward.ge.
const NAVY = "#04042b";
// same pages as the header nav (sub-pages listed after their parent)
const EXPLORE: [string, string][] = [["About us", "/about"], ["Career", "/career"], ["Services", "/services"], ["Track your cargo", "/track"], ["Blog", "/blog"], ["Contact", "/contact"]];

/** Fast scroll to the top with a slow landing (≈0.6-1.15s by distance),
 *  cancelled as soon as the visitor scrolls, touches or presses a key. */
function scrollToTop() {
  const start = window.scrollY;
  if (start <= 0) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo(0, 0); return; }
  const duration = Math.min(1050, Math.max(550, start * 0.08));
  // fast flick, then a long soft landing: short ease-in, ~90% of the distance by mid-time, the last
  // stretch eases out slowly so the arrival on the hero reads as a brief pause (cubic-bezier .35,0,.05,1)
  const ease = cubicBezier(0.35, 0, 0.05, 1);
  const html = document.documentElement, prev = html.style.scrollBehavior;
  html.style.scrollBehavior = "auto";
  let raf = 0, t0 = 0;
  const stop = () => { cancelAnimationFrame(raf); html.style.scrollBehavior = prev; ["wheel", "touchstart", "keydown"].forEach((e) => window.removeEventListener(e, stop)); };
  ["wheel", "touchstart", "keydown"].forEach((e) => window.addEventListener(e, stop, { passive: true }));
  const step = (now: number) => {
    if (!t0) t0 = now;
    const p = Math.min(1, (now - t0) / duration);
    window.scrollTo(0, Math.round(start * (1 - ease(p))));
    if (p < 1) raf = requestAnimationFrame(step); else stop();
  };
  raf = requestAnimationFrame(step);
}

// Card outline: top corners cut (brand chamfer); the middle of the top edge sits lower, reached by two
// short slopes, so the footer reads as a tab-cut panel rising out of the page bottom.
const NOTCH = "polygon(0 var(--cut), var(--cut) 0, 24% 0, calc(24% + var(--slope)) var(--dip), calc(76% - var(--slope)) var(--dip), 76% 0, calc(100% - var(--cut)) 0, 100% var(--cut), 100% 100%, 0 100%)";
// Entrance (once, when the footer scrolls into view): the panel rises, then its columns follow in turn.
const EASE_OUT = [0.16, 1, 0.3, 1] as const;
const CARD: Variants = {
  hidden: { y: 160 },
  show: { y: 0, transition: { duration: 1, ease: EASE_OUT, delayChildren: 0.2, staggerChildren: 0.08 } },
};
const ITEM: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.7, ease: EASE_OUT } },
};

function Col({ title, children, className }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <motion.div variants={ITEM} className={className}>
      <p className="wf-sub text-[11px] font-bold tracking-[0.16em] text-white/40">{title}</p>
      <ul className="mt-5 space-y-3">{children}</ul>
    </motion.div>
  );
}
const LINK = "group inline-flex items-center gap-1.5 text-[15px] text-white/75 transition-colors duration-200 hover:text-white";

export default function Footer() {
  const reduce = useReducedMotion();
  const ref = useRef<HTMLElement>(null);
  const near = useInView(ref, { margin: "400px 0px" });
  return (
    // overflow-hidden: while the panel waits below its resting place it must not add scroll height
    <footer ref={ref} id="footer" className="overflow-hidden bg-white pt-10 md:pt-16">
      <motion.div className="relative isolate text-white [--cut:14px] [--dip:18px] [--slope:40px] md:[--cut:18px] md:[--dip:28px] md:[--slope:72px]"
        variants={CARD} initial={reduce ? false : "hidden"} whileInView="show" viewport={{ once: true, amount: 0.15 }}>
      <div aria-hidden="true" className="absolute inset-0 -z-10 overflow-hidden" style={{ background: NAVY, clipPath: NOTCH }}>
        {/* a quiet version of the effect: brand navies, low waves, a faint purple glow. No seams and no idle
            ripples, so at rest it is plain navy; the cubes only show where the pointer stirs them. */}
        {near && (
          <BackgroundCubesGrid topColor={NAVY} leftColor="#0e0e47" rightColor="#08083a" glowColor="#463dc1" amplitude={0.25} glow={0.12} gap={0} idleRipples={false} />
        )}
      </div>

      {/* the panel spans the full screen, so its content runs wider than the page sections */}
      <div className="mx-auto max-w-[1600px] px-6 pt-20 md:px-10 md:pt-28 lg:px-16">
        {/* logo + three link columns, four equal tracks */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-12 lg:grid-cols-4">
          <motion.div variants={ITEM} className="col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logos/logo-footer.webp" alt="WEFORWARD - You deal. We deliver." width={500} height={240} className="h-20 w-auto md:h-24" />
          </motion.div>

            <Col title="EXPLORE">
              {EXPLORE.map(([t, h]) => <li key={h}><Link href={h} className={LINK}>{t}</Link></li>)}
            </Col>
            <Col title="CONTACT" className="max-sm:col-span-2">{/* full row on phones: the email and phone numbers need the width */}
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

        {/* bottom bar */}
        <motion.div variants={ITEM} className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pb-24 pt-6 md:pb-28 text-[13px] text-white/45">
          <span>© {new Date().getFullYear()} WEFORWARD LLC. All rights reserved.</span>
          <button type="button" onClick={scrollToTop}
            className="group inline-flex items-center gap-3 text-[13px] text-white/60 outline-none transition-colors duration-200 hover:text-white focus-visible:text-white">
            Back to top
            {/* arrow exits upward and a twin slides in from below on hover */}
            <span className="relative grid h-10 w-10 place-items-center overflow-hidden ring-1 ring-inset ring-white/20 transition-[background-color,box-shadow,transform] duration-200 ease-out group-hover:bg-[#d5f476] group-hover:text-[#04042b] group-hover:ring-[#d5f476] group-focus-visible:ring-2 group-focus-visible:ring-[#d5f476] group-active:scale-95">
              <svg viewBox="0 0 24 24" className="h-4 w-4 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:-translate-y-8" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
              <svg viewBox="0 0 24 24" className="absolute h-4 w-4 translate-y-8 transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:translate-y-0" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><path d="M12 19V5M6 11l6-6 6 6" /></svg>
            </span>
          </button>
        </motion.div>
      </div>
      </motion.div>
    </footer>
  );
}
