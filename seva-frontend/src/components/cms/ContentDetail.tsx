import React, { ReactNode } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Calendar,
  ArrowRight,
  HelpCircle,
  Loader2,
  LucideIcon,
} from "lucide-react";
import { CmsItem } from "@/types/cms";
import { getImageUrl, resolveRichTextHtml } from "@/lib/image";
import { richProseClass } from "@/lib/prose";
import { ShareButton } from "@/components/cms/ShareButton";
import { CmsImage } from "@/components/cms/CmsImage";
import { ViewTracker } from "./ViewTracker";

export interface MetaItem {
  icon?: LucideIcon | React.ComponentType<{ size?: number; className?: string }> | React.ReactNode;
  label: string;
  className?: string;
}

export interface RelatedConfig {
  items: CmsItem[];
  hrefPrefix: string; // e.g. "/blogs", "/news", "/events"
  sectionTitle: ReactNode; // e.g. <>More <span>Stories</span></>
  formatDate?: (item: CmsItem) => string;
}

export interface ContentDetailProps {
  item: CmsItem | null;
  isLoading?: boolean;

  backHref: string;
  backLabel: string;
  loadingLabel?: string;
  notFoundTitle: string;
  notFoundText: string;

  accentColor: string; // e.g. "#E8542A"
  headingColor: string; // e.g. "#0f2347"
  badgeClassName: string; // bg + text classes for the category pill

  badgeLabel: string;
  metaItems: MetaItem[];

  faqTitle: string;

  /** Optional slot for extra metadata (e.g. event date/location grid) */
  metaBanner?: ReactNode;

  /** Optional slot for a custom CTA block (donate / volunteer / etc.) */
  ctaSlot?: ReactNode;

  footerName: string;
  footerSubtitle: string;
  footerIcon: ReactNode;
  shareText?: string;

  related?: RelatedConfig;
}

export function ContentDetail({
  item,
  isLoading = false,
  backHref,
  backLabel,
  loadingLabel = "Loading...",
  notFoundTitle,
  notFoundText,
  accentColor,
  headingColor,
  badgeClassName,
  badgeLabel,
  metaItems,
  faqTitle,
  metaBanner,
  ctaSlot,
  footerName,
  footerSubtitle,
  footerIcon,
  related,
}: ContentDetailProps) {
  const cssVars = {
    ["--accent" as string]: accentColor,
    ["--heading" as string]: headingColor,
  } as React.CSSProperties;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center py-24 gap-4">
        <Loader2 size={36} className="animate-spin" style={{ color: accentColor }} />
        <p className="text-sm font-semibold" style={{ color: headingColor }}>
          {loadingLabel}
        </p>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center py-24 px-4">
        <div className="text-center max-w-md bg-gray-50 border border-gray-100 p-8 rounded-3xl">
          <h2 className="text-xl font-bold mb-2" style={{ color: headingColor }}>
            {notFoundTitle}
          </h2>
          <p className="text-xs text-gray-500 mb-6">{notFoundText}</p>
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-white px-6 py-2.5 rounded-xl text-xs font-bold transition-all"
            style={{ backgroundColor: accentColor }}
          >
            <ArrowLeft size={14} /> {backLabel}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white" style={cssVars}>
      <ViewTracker entityType={item.type} entityId={item._id || item.id} />
      {/* ── Header ── */}
      <section className="pb-10 pt-5">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={backHref}
            className="inline-flex items-center gap-2 text-sm font-bold transition-colors mb-8 hover:opacity-70"
            style={{ color: headingColor }}
          >
            <ArrowLeft size={16} />
            {backLabel}
          </Link>
          <div className="flex flex-wrap items-center gap-3 mb-6">
            <span
              className={`px-3.5 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm ${badgeClassName}`}
            >
              {badgeLabel}
            </span>
            {metaItems.map((m, i) => {
              const IconComp = m.icon as React.ComponentType<{ size?: number }>;
              return (
                <span
                  key={i}
                  className={`flex items-center gap-1.5 text-xs font-semibold ${m.className ?? ""}`}
                  style={!m.className ? { color: headingColor } : undefined}
                >
                  {m.icon &&
                    (React.isValidElement(m.icon) ? (
                      m.icon
                    ) : typeof m.icon === "function" ||
                      (typeof m.icon === "object" && "$$typeof" in (m.icon as any)) ? (
                      <IconComp size={13} />
                    ) : null)}
                  {m.label}
                </span>
              );
            })}
          </div>

          <h1
            className="text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight"
            style={{ color: headingColor }}
          >
            {item.title}
          </h1>

          {metaBanner && <div className="mt-6">{metaBanner}</div>}
        </div>
      </section>

      {/* ── Cover Image — same max-w as content, fixed aspect ratio ── */}
      {item.featuredImage && (
        <section className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 mb-8">
          <div className="relative rounded-lg overflow-hidden shadow-xl border border-gray-100 aspect-[16/9] bg-slate-100">
            <CmsImage
              src={getImageUrl(item.featuredImage)}
              alt={item.title}
              fill
              sizes="(max-width: 1024px) 100vw, 896px"
              priority
              className="object-contain"
            />
          </div>
        </section>
      )}

      {/* ── Body ── */}
      <section className="pb-5">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          {item.excerpt && (
            <p className="text-lg text-gray-700 font-medium leading-relaxed mb-10 pb-8 border-b border-gray-100">
              {item.excerpt}
            </p>
          )}

          {item.content ? (
            <div
              className={richProseClass()}
              dangerouslySetInnerHTML={{ __html: resolveRichTextHtml(item.content) }}
            />
          ) : (
            <p className="text-gray-500 leading-relaxed">No content has been published yet.</p>
          )}

          {/* FAQs */}
          {item.faqs && item.faqs.length > 0 && (
            <div className="mt-5 pt-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-6">
                <HelpCircle style={{ color: accentColor }} size={20} />
                <h2 className="text-2xl font-bold" style={{ color: headingColor }}>
                  {faqTitle}
                </h2>
              </div>
              <div className="space-y-4">
                {item.faqs.map((faq, i) => (
                  <div key={i} className="bg-[#f8f9fc] border border-gray-100 rounded-2xl p-6">
                    <h3 className="text-base font-bold mb-2" style={{ color: headingColor }}>
                      {faq.question}
                    </h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ctaSlot && <div className="mt-14">{ctaSlot}</div>}

          {/* Footer share */}
          <div className="flex flex-wrap items-center justify-between gap-4 mt-12 pt-8 border-t border-gray-100">
            <div className="flex items-center gap-3">
              <div
                className="w-11 h-11 rounded-full flex items-center justify-center font-bold text-sm shadow-sm text-white"
                style={{ backgroundColor: headingColor }}
              >
                {footerIcon}
              </div>
              <div>
                <p className="text-sm font-bold" style={{ color: headingColor }}>
                  {footerName}
                </p>
                <p className="text-xs text-gray-400">{footerSubtitle}</p>
              </div>
            </div>

            <ShareButton
              title={item.title}
              description={item.excerpt || item.title}
              headingColor={headingColor}
            />
          </div>
        </div>
      </section>

      {/* ── Related ── */}
      {related && related.items.length > 0 && (
        <section className="py-16 sm:py-20 bg-[#f8f9fc] border-t border-gray-100">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl sm:text-3xl font-bold mb-10 text-center" style={{ color: headingColor }}>
              {related.sectionTitle}
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {related.items.map((r) => (
                <Link
                  key={r.slug}
                  href={`${related.hrefPrefix}/${r.slug}`}
                  className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg transition-all duration-300 flex flex-col"
                >
                  <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
                    <CmsImage
                      src={getImageUrl(r.featuredImage)}
                      alt={r.title}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      fallbackSrc={getImageUrl(null)}
                    />
                    <span
                      className="absolute top-4 left-4 px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-full shadow text-white z-10"
                      style={{ backgroundColor: accentColor }}
                    >
                      {r.category}
                    </span>
                  </div>
                  <div className="p-5 flex flex-col flex-1">
                    <p className="flex items-center gap-1.5 text-xs text-gray-400 mb-2">
                      <Calendar size={12} />
                      {related.formatDate ? related.formatDate(r) : r.publishedAt}
                    </p>
                    <h3
                      className="text-sm font-bold leading-snug mb-3 line-clamp-2 transition-colors"
                      style={{ color: headingColor }}
                    >
                      {r.title}
                    </h3>
                    <span
                      className="inline-flex items-center gap-1.5 text-xs font-bold mt-auto"
                      style={{ color: accentColor }}
                    >
                      Read More
                      <ArrowRight size={13} className="transition-transform group-hover:translate-x-1" />
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
