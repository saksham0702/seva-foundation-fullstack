export default function DashboardLoading() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center min-h-[60vh] w-full relative">
      {/* Thin gold progress bar at the very top of the content area */}
      <div className="absolute top-0 left-0 right-0 h-[2px] overflow-hidden rounded">
        <div className="h-full bg-gradient-to-r from-transparent via-[#C9A84C] to-transparent animate-dashboard-progress" />
      </div>

      {/* Three bouncing dots */}
      <div className="flex items-center gap-2 mb-4">
        <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-bounce [animation-delay:0ms]" />
        <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-bounce [animation-delay:150ms]" />
        <span className="h-2 w-2 rounded-full bg-[#C9A84C] animate-bounce [animation-delay:300ms]" />
      </div>

      <p className="text-white/30 text-xs tracking-widest uppercase font-medium">
        Loading
      </p>

      <style>{`
        @keyframes dashboard-progress {
          0%   { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-dashboard-progress {
          animation: dashboard-progress 1.2s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
}
