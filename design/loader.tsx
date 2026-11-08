import { useState } from "react";
import { motion, useReducedMotion } from "motion/react";
import { BrandFonts, Intro, INTRO_REVEAL_AT, LogoHorizontal, WGraphic, Tag, Button, IconClock, IconArrow } from "./design-system";

export default function Loader() {
  const reduce = !!useReducedMotion();
  const [run, setRun] = useState(0);
  const at = reduce ? 0 : INTRO_REVEAL_AT;
  const ease = [0.16, 1, 0.3, 1];
  const rise = (i: number) => ({ initial: reduce ? false : { y: "110%" }, animate: { y: "0%" }, transition: { duration: 0.9, delay: at + i * 0.08, ease } });
  const fade = (d: number) => ({ initial: reduce ? false : { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.6, delay: at + d, ease } });

  return (
    <main id="main" className="relative min-h-screen overflow-hidden bg-ink-950 font-sans">
      <BrandFonts />
      <div key={"hero" + run} className="relative flex min-h-screen flex-col">
        <WGraphic className="-right-24 top-16 hidden h-[620px] md:block" color="var(--color-brand-500)" />
        <motion.div data-anim="after-header" {...fade(0.35)} className="relative flex items-center justify-between px-6 py-6 md:px-10">
          <LogoHorizontal size="sm" />
          <Button id="after-quote" href="#main">Get a quote</Button>
        </motion.div>
        <div className="relative flex flex-1 flex-col justify-center px-6 pb-20 md:px-10">
          <motion.div data-anim="after-tag" {...fade(0.2)}><Tag><IconClock className="h-3.5 w-3.5" />China → Georgia by rail · 14 days</Tag></motion.div>
          <h1 className="sr-only">You deal. We deliver.</h1>
          <div aria-hidden="true" className="mt-8">
            <div style={{ overflow: "hidden" }}><motion.div data-anim="after-line-0" {...rise(0)} className="wf-head text-5xl text-brand-400 md:text-8xl">You deal.</motion.div></div>
            <div style={{ overflow: "hidden" }}><motion.div data-anim="after-line-1" {...rise(1)} className="wf-head text-5xl text-white md:text-8xl">We deliver.</motion.div></div>
          </div>
          <motion.p data-anim="after-copy" {...fade(0.3)} className="mt-8 max-w-md text-base leading-7 text-ink-200">Your trusted freight partner in Georgia — air, sea, rail and road, door to door.</motion.p>
        </div>
      </div>
      <Intro key={"intro" + run} />
      <button type="button" data-anim="loader-replay" onClick={() => setRun(run + 1)} className="wf-sub absolute bottom-8 right-8 z-50 inline-flex min-h-11 items-center gap-2 rounded-pill border border-white/25 bg-ink-950 px-5 text-xs font-bold text-ink-300 transition-colors hover:border-white hover:text-white">
        Replay <IconArrow className="h-4 w-4 text-volt-500" />
      </button>
    </main>
  );
}
