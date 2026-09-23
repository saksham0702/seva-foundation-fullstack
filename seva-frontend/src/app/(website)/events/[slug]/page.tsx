import React from "react";
import { Metadata } from "next";
import { notFound } from "next/navigation";
import { Calendar, MapPin, Clock, Users, HeartHandshake } from "lucide-react";
import Link from "next/link";
import { getServerCmsItemBySlug, getServerCmsItems } from "@/lib/server-api";
import { constructMetadata } from "@/lib/seo";
import { ContentDetail } from "@/components/cms/ContentDetail";

interface PageProps {
  params: Promise<{ slug: string }> | { slug: string };
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) return constructMetadata({ title: "Event" });

  const event = await getServerCmsItemBySlug("event", slug);
  if (!event) {
    return constructMetadata({
      title: "Event Not Found",
      description: "The requested event or program could not be found.",
      noIndex: true,
    });
  }

  const cleanExcerpt = (event.excerpt || event.content || "")
    .replace(/<[^>]*>/g, "")
    .slice(0, 160);

  return constructMetadata({
    title: event.title,
    description: cleanExcerpt || `Join ${event.title} organized by Seva India Foundation.`,
    canonicalPath: `/events/${event.slug}`,
    keywords: [
      event.title,
      event.category || "Community Event",
      event.eventLocation || "Uttarakhand",
      "Seva Foundation Event",
    ],
  });
}

export default async function EventDetailPage({ params }: PageProps) {
  const resolved = await Promise.resolve(params);
  const slug = resolved?.slug;
  if (!slug) notFound();

  const [event, allEvents] = await Promise.all([
    getServerCmsItemBySlug("event", slug),
    getServerCmsItems("event"),
  ]);

  if (!event) {
    notFound();
  }

  const related = allEvents.filter((e) => e.slug !== slug).slice(0, 3);

  const isUpcoming = event.eventDate
    ? new Date(event.eventDate).getTime() >= Date.now() - 86400000
    : true;

  return (
    <ContentDetail
      item={event}
      isLoading={false}
      backHref="/events"
      backLabel="Back to All Events"
      loadingLabel="Loading event details…"
      notFoundTitle="Event Not Found"
      notFoundText="The event or program you are searching for is unavailable or has passed."
      accentColor="#06B6D4"
      headingColor="#0A1A2F"
      badgeClassName={isUpcoming ? "bg-emerald-600 text-white" : "bg-slate-700 text-white"}
      badgeLabel={isUpcoming ? "Upcoming Event" : "Past Event"}
      metaItems={[
        ...(event.eventDate
          ? [
              {
                icon: Calendar,
                label: new Date(event.eventDate).toLocaleDateString("en-IN", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                }),
              },
            ]
          : []),
        ...(event.eventLocation ? [{ icon: MapPin, label: event.eventLocation }] : []),
        ...(event.readTime
          ? [{ icon: Clock, label: event.readTime, className: "text-gray-400 ml-auto" }]
          : []),
      ]}
      faqTitle="Event FAQs & Information"
      metaBanner={
        <div className="bg-[#f8f9fc] border border-gray-100 rounded-2xl p-5 sm:p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {event.eventDate && (
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-cyan-50 text-cyan-700 rounded-xl border border-cyan-100">
                <Calendar size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Date &amp; Time
                </p>
                <p className="text-sm font-bold text-[#0A1A2F] mt-0.5">
                  {new Date(event.eventDate).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          )}
          {event.eventLocation && (
            <div className="flex items-start gap-3">
              <div className="p-2.5 bg-red-50 text-red-600 rounded-xl border border-red-100">
                <MapPin size={18} />
              </div>
              <div>
                <p className="text-[11px] font-bold text-gray-400 uppercase tracking-wider">
                  Venue Location
                </p>
                <p className="text-sm font-bold text-[#0A1A2F] mt-0.5">
                  {event.eventLocation}
                </p>
              </div>
            </div>
          )}
        </div>
      }
      ctaSlot={
        <div className="bg-gradient-to-br from-[#0A1A2F] to-[#122847] text-white rounded-3xl p-8 sm:p-10 shadow-xl">
          <h2 className="text-2xl font-bold mb-3 flex items-center gap-2">
            <HeartHandshake className="text-cyan-400" /> Join Us as a Volunteer or Donor
          </h2>
          <p className="text-sm text-gray-300 leading-relaxed mb-6 max-w-xl">
            Be a part of this initiative. Volunteers and donors are the backbone of our
            community drives across the country.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/get-involved"
              className="inline-flex items-center gap-2 px-6 py-3 bg-cyan-500 hover:bg-cyan-400 text-[#0A1A2F] font-bold rounded-xl transition-all shadow-md text-xs uppercase tracking-wider"
            >
              Volunteer For This Event
            </Link>
            <Link
              href="/campaigns"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold rounded-xl transition-all border border-white/20 text-xs uppercase tracking-wider"
            >
              Support Financially
            </Link>
          </div>
        </div>
      }
      footerName={event.eventOrganizer || "SEVA Community Committee"}
      footerSubtitle="Event Organizer"
      footerIcon={<Users size={18} />}
      shareText="Event link copied to clipboard!"
      related={{
        items: related,
        hrefPrefix: "/events",
        sectionTitle: (
          <>
            More <span style={{ color: "#06B6D4" }}>Events</span>
          </>
        ),
        formatDate: (r) =>
          r.eventDate
            ? new Date(r.eventDate).toLocaleDateString("en-IN", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })
            : r.publishedAt,
      }}
    />
  );
}
