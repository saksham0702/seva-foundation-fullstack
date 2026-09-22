"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
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

const DEFAULT_HERO_CAMPAIGNS = [
  {
    id: "1",
    slug: "nepal-flood-relief",
    image: "",
    category: "Disaster Relief",
    title: "Nepal Flood Relief Emergency Fund",
    raised: 420000,
    goal: 1000000,
    donors: 1420,
    daysLeft: 18,
    urgent: true,
    location: "Kathmandu & Terai, Nepal",
  },
  {
    id: "2",
    slug: "kerala-flood-relief",
    image: "",
    category: "Disaster Relief",
    title: "Kerala Flood Relief - Wayanad & Thrissur",
    raised: 750000,
    goal: 1500000,
    donors: 2890,
    daysLeft: 14,
    urgent: true,
    location: "Wayanad & Thrissur, Kerala",
  },
  {
    id: "3",
    slug: "books-uniforms-hill-children",
    image: "",
    category: "Education",
    title: "Books & Uniforms for 200 Hill Children",
    raised: 178000,
    goal: 250000,
    donors: 856,
    daysLeft: 24,
    urgent: false,
    location: "Tehri Garhwal, Uttarakhand",
  },
];

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

export default function HeroSection() {
  const [campaignsList, setCampaignsList] = useState<any[]>([]);
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
            .map((c) => ({
              id: c._id,
              slug: c.slug,
              image: c.images?.[0] || "",
              category: typeof c.category === "object" ? (c.category as any)?.name : "General",
              title: c.name,
              raised: c.raisedAmount || 0,
              goal: c.goal || 100000,
              donors: c.donorCount || 0,
              daysLeft: c.endDate
                ? Math.max(1, Math.ceil((new Date(c.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
                : 30,
              urgent: c.urgent || false,
              location: c.location || "Uttarakhand, India",
            }));
          if (activeOnly.length > 0) {
            setCampaignsList(activeOnly);
          }
        }
      } catch (err) {
        // Fallback to DEFAULT_HERO_CAMPAIGNS
      }
    })();
    return () => {
      active = false;
    };
  }, []);

  const featuredCampaigns = campaignsList.length > 0 ? campaignsList : DEFAULT_HERO_CAMPAIGNS;

  const next = useCallback(() => {
    setCurrent((p) => (p + 1) % featuredCampaigns.length);
  }, [featuredCampaigns.length]);

  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(next, 5000);
    return () => clearInterval(timer);
  }, [isPaused, next]);

  const campaign = featuredCampaigns[current] || featuredCampaigns[0];
  const pct = Math.min(
    100,
    Math.round(((campaign.raised || 0) / (campaign.goal || 1)) * 100),
  );

  return (
    <section className="relative w-full bg-[#0a1628] overflow-hidden">
      {/* ── Background ambient glow ── */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[#E8542A]/8 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/4" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[#1a3a6b]/15 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/4" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-16 pb-8">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center min-h-[85vh]">
          {/* ── LEFT: Content ── */}
          <div className="lg:col-span-5 space-y-8">
            {/* Trust badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white/5 backdrop-blur-sm border border-white/10 rounded-full">
              <Sparkles size={14} className="text-[#E8542A]" />
              <span className="text-xs font-semibold text-white/80 tracking-wide">
                India's Most Trusted Crowdfunding Platform
              </span>
            </div>

            {/* Headline */}
            <div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.4rem] font-semibold text-white leading-[1.1] mb-5">
                Give with <span className="text-[#E8542A]">confidence</span>.
                <br />
                See the <span className="text-[#E8542A]">impact</span>.
              </h1>
              <p className="text-base sm:text-lg text-white/50 leading-relaxed max-w-md">
                Seva India Foundation connects you directly to verified
                campaigns in Uttarakhand. Every rupee tracked. Every life
                changed.
              </p>
            </div>

            {/* Trust signals */}
            <div className="flex flex-wrap gap-3">
              {TRUST_SIGNALS.map((signal, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2.5 px-4 py-3 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors cursor-default"
                >
                  <signal.icon size={18} className="text-[#E8542A]" />
                  <div>
                    <p className="text-xs font-bold text-white">
                      {signal.label}
                    </p>
                    <p className="text-[10px] text-white/40">{signal.sub}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-4">
              <Link
                href="/campaigns"
                className="group inline-flex items-center gap-2 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold px-7 py-4 rounded-xl text-sm transition-all duration-200 shadow-lg shadow-[#E8542A]/25 hover:shadow-[#E8542A]/40"
              >
                Browse Campaigns
                <ArrowRight
                  size={16}
                  className="group-hover:translate-x-0.5 transition-transform"
                />
              </Link>
              <Link
                href="/donate"
                className="inline-flex items-center gap-2 text-white/70 hover:text-white font-semibold text-sm transition-colors"
              >
                <Heart size={16} className="text-[#E8542A]" />
                Start a Campaign
                <ArrowUpRight size={14} />
              </Link>
            </div>

            {/* Live stats ticker */}
            <div className="flex items-center gap-6 pt-4 border-t border-white/10">
              <div>
                <p className="text-2xl font-bold text-white">₹4.2Cr+</p>
                <p className="text-[11px] text-white/40 uppercase tracking-wider">
                  Raised
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">38,000+</p>
                <p className="text-[11px] text-white/40 uppercase tracking-wider">
                  Lives Impacted
                </p>
              </div>
              <div className="w-px h-10 bg-white/10" />
              <div>
                <p className="text-2xl font-bold text-white">120+</p>
                <p className="text-[11px] text-white/40 uppercase tracking-wider">
                  Campaigns
                </p>
              </div>
            </div>
          </div>

          {/* ── RIGHT: Featured Campaign Card ── */}
          <div className="lg:col-span-7 relative">
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
                        className={`absolute inset-0 transition-opacity duration-700 ${
                          i === current ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {resolvedImg ? (
                          <img
                            src={resolvedImg}
                            alt={c.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-700"
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
                      className={`relative w-20 h-14 rounded-xl overflow-hidden transition-all duration-300 ${
                        i === current
                          ? "ring-2 ring-[#E8542A] ring-offset-2 ring-offset-[#0a1628] scale-105"
                          : "opacity-50 hover:opacity-80"
                      }`}
                    >
                      {resolvedThumb ? (
                        <img
                          src={resolvedThumb}
                          alt=""
                          className="w-full h-full object-cover"
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
          </div>
        </div>
      </div>

      {/* ── Bottom trust bar ── */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-wrap items-center justify-center gap-8 sm:gap-12">
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <ShieldCheck size={14} />
              <span>Verified by Seva India Foundation</span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <IndianRupee size={14} />
              <span>Zero platform fees on donations</span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Users size={14} />
              <span>12,000+ verified donors</span>
            </div>
            <div className="flex items-center gap-2 text-white/30 text-xs">
              <Award size={14} />
              <span>80G tax benefit on every donation</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
