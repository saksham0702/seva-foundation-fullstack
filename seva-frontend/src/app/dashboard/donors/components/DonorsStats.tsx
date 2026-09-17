"use client";

import { useDonors } from "../DonorsProvider";

export function DonorsStats() {
  const { donors, loading } = useDonors();

  const paid = donors.filter((d) => d.status === "PAID").length;
  const failed = donors.filter((d) => d.status === "PAYMENT_FAILED").length;
  const notPaid = donors.filter((d) => d.status === "FILLED_NOT_PAID").length;

  const stats = [
    { label: "Total Donors", value: loading ? "—" : donors.length },
    { label: "Paid", value: loading ? "—" : paid },
    { label: "Not Paid", value: loading ? "—" : notPaid }, 
    { label: "Payment Failed", value: loading ? "—" : failed },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      {stats.map((s) => (
        <div
          key={s.label}
          className="bg-white border border-slate-200 rounded-2xl px-6 py-5 shadow-sm hover:shadow-md transition-all"
        >
          <p className="text-[10px] uppercase tracking-widest font-semibold text-slate-500 mb-2">
            {s.label}
          </p>
          <p className="text-3xl font-semibold text-black">{s.value}</p>
        </div>
      ))}
    </div>
  );
}
