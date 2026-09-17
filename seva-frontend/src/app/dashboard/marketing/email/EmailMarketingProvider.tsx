"use client";

import { createContext, useContext, useState, ReactNode } from "react";

export type EmailStep = 1 | 2 | 3;

export interface EmailCampaignDraft {
  // Step 1 – Audience
  listName: string;
  importedEmails: string[];
  importFileName: string | null;

  // Step 2 – Template
  templateId: string | null;
  templateName: string;
  subject: string;
  previewText: string;

  // Step 3 – Schedule
  senderName: string;
  senderEmail: string;
  scheduleType: "now" | "later";
  scheduledAt: string;
}

const defaultDraft: EmailCampaignDraft = {
  listName: "",
  importedEmails: [],
  importFileName: null,
  templateId: null,
  templateName: "",
  subject: "",
  previewText: "",
  senderName: "",
  senderEmail: "",
  scheduleType: "now",
  scheduledAt: "",
};

interface EmailMarketingContextType {
  step: EmailStep;
  setStep: (s: EmailStep) => void;
  draft: EmailCampaignDraft;
  updateDraft: (partial: Partial<EmailCampaignDraft>) => void;
}

const EmailMarketingContext = createContext<EmailMarketingContextType | null>(
  null,
);

export function EmailMarketingProvider({ children }: { children: ReactNode }) {
  const [step, setStep] = useState<EmailStep>(1);
  const [draft, setDraft] = useState<EmailCampaignDraft>(defaultDraft);

  const updateDraft = (partial: Partial<EmailCampaignDraft>) =>
    setDraft((prev) => ({ ...prev, ...partial }));

  return (
    <EmailMarketingContext.Provider
      value={{ step, setStep, draft, updateDraft }}
    >
      {children}
    </EmailMarketingContext.Provider>
  );
}

export function useEmailMarketing() {
  const ctx = useContext(EmailMarketingContext);
  if (!ctx)
    throw new Error(
      "useEmailMarketing must be used inside EmailMarketingProvider",
    );
  return ctx;
}
