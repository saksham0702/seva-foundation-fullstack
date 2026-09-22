"use client";

import { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
import { Portal } from "@/components/shared/Portal";
import { useDonors } from "../DonorsProvider";
import { getCampaignOptions, CampaignOption } from "@/app/api/campaign";

export function CreateDonorModal() {
  const { createModalOpen, closeCreateModal, createDonor, creating, createError } =
    useDonors();

  const [campaigns, setCampaigns] = useState<CampaignOption[]>([]);
  const [loadingCampaigns, setLoadingCampaigns] = useState(false);
  const [campaignsError, setCampaignsError] = useState<string | null>(null);

  const [form, setForm] = useState({
    campaign: "",
    name: "",
    email: "",
    phone: "",
  });

  // Fetch campaigns options when modal is opened
  useEffect(() => {
    if (createModalOpen) {
      const fetchOptions = async () => {
        setLoadingCampaigns(true);
        setCampaignsError(null);
        try {
          const data = await getCampaignOptions();
          setCampaigns(data);
          // Auto select first campaign if available
          if (data.length > 0) {
            setForm((prev) => ({ ...prev, campaign: data[0]._id }));
          }
        } catch (err: any) {
          setCampaignsError("Failed to load campaigns list");
        } finally {
          setLoadingCampaigns(false);
        }
      };
      fetchOptions();
    } else {
      // Reset form when modal closes
      setForm({
        campaign: "",
        name: "",
        email: "",
        phone: "",
      });
    }
  }, [createModalOpen]);

  if (!createModalOpen) return null;

  function handleChange(
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!form.campaign) return;
    await createDonor({
      campaign: form.campaign,
      name: form.name || undefined,
      email: form.email || undefined,
      phone: form.phone || undefined,
    });
  }

  return (
    <Portal>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/60 z-[99998] backdrop-blur-sm"
        onClick={closeCreateModal}
      />

      {/* Modal */}
      <div className="fixed inset-0 z-[99999] flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md pointer-events-auto my-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
            <h2 className="text-base font-bold text-black tracking-tight">
              Add Donor
            </h2>
            <button
              onClick={closeCreateModal}
              className="text-slate-400 hover:text-black transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="px-6 py-5 flex flex-col gap-4">
            {/* Campaign Select */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Campaign <span className="text-rose-500">*</span>
              </label>
              {loadingCampaigns ? (
                <div className="flex items-center gap-2 py-2.5 text-xs text-slate-400 font-medium">
                  <Loader2 size={12} className="animate-spin" />
                  Loading campaigns...
                </div>
              ) : campaignsError ? (
                <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                  {campaignsError}
                </p>
              ) : (
                <select
                  name="campaign"
                  value={form.campaign}
                  onChange={handleChange}
                  required
                  className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black bg-white focus:outline-none focus:border-black transition-colors"
                >
                  <option value="" disabled>
                    Select a campaign
                  </option>
                  {campaigns.map((c) => (
                    <option key={c._id} value={c._id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Name */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Name
              </label>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Donor's full name"
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Email
              </label>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="donor@example.com"
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Phone */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-widest">
                Phone
              </label>
              <input
                type="tel"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="+91 98765 43210"
                className="border border-slate-200 rounded-xl px-4 py-2.5 text-sm text-black placeholder:text-slate-300 focus:outline-none focus:border-black transition-colors"
              />
            </div>

            {/* Error */}
            {createError && (
              <p className="text-xs text-rose-500 font-medium bg-rose-50 border border-rose-100 rounded-xl px-4 py-2.5">
                {createError}
              </p>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3 pt-1">
              <button
                type="button"
                onClick={closeCreateModal}
                className="flex-1 border border-slate-200 text-black text-sm font-bold px-5 py-3 rounded-xl hover:border-black transition-all"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={creating || loadingCampaigns}
                className="flex-1 bg-black text-white text-sm font-bold px-5 py-3 rounded-xl hover:bg-slate-800 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {creating && <Loader2 size={14} className="animate-spin" />}
                {creating ? "Creating…" : "Create Donor"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Portal>
  );
}
