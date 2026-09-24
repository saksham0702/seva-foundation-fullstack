"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import {
  Calendar,
  MapPin,
  ArrowRight,
  Users,
  Search,
  CheckCircle2,
  Clock,
  Sparkles,
} from "lucide-react";
import { CmsItem } from "@/types/cms";
import { getImageUrl } from "@/lib/image";
import { EventRegisterModal } from "./EventRegisterModal";

function EventCard({
  event,
  onRegister,
}: {
  event: CmsItem;
  onRegister: (e: CmsItem) => void;
}) {
  const isUpcoming = event.eventDate
    ? new Date(event.eventDate).getTime() >= Date.now() - 86400000
    : true;

  const eventDateObj = event.eventDate ? new Date(event.eventDate) : null;

  return (
    <div className="group bg-white rounded-3xl overflow-hidden border border-gray-100 hover:border-cyan-500/40 hover:shadow-2xl transition-all duration-300 flex flex-col justify-between">
      <div>
        <div className="relative h-56 overflow-hidden bg-slate-100">
          <Image
            src={getImageUrl(event.featuredImage)}
            alt={event.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-10">
            <span
              className={`px-3 py-1 text-[10px] font-bold uppercase tracking-wider rounded-full shadow-md ${
                isUpcoming
                  ? "bg-emerald-600 text-white"
                  : "bg-slate-700 text-slate-200"
              }`}
            >
              {isUpcoming ? "Upcoming Event" : "Past Event"}
            </span>
            <span className="px-3 py-1 bg-white/95 backdrop-blur-sm text-[#0A1A2F] text-[10px] font-bold uppercase tracking-wider rounded-full shadow-sm">
              {event.category || "Community Drive"}
            </span>
          </div>
        </div>

        <div className="p-6">
          {/* Event Details Pill Bar */}
          <div className="space-y-2 mb-4">
            {eventDateObj && (
              <div className="flex items-center gap-2 text-xs font-semibold text-cyan-800 bg-cyan-50 border border-cyan-100/80 px-3 py-1.5 rounded-xl">
                <Calendar size={13} className="shrink-0 text-cyan-600" />
                <span>
                  {eventDateObj.toLocaleDateString("en-IN", {
                    weekday: "short",
                    day: "numeric",
                    month: "short",
                    year: "numeric",
                  })}
                </span>
                <span className="text-cyan-300">•</span>
                <Clock size={12} className="shrink-0 text-cyan-600" />
                <span>
                  {eventDateObj.toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            )}

            {event.eventLocation && (
              <div className="flex items-center gap-2 text-xs text-gray-600 font-medium px-1">
                <MapPin size={13} className="text-red-500 shrink-0" />
                <span className="truncate">{event.eventLocation}</span>
              </div>
            )}
          </div>

          <Link href={`/events/${event.slug}`}>
            <h3 className="text-lg font-bold text-[#0A1A2F] leading-snug mb-2 group-hover:text-cyan-600 transition-colors line-clamp-2">
              {event.title}
            </h3>
          </Link>

          <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-4 line-clamp-3">
            {event.excerpt}
          </p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
          {isUpcoming ? (
            <button
              type="button"
              onClick={() => onRegister(event)}
              className="flex-1 py-2.5 px-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl transition-all shadow-md shadow-cyan-600/20 text-center cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Sparkles size={13} />
              <span>Register / RSVP</span>
            </button>
          ) : (
            <span className="text-xs font-bold text-gray-400">
              Event Concluded
            </span>
          )}

          <Link
            href={`/events/${event.slug}`}
            className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-[#0A1A2F] text-xs font-bold rounded-xl transition-colors shrink-0"
          >
            Details
          </Link>
        </div>
      </div>
    </div>
  );
}

interface EventsListingClientProps {
  initialEvents: CmsItem[];
  initialCategories?: { _id: string; name: string; slug?: string }[];
}

export default function EventsListingClient({
  initialEvents,
  initialCategories = [],
}: EventsListingClientProps) {
  const [search, setSearch] = useState("");
  const [timeFilter, setTimeFilter] = useState<"all" | "upcoming" | "past">("all");
  const [categoryFilter, setCategoryFilter] = useState<string>("all");
  const [registeringEvent, setRegisteringEvent] = useState<CmsItem | null>(null);

  // Extract all categories dynamically from initialCategories & initialEvents
  const dynamicCategories = useMemo(() => {
    const cats = new Set<string>();
    if (initialCategories && initialCategories.length > 0) {
      initialCategories.forEach((c) => {
        if (c.name) cats.add(c.name);
      });
    }
    initialEvents.forEach((e) => {
      if (e.category) cats.add(e.category);
    });
    return Array.from(cats);
  }, [initialCategories, initialEvents]);

  const filteredEvents = useMemo(() => {
    return initialEvents.filter((event) => {
      const matchSearch =
        event.title.toLowerCase().includes(search.toLowerCase()) ||
        event.excerpt.toLowerCase().includes(search.toLowerCase()) ||
        (event.eventLocation &&
          event.eventLocation.toLowerCase().includes(search.toLowerCase()));

      const isUpcoming = event.eventDate
        ? new Date(event.eventDate).getTime() >= Date.now() - 86400000
        : true;

      const matchTime =
        timeFilter === "all" ||
        (timeFilter === "upcoming" && isUpcoming) ||
        (timeFilter === "past" && !isUpcoming);

      const matchCategory =
        categoryFilter === "all" ||
        (event.category &&
          event.category.toLowerCase() === categoryFilter.toLowerCase());

      return matchSearch && matchTime && matchCategory;
    });
  }, [initialEvents, search, timeFilter, categoryFilter]);

  return (
    <>
      {/* ── Search & Filter Controls ── */}
      <section className="py-8 border-b border-gray-100 bg-gray-50/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-80">
              <Search
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                size={16}
              />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search events by name or venue…"
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

          {/* Category Chips Bar */}
          {dynamicCategories.length > 0 && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none pt-2 border-t border-gray-200/60">
              <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider shrink-0">
                Categories:
              </span>
              <button
                type="button"
                onClick={() => setCategoryFilter("all")}
                className={`text-xs font-bold px-3 py-1 rounded-lg transition-all ${
                  categoryFilter === "all"
                    ? "bg-cyan-600 text-white shadow-xs"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-cyan-500"
                }`}
              >
                All
              </button>
              {dynamicCategories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategoryFilter(cat)}
                  className={`text-xs font-bold px-3 py-1 rounded-lg whitespace-nowrap transition-all ${
                    categoryFilter === cat
                      ? "bg-cyan-600 text-white shadow-xs"
                      : "bg-white border border-gray-200 text-gray-600 hover:border-cyan-500"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ── Events Grid ── */}
      <section className="py-16 sm:py-20 bg-[#f8f9fc]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {filteredEvents.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event.id || event.slug}
                  event={event}
                  onRegister={(ev) => setRegisteringEvent(ev)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-20 bg-white rounded-3xl border border-gray-100 p-8 max-w-md mx-auto">
              <p className="text-base font-bold text-[#0A1A2F] mb-1">No events found</p>
              <p className="text-gray-400 text-xs">
                No events match your current search or category filter.
              </p>
            </div>
          )}
        </div>
      </section>

      {/* ── Event Registration Modal ── */}
      {registeringEvent && (
        <EventRegisterModal
          event={{
            id: registeringEvent.id,
            slug: registeringEvent.slug,
            title: registeringEvent.title,
            eventDate: registeringEvent.eventDate,
            eventLocation: registeringEvent.eventLocation,
            eventOrganizer: registeringEvent.eventOrganizer,
          }}
          onClose={() => setRegisteringEvent(null)}
        />
      )}
    </>
  );
}
