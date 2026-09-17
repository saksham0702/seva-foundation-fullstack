import React from "react";
import { Users, Clock, PhoneCall, CheckCircle2, Layers } from "lucide-react";

interface VolunteersStatsProps {
  stats: {
    total: number;
    pending: number;
    contacted: number;
    approved: number;
    totalRoles: number;
  };
}

export const VolunteersStats: React.FC<VolunteersStatsProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4 mb-8">
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Total Applicants
          </span>
          <Users size={16} className="text-slate-400" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-black">
          {stats.total}
        </p>
      </div>

      <div className="bg-amber-50/70 border border-amber-200/70 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-amber-700 uppercase tracking-wider">
            Pending Review
          </span>
          <Clock size={16} className="text-amber-500" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-amber-900">
          {stats.pending}
        </p>
      </div>

      <div className="bg-blue-50/70 border border-blue-200/70 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
            Contacted
          </span>
          <PhoneCall size={16} className="text-blue-500" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-blue-900">
          {stats.contacted}
        </p>
      </div>

      <div className="bg-emerald-50/70 border border-emerald-200/70 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-emerald-700 uppercase tracking-wider">
            Approved
          </span>
          <CheckCircle2 size={16} className="text-emerald-500" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-emerald-900">
          {stats.approved}
        </p>
      </div>

      <div className="bg-purple-50/70 border border-purple-200/70 rounded-2xl p-4 col-span-2 lg:col-span-1">
        <div className="flex items-center justify-between mb-1.5">
          <span className="text-[11px] font-bold text-purple-700 uppercase tracking-wider">
            Active Roles
          </span>
          <Layers size={16} className="text-purple-500" />
        </div>
        <p className="text-2xl sm:text-3xl font-bold text-purple-900">
          {stats.totalRoles}
        </p>
      </div>
    </div>
  );
};
