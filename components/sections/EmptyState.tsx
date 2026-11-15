"use client";

import Link from "next/link";
import { WMark, chamfer } from "@/components/brand/design-system";

/** Placeholder panel for pages whose content isn't published yet (no openings, no posts). */
export default function EmptyState({ title, text, cta }: { title: string; text: string; cta?: { label: string; href: string } }) {
  return (
    <section className="bg-white pb-28">
      <div className="mx-auto max-w-[1360px] px-6 md:px-10">
        <div className="flex flex-col items-start gap-6 bg-[#f8f7ff] px-8 py-14 md:flex-row md:items-center md:justify-between md:px-14 md:py-20" style={chamfer(32, "tr")}>
          <div className="flex items-start gap-6">
            <WMark className="h-12 w-auto shrink-0" />
            <div>
              <h2 className="text-2xl font-medium tracking-tight md:text-3xl" style={{ color: "#04042b" }}>{title}</h2>
              <p className="mt-3 max-w-lg text-base leading-7 text-[#4b4b66]">{text}</p>
            </div>
          </div>
          {cta && (
            <Link href={cta.href} className="wf-sub inline-flex min-h-12 shrink-0 items-center justify-center bg-brand-500 px-6 text-[13px] font-bold text-white transition-colors hover:bg-brand-400" style={chamfer(14, "br")}>
              {cta.label}
            </Link>
          )}
        </div>
      </div>
    </section>
  );
}
