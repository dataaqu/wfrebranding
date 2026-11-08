import { BrandFonts, Intro } from "@/components/brand/design-system";
import Hero from "@/components/sections/Hero";
import Facts from "@/components/sections/Facts";
import Services from "@/components/sections/Services";
import Tracking from "@/components/sections/Tracking";
import Routes from "@/components/sections/Routes";
import Rail from "@/components/sections/Rail";
import Brokerage from "@/components/sections/Brokerage";
import Quote from "@/components/sections/Quote";
import Footer from "@/components/sections/Footer";

export default function Page() {
  return <main id="main" className="font-sans antialiased" style={{ background: "#ffffff", color: "#04042b" }}>
    <BrandFonts /><Intro />
    <Hero />
    <Facts />
    <Routes />
    <Services />
    <Tracking />
    <Rail />
    <Brokerage />
    <Quote />
    <Footer />
  </main>;
}
