"use client";

import { useUsers } from "../UsersProvider";

export function UsersStats() {
  const { users } = useUsers();

  const adminCount = users.filter((u) => u.role === "admin").length;
  const userCount = users.filter((u) => u.role === "user").length;

  const stats = [
    { label: "Total Users", value: users.length },
    {
      label: "Administrators",
      value: adminCount,
    },
    {
      label: "Team Members",
      value: userCount,
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
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
