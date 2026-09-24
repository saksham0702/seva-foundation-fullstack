import React from "react";
import {
  X,
  Mail,
  Phone,
  MapPin,
  Trash2,
  Calendar,
  CheckCircle2,
  Clock,
  PhoneCall,
  XCircle,
  Building2,
  Briefcase,
  ExternalLink,
  Gift,
  FileText,
  User,
  Heart,
} from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { VolunteerApplication, ApplicationStatus } from "@/app/api/volunteer";

interface ApplicationDetailModalProps {
  application: VolunteerApplication | null;
  onClose: () => void;
  onUpdateStatus: (id: string, newStatus: ApplicationStatus) => void;
  onDeleteRequest: (app: VolunteerApplication) => void;
}

const STATUS_CONFIG: Record<
  ApplicationStatus,
  { label: string; bg: string; text: string; border: string; icon: React.ElementType }
> = {
  pending: {
    label: "Pending",
    bg: "bg-amber-50",
    text: "text-amber-700",
    border: "border-amber-200",
    icon: Clock,
  },
  contacted: {
    label: "Contacted",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
    icon: PhoneCall,
  },
  approved: {
    label: "Approved",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
    icon: CheckCircle2,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-rose-50",
    text: "text-rose-700",
    border: "border-rose-200",
    icon: XCircle,
  },
};

export const ApplicationDetailModal: React.FC<ApplicationDetailModalProps> = ({
  application,
  onClose,
  onUpdateStatus,
  onDeleteRequest,
}) => {
  if (!application) return null;

  const formType = application.formType || "volunteer";

  const roleTitle =
    application.selectedAreaTitle ||
    (typeof application.category === "object"
      ? application.category?.title || "Role"
      : "General");

  const roleColor =
    typeof application.category === "object"
      ? application.category?.color || "#E8542A"
      : "#E8542A";

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md overflow-y-auto">
        <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-7 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto max-h-[90vh] flex flex-col">
          
          {/* Header */}
          <div className="flex items-start justify-between pb-3.5 border-b border-slate-100 mb-4 shrink-0">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
                  {formType === "corporate"
                    ? "Corporate & CSR Partnership"
                    : formType === "career"
                    ? "Career & Job Application"
                    : formType === "support"
                    ? "Ways to Give / Support"
                    : "Volunteer Application"}
                </span>
                <span className="text-[11px] text-slate-400">
                  {application.createdAt
                    ? new Date(application.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    : "—"}
                </span>
              </div>
              <h3 className="font-serif font-bold text-lg sm:text-xl text-slate-900 leading-tight">
                {formType === "corporate" && application.companyName
                  ? `${application.companyName} (${application.contactPerson || application.name})`
                  : application.name}
              </h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Scrollable Content */}
          <div className="space-y-4 overflow-y-auto pr-1 flex-1">
            
            {/* ── 1. CORPORATE INQUIRY VIEW ── */}
            {formType === "corporate" && (
              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Company & Contact */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Company Information
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Company:</span>
                      <span className="font-bold text-slate-900">{application.companyName || application.name}</span>
                    </div>
                    {application.contactPerson && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Contact Person:</span>
                        <span className="font-bold text-slate-900">{application.contactPerson}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${application.email}`} className="font-bold text-blue-600 hover:underline">
                        {application.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${application.phone}`} className="font-bold text-slate-800">
                        {application.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Industry:</span>
                      <span className="font-bold text-slate-800">{application.industry || "—"}</span>
                    </div>
                  </div>

                  {/* Partnership Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Partnership Scope
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Partnership Type:</span>
                      <span className="font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded-md border border-blue-200">
                        {application.partnershipType || "CSR Projects"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Selected Project:</span>
                      <span className="font-bold text-slate-900">{roleTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">CSR Focus:</span>
                      <span className="font-bold text-slate-900">{application.csrFocusAreas || "—"}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold capitalize text-slate-800">{application.status}</span>
                    </div>
                  </div>
                </div>

                {/* Goals & Vision */}
                {(application.partnershipGoals || application.message) && (
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Partnership Goals / CSR Vision:
                    </span>
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed italic">
                      &ldquo;{application.partnershipGoals || application.message}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 2. VOLUNTEER VIEW ── */}
            {formType === "volunteer" && (
              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Contact Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Contact Details
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${application.email}`} className="font-bold text-blue-600 hover:underline">
                        {application.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${application.phone}`} className="font-bold text-slate-800">
                        {application.phone}
                      </a>
                    </div>
                    {application.city && (
                      <div className="flex items-center justify-between text-xs">
                        <span className="text-slate-500">Location:</span>
                        <span className="font-bold text-slate-800">{application.city}</span>
                      </div>
                    )}
                  </div>

                  {/* Role & Availability */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Volunteering Preferences
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Role / Area:</span>
                      <span
                        className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                        style={{ backgroundColor: roleColor + "15", color: roleColor }}
                      >
                        {roleTitle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Availability:</span>
                      <span className="font-bold capitalize text-slate-800">
                        {application.availability || "Flexible"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold capitalize text-slate-800">{application.status}</span>
                    </div>
                  </div>
                </div>

                {application.skills && (
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Skills &amp; Expertise:
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800">
                      {application.skills}
                    </div>
                  </div>
                )}

                {application.previousExperience && (
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Previous Experience:
                    </span>
                    <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed">
                      {application.previousExperience}
                    </div>
                  </div>
                )}

                {(application.reason || application.message) && (
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Motivation / Why Volunteer:
                    </span>
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed italic">
                      &ldquo;{application.reason || application.message}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 3. CAREER VIEW ── */}
            {formType === "career" && (
              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Candidate Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Candidate Details
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${application.email}`} className="font-bold text-blue-600 hover:underline">
                        {application.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${application.phone}`} className="font-bold text-slate-800">
                        {application.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Current Location:</span>
                      <span className="font-bold text-slate-800">
                        {application.currentLocation || application.city || "—"}
                      </span>
                    </div>
                  </div>

                  {/* Position Info */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Position Details
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Position Applied:</span>
                      <span className="font-bold text-amber-800 bg-amber-50 px-2.5 py-0.5 rounded-md border border-amber-200">
                        {application.positionAppliedFor || roleTitle}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Program Area:</span>
                      <span className="font-bold text-slate-800">{roleTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold capitalize text-slate-800">{application.status}</span>
                    </div>
                  </div>
                </div>

                {/* Resume Link */}
                {application.resumeUrl && (
                  <div className="p-3.5 bg-blue-50/70 border border-blue-200 rounded-xl flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">Candidate Resume</p>
                      <p className="text-[11px] text-slate-500 truncate max-w-sm">{application.resumeUrl}</p>
                    </div>
                    <a
                      href={application.resumeUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3.5 py-1.5 bg-[#4169E1] text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow-sm hover:bg-blue-700 transition-colors"
                    >
                      <ExternalLink size={13} /> Open Resume
                    </a>
                  </div>
                )}

                {/* Cover Letter */}
                {(application.coverLetter || application.message) && (
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Cover Letter / Statement:
                    </span>
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed whitespace-pre-wrap">
                      {application.coverLetter || application.message}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── 4. SUPPORT / WAYS TO GIVE VIEW ── */}
            {formType === "support" && (
              <div className="space-y-3.5">
                <div className="grid sm:grid-cols-2 gap-3">
                  {/* Contributor Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Donor / Contributor
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Email:</span>
                      <a href={`mailto:${application.email}`} className="font-bold text-blue-600 hover:underline">
                        {application.email}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Phone:</span>
                      <a href={`tel:${application.phone}`} className="font-bold text-slate-800">
                        {application.phone}
                      </a>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Address:</span>
                      <span className="font-bold text-slate-800">{application.address || "—"}</span>
                    </div>
                  </div>

                  {/* Support Details */}
                  <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                      Giving Details
                    </span>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Type of Support:</span>
                      <span className="font-bold text-emerald-800 bg-emerald-50 px-2.5 py-0.5 rounded-md border border-emerald-200">
                        {application.supportType || "Donation"}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Selected Program:</span>
                      <span className="font-bold text-slate-800">{roleTitle}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">Status:</span>
                      <span className="font-bold capitalize text-slate-800">{application.status}</span>
                    </div>
                  </div>
                </div>

                {application.message && (
                  <div>
                    <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                      Message / Inquiry Notes:
                    </span>
                    <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-800 leading-relaxed italic">
                      &ldquo;{application.message}&rdquo;
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* ── Status Controls ── */}
            <div className="pt-2">
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                Update Processing Status:
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {(["pending", "contacted", "approved", "rejected"] as ApplicationStatus[]).map(
                  (st) => {
                    const isSelected = application.status === st;
                    const cfg = STATUS_CONFIG[st];
                    return (
                      <button
                        key={st}
                        type="button"
                        onClick={() => onUpdateStatus(application._id, st)}
                        className={`py-2 px-2.5 rounded-xl text-xs font-bold capitalize border transition-all text-center ${
                          isSelected
                            ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-2 ring-offset-1`
                            : "bg-slate-50 text-slate-600 border-slate-200 hover:text-black hover:bg-slate-100"
                        }`}
                      >
                        {st}
                      </button>
                    );
                  }
                )}
              </div>
            </div>

          </div>

          {/* Footer */}
          <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between shrink-0">
            <button
              onClick={() => onDeleteRequest(application)}
              className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
            >
              <Trash2 size={13} />
              Delete Submission
            </button>

            <button
              onClick={onClose}
              className="px-5 py-2 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
            >
              Close
            </button>
          </div>

        </div>
      </div>
    </Portal>
  );
};
