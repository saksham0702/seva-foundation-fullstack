"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowRight,
  Heart,
  Users,
  BookOpen,
  Utensils,
  Stethoscope,
  Home,
  TreePine,
  ChevronRight,
  MapPin,
  Phone,
  Mail,
  ExternalLink,
  Play,
  X,
  Menu,
  ArrowUpRight,
  Calendar,
  Clock,
  HandHeart,
  Target,
  TrendingUp,
  Award,
  Globe,
  CheckCircle2,
} from "lucide-react";

/* ──────────────────────────────────────────────
   IMAGES — real, human, not AI-generated
────────────────────────────────────────────── */
const IMAGES = {
  hero: "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1600&q=85",
  hero2:
    "https://images.unsplash.com/photo-1509099836639-18ba1795216d?w=1600&q=85",
  education:
    "https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=800&q=80",
  food: "https://images.unsplash.com/photo-1593113598332-cd288d649433?w=800&q=80",
  medical:
    "https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=800&q=80",
  shelter:
    "https://images.unsplash.com/photo-1469571486292-0ba58a3f068b?w=800&q=80",
  environment:
    "https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80",
  team1: "https://images.unsplash.com/photo-1551836022-d5d88e9218df?w=400&q=80",
  team2:
    "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&q=80",
  team3: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=400&q=80",
  team4:
    "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&q=80",
  gallery1:
    "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
  gallery2:
    "https://images.unsplash.com/photo-1497486751825-1233686d5d80?w=600&q=80",
  gallery3:
    "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&q=80",
  gallery4:
    "https://images.unsplash.com/photo-1524069290683-0457abfe42c3?w=600&q=80",
  gallery5:
    "https://images.unsplash.com/photo-1593113630400-ea4288922497?w=600&q=80",
  gallery6:
    "https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&q=80",
  dehradun:
    "https://images.unsplash.com/photo-1626010448982-4d629b0f24d9?w=800&q=80",
};

/* ──────────────────────────────────────────────
   DATA
────────────────────────────────────────────── */
const IMPACT_STATS = [
  { number: "12,000+", label: "Children Educated", icon: BookOpen },
  { number: "3.5L", label: "Meals Served", icon: Utensils },
  { number: "850+", label: "Medical Camps", icon: Stethoscope },
  { number: "45", label: "Villages Reached", icon: MapPin },
];

const PROGRAMS = [
  {
    id: "education",
    title: "Shiksha Seva",
    subtitle: "Education for Every Child",
    description:
      "Running 8 learning centres across Dehradun district where children from slum areas and migrant families receive free tuition, books, and midday meals. We focus on bridging the gap between government schools and real learning outcomes.",
    image: IMAGES.education,
    icon: BookOpen,
    color: "#1a3a6b",
    stats: "2,400 children enrolled · 8 centres",
  },
  {
    id: "nutrition",
    title: "Annadaan",
    subtitle: "No One Sleeps Hungry",
    description:
      "Daily food distribution to the homeless, elderly, and daily-wage workers in Dehradun city. Our community kitchen at Dalanwala serves hot meals every evening. During emergencies, we run ration kit drives for families in crisis.",
    image: IMAGES.food,
    icon: Utensils,
    color: "#E8542A",
    stats: "500 meals daily · 15,000 kits distributed",
  },
  {
    id: "health",
    title: "Swasthya Seva",
    subtitle: "Healthcare at the Doorstep",
    description:
      "Free health camps in remote villages of Uttarakhand where medical facilities are hours away. We provide basic checkups, medicines, and connect serious cases to government hospitals. Eye camps and dental checkups are held quarterly.",
    image: IMAGES.medical,
    icon: Stethoscope,
    color: "#059669",
    stats: "120+ camps · 8,000 patients treated",
  },
  {
    id: "shelter",
    title: "Aashray",
    subtitle: "A Roof for Everyone",
    description:
      "Building and repairing homes for families affected by natural disasters in the hills. We also run a night shelter during winter months for the homeless in Dehradun, providing blankets, warm meals, and medical care.",
    image: IMAGES.shelter,
    icon: Home,
    color: "#7c3aed",
    stats: "32 homes built · 200+ sheltered in winter",
  },
  {
    id: "environment",
    title: "Hariyali",
    subtitle: "Green Dehradun Initiative",
    description:
      "Tree plantation drives along the Rispana and Bindal rivers. We work with local schools and communities to maintain green belts. Waste management workshops and river clean-up drives are organised monthly with volunteer participation.",
    image: IMAGES.environment,
    icon: TreePine,
    color: "#0d9488",
    stats: "50,000+ trees planted · 24 clean-up drives",
  },
];

const TEAM = [
  {
    name: "Rajesh Thakur",
    role: "Founder & Director",
    bio: "Former civil servant who left his job to build Seva India in 2012. Born in a village near Mussoorie, he understands the struggles of rural Uttarakhand firsthand.",
    image: IMAGES.team1,
  },
  {
    name: "Dr. Priya Sharma",
    role: "Medical Head",
    bio: "MBBS from AIIMS, returned to Dehradun to serve mountain communities. She designs all our health camp protocols and trains local health workers.",
    image: IMAGES.team2,
  },
  {
    name: "Vikram Singh Rawat",
    role: "Operations Lead",
    bio: "Manages our ground teams across 45 villages. Previously worked with UNICEF in disaster response. Knows every village road in the district.",
    image: IMAGES.team3,
  },
  {
    name: "Ananya Mishra",
    role: "Education Coordinator",
    bio: "Former Teach for India fellow. She designs our curriculum and trains our 40+ volunteer teachers. Passionate about making learning joyful.",
    image: IMAGES.team4,
  },
];

const TESTIMONIALS = [
  {
    text: "My daughter Kiran was not going to school. Seva India's centre near our basti changed everything. She can now read Hindi and English. They also gave her books and a uniform.",
    name: "Sunita Devi",
    location: "Dalanwala, Dehradun",
    role: "Parent",
  },
  {
    text: "The health camp in my village Chamba detected my father's cataract early. They arranged free surgery at Doon Hospital. We had no idea such help existed so close to home.",
    name: "Ramesh Bisht",
    location: "Chamba, Tehri Garhwal",
    role: "Farmer",
  },
  {
    text: "I volunteer every Sunday at the community kitchen. It is the most honest work I do all week. The organisation is run with complete transparency — every rupee is accounted for.",
    name: "Amit Khanna",
    location: "Dehradun",
    role: "Volunteer since 2019",
  },
];

const TIMELINE = [
  {
    year: "2012",
    title: "The Beginning",
    desc: "Started with a small tuition centre in Dalanwala slum with 12 children and 2 volunteers.",
  },
  {
    year: "2015",
    title: "First Health Camp",
    desc: "Organised our first free medical camp in a remote village of Tehri district. 200 patients treated.",
  },
  {
    year: "2017",
    title: "Annadaan Kitchen",
    desc: "Launched daily community kitchen serving 200 meals. Now scaled to 500 meals every evening.",
  },
  {
    year: "2019",
    title: "Registered & Growing",
    desc: "Officially registered as Seva India Foundation. Team grew to 15 full-time staff and 200 volunteers.",
  },
  {
    year: "2021",
    title: "COVID Response",
    desc: "Distributed 40,000 ration kits and ran emergency medical helpline during the pandemic.",
  },
  {
    year: "2024",
    title: "45 Villages Strong",
    desc: "Expanded programs to 45 villages across Dehradun, Tehri, and Pauri Garhwal districts.",
  },
];

const PARTNERS = [
  "AIIMS Rishikesh",
  "Uttarakhand Govt",
  "Doon Hospital",
  "Teach for India",
  "Habitat for Humanity",
  "Rotary Club Dehradun",
];

/* ────────────────────────── helpers ─────────────────────────── */
const fmt = (n: number) => `₹${n.toLocaleString("en-IN")}`;

function SectionHeading({
  eyebrow,
  title,
  align = "center",
}: {
  eyebrow: string;
  title: string;
  align?: "left" | "center";
}) {
  return (
    <div className={`mb-12 ${align === "center" ? "text-center" : ""}`}>
      <span className="inline-block text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-3">
        {eyebrow}
      </span>
      <h2
        className={`text-3xl sm:text-4xl font-bold text-[#0f2347] leading-tight ${align === "center" ? "max-w-2xl mx-auto" : "max-w-xl"}`}
      >
        {title}
      </h2>
    </div>
  );
}

/* ─────────────────────────── page ───────────────────────────── */
export default function OurWorkPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeProgram, setActiveProgram] = useState(0);
  const [lightboxImg, setLightboxImg] = useState<string | null>(null);
  const [heroImg, setHeroImg] = useState(0);
  const [cmsData, setCmsData] = useState<any>(null);
  const programsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchCms = async () => {
      try {
        const { getCmsPageBySlug } = await import("@/app/api/cms");
        const res = await getCmsPageBySlug("our-work");
        if (res) setCmsData(res);
      } catch (e) {
        // Fallback to defaults
      }
    };
    fetchCms();
  }, []);

  const heroImages = [
    cmsData?.bannerImage || IMAGES.hero,
    IMAGES.hero2,
  ];

  const pageTitle = cmsData?.title || "Building hope, one community at a time";
  const pageSubtitle =
    cmsData?.subtitle ||
    "Seva India Foundation works in the foothills of the Himalayas, bringing education, healthcare, and dignity to the most underserved communities in Uttarakhand.";

  return (
    <div className="min-h-screen bg-white">
      {/* ── Navigation ── */}

      {/* ── Hero Section ── */}
      <section className="relative min-h-[85vh] flex items-center pt-16 overflow-hidden">
        <div className="absolute inset-0">
          <img
            src={heroImages[heroImg]}
            alt="Seva India Foundation volunteers working with children"
            className="w-full h-full object-cover transition-opacity duration-1000"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2347]/90 via-[#0f2347]/70 to-transparent" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
          <div className="max-w-2xl">
            <div className="flex items-center gap-2 mb-6">
              <MapPin size={14} className="text-[#E8542A]" />
              <span className="text-sm text-gray-300 font-medium">
                Dehradun, Uttarakhand · Since 2012
              </span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.1] mb-6">
              {pageTitle}
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              {pageSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="#programs"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-colors shadow-xl shadow-orange-900/30"
              >
                Explore Our Work
                <ArrowRight size={18} />
              </Link>
              <Link
                href="/donations"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-colors border border-white/20"
              >
                <Heart size={18} fill="white" />
                Support A Cause
              </Link>
            </div>
          </div>
        </div>

        {/* Hero image toggle dots */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
          {[0, 1].map((i) => (
            <button
              key={i}
              onClick={() => setHeroImg(i)}
              className={`w-2.5 h-2.5 rounded-full transition-all ${
                heroImg === i ? "bg-white w-8" : "bg-white/40"
              }`}
            />
          ))}
        </div>
      </section>

      {/* ── Impact Stats ── */}
      <section className="bg-[#0f2347] py-14 -mt-1 relative z-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {IMPACT_STATS.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-white/10 mb-4">
                  <stat.icon size={22} className="text-[#E8542A]" />
                </div>
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm text-gray-400 font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About / Who We Are ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div className="relative">
              <div className="rounded-2xl overflow-hidden">
                <img
                  src={IMAGES.dehradun}
                  alt="Dehradun hills and community"
                  className="w-full h-[400px] sm:h-[500px] object-cover"
                />
              </div>
              <div className="absolute -bottom-6 -right-6 bg-white rounded-xl shadow-xl p-5 max-w-[240px] border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#E8542A]/10 flex items-center justify-center">
                    <Award size={20} className="text-[#E8542A]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#0f2347]">12+</p>
                    <p className="text-xs text-gray-500">Years of Service</p>
                  </div>
                </div>
                <p className="text-xs text-gray-500 leading-relaxed">
                  Registered under Section 12A & 80G of the Income Tax Act
                </p>
              </div>
            </div>

            <div>
              <SectionHeading
                eyebrow="Who We Are"
                title="Rooted in Dehradun, reaching across the Himalayas"
                align="left"
              />
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  Seva India Foundation was born in 2012 from a simple belief —
                  that every child deserves a classroom, every patient deserves
                  a doctor, and no one should sleep hungry.
                </p>
                <p>
                  Based in{" "}
                  <strong className="text-[#0f2347]">
                    Dehradun, Uttarakhand
                  </strong>
                  , we work across the foothills and remote villages where
                  government services struggle to reach. Our team is made of
                  local people who understand the terrain, the language, and the
                  real needs of mountain communities.
                </p>
                <p>
                  We do not believe in temporary relief. Our programs are
                  designed for long-term impact — education centres that run
                  year-round, health camps that return every quarter, and
                  community kitchens that serve daily.
                </p>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                {[
                  { label: "Transparency", desc: "100% fund tracking" },
                  { label: "Local Team", desc: "Hiring from communities" },
                  { label: "Sustainable", desc: "Long-term programs" },
                  { label: "Volunteer-led", desc: "200+ active volunteers" },
                ].map((item, i) => (
                  <div key={i} className="flex items-start gap-2.5">
                    <CheckCircle2
                      size={16}
                      className="text-[#E8542A] mt-0.5 flex-shrink-0"
                    />
                    <div>
                      <p className="text-sm font-bold text-[#0f2347]">
                        {item.label}
                      </p>
                      <p className="text-xs text-gray-500">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Programs ── */}
      <section
        id="programs"
        ref={programsRef}
        className="py-20 sm:py-28 bg-[#f8f9fc]"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="What We Do"
            title="Five programs. One mission. Dignity for all."
          />

          {/* Program Tabs */}
          <div className="flex flex-wrap justify-center gap-2 mb-12">
            {PROGRAMS.map((prog, i) => (
              <button
                key={prog.id}
                onClick={() => setActiveProgram(i)}
                className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all ${
                  activeProgram === i
                    ? "bg-[#0f2347] text-white shadow-lg"
                    : "bg-white text-gray-600 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <prog.icon size={16} />
                {prog.title}
              </button>
            ))}
          </div>

          {/* Active Program Detail */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100">
            <div className="grid lg:grid-cols-2">
              <div className="relative h-72 lg:h-auto">
                <img
                  src={PROGRAMS[activeProgram].image}
                  alt={PROGRAMS[activeProgram].title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent lg:hidden" />
                <div className="absolute bottom-4 left-4 lg:hidden">
                  <span className="text-white text-xs font-bold uppercase tracking-wider">
                    {PROGRAMS[activeProgram].stats}
                  </span>
                </div>
              </div>
              <div className="p-8 sm:p-12 flex flex-col justify-center">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{
                      backgroundColor: PROGRAMS[activeProgram].color + "15",
                    }}
                  >
                    {React.createElement(PROGRAMS[activeProgram].icon, {
                      size: 24,
                      style: { color: PROGRAMS[activeProgram].color },
                    })}
                  </div>
                  <div>
                    <h3 className="text-2xl font-bold text-[#0f2347]">
                      {PROGRAMS[activeProgram].title}
                    </h3>
                    <p className="text-sm text-[#E8542A] font-semibold">
                      {PROGRAMS[activeProgram].subtitle}
                    </p>
                  </div>
                </div>
                <p className="text-gray-600 leading-relaxed mb-6">
                  {PROGRAMS[activeProgram].description}
                </p>
                <div className="hidden lg:flex items-center gap-2 text-sm font-semibold text-gray-500 mb-8">
                  <Target size={16} className="text-[#E8542A]" />
                  {PROGRAMS[activeProgram].stats}
                </div>
                <div className="flex gap-3">
                  <Link
                    href={`/programs/${PROGRAMS[activeProgram].id}`}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-sm font-bold rounded-xl transition-colors"
                  >
                    Learn More
                    <ArrowRight size={16} />
                  </Link>
                  <Link
                    href="/donations"
                    className="inline-flex items-center gap-2 px-6 py-3 border border-gray-200 hover:border-[#E8542A] hover:text-[#E8542A] text-gray-700 text-sm font-bold rounded-xl transition-colors"
                  >
                    <HandHeart size={16} />
                    Support This
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Timeline / Journey ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our Journey"
            title="Twelve years of showing up, every single day"
          />

          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px bg-gray-200 sm:-translate-x-px" />

            <div className="space-y-12">
              {TIMELINE.map((item, i) => (
                <div
                  key={i}
                  className={`relative flex items-start gap-8 ${i % 2 === 0 ? "sm:flex-row" : "sm:flex-row-reverse"}`}
                >
                  <div className="hidden sm:block w-1/2" />

                  {/* Dot */}
                  <div className="absolute left-4 sm:left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-[#E8542A] border-4 border-white shadow-md z-10 mt-1.5" />

                  <div
                    className={`ml-12 sm:ml-0 sm:w-1/2 ${i % 2 === 0 ? "sm:pr-12 sm:text-right" : "sm:pl-12"}`}
                  >
                    <span className="inline-block text-sm font-bold text-[#E8542A] mb-1">
                      {item.year}
                    </span>
                    <h3 className="text-lg font-bold text-[#0f2347] mb-2">
                      {item.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Gallery ── */}
      <section className="py-20 sm:py-28 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="On the Ground"
            title="Moments from the field"
          />

          <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-4">
            {[
              IMAGES.gallery1,
              IMAGES.gallery2,
              IMAGES.gallery3,
              IMAGES.gallery4,
              IMAGES.gallery5,
              IMAGES.gallery6,
            ].map((img, i) => (
              <button
                key={i}
                onClick={() => setLightboxImg(img)}
                className="group relative aspect-[4/3] rounded-2xl overflow-hidden cursor-pointer"
              >
                <img
                  src={img}
                  alt="Seva India work"
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                  <ExternalLink
                    size={24}
                    className="text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  />
                </div>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* Lightbox */}
      {lightboxImg && (
        <div
          className="fixed inset-0 z-[60] bg-black/90 flex items-center justify-center p-4"
          onClick={() => setLightboxImg(null)}
        >
          <button className="absolute top-4 right-4 text-white/70 hover:text-white">
            <X size={32} />
          </button>
          <img
            src={lightboxImg}
            alt="Gallery"
            className="max-w-full max-h-[90vh] rounded-lg object-contain"
          />
        </div>
      )}

      {/* ── Team ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="The People"
            title="Meet the team behind the mission"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {TEAM.map((member, i) => (
              <div key={i} className="group">
                <div className="relative rounded-2xl overflow-hidden mb-4 aspect-[3/4]">
                  <img
                    src={member.image}
                    alt={member.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0f2347]/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                </div>
                <h3 className="text-lg font-bold text-[#0f2347]">
                  {member.name}
                </h3>
                <p className="text-sm text-[#E8542A] font-semibold mb-2">
                  {member.role}
                </p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ── */}
      <section className="py-20 sm:py-28 bg-[#0f2347]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-3 block">
              Voices from the Community
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-white">
              What people say about us
            </h2>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div
                key={i}
                className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-8"
              >
                <div className="text-4xl text-[#E8542A] font-serif mb-4">"</div>
                <p className="text-gray-300 leading-relaxed text-sm mb-6">
                  {t.text}
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-[#E8542A]/20 flex items-center justify-center text-sm font-bold text-[#E8542A]">
                    {t.name[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{t.name}</p>
                    <p className="text-xs text-gray-400">
                      {t.location} · {t.role}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Partners ── */}
      <section className="py-16 bg-white border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-gray-400 mb-8">
            Trusted by organisations across India
          </p>
          <div className="flex flex-wrap justify-center items-center gap-x-10 gap-y-6">
            {PARTNERS.map((partner, i) => (
              <span
                key={i}
                className="text-sm font-bold text-gray-400 hover:text-[#0f2347] transition-colors cursor-default"
              >
                {partner}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 bg-[#f8f9fc]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8542A]/10 rounded-full text-[#E8542A] text-xs font-bold uppercase tracking-wider mb-6">
            <Heart size={14} fill="currentColor" />
            Join the Movement
          </div>
          <h2 className="text-3xl sm:text-5xl font-bold text-[#0f2347] mb-6 leading-tight">
            Be part of something bigger than yourself
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
            Whether you donate, volunteer, or simply spread the word — every
            action brings us closer to a Uttarakhand where no child is left
            behind.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/donations"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-colors shadow-xl shadow-orange-200"
            >
              <HandHeart size={20} />
              Donate Now
            </Link>
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-[#0f2347] font-bold rounded-xl transition-colors border border-gray-200"
            >
              <Users size={20} />
              Become a Volunteer
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      {/* <footer className="bg-[#0f2347] text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            <div>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-9 h-9 rounded-lg bg-[#E8542A] flex items-center justify-center">
                  <Heart size={18} fill="white" />
                </div>
                <span className="text-lg font-bold">Seva India</span>
              </div>
              <p className="text-sm text-gray-400 leading-relaxed mb-5">
                A Dehradun-based non-profit working for education, health, and
                dignity in the Himalayan foothills since 2012.
              </p>
              <div className="flex gap-3">
                {["Facebook", "Twitter", "Instagram", "LinkedIn"].map(
                  (social) => (
                    <a
                      key={social}
                      href="#"
                      className="w-9 h-9 rounded-lg bg-white/10 hover:bg-[#E8542A] flex items-center justify-center transition-colors"
                    >
                      <Globe size={16} />
                    </a>
                  ),
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-5">
                Programs
              </h4>
              <ul className="space-y-3">
                {[
                  "Shiksha Seva (Education)",
                  "Annadaan (Food)",
                  "Swasthya Seva (Health)",
                  "Aashray (Shelter)",
                  "Hariyali (Environment)",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-5">
                Get Involved
              </h4>
              <ul className="space-y-3">
                {[
                  "Donate",
                  "Volunteer",
                  "Partner with Us",
                  "Corporate CSR",
                  "Fundraise",
                ].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-sm text-gray-400 hover:text-white transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>

            <div>
              <h4 className="text-sm font-bold uppercase tracking-wider mb-5">
                Contact
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start gap-3">
                  <MapPin
                    size={16}
                    className="text-[#E8542A] mt-0.5 flex-shrink-0"
                  />
                  <span className="text-sm text-gray-400">
                    42, Rajpur Road, Near Clock Tower
                    <br />
                    Dehradun, Uttarakhand 248001
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Phone size={16} className="text-[#E8542A] flex-shrink-0" />
                  <span className="text-sm text-gray-400">
                    +91 135 262 7890
                  </span>
                </li>
                <li className="flex items-center gap-3">
                  <Mail size={16} className="text-[#E8542A] flex-shrink-0" />
                  <span className="text-sm text-gray-400">
                    hello@sevaindia.org
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-white/10 mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-xs text-gray-500">
              © 2024 Seva India Foundation. All rights reserved. Registered
              under the Indian Trusts Act, 1882.
            </p>
            <div className="flex gap-6">
              {["Privacy Policy", "Terms of Use", "80G Certificate"].map(
                (item) => (
                  <a
                    key={item}
                    href="#"
                    className="text-xs text-gray-500 hover:text-white transition-colors"
                  >
                    {item}
                  </a>
                ),
              )}
            </div>
          </div>
        </div>
      </footer> */}
    </div>
  );
}
