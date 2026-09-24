"use client";

import { useEffect, useState, Suspense } from "react";
import { usePathname, useSearchParams } from "next/navigation";

function DashboardTopLoaderInner() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Flash a subtle top progress bar upon screen transition
    setLoading(true);
    const timer = setTimeout(() => {
      setLoading(false);
    }, 280);

    return () => clearTimeout(timer);
  }, [pathname, searchParams]);

  if (!loading) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-[9999] h-[2.5px] bg-transparent pointer-events-none">
      <div className="h-full bg-gradient-to-r from-[#E8542A] via-[#C99E32] to-[#25D366] animate-pulse transition-all duration-300 w-full shadow-[0_0_10px_rgba(201,158,50,0.8)]" />
    </div>
  );
}

export default function DashboardTopLoader() {
  return (
    <Suspense fallback={null}>
      <DashboardTopLoaderInner />
    </Suspense>
  );
}
