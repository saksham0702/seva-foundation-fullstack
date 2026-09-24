"use client";

import React, { useState, useRef, useEffect } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import {
  Heart,
  CheckCircle2,
  Clock,
  MapPin,
  Send,
  Loader2,
  HandHeart,
  Sparkles,
  Briefcase,
  Gift,
  Target,
  Users,
  BarChart3,
  Globe,
  Star,
  Calendar,
  Building2,
  FileText,
  Link as LinkIcon,
  HelpCircle,
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
    quote:
      "I started as a weekend tutor. Six years later, I design the curriculum for 8 centres. Seva India grows you as you grow it.",
  },
  {
    name: "Vikram Singh Rawat",
    role: "Field Operations",
    since: "2019",
    hours: "3,100+",
    quote:
      "I know every village road in Tehri district. The best part? The chai and stories at every home we visit.",
  },
  {
    name: "Amit Khanna",
    role: "Community Kitchen",
    since: "2019",
    hours: "1,800+",
    quote:
      "Every Sunday at 6 AM, I am at the kitchen. It is the most honest work I do all week. No meetings. Just meals.",
  },
  {
    name: "Priya Nair",
    role: "Health Camp Nurse",
    since: "2021",
    hours: "950+",
    quote:
      "I am a full-time nurse at Doon Hospital. Weekends, I am in villages with Seva India. Both jobs save lives.",
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
];

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
  
  const resolveInitialType = (val: string | null): FormType => {
    if (val === "corporate" || val === "csr") return "corporate";
    if (val === "career" || val === "careers" || val === "jobs") return "career";
    if (val === "support" || val === "give" || val === "donate") return "support";
    return "volunteer";
  };

  const [activeFormType, setActiveFormType] = useState<FormType>(resolveInitialType(urlType));
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Filter categories by formType
  const filteredCategories = categories.filter(
    (c) => (c.formType || "volunteer") === activeFormType
  );

  const defaultCategoryTitle =
    activeFormType === "corporate"
      ? "CSR PROJECTS"
      : activeFormType === "career"
      ? "PROGRAM MANAGER"
      : activeFormType === "support"
      ? "SPONSORSHIP"
      : "GENERAL SUPPORT";

  const initialCat = filteredCategories[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCat?._id || ""
  );
  const [selectedRole, setSelectedRole] = useState<string>(
    initialCat?.title || defaultCategoryTitle
  );

  const [countryCode, setCountryCode] = useState("+91");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);

  // Form State covering all 4 types
  const [formData, setFormData] = useState({
    // Common
    name: "",
    email: "",
    message: "",

    // Corporate specific
    companyName: "",
    contactPerson: "",
    industry: "",
    partnershipType: "Financial Support",
    csrFocusAreas: "",
    partnershipGoals: "",

    // Volunteer specific
    availability: "Flexible" as Availability | "Flexible",
    skills: "",
    previousExperience: "",
    reason: "",

    // Career specific
    positionAppliedFor: "",
    currentLocation: "",
    resumeUrl: "",
    coverLetter: "",

    // Support specific
    supportType: "One-time Donation",
    address: "",
  });

  const formRef = useRef<HTMLDivElement | null>(null);

  const handleTabChange = (type: FormType) => {
    setActiveFormType(type);
    setSubmitted(false);
    setErrorMessage(null);

    const newFiltered = categories.filter((c) => (c.formType || "volunteer") === type);
    const firstNew = newFiltered[0];
    if (firstNew) {
      setSelectedCategoryId(firstNew._id);
      setSelectedRole(firstNew.title);
      if (type === "career") {
        setFormData((prev) => ({ ...prev, positionAppliedFor: firstNew.title }));
      }
    } else {
      setSelectedCategoryId("");
      const fallback =
        type === "corporate"
          ? "CSR PROJECTS"
          : type === "career"
          ? "PROGRAM MANAGER"
          : type === "support"
          ? "SPONSORSHIP"
          : "GENERAL SUPPORT";
      setSelectedRole(fallback);
      if (type === "career") {
        setFormData((prev) => ({ ...prev, positionAppliedFor: fallback }));
      }
    }
  };

  useEffect(() => {
    if (urlType) {
      handleTabChange(resolveInitialType(urlType));
    }
  }, [urlType]);

  const maxPhoneDigits = countryCode === "+91" ? 10 : 12;

  const handleCountryCodeChange = (newCode: string) => {
    setCountryCode(newCode);
    const maxDigits = newCode === "+91" ? 10 : 12;
    if (phoneNumber.length > maxDigits) {
      setPhoneNumber(phoneNumber.slice(0, maxDigits));
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const onlyDigits = e.target.value.replace(/\D/g, "").slice(0, maxPhoneDigits);
    setPhoneNumber(onlyDigits);
  };

  const handleCategoryClick = (title: string, categoryId?: string) => {
    setSelectedRole(title);
    if (categoryId) setSelectedCategoryId(categoryId);
    if (activeFormType === "career") {
      setFormData((prev) => ({ ...prev, positionAppliedFor: title }));
    }
    formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const minDigits = countryCode === "+91" ? 10 : 7;
    if (!phoneNumber || phoneNumber.trim().length < minDigits) {
      setErrorMessage(
        countryCode === "+91"
          ? "Please enter a valid 10-digit mobile number."
          : "Please enter a valid phone number (at least 7 digits)."
      );
      return;
    }

    setIsSubmitting(true);

    try {
      let categoryIdToSend = selectedCategoryId;
      if (!categoryIdToSend && filteredCategories.length > 0) {
        const found = filteredCategories.find(
          (c) => c.title.toLowerCase() === selectedRole.toLowerCase()
        );
        categoryIdToSend = found ? found._id : filteredCategories[0]._id;
      }

      const fullPhone = `${countryCode} ${phoneNumber.trim()}`;

      // Build payload based on formType
      const payload: any = {
        formType: activeFormType,
        name: activeFormType === "corporate" ? (formData.contactPerson || formData.companyName || formData.name) : formData.name,
        email: formData.email,
        phone: fullPhone,
        selectedAreaTitle: selectedRole,
        category: categoryIdToSend || undefined,
        message: formData.message || formData.partnershipGoals || formData.coverLetter || formData.reason,
      };

      if (activeFormType === "corporate") {
        payload.companyName = formData.companyName;
        payload.contactPerson = formData.contactPerson;
        payload.industry = formData.industry;
        payload.partnershipType = formData.partnershipType;
        payload.csrFocusAreas = formData.csrFocusAreas;
        payload.partnershipGoals = formData.partnershipGoals;
      } else if (activeFormType === "volunteer") {
        payload.availability = (formData.availability.toLowerCase() as Availability) || "flexible";
        payload.skills = formData.skills;
        payload.previousExperience = formData.previousExperience;
        payload.reason = formData.reason;
      } else if (activeFormType === "career") {
        payload.positionAppliedFor = formData.positionAppliedFor || selectedRole;
        payload.currentLocation = formData.currentLocation;
        payload.resumeUrl = formData.resumeUrl;
        payload.coverLetter = formData.coverLetter;
      } else if (activeFormType === "support") {
        payload.supportType = formData.supportType;
        payload.address = formData.address;
      }

      await createVolunteerApplication(payload);
      setSubmitted(true);
    } catch (err: any) {
      console.error("Failed to submit application:", err);
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
      {/* ── Selection Part & Interactive Forms ── */}
      <section id="select-and-apply" className="py-16 sm:py-24 bg-white scroll-mt-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* ======================================================== */}
            {/* LEFT 6 COLUMNS: DYNAMIC BENEFIT / CATEGORY CARDS         */}
            {/* ======================================================== */}
            <div className="lg:col-span-6 space-y-8">
              
              {/* TAB 1: CORPORATE */}
              {activeFormType === "corporate" && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347] tracking-tight uppercase">
                      PARTNER FOR <span className="text-[#4169E1]">IMPACT</span>
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3 max-w-lg">
                      We offer strategic, long-term partnership opportunities that align with your CSR goals and provide measurable social impact.
                    </p>
                  </div>

                  {/* 4 Feature Cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "CSR PROJECTS",
                        desc: "Direct implementation of high-impact social projects.",
                        icon: Target,
                        id: "csr-projects",
                      },
                      {
                        title: "EMPLOYEE ENGAGEMENT",
                        desc: "Volunteer programs for your workforce.",
                        icon: HandHeart,
                        id: "employee-engagement",
                      },
                      {
                        title: "IMPACT REPORTING",
                        desc: "Detailed data-driven reports for your CSR compliance.",
                        icon: BarChart3,
                        id: "impact-reporting",
                      },
                      {
                        title: "GLOBAL STANDARDS",
                        desc: "Projects aligned with UN Sustainable Development Goals.",
                        icon: Globe,
                        id: "global-standards",
                      },
                    ].map((item) => {
                      const matchedCat = filteredCategories.find(
                        (c) => c.title.toUpperCase() === item.title
                      );
                      const isSelected = selectedRole.toUpperCase() === item.title;
                      const IconComponent = item.icon;

                      return (
                        <div
                          key={item.title}
                          onClick={() => handleCategoryClick(item.title, matchedCat?._id)}
                          className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer relative flex flex-col justify-between ${
                            isSelected
                              ? "bg-blue-50/50 border-[#4169E1] ring-2 ring-[#4169E1]/20 shadow-md scale-[1.02]"
                              : "bg-slate-50/60 border-slate-100 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div>
                            <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-[#4169E1] mb-4">
                              <IconComponent size={24} />
                            </div>
                            <h3 className="font-serif font-bold text-sm text-[#0f2347] tracking-wider uppercase mb-1.5">
                              {item.title}
                            </h3>
                            <p className="text-xs text-slate-500 leading-relaxed">
                              {matchedCat?.description || item.desc}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-[#4169E1] uppercase tracking-wider mt-3">
                              <CheckCircle2 size={12} /> Selected for Inquiry
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {/* TAB 2: VOLUNTEER */}
              {activeFormType === "volunteer" && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347] tracking-tight uppercase">
                      VOLUNTEER WITH <span className="text-[#E8542A]">SEVA</span>
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3 max-w-lg">
                      Volunteering with Seva India Foundation is a rewarding experience that allows you to contribute directly to social change while building new skills.
                    </p>
                  </div>

                  {/* 4 Cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "DIRECT IMPACT",
                        desc: "Work directly with communities on the ground.",
                        icon: Heart,
                      },
                      {
                        title: "SKILL SHARING",
                        desc: "Use your professional skills for social good.",
                        icon: Target,
                      },
                      {
                        title: "COMMUNITY",
                        desc: "Join a network of like-minded change-makers.",
                        icon: Users,
                      },
                      {
                        title: "FLEXIBLE",
                        desc: "Choose opportunities that fit your schedule.",
                        icon: Clock,
                      },
                    ].map((item) => {
                      const isSelected = selectedRole.toUpperCase() === item.title;
                      const IconComponent = item.icon;
                      const matchedCat = filteredCategories.find(
                        (c) => c.title.toUpperCase() === item.title
                      );

                      return (
                        <div
                          key={item.title}
                          onClick={() => handleCategoryClick(item.title, matchedCat?._id)}
                          className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-orange-50/50 border-[#E8542A] ring-2 ring-[#E8542A]/20 shadow-md scale-[1.02]"
                              : "bg-slate-50/60 border-slate-100 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-[#E8542A] mb-4">
                            <IconComponent size={24} />
                          </div>
                          <h3 className="font-serif font-bold text-sm text-[#0f2347] tracking-wider uppercase mb-1.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Volunteer Benefits Banner */}
                  <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                    <Heart size={120} className="absolute -right-6 -bottom-6 text-white/5" fill="currentColor" />
                    <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                      VOLUNTEER BENEFITS
                    </h4>
                    <div className="space-y-3">
                      {[
                        "CERTIFICATE OF APPRECIATION",
                        "HANDS-ON EXPERIENCE IN SOCIAL WORK",
                        "NETWORKING WITH INDUSTRY PROFESSIONALS",
                      ].map((benefit) => (
                        <div key={benefit} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#E8542A]/20 border border-[#E8542A]/40 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={13} className="text-[#E8542A]" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                            {benefit}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 3: CAREERS */}
              {activeFormType === "career" && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347] tracking-tight uppercase">
                      JOIN OUR <span className="text-[#4169E1]">TEAM</span>
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3 max-w-lg">
                      We are looking for passionate, driven, and skilled professionals who want to use their talents to solve some of India&apos;s most pressing social challenges.
                    </p>
                  </div>

                  {/* Job List Cards */}
                  <div className="space-y-3.5">
                    {(filteredCategories.length > 0
                      ? filteredCategories
                      : [
                          {
                            _id: "1",
                            title: "PROGRAM MANAGER",
                            badge: "MULTIPLE LOCATIONS • FULL-TIME",
                            description: "Lead grassroots community programs and manage team operations.",
                          },
                          {
                            _id: "2",
                            title: "FUNDRAISING LEAD",
                            badge: "DELHI / REMOTE • FULL-TIME",
                            description: "Drive corporate partnerships and donor relations.",
                          },
                          {
                            _id: "3",
                            title: "COMMUNICATIONS OFFICER",
                            badge: "DELHI / NCR • FULL-TIME",
                            description: "Manage storytelling, press relations, and digital campaigns.",
                          },
                        ]
                    ).map((job) => {
                      const isSelected = selectedRole.toUpperCase() === job.title.toUpperCase();

                      return (
                        <div
                          key={job._id || job.title}
                          onClick={() => handleCategoryClick(job.title, job._id)}
                          className={`p-5 sm:p-6 rounded-3xl border transition-all duration-300 cursor-pointer flex items-center justify-between ${
                            isSelected
                              ? "bg-amber-50/50 border-[#F5A623] ring-2 ring-[#F5A623]/20 shadow-md scale-[1.01]"
                              : "bg-slate-50/60 border-slate-100 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div>
                            <h3 className="font-serif font-bold text-sm sm:text-base text-[#0f2347] tracking-wider uppercase mb-1">
                              {job.title}
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-500 font-medium">
                              <MapPin size={13} className="text-[#4169E1]" />
                              <span>{job.badge || "DELHI / HYBRID • FULL-TIME"}</span>
                            </div>
                          </div>
                          <div className="w-10 h-10 rounded-2xl bg-amber-100/60 flex items-center justify-center text-[#F5A623] shrink-0">
                            <Briefcase size={20} />
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Why Seva India Banner */}
                  <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                    <Sparkles size={120} className="absolute -right-6 -bottom-6 text-white/5" />
                    <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                      WHY SEVA INDIA?
                    </h4>
                    <div className="space-y-3">
                      {[
                        "MEANINGFUL AND IMPACTFUL WORK",
                        "COLLABORATIVE AND INCLUSIVE CULTURE",
                        "PROFESSIONAL GROWTH AND LEARNING",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#E8542A]/20 border border-[#E8542A]/40 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={13} className="text-[#E8542A]" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* TAB 4: WAYS TO GIVE / SUPPORT */}
              {activeFormType === "support" && (
                <>
                  <div>
                    <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347] tracking-tight uppercase">
                      WAYS TO <span className="text-[#4169E1]">GIVE</span>
                    </h2>
                    <p className="text-slate-600 text-sm sm:text-base leading-relaxed mt-3 max-w-lg">
                      Every contribution, no matter the size, helps us reach one more person in need. Choose the way that suits you best.
                    </p>
                  </div>

                  {/* 4 Cards */}
                  <div className="grid sm:grid-cols-2 gap-4">
                    {[
                      {
                        title: "SPONSORSHIP",
                        desc: "Support a child's education or an elder's care.",
                        icon: Star,
                      },
                      {
                        title: "MONTHLY GIVING",
                        desc: "Provide consistent support for our long-term projects.",
                        icon: Calendar,
                      },
                      {
                        title: "ONE-TIME GIFT",
                        desc: "Make an immediate impact where it's needed most.",
                        icon: Gift,
                      },
                      {
                        title: "LEGACY GIVING",
                        desc: "Create a lasting impact for future generations.",
                        icon: Heart,
                      },
                    ].map((item) => {
                      const isSelected = selectedRole.toUpperCase() === item.title;
                      const IconComponent = item.icon;
                      const matchedCat = filteredCategories.find(
                        (c) => c.title.toUpperCase() === item.title
                      );

                      return (
                        <div
                          key={item.title}
                          onClick={() => handleCategoryClick(item.title, matchedCat?._id)}
                          className={`p-6 rounded-3xl border transition-all duration-300 cursor-pointer ${
                            isSelected
                              ? "bg-orange-50/50 border-[#F5A623] ring-2 ring-[#F5A623]/20 shadow-md scale-[1.02]"
                              : "bg-slate-50/60 border-slate-100 hover:border-slate-200 hover:bg-white"
                          }`}
                        >
                          <div className="w-12 h-12 rounded-2xl bg-white shadow-xs border border-slate-100 flex items-center justify-center text-[#4169E1] mb-4">
                            <IconComponent size={24} />
                          </div>
                          <h3 className="font-serif font-bold text-sm text-[#0f2347] tracking-wider uppercase mb-1.5">
                            {item.title}
                          </h3>
                          <p className="text-xs text-slate-500 leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      );
                    })}
                  </div>

                  {/* Why Support Us Banner */}
                  <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                    <Gift size={120} className="absolute -right-6 -bottom-6 text-white/5" />
                    <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                      WHY SUPPORT US?
                    </h4>
                    <div className="space-y-3">
                      {[
                        "100% TRANSPARENCY & AUDITED ANNUAL REPORTS",
                        "80G & 12A TAX EXEMPTION CERTIFICATES AVAILABLE",
                        "DIRECT GRASSROOTS SOCIAL & HEALTH TRANSFORMATION",
                      ].map((item) => (
                        <div key={item} className="flex items-center gap-2.5">
                          <div className="w-5 h-5 rounded-full bg-[#E8542A]/20 border border-[#E8542A]/40 flex items-center justify-center shrink-0">
                            <CheckCircle2 size={13} className="text-[#E8542A]" />
                          </div>
                          <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
                            {item}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* ======================================================== */}
            {/* RIGHT 6 COLUMNS: DYNAMIC PIXEL-PERFECT FORM PANEL        */}
            {/* ======================================================== */}
            <div ref={formRef} className="lg:col-span-6">
              <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl shadow-slate-200/50 relative">
                
                {submitted ? (
                  <div className="py-12 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                      <CheckCircle2 size={36} />
                    </div>
                    <h3 className="font-serif text-2xl font-bold text-[#0f2347]">
                      Application Submitted!
                    </h3>
                    <p className="text-sm text-slate-600 max-w-md mx-auto leading-relaxed">
                      Thank you for connecting with Seva India Foundation. Our coordinator will review your application and reach out to you within 24–48 hours.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setSubmitted(false);
                        setFormData({
                          name: "",
                          email: "",
                          message: "",
                          companyName: "",
                          contactPerson: "",
                          industry: "",
                          partnershipType: "Financial Support",
                          csrFocusAreas: "",
                          partnershipGoals: "",
                          availability: "Flexible",
                          skills: "",
                          previousExperience: "",
                          reason: "",
                          positionAppliedFor: "",
                          currentLocation: "",
                          resumeUrl: "",
                          coverLetter: "",
                          supportType: "One-time Donation",
                          address: "",
                        });
                        setPhoneNumber("");
                      }}
                      className="mt-4 px-6 py-2.5 bg-[#0f2347] text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-slate-800 transition-colors"
                    >
                      Submit Another Response
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-5">
                    
                    {/* Header Title Matching Screenshots */}
                    <div className="mb-6">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight uppercase">
                        {activeFormType === "corporate" ? (
                          <>PARTNERSHIP <span className="text-[#F5A623]">INQUIRY</span></>
                        ) : activeFormType === "volunteer" ? (
                          <>VOLUNTEER <span className="text-[#F5A623]">APPLICATION</span></>
                        ) : activeFormType === "career" ? (
                          <>APPLY <span className="text-[#F5A623]">NOW</span></>
                        ) : (
                          <>SUPPORT <span className="text-[#F5A623]">FORM</span></>
                        )}
                      </h3>
                    </div>

                    {errorMessage && (
                      <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 font-medium">
                        {errorMessage}
                      </div>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* FORM 1: CORPORATE / CSR PARTNERSHIP                      */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeFormType === "corporate" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              COMPANY NAME
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.companyName}
                              onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                              placeholder="Acme Corp"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              CONTACT PERSON
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.contactPerson}
                              onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                              placeholder="Jane Smith"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              EMAIL ADDRESS
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="jane@acme.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                            />
                          </div>

                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                PHONE NUMBER
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {countryCode === "+91" ? "10 digits" : "Max 12 digits"}
                              </span>
                            </div>
                            <div className="flex gap-2 max-w-[280px]">
                              <select
                                value={countryCode}
                                onChange={(e) => handleCountryCodeChange(e.target.value)}
                                className="w-24 shrink-0 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#4169E1]"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="tel"
                                required
                                inputMode="numeric"
                                maxLength={maxPhoneDigits}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="9876543210"
                                className="flex-1 min-w-0 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all font-mono"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              INDUSTRY
                            </label>
                            <input
                              type="text"
                              value={formData.industry}
                              onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                              placeholder="e.g. Technology, Finance, Health"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              SELECTED PROJECT
                            </label>
                            <div className="px-4 py-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs sm:text-sm font-bold text-[#0f2347] uppercase truncate flex items-center justify-between">
                              <span className="truncate">{selectedRole || "GENERAL SUPPORT"}</span>
                              <span className="text-[10px] text-[#4169E1] font-bold shrink-0 ml-1">✓ ACTIVE</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              PARTNERSHIP TYPE
                            </label>
                            <select
                              value={formData.partnershipType}
                              onChange={(e) => setFormData({ ...formData, partnershipType: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                            >
                              <option value="Financial Support">Financial Support</option>
                              <option value="CSR Projects">CSR Projects</option>
                              <option value="Employee Engagement">Employee Engagement</option>
                              <option value="Skill Sponsorship">Skill Sponsorship</option>
                              <option value="In-kind Contribution">In-kind Contribution</option>
                              <option value="Infrastructure Development">Infrastructure Development</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              CSR FOCUS AREAS
                            </label>
                            <input
                              type="text"
                              value={formData.csrFocusAreas}
                              onChange={(e) => setFormData({ ...formData, csrFocusAreas: e.target.value })}
                              placeholder="e.g. Education, Healthcare, Nutrition"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            PARTNERSHIP GOALS / MESSAGE
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={formData.partnershipGoals}
                            onChange={(e) => setFormData({ ...formData, partnershipGoals: e.target.value })}
                            placeholder="Tell us about your CSR vision and how we can work together..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all resize-y"
                          />
                        </div>
                      </>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* FORM 2: VOLUNTEER APPLICATION                            */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeFormType === "volunteer" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              FULL NAME
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="John Doe"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              EMAIL ADDRESS
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                PHONE NUMBER
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {countryCode === "+91" ? "10 digits" : "Max 12 digits"}
                              </span>
                            </div>
                            <div className="flex gap-2 max-w-[280px]">
                              <select
                                value={countryCode}
                                onChange={(e) => handleCountryCodeChange(e.target.value)}
                                className="w-24 shrink-0 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#E8542A]"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="tel"
                                required
                                inputMode="numeric"
                                maxLength={maxPhoneDigits}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="9876543210"
                                className="flex-1 min-w-0 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              SELECTED AREA
                            </label>
                            <div className="px-4 py-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs sm:text-sm font-bold text-[#0f2347] uppercase truncate flex items-center justify-between">
                              <span className="truncate">{selectedRole || "GENERAL SUPPORT"}</span>
                              <span className="text-[10px] text-[#E8542A] font-bold shrink-0 ml-1">✓ ACTIVE</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              AVAILABILITY
                            </label>
                            <select
                              value={formData.availability}
                              onChange={(e) => setFormData({ ...formData, availability: e.target.value as any })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all"
                            >
                              <option value="Flexible">Flexible</option>
                              <option value="Weekends">Weekends Only</option>
                              <option value="Weekdays">Weekdays</option>
                              <option value="Full-time">Full-time</option>
                              <option value="Part-time">Part-time (2-4 hrs/wk)</option>
                            </select>
                          </div>

                          <div className="flex items-center gap-2 p-3 bg-slate-50 border border-slate-200 rounded-xl self-end">
                            <Clock size={16} className="text-[#4169E1] shrink-0" />
                            <span className="text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                              TIME COMMITMENT VARIES
                            </span>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            SKILLS &amp; EXPERTISE
                          </label>
                          <input
                            type="text"
                            value={formData.skills}
                            onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                            placeholder="e.g. Teaching, Social Media, Content Writing, Medical, Logistics..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            PREVIOUS EXPERIENCE
                          </label>
                          <textarea
                            rows={2}
                            value={formData.previousExperience}
                            onChange={(e) => setFormData({ ...formData, previousExperience: e.target.value })}
                            placeholder="Tell us about any previous volunteering or relevant work..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all resize-y"
                          />
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            WHY DO YOU WANT TO VOLUNTEER WITH US?
                          </label>
                          <textarea
                            rows={2}
                            required
                            value={formData.reason}
                            onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
                            placeholder="Your motivation for joining Seva India Foundation..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all resize-y"
                          />
                        </div>
                      </>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* FORM 3: CAREERS & JOBS                                   */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeFormType === "career" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              FULL NAME
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="John Doe"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              EMAIL ADDRESS
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                PHONE NUMBER
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {countryCode === "+91" ? "10 digits" : "Max 12 digits"}
                              </span>
                            </div>
                            <div className="flex gap-2 max-w-[280px]">
                              <select
                                value={countryCode}
                                onChange={(e) => handleCountryCodeChange(e.target.value)}
                                className="w-24 shrink-0 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#F5A623]"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="tel"
                                required
                                inputMode="numeric"
                                maxLength={maxPhoneDigits}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="9876543210"
                                className="flex-1 min-w-0 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              SELECTED PROGRAM
                            </label>
                            <div className="px-4 py-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs sm:text-sm font-bold text-[#0f2347] uppercase truncate flex items-center justify-between">
                              <span className="truncate">{selectedRole || "GENERAL OPERATIONS"}</span>
                              <span className="text-[10px] text-[#F5A623] font-bold shrink-0 ml-1">✓ ACTIVE</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              POSITION APPLIED FOR
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.positionAppliedFor || selectedRole}
                              onChange={(e) => setFormData({ ...formData, positionAppliedFor: e.target.value })}
                              placeholder="e.g. Program Manager, Fundraising Lead"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              CURRENT LOCATION
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.currentLocation}
                              onChange={(e) => setFormData({ ...formData, currentLocation: e.target.value })}
                              placeholder="City, State"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            RESUME LINK (GOOGLE DRIVE / DROPBOX)
                          </label>
                          <div className="relative">
                            <LinkIcon size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input
                              type="url"
                              required
                              value={formData.resumeUrl}
                              onChange={(e) => setFormData({ ...formData, resumeUrl: e.target.value })}
                              placeholder="https://drive.google.com/your-resume-link"
                              className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            BRIEF COVER LETTER
                          </label>
                          <textarea
                            rows={3}
                            required
                            value={formData.coverLetter}
                            onChange={(e) => setFormData({ ...formData, coverLetter: e.target.value })}
                            placeholder="Tell us why you're a good fit for this role..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all resize-y"
                          />
                        </div>
                      </>
                    )}

                    {/* ──────────────────────────────────────────────────────── */}
                    {/* FORM 4: WAYS TO GIVE / SUPPORT FORM                      */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {activeFormType === "support" && (
                      <>
                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              FULL NAME
                            </label>
                            <input
                              type="text"
                              required
                              value={formData.name}
                              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                              placeholder="John Doe"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              EMAIL ADDRESS
                            </label>
                            <input
                              type="email"
                              required
                              value={formData.email}
                              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                              placeholder="john@example.com"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <div className="flex items-center justify-between mb-1.5">
                              <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider">
                                PHONE NUMBER
                              </label>
                              <span className="text-[10px] text-slate-400 font-medium">
                                {countryCode === "+91" ? "10 digits" : "Max 12 digits"}
                              </span>
                            </div>
                            <div className="flex gap-2 max-w-[280px]">
                              <select
                                value={countryCode}
                                onChange={(e) => handleCountryCodeChange(e.target.value)}
                                className="w-24 shrink-0 px-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:border-[#F5A623]"
                              >
                                {COUNTRY_CODES.map((c) => (
                                  <option key={c.code} value={c.code}>
                                    {c.flag} {c.code}
                                  </option>
                                ))}
                              </select>
                              <input
                                type="tel"
                                required
                                inputMode="numeric"
                                maxLength={maxPhoneDigits}
                                value={phoneNumber}
                                onChange={handlePhoneChange}
                                placeholder="9876543210"
                                className="flex-1 min-w-0 px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all font-mono"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              SELECTED PROGRAM
                            </label>
                            <div className="px-4 py-3 bg-blue-50/80 border border-blue-200 rounded-xl text-xs sm:text-sm font-bold text-[#0f2347] uppercase truncate flex items-center justify-between">
                              <span className="truncate">{selectedRole || "GENERAL SUPPORT"}</span>
                              <span className="text-[10px] text-[#F5A623] font-bold shrink-0 ml-1">✓ ACTIVE</span>
                            </div>
                          </div>
                        </div>

                        <div className="grid sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              TYPE OF SUPPORT
                            </label>
                            <select
                              value={formData.supportType}
                              onChange={(e) => setFormData({ ...formData, supportType: e.target.value })}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            >
                              <option value="One-time Donation">One-time Donation</option>
                              <option value="Monthly Giving">Monthly Giving</option>
                              <option value="Sponsorship">Sponsorship</option>
                              <option value="Legacy Giving">Legacy Giving</option>
                              <option value="In-kind Contribution">In-kind Contribution</option>
                            </select>
                          </div>

                          <div>
                            <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                              MAILING ADDRESS (OPTIONAL)
                            </label>
                            <input
                              type="text"
                              value={formData.address}
                              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                              placeholder="Your full address"
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            MESSAGE / NOTES
                          </label>
                          <textarea
                            rows={3}
                            value={formData.message}
                            onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                            placeholder="Tell us why you'd like to support Seva India..."
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all resize-y"
                          />
                        </div>
                      </>
                    )}

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isSubmitting}
                        className="w-full py-4 bg-[#F5A623] hover:bg-[#d48b17] text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-[0.99] disabled:opacity-60"
                      >
                        {isSubmitting ? (
                          <>
                            <Loader2 size={18} className="animate-spin" />
                            <span>Processing Submission...</span>
                          </>
                        ) : (
                          <>
                            <span>
                              {activeFormType === "corporate"
                                ? "Submit Partnership Inquiry"
                                : activeFormType === "volunteer"
                                ? "Submit Volunteer Application"
                                : activeFormType === "career"
                                ? "Submit Career Application"
                                : "Submit Inquiry"}
                            </span>
                            <Send size={16} />
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── Testimonials & Impact ── */}
      <section className="py-20 bg-slate-50 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-2 block">
              Voices from the Ground
            </span>
            <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347]">
              Hear From Our Community
            </h2>
          </div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ACTIVE_VOLUNTEERS.map((v) => (
              <div
                key={v.name}
                className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4"
              >
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                  &ldquo;{v.quote}&rdquo;
                </p>
                <div className="pt-4 border-t border-slate-100">
                  <h4 className="font-bold text-sm text-[#0f2347]">{v.name}</h4>
                  <p className="text-[11px] text-[#E8542A] font-semibold">{v.role}</p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Contributing since {v.since} • {v.hours} hours
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQs Accordion ── */}
      {faqs && faqs.length > 0 && (
        <section className="py-20 bg-white border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-2 block">
                Got Questions?
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347]">
                Frequently Asked Questions
              </h2>
            </div>

            <div className="space-y-3.5">
              {faqs.map((faq, idx) => {
                const isOpen = openFaq === idx;
                return (
                  <div
                    key={faq.q}
                    className="border border-slate-200 rounded-2xl overflow-hidden transition-colors"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : idx)}
                      className="w-full p-5 text-left flex items-center justify-between gap-4 bg-slate-50/50 hover:bg-slate-50 transition-colors"
                    >
                      <span className="font-bold text-sm text-[#0f2347]">
                        {faq.q}
                      </span>
                      <HelpCircle
                        size={18}
                        className={`text-slate-400 shrink-0 transition-transform duration-200 ${
                          isOpen ? "rotate-180 text-[#E8542A]" : ""
                        }`}
                      />
                    </button>
                    {isOpen && (
                      <div className="p-5 pt-0 text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50/50 border-t border-slate-100">
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
