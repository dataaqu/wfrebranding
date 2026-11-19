import type { Metadata } from "next";
import SubPage from "@/components/sections/SubPage";
import PageIntro from "@/components/sections/PageIntro";
import { Pagination, PostsGrid } from "@/components/sections/BlogPosts";
import { POSTS, POSTS_PER_PAGE } from "@/lib/blog";

export const metadata: Metadata = {
  title: "Blog - WEFORWARD",
  alternates: { canonical: "/blog" },
  description: "News, guides and updates from the WEFORWARD team.",
};

// Test posts from lib/blog.ts, nine per page; ?page=n picks the page (out-of-range values clamp).
export default async function BlogPage({ searchParams }: { searchParams: Promise<{ [key: string]: string | string[] | undefined }> }) {
  const pages = Math.max(1, Math.ceil(POSTS.length / POSTS_PER_PAGE));
  const raw = Number((await searchParams).page);
  const page = Number.isInteger(raw) ? Math.min(Math.max(raw, 1), pages) : 1;
  const posts = POSTS.slice((page - 1) * POSTS_PER_PAGE, page * POSTS_PER_PAGE);
  return (
    <SubPage>
      <PageIntro title="Blog" text="News, guides and updates from the WEFORWARD team." />
      <section aria-label="Posts" className="bg-white pb-20 md:pb-28">
        <div className="mx-auto max-w-[1600px] px-6 md:px-10 lg:px-16">
          <PostsGrid posts={posts} />
          <Pagination page={page} pages={pages} />
        </div>
      </section>
    </SubPage>
  );
}
