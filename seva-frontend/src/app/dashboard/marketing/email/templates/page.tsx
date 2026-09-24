"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function MailTemplatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/marketing/templates?type=email");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
      <Loader2 size={24} className="animate-spin text-navy" />
      Redirecting to Outreach Templates...
    </div>
  );
}
