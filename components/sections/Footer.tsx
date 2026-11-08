"use client";

import { chamfer } from "@/components/brand/design-system";

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

/** Eased scroll to the top: duration grows with distance (0.7–1.6s), easeInOutCubic,
 *  cancelled as soon as the visitor scrolls, touches or presses a key. */
function scrollToTop() {
  const start = window.scrollY;
  if (start <= 0) return;
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) { window.scrollTo(0, 0); return; }
  const duration = Math.min(1600, Math.max(700, start * 0.18));
  const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
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

  return (
    <footer id="footer" className="relative isolate overflow-hidden text-white">
      <div aria-hidden="true" className="absolute inset-0 -z-10" style={{ background: NAVY, ...chamfer(56, "tl") }} />

      <div className="mx-auto max-w-6xl px-6 pt-20 md:px-10 md:pt-28">
        {/* logo + three link columns, four equal tracks */}
        <div className="grid grid-cols-2 gap-x-10 gap-y-12 lg:grid-cols-4">
          <div className="col-span-2 lg:col-span-1">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/assets/logos/logo-footer.webp" alt="WEFORWARD — You deal. We deliver." width={500} height={240} className="h-20 w-auto md:h-24" />
          </div>

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

        {/* bottom bar */}
        <div className="mt-20 flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pb-10 pt-6 text-[13px] text-white/45">
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
        </div>
      </div>

    </footer>
  );
}
