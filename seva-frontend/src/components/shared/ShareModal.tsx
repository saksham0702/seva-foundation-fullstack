"use client";

import React, { useState, useEffect } from "react";
import { X, Check, Copy, Share2, MessageCircle, Send } from "lucide-react";
import { Portal } from "./Portal";

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
}

export default function ShareModal({
  isOpen,
  onClose,
  title,
  url,
  description,
}: ShareModalProps) {
  const [copied, setCopied] = useState(false);
  const [instagramNotice, setInstagramNotice] = useState(false);

  const shareUrl =
    url || (typeof window !== "undefined" ? window.location.href : "");
  const shareText = description || title;

  useEffect(() => {
    if (!isOpen) {
      setCopied(false);
      setInstagramNotice(false);
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCopy = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleNativeShare = () => {
    if (typeof navigator !== "undefined" && navigator.share) {
      navigator.share({
        title,
        text: shareText,
        url: shareUrl,
      }).catch(() => {});
    }
  };

  const handleInstagram = () => {
    handleCopy();
    setInstagramNotice(true);
    setTimeout(() => setInstagramNotice(false), 4000);
  };

  const openShare = (link: string) => {
    window.open(link, "_blank", "noopener,noreferrer,width=600,height=500");
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-200">
      <div
        className="relative w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center transition-colors"
          aria-label="Close modal"
        >
          <X size={18} />
        </button>

        {/* Header */}
        <div className="text-left mb-6">
          <div className="w-10 h-10 rounded-2xl bg-[#0f2347]/10 text-[#0f2347] flex items-center justify-center mb-3">
            <Share2 size={20} />
          </div>
          <h3 className="text-xl font-bold text-[#0f2347] tracking-tight">
            Share this with others
          </h3>
          <p className="text-xs text-gray-500 mt-1 line-clamp-2">
            {title}
          </p>
        </div>

        {/* Social Share Buttons */}
        <div className="grid grid-cols-4 gap-3 mb-6">
          {/* WhatsApp */}
          <button
            onClick={() =>
              openShare(
                `https://api.whatsapp.com/send?text=${encodeURIComponent(
                  `${title}\n${shareUrl}`
                )}`
              )
            }
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#25D366] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <MessageCircle size={20} />
            </div>
            <span className="text-[11px] font-semibold">WhatsApp</span>
          </button>

          {/* Facebook */}
          <button
            onClick={() =>
              openShare(
                `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
                  shareUrl
                )}`
              )
            }
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-blue-50 hover:bg-blue-100 text-blue-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1877F2] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold">Facebook</span>
          </button>

          {/* Twitter / X */}
          <button
            onClick={() =>
              openShare(
                `https://twitter.com/intent/tweet?text=${encodeURIComponent(
                  title
                )}&url=${encodeURIComponent(shareUrl)}`
              )
            }
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-slate-50 hover:bg-slate-100 text-slate-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-black text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold">X (Twitter)</span>
          </button>

          {/* Instagram */}
          <button
            onClick={handleInstagram}
            className="flex flex-col items-center gap-2 p-3 rounded-2xl bg-pink-50 hover:bg-pink-100 text-pink-700 transition-all group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888] text-white flex items-center justify-center shadow-sm group-hover:scale-105 transition-transform">
              <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </div>
            <span className="text-[11px] font-semibold">Instagram</span>
          </button>
        </div>

        {/* Instagram info notice if clicked */}
        {instagramNotice && (
          <div className="mb-4 p-3 bg-pink-50 border border-pink-200 rounded-xl text-xs text-pink-700 text-center animate-in fade-in">
            Link copied to clipboard! Paste it into your Instagram story or bio.
          </div>
        )}

        {/* Copy Link Input */}
        <div className="mb-4">
          <label className="block text-[11px] font-semibold uppercase tracking-wider text-gray-400 mb-2">
            Page Link
          </label>
          <div className="flex items-center gap-2 p-1.5 bg-gray-50 border border-gray-200 rounded-2xl">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-transparent px-3 text-xs text-gray-700 font-mono outline-none truncate"
            />
            <button
              onClick={handleCopy}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                copied
                  ? "bg-emerald-600 text-white"
                  : "bg-[#0f2347] hover:bg-[#1a3a6b] text-white"
              }`}
            >
              {copied ? <Check size={14} /> : <Copy size={14} />}
              <span>{copied ? "Copied!" : "Copy"}</span>
            </button>
          </div>
        </div>

        {/* Other options (Email / Native) */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 text-xs">
          <button
            onClick={() =>
              openShare(
                `mailto:?subject=${encodeURIComponent(
                  title
                )}&body=${encodeURIComponent(`${shareText}\n\n${shareUrl}`)}`
              )
            }
            className="flex items-center gap-1.5 text-gray-500 hover:text-[#0f2347] font-semibold transition-colors"
          >
            <Send size={13} />
            <span>Email</span>
          </button>

          {typeof navigator !== "undefined" && (navigator as any).share && (
            <button
              onClick={handleNativeShare}
              className="flex items-center gap-1.5 text-[#E8542A] hover:text-[#c9431d] font-semibold transition-colors"
            >
              <Share2 size={13} />
              <span>More Options...</span>
            </button>
          )}
        </div>
      </div>
    </div>
  </Portal>
  );
}
