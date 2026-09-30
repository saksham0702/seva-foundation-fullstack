import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/lib/query-provider";
import { ToastProvider } from "@/lib/toast";
import { AuthProvider } from "@/context/AuthContext";
import HeaderScripts from "@/components/website/layout/HeaderScripts";

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
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${poppins.variable} h-full antialiased`} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon-96x96.png" sizes="96x96" type="image/png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" sizes="180x180" />
        <HeaderScripts />
      </head>
      <body className="font-sans min-h-screen">
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