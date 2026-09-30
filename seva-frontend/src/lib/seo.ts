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
  ogImageWidth?: number;
  ogImageHeight?: number;
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
  ogImageWidth = 1200,
  ogImageHeight = 630,
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
    width: ogImageWidth,
    height: ogImageHeight,
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
    icons: {
      icon: [
        { url: "/favicon.ico", sizes: "any" },
        { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
        { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      ],
      shortcut: "/favicon.ico",
      apple: [
        { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
      ],
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

export function getInitiativeSchema(initiative: {
  title: string;
  description?: string;
  slug: string;
  image?: string;
}) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    name: initiative.title,
    description: initiative.description || DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/our-work/${initiative.slug}`,
    image: initiative.image || DEFAULT_OG_IMAGE,
    provider: {
      "@type": "NGO",
      name: SITE_NAME,
      url: SITE_URL,
    },
    areaServed: {
      "@type": "Country",
      name: "India",
    },
  };
}

export function getCampaignsCollectionSchema(campaigns: Array<any> = []) {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `Active Grassroots Donation Campaigns | ${SITE_NAME}`,
    description: "Explore active grassroots donation campaigns by Seva India Foundation with instant 80G tax benefits.",
    url: `${SITE_URL}/campaigns`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
    hasPart: campaigns.slice(0, 10).map((c) => ({
      "@type": "DonateAction",
      name: c.name || c.title || "Campaign",
      description: (c.description || "").replace(/<[^>]*>/g, "").slice(0, 160),
      url: `${SITE_URL}/campaigns/${c.slug}`,
      image: typeof c.images?.[0] === "string" ? c.images[0] : DEFAULT_OG_IMAGE,
      recipient: {
        "@type": "NGO",
        name: SITE_NAME,
        url: SITE_URL,
      },
    })),
  };
}

export function getAboutPageSchema(description?: string) {
  return {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: `About Us | ${SITE_NAME}`,
    description: description || DEFAULT_DESCRIPTION,
    url: `${SITE_URL}/about`,
    mainEntity: getOrganizationSchema(),
  };
}

export function getGallerySchema(imagesCount = 0) {
  return {
    "@context": "https://schema.org",
    "@type": "ImageGallery",
    name: `Impact Photo Gallery | ${SITE_NAME}`,
    description: "Visual documentation of Seva India Foundation field operations, medical camps, nutrition programs, and educational drives.",
    url: `${SITE_URL}/gallery`,
    isPartOf: {
      "@type": "WebSite",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };
}

