"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, Globe, Clock, Newspaper } from "lucide-react";
import { cmsAPI } from "@/app/api/cms";
import { CmsItem } from "@/types/cms";
import { ContentDetail } from "@/components/cms/ContentDetail";

export default function NewsDetailPage() {
  const params = useParams<{ slug: string }>();
  const slug = params?.slug;

  const [newsItem, setNewsItem] = useState<CmsItem | null>(null);
  const [related, setRelated] = useState<CmsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadNews() {
      if (!slug) return;
      setIsLoading(true);
      try {
        const item = await cmsAPI.getItemById("news", slug);
        setNewsItem(item);
        const allNews = await cmsAPI.getItems("news");
        setRelated(allNews.filter((n) => n.slug !== slug).slice(0, 3));
      } catch (err) {
        console.error("Failed to load news detail:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadNews();
  }, [slug]);

  return (
    <ContentDetail
      item={newsItem}
      isLoading={isLoading}
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
          ? [{ icon: Globe, label: newsItem.newsSource, className: "text-[#0A1A2F] bg-gray-100 px-2.5 py-1 rounded-md" }]
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
        sectionTitle: <>More <span style={{ color: "#F5A623" }}>Updates</span></>,
      }}
    />
  );
}
