import React from "react";
import { getServerCmsPage } from "@/lib/server-api";

/**
 * Extracts a clean Google Analytics Measurement ID (e.g. G-XXXXXXX, UA-XXXXX-X, GT-XXXXXXX)
 * from either a plain ID string or a pasted <script> snippet.
 */
function extractGaMeasurementId(raw: string): string | null {
  if (!raw) return null;
  const match = raw.match(/\b(G-[A-Z0-9]+|UA-[0-9]+-[0-9]+|GT-[A-Z0-9]+)\b/i);
  return match ? match[1] : null;
}

/**
 * Extracts clean verification token from either a raw token or full <meta ...> tag.
 */
function extractVerificationToken(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim();
  if (trimmed.includes("content=")) {
    const match = trimmed.match(/content=["']([^"']+)["']/i);
    if (match && match[1]) {
      return match[1].trim();
    }
  }
  return trimmed.replace(/^<meta[^>]*content=["']/i, "").replace(/["'][^>]*\/?>$/i, "").trim();
}

export default async function HeaderScripts() {
  const cmsPage = await getServerCmsPage("header-footer");
  const settings = cmsPage?.settings || {};

  const rawGaId = (settings.googleAnalyticsId || "").trim();
  const rawGsc = (settings.googleConsoleCode || "").trim();

  const verificationToken = extractVerificationToken(rawGsc);
  const gaMeasurementId = extractGaMeasurementId(rawGaId);

  return (
    <>
      {/* 1. Google Search Console Verification Meta */}
      {verificationToken && (
        <meta name="google-site-verification" content={verificationToken} />
      )}

      {/* 2. Official Google Analytics (GA4) Tag */}
      {gaMeasurementId && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
          />
          <script
            id="google-analytics-init"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${gaMeasurementId}', {
                  page_path: window.location.pathname,
                });
              `,
            }}
          />
        </>
      )}
    </>
  );
}
