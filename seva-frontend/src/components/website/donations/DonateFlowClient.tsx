"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, AlertCircle, Award, Download } from "lucide-react";

import { getCampaigns, type Campaign } from "@/app/api/campaign";
import type { Donor } from "@/app/api/donor";
import type { Donation } from "@/app/api/donation";
import {
  getCertificateByDonor,
  generateCertificateForDonor,
  generatePdf,
  type Certificate,
} from "@/app/api/certificate";

import DonorForm from "@/components/website/donations/DonorForm";
import PaymentStep from "@/components/website/donations/PaymentStep";
import DonationResult from "@/components/website/donations/DonationResult";
import InitiativeDonationSection from "@/components/website/donations/InitiativeDonationSection";
import { getImageUrl } from "@/lib/image";

type Step = "donor" | "payment" | "success" | "failed";

export default function DonateFlowClient({
  initialCampaigns,
  initialCampaign,
}: {
  initialCampaigns?: Campaign[];
  initialCampaign?: Campaign | null;
} = {}) {
  const searchParams = useSearchParams();
  const campaignSlug = searchParams.get("campaign") || "";
  const amountParam = Number(searchParams.get("amount") || 0);

  const matchedInitial =
    initialCampaign ||
    (campaignSlug && initialCampaigns
      ? initialCampaigns.find((c) => c.slug === campaignSlug) || null
      : null);

  const [campaign, setCampaign] = useState<Campaign | null>(matchedInitial);
  const [loadingCampaign, setLoadingCampaign] = useState(
    !matchedInitial && !!campaignSlug && !initialCampaigns
  );
  const [campaignError, setCampaignError] = useState<string | null>(null);

  const [step, setStep] = useState<Step>("donor");
  const [donor, setDonor] = useState<Donor | null>(null);
  const [donation, setDonation] = useState<Donation | null>(null);

  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [certLoading, setCertLoading] = useState(false);

  useEffect(() => {
    if (step !== "success" || !donor?._id) return;

    let cancelled = false;

    const loadCertificate = async () => {
      if (certificate?.pdfUrl) return;

      setCertLoading(true);
      try {
        let cert = certificate;
        if (!cert) {
          cert = await getCertificateByDonor(donor._id);
        }
        if (!cert) {
          cert = await generateCertificateForDonor(donor._id);
        }
        if (cert && !cert.pdfUrl) {
          cert = await generatePdf(cert._id);
        }
        if (!cancelled && cert) setCertificate(cert);
      } catch (err) {
        console.error("Error generating/fetching certificate:", err);
      } finally {
        if (!cancelled) setCertLoading(false);
      }
    };

    const timer = setTimeout(loadCertificate, 800);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [step, donor?._id, certificate]);

  useEffect(() => {
    if (!campaignSlug) {
      setCampaign(null);
      setLoadingCampaign(false);
      return;
    }

    let cancelled = false;
    (async () => {
      try {
        setLoadingCampaign(true);
        setCampaignError(null);
        const campaigns = await getCampaigns();
        if (cancelled) return;

        const match = (campaigns || []).find((c) => c.slug === campaignSlug);
        if (match) {
          setCampaign(match);
        } else {
          setCampaignError("Campaign not found.");
        }
      } catch {
        if (!cancelled) {
          setCampaignError("Could not load campaign details right now.");
        }
      } finally {
        if (!cancelled) setLoadingCampaign(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [campaignSlug]);

  const handleDonorSaved = (savedDonor: Donor) => {
    setDonor(savedDonor);
    setStep("payment");
  };

  const handlePaymentResult = (savedDonation: Donation, cert?: Certificate) => {
    setDonation(savedDonation);
    if (cert) setCertificate(cert);
    if (savedDonation.paymentStatus === "SUCCESS") {
      setStep("success");
    } else {
      setStep("failed");
    }
  };

  const handleRetry = () => {
    setStep("donor");
    setDonation(null);
  };

  const activeCampaignImage = campaign?.images?.[0]
    ? getImageUrl(String(campaign.images[0]))
    : null;

  return (
    <div className="bg-[#f9fafb] min-h-screen">
      {/* If a campaign was requested via ?campaign=... */}
      {campaignSlug && (
        <div className="py-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link
            href={campaign ? `/campaigns/${campaign.slug}` : "/campaigns"}
            className="inline-flex items-center gap-2 text-sm text-gray-500 hover:text-[#1a3a6b] mb-6 transition-colors group"
          >
            <ArrowLeft
              size={16}
              className="group-hover:-translate-x-0.5 transition-transform"
            />
            {campaign ? `Back to ${campaign.name}` : "Back to Campaigns"}
          </Link>

          {loadingCampaign && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-gray-400">
              <Loader2 className="animate-spin" size={28} />
              <p className="text-sm">Loading campaign details…</p>
            </div>
          )}

          {!loadingCampaign && campaignError && (
            <div className="min-h-[40vh] flex flex-col items-center justify-center gap-3 text-center">
              <AlertCircle className="text-[#E8542A]" size={32} />
              <p className="text-[#0f2347] font-semibold text-sm">
                {campaignError}
              </p>
            </div>
          )}

          {!loadingCampaign && !campaignError && campaign && (
            <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
            {/* Campaign Header Band */}
            <div className="bg-gradient-to-r from-[#0f2347] to-[#1a3a6b] text-white p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {activeCampaignImage && (
                    <div className="relative w-16 h-16 rounded-2xl overflow-hidden flex-shrink-0 bg-white/10 border border-white/20">
                      <Image
                        src={activeCampaignImage}
                        alt={campaign.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                  )}
                  <div>
                    <span className="text-xs font-bold text-[#E8542A] uppercase tracking-wider">
                      Supporting Campaign
                    </span>
                    <h1 className="text-xl sm:text-2xl font-bold mt-0.5">
                      {campaign.name}
                    </h1>
                  </div>
                </div>

                <div className="flex items-center gap-2 bg-white/10 backdrop-blur-sm px-3.5 py-1.5 rounded-full text-xs font-semibold text-white/90">
                  <Award size={14} className="text-[#E8542A]" />
                  <span>80G Tax Exempted</span>
                </div>
              </div>

              {/* Progress Steps */}
              <div className="flex items-center gap-2 mt-6 pt-6 border-t border-white/10">
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${
                    step === "donor" ? "text-white" : "text-white/60"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                      step === "donor"
                        ? "bg-[#E8542A] text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    1
                  </span>
                  Donor Details
                </div>
                <div className="flex-1 h-0.5 bg-white/10" />
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${
                    step === "payment" ? "text-white" : "text-white/60"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                      step === "payment"
                        ? "bg-[#E8542A] text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    2
                  </span>
                  Payment
                </div>
                <div className="flex-1 h-0.5 bg-white/10" />
                <div
                  className={`flex items-center gap-2 text-xs font-bold ${
                    step === "success" || step === "failed"
                      ? "text-white"
                      : "text-white/60"
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                      step === "success" || step === "failed"
                        ? "bg-[#E8542A] text-white"
                        : "bg-white/20 text-white"
                    }`}
                  >
                    3
                  </span>
                  Confirmation
                </div>
              </div>
            </div>

            {/* Dynamic Step Content */}
            <div className="p-6 sm:p-10">
              {step === "donor" && (
                <DonorForm
                  campaignId={campaign._id}
                  amount={amountParam || 1000}
                  onCreated={handleDonorSaved}
                />
              )}

              {step === "payment" && donor && (
                <PaymentStep
                  donor={donor}
                  campaignId={campaign._id}
                  amount={amountParam || 1000}
                  onResult={handlePaymentResult}
                />
              )}

              {(step === "success" || step === "failed") && donor && (
                <div>
                  <DonationResult
                    status={step}
                    donation={donation}
                    donor={donor}
                    campaign={campaign}
                    onRetry={handleRetry}
                  />

                  {step === "success" && (
                    <div className="mt-8 pt-8 border-t border-gray-100">
                      <div className="bg-amber-50/60 border border-amber-200/70 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                        <div className="flex items-start gap-3.5">
                          <div className="w-10 h-10 rounded-xl bg-[#F5A623] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                            <Award size={22} />
                          </div>
                          <div>
                            <h4 className="text-sm font-bold text-[#0f2347]">
                              Instant 80G Tax Exemption Certificate
                            </h4>
                            <p className="text-xs text-gray-600 mt-1 max-w-md">
                              Your donation is 50% tax-exempt under Section 80G. Your verified digital certificate with authorized seal is ready.
                            </p>
                          </div>
                        </div>

                        {certLoading ? (
                          <div className="flex items-center gap-2 text-xs font-semibold text-gray-500 py-2 px-4 bg-white rounded-xl border border-gray-200">
                            <Loader2 size={14} className="animate-spin text-[#F5A623]" />
                            <span>Generating Certificate...</span>
                          </div>
                        ) : certificate?.pdfUrl ? (
                          <a
                            href={getImageUrl(certificate.pdfUrl)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                          >
                            <Download size={14} />
                            <span>Download 80G Certificate</span>
                          </a>
                        ) : certificate?.certificateNo ? (
                          <Link
                            href={`/verify/${certificate.certificateNo}`}
                            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#0f2347] hover:bg-[#1a3a6b] text-white text-xs font-bold rounded-xl transition-all shadow-sm shrink-0"
                          >
                            <Award size={14} />
                            <span>View Certificate #{certificate.certificateNo}</span>
                          </Link>
                        ) : (
                          <p className="text-[11px] text-gray-400 italic">
                            Certificate receipt dispatched to your email
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    )}

      {/* Direct Initiative Donation Section */}
      <div className={campaignSlug ? "mt-12" : ""}>
        <InitiativeDonationSection />
      </div>
    </div>
  );
}
