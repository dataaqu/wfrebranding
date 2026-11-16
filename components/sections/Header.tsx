"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useReducedMotion } from "motion/react";
import { animate, createAnimatable, cubicBezier, utils } from "animejs";
import { Button, IconArrow, LogoHorizontal } from "@/components/brand/design-system";

// Main navigation; `children` open in a dropdown under their parent (hover or keyboard focus).
type NavItem = { label: string; href: string; children?: { label: string; href: string }[] };
export const NAV: NavItem[] = [
  { label: "About us", href: "/about", children: [{ label: "Career", href: "/career" }] },
  { label: "Services", href: "/services" },
  { label: "Track your cargo", href: "/track" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/contact#faq" }, // section of the contact page, not its own page
  { label: "Contact", href: "/contact" },
];
/** A link to a section of the page we are already on (e.g. FAQ while on /contact#faq): the router sees no
 *  change and would not move, so scroll to the section ourselves. */
function sameHash(e: React.MouseEvent, href: string) {
  const [path, hash] = href.split("#");
  if (!hash || path !== location.pathname) return;
  const el = document.getElementById(hash);
  if (!el) return;
  e.preventDefault();
  history.replaceState(history.state, "", href);
  el.scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
}
const SHADOW = { textShadow: "0 1px 10px rgba(4,4,43,0.45)" };

/** Site header (Flexport-style): fixed; slides away on scroll down, back in on scroll up with a solid navy
 *  bar. Over the home hero it starts transparent (with a navy fade for legibility on the video); `solid`
 *  pages without a dark hero keep the navy bar from the start. Nav hover: a small lime square jumps to the
 *  centre of the hovered item with a slight overshoot and fades out where it is when the pointer leaves. */
export default function Header({ solid: alwaysSolid = false }: { solid?: boolean }) {
  const reduce = useReducedMotion();
  const [lang, setLang] = useState("EN");
  const headerRef = useRef<HTMLElement>(null);
  const navRef = useRef<HTMLElement>(null);
  const navDot = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const header = headerRef.current!, bar = header.querySelector<HTMLElement>(".wf-header-bg")!;
    const scrim = header.querySelector<HTMLElement>(".wf-header-scrim"); // only over the home hero
    let lastY = window.scrollY, hidden = false, solid = alwaysSolid;
    const onScroll = () => {
      const y = window.scrollY, dy = y - lastY;
      const wantSolid = alwaysSolid || y > 40;
      if (Math.abs(dy) >= 4) {
        const wantHidden = dy > 0 && y > 120;
        if (wantHidden !== hidden) {
          hidden = wantHidden;
          if (reduce) utils.set(header, { y: hidden ? "-100%" : "0%" });
          else animate(header, hidden ? { y: "-100%", duration: 380, ease: "inOut(2)" } : { y: "0%", duration: 520, ease: "out(3)" });
        }
        lastY = y;
      }
      if (wantSolid !== solid) {
        solid = wantSolid;
        // switch instantly while the bar is out of view; fade when it is on screen (back at the top)
        const layers: [HTMLElement, number][] = [[bar, solid ? 1 : 0], ...(scrim ? [[scrim, solid ? 0 : 1] as [HTMLElement, number]] : [])];
        layers.forEach(([el, opacity]) => {
          if (reduce || hidden) utils.set(el, { opacity });
          else animate(el, { opacity, duration: 300, ease: "out(2)" });
        });
      }
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => { window.removeEventListener("scroll", onScroll); utils.remove([header, bar, ...(scrim ? [scrim] : [])]); };
  }, [reduce, alwaysSolid]);

  useEffect(() => {
    const nav = navRef.current, dot = navDot.current;
    if (!nav || !dot) return;
    const DOT = 6, MOVE = reduce ? 0 : 400, FADE = 150;
    const indicator = createAnimatable(dot, { x: { duration: MOVE, ease: cubicBezier(0.34, 1.56, 0.64, 1) }, opacity: { duration: FADE, ease: "linear" } });
    const over = (e: MouseEvent) => {
      const item = (e.target as Element).closest<HTMLElement>("[data-nav-item]");
      if (!item) return;
      const r = item.getBoundingClientRect(), n = nav.getBoundingClientRect();
      indicator.x(r.left + r.width / 2 - n.left - DOT / 2, MOVE);
      indicator.opacity(1, FADE);
    };
    const leave = () => indicator.opacity(0, FADE);
    nav.addEventListener("mouseover", over);
    nav.addEventListener("mouseleave", leave);
    return () => { nav.removeEventListener("mouseover", over); nav.removeEventListener("mouseleave", leave); indicator.revert(); };
  }, [reduce]);

  return (
    <header ref={headerRef} id="header" className="fixed inset-x-0 top-0 z-40">
      {/* the hero video changes colour scene to scene: a navy fade behind the bar keeps logo and links readable on any frame */}
      {!alwaysSolid && <div aria-hidden="true" className="wf-header-scrim pointer-events-none absolute inset-x-0 top-0 h-40" style={{ background: "linear-gradient(180deg, rgba(4,4,43,0.75) 0%, rgba(4,4,43,0.45) 50%, rgba(4,4,43,0) 100%)" }} />}
      <div aria-hidden="true" className="wf-header-bg absolute inset-0" style={{ background: "#04042b", opacity: alwaysSolid ? 1 : 0 }} />
      <div className="relative mx-auto flex h-20 max-w-[1600px] items-center justify-between gap-3 px-5 md:gap-6 md:px-10 lg:gap-4 lg:px-6 xl:gap-6 xl:px-16">{/* tighter at 1024–1279 so six nav items + CTA fit */}
        <Link href="/" aria-label="WEFORWARD home"><span className="md:hidden"><LogoHorizontal size="sm" wordColor="#ffffff" /></span><span className="hidden md:inline-flex"><LogoHorizontal size="md" wordColor="#ffffff" /></span></Link>
        <nav ref={navRef} aria-label="Main" className="relative hidden items-center gap-3.5 py-4 lg:flex xl:gap-8" style={SHADOW}>
          {NAV.map(({ label, href, children }) => {
            const cls = "wf-sub whitespace-nowrap text-[13px] font-bold transition-colors hover:text-volt-500 xl:text-sm";
            if (!children) return <Link key={label} href={href} data-nav-item onClick={(e) => sameHash(e, href)} className={cls} style={{ color: "#ffffff" }}>{label}</Link>;
            return (
              <div key={label} className="group/dd relative">
                <Link href={href} data-nav-item aria-haspopup="true" className={`${cls} inline-flex items-center gap-1.5`} style={{ color: "#ffffff" }}>
                  {label}
                  <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 transition-transform duration-200 group-hover/dd:rotate-180 group-focus-within/dd:rotate-180" fill="none" stroke="currentColor" strokeWidth="2.5" aria-hidden="true"><path d="m6 9 6 6 6-6" /></svg>
                </Link>
                {/* pt bridges the gap so the pointer can travel from the label into the panel; the panel stays
                    focusable while hidden, so Tab from the label reaches its items and opens it */}
                <div className="pointer-events-none absolute left-1/2 top-full -translate-x-1/2 pt-5 opacity-0 transition-[opacity,transform] duration-150 ease-out [transform:translate(-50%,-4px)] group-hover/dd:pointer-events-auto group-hover/dd:opacity-100 group-hover/dd:[transform:translate(-50%,0)] group-focus-within/dd:pointer-events-auto group-focus-within/dd:opacity-100 group-focus-within/dd:[transform:translate(-50%,0)]">
                  <ul className="min-w-[200px] bg-ink-950 p-2 shadow-[0_18px_40px_-12px_rgba(4,4,43,0.55)] ring-1 ring-white/10" style={{ textShadow: "none" }}>
                    {children.map((c) => (
                      <li key={c.href}>
                        <Link href={c.href} className="wf-sub flex items-center justify-between gap-4 px-3 py-2.5 text-[13px] font-bold text-white/80 transition-colors hover:bg-white/5 hover:text-volt-500 focus-visible:bg-white/5 focus-visible:text-volt-500 focus-visible:outline-none">
                          {c.label}
                          <IconArrow />
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            );
          })}
          <span ref={navDot} aria-hidden="true" className="pointer-events-none absolute bottom-0 left-0 h-1.5 w-1.5 bg-volt-500" style={{ opacity: 0 }} />
        </nav>
        <div className="flex items-center gap-3 md:gap-5">
          <button
            type="button"
            data-anim="lang-switch"
            onClick={() => setLang(lang === "EN" ? "KA" : "EN")}
            aria-label={`Language: ${lang === "EN" ? "English" : "Georgian"}. Switch to ${lang === "EN" ? "Georgian" : "English"}`}
            className="wf-sub inline-flex min-h-11 items-center gap-2 whitespace-nowrap text-xs font-bold transition-colors hover:text-volt-500 md:text-sm"
            style={{ color: "#ffffff", ...SHADOW }}
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18" /></svg>
            {lang}
          </button>
          <Button id="nav-quote" href="/contact#quote" variant="purple">Get a quote <IconArrow /></Button>
        </div>
      </div>
    </header>
  );
}
