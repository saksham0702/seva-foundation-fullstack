"use client";

import { useEmailMarketing, EmailStep } from "../EmailMarketingProvider";

const steps: { id: EmailStep; label: string; sub: string }[] = [
  { id: 1, label: "Audience", sub: "Import & select list" },
  { id: 2, label: "Template", sub: "Design your email" },
  { id: 3, label: "Send", sub: "Schedule & confirm" },
];

export function EmailCampaignStepper() {
  const { step, setStep } = useEmailMarketing();

  return (
    <div className="flex items-center gap-0 mb-8">
      {steps.map((s, i) => {
        const isActive = step === s.id;
        const isDone = step > s.id;
        return (
          <div key={s.id} className="flex items-center">
            <button
              onClick={() => isDone && setStep(s.id)}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all ${
                isActive
                  ? "bg-black text-white"
                  : isDone
                    ? "text-slate-700 hover:bg-slate-50 cursor-pointer"
                    : "text-slate-400 cursor-default"
              }`}
            >
              <span
                className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0 ${
                  isActive
                    ? "bg-white text-black"
                    : isDone
                      ? "bg-emerald-500 text-white"
                      : "bg-slate-200 text-slate-400"
                }`}
              >
                {isDone ? "✓" : s.id}
              </span>
              <span className="hidden sm:block text-left">
                <span className="block text-xs font-bold leading-tight">
                  {s.label}
                </span>
                <span
                  className={`block text-[10px] leading-tight ${isActive ? "text-slate-300" : "text-slate-400"}`}
                >
                  {s.sub}
                </span>
              </span>
            </button>
            {i < steps.length - 1 && (
              <div
                className={`h-px w-8 mx-1 ${step > s.id ? "bg-emerald-400" : "bg-slate-200"}`}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}
