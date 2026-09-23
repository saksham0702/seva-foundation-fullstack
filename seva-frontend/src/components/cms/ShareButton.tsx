"use client";

import React, { useState } from "react";
import { Share2 } from "lucide-react";
import ShareModal from "@/components/shared/ShareModal";

interface ShareButtonProps {
  title: string;
  description?: string;
  headingColor?: string;
}

export function ShareButton({ title, description, headingColor }: ShareButtonProps) {
  const [shareOpen, setShareOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setShareOpen(true)}
        className="inline-flex items-center gap-2 px-5 py-2.5 bg-white border border-gray-200 text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-sm hover:shadow"
        style={{ color: headingColor }}
      >
        <Share2 size={14} />
        Share
      </button>

      <ShareModal
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title={title}
        description={description}
      />
    </>
  );
}
