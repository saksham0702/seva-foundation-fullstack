"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import {
  Heart,
  Eye,
  EyeOff,
  Lock,
  Mail,
  ArrowRight,
  AlertCircle,
} from "lucide-react";
import { useAuth } from "@/context/AuthContext";

export default function AdminLoginPage() {
  const router = useRouter();
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login(email, password);
      // Cookie is set by backend — redirect to dashboard
      router.push("/dashboard");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center ">
      {/* Left decorative panel — hidden on mobile */}
      <div className="hidden lg:flex lg:w-1/2 min-h-screen relative overflow-hidden bg-[#0f2347]">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1559027615-cd4628902d4a?w=1200&q=80"
            alt="Seva India volunteers"
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-br from-[#0f2347]/90 via-[#0f2347]/80 to-[#E8542A]/20" />
        </div>

        <div className="relative z-10 flex flex-col justify-center px-16 max-w-lg">
          <div className="w-14 h-14 rounded-2xl bg-[#E8542A] flex items-center justify-center mb-8 shadow-lg shadow-[#E8542A]/30">
            <Heart size={28} className="text-white" fill="white" />
          </div>

          <h1 className="text-4xl font-bold text-white leading-tight mb-4">
            Seva India Foundation
          </h1>
          <p className="text-lg text-white/60 leading-relaxed mb-8">
            Admin portal for managing campaigns, volunteers, and donations
            across Uttarakhand.
          </p>

          {/* Trust badges */}
          <div className="space-y-3">
            {["Secure, role-based access", "12A & 80G certified organisation", "Serving communities since 2012"].map(
              (text) => (
                <div key={text} className="flex items-center gap-3 text-white/50 text-sm">
                  <div className="w-5 h-5 rounded-full bg-[#E8542A]/20 border border-[#E8542A]/40 flex items-center justify-center flex-shrink-0">
                    <span className="text-[#E8542A] text-[10px] font-bold">✓</span>
                  </div>
                  <span>{text}</span>
                </div>
              )
            )}
          </div>
        </div>
      </div>

      {/* Right login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-lg bg-white p-10 rounded-2xl border border-gray-100 shadow-sm">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[#E8542A] flex items-center justify-center">
              <Heart size={20} className="text-white" fill="white" />
            </div>
            <div>
              <span className="text-lg font-bold text-[#0f2347] block">
                Seva India
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-[#E8542A]">
                Foundation
              </span>
            </div>
          </div>

          <div className="mb-8">
            <h2 className="text-2xl font-bold text-[#0f2347] mb-2">
              Admin Login
            </h2>
            <p className="text-sm text-gray-500">
              Enter your credentials to access the admin dashboard.
            </p>
          </div>

          {error && (
            <div className="mb-5 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
              <AlertCircle size={18} className="text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          <form onSubmit={handleLogin} className="space-y-5">
            {/* Email */}
            <div>
              <label className="block text-xs font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="login-email"
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@sevaindia.org"
                  className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0f2347] placeholder:text-gray-300 focus:outline-none focus:border-[#E8542A]/40 focus:ring-2 focus:ring-[#E8542A]/10 transition-all"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label className="block text-xs font-bold text-[#0f2347] uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={17}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400"
                />
                <input
                  id="login-password"
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-10 pr-11 py-3 bg-white border border-gray-200 rounded-xl text-sm text-[#0f2347] placeholder:text-gray-300 focus:outline-none focus:border-[#E8542A]/40 focus:ring-2 focus:ring-[#E8542A]/10 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>
            </div>

            {/* Submit */}
            <button
              id="login-submit"
              type="submit"
              disabled={loading || !email || !password}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#E8542A] hover:bg-[#c9431d] disabled:bg-gray-300 disabled:cursor-not-allowed text-white font-bold rounded-xl text-sm transition-all shadow-lg shadow-orange-100"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign In to Dashboard
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

          {/* Back to site */}
          <div className="mt-8 pt-6 border-t border-gray-100 text-center">
            <a
              href="/"
              className="text-sm text-gray-400 hover:text-[#0f2347] transition-colors"
            >
              ← Back to Seva India Foundation
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
