import { BrandFonts } from "@/components/brand/design-system";
import Header from "./Header";
import Footer from "./Footer";

/** Frame for every page except home: solid header, room for it, the page's sections, footer. */
export default function SubPage({ children }: { children: React.ReactNode }) {
  return (
    <main id="main" className="font-sans antialiased" style={{ background: "#ffffff", color: "#04042b" }}>
      <BrandFonts />
      <Header solid />
      {/* room for the fixed header, then breathing space above the first heading */}
      <div aria-hidden="true" className="h-20 md:h-28" />
      {children}
      <Footer />
    </main>
  );
}
