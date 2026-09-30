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
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import {
  createVolunteerApplication,
  VolunteerCategory,
  Availability,
  FormType,
} from "@/app/api/volunteer";
import { getImageUrl } from "@/lib/image";

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

const getCategoryIcon = (title: string, formType: FormType) => {
  const t = (title || "").toLowerCase();
  if (t.includes("teach") || t.includes("mentor") || t.includes("educat")) return Sparkles;
  if (t.includes("health") || t.includes("camp") || t.includes("medic")) return Heart;
  if (t.includes("kitchen") || t.includes("food") || t.includes("meal") || t.includes("hunger")) return Gift;
  if (t.includes("women") || t.includes("empower") || t.includes("skill")) return Target;
  if (t.includes("corporate") || t.includes("business") || t.includes("csr")) return Building2;
  if (t.includes("sponsor") || t.includes("give") || t.includes("donat")) return HandHeart;
  if (t.includes("job") || t.includes("lead") || t.includes("officer") || t.includes("manager")) return Briefcase;
  if (formType === "volunteer") return Heart;
  if (formType === "corporate") return Building2;
  if (formType === "career") return Briefcase;
  return HandHeart;
};

interface GetInvolvedClientProps {
  categories: VolunteerCategory[];
  faqs: { q: string; a: string }[];
  testimonials?: any[];
  testimonialsTitle?: string;
  testimonialsSubtitle?: string;
}

export default function GetInvolvedClient({
  categories,
  faqs,
  testimonials,
  testimonialsTitle,
  testimonialsSubtitle,
}: GetInvolvedClientProps) {
  const searchParams = useSearchParams();
  const urlType = searchParams.get("type") || searchParams.get("tab") || searchParams.get("formType");
  
  const resolveInitialType = (val: string | null): FormType => {
    if (val === "corporate" || val === "csr") return "corporate";
    if (val === "career" || val === "careers" || val === "jobs") return "career";
    if (val === "individual" || val === "support" || val === "give" || val === "donate" || val === "ways-to-give") return "individual";
    return "volunteer";
  };

  const [activeFormType, setActiveFormType] = useState<FormType>(resolveInitialType(urlType));
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  // Filter categories by formType (handling individual and legacy support) and deduplicate by title
  const filteredCategories = categories
    .filter((c) => {
      const catType = c.formType || "volunteer";
      if (activeFormType === "individual" || activeFormType === "support") {
        return catType === "individual" || catType === "support";
      }
      return catType === activeFormType;
    })
    .filter(
      (cat, idx, arr) =>
        arr.findIndex(
          (x) =>
            x._id === cat._id ||
            x.title.trim().toLowerCase() === cat.title.trim().toLowerCase()
        ) === idx
    );

  const getCategoryColor = (item: any): string | null => {
    if (item?.color && typeof item.color === "string" && item.color.trim() !== "") {
      return item.color.trim();
    }
    return null;
  };

  const displayCategories = filteredCategories;

  const initialCat = displayCategories[0];
  const [selectedCategoryId, setSelectedCategoryId] = useState<string>(
    initialCat?._id || ""
  );
  const [selectedRole, setSelectedRole] = useState<string>(
    initialCat?.title || ""
  );

  const currentCategory =
    displayCategories.find(
      (c) =>
        (selectedCategoryId && c._id === selectedCategoryId) ||
        (c.title && selectedRole && c.title.toUpperCase() === selectedRole.toUpperCase())
    ) || displayCategories[0] || null;

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
    availability: "flexible" as Availability,
    skills: "",
    previousExperience: "",
    reason: "",

    // Career specific
    positionAppliedFor: "",
    currentLocation: "",
    resumeUrl: "",
    coverLetter: "",

    // Support / Individual specific
    supportType: "One-time Donation",
    address: "",
  });

  const formRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const handleHashOrQuery = () => {
      if (
        typeof window !== "undefined" &&
        (window.location.hash === "#volunteer-form" ||
          window.location.hash === "#apply-volunteer" ||
          window.location.hash === "#form" ||
          window.location.hash === "#join-form")
      ) {
        setTimeout(() => {
          formRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
        }, 120);
      }
    };
    handleHashOrQuery();
    window.addEventListener("hashchange", handleHashOrQuery);
    return () => window.removeEventListener("hashchange", handleHashOrQuery);
  }, []);

  const handleTabChange = (type: FormType) => {
    const targetType = type === ("support" as any) ? "individual" : type;
    setActiveFormType(targetType);
    setSubmitted(false);
    setErrorMessage(null);

    const newFiltered = categories.filter((c) => {
      const catType = c.formType || "volunteer";
      if (targetType === "individual") {
        return catType === "individual" || catType === "support";
      }
      return catType === targetType;
    });

    const firstNew = newFiltered[0];
    if (firstNew) {
      setSelectedCategoryId(firstNew._id);
      setSelectedRole(firstNew.title);
      if (targetType === "career") {
        setFormData((prev) => ({ ...prev, positionAppliedFor: firstNew.title }));
      } else if (targetType === "individual") {
        setFormData((prev) => ({ ...prev, supportType: firstNew.title }));
      } else if (targetType === "corporate") {
        setFormData((prev) => ({ ...prev, csrFocusAreas: firstNew.title }));
      }
    } else {
      setSelectedCategoryId("");
      setSelectedRole("");
      if (targetType === "career") {
        setFormData((prev) => ({ ...prev, positionAppliedFor: "" }));
      } else if (targetType === "individual") {
        setFormData((prev) => ({ ...prev, supportType: "" }));
      } else if (targetType === "corporate") {
        setFormData((prev) => ({ ...prev, csrFocusAreas: "" }));
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
    } else if (activeFormType === "individual" || activeFormType === "support") {
      setFormData((prev) => ({ ...prev, supportType: title }));
    } else if (activeFormType === "corporate") {
      setFormData((prev) => ({ ...prev, csrFocusAreas: title }));
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
        payload.csrFocusAreas = formData.csrFocusAreas || selectedRole;
        payload.partnershipGoals = formData.partnershipGoals || formData.message;
      } else if (activeFormType === "volunteer") {
        const availRaw = String(formData.availability).toLowerCase().trim();
        let availClean: Availability = "flexible";
        if (availRaw.includes("weekend")) availClean = "weekends";
        else if (availRaw.includes("weekday")) availClean = "weekdays";
        else if (availRaw.includes("both")) availClean = "both";
        else if (availRaw.includes("full")) availClean = "fulltime";
        else if (availRaw.includes("part")) availClean = "parttime";
        payload.availability = availClean;
        payload.skills = formData.skills;
        payload.previousExperience = formData.previousExperience;
        payload.reason = formData.reason || formData.message;
      } else if (activeFormType === "career") {
        payload.positionAppliedFor = formData.positionAppliedFor || selectedRole;
        payload.currentLocation = formData.currentLocation;
        payload.resumeUrl = formData.resumeUrl;
        payload.coverLetter = formData.coverLetter || formData.message;
      } else if (activeFormType === "individual" || activeFormType === "support") {
        payload.formType = "individual";
        payload.supportType = formData.supportType || selectedRole;
        payload.address = formData.address;
        payload.message = formData.message;
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
          
          {/* ── 4 Major Engagement Navigation Tabs ── */}
          <div className="mb-12">
            <div className="text-center max-w-2xl mx-auto mb-6">
              <span className="inline-block text-xs font-bold tracking-widest uppercase text-[#4169E1] mb-2 bg-blue-50 px-3.5 py-1 rounded-full border border-blue-100">
                Choose Your Engagement Path
              </span>
              <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347] tracking-tight">
                WAYS TO GET <span className="text-[#F5A623]">INVOLVED</span>
              </h2>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 sm:gap-3.5 max-w-4xl mx-auto p-2 bg-slate-100/90 backdrop-blur rounded-2xl border border-slate-200 shadow-xs">
              {[
                { id: "volunteer" as FormType, label: "Volunteer", sub: "Grassroots Action", icon: Heart },
                { id: "individual" as FormType, label: "Individual", sub: "Support & Giving", icon: HandHeart },
                { id: "corporate" as FormType, label: "Corporate", sub: "CSR & Partnerships", icon: Building2 },
                { id: "career" as FormType, label: "Careers & Jobs", sub: "Join Our Team", icon: Briefcase },
              ].map((tab) => {
                const isActive =
                  activeFormType === tab.id ||
                  (tab.id === "individual" && activeFormType === "support");
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => handleTabChange(tab.id)}
                    className={`flex items-center gap-3 p-3.5 sm:p-4 rounded-xl text-left transition-all duration-200 cursor-pointer ${
                      isActive
                        ? "bg-[#0f2347] text-white shadow-md scale-[1.02] ring-2 ring-[#0f2347]/20"
                        : "bg-white text-slate-700 hover:text-[#0f2347] hover:bg-slate-50 border border-slate-200/60 shadow-xs"
                    }`}
                  >
                    <div
                      className={`w-9 h-9 sm:w-10 sm:h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isActive
                          ? "bg-white/10 text-[#F5A623]"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      <Icon size={18} />
                    </div>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-bold uppercase tracking-wider leading-tight truncate">
                        {tab.label}
                      </div>
                      <div
                        className={`text-[10px] sm:text-[11px] truncate mt-0.5 ${
                          isActive ? "text-slate-300" : "text-slate-500"
                        }`}
                      >
                        {tab.sub}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* ── Category Selection Grid (Multi-row Lines) ── */}
          {displayCategories.length > 0 && (
            <div className="mb-10 bg-slate-50/80 rounded-3xl p-5 sm:p-6 border border-slate-200/80 shadow-xs">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-[#0f2347] animate-pulse" />
                    <span className="text-xs font-bold uppercase tracking-widest text-[#0f2347]">
                      {activeFormType === "volunteer"
                        ? "Select Volunteer Program"
                        : activeFormType === "corporate"
                        ? "Select CSR Focus Area"
                        : activeFormType === "career"
                        ? "Select Job Opening"
                        : "Select Giving & Support Track"}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Click any program below to view details and update your application details
                  </p>
                </div>

                <span className="text-xs font-bold uppercase tracking-wider text-slate-500 bg-white px-3 py-1 rounded-full border border-slate-200 shadow-xs self-start sm:self-auto">
                  {displayCategories.length} {displayCategories.length === 1 ? "Program" : "Programs"}
                </span>
              </div>

              {/* Responsive Multi-line Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                {displayCategories.map((item) => {
                  const isSelected =
                    (selectedCategoryId && item._id === selectedCategoryId) ||
                    (item.title && selectedRole && item.title.toUpperCase() === selectedRole.toUpperCase());
                  const IconComponent = getCategoryIcon(item.title, activeFormType);
                  const catColor = getCategoryColor(item);

                  return (
                    <button
                      key={item._id || item.title}
                      type="button"
                      onClick={() => handleCategoryClick(item.title, item._id)}
                      style={{
                        borderColor: isSelected && catColor ? catColor : undefined,
                        boxShadow: isSelected && catColor ? `0 8px 24px -4px ${catColor}35` : undefined,
                      }}
                      className={`p-4 rounded-2xl border text-left transition-all duration-200 cursor-pointer flex flex-col justify-between relative group ${
                        isSelected
                          ? "bg-[#0f2347] text-white ring-2 ring-[#0f2347]/20 scale-[1.01]"
                          : "bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50/70 shadow-xs"
                      }`}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-2.5">
                          <div
                            className={`w-9 h-9 rounded-xl flex items-center justify-center transition-transform group-hover:scale-105 ${
                              !catColor
                                ? isSelected
                                  ? "bg-white/10 text-white"
                                  : "bg-slate-100 text-[#0f2347] group-hover:text-[#4169E1]"
                                : ""
                            }`}
                            style={
                              catColor
                                ? {
                                    backgroundColor: isSelected ? `${catColor}30` : `${catColor}15`,
                                    color: isSelected ? "#ffffff" : catColor,
                                    border: `1px solid ${catColor}30`,
                                  }
                                : undefined
                            }
                          >
                            <IconComponent size={18} />
                          </div>
                          {item.badge && (
                            <span
                              className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                                !catColor
                                  ? isSelected
                                    ? "bg-white/15 text-slate-200"
                                    : "bg-slate-100 text-slate-600"
                                  : ""
                              }`}
                              style={
                                catColor
                                  ? {
                                      backgroundColor: isSelected ? `${catColor}30` : `${catColor}15`,
                                      color: isSelected ? "#ffffff" : catColor,
                                      border: `1px solid ${catColor}30`,
                                    }
                                  : undefined
                              }
                            >
                              {item.badge}
                            </span>
                          )}
                        </div>

                        <h4
                          className={`font-serif font-bold text-xs uppercase tracking-wide line-clamp-1 ${
                            isSelected ? "text-white" : "text-[#0f2347]"
                          }`}
                        >
                          {item.title}
                        </h4>
                        {item.description && (
                          <p
                            className={`text-[11px] line-clamp-2 mt-1 leading-relaxed ${
                              isSelected ? "text-slate-300" : "text-slate-500"
                            }`}
                          >
                            {item.description}
                          </p>
                        )}
                      </div>

                      <div
                        className="mt-3 pt-2.5 border-t flex items-center justify-between"
                        style={{
                          borderColor: isSelected
                            ? "rgba(255,255,255,0.15)"
                            : "rgba(226,232,240,0.8)",
                        }}
                      >
                        {isSelected ? (
                          <span
                            className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider"
                            style={{ color: catColor || "#F5A623" }}
                          >
                            <CheckCircle2 size={12} /> Selected
                          </span>
                        ) : (
                          <span className="text-[10px] font-semibold text-slate-400 group-hover:text-slate-600 uppercase tracking-wider">
                            Click to select
                          </span>
                        )}
                        {catColor && (
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: catColor }}
                            title="Category color"
                          />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          <div className="grid lg:grid-cols-12 gap-10 lg:gap-14 items-start">
            
            {/* ======================================================== */}
            {/* LEFT 6 COLUMNS: SELECTED SPOTLIGHT & IMPACT BANNER       */}
            {/* ======================================================== */}
            <div className="lg:col-span-6 space-y-6">
              
              {/* Active Selection Spotlight Card */}
              {currentCategory && (
                <div
                  className="bg-white rounded-3xl p-6 sm:p-8 border shadow-sm relative overflow-hidden"
                  style={
                    getCategoryColor(currentCategory)
                      ? {
                          borderColor: `${getCategoryColor(currentCategory)}40`,
                          boxShadow: `0 8px 24px -4px ${getCategoryColor(currentCategory)}20`,
                        }
                      : {
                          borderColor: "#e2e8f0",
                        }
                  }
                >
                  {getCategoryColor(currentCategory) && (
                    <div
                      className="absolute top-0 right-0 w-64 h-64 rounded-full blur-3xl opacity-15 pointer-events-none"
                      style={{ backgroundColor: getCategoryColor(currentCategory)! }}
                    />
                  )}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between gap-3 mb-4">
                      <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-50 border border-slate-200 shadow-xs">
                        <span
                          className="w-2 h-2 rounded-full animate-pulse"
                          style={{
                            backgroundColor: getCategoryColor(currentCategory) || "#10B981",
                          }}
                        />
                        <span className="text-[11px] font-bold tracking-wider uppercase text-[#0f2347]">
                          Selected Program Spotlight
                        </span>
                      </div>
                      {currentCategory.badge && (
                        <span
                          className={`text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                            !getCategoryColor(currentCategory)
                              ? "bg-slate-100 text-slate-700 border border-slate-200"
                              : ""
                          }`}
                          style={
                            getCategoryColor(currentCategory)
                              ? {
                                  backgroundColor: `${getCategoryColor(currentCategory)}15`,
                                  color: getCategoryColor(currentCategory)!,
                                  border: `1px solid ${getCategoryColor(currentCategory)}30`,
                                }
                              : undefined
                          }
                        >
                          {currentCategory.badge}
                        </span>
                      )}
                    </div>

                    <div className="flex items-start gap-4 mb-4">
                      <div
                        className={`w-14 h-14 rounded-2xl shadow-xs border flex items-center justify-center shrink-0 ${
                          !getCategoryColor(currentCategory)
                            ? "bg-slate-100 text-[#0f2347] border-slate-200"
                            : ""
                        }`}
                        style={
                          getCategoryColor(currentCategory)
                            ? {
                                backgroundColor: `${getCategoryColor(currentCategory)}15`,
                                color: getCategoryColor(currentCategory)!,
                                borderColor: `${getCategoryColor(currentCategory)}30`,
                              }
                            : undefined
                        }
                      >
                        {(() => {
                          const IconComp = getCategoryIcon(currentCategory.title || "", activeFormType);
                          return <IconComp size={28} />;
                        })()}
                      </div>
                      <div>
                        <h3 className="font-serif text-2xl font-bold text-[#0f2347] tracking-tight uppercase">
                          {currentCategory.title}
                        </h3>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-0.5">
                          {activeFormType === "volunteer"
                            ? "Grassroots Community Initiative"
                            : activeFormType === "corporate"
                            ? "Strategic CSR Partnership Track"
                            : activeFormType === "career"
                            ? "Open Position • Seva Foundation"
                            : "Direct Philanthropic Initiative"}
                        </p>
                      </div>
                    </div>

                    {currentCategory.description && (
                      <p className="text-slate-600 text-sm leading-relaxed mb-6">
                        {currentCategory.description}
                      </p>
                    )}

                    <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100">
                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-xs">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                          <Clock size={13} />
                          <span className="font-semibold uppercase text-[10px]">Commitment</span>
                        </div>
                        <p className="text-xs font-bold text-[#0f2347]">
                          {activeFormType === "career" ? "Full-Time" : "Flexible / Weekly"}
                        </p>
                      </div>

                      <div className="bg-slate-50 rounded-xl p-3 border border-slate-100 shadow-xs">
                        <div className="flex items-center gap-2 text-slate-400 text-xs mb-1">
                          <MapPin size={13} />
                          <span className="font-semibold uppercase text-[10px]">Location</span>
                        </div>
                        <p className="text-xs font-bold text-[#0f2347]">
                          {activeFormType === "career" ? "Delhi / Hybrid" : "Uttarakhand & North India"}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 1: CORPORATE BENEFIT BANNER */}
              {activeFormType === "corporate" && (
                <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                  <Building2 size={120} className="absolute -right-6 -bottom-6 text-white/5" />
                  <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                    PARTNER FOR IMPACT WITH SEVA
                  </h4>
                  <div className="space-y-3">
                    {[
                      "ALIGN WITH UN SUSTAINABLE DEVELOPMENT GOALS (SDGS)",
                      "AUDIT-READY QUARTERLY CSR IMPACT & FINANCIAL REPORTS",
                      "EMPLOYEE VOLUNTEERING DRIVES & ENGAGEMENT WORKSHOPS",
                      "ELIGIBLE FOR 80G & CSR TAX DEDUCTIONS UNDER INDIAN LAW",
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
              )}

              {/* TAB 2: VOLUNTEER BENEFIT BANNER */}
              {activeFormType === "volunteer" && (
                <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                  <Heart size={120} className="absolute -right-6 -bottom-6 text-white/5" fill="currentColor" />
                  <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                    VOLUNTEER BENEFITS
                  </h4>
                  <div className="space-y-3">
                    {[
                      "OFFICIAL CERTIFICATE OF SOCIAL WORK APPRECIATION",
                      "HANDS-ON GROUND EXPERIENCE IN GRASSROOTS SOCIAL WORK",
                      "NETWORKING WITH PASSIONATE CHANGEMAKERS & PROFESSIONALS",
                      "MENTORSHIP & LEADERSHIP SKILL ACCELERATION OPPORTUNITY",
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
              )}

              {/* TAB 3: CAREER BENEFIT BANNER */}
              {activeFormType === "career" && (
                <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                  <Sparkles size={120} className="absolute -right-6 -bottom-6 text-white/5" />
                  <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                    WHY WORK WITH SEVA INDIA?
                  </h4>
                  <div className="space-y-3">
                    {[
                      "PURPOSE-DRIVEN CAREER DRIVING REAL SOCIAL TRANSFORMATION",
                      "COLLABORATIVE, TRANSPARENT, AND HIGHLY INCLUSIVE CULTURE",
                      "PROFESSIONAL GROWTH, REGIONAL LEADERSHIP, & TRAININGS",
                      "COMPETITIVE SALARIES & FIELDWORK REIMBURSEMENTS",
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
              )}

              {/* TAB 4: INDIVIDUAL BENEFIT BANNER */}
              {(activeFormType === "individual" || activeFormType === "support") && (
                <div className="bg-[#0f2347] rounded-3xl p-7 text-white relative overflow-hidden shadow-xl">
                  <Gift size={120} className="absolute -right-6 -bottom-6 text-white/5" />
                  <h4 className="font-serif font-bold text-base tracking-wider uppercase text-white mb-4">
                    WHY SUPPORT AS AN INDIVIDUAL?
                  </h4>
                  <div className="space-y-3">
                    {[
                      "100% FINANCIAL TRANSPARENCY & AUDITED ANNUAL REPORTS",
                      "80G & 12A TAX EXEMPTION CERTIFICATES DELIVERED VIA EMAIL",
                      "DIRECT BENEFICIARY OUTREACH WITH MONTHLY PROGRESS UPDATES",
                      "COMMUNITY SUPPORT NETWORK WITH REGULAR ON-GROUND VISITS",
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
              )}
            </div>

            {/* ======================================================== */}
            {/* RIGHT 6 COLUMNS: DYNAMIC PIXEL-PERFECT FORM PANEL        */}
            {/* ======================================================== */}
            <div ref={formRef} id="volunteer-form" className="lg:col-span-6 scroll-mt-28">
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
                          availability: "flexible" as Availability,
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
                    
                    {/* Header Title */}
                    <div className="mb-6">
                      <h3 className="font-serif text-2xl sm:text-3xl font-bold tracking-tight uppercase text-[#0f2347]">
                        {activeFormType === "corporate" ? (
                          <>PARTNERSHIP <span className="text-[#E8542A]">INQUIRY</span></>
                        ) : activeFormType === "volunteer" ? (
                          <>VOLUNTEER <span className="text-[#E8542A]">APPLICATION</span></>
                        ) : activeFormType === "career" ? (
                          <>CAREER <span className="text-[#E8542A]">APPLICATION</span></>
                        ) : (
                          <>INDIVIDUAL <span className="text-[#E8542A]">CONTRIBUTION</span></>
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
                              placeholder="e.g. Tata Trust, Reliance Foundation"
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
                              placeholder="e.g. Priya Sharma"
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
                              placeholder="priya.sharma@company.com"
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
                        </div>

                        <div>
                          <label className="block text-[11px] font-bold text-slate-600 uppercase tracking-wider mb-1.5">
                            CSR INITIATIVE / FOCUS
                          </label>
                          <select
                            value={selectedCategoryId || selectedRole}
                            onChange={(e) => {
                              const val = e.target.value;
                              const cat = filteredCategories.find(
                                (c) => c._id === val || c.title === val
                              );
                              if (cat) {
                                setSelectedCategoryId(cat._id);
                                setSelectedRole(cat.title);
                                setFormData((prev) => ({ ...prev, csrFocusAreas: cat.title }));
                              } else {
                                setSelectedRole(val);
                                setFormData((prev) => ({ ...prev, csrFocusAreas: val }));
                              }
                            }}
                            className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#4169E1]/20 focus:border-[#4169E1] transition-all"
                          >
                            {filteredCategories.length > 0 ? (
                              filteredCategories.map((c) => (
                                <option key={c._id} value={c._id}>
                                  {c.title}
                                </option>
                              ))
                            ) : (
                              <option value="">General Corporate Inquiry</option>
                            )}
                          </select>
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
                              placeholder="e.g. Rahul Verma"
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
                              placeholder="rahul.verma@gmail.com"
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
                              VOLUNTEER ROLE / AREA
                            </label>
                            <select
                              value={selectedCategoryId || selectedRole}
                              onChange={(e) => {
                                const val = e.target.value;
                                const cat = filteredCategories.find(
                                  (c) => c._id === val || c.title === val
                                );
                                if (cat) {
                                  setSelectedCategoryId(cat._id);
                                  setSelectedRole(cat.title);
                                } else {
                                  setSelectedRole(val);
                                }
                              }}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#E8542A]/20 focus:border-[#E8542A] transition-all"
                            >
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.title}
                                  </option>
                                ))
                              ) : (
                                <option value="">General Volunteer Application</option>
                              )}
                            </select>
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
                              <option value="flexible">Flexible</option>
                              <option value="weekends">Weekends Only</option>
                              <option value="weekdays">Weekdays</option>
                              <option value="both">Both Weekdays & Weekends</option>
                              <option value="fulltime">Full-time</option>
                              <option value="parttime">Part-time (2-4 hrs/wk)</option>
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
                              placeholder="e.g. Amit Patel"
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
                              placeholder="amit.patel@gmail.com"
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
                              POSITION / ROLE
                            </label>
                            <select
                              value={selectedCategoryId || selectedRole}
                              onChange={(e) => {
                                const val = e.target.value;
                                const cat = filteredCategories.find(
                                  (c) => c._id === val || c.title === val
                                );
                                if (cat) {
                                  setSelectedCategoryId(cat._id);
                                  setSelectedRole(cat.title);
                                  setFormData((prev) => ({ ...prev, positionAppliedFor: cat.title }));
                                } else {
                                  setSelectedRole(val);
                                  setFormData((prev) => ({ ...prev, positionAppliedFor: val }));
                                }
                              }}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            >
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.title}
                                  </option>
                                ))
                              ) : (
                                <option value="">General Application</option>
                              )}
                            </select>
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
                              placeholder="e.g. Dehradun, Uttarakhand"
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
                    {/* FORM 4: INDIVIDUAL CONTRIBUTION FORM                     */}
                    {/* ──────────────────────────────────────────────────────── */}
                    {(activeFormType === "individual" || activeFormType === "support") && (
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
                              placeholder="e.g. Ananya Mishra"
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
                              placeholder="ananya.mishra@gmail.com"
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
                              INDIVIDUAL GIVING PROGRAM
                            </label>
                            <select
                              value={selectedCategoryId || selectedRole}
                              onChange={(e) => {
                                const val = e.target.value;
                                const cat = filteredCategories.find(
                                  (c) => c._id === val || c.title === val
                                );
                                if (cat) {
                                  setSelectedCategoryId(cat._id);
                                  setSelectedRole(cat.title);
                                  setFormData((prev) => ({ ...prev, supportType: cat.title }));
                                } else {
                                  setSelectedRole(val);
                                  setFormData((prev) => ({ ...prev, supportType: val }));
                                }
                              }}
                              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#F5A623]/20 focus:border-[#F5A623] transition-all"
                            >
                              {filteredCategories.length > 0 ? (
                                filteredCategories.map((c) => (
                                  <option key={c._id} value={c._id}>
                                    {c.title}
                                  </option>
                                ))
                              ) : (
                                <option value="">General Support & Giving</option>
                              )}
                            </select>
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
                        className="w-full py-4 bg-[#F5A623] hover:bg-[#d48b17] text-white font-bold rounded-2xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 text-sm uppercase tracking-wider active:scale-[0.99] disabled:opacity-60 cursor-pointer"
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
                                : "Submit Individual Contribution"}
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
      {(() => {
        const volunteersList =
          testimonials && Array.isArray(testimonials) && testimonials.length > 0
            ? testimonials
            : [];

        if (!volunteersList || volunteersList.length === 0) return null;

        return (
          <section className="py-20 bg-slate-50 border-t border-slate-100">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="text-center max-w-2xl mx-auto mb-14">
                <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#E8542A] mb-2 block">
                  {testimonialsTitle || "Voices from the Ground"}
                </span>
                <h2 className="font-serif text-3xl sm:text-4xl font-bold text-[#0f2347]">
                  {testimonialsSubtitle || "Hear From Our Community"}
                </h2>
              </div>

              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {volunteersList.map((v: any, idx: number) => {
                  const avatarUrl = v.avatar || v.image;
                  return (
                    <div
                      key={v.name || idx}
                      className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex flex-col justify-between space-y-4 hover:shadow-md transition-all duration-300"
                    >
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed italic">
                        &ldquo;{v.quote || v.content}&rdquo;
                      </p>
                      <div className="pt-4 border-t border-slate-100 flex items-center gap-3">
                        {avatarUrl ? (
                          <div className="relative w-11 h-11 rounded-full overflow-hidden shrink-0 border border-orange-200">
                            <Image
                              src={getImageUrl(avatarUrl)}
                              alt={v.name || "Volunteer"}
                              fill
                              className="object-cover"
                            />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-orange-100 text-[#E8542A] flex items-center justify-center font-bold text-sm shrink-0">
                            {v.name ? v.name.charAt(0) : "V"}
                          </div>
                        )}
                        <div className="min-w-0">
                          <h4 className="font-bold text-sm text-[#0f2347] truncate">{v.name}</h4>
                          <p className="text-[11px] text-[#E8542A] font-semibold truncate">{v.role}</p>
                          {(v.since || v.hours) && (
                            <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                              {v.since ? `Contributing since ${v.since}` : ""}
                              {v.since && v.hours ? " • " : ""}
                              {v.hours ? `${v.hours} hours` : ""}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })()}

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
