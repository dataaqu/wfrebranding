import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import PageIntro from "@/components/sections/PageIntro";
import EmptyState from "@/components/sections/EmptyState";

export const metadata: Metadata = {
  title: "Career - WEFORWARD",
  alternates: { canonical: "/career" },
  description: "Work with the WEFORWARD team in Tbilisi.",
};

// Placeholder until openings are published.
export default function CareerPage() {
  return (
    <SubPage>
      <PageIntro title="Career" text="Join the team behind your cargo." />
      <EmptyState title="No open positions right now" text="New roles will be listed here. Want to work with us in the meantime? Tell us about yourself." cta={{ label: "Get in touch", href: "/contact" }} />
    </SubPage>
  );
}
