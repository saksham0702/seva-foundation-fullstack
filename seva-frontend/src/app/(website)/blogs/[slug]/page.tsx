"use client";
import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { Calendar, User, Clock } from "lucide-react";
import { cmsAPI } from "@/app/api/cms";
import { CmsItem } from "@/types/cms";
import { ContentDetail } from "@/components/cms/ContentDetail";

export default function BlogDetailPage() {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<CmsItem | null>(null);
  const [related, setRelated] = useState<CmsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    (async () => {
      setIsLoading(true);
      try {
        const item = await cmsAPI.getItemById("blog", slug);
        setPost(item);
        const all = await cmsAPI.getItems("blog");
        setRelated(all.filter((b) => b.slug !== slug).slice(0, 3));
      } finally {
        setIsLoading(false);
      }
    })();
  }, [slug]);

  return (
    <ContentDetail
      item={post}
      isLoading={isLoading}
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
        ...(post?.readTime ? [{ icon: Clock, label: post.readTime, className: "text-gray-400 ml-auto" }] : []),
      ]}
      faqTitle="Frequently Asked Questions"
      footerName={post?.authorName || "SEVA Foundation Media"}
      footerSubtitle="Official Publication"
      footerIcon={<span>S</span>}
      shareText="Link copied to clipboard!"
      related={{
        items: related,
        hrefPrefix: "/blogs",
        sectionTitle: <>More <span style={{ color: "#E8542A" }}>Stories</span></>,
      }}
      ctaSlot={
        <div className="bg-gradient-to-br from-[#0f2347] to-[#162a52] text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <h2 className="text-2xl font-bold mb-3">Support Our Ongoing Causes</h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-xl">
            Your contribution helps provide healthcare, nutritious meals, and quality education
            to underprivileged communities across Uttarakhand and India.
          </p>
          <a href="/campaigns" className="inline-flex items-center gap-2 px-8 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-all shadow-lg text-sm">
            Donate to a Campaign
          </a>
        </div>
      }
    />
  );
}