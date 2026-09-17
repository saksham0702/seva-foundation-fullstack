export function LineChart({
  data,
  labels,
  max,
}: {
  data: number[];
  labels: string[];
  max: number;
}) {
  const w = 640;
  const h = 220;
  const padL = 36;
  const padB = 24;
  const stepX = (w - padL) / (data.length - 1);
  const points = data.map((v, i) => {
    const x = padL + i * stepX;
    const y = h - padB - (v / max) * (h - padB - 10);
    return [x, y];
  });
  const path = points.map((p, i) => (i === 0 ? `M${p[0]},${p[1]}` : `L${p[0]},${p[1]}`)).join(" ");
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[220px]">
      {ticks.map((t) => {
        const y = h - padB - t * (h - padB - 10);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={w} y2={y} stroke="#1e2740" strokeDasharray="4 4" />
            <text x={0} y={y + 4} fontSize="10" fill="#57617a">
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      <path d={path} fill="none" stroke="#3b82f6" strokeWidth={2.5} />
      {points.map((p, i) => (
        <circle key={i} cx={p[0]} cy={p[1]} r={4} fill="#3b82f6" />
      ))}
      {labels.map((l, i) => (
        <text key={l} x={padL + i * stepX} y={h} fontSize="10" fill="#57617a" textAnchor="middle">
          {l}
        </text>
      ))}
    </svg>
  );
}

export function BarChart({
  data,
  labels,
  max,
}: {
  data: number[];
  labels: string[];
  max: number;
}) {
  const w = 640;
  const h = 220;
  const padL = 36;
  const padB = 24;
  const gap = 28;
  const barW = (w - padL - gap * data.length) / data.length;
  const ticks = [0, 0.25, 0.5, 0.75, 1];

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-full h-[220px]">
      {ticks.map((t) => {
        const y = h - padB - t * (h - padB - 10);
        return (
          <g key={t}>
            <line x1={padL} y1={y} x2={w} y2={y} stroke="#1e2740" strokeDasharray="4 4" />
            <text x={0} y={y + 4} fontSize="10" fill="#57617a">
              {Math.round(max * t)}
            </text>
          </g>
        );
      })}
      {data.map((v, i) => {
        const barH = (v / max) * (h - padB - 10);
        const x = padL + gap / 2 + i * (barW + gap);
        const y = h - padB - barH;
        return (
          <g key={i}>
            <rect x={x} y={y} width={barW} height={barH} rx={4} fill="#f2b705" />
            <text x={x + barW / 2} y={h} fontSize="10" fill="#57617a" textAnchor="middle">
              {labels[i]}
            </text>
          </g>
        );
      })}
    </svg>
  );
}
