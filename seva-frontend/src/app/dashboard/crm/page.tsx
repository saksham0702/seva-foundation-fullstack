import {
  Users,
  TrendingUp,
  Phone,
  Mail,
  Building2,
  Heart,
  UserCheck,
  Globe,
  BarChart3,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

function StatCard({
  icon: Icon,
  label,
  value,
  change,
  up,
}: {
  icon: React.ElementType;
  label: string;
  value: string;
  change?: string;
  up?: boolean;
}) {
  return (
    <div className="bg-white/5 border border-white/10 rounded-2xl p-5 flex flex-col gap-3 hover:bg-white/[0.07] transition-all duration-200">
      <div className="flex items-center justify-between">
        <div className="w-9 h-9 rounded-xl bg-gold/15 flex items-center justify-center">
          <Icon className="w-4 h-4 text-gold" />
        </div>
        {change && (
          <span
            className={`flex items-center gap-1 text-xs font-semibold ${
              up ? "text-emerald-400" : "text-rose-400"
            }`}
          >
            {up ? (
              <ArrowUpRight className="w-3 h-3" />
            ) : (
              <ArrowDownRight className="w-3 h-3" />
            )}
            {change}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-white">{value}</p>
        <p className="text-xs text-white/50 mt-0.5">{label}</p>
      </div>
    </div>
  );
}

function PipelineBar({
  label,
  count,
  total,
  color,
}: {
  label: string;
  count: number;
  total: number;
  color: string;
}) {
  const pct = Math.round((count / total) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-white/60 w-28 shrink-0">{label}</span>
      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-700 ${color}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className="text-xs font-semibold text-white/80 w-8 text-right">
        {count}
      </span>
    </div>
  );
}

export default function CRMDashboardPage() {
  return (
    <div className="min-h-screen bg-[#0b0f1a] text-white px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <p className="text-xs font-bold tracking-[0.2em] uppercase text-gold/70 mb-1">
          Enterprise CRM
        </p>
        <h1 className="text-3xl font-bold tracking-tight">CRM Dashboard</h1>
        <p className="text-sm text-white/40 mt-1">
          Seva India Foundation · Relationship & Lead Management Hub
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard
          icon={Users}
          label="Total Contacts"
          value="8,342"
          change="+12%"
          up
        />
        <StatCard
          icon={TrendingUp}
          label="Active Leads"
          value="1,204"
          change="+8%"
          up
        />
        <StatCard
          icon={Building2}
          label="Organizations"
          value="318"
          change="+5%"
          up
        />
        <StatCard
          icon={Heart}
          label="Donor Relationships"
          value="2,890"
          change="-2%"
          up={false}
        />
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-8">
        <StatCard icon={UserCheck} label="Volunteers Tracked" value="743" change="+18%" up />
        <StatCard icon={Globe} label="NGO Partners" value="92" change="+3%" up />
        <StatCard icon={Phone} label="WhatsApp Inquiries" value="456" change="+22%" up />
        <StatCard icon={Mail} label="Email Inquiries" value="1,128" change="+10%" up />
      </div>

      {/* Content Row */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Lead Pipeline */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/40 mb-5">
            Lead Pipeline
          </p>
          <div className="flex flex-col gap-3">
            <PipelineBar label="New Leads" count={420} total={1204} color="bg-blue-400" />
            <PipelineBar label="In Progress" count={310} total={1204} color="bg-gold" />
            <PipelineBar label="Qualified" count={254} total={1204} color="bg-emerald-400" />
            <PipelineBar label="Converted" count={148} total={1204} color="bg-purple-400" />
            <PipelineBar label="Closed/Lost" count={72} total={1204} color="bg-rose-400" />
          </div>
        </div>

        {/* Relationship Breakdown */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/40 mb-5">
            Relationship Segments
          </p>
          <div className="flex flex-col gap-4">
            {[
              { label: "Corporate CSR Partners", count: "64", badge: "bg-blue-500/20 text-blue-300" },
              { label: "Government Relations", count: "28", badge: "bg-gold/20 text-gold" },
              { label: "NGOs & Partners", count: "92", badge: "bg-emerald-500/20 text-emerald-300" },
              { label: "Volunteers", count: "743", badge: "bg-purple-500/20 text-purple-300" },
              { label: "Donors", count: "2,890", badge: "bg-rose-500/20 text-rose-300" },
              { label: "Beneficiaries", count: "5,100", badge: "bg-cyan-500/20 text-cyan-300" },
              { label: "Media Contacts", count: "134", badge: "bg-orange-500/20 text-orange-300" },
            ].map((row) => (
              <div
                key={row.label}
                className="flex items-center justify-between py-2 border-b border-white/5 last:border-0"
              >
                <span className="text-sm text-white/70">{row.label}</span>
                <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${row.badge}`}>
                  {row.count}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Activities */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 xl:col-span-2">
          <p className="text-xs font-bold tracking-[0.18em] uppercase text-white/40 mb-5">
            Recent CRM Activity
          </p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-white/30 border-b border-white/10">
                  <th className="pb-3 font-semibold pr-6">Contact</th>
                  <th className="pb-3 font-semibold pr-6">Type</th>
                  <th className="pb-3 font-semibold pr-6">Action</th>
                  <th className="pb-3 font-semibold pr-6">Status</th>
                  <th className="pb-3 font-semibold text-right">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {[
                  { name: "Rajesh Kumar", type: "Donor", action: "Donation Pledge", status: "Confirmed", date: "24 Jul" },
                  { name: "TechCorp India", type: "Corporate CSR", action: "CSR Proposal Sent", status: "Pending", date: "24 Jul" },
                  { name: "Ananya Sharma", type: "Volunteer", action: "Onboarding Call", status: "Completed", date: "23 Jul" },
                  { name: "Delhi NGO Network", type: "Partner", action: "MOU Signed", status: "Active", date: "23 Jul" },
                  { name: "Priya Mehta", type: "Beneficiary", action: "Aid Assessment", status: "In Progress", date: "22 Jul" },
                ].map((row, i) => (
                  <tr key={i} className="group hover:bg-white/[0.03] transition-colors">
                    <td className="py-3 pr-6 font-medium text-white/80">{row.name}</td>
                    <td className="py-3 pr-6 text-white/50">{row.type}</td>
                    <td className="py-3 pr-6 text-white/60">{row.action}</td>
                    <td className="py-3 pr-6">
                      <span
                        className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          row.status === "Confirmed" || row.status === "Completed" || row.status === "Active"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : row.status === "Pending"
                            ? "bg-gold/20 text-gold"
                            : "bg-blue-500/20 text-blue-300"
                        }`}
                      >
                        {row.status}
                      </span>
                    </td>
                    <td className="py-3 text-right text-white/40 text-xs">{row.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
