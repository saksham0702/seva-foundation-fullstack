"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type WAStep = 1 | 2 | 3;

export type WAAudienceType =
  | "ALL_DONORS"
  | "PAID_DONORS"
  | "RECURRING_DONORS"
  | "FAILED_PAYMENT_DONORS"
  | "VOLUNTEERS"
  | "LEADS"
  | "CUSTOM_FILE";

export interface WADraft {
  // Campaign Info
  name: string;
  description: string;
  provider: "BAILEYS" | "OFFICIAL_API";

  // Step 1 – Audience
  audienceType: WAAudienceType;
  audienceFilter?: {
    campaignId?: string;
    volunteerCategory?: string;
    leadSource?: string;
    leadStatus?: string;
  };
  customRecipients: Array<{ name: string; phone: string; variables?: any }>;
  importFileName: string | null;
  estimatedRecipientCount: number;

  // Step 2 – Message
  templateId: string | null;
  templateName: string;
  messageBody: string;
  mediaType: "none" | "image" | "document";
  mediaUrl: string;
  mediaFileName: string | null;

  // Step 3 – Anti-ban & Schedule
  antiBanConfig: {
    minDelaySeconds: number;
    maxDelaySeconds: number;
    maxMessagesIn20Seconds: number;
    batchSize: number;
    batchPauseSeconds: number;
  };
  scheduleType: "now" | "later";
  scheduledAt: string;
}

const defaultDraft: WADraft = {
  name: "",
  description: "",
  provider: "BAILEYS",
  audienceType: "ALL_DONORS",
  customRecipients: [],
  importFileName: null,
  estimatedRecipientCount: 0,
  templateId: null,
  templateName: "",
  messageBody: "",
  mediaType: "none",
  mediaUrl: "",
  mediaFileName: null,
  antiBanConfig: {
    minDelaySeconds: 3,
    maxDelaySeconds: 20,
    maxMessagesIn20Seconds: 5,
    batchSize: 50,
    batchPauseSeconds: 45,
  },
  scheduleType: "now",
  scheduledAt: "",
};

interface WAContextType {
  step: WAStep;
  setStep: (s: WAStep) => void;
  draft: WADraft;
  updateDraft: (partial: Partial<WADraft>) => void;
  resetDraft: () => void;
}

const WAContext = createContext<WAContextType | null>(null);

export function WAProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<WAStep>(1);
  const [draft, setDraft] = useState<WADraft>(defaultDraft);

  const updateDraft = (partial: Partial<WADraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  const resetDraft = () => {
    setStep(1);
    setDraft(defaultDraft);
  };

  return (
    <WAContext.Provider value={{ step, setStep, draft, updateDraft, resetDraft }}>
      {children}
    </WAContext.Provider>
  );
}

export function useWA() {
  const ctx = useContext(WAContext);
  if (!ctx) throw new Error("useWA must be used inside WAProvider");
  return ctx;
}
