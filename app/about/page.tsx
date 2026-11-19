import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import PageIntro from "@/components/sections/PageIntro";
import Founders from "@/components/sections/Founders";
import Facts from "@/components/sections/Facts";
import Network from "@/components/sections/Network";

export const metadata: Metadata = {
  title: "About us - WEFORWARD",
  alternates: { canonical: "/about" },
  description: "One team for air, sea, rail and road freight plus customs brokerage, to and from Georgia.",
};

export default function AboutPage() {
  return (
    <SubPage>
      <PageIntro title="About us" text="Air, sea, rail and road freight plus customs brokerage - one partner moving your cargo from China, Europe and beyond to your door in Georgia." />
      <Founders />
      <Facts />
      <Network />
    </SubPage>
  );
}
