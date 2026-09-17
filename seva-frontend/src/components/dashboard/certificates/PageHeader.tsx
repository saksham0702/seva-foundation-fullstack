export default function PageHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex items-start justify-between mb-8">
      <div>
        <h1 className="font-display text-3xl font-bold">{title}</h1>
        <p className="label-eyebrow mt-1">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
