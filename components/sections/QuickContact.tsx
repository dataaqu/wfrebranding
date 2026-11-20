"use client";

import { useEffect, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { animate, createTimeline, stagger, utils, type Timeline } from "animejs";
import { useIntroDone } from "@/lib/intro";
import { WMark, chamfer } from "@/components/brand/design-system";
import { EMAIL } from "@/lib/contact";

/* Quick contact: a brand button pinned bottom-right on every page that grows into a small chat-style form
   (name, phone, message). Opening (Anime.js): the panel is revealed out of the button's corner with an
   expanding clip, the button's speech bubble spins out into a close mark, then a "typing" beat, the
   team's greeting and the fields arrive in turn. Closing reverses it, faster.
   Requests go to EMAIL (lib/contact). TODO: wire `send()` to an email route once the provider is set up —
   until then the form only shows its sent state, like the main contact form. */

const NAVY = "#04042b";
// Brandbook-style solid icon: speech bubble with two text lines cut out
const BUBBLE = "M5 3h14a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H9.5L5 21v-4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2Zm2 4v2h10V7H7Zm0 4v2h7v-2H7Z";
const BTN = 56; // launcher size (px) — the panel grows out of a square this big
// The drop shadow is a filter: with the clip changing every frame it would be re-rasterised each frame and
// drop the animation to ~15 fps, so it is only on while the panel rests open.
const SHADOW = "drop-shadow(0 24px 48px rgba(4,4,43,0.28))";

type Sent = { name: string; phone: string } | null;

export default function QuickContact() {
  const reduce = !!useReducedMotion();
  const introDone = useIntroDone();
  const [ready, setReady] = useState(false); // shown once the home loader has finished (or right away elsewhere)
  const [open, setOpen] = useState(false);
  const [greeted, setGreeted] = useState(false);
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState<Sent>(null);
  const panel = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  const firstField = useRef<HTMLInputElement>(null);
  const anim = useRef<Timeline | null>(null);

  useEffect(() => { setReady(introDone || !document.querySelector(".wf-intro-bg")); }, [introDone]);

  // launcher entrance
  useEffect(() => {
    const el = launcher.current;
    if (!ready || !el) return;
    if (reduce) { utils.set(el, { opacity: 1, scale: 1, y: 0 }); return; }
    const a = animate(el, { opacity: [0, 1], scale: [0.6, 1], y: [16, 0], duration: 650, ease: "outBack(1.8)", delay: 400 });
    return () => { a.revert(); utils.set(el, { opacity: 1 }); };
  }, [ready, reduce]);

  // open / close
  useEffect(() => {
    const el = panel.current, btn = launcher.current;
    if (!el || !btn) return;
    const W = el.offsetWidth, H = el.offsetHeight;
    const clip = { p: open ? 0 : 1 };
    const paint = () => { el.style.clipPath = `inset(${(1 - clip.p) * (H - BTN)}px 0 0 ${(1 - clip.p) * (W - BTN)}px)`; };
    const items = Array.from(el.querySelectorAll<HTMLElement>("[data-qc-item]"));
    const bubble = btn.querySelector(".qc-bubble")!, cross = btn.querySelector(".qc-cross")!;
    anim.current?.pause();
    if (open) el.style.visibility = "visible";
    el.style.filter = reduce && open ? SHADOW : "none";
    if (reduce) {
      clip.p = open ? 1 : 0; paint();
      utils.set(items, { opacity: 1, y: 0 });
      utils.set(bubble, { opacity: open ? 0 : 1, rotate: 0, scale: 1 });
      utils.set(cross, { opacity: open ? 1 : 0, rotate: 0, scale: 1 });
      if (!open) el.style.visibility = "hidden";
      if (open) { setGreeted(true); firstField.current?.focus({ preventScroll: true }); }
      return;
    }
    if (open) {
      utils.set(items, { opacity: 0, y: 14 });
      paint();
      anim.current = createTimeline({ onComplete: () => { el.style.filter = SHADOW; } })
        .add(el, { opacity: [0, 1], duration: 140, ease: "linear" }, 0)
        .add(bubble, { rotate: [0, -90], scale: [1, 0.4], opacity: [1, 0], duration: 260, ease: "in(2)" }, 0)
        .add(cross, { rotate: [90, 0], scale: [0.4, 1], opacity: [0, 1], duration: 420, ease: "outBack(2)" }, 160)
        .add(clip, { p: [0, 1], duration: 560, ease: "inOut(3)", onUpdate: paint }, 0)
        .add(items, { opacity: [0, 1], y: [14, 0], duration: 420, ease: "out(3)", delay: stagger(55) }, 320)
        .call(() => firstField.current?.focus({ preventScroll: true }), 700);
      if (!greeted) window.setTimeout(() => setGreeted(true), 1250); // "typing…" beat before the greeting
    } else {
      // the last stretch fades out, so the shrinking corner never pops off the screen
      anim.current = createTimeline({ onComplete: () => { el.style.visibility = "hidden"; utils.set(el, { opacity: 1 }); } })
        .add(el, { opacity: [1, 0], duration: 200, ease: "in(2)" }, 240)
        .add(items, { opacity: 0, y: 8, duration: 160, ease: "in(2)" }, 0)
        .add(clip, { p: [1, 0], duration: 360, ease: "in(3)", onUpdate: paint }, 80)
        .add(cross, { rotate: [0, 90], scale: [1, 0.4], opacity: [1, 0], duration: 220, ease: "in(2)" }, 0)
        .add(bubble, { rotate: [-90, 0], scale: [0.4, 1], opacity: [0, 1], duration: 420, ease: "outBack(2)" }, 140);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, reduce]);

  // Esc closes and hands focus back to the launcher
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") { setOpen(false); launcher.current?.focus(); } };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const send = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setSending(true);
    // preview only: no request leaves the page yet (see TODO above)
    window.setTimeout(() => { setSending(false); setSent({ name: String(f.get("name") || "").trim(), phone: String(f.get("phone") || "").trim() }); }, 700);
  };

  const FIELD = "w-full bg-[#f6f5fc] px-3.5 text-[14px] text-[#04042b] outline-none ring-1 ring-inset ring-[#e9e7f7] transition-[box-shadow,background-color] duration-150 placeholder:text-[#8a89a3] focus:bg-white focus:ring-2 focus:ring-brand-500";
  const LABEL = "mb-1.5 block text-[12px] font-medium text-[#4b4b66]";

  return (
    <>
      {/* panel: sits just above the launcher; hidden (and clipped down to the button's corner) while closed */}
      <div ref={panel} id="quick-contact" role="dialog" aria-modal="false" aria-labelledby="quick-contact-title"
        className="fixed bottom-[84px] right-4 z-[55] w-[min(380px,calc(100vw-32px))] md:bottom-[96px] md:right-6"
        style={{ visibility: "hidden" }}>
        <div className="flex max-h-[min(640px,calc(100svh-120px))] flex-col overflow-hidden bg-white" style={chamfer(22, "tr")}>
          {/* header */}
          <div data-qc-item className="flex items-center gap-3 px-5 py-4" style={{ background: NAVY }}>
            <span className="grid h-10 w-10 shrink-0 place-items-center bg-white/10"><WMark className="h-6 w-auto" /></span>
            <div className="min-w-0">
              <p id="quick-contact-title" className="wf-sub text-[13px] font-bold text-white">Talk to WEFORWARD</p>
              <p className="flex items-center gap-1.5 text-[12px] text-white/60"><span aria-hidden="true" className="h-1.5 w-1.5 bg-volt-500" />Sales team</p>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto px-5 pb-5 pt-4">
            {/* team message: a short typing beat, then the greeting */}
            <div data-qc-item className="flex items-end gap-2">
              <span aria-hidden="true" className="grid h-7 w-7 shrink-0 place-items-center" style={{ background: NAVY }}><WMark className="h-3.5 w-auto" color="#ffffff" /></span>
              <div className="max-w-[85%] bg-[#f3f2fd] px-3.5 py-2.5 text-[14px] leading-6 text-[#04042b]" style={chamfer(10, "tr")}>
                {greeted
                  ? "Hi! Leave your name and number and tell us what you need to ship. Our team will get back to you."
                  : <span aria-label="Typing" className="flex h-6 items-center gap-1">{[0, 1, 2].map((i) => <span key={i} className="qc-dot h-1.5 w-1.5 bg-brand-500" style={{ animationDelay: `${i * 0.15}s` }} />)}</span>}
              </div>
            </div>

            {sent ? (
              <div data-qc-item className="mt-4 flex items-end justify-end">
                <div role="status" className="max-w-[85%] bg-brand-500 px-3.5 py-2.5 text-[14px] leading-6 text-white" style={chamfer(10, "tr")}>
                  Thanks{sent.name ? `, ${sent.name}` : ""}! We&apos;ll call you back at <span className="whitespace-nowrap font-semibold">{sent.phone}</span>.
                </div>
              </div>
            ) : (
              <form onSubmit={send} className="mt-5 space-y-3.5">
                <div data-qc-item>
                  <label htmlFor="qc-name" className={LABEL}>Name</label>
                  <input ref={firstField} id="qc-name" name="name" required autoComplete="name" placeholder="Your name" className={`${FIELD} h-11`} />
                </div>
                <div data-qc-item>
                  <label htmlFor="qc-phone" className={LABEL}>Phone number</label>
                  <input id="qc-phone" name="phone" type="tel" required autoComplete="tel" inputMode="tel" pattern="\+?[0-9 ]{6,}" title="Digits and spaces, optionally starting with +" placeholder="+995 5XX XX XX XX" className={`${FIELD} h-11`} />
                </div>
                <div data-qc-item>
                  <label htmlFor="qc-message" className={LABEL}>Message</label>
                  <textarea id="qc-message" name="message" required rows={3} placeholder="What are you shipping, from where to where?" className={`${FIELD} resize-none py-2.5 leading-6`} />
                </div>
                <div data-qc-item>
                  <button type="submit" disabled={sending}
                    className="wf-sub inline-flex h-12 w-full items-center justify-center gap-2.5 bg-brand-500 text-[13px] font-bold text-white transition-[background-color,transform] duration-150 hover:bg-brand-400 active:scale-[0.98] disabled:opacity-70"
                    style={chamfer(12, "br")}>
                    {sending ? "Sending…" : "Send"}
                    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="currentColor" aria-hidden="true"><path d="M3 20.5 21 12 3 3.5V10l12 2-12 2v6.5Z" /></svg>
                  </button>
                  <p className="mt-2 text-center text-[11px] text-[#8a89a3]">Goes straight to {EMAIL}</p>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* launcher */}
      <button ref={launcher} type="button" aria-label={open ? "Close quick contact" : "Contact us"} aria-expanded={open} aria-controls="quick-contact"
        onClick={() => setOpen((o) => !o)}
        className="group fixed bottom-4 right-4 z-[55] isolate grid h-14 w-14 place-items-center text-white transition-transform duration-200 hover:-translate-y-0.5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-volt-500 md:bottom-6 md:right-6"
        style={{ opacity: 0, visibility: ready ? "visible" : "hidden" }}>
        {/* the cut-corner fill lives on its own layer: the entrance animation's revert() clears the button's
            inline style, which used to take the clip-path (and so the brand corner) with it */}
        <span aria-hidden="true" className="absolute inset-0 -z-10 bg-brand-500 transition-colors duration-200 group-hover:bg-brand-400" style={chamfer(14, "tr")} />
        <svg viewBox="0 0 24 24" className="qc-bubble col-start-1 row-start-1 h-6 w-6" fill="currentColor" fillRule="evenodd" aria-hidden="true"><path d={BUBBLE} /></svg>
        <svg viewBox="0 0 24 24" className="qc-cross col-start-1 row-start-1 h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="square" aria-hidden="true" style={{ opacity: 0 }}><path d="M6 6l12 12M18 6 6 18" /></svg>
      </button>
    </>
  );
}
