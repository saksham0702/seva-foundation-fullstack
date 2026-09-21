"use client";

import React, { useMemo, useState, useEffect } from "react";
import Link from "next/link";
import {
  Calendar,
  MapPin,
  Clock,
  ArrowRight,
  Loader2,
  Users,
  Search,
  Sparkles,
} from "lucide-react";
import { cmsAPI } from "@/app/api/cms";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";

function EventCard({ event }: { event: CmsItem }) {
  const isUpcoming =
    event.eventDate ? new Date(event.eventDate).getTime() >= Date.now() - 86400000 : true;

  return (
    <Link
      href={`/events/${event.slug}`}
      className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-cyan-500/40 hover:shadow-xl transition-all duration-300 flex flex-col"
    >
      <div className="relative h-52 overflow-hidden bg-slate-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(event.featuredImage)}
          alt={event.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getImageUrl(null);
          }}
        />
        <div className="absolute top-4 left-4 flex items-center gap-2">
          <span
            className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md ${
              isUpcoming
                ? "bg-emerald-600 text-white"
                : "bg-slate-700 text-slate-200"
            }`}
          >
            {isUpcoming ? "Upcoming Event" : "Past Event"}
          </span>
          <span className="px-3 py-1 bg-white/90 backdrop-blur-sm text-[#0A1A2F] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
            {event.category || "Community"}
          </span>
        </div>
      </div>

      <div className="p-6 flex flex-col flex-1">
        {/* Event Key Details Banner */}
        <div className="space-y-2 mb-4">
          {event.eventDate && (
            <div className="flex items-center gap-2 text-xs font-semibold text-cyan-700 bg-cyan-50 border border-cyan-100 px-3 py-1.5 rounded-lg">
              <Calendar size={13} className="shrink-0" />
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
            <div className="flex items-center gap-2 text-xs text-gray-600">
              <MapPin size={13} className="text-red-500 shrink-0" />
              <span className="truncate">{event.eventLocation}</span>
            </div>
          )}
        </div>

        <h3 className="text-lg font-bold text-[#0A1A2F] leading-snug mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
          {event.title}
        </h3>

        <p className="text-sm text-gray-500 leading-relaxed mb-6 flex-1 line-clamp-3">
          {event.excerpt}
        </p>

        <div className="mt-auto pt-4 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs font-bold text-gray-400 flex items-center gap-1.5">
            <Users size={13} /> {event.eventOrganizer || "SEVA Foundation"}
          </span>
          <span className="inline-flex items-center gap-1 text-xs font-bold text-cyan-600 group-hover:underline">
            View Details <ArrowRight size={13} />
          </span>
        </div>
      </div>
    </Link>
  );
}

export default function EventsListingPage() {
  const [events, setEvents] = useState<CmsItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");

  useEffect(() => {
    async function loadEvents() {
      setIsLoading(true);
      try {
        const items = await cmsAPI.getItems("event");
        setEvents(items);
      } catch (err) {
        console.error("Failed to fetch events:", err);
      } finally {
        setIsLoading(false);
      }
    }
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    return events.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (event.eventLocation && event.eventLocation.toLowerCase().includes(search.toLowerCase()));

      const isUpcoming = event.eventDate
        ? new Date(event.eventDate).getTime() >= Date.now() - 86400000
        : true;

      const matchTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && isUpcoming) ||
        (timeFilter === "past" && !isUpcoming);

      return matchSearch && matchTime;
    });
  }, [events, search, timeFilter]);

  return (
    <div className="min-h-screen bg-white">
      {/* ── Hero ── */}
      <section className="relative min-h-[48vh] flex items-center overflow-hidden">
        <div className="absolute inset-0">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="https://images.unsplash.com/photo-1511578314322-379afb476865?w=1600&q=80"
            alt="Events & Health Camps"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0A1A2F]/90 via-[#0A1A2F]/85 to-[#0A1A2F]/95" />
        </div>

        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full text-center">
          <div className="inline-flex items-center gap-2 bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-3.5 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-4">
            <Sparkles size={13} /> Foundation Programs & Camps
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.1] mb-6">
            <span className="text-white">Events & </span>
            <span className="text-cyan-400">Community Drives</span>
          </h1>
          <div className="w-16 h-1 bg-cyan-400 mx-auto mb-6 rounded-full" />
          <p className="text-base sm:text-lg text-gray-300 leading-relaxed max-w-xl mx-auto">
            Participate in our health camps, fundraising galas, food distribution drives, and community outreach programs.
          </p>
        </div>
      </section>

      {/* ── Search & Filter Controls ── */}
      <section className="py-8 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by name or location…"
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#0A1A2F] focus:outline-none focus:border-cyan-500 shadow-sm"
              />
            </div>

            <div className="flex items-center gap-2">
              {(["all", "upcoming", "past"] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setTimeFilter(filter)}
                  className={`text-xs font-bold px-4 py-2 rounded-full capitalize transition-all border ${
                    timeFilter === filter
                      ? "bg-[#0A1A2F] border-[#0A1A2F] text-cyan-400 shadow-sm"
                      : "bg-white border-gray-200 text-gray-600 hover:border-gray-300"
                  }`}
                >
                  {filter === "all" ? "All Events" : `${filter} Events`}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Events Grid ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fc]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center gap-3">
              <Loader2 size={36} className="animate-spin text-cyan-500" />
              <p className="text-sm font-semibold text-[#0A1A2F]">Loading scheduled events…</p>
            </div>
          ) : filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard key={event.id || event.slug} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
              <p className="text-base font-bold text-[#0A1A2F] mb-1">No events found</p>
              <p className="text-gray-400 text-xs">
                No events match your current filter. Please check back soon.
              </p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
