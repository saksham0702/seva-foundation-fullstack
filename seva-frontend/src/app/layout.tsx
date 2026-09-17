import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query-provider";
import { ToastProvider } from "@/lib/toast";
import { AuthProvider } from "@/context/AuthContext";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["100", "200", "300", "400", "500", "600", "700", "800", "900"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: {
    default: "Seva India Foundation | Care, Compassion & Change",
    template: "%s | Seva India Foundation",
  },
  description:
    "Seva India Foundation is a registered Section 8 NGO committed to healthcare, education, nutrition, and disaster relief across India. Donate with 80G tax benefits.",
  keywords: [
    "Seva India Foundation",
    "NGO India",
    "Donate India",
    "Section 8 Company",
    "80G Tax Exemption",
    "Social Impact",
    "Charity India",
  ],
  metadataBase: new URL("https://sevaindiafoundation.org"),
  openGraph: {
    siteName: "Seva India Foundation",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    site: "@sevaindia",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full antialiased" suppressHydrationWarning>
      <body className={`${poppins.variable} font-sans min-h-screen`}>
        <QueryProvider>
          <ToastProvider>
            <AuthProvider>
              {children}
            </AuthProvider>
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}