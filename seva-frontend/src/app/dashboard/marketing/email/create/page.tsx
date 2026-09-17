"use client";

// import Link from "next/link";
import {
  EmailMarketingProvider,
  useEmailMarketing,
} from "@/app/dashboard/marketing/email/EmailMarketingProvider";
import { EmailCampaignStepper } from "@/app/dashboard/marketing/email/components/EmailCampaignStepper";
import { EmailCampaignSummary } from "@/app/dashboard/marketing/email/components/EmailCampaignSummary";
import { StepAudience } from "@/app/dashboard/marketing/email/components/steps/StepAudience";
import { StepTemplate } from "@/app/dashboard/marketing/email/components/steps/StepTemplate";
import { StepSend } from "@/app/dashboard/marketing/email/components/steps/StepSend";

export default function CreateEmailCampaignPage() {
  return (
    <EmailMarketingProvider>
      <CreateEmailCampaignContent />
    </EmailMarketingProvider>
  );
}

function CreateEmailCampaignContent() {
  const { step } = useEmailMarketing();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-2">
        {/* Header */}
        <div className="mb-4">
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            New Email Campaign
          </h1>
        </div>

        {/* Stepper */}
        <EmailCampaignStepper />

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_320px] gap-8 items-start">
          {/* Step form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {step === 1 && <StepAudience />}
            {step === 2 && <StepTemplate />}
            {step === 3 && <StepSend />}
          </div>

          {/* Summary sidebar */}
          <div className="sticky top-8">
            <EmailCampaignSummary />
          </div>
        </div>
      </div>
    </div>
  );
}
