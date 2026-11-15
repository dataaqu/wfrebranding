import type { Metadata } from "next";
import { BrandFonts, Intro } from "@/components/brand/design-system";
import Hero from "@/components/sections/Hero";
import Facts from "@/components/sections/Facts";
import Services from "@/components/sections/Services";
import Network from "@/components/sections/Network";
import Footer from "@/components/sections/Footer";
import Routes from "@/components/sections/Routes";

// The route explorer mirrors its selection in the query string (?route=…) so a view can be shared;
// canonical tells search engines every such URL is this one page.
export const metadata: Metadata = { alternates: { canonical: "/" } };

export default function Page() {
  return <main id="main" className="font-sans antialiased" style={{ background: "#ffffff", color: "#04042b" }}>
    <BrandFonts /><Intro />
    <Hero />
    <Facts />
    <Routes />
    <Services />
    <Network />
    <Footer />
  </main>;
}
