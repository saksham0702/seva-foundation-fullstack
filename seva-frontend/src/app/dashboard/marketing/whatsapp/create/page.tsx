"use client";

import Link from "next/link";
import { WAProvider, useWA } from "../WaProvider";
import { WAStepper } from "../components/WaStepper";
import { WASummary } from "../components/WaSummary";
import { StepWAAudience } from "../components/steps/StepWaAudienct";
import { StepWAMessage } from "../components/steps/StepWaMessage";
import { StepWASend } from "../components/steps/StepWaSend";

export default function CreateWABroadcastPage() {
  return (
    <WAProvider>
      <CreateWABroadcastContent />
    </WAProvider>
  );
}

function CreateWABroadcastContent() {
  const { step } = useWA();

  return (
    <div className="min-h-screen bg-white">
      <div className="w-full px-4 py-2">
        {/* Header */}
        <div className="mb-4">
          <Link
            href="/dashboard/marketing/whatsapp"
            className="inline-flex items-center gap-1 text-slate-500 hover:text-black text-xs font-semibold mb-4 transition-colors"
          >
            ← Back to WhatsApp Marketing
          </Link>
          <h1 className="text-2xl font-semibold text-black tracking-tight">
            New Broadcast
          </h1>
        </div>

        {/* Stepper */}
        <WAStepper />

        {/* Main layout */}
        <div className="grid grid-cols-1 xl:grid-cols-[1fr_280px] gap-8 items-start">
          {/* Step form */}
          <div className="bg-white border border-slate-200 rounded-2xl p-6">
            {step === 1 && <StepWAAudience />}
            {step === 2 && <StepWAMessage />}
            {step === 3 && <StepWASend />}
          </div>

          {/* Summary + phone preview */}
          <div className="sticky top-8">
            <WASummary />
          </div>
        </div>
      </div>
    </div>
  );
}
