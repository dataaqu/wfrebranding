/* Blog posts. TEST CONTENT ONLY — titles, dates, excerpts and images are placeholders to try the design;
   replace with the real posts (or a CMS) before launch. Newest first. */

export type Post = { slug: string; title: string; excerpt: string; date: string; tag: string; image: string };

export const POSTS: Post[] = [
  {
    slug: "groupage-ltl-explained",
    title: "Groupage (LTL) explained: shipping less than a full truck",
    excerpt: "How consolidated road freight works, when it makes sense for smaller loads, and what to have ready before you book.",
    date: "2026-11-18",
    tag: "Guide",
    image: "/assets/hero-port.webp",
  },
  {
    slug: "customs-documents-georgia",
    title: "Customs clearance in Georgia: the documents to prepare",
    excerpt: "A short checklist of the paperwork a customs declaration usually needs, so your cargo is not held at the border.",
    date: "2026-11-10",
    tag: "Customs",
    image: "/assets/services/customs.jpg",
  },
  {
    slug: "sea-or-rail-from-china",
    title: "Sea or rail from China: how to choose the mode",
    excerpt: "Transit time, cost and cargo type — the trade-offs that decide between a container ship and a train.",
    date: "2026-10-28",
    tag: "Modes",
    image: "/assets/services/rail.jpg",
  },
  {
    slug: "incoterms-basics",
    title: "Incoterms basics: who pays for what",
    excerpt: "EXW, FOB, CIF, DAP — what the common terms mean for cost, risk and paperwork on your shipment.",
    date: "2026-10-14",
    tag: "Basics",
    image: "/assets/services/sea.jpg",
  },
  {
    slug: "air-freight-when-it-pays",
    title: "When air freight is worth the price",
    excerpt: "Urgent parts, high-value goods and short shelf lives: the cases where speed outweighs cost.",
    date: "2026-10-02",
    tag: "Modes",
    image: "/assets/services/air.jpg",
  },
  {
    slug: "warehousing-consolidation",
    title: "Consolidation warehouses: one truck, many suppliers",
    excerpt: "Why collecting several suppliers' goods in one warehouse can lower the cost of each shipment.",
    date: "2026-09-21",
    tag: "Guide",
    image: "/assets/services/warehouse.jpg",
  },
  {
    slug: "packing-for-road-freight",
    title: "Packing cargo for long road journeys",
    excerpt: "Pallets, strapping and labels — simple steps that keep goods intact across borders.",
    date: "2026-09-09",
    tag: "Guide",
    image: "/assets/services/road.jpg",
  },
  {
    slug: "hs-codes-basics",
    title: "HS codes: why the right number matters",
    excerpt: "How the commodity code on your invoice affects duties and how long customs takes.",
    date: "2026-08-27",
    tag: "Customs",
    image: "/assets/services/customs.jpg",
  },
  {
    slug: "fcl-vs-lcl",
    title: "FCL or LCL: full container or shared",
    excerpt: "How to decide between booking a whole container and sharing one with other shippers.",
    date: "2026-08-12",
    tag: "Basics",
    image: "/assets/services/sea.jpg",
  },
  {
    slug: "rail-transit-times",
    title: "What affects rail transit times",
    excerpt: "Border handovers, gauge changes and terminal capacity — what slows a train, and what speeds it up.",
    date: "2026-07-30",
    tag: "Modes",
    image: "/assets/services/rail.jpg",
  },
  {
    slug: "insuring-your-cargo",
    title: "Insuring your cargo: the essentials",
    excerpt: "What cargo insurance covers, what it does not, and when it is worth adding.",
    date: "2026-07-15",
    tag: "Basics",
    image: "/assets/hero-port.webp",
  },
  {
    slug: "export-from-georgia",
    title: "Exporting from Georgia: first steps",
    excerpt: "The paperwork and planning a first export shipment usually needs.",
    date: "2026-07-01",
    tag: "Guide",
    image: "/assets/services/road.jpg",
  },
];

export const POSTS_PER_PAGE = 9;

export const formatPostDate = (iso: string) =>
  new Date(iso + "T00:00:00Z").toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
