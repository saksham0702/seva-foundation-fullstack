"use client";

import { useState } from "react";
import { Plus, Eye, Check } from "lucide-react";
import { useEmailMarketing } from "../../EmailMarketingProvider";

const TEMPLATES = [
  {
    id: "t1",
    name: "Donation Appeal",
    category: "Fundraising",
    preview: "bg-gradient-to-br from-blue-50 to-blue-100",
    accent: "bg-blue-500",
    lines: [6, 10, 8, 10, 5],
  },
  {
    id: "t2",
    name: "Campaign Update",
    category: "Newsletter",
    preview: "bg-gradient-to-br from-slate-50 to-slate-100",
    accent: "bg-slate-700",
    lines: [5, 10, 10, 7],
  },
  {
    id: "t3",
    name: "Thank You",
    category: "Transactional",
    preview: "bg-gradient-to-br from-emerald-50 to-emerald-100",
    accent: "bg-emerald-500",
    lines: [4, 8, 10, 6, 8],
  },
  {
    id: "t4",
    name: "Event Invitation",
    category: "Event",
    preview: "bg-gradient-to-br from-violet-50 to-violet-100",
    accent: "bg-violet-500",
    lines: [7, 10, 5, 10, 4],
  },
  {
    id: "t5",
    name: "Emergency Alert",
    category: "Urgent",
    preview: "bg-gradient-to-br from-red-50 to-red-100",
    accent: "bg-red-500",
    lines: [5, 10, 8],
  },
];

export function StepTemplate() {
  const { draft, updateDraft, setStep } = useEmailMarketing();
  const [activeTab, setActiveTab] = useState<"gallery" | "custom">("gallery");

  function selectTemplate(id: string, name: string) {
    updateDraft({ templateId: id, templateName: name });
  }

  const canProceed = draft.templateId && draft.subject;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-black mb-1">
          Design your email
        </h2>
        <p className="text-xs text-slate-500">
          Pick a template to start with, then fill in the subject line.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["gallery", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-xs font-bold px-5 py-2 rounded-lg transition-all ${
              activeTab === t
                ? "bg-white text-black shadow-sm"
                : "text-slate-500 hover:text-black"
            }`}
          >
            {t === "gallery" ? "Template Gallery" : "Blank / Custom"}
          </button>
        ))}
      </div>

      {activeTab === "gallery" && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {TEMPLATES.map((tpl) => {
            const selected = draft.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl.id, tpl.name)}
                className={`group relative rounded-2xl border-2 overflow-hidden text-left transition-all ${
                  selected
                    ? "border-black shadow-md"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                {/* Mini preview */}
                <div className={`${tpl.preview} h-36 p-4 flex flex-col gap-2`}>
                  <div className={`h-2.5 rounded-full w-1/2 ${tpl.accent}`} />
                  {tpl.lines.map((w, i) => (
                    <div
                      key={i}
                      className="h-1.5 rounded-full bg-black/10"
                      style={{ width: `${w * 10}%` }}
                    />
                  ))}
                  <div
                    className={`mt-auto h-6 w-24 rounded-lg ${tpl.accent} opacity-80`}
                  />
                </div>

                {/* Label */}
                <div className="px-4 py-3 bg-white flex items-center justify-between">
                  <div>
                    <p className="text-[11px] font-bold text-black">
                      {tpl.name}
                    </p>
                    <p className="text-[10px] text-slate-400">{tpl.category}</p>
                  </div>
                  {selected && (
                    <div className="w-5 h-5 rounded-full bg-black flex items-center justify-center">
                      <Check size={10} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </div>
              </button>
            );
          })}

          {/* Create new template */}
          <button className="rounded-2xl border-2 border-dashed border-slate-200 hover:border-slate-400 h-full min-h-[172px] flex flex-col items-center justify-center gap-2 transition-all text-slate-400 hover:text-black">
            <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center">
              <Plus size={18} />
            </div>
            <span className="text-[11px] font-bold">Create Template</span>
          </button>
        </div>
      )}

      {activeTab === "custom" && (
        <div className="border-2 border-dashed border-slate-200 rounded-2xl p-10 flex flex-col items-center justify-center gap-3 text-center">
          <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center">
            <Plus size={20} className="text-slate-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-black">
              Start from scratch
            </p>
            <p className="text-[11px] text-slate-400 mt-1">
              Open the email builder to design a custom layout
            </p>
          </div>
          <button
            onClick={() =>
              updateDraft({
                templateId: "custom",
                templateName: "Custom Template",
              })
            }
            className="text-[11px] font-bold text-blue-600 underline underline-offset-2"
          >
            Open Builder →
          </button>
        </div>
      )}

      {/* Subject + preview text */}
      <div className="flex flex-col gap-4 pt-2">
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Subject Line <span className="text-red-400">*</span>
          </label>
          <input
            type="text"
            value={draft.subject}
            onChange={(e) => updateDraft({ subject: e.target.value })}
            placeholder="e.g. Help us reach our goal — donate today"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
            Preview Text
          </label>
          <input
            type="text"
            value={draft.previewText}
            onChange={(e) => updateDraft({ previewText: e.target.value })}
            placeholder="Short teaser shown in inbox preview…"
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
          />
        </div>
      </div>

      {/* Navigation */}
      <div className="flex justify-between pt-2">
        <button
          onClick={() => setStep(1)}
          className="text-sm font-bold text-slate-500 hover:text-black transition-colors px-4 py-3"
        >
          ← Back
        </button>
        <button
          disabled={!canProceed}
          onClick={() => setStep(3)}
          className="bg-black hover:bg-slate-800 disabled:bg-slate-200 disabled:text-slate-400 text-white text-sm font-bold px-8 py-3 rounded-xl transition-all shadow-lg shadow-black/10 disabled:shadow-none"
        >
          Continue →
        </button>
      </div>
    </div>
  );
}
