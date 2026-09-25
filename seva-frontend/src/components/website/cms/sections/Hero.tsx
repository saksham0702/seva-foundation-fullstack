// components/website/cms/sections/Hero.tsx  (Server Component)
import Image from "next/image";
import { CmsPage } from "@/types/cms";

function getImageUrl(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith("http")) return path;
  const base = process.env.NEXT_PUBLIC_API_URL?.replace("/api", "") || "http://localhost:5000";
  return `${base}${path.startsWith("/") ? "" : "/"}${path}`;
}

interface HeroProps {
  data?: CmsPage | null;
}

export default function HeroSection({ data }: HeroProps) {
  const title = data?.title || "OUR LEGACY";
  const subtitle =
    data?.subtitle ||
    "\u201cA promise made in the streets of Dehradun, now echoing across India: No soul shall be forgotten, no hunger shall go unanswered.\u201d";
  const bannerImage = getImageUrl(data?.bannerImage);
  const bannerVideo = getImageUrl(data?.bannerVideo);

  const words = title.split(" ");
  const lastWord = words.pop();
  const firstWords = words.join(" ");

  return (
    <section className="relative w-full h-[480px] lg:h-[520px] flex items-center justify-center overflow-hidden">
      {/* Background Media */}
      <div className="absolute inset-0 bg-[#0B1120]">
        {bannerVideo ? (
          <video
            src={bannerVideo}
            autoPlay
            loop
            muted
            playsInline
            className="w-full h-full object-cover"
          />
        ) : bannerImage ? (
          <Image
            src={bannerImage}
            alt={title}
            fill
            priority
            sizes="100vw"
            className="object-cover"
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-[#0B1120] via-[#1a3a6b] to-[#E8542A]/20" />
        )}
        {/* Balanced backdrop overlay so media is rich while text is crystal clear */}
        <div className="absolute inset-0 bg-black/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B1120]/90 via-[#0B1120]/60 to-black/30" />
      </div>

      {/* Content */}
      <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-extrabold tracking-wide text-white drop-shadow-md">
          {firstWords && <span className="text-white">{firstWords} </span>}
          <span className="text-[#f5a623]">{lastWord}</span>
        </h1>
        <div className="w-16 h-1 bg-[#f5a623] mx-auto mt-4 mb-6 rounded-full" />
        <p className="text-white/90 italic text-base md:text-lg leading-relaxed max-w-2xl mx-auto drop-shadow-sm font-medium">
          {subtitle}
        </p>
      </div>
    </section>
  );
}
