import { LucideIcon } from "lucide-react";

export default function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: LucideIcon;
  label: string;
  value: string;
}) {
  return (
    <div className="panel px-5 py-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-9 h-9 rounded-lg bg-blueaccent/15 flex items-center justify-center">
          <Icon size={16} className="text-blueaccent" />
        </div>
        <p className="label-eyebrow">{label}</p>
      </div>
      <p className="font-display text-3xl font-bold">{value}</p>
    </div>
  );
}
