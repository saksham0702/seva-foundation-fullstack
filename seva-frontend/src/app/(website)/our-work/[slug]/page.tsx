import React from "react";
import { getCmsPageBySlug } from "@/app/api/cms";
import { InitiativeData } from "@/components/website/our-work/InitiativeCard";
import {
  DEFAULT_INITIATIVES,
  findInitiativeBySlug,
} from "@/components/website/our-work/initiativeDefaults";
import InitiativeDetailClient from "@/components/website/our-work/InitiativeDetailClient";

export const dynamic = "force-dynamic";

interface SingleInitiativePageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateStaticParams() {
  return DEFAULT_INITIATIVES.map((init) => ({
    slug: init.key,
  }));
}

export async function generateMetadata({ params }: SingleInitiativePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  let initiative: InitiativeData | null = null;
  try {
    const page = await getCmsPageBySlug("our-work");
    if (page?.sections && page.sections.length > 0) {
      initiative = findInitiativeBySlug(page.sections as InitiativeData[], slug);
    }
  } catch {
    // Fall back to defaults
  }

  if (!initiative) {
    initiative = findInitiativeBySlug(DEFAULT_INITIATIVES, slug);
  }

  const title = initiative?.title || initiative?.name || slug.toUpperCase();
  const description =
    initiative?.subtitle ||
    initiative?.description ||
    "Empowering communities through grassroots initiatives across Uttarakhand.";

  return {
    title: `${title} | Seva Foundation Initiatives`,
    description,
    openGraph: {
      title: `${title} | Seva Foundation`,
      description,
      images: initiative?.image ? [initiative.image] : [],
    },
  };
}

export default async function SingleInitiativePage({
  params,
}: SingleInitiativePageProps) {
  const resolvedParams = await Promise.resolve(params);
  const slug = resolvedParams?.slug || "";

  let initiative: InitiativeData | null = null;
  let allInitiatives: InitiativeData[] = DEFAULT_INITIATIVES;

  try {
    const page = await getCmsPageBySlug("our-work");
    if (page?.sections && page.sections.length > 0) {
      allInitiatives = page.sections as InitiativeData[];
      initiative = findInitiativeBySlug(allInitiatives, slug);
    }
  } catch (err) {
    // In production or during SSR when backend API might be loading or remote, fall back to defaults
  }

  if (!initiative) {
    initiative = findInitiativeBySlug(DEFAULT_INITIATIVES, slug);
  }

  return (
    <InitiativeDetailClient
      initialInitiative={initiative}
      initialAllInitiatives={allInitiatives}
      slug={slug}
    />
  );
}
