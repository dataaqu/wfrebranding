import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import PageIntro from "@/components/sections/PageIntro";
import Services from "@/components/sections/Services";
import Routes from "@/components/sections/Routes";

export const metadata: Metadata = {
  title: "Services - WEFORWARD",
  alternates: { canonical: "/services" },
  description: "Road, sea, air and rail freight, warehousing and customs brokerage, to and from Georgia.",
};

export default function ServicesPage() {
  return (
    <SubPage>
      <PageIntro title="Services" text="Road, sea, air and rail freight, warehousing and customs brokerage - handled by one team end to end." />
      <Services heading={false} />
      <Routes />
    </SubPage>
  );
}
