"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

export default function WhatsAppTemplatesRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/dashboard/marketing/templates?type=whatsapp");
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center text-xs text-slate-400 gap-2">
      <Loader2 size={24} className="animate-spin text-[#25D366]" />
      Loading WhatsApp Templates...
    </div>
  );
}
