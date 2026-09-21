"use client";

import React from "react";
import Image from "next/image";
import Link from "next/link";
import {
  Eye,
  Target,
  CheckCircle2,
  Heart,
  Home,
  Users,
  Megaphone,
  MapPin,
  Shield,
  Award,
  Phone,
  Mail,
  ChevronRight,
  ArrowRight,
  Check,
  User,
  Landmark,
  Globe,
  HandHeart,
  Building2,
  FileText,
  ScrollText,
  BadgeCheck,
} from "lucide-react";
import { getCmsPageBySlug, CmsPage } from "@/app/api/cms";

// =============================================================================
// SECTION 1: HERO — "OUR LEGACY"
// =============================================================================

function HeroSection({ data }: { data?: CmsPage | null }) {
  const title = data?.title || "OUR LEGACY";
  const subtitle =
    data?.subtitle ||
    "“A promise made in the streets of Dehradun, now echoing across India: No soul shall be forgotten, no hunger shall go unanswered.”";
  const bannerImage =
    data?.bannerImage ||
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1920&q=80";

  return (
    <section className="relative w-full h-[480px] lg:h-[520px] flex items-center justify-center overflow-hidden">
      {/* Background image + dark navy overlay */}
      <div className="absolute inset-0">
        <Image
          src={bannerImage}
          alt="Children smiling"
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-[#0B1120]/80" />
      </div>

      {/* Centered content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-semibold tracking-wide text-white">
          {title.includes(" ") ? (
            <>
              <span className="text-white">{title.split(" ").slice(0, -1).join(" ")} </span>
              <span className="text-[#f5a623]">{title.split(" ").slice(-1)[0]}</span>
            </>
          ) : (
            <span className="text-[#f5a623]">{title}</span>
          )}
        </h1>
        {/* Yellow underline */}
        <div className="w-16 h-1 bg-[#f5a623] mx-auto mt-4 mb-6" />
        <p className="text-white/80 italic text-base md:text-lg leading-relaxed max-w-2xl mx-auto">
          {subtitle}
        </p>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 2: THE SACRED PROMISE
// =============================================================================
// Two-column layout: quote card + paragraphs on left, image with 2026 badge on right.
// =============================================================================

function SacredPromiseSection({ data }: { data?: CmsPage | null }) {
  const storySection = data?.sections?.find((s) => s.key === "sacred_promise");
  const customStory = storySection?.description;

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0B1120] mb-12">
          {storySection?.name || "The Sacred Promise"}
        </h2>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          {/* LEFT: Quote card + text */}
          <div className="space-y-6">
            {customStory ? (
              <div className="bg-gray-50 border-l-4 border-blue-500 rounded-r-xl p-6 md:p-8">
                <p className="text-[#0B1120] italic leading-relaxed text-base md:text-lg whitespace-pre-wrap">
                  {customStory}
                </p>
              </div>
            ) : (
              <>
                <div className="bg-gray-50 border-l-4 border-blue-500 rounded-r-xl p-6 md:p-8">
                  <p className="text-[#0B1120] italic leading-relaxed text-base md:text-lg">
                    &ldquo;In 2026, when we were just school students, something powerful and life-changing happened.
                    We witnessed a heart-wrenching sight — a poor man, desperately trying to feed himself by eating
                    scraps from a garbage heap. That moment changed us forever. We couldn&apos;t just stand by and
                    watch the world go on as if nothing was wrong. In that instant, we made a promise to ourselves —
                    we would never let another soul go hungry, no matter what.&rdquo;
                  </p>
                </div>

                <p className="text-[#4f46e5] leading-relaxed text-base md:text-lg">
                  With a fire in our hearts and no resources to start with, we went from shop to shop in our city,
                  humbly asking for donations — ration, money, anything that could help. Some people opened their
                  hearts and gave generously, while others turned us away. But even rejection couldn&apos;t stop us.
                  We took whatever we had, and with it, we fed those who were starving.
                </p>

                <p className="text-[#4f46e5] leading-relaxed text-base md:text-lg">
                  From that day, we&apos;ve never looked back. Since that first meal, we have nourished thousands of
                  hungry souls, and the Seva India Foundation has grown beyond our wildest dreams. We are still
                  here, still fighting to ensure that no one in our community has to suffer from hunger again.
                </p>

                <p className="text-[#4f46e5] leading-relaxed text-base md:text-lg">
                  Seva India Foundation is a non-profit non-government organization (NGO) based in Uttarakhand,
                  India. It was founded in 2026 with the aim of empowering underprivileged children, youth, and women
                  through relevant education, innovative healthcare, and market-focused livelihood programs.
                </p>
              </>
            )}
          </div>

          {/* RIGHT: Image with 2026 badge */}
          <div className="relative">
            <div className="relative rounded-3xl overflow-hidden shadow-xl">
              <Image
                src="https://images.unsplash.com/photo-1542810634-71277d95dcbb?w=1200&q=80"
                alt="Happy children"
                width={600}
                height={500}
                className="w-full h-[400px] lg:h-[520px] object-cover"
              />
            </div>
            {/* Orange badge overlapping bottom-left of image */}
            <div className="absolute -bottom-6 -left-4 lg:left-6 bg-[#f5a623] rounded-2xl px-6 py-5 shadow-lg">
              <div className="text-[#0B1120] text-4xl font-bold">2026</div>
              <div className="text-[#0B1120] text-[10px] font-bold uppercase tracking-wider">
                Born of Student Empathy
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 3: OUR VISION & OUR MISSION
// =============================================================================

function VisionMissionSection({ data }: { data?: CmsPage | null }) {
  const vmSection = data?.sections?.find((s) => s.key === "vision_mission");
  const visionText =
    vmSection?.extra?.vision ||
    "Seva India Foundation envisions a Uttarakhand where poverty is eradicated, and every individual, especially women, senior citizens, and youth, is an empowered and respected member of society. We aspire to a state where inclusive development is deeply rooted, ensuring a dignified life for all citizens.";
  const missionText =
    vmSection?.extra?.mission ||
    "Aligned with the vision of a poverty-free India, Seva India Foundation is committed to empowering women, senior citizens, and youth. Our mission is to integrate these marginalized groups into the mainstream of society through comprehensive programs, education, vocational training, and support.";

  return (
    <section className="py-20 lg:py-28 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid md:grid-cols-2 gap-8">
          {/* VISION CARD */}
          <div className="relative bg-[#111827]/60 border border-white/5 rounded-3xl p-8 lg:p-10 overflow-hidden">
            <Eye className="absolute top-6 right-6 w-24 h-24 text-white/5" />
            <div className="w-12 h-12 bg-[#f5a623] rounded-xl flex items-center justify-center mb-6">
              <Eye className="w-6 h-6 text-[#0B1120]" />
            </div>
            <h3 className="text-white text-xl font-bold uppercase tracking-wide mb-4">
              Our Vision
            </h3>
            <p className="text-blue-200/80 leading-relaxed text-sm md:text-base">
              {visionText}
            </p>
          </div>

          {/* MISSION CARD */}
          <div className="relative bg-[#111827]/60 border border-white/5 rounded-3xl p-8 lg:p-10 overflow-hidden">
            <Target className="absolute top-6 right-6 w-24 h-24 text-white/5" />
            <div className="w-12 h-12 bg-[#f5a623] rounded-xl flex items-center justify-center mb-6">
              <Target className="w-6 h-6 text-[#0B1120]" />
            </div>
            <h3 className="text-white text-xl font-bold uppercase tracking-wide mb-4">
              Our Mission
            </h3>
            <p className="text-blue-200/80 leading-relaxed text-sm md:text-base">
              {missionText}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 4: AREAS OF FOCUS
// =============================================================================
// White background. 5 cards in a grid (3 top, 2 bottom).
// Each card: light bg, rounded-3xl, checkmark icon, title, purple description.
// =============================================================================

function AreasOfFocusSection() {
  const areas = [
    {
      title: "WOMEN EMPOWERMENT",
      desc: "We strive to enhance women's status through education, skill development, and economic opportunities, enabling financial independence.",
    },
    {
      title: "SENIOR CITIZEN WELFARE",
      desc: "Dedicated to improving the quality of life for senior citizens by providing essential support services, healthcare, and social security.",
    },
    {
      title: "YOUTH DEVELOPMENT",
      desc: "Focusing on holistic development through education, vocational training, and mentorship to empower youth.",
    },
    {
      title: "RURAL DEVELOPMENT",
      desc: "Comprehensive development of rural areas through infrastructure, healthcare, agriculture, and educational programs.",
    },
    {
      title: "LEPROSY SUPPORT",
      desc: "Aiding leprosy patients with essential rations, medical support coordination, and challenging societal stigma.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-3">
            AREAS OF <span className="text-[#f5a623]">FOCUS</span>
          </h2>
          <p className="text-[#4f46e5] text-base">
            Our organization&apos;s efforts are concentrated on these key areas.
          </p>
        </div>

        {/* Cards grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {areas.map((area, idx) => (
            <div
              key={idx}
              className="bg-gray-50/80 border border-gray-100 rounded-3xl p-8 hover:shadow-lg transition-shadow"
            >
              {/* Checkmark icon */}
              <div className="w-10 h-10 rounded-full border border-blue-200 flex items-center justify-center mb-5">
                <Check className="w-5 h-5 text-blue-500" />
              </div>
              <h3 className="text-[#0B1120] font-bold text-sm md:text-base uppercase tracking-wide mb-3">
                {area.title}
              </h3>
              <p className="text-[#4f46e5] text-sm leading-relaxed">{area.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 5: TANGIBLE RESULTS
// =============================================================================
// 2x2 grid of result items with orange checkmark circles.
// =============================================================================

function TangibleResultsSection() {
  const results = [
    {
      title: "WOMEN EMPOWERMENT",
      desc: "Our initiatives have empowered thousands of women, equipping them with skills and resources to establish sustainable livelihoods, leading to increased economic participation.",
    },
    {
      title: "SENIOR CITIZEN WELFARE",
      desc: "We have enhanced the lives of numerous senior citizens by providing essential support services, healthcare, and social security, fostering a sense of well-being.",
    },
    {
      title: "YOUTH DEVELOPMENT",
      desc: "Positively impacted the lives of countless youth by providing them with quality education, vocational training, and mentorship, enabling gainful employment.",
    },
    {
      title: "RURAL TRANSFORMATION",
      desc: "Resulted in improved infrastructure, healthcare facilities, and educational opportunities, leading to enhanced overall well-being of rural communities.",
    },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-3">
            TANGIBLE <span className="text-[#f5a623]">RESULTS</span>
          </h2>
          <p className="text-[#4f46e5] text-base max-w-2xl mx-auto">
            Seva India Foundation has made substantial progress in its endeavors, with measurable outcomes
            across various domains.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-x-12 gap-y-10 max-w-5xl mx-auto">
          {results.map((item, idx) => (
            <div key={idx} className="flex gap-4">
              <div className="shrink-0">
                <div className="w-8 h-8 rounded-full border-2 border-[#f5a623] flex items-center justify-center">
                  <Check className="w-4 h-4 text-[#f5a623]" />
                </div>
              </div>
              <div>
                <h4 className="text-[#0B1120] font-bold text-sm uppercase tracking-wide mb-2">
                  {item.title}
                </h4>
                <p className="text-[#4f46e5] text-sm leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 6: A BEACON OF HOPE FOR LEPROSY PATIENTS
// =============================================================================
// Left: heading + paragraphs. Right: "How You Can Help" card with buttons.
// =============================================================================

function LeprosySection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-start">
          {/* LEFT CONTENT */}
          <div>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#0B1120] mb-2">
              A BEACON OF HOPE FOR
            </h2>
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-blue-500 mb-8">
              LEPROSY PATIENTS
            </h2>

            <p className="text-[#4f46e5] leading-relaxed mb-8">
              Nestled in the foothills of the Himalayas, Uttarakhand grapples with a social issue that
              continues to plague many parts of India – leprosy. While significant strides have been made
              in controlling the disease, the stigma surrounding it continues to leave many patients
              ostracized and forgotten.
            </p>

            <h4 className="text-[#0B1120] font-bold uppercase tracking-wide mb-3">
              PROVIDING ESSENTIAL SUPPORT
            </h4>
            <p className="text-[#4f46e5] leading-relaxed mb-8">
              We ensure the well-being of marginalized individuals through regular ration distribution,
              access to clean water, and providing necessary clothing, bedding, and daily medical aids
              like bandages.
            </p>

            <h4 className="text-[#0B1120] font-bold uppercase tracking-wide mb-3">
              MORE THAN JUST PROVISIONS
            </h4>
            <p className="text-[#4f46e5] leading-relaxed">
              By actively engaging with the leprosy community, we work to break down stigma through
              awareness campaigns, provide skill development for self-reliance, and organize events
              promoting social inclusion.
            </p>
          </div>

          {/* RIGHT CARD */}
          <div className="bg-white rounded-3xl shadow-xl border border-gray-100 p-8 lg:p-10">
            <h3 className="text-[#0B1120] font-bold text-lg uppercase tracking-wide mb-8">
              HOW YOU CAN HELP
            </h3>

            <div className="space-y-6 mb-10">
              <div className="flex gap-4">
                <Heart className="w-5 h-5 text-[#f5a623] shrink-0 mt-1" />
                <div>
                  <h5 className="text-[#0B1120] font-semibold text-sm">Food and Living</h5>
                  <p className="text-[#4f46e5] text-sm">
                    Fund essential rations to ensure patients have enough nutritious food.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Home className="w-5 h-5 text-[#f5a623] shrink-0 mt-1" />
                <div>
                  <h5 className="text-[#0B1120] font-semibold text-sm">Shelter & Care Items</h5>
                  <p className="text-[#4f46e5] text-sm">
                    Support repairs of leprosy shelters and donate clothes, bedding, and toiletries.
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <Users className="w-5 h-5 text-[#f5a623] shrink-0 mt-1" />
                <div>
                  <h5 className="text-[#0B1120] font-semibold text-sm">Spread Awareness</h5>
                  <p className="text-[#4f46e5] text-sm">
                    Raise awareness about our work and volunteer your time to reduce stigma.
                  </p>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <button className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white font-semibold rounded-full text-sm transition-colors">
                SUPPORT OUR MISSION
              </button>
              <button className="px-6 py-3 border border-gray-300 hover:border-gray-400 text-[#0B1120] font-semibold rounded-full text-sm transition-colors">
                READ FULL STORY
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 7: 100% TRANSPARENT & ACCOUNTABLE
// =============================================================================
// Orange dotted background with dark navy card inside.
// 2x2 grid of registration details.
// =============================================================================

function TransparencySection() {
  return (
    <section
      className="py-20 lg:py-28"
      style={{
        backgroundColor: "#f5a623",
        backgroundImage: "radial-gradient(circle, #d97706 1.5px, transparent 1.5px)",
        backgroundSize: "24px 24px",
      }}
    >
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1120] rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-2xl">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT */}
            <div>
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 mb-6">
                <Shield className="w-4 h-4 text-[#f5a623]" />
                <span className="text-[#f5a623] text-xs font-bold uppercase tracking-wider">
                  Government Recognized
                </span>
              </div>

              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-white mb-2">
                100% TRANSPARENT
              </h2>
              <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold text-[#f5a623] mb-6">
                & ACCOUNTABLE
              </h2>

              <p className="text-blue-200/70 leading-relaxed text-sm md:text-base">
                At Seva India Foundation, trust isn&apos;t a promise—it&apos;s a practice. As a registered
                Section 8 NGO, we protect your trust through meticulous accountability and radical
                transparency.
              </p>
            </div>

            {/* RIGHT: 2x2 Info grid */}
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                  NGO Darpan ID
                </div>
                <div className="text-white font-semibold text-sm">UK/2026/0993905</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                  CIN Number
                </div>
                <div className="text-white font-semibold text-sm">U88900UT2026NPL020825</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                  Tax Exemption
                </div>
                <div className="text-white font-semibold text-sm">80G & 12A</div>
              </div>
              <div className="bg-white/5 border border-white/10 rounded-2xl p-5">
                <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                  Legal Status
                </div>
                <div className="text-white font-semibold text-sm">Section 8 Company</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 8: STEWARDS OF THE MISSION (Team)
// =============================================================================
// 3 team member cards with dark circle avatars (initials in orange).
// =============================================================================

function TeamSection() {
  const team = [
    { initials: "PU", name: "PRAVESH UNIYAL", role: "FOUNDER & CHAIRMAN" },
    { initials: "S", name: "SWATI", role: "CO-FOUNDER & DIRECTOR" },
    { initials: "RK", name: "DR. RAJESH KUMAR", role: "MEDICAL ADVISOR" },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-3">
            STEWARDS OF <span className="text-[#f5a623]">THE MISSION</span>
          </h2>
          <p className="text-[#4f46e5] text-base max-w-2xl mx-auto">
            Our leadership is a blend of seasoned social architects and corporate experts, all united by a
            singular commitment to ethical service.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {team.map((member, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-3xl p-8 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              {/* Avatar */}
              <div className="w-20 h-20 mx-auto mb-5 rounded-full bg-[#0B1120] flex items-center justify-center">
                <span className="text-[#f5a623] text-xl font-bold">{member.initials}</span>
              </div>
              <h4 className="text-[#0B1120] font-bold text-sm uppercase tracking-wide mb-1">
                {member.name}
              </h4>
              <p className="text-gray-500 text-xs uppercase tracking-wider">{member.role}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 9: THE WISDOM CIRCLE (Advisory Board)
// =============================================================================
// Left: title + bullet list. Right: 4 placeholder avatar cards (2x2).
// =============================================================================

function WisdomCircleSection() {
  const items = [
    "STRATEGIC PLANNING & GOVERNANCE",
    "FINANCIAL OVERSIGHT & TRANSPARENCY",
    "PROGRAM IMPACT EVALUATION",
    "COMMUNITY ENGAGEMENT STRATEGIES",
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* LEFT */}
          <div>
            <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-6">
              The Wisdom Circle
            </h2>
            <p className="text-[#4f46e5] leading-relaxed mb-8">
              Guided by eminent thinkers and practitioners who ensure our path remains true to our founding
              values while embracing innovation.
            </p>

            <ul className="space-y-4">
              {items.map((item, idx) => (
                <li key={idx} className="flex items-center gap-3">
                  <Award className="w-5 h-5 text-[#f5a623] shrink-0" />
                  <span className="text-[#0B1120] text-xs font-bold uppercase tracking-wide">{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* RIGHT: 2x2 placeholder cards */}
          <div className="grid grid-cols-2 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div
                key={i}
                className="aspect-square rounded-3xl border-2 border-dashed border-gray-200 bg-gray-50 flex items-center justify-center"
              >
                <User className="w-12 h-12 text-gray-200" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 10: OUR SPHERE (Stats / Impact Numbers)
// =============================================================================
// Dark navy bg. Left: Indian flag image with location pin. Right: stat list.
// =============================================================================

function OurSphereSection() {
  const stats = [
    { value: "15+", label: "STATES COVERED", desc: "Operating across major states in India, from the North to the South." },
    { value: "1000+", label: "VILLAGES SERVED", desc: "Reaching the most remote rural and underserved communities across India." },
    { value: "250k+", label: "DIRECT BENEFICIARIES", desc: "Impacting lives directly through our integrated programs." },
    { value: "350+", label: "PROJECTS COMPLETED", desc: "Successful implementation of diverse social initiatives." },
    { value: "25k+", label: "CHILDREN SUPPORTED", desc: "Providing bridge schools, meals, and safety under Seva for Children (SFC)." },
  ];

  return (
    <section className="py-20 lg:py-28 bg-[#0B1120]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-white mb-3">
            OUR <span className="text-[#f5a623]">SPHERE</span>
          </h2>
          <p className="text-blue-200/70 text-base">
            From the highest mountain hamlets to the densest urban settlements, our reach is defined by where
            the need is greatest.
          </p>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* LEFT: Image */}
          <div className="relative">
            <div className="relative rounded-[2.5rem] overflow-hidden shadow-2xl">
              <Image
                src="https://images.unsplash.com/photo-1531206715517-5c0ba140b2b8?w=1200&q=80"
                alt="Indian flag"
                width={500}
                height={500}
                className="w-full h-[400px] lg:h-[480px] object-cover"
              />
            </div>
            {/* Location pin overlay */}
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-16 h-16 bg-[#f5a623] rounded-full flex items-center justify-center shadow-xl">
              <MapPin className="w-8 h-8 text-[#0B1120]" />
            </div>
          </div>

          {/* RIGHT: Stats */}
          <div className="space-y-4">
            {stats.map((stat, idx) => (
              <div
                key={idx}
                className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center gap-5"
              >
                <div className="text-[#f5a623] text-3xl md:text-4xl font-bold shrink-0">
                  {stat.value}
                </div>
                <div>
                  <div className="text-white font-bold text-sm uppercase tracking-wide">
                    {stat.label}
                  </div>
                  <div className="text-blue-200/60 text-xs">{stat.desc}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 11: THE ARCHITECTURE OF CHANGE (Process)
// =============================================================================
// 4 cards with large faded numbers (01-04).
// =============================================================================

function ArchitectureSection() {
  const steps = [
    { num: "01", title: "IDENTIFY", desc: "Identifying the most vulnerable communities and their specific needs." },
    { num: "02", title: "DESIGN", desc: "Designing sustainable and scalable programs to address those needs." },
    { num: "03", title: "IMPLEMENT", desc: "Direct implementation through our dedicated field teams and partners." },
    { num: "04", title: "MONITOR", desc: "Rigorous monitoring and evaluation to ensure maximum impact." },
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-3">
            THE ARCHITECTURE OF <span className="text-[#f5a623]">CHANGE</span>
          </h2>
          <p className="text-[#4f46e5] text-base">
            A systematic, data-driven approach to turning compassion into sustainable reality.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="text-5xl font-bold text-indigo-100 mb-4">{step.num}</div>
              <h4 className="text-[#0B1120] font-bold text-sm uppercase tracking-wide mb-3">
                {step.title}
              </h4>
              <p className="text-[#4f46e5] text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 12: THE STEWARDSHIP OF YOUR TRUST (Fund Split)
// =============================================================================
// White card container. 90% dark card / 10% white card split.
// =============================================================================

function StewardshipSection() {
  return (
    <section className="py-20 lg:py-28 bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-[2.5rem] shadow-xl border border-gray-100 p-8 md:p-12 lg:p-16 text-center">
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-semibold text-[#0B1120] mb-2">
            THE STEWARDSHIP OF YOUR TRUST
          </h2>
          <div className="w-12 h-1 bg-[#f5a623] mx-auto mb-6" />
          <p className="text-[#4f46e5] leading-relaxed max-w-2xl mx-auto mb-12">
            At Seva India Foundation, trust isn&apos;t a promise—it&apos;s a practice. Your donation is 100% safe
            with us, and we ensure it reaches the ground where it is needed most, with 100% updates sent to
            you via WhatsApp and email.
          </p>

          <div className="grid sm:grid-cols-2 gap-6 max-w-3xl mx-auto">
            {/* 90% Card */}
            <div className="bg-[#0B1120] rounded-3xl p-8 text-center">
              <div className="text-5xl font-bold text-[#f5a623] mb-2">90%</div>
              <div className="text-white font-bold text-sm uppercase tracking-wide mb-2">
                DIRECT PROGRAM SUPPORT
              </div>
              <p className="text-blue-200/60 text-xs">
                Goes directly to funding our on-the-ground projects, resources, and beneficiary aid.
              </p>
            </div>

            {/* 10% Card */}
            <div className="bg-white border border-gray-200 rounded-3xl p-8 text-center">
              <div className="text-5xl font-bold text-[#0B1120] mb-2">10%</div>
              <div className="text-[#0B1120] font-bold text-sm uppercase tracking-wide mb-2">
                ADMIN & FUNDRAISING
              </div>
              <p className="text-[#4f46e5] text-xs">
                Essential operations, technology, and compliance to ensure radical transparency.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 13: AWARDS & RECOGNITION
// =============================================================================
// 4 cards with orange medal icons.
// =============================================================================

function AwardsSection() {
  const awards = [
    "BEST NGO FOR EDUCATION",
    "EXCELLENCE IN HEALTHCARE DELIVERY",
    "TRANSPARENCY IN GOVERNANCE AWARD",
    "SOCIAL IMPACT PIONEER",
  ];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120]">
            Awards & Recognition
          </h2>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {awards.map((award, idx) => (
            <div
              key={idx}
              className="bg-gray-50/80 border border-gray-100 rounded-3xl p-8 text-center hover:shadow-lg transition-shadow"
            >
              <Award className="w-10 h-10 text-[#f5a623] mx-auto mb-4" />
              <h4 className="text-[#0B1120] font-bold text-xs uppercase tracking-wide leading-relaxed">
                {award}
              </h4>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 14: LEGAL & COMPLIANCE
// =============================================================================
// Dark navy rounded container. Left: reg details. Right: glassmorphism address card.
// =============================================================================

function LegalSection() {
  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#0B1120] rounded-[2.5rem] p-8 md:p-12 lg:p-16">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* LEFT */}
            <div>
              <h2 className="text-3xl md:text-4xl font-semibold text-white mb-4">
                LEGAL & COMPLIANCE
              </h2>
              <p className="text-blue-200/70 mb-10">
                We maintain the highest standards of transparency and accountability in all our operations.
              </p>

              <div className="space-y-6">
                <div>
                  <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                    CIN Number
                  </div>
                  <div className="text-white font-semibold">U88900UT2026NPL020825</div>
                </div>
                <div>
                  <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                    Section 8 License
                  </div>
                  <div className="text-white font-semibold">No. 179973</div>
                </div>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                      PAN Number
                    </div>
                    <div className="text-white font-semibold">ABSCS7219M</div>
                  </div>
                  <div>
                    <div className="text-[#f5a623] text-[10px] font-bold uppercase tracking-wider mb-1">
                      TAN Number
                    </div>
                    <div className="text-white font-semibold">MRTS38379F</div>
                  </div>
                </div>
              </div>
            </div>

            {/* RIGHT: Glass card */}
            <div className="bg-white/10 backdrop-blur-md border border-white/10 rounded-3xl p-8">
              <h4 className="text-white font-bold text-sm uppercase tracking-wide mb-4">
                REGISTERED OFFICE
              </h4>
              <div className="flex gap-3">
                <MapPin className="w-5 h-5 text-[#f5a623] shrink-0 mt-0.5" />
                <p className="text-blue-200/80 text-sm leading-relaxed">
                  20, Sahastradhara Road,
                  <br />
                  Rishinagar Upper Adhoiwala,
                  <br />
                  Dehradun, Uttarakhand – 248001
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// =============================================================================
// SECTION 15: ALLIES IN IMPACT (Partners)
// =============================================================================
// Two feature cards + partner logo text row.
// =============================================================================

function AlliesSection() {
  const partners = ["CORPORATE PARTNERS", "GLOBAL GIVING", "TECH FOR GOOD", "INDIA CARES", "SOCIAL IMPACT"];

  return (
    <section className="py-20 lg:py-28 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-semibold text-[#0B1120] mb-3">
            ALLIES <span className="text-[#f5a623]">IN IMPACT</span>
          </h2>
          <p className="text-[#4f46e5] text-base">
            Powered by organizations that prioritize direct, ground-level action over corporate lip-service.
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto mb-16">
          {/* LEFT CARD */}
          <div className="bg-[#0B1120] rounded-[2.5rem] p-8 lg:p-10 text-center">
            <div className="w-14 h-14 bg-[#f5a623] rounded-2xl flex items-center justify-center mx-auto mb-6">
              <Shield className="w-7 h-7 text-[#0B1120]" />
            </div>
            <h3 className="text-[#f5a623] font-bold text-lg uppercase tracking-wide mb-4">
              DEV BHOOMI SAMITI
            </h3>
            <p className="text-blue-200/70 text-sm leading-relaxed mb-6">
              <span className="text-white font-semibold">Strategic Pillar:</span> The immense contribution of
              Dev Bhoomi Samiti is what makes our mission possible. As our principal patron, they provide the
              visionary leadership and total support that fuels every project, every camp, and every life we
              touch.
            </p>
            <a
              href="#"
              className="inline-flex items-center gap-2 text-[#f5a623] text-xs font-bold uppercase tracking-wider hover:underline"
            >
              VISIT OFFICIAL WEBSITE <ArrowRight className="w-4 h-4" />
            </a>
          </div>

          {/* RIGHT CARD */}
          <div className="bg-gray-50 border border-gray-100 rounded-[2.5rem] p-8 lg:p-10">
            <h3 className="text-[#0B1120] font-bold text-lg uppercase tracking-wide mb-4">
              FOUNDATION&apos;S CORE STRENGTH
            </h3>
            <p className="text-[#4f46e5] text-sm leading-relaxed mb-8">
              Our operational model is built on the immense contribution and full visionary backing of Dev
              Bhoomi Samiti. This unique alliance allows us to focus 100% of our energy on ground-level
              implementation, ensuring that every resource is utilized for maximum social impact.
            </p>
                    <div className="inline-flex items-center gap-3 bg-white border border-gray-200 rounded-full px-5 py-3">
              <Heart className="w-5 h-5 text-blue-500" />
              <div className="text-left">
                <div className="text-[#4f46e5] text-[10px] font-bold uppercase tracking-wider">
                  Partnership Status
                </div>
                <div className="text-[#0B1120] text-xs font-bold uppercase">
                  CORE STRATEGIC ALLIANCE
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Partner logos text row */}
        <div className="flex flex-wrap items-center justify-center gap-8 md:gap-14 opacity-40">
          {partners.map((p, i) => (
            <span key={i} className="text-[#0B1120] font-bold text-sm uppercase tracking-widest">
              {p}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}



// =============================================================================
// SECTION 17: MAIN PAGE ASSEMBLY
// =============================================================================
// Renders all sections in order. Drop this file into app/about/page.tsx
// =============================================================================

export default function AboutPage() {
  const [cmsData, setCmsData] = React.useState<CmsPage | null>(null);

  React.useEffect(() => {
    const fetchAboutData = async () => {
      try {
        const res = await getCmsPageBySlug("about");
        if (res) {
          setCmsData(res);
        }
      } catch (e) {
        // Fallback silently to defaults
      }
    };
    fetchAboutData();
  }, []);

  return (
    <main className="min-h-screen bg-white">
      <HeroSection data={cmsData} />
      <SacredPromiseSection data={cmsData} />
      <VisionMissionSection data={cmsData} />
      <AreasOfFocusSection />
      <TangibleResultsSection />
      <LeprosySection />
      <TransparencySection />
      <TeamSection />
      <WisdomCircleSection />
      <OurSphereSection />
      <ArchitectureSection />
      <StewardshipSection />
      <AwardsSection />
      <LegalSection />
      <AlliesSection />
    </main>
  );
}