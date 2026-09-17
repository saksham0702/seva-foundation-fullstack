import { Plus, Copy, Pencil } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";

const templates = [
  { name: "Volunteer Appreciation", used: 4820, color: "#f2b705" },
  { name: "Internship Completion", used: 1240, color: "#3b82f6" },
  { name: "Donation Acknowledgement", used: 2960, color: "#22c55e" },
  { name: "Training Program", used: 1850, color: "#a855f7" },
  { name: "Event Participation", used: 980, color: "#ef4444" },
  { name: "Leadership Award", used: 340, color: "#f2b705" },
];

export default function CertificateTemplatesPage() {
  return (
    <div>
      <PageHeader
        title="Certificate Templates"
        subtitle="Manage reusable certificate designs"
        action={
          <button className="flex items-center gap-2 bg-blueaccent text-white text-sm font-semibold px-4 py-2.5 rounded-lg">
            <Plus size={15} /> New Template
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-5">
        {templates.map((t) => (
          <div key={t.name} className="panel overflow-hidden">
            <div
              className="aspect-[4/3] flex items-center justify-center border-b border-border"
              style={{ background: "linear-gradient(160deg, rgba(255,255,255,0.02), transparent)" }}
            >
              <div className="text-center px-4">
                <p className="text-[10px] tracking-wide" style={{ color: t.color }}>
                  SEVA INDIA FOUNDATION
                </p>
                <p className="font-display font-bold text-sm mt-2">{t.name}</p>
              </div>
            </div>
            <div className="p-4 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold">{t.name}</p>
                <p className="text-xs text-faint mt-0.5">{t.used.toLocaleString()} certificates issued</p>
              </div>
              <div className="flex gap-1.5">
                <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-text-primary">
                  <Pencil size={13} />
                </button>
                <button className="w-8 h-8 rounded-lg border border-border flex items-center justify-center text-muted hover:text-text-primary">
                  <Copy size={13} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
