import React from "react";
import { getServerCmsPage } from "@/lib/server-api";
import { InitiativeData } from "@/components/website/our-work/InitiativeCard";
import {
  findInitiativeBySlug,
} from "@/components/website/our-work/initiativeDefaults";
import InitiativeDetailClient from "@/components/website/our-work/InitiativeDetailClient";

import { constructMetadata, getInitiativeSchema } from "@/lib/seo";
import { getImageUrl } from "@/lib/image";
import SeoHead from "@/components/common/SeoHead";

export const dynamic = "force-dynamic";

interface SingleInitiativePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: SingleInitiativePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  let initiative: InitiativeData | null = null;
  try {
    const page = await getServerCmsPage("our-work");
    if (page?.sections && page.sections.length > 0) {
      initiative = findInitiativeBySlug(page.sections as InitiativeData[], slug);
    }
  } catch {
    // Leave null if error
  }

  const title = initiative?.title || initiative?.name || slug.toUpperCase();
  const description =
    initiative?.subtitle ||
    initiative?.description ||
    "Empowering communities through grassroots initiatives across Uttarakhand.";

  const coverImg = initiative?.image ? getImageUrl(initiative.image) : undefined;

  return constructMetadata({
    title: `${title} | Initiatives`,
    description,
    canonicalPath: `/our-work/${slug}`,
    ogImage: coverImg,
    ogType: "article",
    keywords: [
      title,
      "Seva Foundation Initiative",
      "Grassroots NGO India",
      "Community Development Uttarakhand",
      "80G Tax Donation",
    ],
  });
}

export default async function SingleInitiativePage({
  params,
}: SingleInitiativePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  let initiative: InitiativeData | null = null;
  let allInitiatives: InitiativeData[] = [];

  try {
    const page = await getServerCmsPage("our-work");
    if (page?.sections && page.sections.length > 0) {
      allInitiatives = page.sections as InitiativeData[];
      initiative = findInitiativeBySlug(allInitiatives, slug);
    }
  } catch (err) {
    // Dynamic error handling
  }

  const title = initiative?.title || initiative?.name || slug.toUpperCase();
  const description =
    initiative?.subtitle ||
    initiative?.description ||
    "Empowering communities through grassroots initiatives across Uttarakhand.";
  const coverImg = initiative?.image ? getImageUrl(initiative.image) : undefined;

  const initiativeSchema = getInitiativeSchema({
    title,
    description,
    slug,
    image: coverImg,
  });

  return (
    <>
      <SeoHead
        title={`${title} | Initiatives`}
        description={description}
        canonicalPath={`/our-work/${slug}`}
        ogImage={coverImg}
        ogType="article"
        jsonLd={initiativeSchema}
      />
      <div className="scroll-reveal">
        <InitiativeDetailClient
          initialInitiative={initiative}
          initialAllInitiatives={allInitiatives}
          slug={slug}
        />
      </div>
    </>
  );
}
