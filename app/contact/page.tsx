import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import Contact from "@/components/sections/Contact";
import ContactInfo from "@/components/sections/ContactInfo";
import Faq from "@/components/sections/Faq";

export const metadata: Metadata = {
  title: "Contact - WEFORWARD",
  alternates: { canonical: "/contact" },
  description: "Tell us what you are shipping and our team will come back with a route and a quote.",
};

export default function ContactPage() {
  return (
    <SubPage>
      <ContactInfo />
      <Contact />
      <Faq />
    </SubPage>
  );
}
