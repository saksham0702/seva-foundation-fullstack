import Image from "next/image";

export default function WebsiteLoading() {
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white">
      {/* Thin progress bar at top */}
      <div className="absolute top-0 left-0 right-0 h-[3px] overflow-hidden">
        <div
          className="h-full bg-[#E8542A] rounded-full animate-website-progress"
          style={{ width: "100%" }}
        />
      </div>

      {/* Logo + pulse ring */}
      <div className="relative flex items-center justify-center mb-6">
        {/* Outer glow ring */}
        <span className="absolute inline-flex h-28 w-28 rounded-full bg-[#E8542A]/10 animate-ping" />
        {/* Inner static ring */}
        <span className="relative inline-flex h-24 w-24 rounded-full border-2 border-[#E8542A]/20 items-center justify-center bg-white shadow-xl shadow-orange-100 p-3">
          <Image
            src="/assets/seva-logo.png"
            alt="Seva India Foundation"
            width={64}
            height={64}
            priority
            className="h-16 w-auto object-contain"
          />
        </span>
      </div>

      {/* Brand name */}
      <p className="text-[#0f2347] font-bold text-base tracking-wide mb-1">
        Seva India Foundation
      </p>
      <p className="text-gray-400 text-xs tracking-widest uppercase animate-pulse">
        Loading…
      </p>

      <style>{`
        @keyframes website-progress {
          0%   { transform: translateX(-100%); }
          60%  { transform: translateX(0%); }
          100% { transform: translateX(0%); }
        }
        .animate-website-progress {
          animation: website-progress 1.4s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
