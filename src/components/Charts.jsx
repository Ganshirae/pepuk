import React from 'react';

const fmt = (n) => (n === null || n === undefined ? '–' : Math.round(n).toLocaleString('id-ID'));

/**
 * Grafik tren alokasi vs realisasi per tahun (SVG murni, tanpa library).
 * rows: [{ year, allocation, realization }]
 */
export function TrendChart({ rows }) {
  if (!rows.length) return <p className="text-xs text-slate-500">Data tidak tersedia.</p>;
  const W = 560, H = 220, P = { l: 56, r: 12, t: 12, b: 28 };
  const max = Math.max(...rows.map((r) => Math.max(r.allocation || 0, r.realization || 0))) * 1.1 || 1;
  const bw = (W - P.l - P.r) / rows.length;
  const y = (v) => P.t + (H - P.t - P.b) * (1 - v / max);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((t) => t * max);

  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto" role="img" aria-label="Grafik alokasi dan realisasi per tahun">
        {ticks.map((t) => (
          <g key={t}>
            <line x1={P.l} x2={W - P.r} y1={y(t)} y2={y(t)} stroke="#E2E8F0" />
            <text x={P.l - 6} y={y(t) + 4} textAnchor="end" fontSize="10" fill="#64748B">{t >= 1000 ? `${Math.round(t / 1000)}rb` : Math.round(t)}</text>
          </g>
        ))}
        {rows.map((r, i) => {
          const x = P.l + i * bw + bw * 0.15;
          const w = bw * 0.33;
          return (
            <g key={r.year}>
              <rect x={x} y={y(r.allocation || 0)} width={w} height={y(0) - y(r.allocation || 0)} fill="#CBD5E1">
                <title>{`${r.year} alokasi: ${fmt(r.allocation)} ton`}</title>
              </rect>
              <rect x={x + w + 2} y={y(r.realization || 0)} width={w} height={y(0) - y(r.realization || 0)} fill="#15803D">
                <title>{`${r.year} realisasi: ${fmt(r.realization)} ton`}</title>
              </rect>
              <text x={x + w} y={H - 10} textAnchor="middle" fontSize="11" fill="#334155" fontWeight="700">{r.year}</text>
            </g>
          );
        })}
      </svg>
      <figcaption className="flex gap-4 text-[11px] font-mono text-slate-600 mt-1">
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 bg-slate-300 inline-block" />Alokasi (ton)</span>
        <span className="inline-flex items-center gap-1.5"><span className="w-3 h-3 bg-green-700 inline-block" />Realisasi (ton)</span>
      </figcaption>
    </figure>
  );
}

/**
 * Bar horizontal % realisasi (dipakai untuk per jenis pupuk dan peringkat wilayah).
 * rows: [{ key, label, pct, sub }]
 */
export function PctBars({ rows, onSelect, selected }) {
  if (!rows.length) return <p className="text-xs text-slate-500">Data tidak tersedia.</p>;
  return (
    <ul className="space-y-1.5">
      {rows.map((r) => (
        <li key={r.key}>
          <button
            type="button"
            onClick={() => onSelect?.(r.key)}
            disabled={!onSelect}
            className={`w-full text-left grid grid-cols-[minmax(0,9rem)_1fr_3.5rem] items-center gap-2 text-xs px-1 py-0.5 rounded ${
              selected === r.key ? 'bg-gov-light ring-1 ring-gov-forest' : onSelect ? 'hover:bg-slate-50' : ''
            }`}
            title={r.sub}
          >
            <span className="truncate font-medium text-slate-800">{r.label}</span>
            <span className="h-2.5 bg-slate-100 rounded-sm overflow-hidden" aria-hidden="true">
              <span
                className={`block h-full ${r.pct === null ? '' : r.pct >= 85 ? 'bg-green-700' : r.pct >= 60 ? 'bg-green-500' : 'bg-amber-500'}`}
                style={{ width: `${Math.min(r.pct ?? 0, 100)}%` }}
              />
            </span>
            <span className="text-right font-mono font-bold tabular-nums text-slate-900">{r.pct === null ? '–' : `${r.pct.toFixed(1)}%`}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}
