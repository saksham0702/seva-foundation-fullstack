import React from "react";

export const inputCls =
  "w-full border border-border rounded-xl px-4 py-3 text-sm text-text-primary placeholder-faint focus:outline-none focus:ring-2 focus:ring-blueaccent/20 focus:border-blueaccent transition-all bg-bg";

export function Field({
  label,
  required,
  extra,
  hint,
  children,
}: {
  label: string;
  required?: boolean;
  extra?: React.ReactNode;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="flex items-center gap-1 text-xs font-bold text-muted uppercase tracking-wider mb-2">
        <div className="flex items-start gap-2">
          {label}
          {required && <span className="text-red-400">*</span>}
          {extra}
        </div>
      </label>
      {children}
      {hint && <p className="text-[11px] text-faint mt-1.5 leading-relaxed">{hint}</p>}
    </div>
  );
}
