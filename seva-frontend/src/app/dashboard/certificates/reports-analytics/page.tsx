import { Download } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";
import { LineChart, BarChart } from "@/components/dashboard/certificates/Charts";
import StatCard from "@/components/dashboard/certificates/StatCard";
import { Award, ScanSearch, Percent } from "lucide-react";

export default function ReportsAnalyticsPage() {
  return (
    <div>
      <PageHeader
        title="Reports & Analytics"
        subtitle="Certificate issuance performance and trends"
        action={
          <button className="flex items-center gap-2 border border-border text-sm text-muted px-4 py-2.5 rounded-lg">
            <Download size={15} /> Export Report
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-4 mb-6">
        <StatCard icon={Award} label="Certificates YTD" value="12,458" />
        <StatCard icon={ScanSearch} label="Verification Rate" value="98.4%" />
        <StatCard icon={Percent} label="Revocation Rate" value="1.3%" />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="panel p-6">
          <p className="label-eyebrow mb-4">Monthly Issuance</p>
          <LineChart data={[42, 55, 95, 130, 165, 240]} labels={["Jan", "Feb", "Mar", "Apr", "May", "Jun"]} max={240} />
        </div>
        <div className="panel p-6">
          <p className="label-eyebrow mb-4">By Category</p>
          <BarChart data={[430, 120, 310, 260]} labels={["Volunteers", "Interns", "Donors", "Training"]} max={600} />
        </div>
      </div>

      <div className="panel p-6">
        <p className="label-eyebrow mb-4">Top Programs by Volume</p>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border text-left">
              <th className="label-eyebrow font-normal py-2">Program</th>
              <th className="label-eyebrow font-normal py-2">Issued</th>
              <th className="label-eyebrow font-normal py-2">Verified</th>
              <th className="label-eyebrow font-normal py-2">Revoked</th>
            </tr>
          </thead>
          <tbody>
            {[
              ["Volunteer Appreciation", "4,820", "4,760", "60"],
              ["Donation Acknowledgement", "2,960", "2,930", "30"],
              ["Training Program", "1,850", "1,822", "28"],
              ["Internship Completion", "1,240", "1,225", "15"],
            ].map((row) => (
              <tr key={row[0]} className="border-b border-border last:border-0">
                {row.map((c, i) => (
                  <td key={i} className={`py-3 ${i === 0 ? "font-medium" : "text-muted"}`}>
                    {c}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
