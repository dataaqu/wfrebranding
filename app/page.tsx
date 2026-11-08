import { BrandFonts, Intro } from "@/components/brand/design-system";
import Hero from "@/components/sections/Hero";
import Facts from "@/components/sections/Facts";
import Services from "@/components/sections/Services";
import Tracking from "@/components/sections/Tracking";
import Network from "@/components/sections/Network";
import Contact from "@/components/sections/Contact";
import Routes from "@/components/sections/Routes";

export default function Page() {
  return <main id="main" className="font-sans antialiased" style={{ background: "#ffffff", color: "#04042b" }}>
    <BrandFonts /><Intro />
    <Hero />
    <Facts />
    <Routes />
    <Services />
    <Network />
    <Tracking />
    <Contact />
  </main>;
}
