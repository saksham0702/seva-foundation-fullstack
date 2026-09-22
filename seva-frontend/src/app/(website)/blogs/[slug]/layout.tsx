import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";
import React from "react";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;

  try {
    const API_BASE =
      process.env.INTERNAL_API_URL ||
      process.env.NEXT_PUBLIC_API_URL ||
      "http://127.0.0.1:5000/api";
    const res = await fetch(`${API_BASE}/blogs/${slug}`, {
      next: { revalidate: 3600 },
    });
    if (res.ok) {
      const data = await res.json();
      const blog = data?.data || data;
      if (blog) {
        return constructMetadata({
          title: blog.title || blog.name,
          description:
            blog.summary ||
            blog.description ||
            `Read "${blog.title || blog.name}" — an article from Seva India Foundation.`,
          keywords: blog.tags || [
            "NGO Blog",
            "Social Impact",
            "Seva India Foundation Story",
          ],
          canonicalPath: `/blogs/${slug}`,
          ogImage: blog.featuredImage || blog.image,
          ogType: "article",
          publishedTime: blog.publishedAt || blog.createdAt,
          modifiedTime: blog.updatedAt,
        });
      }
    }
  } catch (e) {
    // fallback
  }

  return constructMetadata({
    title: "Blog Article",
    description:
      "Read the latest news and impact stories from Seva India Foundation.",
    canonicalPath: `/blogs/${slug}`,
    ogType: "article",
  });
}

export default function BlogSlugLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
