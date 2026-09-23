import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, User, Clock } from "lucide-react";
import { getServerCmsItemBySlug, getServerCmsItems } from "@/lib/server-api";
import { constructMetadata, getArticleSchema } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import JsonLd from "@/components/common/JsonLd";
import { ContentDetail } from "@/components/cms/ContentDetail";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export const dynamic = "force-dynamic";

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) return constructMetadata({ title: "Story" });

  const post = await getServerCmsItemBySlug("blog", slug);
  if (!post) {
    return constructMetadata({
      title: "Story Not Found",
      description: "The requested article or story could not be found.",
      noIndex: true,
    });
  }

  const cleanExcerpt = (post.excerpt || post.content || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);

  return constructMetadata({
    title: post.title,
    description: cleanExcerpt || `Read ${post.title} on Seva India Foundation official blog.`,
    canonicalPath: `/blogs/${post.slug}`,
    ogType: "article",
    ogImage: post.featuredImage ? getImageUrl(post.featuredImage) : undefined,
    publishedTime: post.publishedAt,
    authors: post.authorName ? [post.authorName] : undefined,
    keywords: [
      post.title,
      post.category || "Social Impact",
      "Seva Foundation Story",
      "NGO Blog",
    ],
  });
}

export default async function BlogDetailPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) notFound();

  const [post, allPosts] = await Promise.all([
    getServerCmsItemBySlug("blog", slug),
    getServerCmsItems("blog"),
  ]);

  if (!post) {
    notFound();
  }

  const related = allPosts.filter((b) => b.slug !== slug).slice(0, 3);

  const articleSchema = getArticleSchema({
    title: post.title,
    summary: post.excerpt,
    slug: post.slug,
    featuredImage: post.featuredImage ? getImageUrl(post.featuredImage) : undefined,
    author: post.authorName,
    createdAt: post.publishedAt || post.createdAt,
    updatedAt: post.updatedAt,
  });

  return (
    <>
      <JsonLd data={articleSchema} />
      <ContentDetail
        item={post}
        isLoading={false}
        backHref="/blogs"
        backLabel="Back to All Stories"
        loadingLabel="Loading article…"
        notFoundTitle="Article Not Found"
        notFoundText="The story you are looking for does not exist or may have been moved."
        accentColor="#E8542A"
        headingColor="#0f2347"
        badgeClassName="bg-[#E8542A] text-white"
        badgeLabel={post?.category || "General"}
        metaItems={[
          { icon: Calendar, label: post?.publishedAt || "" },
          ...(post?.authorName ? [{ icon: User, label: post.authorName }] : []),
          ...(post?.readTime
            ? [{ icon: Clock, label: post.readTime, className: "text-gray-400 ml-auto" }]
            : []),
        ]}
        faqTitle="Frequently Asked Questions"
        footerName={post?.authorName || "SEVA Foundation Media"}
        footerSubtitle="Official Publication"
        footerIcon={<span>S</span>}
        shareText="Link copied to clipboard!"
        related={{
          items: related,
          hrefPrefix: "/blogs",
          sectionTitle: (
            <>
              More <span style={{ color: "#E8542A" }}>Stories</span>
            </>
          ),
        }}
        ctaSlot={
          <div className="bg-gradient-to-br from-[#0f2347] to-[#162a52] text-white rounded-3xl p-8 sm:p-10 shadow-xl">
            <h2 className="text-2xl font-bold mb-3">Support Our Ongoing Causes</h2>
            <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-xl">
              Your contribution helps provide healthcare, nutritious meals, and quality education
              to underprivileged communities across Uttarakhand and India.
            </p>
            <a
              href="/campaigns"
              className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-all shadow-lg text-sm"
            >
              Donate to a Campaign
            </a>
          </div>
        }
      />
    </>
  );
}