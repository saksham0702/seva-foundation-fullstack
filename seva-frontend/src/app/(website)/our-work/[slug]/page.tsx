import React from "react";
import Link from "next/link";
import { ArrowLeft, Sparkles } from "lucide-react";
import InitiativeCard, { InitiativeData } from "@/components/website/our-work/InitiativeCard";
import InitiativeDonationSection from "@/components/website/donations/InitiativeDonationSection";
import { getCmsPageBySlug } from "@/app/api/cms";
import { notFound } from "next/navigation";

interface SingleInitiativePageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: SingleInitiativePageProps) {
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();
  const page = await getCmsPageBySlug("our-work").catch(() => null);
  const initiative = page?.sections?.find((s) => s.key.toLowerCase() === cleanSlug);

  const title = initiative?.title || initiative?.name || cleanSlug.toUpperCase();
  const description = initiative?.subtitle || initiative?.description || "Empowering communities through grassroots initiatives.";

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
  const { slug } = await params;
  const cleanSlug = slug.toLowerCase();

  let initiative: InitiativeData | null = null;
  let allInitiatives: InitiativeData[] = [];

  try {
    const page = await getCmsPageBySlug("our-work");
    if (page && page.sections && page.sections.length > 0) {
      allInitiatives = page.sections as InitiativeData[];
      initiative = (page.sections.find(
        (s) => s.key.toLowerCase() === cleanSlug
      ) as InitiativeData) || null;
    }
  } catch {
    // Fallback if CMS API is temporarily unavailable
  }

  if (!initiative) {
    // If not found in CMS, provide clean fallback or 404
    notFound();
  }

  const otherInitiatives = allInitiatives.filter(
    (i) => i.key.toLowerCase() !== cleanSlug
  );

  return (
    <div className="min-h-screen bg-[#FDFBF7] text-slate-900 py-10 sm:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* ── Back Link ── */}
        <div>
          <Link
            href="/our-work"
            className="inline-flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#4C6FFF] hover:text-[#3855db] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Back to Our Work</span>
          </Link>
        </div>

        {/* ── Main Initiative Card ── */}
        <InitiativeCard initiative={initiative} isSinglePage={true} />

        {/* ── Direct Initiative Donation Module ── */}
        <div className="pt-4">
          <InitiativeDonationSection
            initialInitiative={initiative.title || initiative.name || cleanSlug}
          />
        </div>

        {/* ── Other Initiatives Carousel / Grid ── */}
        {otherInitiatives.length > 0 && (
          <section className="pt-12 border-t border-slate-200">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={16} className="text-[#E8542A]" />
              <h3 className="text-xl font-serif font-semibold uppercase text-[#0A1A2F]">
                Other Core Initiatives
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherInitiatives.slice(0, 3).map((other) => (
                <Link
                  key={other.key}
                  href={`/our-work/${other.key}`}
                  className="group bg-white rounded-2xl p-6 border border-slate-200/80 hover:shadow-lg transition-all flex flex-col justify-between text-slate-900"
                >
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-widest text-[#4C6FFF] block mb-1">
                      {other.extra?.eyebrow || "OUR INITIATIVES"}
                    </span>
                    <h4 className="text-lg font-semibold text-[#0A1A2F] group-hover:text-[#E8542A] transition-colors">
                      {other.title || other.name}
                    </h4>
                    <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                      {other.subtitle || other.description}
                    </p>
                  </div>
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-900 group-hover:text-[#E8542A]">
                    <span>Explore Initiative</span>
                    <span>→</span>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
