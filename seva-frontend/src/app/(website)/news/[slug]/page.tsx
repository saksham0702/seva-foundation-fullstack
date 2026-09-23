import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, Globe, Clock, Newspaper } from "lucide-react";
import { getServerCmsItemBySlug, getServerCmsItems } from "@/lib/server-api";
import { constructMetadata, getArticleSchema } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import JsonLd from "@/components/common/JsonLd";
import { ContentDetail } from "@/components/cms/ContentDetail";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) return constructMetadata({ title: "Press Release" });

  const item = await getServerCmsItemBySlug("news", slug);
  if (!item) {
    return constructMetadata({
      title: "Press Release Not Found",
      description: "The requested press release could not be found.",
      noIndex: true,
    });
  }

  const cleanExcerpt = (item.excerpt || item.content || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);

  return constructMetadata({
    title: item.title,
    description: cleanExcerpt || `Official press release: ${item.title}`,
    canonicalPath: `/news/${item.slug}`,
    ogType: "article",
    ogImage: item.featuredImage ? getImageUrl(item.featuredImage) : undefined,
    publishedTime: item.publishedAt,
    keywords: [
      item.title,
      item.category || "Press Release",
      "Seva Foundation News",
      "Official Statement",
    ],
  });
}

export default async function NewsDetailPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) notFound();

  const [newsItem, allNews] = await Promise.all([
    getServerCmsItemBySlug("news", slug),
    getServerCmsItems("news"),
  ]);

  if (!newsItem) {
    notFound();
  }

  const related = allNews.filter((n) => n.slug !== slug).slice(0, 3);

  const articleSchema = getArticleSchema({
    title: newsItem.title,
    summary: newsItem.excerpt,
    slug: newsItem.slug,
    featuredImage: newsItem.featuredImage ? getImageUrl(newsItem.featuredImage) : undefined,
    author: newsItem.newsSource || newsItem.authorName,
    createdAt: newsItem.publishedAt || newsItem.createdAt,
    updatedAt: newsItem.updatedAt,
  });

  return (
    <>
      <JsonLd data={articleSchema} />
      <ContentDetail
        item={newsItem}
        isLoading={false}
        backHref="/news"
        backLabel="Back to All News"
        loadingLabel="Loading press release…"
        notFoundTitle="Statement Not Found"
        notFoundText="The press release or news item you are looking for is unavailable."
        accentColor="#F5A623"
        headingColor="#0A1A2F"
        badgeClassName="bg-[#0A1A2F] text-[#F5A623]"
        badgeLabel={newsItem?.category || "Press Release"}
        metaItems={[
          { icon: Calendar, label: newsItem?.publishedAt || "" },
          ...(newsItem?.newsSource
            ? [
                {
                  icon: Globe,
                  label: newsItem.newsSource,
                  className: "text-[#0A1A2F] bg-gray-100 px-2.5 py-1 rounded-md",
                },
              ]
            : []),
          ...(newsItem?.readTime
            ? [{ icon: Clock, label: newsItem.readTime, className: "text-gray-400 ml-auto" }]
            : []),
        ]}
        faqTitle="Key Information & FAQs"
        footerName={newsItem?.newsSource || newsItem?.authorName || "SEVA Communications Office"}
        footerSubtitle="Media Relations Desk"
        footerIcon={<Newspaper size={18} />}
        shareText="Press release URL copied!"
        related={{
          items: related,
          hrefPrefix: "/news",
          sectionTitle: (
            <>
              More <span style={{ color: "#F5A623" }}>Updates</span>
            </>
          ),
        }}
      />
    </>
  );
}
