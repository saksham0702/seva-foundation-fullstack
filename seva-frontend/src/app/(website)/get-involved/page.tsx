"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Heart,
  Users,
  ArrowRight,
  CheckCircle2,
  Clock,
  MapPin,
  Calendar,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  HandHeart,
  Sparkles,
  Mail,
  Phone,
  User,
} from "lucide-react";
import {
  getPublicVolunteerCategories,
  createVolunteerApplication,
  VolunteerCategory,
  Availability,
} from "@/app/api/volunteer";
import { getCmsPageBySlug, CmsPage } from "@/app/api/cms";
import { getImageUrl } from "@/lib/image";

/* ──────────────────────────────────────────────
   DATA DEFAULTS
────────────────────────────────────────────── */
// No static VOLUNTEER_ROLES — all categories come from the API.

const ACTIVE_VOLUNTEERS = [
  {
    name: "Ananya Mishra",
    role: "Education Coordinator",
    since: "2018",
    hours: "2,400+",
    image: "",
    quote:
      "I started as a weekend tutor. Six years later, I design the curriculum for 8 centres. Seva India grows you as you grow it.",
  },
  {
    name: "Vikram Singh Rawat",
    role: "Field Operations",
    since: "2019",
    hours: "3,100+",
    image: "",
    quote:
      "I know every village road in Tehri district. The best part? The chai and stories at every home we visit.",
  },
  {
    name: "Amit Khanna",
    role: "Community Kitchen",
    since: "2019",
    hours: "1,800+",
    image: "",
    quote:
      "Every Sunday at 6 AM, I am at the kitchen. It is the most honest work I do all week. No meetings. Just meals.",
  },
  {
    name: "Priya Nair",
    role: "Health Camp Nurse",
    since: "2021",
    hours: "950+",
    image: "",
    quote:
      "I am a full-time nurse at Doon Hospital. Weekends, I am in villages with Seva India. Both jobs save lives.",
  },
  {
    name: "Rahul Bhandari",
    role: "Photography & Content",
    since: "2020",
    hours: "720+",
    image: "",
    quote:
      "I carry my camera to every camp. My photos have raised more money than any brochure ever could. Stories sell.",
  },
  {
    name: "Sunita Devi",
    role: "Parent Volunteer",
    since: "2022",
    hours: "480+",
    image: "",
    quote:
      "My daughter studies at the centre. Now I volunteer there too. It is our second home.",
  },
];

const IMPACT_NUMBERS = [
  { number: "200+", label: "Active Volunteers", sub: "Across Uttarakhand" },
  {
    number: "45,000+",
    label: "Hours Contributed",
    sub: "In the last 12 months",
  },
  {
    number: "12,000+",
    label: "Lives Touched",
    sub: "Through volunteer efforts",
  },
  {
    number: "8",
    label: "Cities Represented",
    sub: "Volunteers from across India",
  },
];

const FAQS = [
  {
    q: "Do I need to be from Dehradun to volunteer?",
    a: "Not at all. We have volunteers from Delhi, Mumbai, Bangalore, and even abroad who visit for week-long intensives. Remote roles like design, content, and tech are fully location-independent.",
  },
  {
    q: "How much time do I need to commit?",
    a: "As little as 2 hours a week or as much as full-time. Teaching roles need 4-6 hours weekly. Kitchen shifts are 2-3 hours. Health camps are full-day commitments. You choose what fits your life.",
  },
  {
    q: "Is there any training provided?",
    a: "Yes. Every volunteer attends a 2-hour orientation at our Rajpur Road office. Field roles get additional safety briefings. Teaching volunteers receive our curriculum guide and mentor support.",
  },
  {
    q: "Can I volunteer as a group or company?",
    a: "Absolutely. We regularly host corporate CSR days, college groups, and family volunteering weekends. Contact us at corporate@sevaindia.org for group bookings.",
  },
  {
    q: "Will I get a certificate?",
    a: "Yes. All volunteers receive a digital certificate after 20 hours of service. Long-term volunteers (6+ months) get a recommendation letter and are invited to our annual volunteer meet.",
  },
  {
    q: "What if I can only help remotely?",
    a: "We have plenty of remote roles — content writing, graphic design, social media, website maintenance, data entry, and fundraising. You can make a real impact from your laptop.",
  },
];

/* ────────────────────────── helpers ─────────────────────────── */
function SectionHeading({
  eyebrow,
  title,
  dark = false,
}: {
  eyebrow: string;
  title: string;
  dark?: boolean;
}) {
  return (
    <div className="text-center mb-12">
      <span
        className={`inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-3 ${dark ? "text-[#E8542A]" : "text-[#E8542A]"}`}
      >
        {eyebrow}
      </span>
      <h2
        className={`text-3xl sm:text-4xl font-semibold leading-tight ${dark ? "text-white" : "text-[#0f2347]"} max-w-2xl mx-auto`}
      >
        {title}
      </h2>
    </div>
  );
}

const COUNTRY_CODES = [
  { code: "+91", country: "IN", flag: "🇮🇳" },
  { code: "+1", country: "US/CA", flag: "🇺🇸" },
  { code: "+44", country: "UK", flag: "🇬🇧" },
  { code: "+971", country: "UAE", flag: "🇦🇪" },
  { code: "+61", country: "AU", flag: "🇦🇺" },
  { code: "+65", country: "SG", flag: "🇸🇬" },
  { code: "+49", country: "DE", flag: "🇩🇪" },
  { code: "+977", country: "NP", flag: "🇳🇵" },
  { code: "+33", country: "FR", flag: "🇫🇷" },
  { code: "+81", country: "JP", flag: "🇯🇵" },
  { code: "+966", country: "SA", flag: "🇸🇦" },
];

/* ─────────────────────────── page ───────────────────────────── */
export default function GetInvolvedPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [categories, setCategories] = useState<VolunteerCategory[]>([]);
  const [categoriesLoading, setCategoriesLoading] = useState(true);
  const [cmsPage, setCmsPage] = useState<CmsPage | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>("");
  const [selectedRole, setSelectedRole] = useState<string>("");
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    role: "",
    availability: "" as Availability | "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Only allow numbers, max 15 digits
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setPhoneNumber(onlyDigits);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow navigation and editing keys
    if (
      ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    // Block non-numeric keystrokes
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

  useEffect(() => {
    let active = true;
    const fetchCats = async () => {
      try {
        const res = await getPublicVolunteerCategories();
        if (active && res && res.length > 0) {
          setCategories(res);
          setSelectedCategoryId(res[0]._id);
          setSelectedRole(res[0].title);
          setFormData((prev) => ({ ...prev, role: res[0].title }));
        }
      } catch (err) {
        console.error("Error fetching volunteer categories:", err);
      } finally {
        if (active) setCategoriesLoading(false);
      }
    };

    const fetchCms = async () => {
      try {
        const page = await getCmsPageBySlug("get-involved");
        if (active && page) setCmsPage(page);
      } catch (err) {
        console.error("Error fetching CMS for get-involved:", err);
      }
    };

    fetchCats();
    fetchCms();

    return () => {
      active = false;
    };
  }, []);

  // When a role card is clicked, update state and scroll/react to the form
  const handleRoleSelect = (roleTitle: string, categoryId?: string) => {
    setSelectedRole(roleTitle);
    if (categoryId) setSelectedCategoryId(categoryId);
    setFormData((prev) => ({ ...prev, role: roleTitle }));
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!phoneNumber || phoneNumber.trim().length < 6) {
      setErrorMessage("Please enter a valid phone number (at least 6 digits).");
      return;
    }

    setIsSubmitting(true);

    try {
      // Find matching category ID from loaded categories or fallback
      let categoryIdToSend = selectedCategoryId;
      if (!categoryIdToSend && categories.length > 0) {
        const found = categories.find((c) => c.title.toLowerCase() === formData.role.toLowerCase());
        categoryIdToSend = found ? found._id : categories[0]._id;
      }

      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

      await createVolunteerApplication({
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        city: formData.city,
        category: categoryIdToSend,
        availability: formData.availability as Availability,
        message: formData.message,
      });

      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit volunteer application:", err);
      setErrorMessage(
        err?.response?.data?.message ||
          err?.message ||
          "Failed to submit application. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const heroTitle = cmsPage?.title || "Your time is the most valuable thing you can give";
  const heroSubtitle =
    cmsPage?.subtitle ||
    "We do not need your money. We need your hands, your mind, and your heart. Whether you have 2 hours or 2 years — there is a place for you here.";
  const heroBannerUrl = cmsPage?.bannerImage ? getImageUrl(cmsPage.bannerImage) : "";

  const impactNumbers =
    (cmsPage?.sections?.find((s) => s.key === "impact_numbers")?.items as typeof IMPACT_NUMBERS) ||
    IMPACT_NUMBERS;

  const faqs =
    (cmsPage?.sections?.find((s) => s.key === "faqs")?.items as typeof FAQS) || FAQS;

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[70vh] flex items-center overflow-hidden">
        <div className="absolute inset-0 bg-[#0B1120]">
          {heroBannerUrl ? (
            <img
              src={heroBannerUrl}
              alt="Volunteers working together in community"
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0f2347] via-[#102a5c] to-[#0B1120]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-r from-[#0f2347]/95 via-[#0f2347]/85 to-[#0f2347]/60" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8542A]/20 backdrop-blur-sm rounded-full text-[#E8542A] text-xs font-bold uppercase tracking-wider mb-6">
              <Heart size={14} fill="currentColor" />
              Join 200+ Volunteers Across India
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold text-white leading-[1.1] mb-6">
              {heroTitle}
            </h1>
            <p className="text-lg text-gray-300 leading-relaxed mb-8 max-w-lg">
              {heroSubtitle}
            </p>
            <div className="flex flex-wrap gap-4">
              <a
                href="#select-and-apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-colors shadow-xl shadow-orange-900/30"
              >
                Join as Volunteer
                <ArrowRight size={18} />
              </a>
              <a
                href="#select-and-apply"
                className="inline-flex items-center gap-2 px-7 py-3.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white font-bold rounded-xl transition-colors border border-white/20"
              >
                Explore Roles
                <ChevronDown size={18} />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Impact Numbers ── */}
      <section className="bg-[#0f2347] py-14 -mt-1">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {impactNumbers.map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-white mb-1">
                  {stat.number}
                </div>
                <div className="text-sm font-semibold text-gray-300 mb-0.5">
                  {stat.label}
                </div>
                <div className="text-xs text-gray-500">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>


      {/* ── Selection Part & Volunteer Form (Always Open) ── */}
      <section id="select-and-apply" className="py-16 sm:py-24 bg-white scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            
            {/* Left 7 Columns: Selection Part */}
            <div className="lg:col-span-7">
              <h2 className="text-3xl sm:text-4xl font-semibold text-[#0f2347] mb-3">
                Select Your <span className="text-[#E8542A]">Role</span>
              </h2>
              <p className="text-gray-500 text-sm sm:text-base mb-8 max-w-xl">
                Choose a volunteer role below to instantly select it in your application. One role is always active.
              </p>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {categoriesLoading ? (
                  // Loading skeleton — 8 placeholder cards
                  Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className="p-5 rounded-2xl border border-gray-100 bg-[#f8f9fc] animate-pulse"
                    >
                      <div className="w-10 h-10 rounded-xl bg-gray-200 mb-3" />
                      <div className="h-3 w-3/4 bg-gray-200 rounded mb-2" />
                      <div className="h-2 w-full bg-gray-100 rounded mb-1" />
                      <div className="h-2 w-5/6 bg-gray-100 rounded" />
                    </div>
                  ))
                ) : categories.length === 0 ? (
                  <p className="col-span-2 text-sm text-gray-400 text-center py-6">
                    No volunteer roles available right now. Please check back soon.
                  </p>
                ) : (
                  categories.map((cat) => {
                    const isSelected = selectedRole === cat.title;
                    return (
                      <button
                        key={cat._id}
                        type="button"
                        onClick={() => handleRoleSelect(cat.title, cat._id)}
                        className={`text-left p-5 rounded-2xl border transition-all duration-300 relative ${
                          isSelected
                            ? "border-[#E8542A] ring-1 ring-[#E8542A]/30 bg-orange-50/30 shadow-md"
                            : "border-gray-200 hover:border-gray-300 bg-[#f8f9fc]"
                        }`}
                      >
                        {isSelected && (
                          <CheckCircle2
                            size={18}
                            className="absolute top-4 right-4 text-[#E8542A]"
                          />
                        )}
                        <div
                          className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 overflow-hidden"
                          style={{ backgroundColor: (cat.color || "#E8542A") + "15" }}
                        >
                          {cat.icon ? (
                            <img
                              src={cat.icon}
                              alt=""
                              className="w-5 h-5 object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          ) : (
                            <HandHeart
                              size={20}
                              style={{ color: cat.color || "#E8542A" }}
                            />
                          )}
                        </div>
                        <p className="font-bold text-[#0f2347] text-sm mb-1">
                          {cat.title}
                        </p>
                        <p className="text-xs text-gray-500 leading-relaxed line-clamp-3">
                          {cat.description}
                        </p>
                      </button>
                    );
                  })
                )}
              </div>

              {/* Step info block */}
              <div className="bg-[#0f2347] rounded-2xl p-7 relative overflow-hidden">
                <Heart
                  size={90}
                  className="absolute -right-3 -bottom-3 text-white/5"
                  fill="currentColor"
                />
                <h3 className="text-white font-bold mb-4 relative">
                  Volunteer Journey
                </h3>
                <ul className="space-y-2.5 relative">
                  {[
                    "Step 1: Select your preferred role above",
                    "Step 2: Complete the application form on the right",
                    "Step 3: Attend orientation at our Rajpur Road office",
                    "Step 4: Get assigned to a centre and start serving",
                  ].map((item) => (
                    <li
                      key={item}
                      className="flex items-center gap-2 text-xs text-gray-300 font-semibold uppercase tracking-wider"
                    >
                      <CheckCircle2
                        size={15}
                        className="text-[#E8542A] flex-shrink-0"
                      />
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Right 5 Columns: Volunteer Application Form (Always Open) */}
            <div
              ref={formRef}
              className="lg:col-span-5 bg-[#f8f9fc] rounded-3xl p-6 sm:p-8 shadow-xl border border-gray-100 scroll-mt-8"
            >
              {submitted ? (
                <div className="text-center py-10">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mx-auto mb-5">
                    <CheckCircle2 size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-[#0f2347] mb-2">
                    Application Received!
                  </h3>
                  <p className="text-gray-500 text-sm leading-relaxed max-w-sm mx-auto">
                    Thank you for applying. We will reach out to you within 48 hours to discuss next steps.
                  </p>
                  <button
                    onClick={() => {
                      setSubmitted(false);
                      setPhoneNumber("");
                      setCountryCode("+91");
                      setFormData({
                        name: "",
                        email: "",
                        city: "",
                        role: selectedRole,
                        availability: "",
                        message: "",
                      });
                    }}
                    className="mt-6 px-6 py-2.5 bg-[#0f2347] text-white text-sm font-bold rounded-xl hover:bg-[#1a3a6b] transition-colors"
                  >
                    Submit Another Application
                  </button>
                </div>
              ) : (
                <>
                  <h2 className="text-2xl font-bold text-[#0f2347] mb-6">
                    Application <span className="text-[#E8542A]">Form</span>
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Selected Role Indicator */}
                    <div>
                      <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                        Selected Role
                      </label>
                      <div className="w-full px-4 py-3 bg-orange-50/50 border border-[#E8542A]/20 rounded-xl text-sm text-[#0f2347] font-semibold flex items-center justify-between">
                        <span className="text-[#E8542A]">{formData.role}</span>
                        <span className="text-[10px] text-gray-400 font-normal italic">Selected from left grid</span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          Full Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder="Your full name"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white placeholder:text-gray-300"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          Email Address *
                        </label>
                        <input
                          type="email"
                          required
                          value={formData.email}
                          onChange={(e) =>
                            setFormData({ ...formData, email: e.target.value })
                          }
                          placeholder="you@email.com"
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          Phone Number *
                        </label>
                        <div className="flex rounded-xl border border-gray-200 overflow-hidden focus-within:ring-2 focus-within:ring-[#1a3a6b]/20 focus-within:border-[#1a3a6b] bg-white">
                          <select
                            value={countryCode}
                            onChange={(e) => setCountryCode(e.target.value)}
                            className="px-2.5 py-3 bg-gray-50 border-r border-gray-200 text-xs sm:text-sm font-semibold text-[#0f2347] focus:outline-none cursor-pointer shrink-0"
                          >
                            {COUNTRY_CODES.map((c) => (
                              <option key={c.code + c.country} value={c.code}>
                                {c.flag} {c.code}
                              </option>
                            ))}
                          </select>
                          <input
                            type="tel"
                            inputMode="numeric"
                            pattern="[0-9]*"
                            required
                            value={phoneNumber}
                            onChange={handlePhoneChange}
                            onKeyDown={handlePhoneKeyDown}
                            placeholder="98765 43210"
                            className="w-full px-3.5 py-3 text-sm text-[#0f2347] focus:outline-none bg-white placeholder:text-gray-300"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          City / Town *
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) =>
                            setFormData({ ...formData, city: e.target.value })
                          }
                          placeholder="Dehradun, Delhi, etc."
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white placeholder:text-gray-300"
                        />
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          Preferred Role Dropdown
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedRole(val);
                            const found = categories.find((c) => c.title === val);
                            if (found) setSelectedCategoryId(found._id);
                            setFormData({ ...formData, role: val });
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
                        >
                          {categoriesLoading ? (
                            <option value="">Loading roles...</option>
                          ) : (
                            <>
                              {categories.map((cat) => (
                                <option key={cat._id} value={cat.title}>
                                  {cat.title}
                                </option>
                              ))}
                              <option value="Open to any role">Open to anything</option>
                            </>
                          )}
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          Availability *
                        </label>
                        <select
                          required
                          value={formData.availability}
                          onChange={(e) =>
                            setFormData({
                              ...formData,
                              availability: e.target.value as Availability,
                            })
                          }
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
                        >
                          <option value="">Select availability</option>
                          <option value="weekends">Weekends only</option>
                          <option value="weekdays">Weekdays only</option>
                          <option value="both">Both weekdays &amp; weekends</option>
                          <option value="flexible">Flexible / As needed</option>
                          <option value="fulltime">
                            Full-time (40+ hours/week)
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                        Why do you want to volunteer? (Optional)
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder="Tell us a bit about yourself, your skills, or what motivates you..."
                        className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] placeholder:text-gray-300 resize-none bg-white"
                      />
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 bg-red-50 border border-red-200 rounded-xl text-xs font-semibold text-red-600">
                        {errorMessage}
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full flex items-center justify-center gap-2 py-4 bg-[#E8542A] hover:bg-[#c9431d] disabled:opacity-60 text-white font-bold rounded-xl transition-colors shadow-lg shadow-orange-200 text-sm"
                    >
                      {isSubmitting ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Submitting Application...
                        </>
                      ) : (
                        <>
                          <Send size={16} />
                          Submit Application
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-gray-400">
                      By submitting, you agree to our volunteer terms. We will
                      never share your data.
                    </p>
                  </form>
                </>
              )}
            </div>

          </div>
        </div>
      </section>

      {/* ── Why Volunteer With Us ── */}
      <section className="py-20 sm:py-28 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
            <div>
              <SectionHeading
                eyebrow="Why Volunteer"
                title="This is not charity. This is community."
              />
              <div className="space-y-6">
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#E8542A]/10 flex items-center justify-center flex-shrink-0">
                    <MapPin size={22} className="text-[#E8542A]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0f2347] mb-1">
                      Work where you live
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      Our centres are in Dehradun, Rajpur, Jakhan, and
                      Dalanwala. serve your own neighbourhood.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#1a3a6b]/10 flex items-center justify-center flex-shrink-0">
                    <Clock size={22} className="text-[#1a3a6b]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0f2347] mb-1">
                      Flexible commitment
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      2 hours a week or 20. Weekends only or weekdays. We build around your schedule.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#059669]/10 flex items-center justify-center flex-shrink-0">
                    <Star size={22} className="text-[#059669]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0f2347] mb-1">
                      Real skills, real growth
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      The field teaches you what no classroom can.
                    </p>
                  </div>
                </div>
                <div className="flex gap-4">
                  <div className="w-12 h-12 rounded-xl bg-[#7c3aed]/10 flex items-center justify-center flex-shrink-0">
                    <Users size={22} className="text-[#7c3aed]" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-[#0f2347] mb-1">
                      A family, not an organisation
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      When you join Seva India, you join a family.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="relative">
              <div className="rounded-2xl overflow-hidden bg-gradient-to-br from-[#0f2347] to-[#1a3a6b] p-8 sm:p-12 text-white min-h-[400px] flex flex-col justify-between border border-white/10 shadow-xl">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#E8542A]/20 text-[#E8542A] text-xs font-bold uppercase tracking-wider mb-4">
                    Community Movement
                  </div>
                  <h3 className="text-2xl sm:text-3xl font-bold leading-tight mb-4">
                    Hands joined together in service of Uttarakhand.
                  </h3>
                  <p className="text-gray-300 text-sm leading-relaxed max-w-sm">
                    From college classrooms to medical camps, our volunteers are the living, breathing heart of every initiative.
                  </p>
                </div>
                <div className="flex items-center gap-4 pt-6 border-t border-white/10">
                  <div className="w-11 h-11 rounded-xl bg-[#E8542A] flex items-center justify-center text-white font-bold text-sm">
                    SIF
                  </div>
                  <div>
                    <p className="font-bold text-sm">Seva India Collective</p>
                    <p className="text-xs text-gray-400">Join our next ground initiative</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-5 max-w-[260px] border border-gray-100">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-full bg-[#E8542A]/10 flex items-center justify-center">
                    <Sparkles size={20} className="text-[#E8542A]" />
                  </div>
                  <div>
                    <p className="text-xl font-bold text-[#0f2347]">200+</p>
                    <p className="text-xs text-gray-500">Active Volunteers</p>
                  </div>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed">
                  From students to retirees, doctors to designers — everyone has something to give.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Active Volunteers ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Our People"
            title="Meet the volunteers who keep us running"
          />

          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {ACTIVE_VOLUNTEERS.map((v, i) => {
              const avatar = v.image ? getImageUrl(v.image) : "";
              return (
                <div
                  key={i}
                  className="group bg-[#f8f9fc] rounded-2xl overflow-hidden border border-gray-100 hover:border-[#E8542A]/20 hover:shadow-lg transition-all"
                >
                  <div className="relative h-44 bg-gradient-to-br from-[#0f2347] to-[#1a3a6b] flex items-center justify-center overflow-hidden">
                    {avatar ? (
                      <img
                        src={avatar}
                        alt={v.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-center p-4">
                        <div className="w-14 h-14 rounded-full bg-white/10 border border-white/20 flex items-center justify-center text-white mb-2 font-bold text-lg">
                          {v.name.split(" ").map((n) => n[0]).join("")}
                        </div>
                        <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                          Volunteer
                        </span>
                      </div>
                    )}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4">
                      <p className="text-white font-bold text-base">{v.name}</p>
                      <p className="text-white/80 text-xs">{v.role}</p>
                    </div>
                  </div>
                  <div className="p-5">
                    <div className="flex items-center gap-4 mb-3 text-xs text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        Since {v.since}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock size={12} />
                        {v.hours} hours
                      </span>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed italic">
                      &ldquo;{v.quote}&rdquo;
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section className="py-20 sm:py-28 bg-[#f8f9fc]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Questions"
            title="Everything you need to know"
          />

          <div className="space-y-3">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="bg-white rounded-xl border border-gray-100 overflow-hidden"
              >
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between px-6 py-5 text-left"
                >
                  <span className="text-sm font-bold text-[#0f2347] pr-4">
                    {faq.q}
                  </span>
                  {openFaq === i ? (
                    <ChevronUp
                      size={18}
                      className="text-[#E8542A] flex-shrink-0"
                    />
                  ) : (
                    <ChevronDown
                      size={18}
                      className="text-gray-400 flex-shrink-0"
                    />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-sm text-gray-500 leading-relaxed border-t border-gray-50 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="py-20 sm:py-28 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-[#E8542A]/10 rounded-full text-[#E8542A] text-xs font-bold uppercase tracking-wider mb-6">
            <HandHeart size={14} />
            Not Ready to Volunteer?
          </div>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#0f2347] mb-6 leading-tight">
            You can still make a difference
          </h2>
          <p className="text-gray-500 text-lg mb-10 max-w-2xl mx-auto">
            If you cannot give time right now, consider donating to support our
            volunteers on the ground. Every rupee helps us feed a child, run a
            camp, or keep a centre open.
          </p>
          <div className="flex flex-wrap justify-center gap-4">
            <a
              href="/donate"
              className="inline-flex items-center gap-2 px-8 py-4 bg-[#E8542A] hover:bg-[#c9431d] text-white font-bold rounded-xl transition-colors shadow-xl shadow-orange-200"
            >
              <Heart size={20} />
              Donate Instead
            </a>
            <a
              href="/our-work"
              className="inline-flex items-center gap-2 px-8 py-4 bg-white hover:bg-gray-50 text-[#0f2347] font-bold rounded-xl transition-colors border border-gray-200"
            >
              <ArrowRight size={20} />
              Explore Our Work
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}