"use client";
import Link from "next/link";
import { CampaignStepper } from "../components/CampaignStepper";
// import { CampaignSummary } from "../components/CampaignSummary";
import { StepBasicInfo } from "../components/steps/StepBasicInfo";
import { StepFunding } from "../components/steps/StepFunding";
import { StepContent } from "../components/steps/StepContent";
import { PageProvider, usePageProvider } from "../provider";
import withHOC from "@/lib/withHOC";

function CreateCampaignPage() {
  const { step } = usePageProvider();

  return (
    <div className="min-h-screen bg-bg">
      <div className="w-full px-4 py-2">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/campaigns"
            className="inline-flex items-center gap-1 text-muted hover:text-text-primary text-xs font-semibold mb-4 transition-colors"
          >
            Back to Campaigns
          </Link>
          <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
            Create Campaign
          </h1>
        </div>

        {/* Stepper */}
        <CampaignStepper />

        {/* Main layout */}
        <div className="w-full">
          {/* Form card */}
          <div className="bg-panel border border-border rounded-2xl  p-5">
            {step === 1 && <StepBasicInfo />}
            {step === 2 && <StepFunding />}
            {step === 3 && <StepContent />}
          </div>

          {/* Summary sidebar */}
          {/* <div className="sticky top-8">
            <CampaignSummary />
          </div> */}
        </div>
      </div>
    </div>
  );
}

export default withHOC(PageProvider, CreateCampaignPage);
