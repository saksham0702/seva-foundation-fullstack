import type { Metadata } from "next";
import { constructMetadata } from "@/lib/seo";

export const metadata: Metadata = constructMetadata({
  title: "About Us",
  description:
    "Learn about Seva India Foundation — a registered Section 8 NGO based in Dehradun, Uttarakhand. Our mission is care, compassion, and change across healthcare, education, and disaster relief.",
  keywords: [
    "Seva India Foundation About",
    "NGO Dehradun",
    "Section 8 Company India",
    "Charity About Us",
    "Mission Vision NGO",
    "Social Impact India",
  ],
  canonicalPath: "/about",
});

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
