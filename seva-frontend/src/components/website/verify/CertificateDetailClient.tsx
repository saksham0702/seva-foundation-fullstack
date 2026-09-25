"use client";

import React, { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  ShieldCheck,
  ShieldAlert,
  Download,
  CheckCircle2,
  Calendar,
  Award,
  ArrowLeft,
  Share2,
  Loader2,
} from "lucide-react";
import { Certificate, generatePdf } from "@/app/api/certificate";
import { getImageUrl } from "@/lib/image";
import ShareModal from "@/components/shared/ShareModal";

const TYPE_LABELS: Record<string, string> = {
  APPRECIATION: "Certificate of Appreciation",
  COMPLETION: "Certificate of Completion",
  PARTICIPATION: "Certificate of Participation",
  DONATION_ACKNOWLEDGEMENT: "Certificate of Donation",
  TRAINING: "Certificate of Training",
  OTHER: "Certificate",
};

interface CertificateDetailClientProps {
  certificateNo: string;
  cert: Certificate | null;
  valid: boolean;
  errorMessage?: string | null;
}

export default function CertificateDetailClient({
  certificateNo,
  cert,
  valid,
  errorMessage,
}: CertificateDetailClientProps) {
  const [shareOpen, setShareOpen] = useState(false);
  const [pdfUrl, setPdfUrl] = useState<string | null>(cert?.pdfUrl || null);
  const [generatingPdf, setGeneratingPdf] = useState(false);

  const pdfDownloadUrl = pdfUrl ? getImageUrl(pdfUrl) : null;

  const handleDownloadPdf = async () => {
    if (pdfDownloadUrl) {
      window.open(pdfDownloadUrl, "_blank");
      return;
    }
    if (!cert?._id) return;
    setGeneratingPdf(true);
    try {
      const updated = await generatePdf(cert._id);
      if (updated?.pdfUrl) {
        setPdfUrl(updated.pdfUrl);
        window.open(getImageUrl(updated.pdfUrl), "_blank");
      }
    } catch (err) {
      console.error("PDF generation failed:", err);
    } finally {
      setGeneratingPdf(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Navigation & Status Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <Link
            href="/verify"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-600 hover:text-[#0B2C6B] transition-colors"
          >
            <ArrowLeft size={14} />
            <span>Verify Another Certificate</span>
          </Link>

          {cert && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider bg-white shadow-sm border border-gray-200">
              {valid ? (
                <>
                  <ShieldCheck size={16} className="text-emerald-500" />
                  <span className="text-emerald-700">Official Authenticated Record</span>
                </>
              ) : (
                <>
                  <ShieldAlert size={16} className="text-rose-500" />
                  <span className="text-rose-700">Revoked / Invalid Certificate</span>
                </>
              )}
            </div>
          )}
        </div>

        {!cert ? (
          <div className="bg-white rounded-3xl p-12 shadow-lg border border-red-100 text-center">
            <div className="w-16 h-16 rounded-full bg-red-50 text-red-500 flex items-center justify-center mx-auto mb-4">
              <ShieldAlert size={32} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Certificate Verification Failed</h2>
            <p className="text-sm text-gray-600 mt-2 max-w-md mx-auto">
              {errorMessage ||
                `No issued certificate was found matching code "${certificateNo}". Please check the certificate number and try again.`}
            </p>
            <Link
              href="/verify"
              className="inline-block mt-6 px-6 py-2.5 bg-[#0B2C6B] text-white text-xs font-semibold rounded-xl"
            >
              Try Again
            </Link>
          </div>
        ) : (
          <>
            {/* Visual Certificate Card */}
            <div className="relative bg-white rounded-3xl shadow-2xl border-8 border-[#0B2C6B] p-6 sm:p-12 overflow-hidden print:shadow-none">
              <div className="absolute inset-2 sm:inset-3 border-2 border-[#D4A843] rounded-2xl pointer-events-none opacity-80" />

              {cert.signatures?.seal?.imageUrl && (
                <div className="absolute inset-0 m-auto w-64 h-64 opacity-5 pointer-events-none">
                  <Image
                    src={getImageUrl(cert.signatures.seal.imageUrl)}
                    alt="Watermark Seal"
                    fill
                    sizes="256px"
                    className="object-contain"
                  />
                </div>
              )}

              {/* Header */}
              <div className="text-center relative z-10 pt-2 pb-6">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-amber-50 text-amber-600 mb-2">
                  <Award size={26} />
                </div>
                <h2 className="text-2xl sm:text-3xl font-serif font-semibold text-[#0B2C6B] tracking-wide">
                  SEVA INDIA FOUNDATION
                </h2>
                <p className="text-[11px] sm:text-xs text-gray-500 font-medium mt-1">
                  Registered Section 8 Social Impact Organization | Care • Compassion • Change
                </p>
                <div className="w-48 h-0.5 bg-gradient-to-r from-transparent via-[#D4A843] to-transparent mx-auto mt-4 mb-5" />

                <h3 className="text-lg sm:text-2xl font-serif font-semibold text-[#0B2C6B] uppercase tracking-wider">
                  {TYPE_LABELS[cert.certificateType] || "Certificate of Appreciation"}
                </h3>
                <p className="text-xs sm:text-sm text-gray-500 italic mt-3">
                  This digital certificate is proudly presented to
                </p>
                <h1 className="text-2xl sm:text-4xl font-serif font-semibold text-gray-900 mt-2 tracking-tight">
                  {cert.recipientName}
                </h1>
              </div>

              {/* Body Text */}
              <div className="max-w-2xl mx-auto text-center relative z-10 my-4">
                <p className="text-xs sm:text-sm text-gray-700 leading-relaxed font-serif">
                  {cert.body ||
                    `In deep appreciation and grateful recognition of valuable contribution and dedication towards "${cert.programName}". Your support enables our ongoing initiatives to serve vulnerable communities.`}
                </p>
                <div className="mt-4 inline-block bg-slate-50 border border-slate-200 rounded-lg px-4 py-1.5 text-xs text-gray-700 font-semibold">
                  Program: {cert.programName}
                </div>
              </div>

              {/* Certificate Details & QR */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-b border-gray-100 py-4 my-6 relative z-10 text-xs text-gray-600">
                <div className="flex items-center gap-2">
                  <Calendar size={15} className="text-[#D4A843]" />
                  <span>
                    <strong className="text-gray-900">Issue Date:</strong>{" "}
                    {new Date(cert.issueDate).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="text-center font-mono text-xs text-gray-500">
                  <span className="text-gray-400">ID:</span> {cert.certificateNo}
                </div>

                {cert.qrCodeImage && (
                  <div className="flex items-center gap-2">
                    <Image
                      src={cert.qrCodeImage}
                      alt="Verification QR"
                      width={48}
                      height={48}
                      unoptimized
                      className="border border-gray-200 rounded p-0.5"
                    />
                    <div className="text-[10px] text-gray-400 leading-tight">
                      <span className="font-bold text-emerald-600">✓ Digital Verifiable</span>
                      <br />Scan to confirm
                    </div>
                  </div>
                )}
              </div>

              {/* Digital Signatures */}
              <div className="grid grid-cols-2 gap-8 pt-4 pb-2 relative z-10">
                <div className="flex flex-col items-center text-center">
                  <div className="h-16 flex items-end justify-center mb-1">
                    {cert.signatures?.secretary?.imageUrl ? (
                      <div className="relative h-14 w-[150px]">
                        <Image
                          src={getImageUrl(cert.signatures.secretary.imageUrl)}
                          alt="Secretary Signature"
                          fill
                          sizes="150px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-[11px] rounded border border-emerald-200">
                        ✓ Digitally Signed
                      </div>
                    )}
                  </div>
                  <div className="w-36 border-t-2 border-gray-800" />
                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                    {cert.signatures?.secretary?.signatoryName || "Authorized Signatory"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    {cert.signatures?.secretary?.label || "General Secretary"}
                  </p>
                </div>

                <div className="flex flex-col items-center text-center">
                  <div className="h-16 flex items-end justify-center mb-1">
                    {cert.signatures?.president?.imageUrl ? (
                      <div className="relative h-14 w-[150px]">
                        <Image
                          src={getImageUrl(cert.signatures.president.imageUrl)}
                          alt="President Signature"
                          fill
                          sizes="150px"
                          className="object-contain"
                        />
                      </div>
                    ) : (
                      <div className="px-3 py-1 bg-emerald-50 text-emerald-700 font-mono text-[11px] rounded border border-emerald-200">
                        ✓ Digitally Signed
                      </div>
                    )}
                  </div>
                  <div className="w-36 border-t-2 border-gray-800" />
                  <p className="text-xs sm:text-sm font-bold text-gray-900 mt-1">
                    {cert.signatures?.president?.signatoryName || "Authorized Signatory"}
                  </p>
                  <p className="text-[10px] sm:text-xs text-gray-500 font-medium">
                    {cert.signatures?.president?.label || "President / Trustee"}
                  </p>
                </div>
              </div>

              <div className="text-center text-[10px] text-gray-400 mt-6 pt-4 border-t border-gray-100">
                Issued by Seva India Foundation • Digitally validated on the Central Registry
              </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-wrap items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
              <div className="flex items-center gap-2 text-xs text-gray-600">
                <CheckCircle2 size={16} className="text-emerald-500" />
                <span>Certificate verified and secure</span>
              </div>

              <div className="flex items-center gap-3">
                {/* Download / Generate PDF */}
                <button
                  onClick={handleDownloadPdf}
                  disabled={generatingPdf}
                  className="inline-flex items-center gap-2 bg-[#0B2C6B] hover:bg-[#071d47] disabled:opacity-60 text-white text-xs font-semibold px-5 py-2.5 rounded-xl shadow-sm transition-all"
                >
                  {generatingPdf ? (
                    <Loader2 size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  <span>{generatingPdf ? "Generating…" : "Download Certificate"}</span>
                </button>

                <button
                  onClick={() => setShareOpen(true)}
                  className="inline-flex items-center gap-1.5 border border-gray-200 hover:border-gray-300 text-gray-700 text-xs font-semibold px-4 py-2.5 rounded-xl transition-all"
                >
                  <Share2 size={14} />
                  <span>Share Verification</span>
                </button>
              </div>
            </div>

            <ShareModal
              isOpen={shareOpen}
              onClose={() => setShareOpen(false)}
              title={`${cert.recipientName} - Certificate of Authenticity`}
              description={`Official verified Certificate (${cert.certificateNo}) awarded to ${cert.recipientName} for ${cert.programName} by Seva India Foundation.`}
            />
          </>
        )}
      </div>
    </div>
  );
}
