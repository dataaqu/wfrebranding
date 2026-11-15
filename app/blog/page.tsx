import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import PageIntro from "@/components/sections/PageIntro";
import EmptyState from "@/components/sections/EmptyState";

export const metadata: Metadata = {
  title: "Blog - WEFORWARD",
  alternates: { canonical: "/blog" },
  description: "News, guides and updates from the WEFORWARD team.",
};

// Placeholder until the first posts are published.
export default function BlogPage() {
  return (
    <SubPage>
      <PageIntro title="Blog" text="News, guides and updates from the WEFORWARD team." />
      <EmptyState title="No posts yet" text="The first articles are on their way." />
    </SubPage>
  );
}
