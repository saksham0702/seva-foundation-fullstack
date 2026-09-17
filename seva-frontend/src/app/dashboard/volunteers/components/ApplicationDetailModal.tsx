import React from "react";
import { X, Mail, Phone, MapPin, Trash2, Calendar, CheckCircle2, Clock, PhoneCall, XCircle } from "lucide-react";
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

  const roleTitle =
    typeof application.category === "object"
      ? application.category?.title || "Role"
      : "General";

  const roleColor =
    typeof application.category === "object"
      ? application.category?.color || "#E8542A"
      : "#E8542A";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200 my-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div>
            <h3 className="font-bold text-base sm:text-lg text-slate-900 leading-tight">
              {application.name}
            </h3>
            <p className="text-[11px] text-slate-400">
              Applied on{" "}
              {application.createdAt
                ? new Date(application.createdAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })
                : "—"}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-black rounded-lg hover:bg-slate-100 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content in 2 Columns */}
        <div className="space-y-3.5">
          {/* Top 2 Columns */}
          <div className="grid sm:grid-cols-2 gap-3">
            {/* Contact Info */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Contact Details
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Email:</span>
                <a
                  href={`mailto:${application.email}`}
                  className="font-bold text-blue-600 hover:underline flex items-center gap-1"
                >
                  <Mail size={12} />
                  {application.email}
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Phone:</span>
                <a
                  href={`tel:${application.phone}`}
                  className="font-bold text-slate-800 flex items-center gap-1"
                >
                  <Phone size={12} />
                  {application.phone}
                </a>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">City:</span>
                <span className="font-bold text-slate-800 flex items-center gap-1">
                  <MapPin size={12} />
                  {application.city || "—"}
                </span>
              </div>
            </div>

            {/* Role & Availability */}
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100 space-y-1.5">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1">
                Applied Role &amp; Schedule
              </span>
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-500">Role:</span>
                <span
                  className="px-2 py-0.5 rounded-full text-[11px] font-bold"
                  style={{
                    backgroundColor: roleColor + "15",
                    color: roleColor,
                  }}
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
                <span className="text-slate-500">Current Status:</span>
                <span className="font-bold capitalize text-slate-800">
                  {application.status}
                </span>
              </div>
            </div>
          </div>

          {/* Message / Motivation */}
          {application.message && (
            <div>
              <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1">
                Motivation / Why Volunteer:
              </span>
              <div className="p-3 bg-slate-50 border border-slate-100 rounded-xl text-xs text-slate-700 leading-relaxed italic max-h-24 overflow-y-auto">
                &ldquo;{application.message}&rdquo;
              </div>
            </div>
          )}

          {/* Status Buttons */}
          <div>
            <span className="text-[10.5px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
              Change Application Status:
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
                      className={`py-1.5 px-2 rounded-xl text-xs font-bold capitalize border transition-all text-center ${
                        isSelected
                          ? `${cfg.bg} ${cfg.text} ${cfg.border} ring-1 ring-offset-1`
                          : "bg-slate-50 text-slate-500 border-slate-200 hover:text-black hover:bg-slate-100"
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
        <div className="pt-4 mt-4 border-t border-slate-100 flex items-center justify-between">
          <button
            onClick={() => onDeleteRequest(application)}
            className="flex items-center gap-1.5 text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-3 py-1.5 rounded-xl transition-colors"
          >
            <Trash2 size={13} />
            Delete Applicant
          </button>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-black hover:bg-slate-800 text-white text-xs font-bold rounded-xl transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
