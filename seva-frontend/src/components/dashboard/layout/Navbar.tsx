"use client";

import { useState } from "react";
import { LogOut, ShieldCheck, User } from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuth } from "@/context/AuthContext";

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
  const [loggingOut, setLoggingOut] = useState(false);
  const { user, logout } = useAuth();

  const handleLogout = async () => {
    setLoggingOut(true);
    await logout(); // redirects to /login
  };

  return (
    <header className="h-16 bg-navy/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-6 flex-shrink-0 sticky top-0 z-40">
      {/* Left: Foundation Brand & Live Status */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-2.5 px-3.5 py-1.5 rounded-xl bg-white/[0.04] border border-white/10">
          <div className="relative">
            <div className="w-2 h-2 rounded-full bg-emerald-accent animate-pulse" />
            <div className="absolute inset-0 w-2 h-2 rounded-full bg-emerald-accent animate-ping opacity-30" />
          </div>
          <span className="text-xs font-semibold text-white tracking-wide">
            SEVA INDIA FOUNDATION
          </span>
          <span className="text-[10px] text-emerald-accent font-bold uppercase tracking-wider hidden sm:inline px-2 py-0.5 rounded bg-emerald-dark/20 border border-emerald-500/20">
            PORTAL ACTIVE
          </span>
        </div>
      </div>

      {/* Right: User Profile + Logout */}
      <div className="flex items-center gap-4">
        {/* User info */}
        <div className="text-right hidden sm:block">
          <p className="text-sm font-bold text-white leading-tight">
            {user?.name || "Loading..."}
          </p>
          <p className="text-[11px] text-white/40 font-medium">
            {user?.role === "admin" ? "Administrator" : "Team Member"}
          </p>
        </div>

        {/* Avatar */}
        <div className="relative">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-gold to-gold-600 flex items-center justify-center text-navy text-sm font-black tracking-wider shadow-lg shadow-gold/20">
            {user?.name ? getInitials(user.name) : <User className="w-5 h-5" />}
          </div>
          <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-accent border-2 border-navy rounded-full" />
        </div>

        {/* Divider */}
        <div className="w-px h-7 bg-white/10" />

        {/* Logout button */}
        <button
          onClick={handleLogout}
          disabled={loggingOut}
          title="Log out"
          className="flex items-center gap-2 px-3 py-2 rounded-xl bg-white/[0.04] border border-white/10 text-white/60 hover:text-red-400 hover:bg-red-500/10 hover:border-red-500/20 transition-all duration-200 disabled:opacity-50 text-xs font-semibold"
        >
          {loggingOut ? (
            <div className="w-4 h-4 border border-white/30 border-t-white/80 rounded-full animate-spin" />
          ) : (
            <>
              <LogOut className="w-4 h-4" />
              <span className="hidden md:inline">Log out</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}