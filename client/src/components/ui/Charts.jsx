import React, { useState } from 'react';

const PALETTE = ['#4f46e5', '#0ea5e9', '#10b981', '#f59e0b', '#e11d48', '#64748b', '#8b5cf6'];

/** Grouped line chart. series: [{ name, color, data: number[] }], labels: string[] */
export const LineChart = ({ labels, series, height = 220 }) => {
  const [hover, setHover] = useState(null);
  const W = 640;
  const H = height;
  const pad = { l: 32, r: 12, t: 12, b: 24 };
  const max = Math.max(1, ...series.flatMap((s) => s.data));
  const niceMax = Math.ceil(max / 5) * 5 || 5;
  const innerW = W - pad.l - pad.r;
  const innerH = H - pad.t - pad.b;
  const x = (i) => pad.l + (labels.length === 1 ? 0 : (i / (labels.length - 1)) * innerW);
  const y = (v) => pad.t + innerH - (v / niceMax) * innerH;
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => Math.round(niceMax * t));

  return (
    <div className="relative">
      <svg
        viewBox={`0 0 ${W} ${H}`}
        className="w-full h-auto"
        onMouseLeave={() => setHover(null)}
        role="img"
      >
        {ticks.map((t) => (
          <g key={t}>
            <line x1={pad.l} x2={W - pad.r} y1={y(t)} y2={y(t)} stroke="#e2e8f0" strokeWidth="1" />
            <text x={pad.l - 6} y={y(t) + 3} textAnchor="end" fontSize="10" fill="#94a3b8">
              {t}
            </text>
          </g>
        ))}
        {labels.map((l, i) =>
          i % Math.ceil(labels.length / 8) === 0 ? (
            <text key={l + i} x={x(i)} y={H - 6} textAnchor="middle" fontSize="10" fill="#94a3b8">
              {l}
            </text>
          ) : null
        )}
        {series.map((s) => (
          <polyline
            key={s.name}
            fill="none"
            stroke={s.color}
            strokeWidth="2"
            strokeLinejoin="round"
            points={s.data.map((v, i) => `${x(i)},${y(v)}`).join(' ')}
          />
        ))}
        {hover !== null && (
          <line x1={x(hover)} x2={x(hover)} y1={pad.t} y2={pad.t + innerH} stroke="#cbd5e1" strokeDasharray="3 3" />
        )}
        {labels.map((_, i) => (
          <rect
            key={i}
            x={x(i) - innerW / labels.length / 2}
            y={pad.t}
            width={innerW / labels.length}
            height={innerH}
            fill="transparent"
            onMouseEnter={() => setHover(i)}
          />
        ))}
        {hover !== null &&
          series.map((s) => <circle key={s.name} cx={x(hover)} cy={y(s.data[hover])} r="3.5" fill={s.color} />)}
      </svg>
      {hover !== null && (
        <div
          className="absolute top-1 right-2 bg-slate-900 text-white text-[11px] rounded px-2 py-1.5 pointer-events-none"
        >
          <div className="font-mono text-slate-300 mb-0.5">{labels[hover]}</div>
          {series.map((s) => (
            <div key={s.name} className="flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
              {s.name}: <strong>{s.data[hover]}</strong>
            </div>
          ))}
        </div>
      )}
      <div className="flex gap-4 mt-2 text-xs text-slate-600">
        {series.map((s) => (
          <span key={s.name} className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-sm" style={{ background: s.color }} />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
};

/** Horizontal bar list. data: [{ label, value, color? }] */
export const BarList = ({ data, unit = '' }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <ul className="space-y-2.5">
      {data.map((d, i) => (
        <li key={d.label}>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-slate-700">{d.label}</span>
            <span className="font-mono text-slate-900">
              {d.value}
              {unit}
            </span>
          </div>
          <div className="h-1.5 bg-slate-100 rounded-sm overflow-hidden">
            <div
              className="h-full rounded-sm"
              style={{ width: `${(d.value / max) * 100}%`, background: d.color || PALETTE[i % PALETTE.length] }}
            />
          </div>
        </li>
      ))}
    </ul>
  );
};

/** Donut chart with legend. data: [{ label, value, color? }] */
export const Donut = ({ data, size = 140 }) => {
  const total = data.reduce((a, d) => a + d.value, 0);
  const r = 52;
  const c = 2 * Math.PI * r;
  let offset = 0;
  return (
    <div className="flex items-center gap-5">
      <svg width={size} height={size} viewBox="0 0 140 140" className="shrink-0 -rotate-90">
        <circle cx="70" cy="70" r={r} fill="none" stroke="#f1f5f9" strokeWidth="16" />
        {total > 0 &&
          data.map((d, i) => {
            const len = (d.value / total) * c;
            const el = (
              <circle
                key={d.label}
                cx="70"
                cy="70"
                r={r}
                fill="none"
                stroke={d.color || PALETTE[i % PALETTE.length]}
                strokeWidth="16"
                strokeDasharray={`${len} ${c - len}`}
                strokeDashoffset={-offset}
              />
            );
            offset += len;
            return el;
          })}
        <text
          x="70"
          y="70"
          textAnchor="middle"
          dominantBaseline="central"
          className="rotate-90 origin-center"
          style={{ transform: 'rotate(90deg)', transformOrigin: '70px 70px' }}
          fontSize="22"
          fontWeight="600"
          fill="#0f172a"
        >
          {total}
        </text>
      </svg>
      <ul className="space-y-1.5 text-xs flex-1">
        {data.map((d, i) => (
          <li key={d.label} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2 text-slate-700">
              <span className="h-2 w-2 rounded-sm" style={{ background: d.color || PALETTE[i % PALETTE.length] }} />
              {d.label}
            </span>
            <span className="font-mono text-slate-900">{d.value}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

/** Minimal column chart. data: [{ label, value }] */
export const ColumnChart = ({ data, height = 160, color = '#4f46e5' }) => {
  const max = Math.max(1, ...data.map((d) => d.value));
  return (
    <div className="flex items-end gap-2" style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="flex-1 flex flex-col items-center justify-end h-full gap-1">
          <span className="text-[10px] font-mono text-slate-500">{d.value}</span>
          <div className="w-full rounded-t-sm" style={{ height: `${(d.value / max) * 80}%`, background: color }} />
          <span className="text-[10px] text-slate-500">{d.label}</span>
        </div>
      ))}
    </div>
  );
};
