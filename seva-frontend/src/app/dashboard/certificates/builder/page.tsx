import { Type, ImageIcon, QrCode, PenLine, Square } from "lucide-react";
import PageHeader from "@/components/dashboard/certificates/PageHeader";

const elements = [
  { icon: Type, label: "Text Field" },
  { icon: ImageIcon, label: "Logo / Image" },
  { icon: QrCode, label: "QR Code" },
  { icon: PenLine, label: "Signature" },
  { icon: Square, label: "Border / Shape" },
];

export default function CertificateBuilderPage() {
  return (
    <div>
      <PageHeader
        title="Certificate Builder"
        subtitle="Design a custom certificate layout"
        action={
          <button className="bg-blueaccent text-white text-sm font-semibold px-5 py-2.5 rounded-lg">
            Save Layout
          </button>
        }
      />

      <div className="grid grid-cols-[220px_1fr_240px] gap-4">
        <div className="panel p-4">
          <p className="label-eyebrow mb-3">Elements</p>
          <div className="flex flex-col gap-1.5">
            {elements.map((el) => (
              <button
                key={el.label}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-[13px] text-muted hover:bg-bg hover:text-text-primary border border-transparent hover:border-border"
              >
                <el.icon size={15} />
                {el.label}
              </button>
            ))}
          </div>
        </div>

        <div className="panel p-6 flex items-center justify-center min-h-[520px]">
          <div className="w-full max-w-lg aspect-[4/3] border-2 border-dashed border-border rounded-xl relative bg-bg">
            <div className="absolute top-6 left-1/2 -translate-x-1/2 text-center">
              <p className="font-display text-gold text-xs tracking-wide">SEVA INDIA FOUNDATION</p>
              <p className="font-display text-xl font-bold mt-3">Certificate of Completion</p>
            </div>
            <div className="absolute inset-x-10 top-28 border border-dashed border-faint/40 rounded-md h-12 flex items-center justify-center text-[11px] text-faint">
              Recipient Name
            </div>
            <div className="absolute bottom-8 left-8 w-16 h-16 border border-dashed border-faint/40 rounded-md flex items-center justify-center text-[9px] text-faint text-center">
              QR
            </div>
            <div className="absolute bottom-8 right-8 w-24 h-10 border border-dashed border-faint/40 rounded-md flex items-center justify-center text-[9px] text-faint">
              Signature
            </div>
          </div>
        </div>

        <div className="panel p-4">
          <p className="label-eyebrow mb-3">Properties</p>
          <div className="flex flex-col gap-3 text-[13px]">
            <div>
              <label className="text-faint block mb-1">Canvas Size</label>
              <select className="w-full bg-bg border border-border rounded-lg px-2.5 py-2 text-text-primary">
                <option>A4 Landscape</option>
                <option>A4 Portrait</option>
                <option>Letter</option>
              </select>
            </div>
            <div>
              <label className="text-faint block mb-1">Accent Color</label>
              <div className="flex gap-2">
                {["#f2b705", "#3b82f6", "#22c55e", "#ef4444"].map((c) => (
                  <span key={c} className="w-6 h-6 rounded-full border border-border" style={{ background: c }} />
                ))}
              </div>
            </div>
            <div>
              <label className="text-faint block mb-1">Background</label>
              <select className="w-full bg-bg border border-border rounded-lg px-2.5 py-2 text-text-primary">
                <option>Ivory Classic</option>
                <option>Deep Navy</option>
                <option>Parchment</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
