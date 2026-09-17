"use client";

import Link from "next/link";
import { Pencil, Eye, Trash2, FileText, Calendar, MapPin, Globe, Clock, User } from "lucide-react";
import { CmsItem, CmsStatus } from "@/types/cms";
import { useCms } from "../CmsProvider";

import { getImageUrl } from "@/lib/image";

const statusStyle: Record<CmsStatus, string> = {
  published: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
  draft: "bg-slate-500/10 text-slate-400 border-slate-500/30",
  scheduled: "bg-blue-500/10 text-blue-400 border-blue-500/30",
};

const typeBadgeStyle: Record<string, string> = {
  blog: "bg-indigo-500/10 text-indigo-300 border-indigo-500/20",
  news: "bg-amber-500/10 text-amber-300 border-amber-500/20",
  event: "bg-cyan-500/10 text-cyan-300 border-cyan-500/20",
};

export function CmsCard({ item }: { item: CmsItem }) {
  const { toggleStatus, deleteItem, contentType } = useCms();

  const editPath =
    contentType === "blog"
      ? `/dashboard/blogs/create-blog?edit=true&id=${item.id}`
      : contentType === "news"
      ? `/dashboard/news/create-news?edit=true&id=${item.id}`
      : `/dashboard/events/create-event?edit=true&id=${item.id}`;

  const previewPath =
    contentType === "blog"
      ? `/blogs/${item.slug}`
      : contentType === "news"
      ? `/news/${item.slug}`
      : `/events/${item.slug}`;

  return (
    <div className="bg-panel border border-border rounded-xl shadow-sm hover:border-white/15 transition-all overflow-hidden flex flex-col md:flex-row group">
      {/* Featured Thumbnail */}
      <div className="w-full md:w-52 h-44 md:h-auto shrink-0 relative bg-bg overflow-hidden">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={getImageUrl(item.featuredImage)}
          alt={item.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          onError={(e) => {
            (e.target as HTMLImageElement).src = getImageUrl(null);
          }}
        />
        <div className="absolute top-2 left-2 flex items-center gap-1.5">
          <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border backdrop-blur-md ${typeBadgeStyle[item.type]}`}>
            {item.type}
          </span>
        </div>
      </div>

      {/* Content Body */}
      <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
        <div>
          {/* Metadata badges */}
          <div className="flex items-center gap-2 mb-2 flex-wrap text-[11px]">
            <span
              className={`font-bold uppercase tracking-wider px-2 py-0.5 rounded-md border ${statusStyle[item.status]}`}
            >
              {item.status}
            </span>
            <span className="text-gold/90 font-medium px-2 py-0.5 bg-white/[0.04] border border-white/10 rounded-md">
              {item.category}
            </span>
            <span className="text-muted/50">•</span>
            <span className="text-muted font-medium">{item.publishedAt}</span>
            {item.readTime && (
              <>
                <span className="text-muted/50">•</span>
                <span className="text-muted flex items-center gap-1">
                  <Clock size={11} /> {item.readTime}
                </span>
              </>
            )}
          </div>

          {/* Title & Excerpt */}
          <h2 className="text-base font-semibold text-white leading-snug mb-1.5 group-hover:text-gold transition-colors line-clamp-1">
            {item.title}
          </h2>
          <p className="text-xs text-muted leading-relaxed line-clamp-2 mb-3">{item.excerpt}</p>

          {/* Type-Specific Info Row */}
          {item.type === "event" && (item.eventDate || item.eventLocation) && (
            <div className="flex items-center gap-4 text-[11.5px] text-cyan-300/90 bg-cyan-950/30 border border-cyan-500/20 rounded-lg px-3 py-1.5 mb-2 flex-wrap">
              {item.eventDate && (
                <span className="flex items-center gap-1 font-medium">
                  <Calendar size={12} className="text-cyan-400" />
                  {new Date(item.eventDate).toLocaleDateString("en-US", {
                    month: "short",
                    day: "numeric",
                    year: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              )}
              {item.eventLocation && (
                <span className="flex items-center gap-1 font-medium truncate">
                  <MapPin size={12} className="text-cyan-400" /> {item.eventLocation}
                </span>
              )}
            </div>
          )}

          {item.type === "news" && (item.newsSource || item.authorName) && (
            <div className="flex items-center gap-4 text-[11.5px] text-amber-300/90 bg-amber-950/20 border border-amber-500/20 rounded-lg px-3 py-1.5 mb-2 flex-wrap">
              {item.newsSource && (
                <span className="flex items-center gap-1 font-medium">
                  <Globe size={12} className="text-amber-400" /> Source: {item.newsSource}
                </span>
              )}
              {item.authorName && (
                <span className="flex items-center gap-1 font-medium">
                  <User size={12} className="text-amber-400" /> By {item.authorName}
                </span>
              )}
            </div>
          )}

          <p className="text-[11px] text-muted/50 font-mono truncate">/{item.slug}</p>
        </div>

        {/* Action Toolbar */}
        <div className="flex items-center gap-2 mt-4 pt-3 border-t border-border flex-wrap">
          <Link
            href={editPath}
            className="flex items-center gap-1.5 text-xs font-semibold text-white border border-border hover:border-gold/50 hover:bg-gold/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <Pencil size={12} /> Edit
          </Link>
          <Link
            href={previewPath}
            target="_blank"
            className="flex items-center gap-1.5 text-xs font-semibold text-white border border-border hover:border-white/30 px-3 py-1.5 rounded-lg transition-all"
          >
            <Eye size={12} /> Preview
          </Link>
          <button
            type="button"
            onClick={() => toggleStatus(item.id, item.status)}
            className="flex items-center gap-1.5 text-xs font-semibold text-muted hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-all border border-transparent hover:border-white/10"
          >
            <FileText size={12} />
            {item.status === "published" ? "Unpublish" : "Publish"}
          </button>
          <button
            type="button"
            onClick={() => {
              if (confirm(`Are you sure you want to delete "${item.title}"?`)) {
                deleteItem(item.id);
              }
            }}
            className="ml-auto flex items-center gap-1.5 text-xs font-semibold text-red-400 hover:text-red-300 border border-transparent hover:border-red-400/20 hover:bg-red-500/10 px-3 py-1.5 rounded-lg transition-all"
          >
            <Trash2 size={12} /> Delete
          </button>
        </div>
      </div>
    </div>
  );
}
