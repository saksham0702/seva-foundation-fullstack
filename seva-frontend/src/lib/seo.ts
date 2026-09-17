import type { Metadata } from "next";

export const SITE_NAME = "Seva India Foundation";
export const DEFAULT_DESCRIPTION =
  "Seva India Foundation is a registered Section 8 NGO committed to providing healthcare, quality education, disaster relief, and sustainable community empowerment across India.";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL || "https://sevaindiafoundation.org";
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/seva-logo.png`;

interface SeoOptions {
  title?: string;
  description?: string;
  keywords?: string[];
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  publishedTime?: string;
  modifiedTime?: string;
  authors?: string[];
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  keywords = [
    "Seva India Foundation",
    "NGO India",
    "Donation India",
    "80G Tax Exemption",
    "Section 8 Company",
    "Social Impact",
    "Education Non Profit",
    "Healthcare Relief",
    "Charity",
  ],
  canonicalPath = "",
  ogImage = DEFAULT_OG_IMAGE,
  ogType = "website",
  publishedTime,
  modifiedTime,
  authors,
  noIndex = false,
}: SeoOptions = {}): Metadata {
  const fullTitle = title
    ? `${title} | ${SITE_NAME}`
    : `${SITE_NAME} | Care, Compassion & Change`;

  const canonicalUrl = `${SITE_URL}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

  const imageObj = {
    url: ogImage,
    width: 1200,
    height: 630,
    alt: title || SITE_NAME,
  };

  const metadata: Metadata = {
    title: fullTitle,
    description,
    keywords,
    alternates: {
      canonical: canonicalUrl,
    },
    openGraph: {
      title: fullTitle,
      description,
      url: canonicalUrl,
      siteName: SITE_NAME,
      images: [imageObj],
      locale: "en_IN",
      type: ogType,
      ...(publishedTime && { publishedTime }),
      ...(modifiedTime && { modifiedTime }),
      ...(authors && { authors }),
    },
    twitter: {
      card: "summary_large_image",
      title: fullTitle,
      description,
      images: [ogImage],
      site: "@sevaindia",
      creator: "@sevaindia",
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };

  return metadata;
}

// ── JSON-LD Structured Data Helpers ──────────────────────────────────────────

export function getOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "NGO",
    name: SITE_NAME,
    alternateName: "Seva Foundation",
    url: SITE_URL,
    logo: `${SITE_URL}/assets/seva-logo.png`,
    description: DEFAULT_DESCRIPTION,
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+91-9456517577",
      contactType: "customer service",
      email: "info@sevaindiafoundation.org",
      areaServed: "IN",
      availableLanguage: ["English", "Hindi"],
    },
    address: {
      "@type": "PostalAddress",
      streetAddress: "20, Sahastradhara Road, Upper Adhoiwala",
      addressLocality: "Dehradun",
      addressRegion: "Uttarakhand",
      postalCode: "248001",
      addressCountry: "IN",
    },
    sameAs: [
      "https://facebook.com",
      "https://twitter.com",
      "https://instagram.com",
      "https://youtube.com",
    ],
  };
}

export function getCampaignSchema(campaign: {
  name: string;
  description?: string;
  slug: string;
  goal?: number;
  raisedAmount?: number;
  featuredImage?: string;
  createdAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "DonateAction",
    name: campaign.name,
    description: campaign.description || DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/campaigns/${campaign.slug}`,
    image: campaign.featuredImage || DEFAULT_OG_IMAGE,
    recipient: {
      "@type": "NGO",
      name: SITE_NAME,
      url: SITE_URL,
    },
    target: {
      "@type": "EntryPoint",
      urlTemplate: `${SITE_URL}/campaigns/${campaign.slug}`,
      actionPlatform: [
        "http://schema.org/DesktopWebPlatform",
        "http://schema.org/MobileWebPlatform",
      ],
    },
  };
}

export function getArticleSchema(blog: {
  title: string;
  summary?: string;
  slug: string;
  featuredImage?: string;
  author?: string;
  createdAt?: string;
  updatedAt?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: blog.title,
    description: blog.summary || DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/blogs/${blog.slug}`,
    image: blog.featuredImage || DEFAULT_OG_IMAGE,
    datePublished: blog.createdAt,
    dateModified: blog.updatedAt || blog.createdAt,
    author: {
      "@type": "Person",
      name: blog.author || "Seva India Foundation Team",
    },
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_URL}/assets/seva-logo.png`,
      },
    },
  };
}

export function getWebPageSchema({
  title,
  description,
  path,
}: {
  title: string;
  description: string;
  path: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: title,
    description,
    url: `${SITE_URL}${path.startsWith("/") ? path : `/${path}`}`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}
