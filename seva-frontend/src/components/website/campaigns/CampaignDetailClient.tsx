"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  ArrowRight,
  Users,
  Share2,
  Heart,
  Loader2,
  ChevronDown,
  ChevronUp,
  HelpCircle,
  Trophy,
  CheckCircle,
  Package,
} from "lucide-react";

import { Campaign, PublicDonor, getCampaignDonors } from "@/app/api/campaign";
import { Product as APIProduct } from "@/app/api/product";
import { getImageUrl, resolveRichTextHtml } from "@/lib/image";
import { recordEntityView } from "@/app/api/analytics";
import ShareModal from "@/components/shared/ShareModal";

const fmt = (n: number) =>
  n >= 100000
    ? `₹${(n / 100000).toFixed(1)}L`
    : `₹${n.toLocaleString("en-IN")}`;

const SUGGESTED_AMOUNTS = [500, 1000, 2000, 5000];
const DONORS_PER_PAGE = 5;

// ── Donor Pagination Panel ─────────────────────────────────────────────────
interface DonorPanelProps {
  slug: string;
  initialDonors?: PublicDonor[];
  initialTotal?: number;
  initialTotalPages?: number;
}

function DonorPanel({
  slug,
  initialDonors = [],
  initialTotal = 0,
  initialTotalPages = 1,
}: DonorPanelProps) {
  const [donors, setDonors] = useState<PublicDonor[]>(initialDonors);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(initialTotalPages);
  const [total, setTotal] = useState(initialTotal);
  const [loading, setLoading] = useState(false);
  const [sliding, setSliding] = useState<"left" | "right" | null>(null);

  const fetchPage = useCallback(
    async (nextPage: number, direction: "left" | "right" | null = null) => {
      setSliding(direction);
      setLoading(true);
      try {
        const res = await getCampaignDonors(slug, nextPage, DONORS_PER_PAGE);
        setDonors(res.donors);
        setPage(res.page);
        setTotalPages(res.totalPages);
        setTotal(res.total);
      } catch {
        // silently ignore
      } finally {
        setLoading(false);
        setTimeout(() => setSliding(null), 300);
      }
    },
    [slug]
  );

  if (total === 0 && donors.length === 0) return null;

  const canPrev = page > 1;
  const canNext = page < totalPages;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold uppercase tracking-widest text-[#E8542A]">
          Recent Donors
        </h3>
        {total > 0 && (
          <span className="text-[11px] text-gray-400 font-medium">
            {total} total
          </span>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 size={18} className="animate-spin text-gray-300" />
        </div>
      ) : (
        <>
          <div
            className={`space-y-3 transition-all duration-300 ${
              sliding === "left"
                ? "opacity-0 translate-x-4"
                : sliding === "right"
                ? "opacity-0 -translate-x-4"
                : "opacity-100 translate-x-0"
            }`}
          >
            {donors.map((d, i) => {
              const initials =
                d.name === "Anonymous Donor" ? "?" : d.name[0]?.toUpperCase() || "?";
              const timeAgo = (() => {
                const diff = Date.now() - new Date(d.createdAt).getTime();
                const days = Math.floor(diff / 86400000);
                if (days === 0) return "Today";
                if (days === 1) return "Yesterday";
                if (days < 30) return `${days}d ago`;
                const months = Math.floor(days / 30);
                return `${months}mo ago`;
              })();
              return (
                <div
                  key={d._id || i}
                  className="flex items-center justify-between group"
                  style={{ animationDelay: `${i * 40}ms` }}
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#0f2347]/10 to-[#1a3a6b]/20 flex items-center justify-center text-[11px] font-bold text-[#0f2347] flex-shrink-0">
                      {initials}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-gray-700 leading-tight">
                        {d.name}
                      </p>
                      <p className="text-[10px] text-gray-400">{timeAgo}</p>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-[#E8542A] tabular-nums">
                    {fmt(d.amount)}
                  </span>
                </div>
              );
            })}
          </div>

          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-50">
              <button
                type="button"
                onClick={() => fetchPage(page - 1, "right")}
                disabled={!canPrev || loading}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  canPrev
                    ? "text-[#0f2347] hover:bg-gray-50 cursor-pointer"
                    : "text-gray-200 cursor-not-allowed"
                }`}
              >
                <ArrowLeft size={13} />
                Prev
              </button>

              <span className="text-[11px] text-gray-400 font-medium">
                {page} / {totalPages}
              </span>

              <button
                type="button"
                onClick={() => fetchPage(page + 1, "left")}
                disabled={!canNext || loading}
                className={`flex items-center gap-1 text-[11px] font-bold px-2.5 py-1.5 rounded-lg transition-all ${
                  canNext
                    ? "text-[#0f2347] hover:bg-gray-50 cursor-pointer"
                    : "text-gray-200 cursor-not-allowed"
                }`}
              >
                Next
                <ArrowRight size={13} />
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Main Interactive Component ─────────────────────────────────────────────
interface CampaignDetailClientProps {
  campaign: Campaign;
  products: APIProduct[];
  initialDonors: PublicDonor[];
  initialDonorsTotal: number;
  initialDonorsTotalPages: number;
}

export default function CampaignDetailClient({
  campaign: c,
  products: allProducts,
  initialDonors,
  initialDonorsTotal,
  initialDonorsTotalPages,
}: CampaignDetailClientProps) {
  const [donateAmount, setDonateAmount] = useState<number | "">(1000);
  const [activeImg, setActiveImg] = useState(0);
  const [liked, setLiked] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<"money" | "products">("money");
  const [selectedProductQuantities, setSelectedProductQuantities] = useState<
    Record<number, number>
  >({});

  useEffect(() => {
    if (c?._id) {
      recordEntityView("campaign", c._id);
    }
  }, [c?._id]);

  const getProductImg = (p: { product: string; image?: string }) => {
    if (p.image) return p.image;
    const match = allProducts.find(
      (item) =>
        item.name.toLowerCase().trim() === (p.product || "").toLowerCase().trim() ||
        item._id === p.product
    );
    return match?.image || null;
  };

  const images = (c.images || []).filter(
    (img): img is string => typeof img === "string" && img.trim().length > 0
  );
  const heroImage = images[activeImg] || images[0];

  let parsedContent: {
    goal?: string;
    faqs?: { question: string; answer: string }[];
    youtubeUrl?: string;
    products?: {
      product: string;
      requiredUnit?: string;
      totalPrice: string;
      unitPrice?: string;
      image?: string;
    }[];
  } = {};

  try {
    parsedContent = JSON.parse(c.content || "{}");
  } catch {}

  const goal = c.goal > 0 ? c.goal : Number(parsedContent.goal) || 0;
  const currentRaised = c.raisedAmount ?? 0;
  const currentDonors = c.donorCount ?? 0;
  const pct = goal > 0 ? Math.min(100, Math.round((currentRaised / goal) * 100)) : 0;
  const isCompleted = c.status === "completed" || (goal > 0 && pct >= 100);

  const faqs = Array.isArray(parsedContent.faqs) ? parsedContent.faqs : [];
  const youtubeUrl = parsedContent.youtubeUrl;
  const youtubeId = youtubeUrl
    ? youtubeUrl.match(/(?:youtu\.be\/|v=)([^&?/]+)/)?.[1]
    : null;

  const productsList = Array.isArray(parsedContent.products)
    ? parsedContent.products
    : [];

  const categoryName =
    typeof c.category === "string"
      ? c.category
      : (c.category as { name?: string } | undefined)?.name;

  const productsTotal = productsList.reduce((acc, p, idx) => {
    const qty = selectedProductQuantities[idx] || 0;
    const price = Number(p.totalPrice || p.unitPrice || 0);
    return acc + qty * price;
  }, 0);

  const finalAmount =
    activeTab === "products" ? productsTotal : Number(donateAmount || 0);

  const isHtml = /<[a-z][\s\S]*>/i.test(c.description || "");

  return (
    <div className="min-h-screen bg-[#f9fafb]">
      <div className="bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center gap-2 text-sm text-gray-500">
          <Link href="/" className="hover:text-[#1a3a6b] transition-colors">
            Home
          </Link>
          <span>/</span>
          <Link href="/campaigns" className="hover:text-[#1a3a6b] transition-colors">
            Campaigns
          </Link>
          <span>/</span>
          <span className="text-[#0f2347] font-medium truncate max-w-[200px]">
            {c.name}
          </span>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <Link
          href="/campaigns"
          className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a6b] mb-7 transition-colors group"
        >
          <ArrowLeft
            size={15}
            className="group-hover:-translate-x-0.5 transition-transform"
          />
          All Campaigns
        </Link>

        {isCompleted && (
          <div className="mb-6 flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-green-50 border border-emerald-200 rounded-2xl px-5 py-4">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center flex-shrink-0">
              <Trophy size={20} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-emerald-800 text-sm">
                🎉 Goal Achieved! This campaign has been completed.
              </p>
              <p className="text-emerald-600 text-xs mt-0.5">
                {fmt(currentRaised)} raised from {currentDonors} generous donor
                {currentDonors === 1 ? "" : "s"}.
              </p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          {/* ────────── LEFT ────────── */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <div className="flex items-center gap-2 mb-2.5">
                {categoryName && (
                  <span className="bg-[#E8542A]/10 text-[#E8542A] text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    {categoryName}
                  </span>
                )}
                {isCompleted && (
                  <span className="flex items-center gap-1 bg-emerald-100 text-emerald-700 text-xs font-bold uppercase tracking-wider px-3 py-1 rounded-full">
                    <CheckCircle size={12} /> Completed
                  </span>
                )}
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#0f2347] leading-tight mb-3">
                {c.name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-xs sm:text-sm text-gray-500">
                <span className="flex items-center gap-1.5">
                  <Users size={14} className="text-gray-400" />
                  {currentDonors.toLocaleString()} donor{currentDonors === 1 ? "" : "s"}
                </span>
                {c.location && <span className="text-gray-400">📍 {c.location}</span>}
              </div>
            </div>

            <div className="rounded-2xl overflow-hidden bg-gray-100">
              <div className="relative h-72 sm:h-96">
                <Image
                  src={getImageUrl(heroImage)}
                  alt={c.name}
                  fill
                  priority
                  sizes="(max-width: 1024px) 100vw, 65vw"
                  className="object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="flex gap-2 p-3 bg-white overflow-x-auto">
                  {images.map((img, i) => (
                    <button
                      key={i}
                      onClick={() => setActiveImg(i)}
                      className={`relative w-16 h-12 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-all ${
                        activeImg === i ? "border-[#E8542A]" : "border-transparent"
                      }`}
                    >
                      <Image
                        src={getImageUrl(img)}
                        alt={c.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Campaign Rich Text Content */}
            <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
              <h2 className="text-lg font-bold text-[#0f2347] mb-5 pb-4 border-b border-gray-100">
                About this Campaign
              </h2>
              {isHtml ? (
                <div
                  className="prose prose-slate max-w-none text-gray-600 text-[15px] leading-relaxed [&_img]:rounded-2xl [&_img]:max-w-full [&_img]:my-4 [&_h2]:text-[#0f2347] [&_h2]:font-bold [&_h3]:text-[#0f2347] [&_h3]:font-semibold [&_a]:text-blue-600 [&_a]:underline hover:[&_a]:text-blue-700"
                  dangerouslySetInnerHTML={{
                    __html: resolveRichTextHtml(c.description),
                  }}
                />
              ) : (
                <p className="text-gray-600 text-[15px] leading-relaxed whitespace-pre-line">
                  {c.description}
                </p>
              )}

              {youtubeId && (
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-base font-bold text-[#0f2347] mb-4">
                    Campaign Video
                  </h3>
                  <div className="aspect-video rounded-2xl overflow-hidden shadow-sm">
                    <iframe
                      src={`https://www.youtube.com/embed/${youtubeId}`}
                      className="w-full h-full"
                      allowFullScreen
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Sponsorship Items */}
            {productsList.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <Package className="text-[#E8542A]" size={20} />
                  <h2 className="text-lg font-bold text-[#0f2347]">
                    Sponsorship Items &amp; Supplies Needed ({productsList.length})
                  </h2>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {productsList.map((p, idx) => {
                    const price = Number(p.totalPrice || p.unitPrice || 0);
                    const imgUrl = getProductImg(p);
                    return (
                      <div
                        key={idx}
                        className="flex items-center gap-3.5 p-3.5 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition-colors group"
                      >
                        {imgUrl ? (
                          <div className="w-16 h-16 rounded-xl overflow-hidden border border-gray-200/80 bg-white shrink-0 relative shadow-sm">
                            <Image
                              src={getImageUrl(imgUrl)}
                              alt={p.product}
                              fill
                              sizes="64px"
                              className="object-cover group-hover:scale-105 transition-transform duration-300"
                            />
                          </div>
                        ) : (
                          <div className="w-16 h-16 rounded-xl border border-gray-200/60 bg-orange-50 text-[#E8542A] flex items-center justify-center shrink-0 shadow-sm">
                            <Package size={24} />
                          </div>
                        )}
                        <div className="min-w-0 flex-1">
                          <h3 className="text-sm font-semibold text-[#0f2347] truncate">
                            {p.product}
                          </h3>
                          {p.requiredUnit && (
                            <p className="text-[11px] text-gray-500">
                              Unit: {p.requiredUnit}
                            </p>
                          )}
                          <p className="text-xs font-bold text-[#E8542A] mt-0.5">
                            ₹{price.toLocaleString("en-IN")}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setActiveTab("products");
                            setSelectedProductQuantities((prev) => ({
                              ...prev,
                              [idx]: (prev[idx] || 0) + 1,
                            }));
                            const el = document.getElementById("donation-panel");
                            if (el) el.scrollIntoView({ behavior: "smooth" });
                          }}
                          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#E8542A] text-white hover:bg-[#c9431d] transition-colors shrink-0 shadow-sm"
                        >
                          Sponsor
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* FAQs Accordion */}
            {faqs.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 p-6 sm:p-8 shadow-sm">
                <div className="flex items-center gap-2 mb-6">
                  <HelpCircle className="text-[#E8542A]" size={20} />
                  <h2 className="text-lg font-bold text-[#0f2347]">
                    Frequently Asked Questions
                  </h2>
                </div>
                <div className="space-y-3">
                  {faqs.map((faq, i) => (
                    <div
                      key={i}
                      className="border border-gray-100 rounded-xl overflow-hidden transition-colors"
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(openFaq === i ? null : i)}
                        className="w-full flex items-center justify-between p-4 text-left font-semibold text-sm text-[#0f2347] hover:bg-gray-50/80 transition-colors"
                      >
                        <span>{faq.question}</span>
                        {openFaq === i ? (
                          <ChevronUp size={16} className="text-gray-400 shrink-0 ml-2" />
                        ) : (
                          <ChevronDown size={16} className="text-gray-400 shrink-0 ml-2" />
                        )}
                      </button>
                      {openFaq === i && (
                        <div className="px-4 pb-4 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50 whitespace-pre-line">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* ────────── RIGHT: Donate panel ────────── */}
          <div className="lg:col-span-1">
            <div id="donation-panel" className="sticky top-24 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 p-6 shadow-sm">
                <div className="flex justify-between items-baseline mb-1">
                  <span className="text-2xl font-bold text-[#0f2347]">
                    {fmt(currentRaised)}
                  </span>
                  {goal > 0 && (
                    <span
                      className={`text-xs font-semibold ${
                        isCompleted ? "text-emerald-600" : "text-[#E8542A]"
                      }`}
                    >
                      {pct}% of {fmt(goal)}
                    </span>
                  )}
                </div>
                <p className="text-xs text-gray-400 mb-3">
                  raised so far · {currentDonors} donor
                  {currentDonors === 1 ? "" : "s"}
                </p>

                {goal > 0 && (
                  <div className="mb-5">
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-700 ${
                          isCompleted
                            ? "bg-gradient-to-r from-emerald-400 to-green-500"
                            : "bg-gradient-to-r from-[#E8542A] to-[#f07848]"
                        }`}
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-gray-400 mt-1 font-medium">
                      <span>Goal: {fmt(goal)}</span>
                      <span className={isCompleted ? "text-emerald-600 font-bold" : ""}>
                        {isCompleted ? "✓ Funded!" : `${pct}% funded`}
                      </span>
                    </div>
                  </div>
                )}

                {isCompleted ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-center gap-2 py-4 bg-emerald-50 rounded-xl border border-emerald-100">
                      <CheckCircle size={18} className="text-emerald-500" />
                      <span className="text-sm font-bold text-emerald-700">
                        Campaign Completed
                      </span>
                    </div>
                    <Link
                      href="/campaigns"
                      className="w-full block text-center bg-[#0f2347] hover:bg-[#1a3a6b] text-white font-bold py-3 rounded-xl text-sm transition-colors duration-200"
                    >
                      Support Other Campaigns
                    </Link>
                  </div>
                ) : (
                  <>
                    {productsList.length > 0 && (
                      <div className="flex p-1 bg-gray-100 rounded-xl mb-4 text-xs font-bold">
                        <button
                          type="button"
                          onClick={() => setActiveTab("money")}
                          className={`flex-1 py-2 rounded-lg transition-all ${
                            activeTab === "money"
                              ? "bg-white text-[#0f2347] shadow-sm"
                              : "text-gray-500 hover:text-[#0f2347]"
                          }`}
                        >
                          Custom Amount
                        </button>
                        <button
                          type="button"
                          onClick={() => setActiveTab("products")}
                          className={`flex-1 py-2 rounded-lg transition-all ${
                            activeTab === "products"
                              ? "bg-white text-[#0f2347] shadow-sm"
                              : "text-gray-500 hover:text-[#0f2347]"
                          }`}
                        >
                          Sponsor Items ({productsList.length})
                        </button>
                      </div>
                    )}

                    {activeTab === "money" ? (
                      <>
                        <div className="grid grid-cols-4 gap-2 mb-3">
                          {SUGGESTED_AMOUNTS.map((amt) => (
                            <button
                              key={amt}
                              type="button"
                              onClick={() => setDonateAmount(amt)}
                              className={`py-2 text-xs font-bold rounded-lg border transition-all ${
                                donateAmount === amt
                                  ? "bg-[#0f2347] text-white border-[#0f2347]"
                                  : "bg-white text-gray-600 border-gray-200 hover:border-[#0f2347] hover:text-[#0f2347]"
                              }`}
                            >
                              ₹{amt >= 1000 ? `${amt / 1000}k` : amt}
                            </button>
                          ))}
                        </div>

                        <div className="relative mb-4">
                          <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-sm font-semibold text-gray-500">
                            ₹
                          </span>
                          <input
                            type="text"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            value={donateAmount}
                            onChange={(e) => {
                              const clean = e.target.value.replace(/[^0-9]/g, "");
                              setDonateAmount(clean === "" ? "" : Number(clean));
                            }}
                            placeholder="Enter amount"
                            className="w-full pl-8 pr-4 py-3 border border-gray-200 rounded-xl text-sm font-semibold text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b]"
                          />
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2.5 mb-4 max-h-60 overflow-y-auto pr-1">
                        {productsList.map((p, idx) => {
                          const qty = selectedProductQuantities[idx] || 0;
                          const price = Number(p.totalPrice || p.unitPrice || 0);
                          const imgUrl = getProductImg(p);
                          return (
                            <div
                              key={idx}
                              className="flex items-center justify-between p-3 rounded-xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 gap-2.5"
                            >
                              <div className="flex items-center gap-2.5 min-w-0 pr-1">
                                {imgUrl ? (
                                  <div className="w-11 h-11 rounded-lg overflow-hidden border border-gray-200/80 bg-white shrink-0 relative shadow-sm">
                                    <Image
                                      src={getImageUrl(imgUrl)}
                                      alt={p.product}
                                      fill
                                      sizes="44px"
                                      className="object-cover"
                                    />
                                  </div>
                                ) : (
                                  <div className="w-11 h-11 rounded-lg border border-gray-200/60 bg-orange-50 text-[#E8542A] flex items-center justify-center shrink-0">
                                    <Package size={18} />
                                  </div>
                                )}
                                <div className="min-w-0">
                                  <p className="text-xs font-semibold text-[#0f2347] truncate">
                                    {p.product}
                                  </p>
                                  <p className="text-[11px] text-[#E8542A] font-semibold">
                                    ₹{price.toLocaleString("en-IN")}{" "}
                                    {p.requiredUnit ? `/ ${p.requiredUnit}` : "/ unit"}
                                  </p>
                                </div>
                              </div>
                              <div className="flex items-center gap-2 shrink-0">
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedProductQuantities((prev) => ({
                                      ...prev,
                                      [idx]: Math.max(0, (prev[idx] || 0) - 1),
                                    }))
                                  }
                                  className="w-6 h-6 rounded-md bg-white border border-gray-200 text-gray-700 font-bold flex items-center justify-center hover:bg-gray-100 text-xs"
                                >
                                  -
                                </button>
                                <span className="text-xs font-bold text-[#0f2347] w-4 text-center">
                                  {qty}
                                </span>
                                <button
                                  type="button"
                                  onClick={() =>
                                    setSelectedProductQuantities((prev) => ({
                                      ...prev,
                                      [idx]: (prev[idx] || 0) + 1,
                                    }))
                                  }
                                  className="w-6 h-6 rounded-md bg-[#0f2347] text-white font-bold flex items-center justify-center hover:bg-[#1a3a6b] text-xs"
                                >
                                  +
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}

                    <Link
                      href={`/donations?campaign=${c.slug}&amount=${finalAmount}&type=${activeTab === "products" ? "PRODUCT" : "MONEY"}`}
                      className={`w-full block text-center bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold py-3.5 rounded-xl text-sm transition-colors duration-200 shadow-lg shadow-orange-200 ${
                        finalAmount <= 0 ? "opacity-50 pointer-events-none" : ""
                      }`}
                    >
                      Donate {finalAmount > 0 ? fmt(finalAmount) : ""} Now
                    </Link>

                    <p className="text-[11px] text-center text-gray-400 mt-3">
                      🔒 Secure payment via Razorpay · Instant 80G certificate
                    </p>
                  </>
                )}
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setLiked((v) => !v)}
                  className={`flex items-center gap-2 flex-1 justify-center py-2.5 text-xs font-bold rounded-xl border transition-all ${
                    liked
                      ? "bg-red-50 border-red-200 text-red-500"
                      : "bg-white border-gray-200 text-gray-500 hover:border-red-200 hover:text-red-400"
                  }`}
                >
                  <Heart size={14} fill={liked ? "currentColor" : "none"} />
                  {liked ? "Saved" : "Save"}
                </button>
                <button
                  onClick={() => setShareOpen(true)}
                  className="flex items-center gap-2 flex-1 justify-center py-2.5 text-xs font-bold rounded-xl border border-gray-200 bg-white text-gray-500 hover:border-[#1a3a6b] hover:text-[#1a3a6b] transition-all"
                >
                  <Share2 size={14} />
                  Share
                </button>
              </div>

              <DonorPanel
                slug={c.slug}
                initialDonors={initialDonors}
                initialTotal={initialDonorsTotal}
                initialTotalPages={initialDonorsTotalPages}
              />
            </div>
          </div>
        </div>
      </div>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={c.name}
        description={c.description}
      />
    </div>
  );
}
