import React from "react";
import {
  Search,
  Users,
  Mail,
  Phone,
  MapPin,
  Eye,
  Trash2,
  ChevronDown,
  Loader2,
  Clock,
  PhoneCall,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import {
  VolunteerApplication,
  VolunteerCategory,
  ApplicationStatus,
} from "@/app/api/volunteer";

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

interface ApplicationsTableProps {
  applications: VolunteerApplication[];
  categories: VolunteerCategory[];
  isLoading: boolean;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: string;
  onStatusFilterChange: (st: string) => void;
  categoryFilter: string;
  onCategoryFilterChange: (catId: string) => void;
  isUpdatingStatusId: string | null;
  onUpdateStatus: (id: string, status: ApplicationStatus) => void;
  onViewDetails: (app: VolunteerApplication) => void;
  onDeleteRequest: (app: VolunteerApplication) => void;
}

export const ApplicationsTable: React.FC<ApplicationsTableProps> = ({
  applications,
  categories,
  isLoading,
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  categoryFilter,
  onCategoryFilterChange,
  isUpdatingStatusId,
  onUpdateStatus,
  onViewDetails,
  onDeleteRequest,
}) => {
  return (
    <div>
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-3.5 mb-5">
        <div className="relative flex-1 max-w-md">
          <Search
            size={15}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search by name, email, city or role..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-black/10 focus:border-black transition-all placeholder:text-slate-400"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Status Filter Pills */}
          <div className="flex items-center bg-slate-50 p-1 border border-slate-200 rounded-xl">
            {["all", "pending", "contacted", "approved", "rejected"].map((st) => (
              <button
                key={st}
                onClick={() => onStatusFilterChange(st)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold capitalize transition-all ${
                  statusFilter === st
                    ? "bg-white text-black shadow-xs"
                    : "text-slate-500 hover:text-black"
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          {/* Category Filter Dropdown */}
          {categories.length > 0 && (
            <select
              value={categoryFilter}
              onChange={(e) => onCategoryFilterChange(e.target.value)}
              className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:border-black"
            >
              <option value="all">All Roles</option>
              {categories.map((c) => (
                <option key={c._id} value={c._id}>
                  {c.title}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Applications Table Card */}
      <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
        {isLoading ? (
          <div className="py-24 flex flex-col items-center justify-center gap-3">
            <Loader2 size={30} className="animate-spin text-slate-400" />
            <p className="text-xs font-semibold text-slate-500">
              Loading volunteer applications...
            </p>
          </div>
        ) : applications.length === 0 ? (
          <div className="py-20 text-center px-4">
            <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-2.5 text-slate-400">
              <Users size={18} />
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No applications found
            </h3>
            <p className="text-xs text-slate-500 max-w-xs mx-auto">
              {searchQuery || statusFilter !== "all" || categoryFilter !== "all"
                ? "Try adjusting your search terms or filter criteria."
                : "New volunteer submissions from the website will appear right here."}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[10.5px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3 px-4 sm:px-5">Applicant</th>
                  <th className="py-3 px-4 sm:px-5">Role Applied</th>
                  <th className="py-3 px-4 sm:px-5">Location</th>
                  <th className="py-3 px-4 sm:px-5">Availability</th>
                  <th className="py-3 px-4 sm:px-5">Date</th>
                  <th className="py-3 px-4 sm:px-5">Status</th>
                  <th className="py-3 px-4 sm:px-5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {applications.map((app) => {
                  const statusCfg =
                    STATUS_CONFIG[app.status] || STATUS_CONFIG.pending;

                  const categoryTitle =
                    typeof app.category === "object"
                      ? app.category?.title || "Role"
                      : "General";
                  const categoryColor =
                    typeof app.category === "object"
                      ? app.category?.color || "#E8542A"
                      : "#E8542A";

                  return (
                    <tr
                      key={app._id}
                      className="hover:bg-slate-50/50 transition-colors group"
                    >
                      {/* Applicant Info */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div>
                          <p className="font-bold text-slate-900 text-xs sm:text-sm">
                            {app.name}
                          </p>
                          <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-500 mt-0.5">
                            <span className="flex items-center gap-1">
                              <Mail size={11} /> {app.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Phone size={11} /> {app.phone}
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Role Badge */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <span
                          className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold"
                          style={{
                            backgroundColor: categoryColor + "15",
                            color: categoryColor,
                          }}
                        >
                          <span
                            className="w-1.5 h-1.5 rounded-full"
                            style={{ backgroundColor: categoryColor }}
                          />
                          {categoryTitle}
                        </span>
                      </td>

                      {/* Location */}
                      <td className="py-3.5 px-4 sm:px-5 text-xs text-slate-600 font-medium">
                        <span className="flex items-center gap-1">
                          <MapPin size={12} className="text-slate-400" />
                          {app.city || "—"}
                        </span>
                      </td>

                      {/* Availability */}
                      <td className="py-3.5 px-4 sm:px-5 text-xs text-slate-600 font-medium">
                        <span className="capitalize px-2 py-0.5 bg-slate-100 rounded-md text-[11px] font-semibold text-slate-700">
                          {app.availability || "Flexible"}
                        </span>
                      </td>

                      {/* Date */}
                      <td className="py-3.5 px-4 sm:px-5 text-xs text-slate-500 font-medium whitespace-nowrap">
                        {app.createdAt
                          ? new Date(app.createdAt).toLocaleDateString("en-GB", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </td>

                      {/* Status Selector */}
                      <td className="py-3.5 px-4 sm:px-5">
                        <div className="relative inline-block">
                          <select
                            value={app.status}
                            disabled={isUpdatingStatusId === app._id}
                            onChange={(e) =>
                              onUpdateStatus(
                                app._id,
                                e.target.value as ApplicationStatus
                              )
                            }
                            className={`appearance-none cursor-pointer text-xs font-bold pl-2.5 pr-6 py-0.5 rounded-lg border transition-all focus:outline-none ${statusCfg.bg} ${statusCfg.text} ${statusCfg.border}`}
                          >
                            <option value="pending">Pending</option>
                            <option value="contacted">Contacted</option>
                            <option value="approved">Approved</option>
                            <option value="rejected">Rejected</option>
                          </select>
                          <ChevronDown
                            size={11}
                            className={`absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none opacity-60 ${statusCfg.text}`}
                          />
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 sm:px-5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => onViewDetails(app)}
                            title="View Details"
                            className="p-1.5 text-slate-400 hover:text-black hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Eye size={14} />
                          </button>
                          <button
                            onClick={() => onDeleteRequest(app)}
                            title="Delete Applicant"
                            className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
