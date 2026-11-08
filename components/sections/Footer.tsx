"use client";

import { WMark, LogoHorizontal } from "@/components/brand/design-system";

export default function Footer() {
  return (
    <footer id="footer" className="bg-ink-950">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-10 px-6 py-14 md:px-10">
          <div>
            <LogoHorizontal tagline />
            <p className="mt-6 max-w-xs text-sm leading-6 text-ink-400">Cargo & freight forwarding from Tbilisi to the world.</p>
          </div>
          <WMark className="hidden h-24 w-auto md:block" color="var(--color-brand-500)" />
        </div>
        <div className="bg-brand-500">
          <div className="wf-sub mx-auto flex max-w-6xl flex-wrap justify-between gap-4 px-6 py-4 text-[10px] font-bold text-white md:px-10">
            <span className="whitespace-nowrap">+995 591 32 12 92</span><span>info@weforward.ge</span><span>weforward.ge</span><span>© 2026 WEFORWARD</span>
          </div>
        </div>
      </footer>
  );
}
