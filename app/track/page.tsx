import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import Tracking from "@/components/sections/Tracking";

export const metadata: Metadata = {
  title: "Track your cargo - WEFORWARD",
  alternates: { canonical: "/track" },
  description: "Container, air waybill, vessel or flight: open the right official tracker from one place.",
};

export default function TrackPage() {
  return (
    <SubPage>
      <Tracking />
    </SubPage>
  );
}
