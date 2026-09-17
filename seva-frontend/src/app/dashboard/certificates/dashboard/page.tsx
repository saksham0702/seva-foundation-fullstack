"use client";

import { useEffect, useState } from "react";
import {
  Award,
  FilePlus2,
  CalendarCheck,
  ShieldCheck,
  AlertTriangle,
  Loader2,
} from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import StatCard from "@/components/dashboard/certificates/StatCard";
import { LineChart, BarChart } from "@/components/dashboard/certificates/Charts";
import { getCertificateStats, CertificateStats } from "@/app/api/certificate";

export default function DashboardPage() {
  const [stats, setStats] = useState<CertificateStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getCertificateStats()
      .then(setStats)
      .finally(() => setLoading(false));
  }, []);

  const fmt = (n?: number) =>
    n == null ? "—" : n.toLocaleString("en-IN");

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="Seva India Foundation · Certificate Module" />

      {loading ? (
        <div className="flex items-center justify-center py-16 gap-3 text-faint">
          <Loader2 size={20} className="animate-spin" />
          <span className="text-sm">Loading stats…</span>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-5 gap-4 mb-8">
            <StatCard
              icon={Award}
              label="Total Certificates"
              value={fmt(stats?.totalCertificates)}
            />
            <StatCard
              icon={ShieldCheck}
              label="Active Certificates"
              value={fmt(stats?.activeCertificates)}
            />
            <StatCard
              icon={AlertTriangle}
              label="Revoked Certificates"
              value={fmt(stats?.revokedCertificates)}
            />
            <StatCard
              icon={FilePlus2}
              label="Generated Today"
              value={fmt(stats?.generatedToday)}
            />
            <StatCard
              icon={CalendarCheck}
              label="Generated This Month"
              value={fmt(stats?.generatedThisMonth)}
            />
          </div>
        </>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="panel p-6">
          <p className="label-eyebrow mb-4">Issuance Trends (2026)</p>
          <LineChart
            data={[42, 55, 95, 130, 165, 240]}
            labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]}
            max={240}
          />
        </div>
        <div className="panel p-6">
          <p className="label-eyebrow mb-4">Certificates by Category</p>
          <BarChart
            data={[430, 120, 310, 260]}
            labels={["Volunteers", "Interns", "Donors", "Training"]}
            max={600}
          />
        </div>
      </div>
    </div>
  );
}
