"use client";

import React, { useEffect } from "react";
import JsonLd from "./JsonLd";
import { SITE_NAME, DEFAULT_DESCRIPTION, DEFAULT_OG_IMAGE, SITE_URL } from "@/lib/seo";

export interface SeoHeadProps {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  jsonLd?: Record<string, any> | Array<Record<string, any>>;
}

export default function SeoHead({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords,
  canonicalPath = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  jsonLd,
}: SeoHeadProps) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Care, Compassion & Change`;
  const canonicalUrl = `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

  useEffect(() => {
    if (typeof document !== "undefined") {
      document.title = fullTitle;

      // Update meta description
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement("meta");
        metaDesc.setAttribute("name", "description");
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute("content", description);

      // Update og:title
      let ogTitle = document.querySelector('meta[property="og:title"]');
      if (!ogTitle) {
        ogTitle = document.createElement("meta");
        ogTitle.setAttribute("property", "og:title");
        document.head.appendChild(ogTitle);
      }
      ogTitle.setAttribute("content", fullTitle);

      // Update og:description
      let ogDesc = document.querySelector('meta[property="og:description"]');
      if (!ogDesc) {
        ogDesc = document.createElement("meta");
        ogDesc.setAttribute("property", "og:description");
        document.head.appendChild(ogDesc);
      }
      ogDesc.setAttribute("content", description);
    }
  }, [fullTitle, description]);

  return (
    <>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords.join(", ")} />}
      <link rel="canonical" href={canonicalUrl} />

      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonicalUrl} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:type" content={ogType} />
      <meta property="og:image" content={ogImage} />

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={ogImage} />

      {jsonLd && <JsonLd data={jsonLd} />}
    </>
  );
}
