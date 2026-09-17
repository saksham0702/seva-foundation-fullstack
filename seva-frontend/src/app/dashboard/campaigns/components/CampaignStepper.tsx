"use client";

import { Check } from "lucide-react";
import { useCampaign } from "../provider";

const STEPS = [
  { n: 1, label: "Basic Info" },
  { n: 2, label: "Funding & Products" },
  { n: 3, label: "Content & FAQs" },
];

export function CampaignStepper() {
  const { step, setStep, isEditing } = useCampaign();
  return (
    <div className="flex items-center gap-6 mb-2 overflow-x-auto pb-2 scrollbar-none">
      {STEPS.map(({ n, label }, i) => (
        <div key={n} className="flex items-center gap-6 shrink-0">
          <button
            type="button"
            onClick={() => (isEditing || n < step) && setStep(n)}
            className={`flex items-center gap-3 text-xs font-bold transition-colors ${
              step === n
                ? "text-text-primary"
                : isEditing || step > n
                  ? "text-emerald-accent cursor-pointer hover:opacity-80"
                  : "text-muted cursor-not-allowed"
            }`}
          >
            <span
              className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-black border-2 transition-all ${
                step === n
                  ? "border-blueaccent bg-blueaccent text-white shadow-lg shadow-blueaccent/20"
                  : step > n
                    ? "border-emerald-accent bg-emerald-accent/10 text-emerald-accent"
                    : isEditing
                      ? "border-emerald-accent/40 bg-panel text-text-primary"
                      : "border-border text-muted"
              }`}
            >
              {step > n ? <Check size={16} strokeWidth={3} /> : n}
            </span>
            <span className="uppercase tracking-widest">{label}</span>
          </button>
          {i < STEPS.length - 1 && (
            <div
              className={`w-12 h-px ${step > n ? "bg-emerald-accent" : "bg-border"}`}
            />
          )}
        </div>
      ))}
    </div>
  );
}
