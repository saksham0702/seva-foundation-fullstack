"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowRight,
  ArrowUpRight,
  Heart,
  Users,
  IndianRupee,
  Award,
  Play,
  Pause,
  ChevronRight,
  TrendingUp,
  ShieldCheck,
  MapPin,
  Clock,
  Sparkles,
} from "lucide-react";

import { getCampaigns } from "@/app/api/campaign";
import { getImageUrl } from "@/lib/image";



const TRUST_SIGNALS = [
  {
    icon: ShieldCheck,
    label: "12A & 80G Certified",
    sub: "Tax benefits on every donation",
  },
  {
    icon: TrendingUp,
    label: "100% Transparent",
    sub: "Track where your money goes",
  },
  {
    icon: MapPin,
    label: "Dehradun Based",
    sub: "Serving Uttarakhand since 2012",
  },
];

const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

interface HeroSectionProps {
  section?: any;
  initialCampaigns?: any[];
}

export default function HeroSection({ section, initialCampaigns }: HeroSectionProps) {
  // Helper to format initial campaigns if provided
  const parseCampaign = (c: any) => ({
    id: c._id || c.id,
    slug: c.slug,
    image: c.images?.[0] || "",
    category: typeof c.category === "object" ? (c.category as any)?.name : (c.category || "General"),
    title: c.name || c.title,
    raised: c.raisedAmount ?? c.raised ?? 0,
    goal: c.goal || 100000,
    donors: c.donorCount ?? c.donors ?? 0,
    daysLeft: c.endDate
      ? Math.max(1, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
      : 30,
    urgent: c.urgent || false,
    location: c.location || "Uttarakhand, India",
  });

  const [campaignsList, setCampaignsList] = useState<any[]>(() => {
    if (Array.isArray(initialCampaigns) && initialCampaigns.length > 0) {
      const activeOnly = initialCampaigns
        .filter((c) => !c.isDeleted && c.status !== "completed" && (c.status === "active" || !c.status))
        .sort((a, b) => {
          const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
          const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
          return dateB - dateA;
        })
        .slice(0, 3)
        .map(parseCampaign);
      if (activeOnly.length > 0) return activeOnly;
    }
    return [];
  });

  const [current, setCurrent] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [hoveredCard, setHoveredCard] = useState<number | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        const data = await getCampaigns();
        if (active && Array.isArray(data) && data.length > 0) {
          const activeOnly = data
            .filter((c) => !c.isDeleted && c.status !== "completed" && (c.status === "active" || !c.status))
            .sort((a, b) => {
              const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
              const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
              return dateB - dateA;
            })
            .slice(0, 3)
            .map(parseCampaign);
          setCampaignsList(activeOnly);
        }
      } catch (err) {
        // Leave current campaignsList
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const featuredCampaigns = campaignsList;

  const next = useCallback(() => {
    if (featuredCampaigns.length <= 1) return;
    setCurrent((p) => (p + 1) % featuredCampaigns.length);
  }, [featuredCampaigns.length]);

  useEffect(() => {
    if (isPaused || featuredCampaigns.length <= 1) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next, featuredCampaigns.length]);

  const campaign = featuredCampaigns.length > 0 ? (featuredCampaigns[current] || featuredCampaigns[0]) : null;
  const pct = campaign
    ? Math.min(100, Math.round(((campaign.raised || 0) / (campaign.goal || 1)) * 100))
    : 0;

  // ── Dynamic CMS Content & Fallbacks ──────────────────────────────────────
  const badgeText =
    section?.extra?.badgeText ||
    section?.subtitle ||
    "India's Most Trusted Crowdfunding Platform";

  const headlinePart1 = section?.extra?.headlinePart1 ?? "Give with";
  const headlineHighlight1 = section?.extra?.headlineHighlight1 ?? "confidence";
  const headlinePart2 = section?.extra?.headlinePart2 ?? "See the";
  const headlineHighlight2 = section?.extra?.headlineHighlight2 ?? "impact";
  const customTitle = section?.title;

  const description =
    section?.description ||
    "Seva India Foundation connects you directly to verified campaigns in Uttarakhand. Every rupee tracked. Every life changed.";

  // Trust signals array from CMS (only render if dynamic data exists)
  const rawSignals: Array<{ label: string; sub: string; icon?: string }> =
    Array.isArray(section?.extra?.trustSignals) ? section.extra.trustSignals : [];

  const getSignalIcon = (idx: number, iconKey?: string) => {
    const key = (iconKey || "").toLowerCase();
    if (key.includes("shield") || key.includes("cert") || key === "shield") return ShieldCheck;
    if (key.includes("trend") || key.includes("transp") || key === "trend") return TrendingUp;
    if (key.includes("map") || key.includes("loc") || key === "location") return MapPin;
    if (key.includes("heart")) return Heart;
    if (key.includes("award")) return Award;
    if (key.includes("user")) return Users;
    if (key.includes("check")) return ShieldCheck;
    if (key.includes("sparkle") || key.includes("star")) return Sparkles;
    if (idx === 0) return ShieldCheck;
    if (idx === 1) return TrendingUp;
    if (idx === 2) return MapPin;
    return ShieldCheck;
  };

  // CTA buttons
  const primaryCtaText = section?.extra?.primaryCtaText || "Browse Campaigns";
  const primaryCtaLink = section?.extra?.primaryCtaLink || "/campaigns";
  const secondaryCtaText = section?.extra?.secondaryCtaText || "";
  const secondaryCtaLink = section?.extra?.secondaryCtaLink || "";

  // Live stats ticker
  const stat1Value = section?.extra?.stat1Value || "";
  const stat1Label = section?.extra?.stat1Label || "Raised";
  const stat2Value = section?.extra?.stat2Value || "";
  const stat2Label = section?.extra?.stat2Label || "Lives Impacted";
  const stat3Value = section?.extra?.stat3Value || "";
  const stat3Label = section?.extra?.stat3Label || "Campaigns";
  const hasStats = Boolean(stat1Value || stat2Value || stat3Value);

  return (
    <section className="relative w-full bg-[#0a1628] overflow-hidden">
      {/* ── Background ambient glow ── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8542A]/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1a3a6b]/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[85vh]">
          {/* ── LEFT: Content ── */}
          <div className="lg:col-span-5 space-y-8 animate-hero-left">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <Sparkles size={14} className="text-[#E8542A]" />
              <span className="text-xs font-semibold text-white/80 tracking-wide">
                {badgeText}
              </span>
            </div>

            {/* Headline */}
            <div>
              {customTitle && (!headlinePart1 && !headlineHighlight1) ? (
                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-white leading-[1.1] mb-5">
                  {customTitle}
                </h1>
              ) : (
                <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-white leading-[1.1] mb-5">
                  {headlinePart1} <span className="text-[#E8542A]">{headlineHighlight1}</span>.
                  <br />
                  {headlinePart2} <span className="text-[#E8542A]">{headlineHighlight2}</span>.
                </h1>
              )}
              <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-md">
                {description}
              </p>
            </div>

            {/* Trust signals / Highlights (max 4, 2x2 grid layout) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-lg">
              {rawSignals.slice(0, 4).map((signal, i) => {
                const IconComponent = getSignalIcon(i, signal.icon);
                return (
                  <div
                    key={i}
                    className="flex items-center gap-3 px-4 py-3 bg-white/5 border border-white/10 rounded-2xl hover:bg-white/10 hover:border-white/20 transition-all cursor-default shadow-sm"
                  >
                    <IconComponent size={20} className="text-[#E8542A] flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">
                        {signal.label}
                      </p>
                      <p className="text-[10px] text-white/50 truncate">{signal.sub}</p>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href={primaryCtaLink}
                className="group inline-flex items-center gap-2 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold px-7 py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#E8542A]/25 hover:shadow-[#E8542A]/40"
              >
                {primaryCtaText}
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              {secondaryCtaText && secondaryCtaLink && (
                <Link
                  href={secondaryCtaLink}
                  className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm transition-colors px-4 py-3 rounded-xl border border-white/10 hover:border-white/20 bg-white/5"
                >
                  <Heart size={16} className="text-[#E8542A]" />
                  {secondaryCtaText}
                  <ArrowUpRight size={14} />
                </Link>
              )}
            </div>

            {/* Live stats ticker (only if configured) */}
            {hasStats && (
              <div className="flex items-center gap-6 pt-4 border-t border-white/10">
                {stat1Value && (
                  <div>
                    <p className="text-2xl font-bold text-white">{stat1Value}</p>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {stat1Label}
                    </p>
                  </div>
                )}
                {stat1Value && stat2Value && <div className="w-px h-10 bg-white/10" />}
                {stat2Value && (
                  <div>
                    <p className="text-2xl font-bold text-white">{stat2Value}</p>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {stat2Label}
                    </p>
                  </div>
                )}
                {stat2Value && stat3Value && <div className="w-px h-10 bg-white/10" />}
                {stat3Value && (
                  <div>
                    <p className="text-2xl font-bold text-white">{stat3Value}</p>
                    <p className="text-[11px] text-white/40 uppercase tracking-wider">
                      {stat3Label}
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ── RIGHT: Featured Campaign Card or Mission Card ── */}
          <div className="lg:col-span-7 relative animate-hero-right">
            {!campaign ? (
              <div className="relative bg-white/5 border border-white/10 rounded-3xl p-8 sm:p-12 text-center space-y-6 backdrop-blur-md shadow-2xl">
                <div className="w-16 h-16 rounded-2xl bg-[#E8542A]/20 border border-[#E8542A]/40 flex items-center justify-center mx-auto text-[#E8542A]">
                  <ShieldCheck size={32} />
                </div>
                <h3 className="text-2xl sm:text-3xl font-bold text-white font-serif">
                  100% Transparent Grassroots Impact
                </h3>
                <p className="text-slate-300 text-sm sm:text-base max-w-md mx-auto leading-relaxed">
                  {description}
                </p>
                <div className="pt-2 flex justify-center gap-4">
                  <Link
                    href={primaryCtaLink}
                    className="px-8 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-500/20"
                  >
                    {primaryCtaText}
                  </Link>
                </div>
              </div>
            ) : (
              <>
                {/* Card */}
                <div
                  className="relative bg-white rounded-3xl overflow-hidden shadow-2xl shadow-black/30"
                  onMouseEnter={() => setIsPaused(true)}
                  onMouseLeave={() => setIsPaused(false)}
                >
                  {/* Image */}
                  <div className="relative h-64 sm:h-80 bg-slate-900 group/img">
                    <Link
                      href={`/campaigns/${campaign.slug || campaign.id}`}
                      className="absolute inset-0 z-0 block cursor-pointer"
                      title={`View campaign: ${campaign.title}`}
                    >
                  {featuredCampaigns.map((c, i) => {
                    const resolvedImg = getImageUrl(c.image);
                    return (
                      <div
                        key={c.id}
                        className={`absolute inset-0 transition-opacity duration-700 ${i === current ? "opacity-100" : "opacity-0"
                          }`}
                      >
                        {resolvedImg ? (
                          <Image
                            src={resolvedImg}
                            alt={c.title}
                            fill
                            sizes="(max-width: 1024px) 100vw, 50vw"
                            priority={i === 0}
                            className="object-cover group-hover/img:scale-105 transition-transform duration-700"
                          />
                        ) : (
                          <div className="w-full h-full bg-gradient-to-br from-[#0a1628] via-[#1a3a6b] to-[#E8542A]/30 flex flex-col items-center justify-center p-6 text-center">
                            <span className="text-white/40 text-xs uppercase tracking-widest font-semibold mb-2">
                              {c.category}
                            </span>
                            <span className="text-white font-bold text-lg sm:text-xl max-w-md">
                              {c.title}
                            </span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
                </Link>

                {/* Urgent badge */}
                {campaign.urgent && (
                  <span className="absolute top-4 left-4 bg-[#E8542A] text-white text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full flex items-center gap-1.5 z-10 pointer-events-none">
                    <Clock size={10} />
                    Urgent — {campaign.daysLeft} days left
                  </span>
                )}

                {/* Category */}
                <span className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm text-[#0f2347] text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full z-10 pointer-events-none">
                  {campaign.category}
                </span>

                {/* Pause/Play */}
                <button
                  onClick={() => setIsPaused(!isPaused)}
                  className="absolute bottom-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center text-white hover:bg-white/30 transition-colors z-10"
                >
                  {isPaused ? (
                    <Play size={16} fill="white" />
                  ) : (
                    <Pause size={16} />
                  )}
                </button>
              </div>

              {/* Card Content */}
              <div className="p-6 sm:p-8">
                <div className="flex items-start justify-between gap-4 mb-4">
                  <div>
                    <Link
                      href={`/campaigns/${campaign.slug || campaign.id}`}
                      className="group/title block"
                    >
                      <h3 className="text-xl sm:text-2xl font-bold text-[#0f2347] leading-snug mb-2 group-hover/title:text-[#E8542A] transition-colors">
                        {campaign.title}
                      </h3>
                    </Link>
                    <div className="flex items-center gap-2 text-xs text-gray-400">
                      <MapPin size={12} />
                      {campaign.location}
                    </div>
                  </div>
                  <Link
                    href={`/campaigns/${campaign.slug || campaign.id}`}
                    title="View Campaign Details"
                    className="flex-shrink-0 w-12 h-12 rounded-xl bg-[#0f2347] hover:bg-[#1a3a6b] flex items-center justify-center text-white transition-colors group/arrow shadow-md"
                  >
                    <ArrowUpRight size={20} className="group-hover/arrow:translate-x-0.5 group-hover/arrow:-translate-y-0.5 transition-transform" />
                  </Link>
                </div>

                {/* Progress */}
                <div className="mb-5">
                  <div className="flex justify-between items-baseline mb-2">
                    <span className="text-2xl font-bold text-[#0f2347]">
                      {fmt(campaign.raised)}
                    </span>
                    <span className="text-sm font-semibold text-[#E8542A]">
                      {pct}%
                    </span>
                  </div>
                  <p className="text-xs text-gray-400 mb-3">
                    raised of {fmt(campaign.goal)} goal ·{" "}
                    {(campaign.donors || 0).toLocaleString("en-IN")} donors
                  </p>
                  <div className="h-2.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#E8542A] to-[#f07848] transition-all duration-1000"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                {/* Campaign Action CTAs */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Link
                    href={`/campaigns/${campaign.slug || campaign.id}`}
                    className="flex-1 text-center bg-[#0f2347] hover:bg-[#1a3a6b] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-md flex items-center justify-center gap-1.5"
                  >
                    <span>View Campaign</span>
                    <ArrowRight size={15} />
                  </Link>
                  <Link
                    href={`/campaigns/${campaign.slug || campaign.id}#donate`}
                    className="flex-1 text-center bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold py-3.5 rounded-xl text-xs sm:text-sm transition-all shadow-lg shadow-orange-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Donate Now</span>
                    <Heart size={15} fill="currentColor" />
                  </Link>
                </div>
              </div>
            </div>

            {/* Thumbnail strip */}
            {featuredCampaigns.length > 1 && (
              <div className="flex gap-3 mt-4 justify-center">
                {featuredCampaigns.map((c, i) => {
                  const resolvedThumb = getImageUrl(c.image);
                  return (
                    <button
                      key={c.id}
                      onClick={() => setCurrent(i)}
                      onMouseEnter={() => setHoveredCard(i)}
                      onMouseLeave={() => setHoveredCard(null)}
                      className={`relative w-20 h-14 rounded-xl overflow-hidden transition-all duration-300 ${i === current
                          ? "ring-2 ring-[#E8542A] ring-offset-2 ring-offset-[#0a1628] scale-105"
                          : "opacity-50 hover:opacity-80"
                        }`}
                    >
                      {resolvedThumb ? (
                        <Image
                          src={resolvedThumb}
                          alt={c.title}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-[#1a3a6b] flex items-center justify-center p-1 text-center">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider line-clamp-2">
                            {c.category}
                          </span>
                        </div>
                      )}
                      {hoveredCard === i && i !== current && (
                        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-white uppercase tracking-wider">
                            {c.category}
                          </span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Slide counter */}
            {featuredCampaigns.length > 1 && (
              <div className="text-center mt-3">
                <span className="text-white/30 text-xs font-semibold tabular-nums">
                  {String(current + 1).padStart(2, "0")} /{" "}
                  {String(featuredCampaigns.length).padStart(2, "0")}
                </span>
              </div>
            )}
              </>
            )}
          </div>
        </div>
      </div>

      {/* ── Bottom trust bar (only if configured) ── */}
      {Array.isArray(section?.extra?.bottomTrustItems) && section.extra.bottomTrustItems.length > 0 && (
        <div className="border-t border-white/5">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
            <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
              {section.extra.bottomTrustItems.map((item: any, idx: number) => {
                const text = typeof item === "string" ? item : (item.text || item.label || "");
                const iconKey = typeof item === "object" ? (item.icon || "") : "";
                const lower = (iconKey || text).toLowerCase();
                let Icon = ShieldCheck;
                if (lower.includes("rupee") || lower.includes("fee") || lower.includes("cost") || idx === 1) {
                  Icon = IndianRupee;
                } else if (lower.includes("donor") || lower.includes("user") || lower.includes("people") || idx === 2) {
                  Icon = Users;
                } else if (lower.includes("80g") || lower.includes("award") || lower.includes("tax") || idx === 3) {
                  Icon = Award;
                } else if (lower.includes("shield") || idx === 0) {
                  Icon = ShieldCheck;
                }

                return (
                  <div key={idx} className="flex items-center gap-2 text-white/40 text-xs font-medium">
                    <Icon size={14} className="text-[#E8542A]/80 flex-shrink-0" />
                    <span>{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
