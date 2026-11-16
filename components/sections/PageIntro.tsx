import { Reveal } from "@/components/brand/design-system";

/** Page title (the page's h1) with a short line of copy. */
export default function PageIntro({ title, text }: { title: string; text: string }) {
  return (
    <section className="bg-white pb-12 pt-6 md:pb-16">
      <Reveal id="page-intro" className="mx-auto flex max-w-[1600px] flex-wrap items-end justify-between gap-x-10 gap-y-5 px-6 md:px-10 lg:px-16">
        <h1 className="wf-head text-5xl md:text-7xl" style={{ color: "#04042b" }}>{title}</h1>
        <p className="max-w-md text-base leading-7 text-[#4b4b66]">{text}</p>
      </Reveal>
    </section>
  );
}
