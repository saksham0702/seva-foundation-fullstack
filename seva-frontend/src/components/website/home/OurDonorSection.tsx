"use client";

import Image from "next/image";
import { Award } from "lucide-react";

interface Donor {
  id: string;
  name: string;
  avatar: string;
  totalDonations: number;
  donationCount: number;
  badge: "Champion" | "Guardian" | "Supporter" | "Contributor";
  topCause: string;
  quote: string;
}

const DONORS: Donor[] = [
  {
    id: "1",
    name: "Rahul Sharma",
    avatar:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&q=80",
    totalDonations: 125000,
    donationCount: 24,
    badge: "Champion",
    topCause: "Medical Aid",
    quote:
      "Seeing a child recover because of our collective action — there's nothing more fulfilling in this world.",
  },
  {
    id: "2",
    name: "Priya Patel",
    avatar:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=200&q=80",
    totalDonations: 89000,
    donationCount: 18,
    badge: "Guardian",
    topCause: "Education",
    quote:
      "I donate because I know what a good education meant for me. Every child deserves that same door opened.",
  },
  {
    id: "3",
    name: "Amit Kumar",
    avatar:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&q=80",
    totalDonations: 67000,
    donationCount: 15,
    badge: "Guardian",
    topCause: "Disaster Relief",
    quote:
      "When floods hit last year, I felt helpless watching the news. Donating turned that helplessness into action.",
  },
  {
    id: "4",
    name: "Sneha Reddy",
    avatar:
      "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&q=80",
    totalDonations: 45000,
    donationCount: 12,
    badge: "Supporter",
    topCause: "Animal Welfare",
    quote:
      "Animals can't ask for help. We have to be their voice. It's the simplest moral truth I know.",
  },
  {
    id: "5",
    name: "Vikram Singh",
    avatar:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&q=80",
    totalDonations: 32000,
    donationCount: 9,
    badge: "Supporter",
    topCause: "Social Welfare",
    quote:
      "My father always said — if you can give something back, you must. I'm just honouring that.",
  },
  {
    id: "6",
    name: "Ananya Gupta",
    avatar:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&q=80",
    totalDonations: 18000,
    donationCount: 6,
    badge: "Contributor",
    topCause: "Education",
    quote:
      "It started with one girl's school fees. Now I fund six. The ripple effect keeps surprising me.",
  },
  {
    id: "7",
    name: "Rajesh Iyer",
    avatar:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=200&q=80",
    totalDonations: 15000,
    donationCount: 5,
    badge: "Contributor",
    topCause: "Medical Aid",
    quote:
      "Healthcare shouldn't depend on luck of birth. Every donation is a small vote for a fairer India.",
  },
  {
    id: "8",
    name: "Meera Nair",
    avatar:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&q=80",
    totalDonations: 12000,
    donationCount: 4,
    badge: "Contributor",
    topCause: "Disaster Relief",
    quote:
      "I'm not rich, but I can skip one dinner out a month. That's someone's meal for a week.",
  },
];

const BADGE_STYLES: Record<
  Donor["badge"],
  { bg: string; text: string; icon: string }
> = {
  Champion: {
    bg: "bg-amber-100",
    text: "text-amber-800",
    icon: "text-amber-600",
  },
  Guardian: { bg: "bg-blue-100", text: "text-blue-800", icon: "text-blue-600" },
  Supporter: {
    bg: "bg-emerald-100",
    text: "text-emerald-800",
    icon: "text-emerald-600",
  },
  Contributor: {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: "text-gray-500",
  },
};

function formatCurrency(amount: number): string {
  if (amount >= 100000) return `₹${(amount / 100000).toFixed(1)}L`;
  if (amount >= 1000) return `₹${(amount / 1000).toFixed(0)}K`;
  return `₹${amount}`;
}

function DonorCard({ donor }: { donor: Donor }) {
  const badge = BADGE_STYLES[donor.badge];
  return (
    <div className="flex-shrink-0 w-[280px] bg-white rounded-2xl border border-gray-100 p-5 relative overflow-hidden">
      {/* Top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-[3px] bg-gradient-to-r from-[#E8542A] to-[#1a3a6b]" />

      {/* Avatar + Badge */}
      <div className="flex items-center gap-3 mb-3">
        <div className="w-11 h-11 rounded-xl overflow-hidden flex-shrink-0 ring-2 ring-gray-100 ring-offset-1">
          <Image
            src={donor.avatar}
            alt={donor.name}
            width={200}
            height={200}
            className="w-full h-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-[#0f2347] truncate">
            {donor.name}
          </p>
          <p className="text-xs text-gray-400">{donor.topCause}</p>
        </div>
        <span
          className={`flex items-center gap-1 text-[10px] font-bold px-2.5 py-1 rounded-full flex-shrink-0 ${badge.bg} ${badge.text}`}
        >
          <Award className={`w-3 h-3 ${badge.icon}`} />
          {donor.badge}
        </span>
      </div>

      {/* Quote */}
      <p className="text-[32px] leading-none text-[#E8542A] opacity-20 font-serif select-none">
        &ldquo;
      </p>
      <p className="text-[13px] leading-relaxed text-gray-500 mt-1 mb-4 line-clamp-3">
        {donor.quote}
      </p>

      {/* Footer */}
      <div className="flex items-center justify-between border-t border-gray-100 pt-3">
        <span className="text-xs text-gray-400">
          {donor.donationCount} donations
        </span>
        <span className="text-[11px] font-semibold text-[#E8542A] bg-orange-50 px-2.5 py-1 rounded-full">
          {formatCurrency(donor.totalDonations)} given
        </span>
      </div>
    </div>
  );
}

function MarqueeRow({
  donors,
  direction,
}: {
  donors: Donor[];
  direction: "rtl" | "ltr";
}) {
  // Duplicate for seamless loop
  const items = [...donors, ...donors];

  return (
    <div
      className="overflow-hidden"
      style={{
        maskImage:
          "linear-gradient(to right, transparent, black 80px, black calc(100% - 80px), transparent)",
      }}
    >
      <div
        className={`flex gap-4 ${direction === "rtl" ? "animate-marquee-rtl" : "animate-marquee-ltr"}`}
        style={{
          width: "max-content",
        }}
        onMouseEnter={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState =
            "paused")
        }
        onMouseLeave={(e) =>
          ((e.currentTarget as HTMLDivElement).style.animationPlayState =
            "running")
        }
      >
        {items.map((donor, i) => (
          <DonorCard key={`${direction}-${donor.id}-${i}`} donor={donor} />
        ))}
      </div>
    </div>
  );
}

export default function DonorMarqueeSection() {
  const row1 = DONORS.slice(0, 4);
  const row2 = DONORS.slice(4);

  return (
    <section className="py-20 bg-gradient-to-b from-gray-50/50 to-white overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-12">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.18em] text-[#E8542A] mb-3">
            <span className="w-6 h-px bg-[#E8542A]" />
            Voices of Change
            <span className="w-6 h-px bg-[#E8542A]" />
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-[#0f2347] leading-tight">
            What our donors say.
            <br className="hidden sm:block" />
            <span className="text-[#E8542A]"> Real stories, real impact.</span>
          </h2>
          <p className="mt-3 text-gray-500 text-sm max-w-xl mx-auto leading-relaxed">
            Behind every donation is a reason. Here&apos;s what moves our
            community to give, in their own words.
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-4">
        <MarqueeRow donors={row1} direction="rtl" />
        <MarqueeRow donors={row2} direction="ltr" />
      </div>
    </section>
  );
}
