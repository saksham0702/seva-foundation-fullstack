"use client";

import { useState } from "react";
import { Check, Image, FileText, X } from "lucide-react";
import { useWA } from "../../WaProvider";

const TEMPLATES = [
  {
    id: "wt1",
    name: "Donation Appeal",
    category: "Fundraising",
    body: "Hello {{name}} 👋\n\nWe're raising funds for *Clean Drinking Water* in rural Rajasthan. Every ₹500 helps provide clean water for a family.\n\nDonate here 👉 {{link}}\n\nThank you 🙏",
  },
  {
    id: "wt2",
    name: "Campaign Update",
    category: "Update",
    body: "Hi {{name}},\n\nGreat news! 🎉 We've reached *80% of our goal* for Digital Classrooms.\n\nHelp us cross the finish line 👉 {{link}}",
  },
  {
    id: "wt3",
    name: "Thank You",
    category: "Transactional",
    body: "Dear {{name}},\n\nThank you so much for your generous donation of ₹{{amount}} 🙏\n\nYour contribution is making a real difference. We'll keep you updated on the impact.",
  },
  {
    id: "wt4",
    name: "Event Reminder",
    category: "Event",
    body: "Hi {{name}} 👋\n\nThis is a reminder for our upcoming fundraiser event on *{{date}}* at {{venue}}.\n\nWe hope to see you there!",
  },
];

export function StepWAMessage() {
  const { draft, updateDraft, setStep } = useWA();
  const [activeTab, setActiveTab] = useState<"templates" | "custom">(
    "templates",
  );

  function selectTemplate(id: string, name: string, body: string) {
    updateDraft({ templateId: id, templateName: name, messageBody: body });
  }

  const canProceed = draft.messageBody.trim().length > 0;

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-base font-semibold text-black mb-1">
          Compose your message
        </h2>
        <p className="text-xs text-slate-500">
          Use a pre-approved template or write a custom message.{" "}
          <span className="text-amber-500 font-semibold">
            Note: WhatsApp Business API requires pre-approved templates for bulk
            sends.
          </span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-slate-100 rounded-xl w-fit">
        {(["templates", "custom"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className={`text-xs font-bold px-5 py-2 rounded-lg transition-all ${
              activeTab === t
                ? "bg-white text-black shadow-sm"
                : "text-slate-500 hover:text-black"
            }`}
          >
            {t === "templates" ? "Templates" : "Custom"}
          </button>
        ))}
      </div>

      {activeTab === "templates" && (
        <div className="flex flex-col gap-2">
          {TEMPLATES.map((tpl) => {
            const selected = draft.templateId === tpl.id;
            return (
              <button
                key={tpl.id}
                onClick={() => selectTemplate(tpl.id, tpl.name, tpl.body)}
                className={`flex items-start gap-4 px-5 py-4 rounded-xl border text-left transition-all ${
                  selected
                    ? "border-[#25D366] bg-[#25D366]/[0.04] shadow-sm"
                    : "border-slate-200 hover:border-slate-400"
                }`}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <p className="text-sm font-bold text-black">{tpl.name}</p>
                    <span className="text-[10px] font-semibold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                      {tpl.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-2 whitespace-pre-wrap leading-relaxed">
                    {tpl.body}
                  </p>
                </div>
                <div
                  className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                    selected
                      ? "border-[#25D366] bg-[#25D366]"
                      : "border-slate-300"
                  }`}
                >
                  {selected && (
                    <Check size={10} className="text-white" strokeWidth={3} />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      )}

      {activeTab === "custom" && (
        <div className="flex flex-col gap-3">
          <textarea
            value={draft.messageBody}
            onChange={(e) =>
              updateDraft({
                messageBody: e.target.value,
                templateId: "custom",
                templateName: "Custom",
              })
            }
            rows={6}
            placeholder={
              "Type your message here…\n\nUse {{name}} for personalisation."
            }
            className="w-full border border-slate-200 rounded-xl px-4 py-3 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors resize-none leading-relaxed"
          />
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-slate-400">
              Variables:{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                {"{{name}}"}
              </span>{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                {"{{amount}}"}
              </span>{" "}
              <span className="font-mono bg-slate-100 px-1.5 py-0.5 rounded">
                {"{{link}}"}
              </span>
            </p>
            <p className="text-[10px] text-slate-400">
              {draft.messageBody.length} / 1024
            </p>
          </div>
        </div>
      )}

      {/* Media attachment */}
      <div className="flex flex-col gap-3">
        <p className="text-[11px] font-bold uppercase tracking-widest text-slate-500">
          Attach Media{" "}
          <span className="font-normal normal-case text-slate-400">
            (optional)
          </span>
        </p>
        <div className="flex gap-2">
          {(["none", "image", "document"] as const).map((type) => (
            <button
              key={type}
              onClick={() =>
                updateDraft({ mediaType: type, mediaFileName: null })
              }
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-bold transition-all capitalize ${
                draft.mediaType === type
                  ? "border-black bg-black text-white"
                  : "border-slate-200 text-slate-500 hover:border-slate-400 hover:text-black"
              }`}
            >
              {type === "image" && <Image size={13} />}
              {type === "document" && <FileText size={13} />}
              {type === "none" ? "No media" : type}
            </button>
          ))}
        </div>
        {draft.mediaType !== "none" && (
          <div className="flex items-center gap-3 bg-slate-50 border border-slate-200 rounded-xl px-4 py-3">
            {draft.mediaFileName ? (
              <>
                <p className="text-sm text-black font-medium flex-1 truncate">
                  {draft.mediaFileName}
                </p>
                <button
                  onClick={() => updateDraft({ mediaFileName: null })}
                  className="text-slate-400 hover:text-black"
                >
                  <X size={14} />
                </button>
              </>
            ) : (
              <label className="flex items-center gap-2 cursor-pointer">
                <span className="text-[11px] font-bold text-[#25D366]">
                  + Upload {draft.mediaType}
                </span>
                <input
                  type="file"
                  accept={
                    draft.mediaType === "image" ? "image/*" : ".pdf,.doc,.docx"
                  }
                  className="hidden"
                  onChange={(e) =>
                    updateDraft({
                      mediaFileName: e.target.files?.[0]?.name || null,
                    })
                  }
                />
              </label>
            )}
          </div>
        )}
      </div>

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
