import React from "react";
import { Metadata } from "next";
import { getServerCertificate } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import CertificateDetailClient from "@/components/website/verify/CertificateDetailClient";

interface PageProps {
  params: Promise<{ certificateNo: string }> | { certificateNo: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const certificateNo = resolved?.certificateNo;
  if (!certificateNo) return constructMetadata({ title: "Certificate Verification" });

  const data = await getServerCertificate(certificateNo);
  const cert = data?.certificate;

  if (!cert) {
    return constructMetadata({
      title: "Certificate Not Found",
      description: `No issued certificate found for number ${certificateNo}.`,
      noIndex: true,
    });
  }

  return constructMetadata({
    title: `Verified Certificate - ${cert.recipientName} (${cert.certificateNo})`,
    description: `Official verified certificate awarded to ${cert.recipientName} for ${cert.programName} by Seva India Foundation.`,
    canonicalPath: `/verify/${cert.certificateNo}`,
    keywords: [
      "Verified Certificate",
      cert.recipientName,
      cert.certificateNo,
      cert.programName,
      "Seva India Foundation Certificate",
    ],
  });
}

export default async function CertificateVerificationPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const certificateNo = resolved?.certificateNo || "";

  const data = await getServerCertificate(certificateNo);

  return (
    <CertificateDetailClient
      certificateNo={certificateNo}
      cert={data?.certificate || null}
      valid={data?.valid ?? false}
      errorMessage={data?.message || null}
    />
  );
}
