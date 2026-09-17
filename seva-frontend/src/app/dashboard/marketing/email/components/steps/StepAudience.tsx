"use client";

import { useRef, useState } from "react";
import { Upload, X, FileSpreadsheet, ChevronDown } from "lucide-react";
import { useEmailMarketing } from "../../EmailMarketingProvider";

const EXISTING_LISTS = [
  { id: "l1", name: "All Donors", count: 2310 },
  { id: "l2", name: "Active Campaign Supporters", count: 889 },
  { id: "l3", name: "Newsletter Subscribers", count: 4120 },
  { id: "l4", name: "Volunteers", count: 341 },
];

export function StepAudience() {
  const { draft, updateDraft, setStep } = useEmailMarketing();
  const fileRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [activeTab, setActiveTab] = useState<"existing" | "import">("existing");

  function handleFile(file: File) {
    // In real impl: parse xlsx/csv
    updateDraft({
      importFileName: file.name,
      importedEmails: [],
      listName: file.name.replace(/\.[^.]+$/, ""),
    });
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  const canProceed = draft.listName || draft.importFileName;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-black mb-1">
          Choose your audience
        </h2>
        <p className="text-xs text-slate-500">
          Pick an existing list or import contacts from a spreadsheet.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["existing", "import"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-xs font-bold px-5 py-2 rounded-lg transition-all capitalize ${
              activeTab === t
                ? "bg-white text-black shadow-sm"
                : "text-slate-500 hover:text-black"
            }`}
          >
            {t === "existing" ? "Existing Lists" : "Import Sheet"}
          </button>
        ))}
      </div>

      {activeTab === "existing" && (
        <div className="flex flex-col gap-2">
          {EXISTING_LISTS.map((list) => (
            <button
              key={list.id}
              onClick={() =>
                updateDraft({
                  listName: list.name,
                  importFileName: null,
                  importedEmails: [],
                })
              }
              className={`flex items-center justify-between px-5 py-4 rounded-xl border text-left transition-all ${
                draft.listName === list.name && !draft.importFileName
                  ? "border-black bg-black/[0.03] shadow-sm"
                  : "border-slate-200 hover:border-slate-400"
              }`}
            >
              <div>
                <p className="text-sm font-semibold text-black">{list.name}</p>
                <p className="text-[11px] text-slate-400 mt-0.5">
                  {list.count.toLocaleString()} contacts
                </p>
              </div>
              <div
                className={`w-4 h-4 rounded-full border-2 transition-all ${
                  draft.listName === list.name && !draft.importFileName
                    ? "border-black bg-black"
                    : "border-slate-300"
                }`}
              />
            </button>
          ))}
        </div>
      )}

      {activeTab === "import" && (
        <div className="flex flex-col gap-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileRef.current?.click()}
            className={`relative border-2 border-dashed rounded-2xl p-10 flex flex-col items-center justify-center cursor-pointer transition-all ${
              dragOver
                ? "border-black bg-slate-50"
                : "border-slate-200 hover:border-slate-400 hover:bg-slate-50/50"
            }`}
          >
            <input
              ref={fileRef}
              type="file"
              accept=".xlsx,.xls,.csv"
              className="hidden"
              onChange={(e) =>
                e.target.files?.[0] && handleFile(e.target.files[0])
              }
            />
            {draft.importFileName ? (
              <div className="flex flex-col items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center">
                  <FileSpreadsheet size={22} className="text-emerald-600" />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-black">
                    {draft.importFileName}
                  </p>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Click to replace
                  </p>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    updateDraft({
                      importFileName: null,
                      importedEmails: [],
                      listName: "",
                    });
                  }}
                  className="flex items-center gap-1.5 text-[11px] font-bold text-red-500 hover:text-red-700 mt-1"
                >
                  <X size={12} /> Remove file
                </button>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-3 text-center">
                <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
                  <Upload size={20} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-black">
                    Drop your spreadsheet here
                  </p>
                  <p className="text-[11px] text-slate-400 mt-1">
                    Supports .xlsx, .xls, .csv · one email per row
                  </p>
                </div>
                <span className="text-[11px] font-bold text-blue-600 underline underline-offset-2">
                  Browse files
                </span>
              </div>
            )}
          </div>

          {/* Format hint */}
          <div className="bg-slate-50 border border-slate-100 rounded-xl px-5 py-4">
            <p className="text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2">
              Expected columns
            </p>
            <div className="flex flex-wrap gap-2">
              {["email *", "first_name", "last_name", "phone"].map((col) => (
                <span
                  key={col}
                  className="text-[11px] font-semibold bg-white border border-slate-200 text-slate-600 px-3 py-1 rounded-lg"
                >
                  {col}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Next */}
      <div className="flex justify-end pt-2">
        <button
          disabled={!canProceed}
          onClick={() => setStep(2)}
          className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-black/10 disabled:shadow-none"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
