"use client";

import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { Reveal, chamfer } from "@/components/brand/design-system";
import { POSTS, formatPostDate, type Post } from "@/lib/blog";

/* Blog cards. The newest post leads as a large card; the next ones sit beside it as compact rows.
   Used on the home page (latest four + "See more") and on /blog. Posts are test content (lib/blog.ts),
   and cards don't open an article yet — there are no post pages until the real content exists. */

const NAVY = "#04042b";
const EASE_OUT = [0.16, 1, 0.3, 1] as const;

function Meta({ p }: { p: Post }) {
  return (
    <p className="flex items-center gap-3 text-[12px] text-[#6f6e88]">
      <span className="wf-sub flex items-center gap-1.5 font-bold text-brand-500"><span aria-hidden="true" className="h-1.5 w-1.5 bg-brand-500" />{p.tag}</span>
      <time dateTime={p.date}>{formatPostDate(p.date)}</time>
    </p>
  );
}

/** Hairline frame with the brand's cut corner (frame = 1px of the outer layer); purple on hover. */
function Frame({ children, className = "", cut = 24 }: { children: React.ReactNode; className?: string; cut?: number }) {
  return (
    <div className={`group h-full bg-[#e9e7f4] p-px transition-colors duration-300 [@media(hover:hover)]:hover:bg-brand-500 ${className}`} style={chamfer(cut, "tr")}>
      <article className="flex h-full bg-white" style={chamfer(cut - 1, "tr")}>{children}</article>
    </div>
  );
}

function Photo({ p, className }: { p: Post; className: string }) {
  return (
    <div className={`relative shrink-0 overflow-hidden bg-[#0b0b1f] ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={p.image} alt="" loading="lazy" decoding="async"
        className="absolute inset-0 h-full w-full object-cover transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] [@media(hover:hover)]:group-hover:scale-[1.05]" />
    </div>
  );
}

function Featured({ p }: { p: Post }) {
  return (
    <Frame cut={32}>
      <div className="flex w-full flex-col">
        <Photo p={p} className="aspect-[16/10] w-full" />
        <div className="flex flex-1 flex-col p-6 md:p-8">
          <Meta p={p} />
          <h3 className="mt-4 text-2xl font-medium leading-tight tracking-tight md:text-[2rem]" style={{ color: NAVY }}>{p.title}</h3>
          <p className="mt-3 max-w-xl text-[15px] leading-7 text-[#4b4b66]">{p.excerpt}</p>
        </div>
      </div>
    </Frame>
  );
}

function Row({ p }: { p: Post }) {
  return (
    <Frame>
      <div className="flex w-full flex-col sm:flex-row">
        <Photo p={p} className="aspect-[16/10] w-full sm:aspect-auto sm:w-[38%]" />
        <div className="flex flex-1 flex-col justify-center p-5 md:p-6">
          <Meta p={p} />
          <h3 className="mt-3 text-lg font-medium leading-snug tracking-tight md:text-xl" style={{ color: NAVY }}>{p.title}</h3>
          <p className="mt-2 line-clamp-2 text-[14px] leading-6 text-[#4b4b66]">{p.excerpt}</p>
        </div>
      </div>
    </Frame>
  );
}

function Item({ children, i }: { children: React.ReactNode; i: number }) {
  const reduce = useReducedMotion();
  return (
    <motion.div className="h-full" initial={reduce ? false : { opacity: 0, y: 24 }} whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }} transition={{ duration: 0.6, ease: EASE_OUT, delay: reduce ? 0 : i * 0.08 }}>
      {children}
    </motion.div>
  );
}

/** /blog grid card: photo on top, then tag + date, title and excerpt. */
function Card({ p }: { p: Post }) {
  return (
    <Frame>
      <div className="flex w-full flex-col">
        <Photo p={p} className="aspect-[16/10] w-full" />
        <div className="flex flex-1 flex-col p-6">
          <Meta p={p} />
          <h3 className="mt-3 text-xl font-medium leading-snug tracking-tight" style={{ color: NAVY }}>{p.title}</h3>
          <p className="mt-2 line-clamp-3 text-[14px] leading-6 text-[#4b4b66]">{p.excerpt}</p>
        </div>
      </div>
    </Frame>
  );
}

/** Plain 3-column grid (2 on tablets, 1 on phones). */
export function PostsGrid({ posts }: { posts: Post[] }) {
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3 lg:gap-6">
      {posts.map((p, i) => <Item key={p.slug} i={i % 3}><Card p={p} /></Item>)}
    </div>
  );
}

/** Previous / page numbers / next; links to /blog?page=n (page 1 is plain /blog). */
export function Pagination({ page, pages }: { page: number; pages: number }) {
  if (pages <= 1) return null;
  const href = (n: number) => (n === 1 ? "/blog" : `/blog?page=${n}`);
  const BOX = "inline-flex h-11 min-w-11 items-center justify-center px-3 text-[14px] font-medium transition-colors";
  const arrow = (dir: "prev" | "next") => (
    <svg viewBox="0 0 24 24" className={`h-4 w-4 ${dir === "prev" ? "rotate-180" : ""}`} fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
  );
  return (
    <nav aria-label="Blog pages" className="mt-12 flex items-center justify-center gap-2">
      {page > 1
        ? <Link href={href(page - 1)} aria-label="Previous page" className={`${BOX} text-brand-500 ring-1 ring-inset ring-[#e9e7f4] hover:bg-[#f3f2fd]`}>{arrow("prev")}</Link>
        : <span aria-hidden="true" className={`${BOX} text-[#c9c8d6] ring-1 ring-inset ring-[#f0eff6]`}>{arrow("prev")}</span>}
      {Array.from({ length: pages }, (_, i) => i + 1).map((n) => n === page
        ? <span key={n} aria-current="page" className={`${BOX} bg-ink-950 text-white`} style={chamfer(8, "tr")}>{n}</span>
        : <Link key={n} href={href(n)} className={`${BOX} ring-1 ring-inset ring-[#e9e7f4] hover:bg-[#f3f2fd]`} style={{ color: NAVY }}>{n}</Link>)}
      {page < pages
        ? <Link href={href(page + 1)} aria-label="Next page" className={`${BOX} text-brand-500 ring-1 ring-inset ring-[#e9e7f4] hover:bg-[#f3f2fd]`}>{arrow("next")}</Link>
        : <span aria-hidden="true" className={`${BOX} text-[#c9c8d6] ring-1 ring-inset ring-[#f0eff6]`}>{arrow("next")}</span>}
    </nav>
  );
}

/** Newest post large on the left, the next three stacked on the right (stacked under it on phones). */
function PostsLayout({ posts }: { posts: Post[] }) {
  const [first, ...rest] = posts;
  return (
    <div className="grid gap-5 lg:grid-cols-2 lg:gap-6">
      {first && <Item i={0}><Featured p={first} /></Item>}
      <div className="grid gap-5 lg:grid-rows-3 lg:gap-6">
        {rest.map((p, i) => <Item key={p.slug} i={i + 1}><Row p={p} /></Item>)}
      </div>
    </div>
  );
}

/** Home page: latest four posts and a link to the blog. */
export default function BlogPreview() {
  return (
    <section id="blog" aria-labelledby="blog-title" className="bg-white py-16 md:py-24">
      <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16">
        <div className="mb-10 flex flex-wrap items-end justify-between gap-6">
          <Reveal id="blog-head"><h2 id="blog-title" className="wf-head text-4xl md:text-6xl" style={{ color: NAVY }}>Latest news</h2></Reveal>
          <Link href="/blog"
            className="wf-sub inline-flex min-h-12 items-center gap-3 bg-brand-500 px-6 text-[13px] font-bold text-white transition-colors hover:bg-brand-400"
            style={chamfer(14, "br")}>
            See more
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true"><path d="M5 12h14M13 6l6 6-6 6" /></svg>
          </Link>
        </div>
        <PostsLayout posts={POSTS.slice(0, 4)} />
      </div>
    </section>
  );
}
