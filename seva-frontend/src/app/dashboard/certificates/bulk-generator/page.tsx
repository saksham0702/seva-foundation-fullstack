import { UploadCloud, FileSpreadsheet, CheckCircle2 } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";

const queue = [
  { batch: "Volunteer Batch - Jul 2026", count: 210, status: "Completed" },
  { batch: "Internship Cohort 4", count: 68, status: "Completed" },
  { batch: "Donor Recognition Q2", count: 145, status: "Processing" },
];

export default function BulkGeneratorPage() {
  return (
    <div>
      <PageHeader title="Bulk Generator" subtitle="Issue certificates in bulk from a spreadsheet" />

      <div className="grid grid-cols-2 gap-6 mb-8">
        <div className="panel p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-border">
          <UploadCloud size={28} className="text-blueaccent mb-3" />
          <p className="text-sm font-semibold mb-1">Drop your CSV or XLSX file here</p>
          <p className="text-xs text-faint mb-4">Columns required: Name, Recipient ID, Template, Issue Date</p>
          <button className="bg-blueaccent text-white text-sm font-semibold px-4 py-2 rounded-lg">Browse Files</button>
        </div>

        <div className="panel p-6">
          <p className="label-eyebrow mb-4">Batch Settings</p>
          <div className="flex flex-col gap-4 text-sm">
            <div>
              <label className="text-faint block mb-1.5 text-xs">Template</label>
              <select className="w-full bg-bg border border-border rounded-lg px-3 py-2">
                <option>Volunteer Appreciation</option>
                <option>Internship Completion</option>
                <option>Donation Acknowledgement</option>
              </select>
            </div>
            <div>
              <label className="text-faint block mb-1.5 text-xs">Batch Name</label>
              <input placeholder="e.g. Volunteer Batch - Aug 2026" className="w-full bg-bg border border-border rounded-lg px-3 py-2 placeholder:text-faint" />
            </div>
            <div className="flex items-center gap-2 text-xs text-muted">
              <input type="checkbox" className="accent-blueaccent" />
              Auto-send via email after generation
            </div>
            <button className="bg-gold text-bg font-semibold text-sm px-4 py-2.5 rounded-lg mt-2">
              Generate Batch
            </button>
          </div>
        </div>
      </div>

      <p className="label-eyebrow mb-3">Recent Batches</p>
      <div className="panel divide-y divide-border">
        {queue.map((q) => (
          <div key={q.batch} className="flex items-center justify-between px-5 py-4">
            <div className="flex items-center gap-3">
              <FileSpreadsheet size={16} className="text-blueaccent" />
              <div>
                <p className="text-sm font-medium">{q.batch}</p>
                <p className="text-xs text-faint">{q.count} certificates</p>
              </div>
            </div>
            {q.status === "Completed" ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-green-400">
                <CheckCircle2 size={13} /> Completed
              </span>
            ) : (
              <span className="text-xs text-gold">Processing…</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
