"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Loader2, AlertCircle, ExternalLink } from "lucide-react";
import { getCampaignById, Campaign } from "@/app/api/campaign";
import { CampaignStepper } from "../components/CampaignStepper";
import { StepBasicInfo } from "../components/steps/StepBasicInfo";
import { StepFunding } from "../components/steps/StepFunding";
import { StepContent } from "../components/steps/StepContent";
import { PageProvider, usePageProvider } from "../provider";
import withHOC from "@/lib/withHOC";

function EditCampaignPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  const { step, setEditId, populateFromCampaign, form } = usePageProvider();

  const {
    data: campaign,
    isLoading,
    isError,
  } = useQuery<Campaign>({
    queryKey: ["campaign", id],
    queryFn: () => getCampaignById(id!),
    enabled: Boolean(id),
  });

  useEffect(() => {
    if (campaign && id) {
      setEditId(id);
      populateFromCampaign(campaign);
    }
  }, [campaign, id, setEditId, populateFromCampaign]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 size={36} className="animate-spin text-blueaccent" />
          <p className="text-sm font-semibold text-muted">Loading campaign...</p>
        </div>
      </div>
    );
  }

  if (isError || !campaign) {
    return (
      <div className="min-h-screen bg-bg flex items-center justify-center p-4">
        <div className="flex flex-col items-center gap-4 text-center max-w-md bg-panel border border-border p-8 rounded-2xl">
          <AlertCircle size={36} className="text-red-500" />
          <h2 className="text-lg font-bold text-text-primary">
            Campaign Not Found
          </h2>
          <p className="text-xs text-muted">
            The campaign you are trying to edit could not be found or has been removed.
          </p>
          <Link
            href="/dashboard/campaigns"
            className="mt-2 bg-blueaccent text-white px-5 py-2.5 rounded-xl font-bold text-xs hover:bg-blue-dark transition-all"
          >
            Back to Campaigns
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-bg">
      <div className="w-full px-4 py-2">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between flex-wrap gap-3">
          <div>
            <Link
              href="/dashboard/campaigns"
              className="inline-flex items-center gap-1 text-muted hover:text-text-primary text-xs font-semibold mb-2 transition-colors"
            >
              ← Back to Campaigns
            </Link>
            <h1 className="text-2xl font-semibold text-text-primary tracking-tight">
              Edit Campaign: <span className="text-blueaccent">{form.title || campaign.name}</span>
            </h1>
          </div>

          {campaign.slug && (
            <Link
              href={`/campaigns/${campaign.slug}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-xs font-bold text-muted hover:text-blueaccent border border-border hover:border-blueaccent/40 bg-panel px-4 py-2 rounded-xl transition-all"
            >
              <ExternalLink size={13} /> View on Website
            </Link>
          )}
        </div>

        {/* Stepper */}
        <CampaignStepper />

        {/* Main layout */}
        <div className="w-full">
          <div className="bg-panel border border-border rounded-2xl p-5">
            {step === 1 && <StepBasicInfo />}
            {step === 2 && <StepFunding />}
            {step === 3 && <StepContent />}
          </div>
        </div>
      </div>
    </div>
  );
}

export default withHOC(PageProvider, EditCampaignPage);
