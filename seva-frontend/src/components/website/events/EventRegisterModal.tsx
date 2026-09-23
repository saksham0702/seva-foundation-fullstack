"use client";

import React, { useState } from "react";
import { X, Calendar, MapPin, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { createLead } from "@/app/api/leads";

interface EventRegisterModalProps {
  event: {
    id?: string;
    slug: string;
    title: string;
    eventDate?: string;
    eventLocation?: string;
    eventOrganizer?: string;
  };
  onClose: () => void;
}

export function EventRegisterModal({ event, onClose }: EventRegisterModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim() || !phone.trim()) {
      setError("Please fill all required fields (*)");
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await createLead({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        source: "EVENT_REGISTRATION" as any,
        status: "NEW",
        notes: `Registered for Event: "${event.title}" on ${
          event.eventDate ? new Date(event.eventDate).toLocaleDateString("en-IN") : "Upcoming"
        } at ${event.eventLocation || "Venue TBD"}.`,
      });
      setSuccess(true);
    } catch (err: any) {
      console.error(err);
      setError(err?.response?.data?.message || "Failed to register. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Portal>
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
          onClick={onClose}
        />

        {/* Modal Window */}
        <div className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-gray-100 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl z-10 overflow-hidden">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-1.5 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X size={18} />
          </button>

          {success ? (
            <div className="text-center py-6 space-y-4">
              <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <CheckCircle2 size={32} />
              </div>
              <h3 className="text-xl font-bold text-[#0A1A2F] dark:text-white">
                Registration Confirmed!
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed max-w-xs mx-auto">
                Thank you <strong className="text-gray-700 dark:text-gray-200">{name}</strong>. You are successfully registered for <strong>{event.title}</strong>. Our team will send event passes & reminders to your contact details.
              </p>
              <button
                type="button"
                onClick={onClose}
                className="mt-4 px-6 py-2.5 rounded-xl bg-[#0A1A2F] dark:bg-cyan-600 text-white font-bold text-xs uppercase tracking-wider hover:opacity-90 transition-opacity"
              >
                Done
              </button>
            </div>
          ) : (
            <div>
              {/* Event Mini Card */}
              <div className="mb-5">
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-cyan-50 dark:bg-cyan-950/40 text-cyan-700 dark:text-cyan-300 text-[10.5px] font-bold uppercase tracking-wider mb-2">
                  <Sparkles size={11} />
                  Event RSVP / Registration
                </div>
                <h3 className="text-lg font-bold text-[#0A1A2F] dark:text-white line-clamp-2">
                  {event.title}
                </h3>

                <div className="flex flex-col gap-1 mt-2 text-xs text-gray-500 dark:text-gray-400">
                  {event.eventDate && (
                    <div className="flex items-center gap-1.5">
                      <Calendar size={13} className="text-cyan-600 shrink-0" />
                      <span>
                        {new Date(event.eventDate).toLocaleDateString("en-IN", {
                          weekday: "short",
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                    </div>
                  )}
                  {event.eventLocation && (
                    <div className="flex items-center gap-1.5">
                      <MapPin size={13} className="text-red-500 shrink-0" />
                      <span className="truncate">{event.eventLocation}</span>
                    </div>
                  )}
                </div>
              </div>

              {error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-600 dark:text-rose-300 text-xs font-medium">
                  {error}
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Ramesh Sharma"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    Email Address <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. ramesh@example.com"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-600 dark:text-gray-300 mb-1">
                    WhatsApp / Mobile Number <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +91 98765 43210"
                    className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-xs text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-cyan-500/30 font-mono"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loading && <Loader2 size={15} className="animate-spin" />}
                    <span>Confirm Event Registration</span>
                  </button>
                  <p className="text-[10px] text-gray-400 text-center mt-2">
                    Free Registration · Instant Confirmation
                  </p>
                </div>
              </form>
            </div>
          )}
        </div>
      </div>
    </Portal>
  );
}
