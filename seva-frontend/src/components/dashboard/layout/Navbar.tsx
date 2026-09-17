"use client";

import { useState } from "react";
import { Bell, Search, Command, LogOut } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

const NOTIFICATIONS = [
  { id: 1, title: "New donation received", detail: "₹5,000 from Ramesh Kumar", time: "2m ago", unread: true },
  { id: 2, title: "Campaign goal reached", detail: "Green India hit 90% of target", time: "1h ago", unread: true },
  { id: 3, title: "Volunteer signup", detail: "3 new volunteers this week", time: "5h ago", unread: false },
  { id: 4, title: "Certificate request", detail: "Dr. Sharma requested verification", time: "1d ago", unread: false },
];

// Get initials from a name
function getInitials(name: string): string {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function Navbar() {
  const [notifOpen, setNotifOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();
  const unreadCount = NOTIFICATIONS.filter((n) => n.unread).length;

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout(); // redirects to /login
  };

  return (
    <header className="h-16 bg-navy/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">
      {/* Left: Search Bar */}
      <div className="flex items-center gap-4 flex-1 max-w-xl">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/30" />
          <input
            type="text"
            placeholder="Ask AI or search anything..."
            className="w-full bg-white/[0.04] border border-white/10 rounded-xl pl-10 pr-10 py-2 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-gold/50 focus:ring-1 focus:ring-gold/20 transition-all"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            <kbd className="hidden sm:inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-white/10 text-[10px] text-white/50 font-mono">
              <Command className="w-3 h-3" /> K
            </kbd>
          </div>
        </div>

        {/* Global Sync Status */}
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/[0.04] border border-white/10">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-accent animate-ping opacity-30" />
          </div>
          <span className="text-[11px] font-medium text-emerald-accent">GLOBAL SYNC</span>
          <span className="text-[10px] text-white/40">LIVE</span>
        </div>
      </div>

      {/* Right: Notifications + User */}
      <div className="flex items-center gap-5">
        {/* Divider */}
        <div className="w-px h-8 bg-white/10 hidden sm:block" />

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => setNotifOpen((o) => !o)}
            className="relative w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/70 hover:text-white hover:bg-white/[0.08] transition-all duration-200"
          >
            <Bell className="w-4 h-4" />
            {unreadCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-500 text-white text-[9px] font-bold flex items-center justify-center border-2 border-navy">
                {unreadCount}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 mt-2 w-80 bg-navy border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-50">
              <div className="px-4 py-3 border-b border-white/5 flex items-center justify-between">
                <p className="text-sm font-semibold text-white">Notifications</p>
                <span className="text-[11px] text-gold">{unreadCount} new</span>
              </div>
              <div className="max-h-80 overflow-y-auto divide-y divide-white/5">
                {NOTIFICATIONS.map((n) => (
                  <div
                    key={n.id}
                    className={cn(
                      "px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer",
                      n.unread && "bg-white/[0.02]"
                    )}
                  >
                    <div className="flex items-start gap-2">
                      <span
                        className={cn(
                          "mt-1.5 w-1.5 h-1.5 rounded-full flex-shrink-0",
                          n.unread ? "bg-gold" : "bg-white/20"
                        )}
                      />
                      <div className="min-w-0">
                        <p className="text-xs font-medium text-white truncate">{n.title}</p>
                        <p className="text-[11px] text-white/50 mt-0.5">{n.detail}</p>
                        <p className="text-[10px] text-white/30 mt-1">{n.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Divider */}
        <div className="w-px h-8 bg-white/10" />

        {/* User Profile + Logout */}
        <div className="flex items-center gap-3 group">
          {/* User info */}
          <div className="text-right hidden sm:block">
            <p className="text-sm font-bold text-white leading-tight group-hover:text-gold transition-colors">
              {user?.name || "Loading..."}
            </p>
            <p className="text-[11px] text-white/40 font-medium">
              {user?.role === "admin" ? "Administrator" : "Team Member"}
            </p>
          </div>

          {/* Avatar */}
          <div className="relative">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-navy text-sm font-black tracking-wider shadow-lg shadow-gold/20 group-hover:scale-105 transition-transform duration-300">
              {user ? getInitials(user.name) : ".."}
            </div>
            <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-green-500 border-2 border-navy rounded-full" />
          </div>

          {/* Logout button */}
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            title="Log out"
            className="w-9 h-9 rounded-xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-white/50 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {loggingOut ? (
              <div className="w-4 h-4 border border-white/30 border-t-white/80 rounded-full animate-spin" />
            ) : (
              <LogOut className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>
    </header>
  );
}