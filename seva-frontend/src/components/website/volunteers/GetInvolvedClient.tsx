"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  CheckCircle2,
  Clock,
  MapPin,
  Star,
  ChevronDown,
  ChevronUp,
  Send,
  Loader2,
  HandHeart,
  Sparkles,
  Briefcase,
} from "lucide-react";
import {
  createVolunteerApplication,
  VolunteerCategory,
  Availability,
  FormType,
} from "@/app/api/volunteer";

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
        className={`inline-block text-[11px] font-bold uppercase tracking-[0.2em] mb-3 ${
          dark ? "text-[#E8542A]" : "text-[#E8542A]"
        }`}
      >
        {eyebrow}
      </span>
      <h2
        className={`text-3xl sm:text-4xl font-semibold leading-tight ${
          dark ? "text-white" : "text-[#0f2347]"
        } max-w-2xl mx-auto`}
      >
        {title}
      </h2>
    </div>
  );
}

interface GetInvolvedClientProps {
  categories: VolunteerCategory[];
  faqs: { q: string; a: string }[];
}

export default function GetInvolvedClient({
  categories,
  faqs,
}: GetInvolvedClientProps) {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") || searchParams.get("tab") || searchParams.get("formType");
  const initialType: FormType =
    urlType === "corporate" ? "corporate" : urlType === "career" || urlType === "careers" ? "career" : "volunteer";

  const [activeFormType, setActiveFormType] = useState<FormType>(initialType);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const filteredCategories = categories.filter(
    (c) => (c.formType || "volunteer") === activeFormType
  );

  const initialCat = filteredCategories[0] || categories[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCat?._id || ""
  );
  const [selectedRole, setSelectedRole] = useState<string>(
    initialCat?.title || (initialType === "corporate" ? "CSR Partnership" : initialType === "career" ? "Career Opportunity" : "General Volunteer Support")
  );
  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    city: "",
    role: initialCat?.title || (initialType === "corporate" ? "CSR Partnership" : initialType === "career" ? "Career Opportunity" : "General Volunteer Support"),
    availability: "" as Availability | "",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);

  const formRef = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (type: FormType) => {
    setActiveFormType(type);
    const newFiltered = categories.filter((c) => (c.formType || "volunteer") === type);
    const firstNew = newFiltered[0];
    if (firstNew) {
      setSelectedCategoryId(firstNew._id);
      setSelectedRole(firstNew.title);
      setFormData((prev) => ({ ...prev, role: firstNew.title }));
    } else {
      setSelectedCategoryId("");
      const fallbackRole =
        type === "corporate"
          ? "CSR Partnership"
          : type === "career"
          ? "Career Opportunity"
          : "Volunteer Support";
      setSelectedRole(fallbackRole);
      setFormData((prev) => ({
        ...prev,
        role: fallbackRole,
      }));
    }
  };

  useEffect(() => {
    if (urlType) {
      const target: FormType =
        urlType === "corporate"
          ? "corporate"
          : urlType === "career" || urlType === "careers"
          ? "career"
          : "volunteer";
      handleTabChange(target);
    }
  }, [urlType]);

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, 15);
    setPhoneNumber(onlyDigits);
  };

  const handlePhoneKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (
      ["Backspace", "Tab", "Delete", "ArrowLeft", "ArrowRight", "Enter"].includes(e.key) ||
      e.ctrlKey ||
      e.metaKey
    ) {
      return;
    }
    if (!/^[0-9]$/.test(e.key)) {
      e.preventDefault();
    }
  };

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
      let categoryIdToSend = selectedCategoryId;
      if (!categoryIdToSend && filteredCategories.length > 0) {
        const found = filteredCategories.find(
          (c) => c.title.toLowerCase() === formData.role.toLowerCase()
        );
        categoryIdToSend = found ? found._id : filteredCategories[0]._id;
      }

      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

      await createVolunteerApplication({
        formType: activeFormType,
        name: formData.name,
        email: formData.email,
        phone: fullPhone,
        city: formData.city,
        category: categoryIdToSend || undefined,
        availability: (formData.availability as Availability) || "flexible",
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

  return (
    <>
      {/* ── Selection Part & Volunteer Form (Always Open) ── */}
      <section id="select-and-apply" className="py-16 sm:py-24 bg-white scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-12 lg:gap-16 items-start">
            {/* Left 7 Columns: Selection Part */}
            <div className="lg:col-span-7">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-3xl sm:text-4xl font-semibold text-[#0f2347]">
                    Select Your <span className="text-[#E8542A]">Role</span>
                  </h2>
                  <p className="text-gray-500 text-sm mt-1">
                    Choose a role below to instantly auto-fill your application.
                  </p>
                </div>
              </div>

              {/* Form Type Tabs: Volunteer vs Corporate vs Careers */}
              <div className="inline-flex flex-wrap p-1 bg-slate-100 rounded-2xl border border-slate-200/80 mb-6 gap-1">
                <button
                  type="button"
                  onClick={() => handleTabChange("volunteer")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeFormType === "volunteer"
                      ? "bg-white text-[#0f2347] shadow-sm"
                      : "text-gray-500 hover:text-[#0f2347]"
                  }`}
                >
                  <HandHeart size={15} className={activeFormType === "volunteer" ? "text-[#E8542A]" : ""} />
                  <span>Volunteers</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("corporate")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeFormType === "corporate"
                      ? "bg-white text-[#0f2347] shadow-sm"
                      : "text-gray-500 hover:text-[#0f2347]"
                  }`}
                >
                  <Sparkles size={15} className={activeFormType === "corporate" ? "text-[#E8542A]" : ""} />
                  <span>Corporate & CSR</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleTabChange("career")}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                    activeFormType === "career"
                      ? "bg-white text-[#0f2347] shadow-sm"
                      : "text-gray-500 hover:text-[#0f2347]"
                  }`}
                >
                  <Briefcase size={15} className={activeFormType === "career" ? "text-[#E8542A]" : ""} />
                  <span>Careers & Fellowships</span>
                </button>
              </div>

              <div className="grid sm:grid-cols-2 gap-4 mb-8">
                {filteredCategories.length === 0 ? (
                  <div className="col-span-2 text-center py-10 bg-slate-50 border border-dashed border-slate-200 rounded-2xl p-6">
                    <p className="text-sm font-semibold text-[#0f2347] mb-1">
                      {activeFormType === "corporate"
                        ? "Corporate CSR Opportunities"
                        : activeFormType === "career"
                        ? "Open Career & Fellowship Positions"
                        : "Volunteer Opportunities"}
                    </p>
                    <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4">
                      {activeFormType === "corporate"
                        ? "We welcome customized corporate CSR partnerships, employee giving, and skill-based sponsorships."
                        : activeFormType === "career"
                        ? "Explore full-time, part-time, and fellowship opportunities to build a meaningful career in grassroots social change."
                        : "We are always welcoming enthusiastic individuals. Please submit your application using the form."}
                    </p>
                    <button
                      type="button"
                      onClick={() =>
                        handleRoleSelect(
                          activeFormType === "corporate"
                            ? "Corporate CSR Partnership"
                            : activeFormType === "career"
                            ? "General Career Opportunity"
                            : "General Volunteer Support"
                        )
                      }
                      className="px-4 py-2 bg-[#0f2347] text-white text-xs font-bold rounded-xl hover:bg-[#1a3a6b] transition-colors"
                    >
                      Select General {activeFormType === "corporate" ? "Corporate" : activeFormType === "career" ? "Career" : "Volunteer"} Role
                    </button>
                  </div>
                ) : (
                  filteredCategories.map((cat) => {
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
                            <Image
                              src={cat.icon}
                              alt={cat.title || ""}
                              width={20}
                              height={20}
                              className="w-5 h-5 object-contain"
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
                  {activeFormType === "corporate" ? "CSR Partnership Journey" : "Volunteer Journey"}
                </h3>
                <ul className="space-y-2.5 relative">
                  {[
                    "Step 1: Select your preferred role or initiative above",
                    "Step 2: Complete the application form on the right",
                    "Step 3: Connect with our coordinator for induction / CSR proposal",
                    "Step 4: Create real, grassroots social impact together",
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

            {/* Right 5 Columns: Volunteer Application Form */}
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
                    Thank you for reaching out. Our team will contact you within 48 hours to coordinate next steps.
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
                    {activeFormType === "corporate" ? "CSR Partner" : "Volunteer"}{" "}
                    <span className="text-[#E8542A]">Application</span>
                  </h2>
                  <form onSubmit={handleSubmit} className="space-y-5">
                    <div>
                      <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                        Selected Role / Purpose
                      </label>
                      <div className="w-full px-4 py-3 bg-orange-50/50 border border-[#E8542A]/20 rounded-xl text-sm text-[#0f2347] font-semibold flex items-center justify-between">
                        <span className="text-[#E8542A]">{formData.role}</span>
                        <span className="text-[10px] text-gray-400 font-normal italic">
                          Selected role
                        </span>
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-5">
                      <div>
                        <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                          {activeFormType === "corporate" ? "Contact Person / Org *" : "Full Name *"}
                        </label>
                        <input
                          type="text"
                          required
                          value={formData.name}
                          onChange={(e) =>
                            setFormData({ ...formData, name: e.target.value })
                          }
                          placeholder={activeFormType === "corporate" ? "e.g. Acme Corp / Rahul" : "Your full name"}
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
                          City / Location *
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
                          Role Dropdown
                        </label>
                        <select
                          value={formData.role}
                          onChange={(e) => {
                            const val = e.target.value;
                            setSelectedRole(val);
                            const found = filteredCategories.find((c) => c.title === val);
                            if (found) setSelectedCategoryId(found._id);
                            setFormData({ ...formData, role: val });
                          }}
                          className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-[#0f2347] focus:outline-none focus:ring-2 focus:ring-[#1a3a6b]/20 focus:border-[#1a3a6b] bg-white"
                        >
                          {filteredCategories.map((cat) => (
                            <option key={cat._id} value={cat.title}>
                              {cat.title}
                            </option>
                          ))}
                          <option value={activeFormType === "corporate" ? "General CSR Partnership" : "Open to any role"}>
                            {activeFormType === "corporate" ? "General CSR Partnership" : "Open to any role"}
                          </option>
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
                          <option value="flexible">Flexible / Project based</option>
                          <option value="fulltime">
                            Full-time / Active partnership
                          </option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                        {activeFormType === "corporate"
                          ? "Partnership Details / Message (Optional)"
                          : "Why do you want to volunteer? (Optional)"}
                      </label>
                      <textarea
                        rows={4}
                        value={formData.message}
                        onChange={(e) =>
                          setFormData({ ...formData, message: e.target.value })
                        }
                        placeholder={
                          activeFormType === "corporate"
                            ? "Tell us about your organization, CSR focus areas, or proposed initiatives..."
                            : "Tell us a bit about yourself, your skills, or what motivates you..."
                        }
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
                          Submit {activeFormType === "corporate" ? "CSR Proposal" : "Application"}
                        </>
                      )}
                    </button>

                    <p className="text-[11px] text-center text-gray-400">
                      By submitting, you agree to our terms. We will never share your data.
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
                      Our centres are in Dehradun, Rajpur, Jakhan, and Dalanwala. Serve your own neighbourhood.
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
                      The field teaches you leadership, empathy, and community coordination.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Volunteer Cards Carousel/Grid */}
            <div className="grid sm:grid-cols-2 gap-4">
              {ACTIVE_VOLUNTEERS.slice(0, 4).map((v, i) => (
                <div
                  key={i}
                  className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm space-y-3"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#E8542A]/10 text-[#E8542A] flex items-center justify-center font-bold text-sm">
                      {v.name[0]}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-[#0f2347]">{v.name}</p>
                      <p className="text-[11px] text-gray-400">{v.role}</p>
                    </div>
                  </div>
                  <p className="text-xs text-gray-600 italic leading-relaxed">
                    &ldquo;{v.quote}&rdquo;
                  </p>
                  <div className="text-[10px] text-[#E8542A] font-bold">
                    {v.hours} served · since {v.since}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FAQ Section ── */}
      <section className="py-16 sm:py-20 bg-white border-t border-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <SectionHeading eyebrow="Frequently Asked Questions" title="Volunteer FAQs" />
          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <div
                key={i}
                className="border border-gray-100 rounded-2xl overflow-hidden transition-colors"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left font-semibold text-sm sm:text-base text-[#0f2347] hover:bg-gray-50/80 transition-colors"
                >
                  <span>{faq.q}</span>
                  {openFaq === i ? (
                    <ChevronUp size={18} className="text-gray-400 shrink-0 ml-2" />
                  ) : (
                    <ChevronDown size={18} className="text-gray-400 shrink-0 ml-2" />
                  )}
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-1 text-sm text-gray-600 leading-relaxed border-t border-gray-50 whitespace-pre-line">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
