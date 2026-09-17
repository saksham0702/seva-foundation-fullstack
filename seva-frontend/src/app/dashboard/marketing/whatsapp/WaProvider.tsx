"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type WAStep = 1 | 2 | 3;

export interface WADraft {
  // Step 1 – Audience
  listName: string;
  importedNumbers: string[];
  importFileName: string | null;

  // Step 2 – Message
  templateId: string | null;
  templateName: string;
  messageBody: string;
  mediaType: "none" | "image" | "document";
  mediaFileName: string | null;

  // Step 3 – Schedule
  scheduleType: "now" | "later";
  scheduledAt: string;
}

const defaultDraft: WADraft = {
  listName: "",
  importedNumbers: [],
  importFileName: null,
  templateId: null,
  templateName: "",
  messageBody: "",
  mediaType: "none",
  mediaFileName: null,
  scheduleType: "now",
  scheduledAt: "",
};

interface WAContextType {
  step: WAStep;
  setStep: (s: WAStep) => void;
  draft: WADraft;
  updateDraft: (partial: Partial<WADraft>) => void;
}

const WAContext = createContext<WAContextType | null>(null);

export function WAProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<WAStep>(1);
  const [draft, setDraft] = useState<WADraft>(defaultDraft);

  const updateDraft = (partial: Partial<WADraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  return (
    <WAContext.Provider value={{ step, setStep, draft, updateDraft }}>
      {children}
    </WAContext.Provider>
  );
}

export function useWA() {
  const ctx = useContext(WAContext);
  if (!ctx) throw new Error("useWA must be used inside WAProvider");
  return ctx;
}
