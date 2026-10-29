import React, { useEffect, useMemo, useState } from 'react';
import { Download, Send, Search, Calculator, ExternalLink, AlertTriangle, Info, CheckCircle2, Clock } from 'lucide-react';
import ChoroplethMap, { PCT_CLASSES } from '../components/ChoroplethMap';
import { TrendChart, PctBars } from '../components/Charts';
import SourceBadge from '../components/SourceBadge';
import { NTB_GEOJSON } from '../data/ntbGeoJSON';
import { OFFICIAL_CHANNELS, REPORT_STATUS, REPORT_CATEGORIES } from '../data/ntbData';
import { rpc } from '../lib/supabase';

const ton = (n) => (n === null || n === undefined ? '–' : `${Math.round(n).toLocaleString('id-ID')} t`);
const rp = (n) => `Rp${Math.round(n).toLocaleString('id-ID')}`;
const pctOf = (a, r) => (a > 0 && r !== null ? (r / a) * 100 : null);

function sum(rows) {
  const a = rows.reduce((s, r) => s + (r.allocation_ton || 0), 0);
  const r = rows.reduce((s, x) => s + (x.realization_ton || 0), 0);
  return { allocation: rows.length ? a : null, realization: rows.length ? r : null, pct: pctOf(a, r) };
}

export default function Dashboard({ data, setActivePage, setPrefilledReportData }) {
  const { regions, fertilizers, het, stats, sources } = data;
  const [scope, setScope] = useState('nasional'); // 'nasional' | '52'
  const [selected, setSelected] = useState('52');
  const [geoNasional, setGeoNasional] = useState(null);
  const [reportStats, setReportStats] = useState(null);
  const [publicReports, setPublicReports] = useState([]);

  const isNtb = scope === '52';
  // Nasional: 5 berkas Kementan (satu per jenis pupuk, id 'kementan_<pupuk>_prov'). NTB: satu berkas kab/kota.
  const inScope = (sid) => (isNtb ? sid === 'ntb_kabkota' : sid.startsWith('kementan_'));
  const scopeStats = useMemo(() => stats.filter((s) => inScope(s.source_id)), [stats, isNtb]); // eslint-disable-line react-hooks/exhaustive-deps
  const years = useMemo(() => [...new Set(scopeStats.map((s) => s.year))].sort(), [scopeStats]);
  const fertOptions = useMemo(() => fertilizers.filter((f) => scopeStats.some((s) => s.fertilizer_id === f.id)), [fertilizers, scopeStats]);
  const [year, setYear] = useState(null);
  const [fert, setFert] = useState('all');
  const activeYear = years.includes(year) ? year : years[years.length - 1];
  const activeFert = fert;
  const fertName = activeFert === 'all' ? 'semua jenis' : fertOptions.find((f) => f.id === activeFert)?.name;

  const regionName = useMemo(() => Object.fromEntries(regions.map((r) => [r.code, r.name])), [regions]);
  const source = sources[isNtb ? 'ntb_kabkota' : `kementan_${activeFert === 'all' ? 'urea' : activeFert}_prov`];
  // Jenis pupuk yang punya data pada tahun terpilih (mis. SP-36 hanya s.d. 2022)
  const fertsInYear = useMemo(() => fertOptions.filter((f) => scopeStats.some((s) => s.year === activeYear && s.fertilizer_id === f.id)), [fertOptions, scopeStats, activeYear]);

  useEffect(() => {
    fetch('/geo/provinsi.json').then((r) => r.json()).then(setGeoNasional).catch(() => setGeoNasional(null));
  }, []);

  useEffect(() => {
    const region = isNtb ? '52' : null;
    rpc('report_stats', { p_region_code: region }).then(setReportStats).catch(() => setReportStats(null));
    rpc('public_reports', { p_region_code: region, p_limit: 8 }).then(setPublicReports).catch(() => setPublicReports([]));
  }, [isNtb]);

  const filtered = useMemo(
    () => scopeStats.filter((s) => s.year === activeYear && (activeFert === 'all' || s.fertilizer_id === activeFert)),
    [scopeStats, activeYear, activeFert]
  );

  // Agregat per wilayah untuk peta, tabel, dan peringkat
  const byRegion = useMemo(() => {
    const groups = {};
    for (const s of filtered) (groups[s.region_code] ||= []).push(s);
    return Object.entries(groups)
      .map(([code, rows]) => ({ code, name: regionName[code] || code, ...sum(rows) }))
      .sort((a, b) => (b.allocation || 0) - (a.allocation || 0));
  }, [filtered, regionName]);

  const total = useMemo(() => sum(filtered), [filtered]);

  const trend = useMemo(
    () =>
      years.map((y) => {
        const rows = scopeStats.filter((s) => s.year === y && (activeFert === 'all' || s.fertilizer_id === activeFert));
        const t = sum(rows);
        return { year: y, allocation: t.allocation, realization: t.realization };
      }),
    [years, scopeStats, activeFert]
  );

  const byFert = useMemo(() => {
    return fertOptions
      .map((f) => {
        const rows = scopeStats.filter((s) => s.year === activeYear && s.fertilizer_id === f.id);
        const t = sum(rows);
        return { key: f.id, label: f.name, pct: rows.length ? t.pct : null, sub: `${ton(t.realization)} dari ${ton(t.allocation)}` };
      })
      .filter((r) => r.pct !== null);
  }, [fertOptions, scopeStats, activeYear]);

  const mapValues = useMemo(
    () => Object.fromEntries(byRegion.map((r) => [r.code, { pct: r.pct, label: `${r.pct?.toFixed(1) ?? '–'}% • ${ton(r.realization)} dari ${ton(r.allocation)}` }])),
    [byRegion]
  );

  const sel = byRegion.find((r) => r.code === selected);

  const handleSelect = setSelected;

  // Filter pupuk dipertahankan bila jenis itu ada di cakupan baru
  const switchScope = (s) => {
    setScope(s);
    setSelected(s === '52' ? '5202' : '52');
    const target = stats.filter((x) => (s === '52' ? x.source_id === 'ntb_kabkota' : x.source_id.startsWith('kementan_')));
    if (!target.some((x) => x.fertilizer_id === fert)) setFert('all');
  };

  const handleCSV = () => {
    const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
    const head = ['kode_wilayah', 'nama_wilayah', 'jenis_pupuk', 'tahun', 'alokasi_ton', 'realisasi_ton', 'persen_realisasi', 'sumber', 'url_sumber'];
    const rows = scopeStats.map((s) =>
      [s.region_code, regionName[s.region_code], s.fertilizer_id, s.year, s.allocation_ton, s.realization_ton, s.realization_pct, sources[s.source_id]?.publisher, sources[s.source_id]?.url].map(esc).join(',')
    );
    const blob = new Blob(['\ufeff' + [head.join(','), ...rows].join('\n')], { type: 'text/csv;charset=utf-8' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pepuk_${isNtb ? 'ntb_kabkota' : 'nasional_provinsi'}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const lapor = (prefill = {}) => {
    setPrefilledReportData?.({ regionCode: isNtb ? selected : selected || '', ...prefill });
    setActivePage('report');
  };

  return (
    <div className="space-y-5">
      {/* Header + aksi utama */}
      <section className="bg-white border border-slate-200 rounded-gov p-5 sm:p-6">
        <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
          <div className="space-y-2 max-w-3xl">
            <p className="font-mono text-[11px] font-bold text-gov-forest uppercase tracking-wider">Dashboard transparansi pupuk bersubsidi</p>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight leading-tight">
              Berapa jatah pupuk subsidi, berapa yang sampai, dan berapa harga resminya?
            </h1>
            <p className="text-sm text-slate-600">
              Data resmi Kementerian Pertanian (38 provinsi) dan Satu Data NTB (10 kabupaten/kota). Lapor tanpa akun dan tanpa NIK.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-2 shrink-0">
            <button onClick={() => lapor()} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-gov-forest hover:bg-gov-hover text-white text-sm font-bold min-h-[46px]">
              <Send className="w-4 h-4" /> Lapor masalah
            </button>
            <button onClick={() => setActivePage('track')} className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-white border border-slate-300 hover:border-slate-800 text-slate-900 text-sm font-bold min-h-[46px]">
              <Search className="w-4 h-4" /> Lacak laporan
            </button>
          </div>
        </div>
      </section>

      {/* Filter global */}
      <section className="sticky top-16 z-30 bg-white/95 backdrop-blur border border-slate-200 rounded-gov px-4 py-3 flex flex-wrap items-center gap-3 text-xs">
        <div className="inline-flex rounded border border-slate-300 p-0.5 bg-slate-100 font-semibold" role="tablist" aria-label="Cakupan wilayah">
          {[['nasional', 'Nasional (provinsi)'], ['52', 'NTB (kab/kota)']].map(([id, label]) => (
            <button key={id} role="tab" aria-selected={scope === id} onClick={() => switchScope(id)}
              className={`px-3 py-1.5 rounded-gov ${scope === id ? 'bg-white text-slate-900 shadow-sm font-bold' : 'text-slate-600 hover:text-slate-900'}`}>
              {label}
            </button>
          ))}
        </div>
        <label className="flex items-center gap-1.5">
          <span className="font-bold text-slate-700">Tahun</span>
          <select value={activeYear ?? ''} onChange={(e) => setYear(Number(e.target.value))} className="px-2 py-1.5 rounded border border-slate-300 font-mono">
            {years.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        </label>
        <label className="flex items-center gap-1.5">
          <span className="font-bold text-slate-700">Pupuk</span>
          <select value={activeFert} onChange={(e) => setFert(e.target.value)} className="px-2 py-1.5 rounded border border-slate-300">
            <option value="all">Semua jenis</option>
            {fertOptions.map((f) => (
              <option key={f.id} value={f.id}>{f.name}{fertsInYear.some((x) => x.id === f.id) ? '' : ` (tidak ada data ${activeYear})`}</option>
            ))}
          </select>
        </label>
        <div className="ml-auto flex flex-wrap items-center gap-2">
          <SourceBadge source={source} />
          <button onClick={handleCSV} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded border border-slate-300 hover:border-slate-800 font-bold">
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
        </div>
      </section>

      {!isNtb && (
        <p className="flex items-start gap-2 text-xs text-slate-600 bg-amber-light border border-amber-border rounded px-3 py-2">
          <Info className="w-4 h-4 text-amber-warning shrink-0 mt-px" />
          <span>
            Data nasional per provinsi dari Satu Data Kementan. {activeYear === 2025 && 'Data 2025 hanya sampai Oktober 2025, sehingga realisasinya belum penuh setahun. '}
            {activeYear === 2022 && 'Realisasi ZA, Organik, dan SP-36 tahun 2022 hanya sampai September 2022. '}
            Jenis pupuk tahun {activeYear}: {fertsInYear.map((f) => f.name).join(', ') || '–'}. Pilih NTB di peta untuk membuka detail kab/kota.
          </span>
        </p>
      )}

      {/* KPI */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {[
          { label: `Alokasi ${activeYear}`, value: ton(total.allocation), sub: `${isNtb ? 'NTB' : 'Indonesia'}, ${fertName}` },
          { label: 'Realisasi', value: ton(total.realization), sub: 'tersalurkan ke petani' },
          { label: '% Realisasi', value: total.pct === null ? '–' : `${total.pct.toFixed(1)}%`, sub: 'realisasi ÷ alokasi' },
          { label: 'Laporan warga', value: reportStats ? reportStats.total : '–', sub: reportStats ? `${reportStats.selesai_menurut_pelapor} selesai menurut pelapor` : 'memuat…' }
        ].map((k) => (
          <div key={k.label} className="bg-white border border-slate-200 rounded-gov p-4">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase">{k.label}</p>
            <p className="text-xl sm:text-2xl font-black text-slate-900 tabular-nums mt-1">{k.value}</p>
            <p className="text-[11px] text-slate-500 mt-1">{k.sub}</p>
          </div>
        ))}
      </section>

      {/* Peta + detail wilayah */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <div className="lg:col-span-8 bg-white border border-slate-200 rounded-gov p-4 space-y-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="text-sm font-black text-slate-900">Peta % realisasi {isNtb ? 'per kabupaten/kota NTB' : 'per provinsi'}</h2>
            {isNtb && <button onClick={() => switchScope('nasional')} className="text-xs font-bold text-gov-forest hover:underline">← Kembali ke nasional</button>}
          </div>
          <ChoroplethMap geojson={isNtb ? NTB_GEOJSON : geoNasional} values={mapValues} selected={selected} onSelect={handleSelect} />
          <ul className="flex flex-wrap gap-x-3 gap-y-1 text-[11px] font-mono text-slate-600" aria-label="Legenda">
            {PCT_CLASSES.map((c) => (
              <li key={c.label} className="inline-flex items-center gap-1"><span className="w-3 h-3 border border-slate-300 inline-block" style={{ background: c.color }} />{c.label}</li>
            ))}
            <li className="inline-flex items-center gap-1"><span className="w-3 h-3 bg-slate-200 inline-block" />tidak ada data</li>
          </ul>
        </div>

        <aside className="lg:col-span-4 bg-white border-2 border-slate-800 rounded-gov p-4 space-y-3">
          {sel ? (
            <>
              <div>
                <p className="text-[11px] font-mono font-bold text-slate-500">KODE {sel.code} • {activeYear}</p>
                <h3 className="text-lg font-black text-slate-900">{sel.name}</h3>
              </div>
              <dl className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded"><dt className="text-slate-500">Alokasi</dt><dd className="font-black font-mono text-base">{ton(sel.allocation)}</dd></div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded"><dt className="text-slate-500">Realisasi</dt><dd className="font-black font-mono text-base">{ton(sel.realization)}</dd></div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded"><dt className="text-slate-500">% Realisasi</dt><dd className="font-black font-mono text-base">{sel.pct?.toFixed(1) ?? '–'}%</dd></div>
                <div className="p-2.5 bg-slate-50 border border-slate-200 rounded"><dt className="text-slate-500">Belum tersalur</dt><dd className="font-black font-mono text-base">{ton(Math.max((sel.allocation || 0) - (sel.realization || 0), 0))}</dd></div>
              </dl>
              {sel.pct > 100 && (
                <p className="text-[11px] text-amber-warning flex gap-1.5"><AlertTriangle className="w-3.5 h-3.5 shrink-0" />Realisasi melebihi alokasi pada data sumber (tercatat apa adanya).</p>
              )}
              {!isNtb && sel.code === '52' && (
                <button onClick={() => switchScope('52')} className="w-full px-3 py-2 rounded border border-gov-forest text-gov-forest text-xs font-bold hover:bg-gov-light">Lihat detail 10 kab/kota NTB →</button>
              )}
              <button onClick={() => lapor()} className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded bg-gov-forest text-white text-xs font-bold hover:bg-gov-hover">
                <Send className="w-3.5 h-3.5" /> Laporkan masalah di {sel.name}
              </button>
            </>
          ) : (
            <p className="text-xs text-slate-500">Klik wilayah di peta untuk melihat rincian. Wilayah abu-abu belum punya data untuk filter ini.</p>
          )}
        </aside>
      </section>

      {/* Grafik */}
      <section className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white border border-slate-200 rounded-gov p-4 space-y-2">
          <h2 className="text-sm font-black text-slate-900">Tren {years[0]}–{years[years.length - 1]} {isNtb ? 'NTB' : 'nasional'}, {fertName}</h2>
          <TrendChart rows={trend} />
          {activeFert === 'all' && <p className="text-[11px] text-slate-500">Jenis pupuk yang tercatat berbeda tiap tahun; pilih satu jenis untuk perbandingan antartahun yang setara.</p>}
        </div>
        <div className="bg-white border border-slate-200 rounded-gov p-4 space-y-2">
          <h2 className="text-sm font-black text-slate-900">% realisasi per jenis pupuk, {activeYear}</h2>
          <PctBars rows={byFert} onSelect={(id) => setFert(id === activeFert ? 'all' : id)} selected={activeFert} />
          <p className="text-[11px] text-slate-500">Klik untuk memfilter seluruh dashboard.</p>
        </div>
        <div className="bg-white border border-slate-200 rounded-gov p-4 space-y-2">
          <h2 className="text-sm font-black text-slate-900">Peringkat {isNtb ? 'kab/kota' : 'provinsi'}, {activeYear}</h2>
          <div className="max-h-[260px] overflow-y-auto pr-1">
            <PctBars
              rows={[...byRegion].filter((r) => r.pct !== null).sort((a, b) => a.pct - b.pct).map((r) => ({ key: r.code, label: r.name, pct: r.pct, sub: `${ton(r.realization)} dari ${ton(r.allocation)}` }))}
              onSelect={handleSelect}
              selected={selected}
            />
          </div>
          <p className="text-[11px] text-slate-500">Diurutkan dari realisasi terendah.</p>
        </div>
      </section>

      {/* Tabel wilayah */}
      <section className="bg-white border border-slate-200 rounded-gov p-4 space-y-2">
        <h2 className="text-sm font-black text-slate-900">Tabel per {isNtb ? 'kabupaten/kota' : 'provinsi'}, {activeYear}</h2>
        <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="sticky top-0 bg-slate-100 text-slate-700 font-mono text-[11px] uppercase">
              <tr><th className="text-left p-2">Wilayah</th><th className="text-right p-2">Alokasi</th><th className="text-right p-2">Realisasi</th><th className="text-right p-2">%</th><th className="p-2"><span className="sr-only">Aksi</span></th></tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {byRegion.map((r) => (
                <tr key={r.code} className={selected === r.code ? 'bg-gov-light' : 'hover:bg-slate-50'}>
                  <td className="p-2 font-medium text-slate-900">{r.name}</td>
                  <td className="p-2 text-right font-mono tabular-nums">{ton(r.allocation)}</td>
                  <td className="p-2 text-right font-mono tabular-nums">{ton(r.realization)}</td>
                  <td className="p-2 text-right font-mono font-bold tabular-nums">{r.pct?.toFixed(1) ?? '–'}%</td>
                  <td className="p-2 text-right"><button onClick={() => handleSelect(r.code)} className="text-gov-forest font-bold hover:underline">Pilih</button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* HET + kalkulator */}
      <HetPanel het={het} fertilizers={fertilizers} source={sources.kepmentan_1117_2025} onReport={(p) => lapor(p)} />

      {/* Laporan publik + kanal resmi */}
      <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-gov p-4 space-y-3">
          <h2 className="text-sm font-black text-slate-900">Tindak lanjut laporan warga {isNtb ? 'NTB' : 'nasional'}</h2>
          {reportStats && (
            <dl className="grid grid-cols-3 gap-2 text-center text-xs">
              <div className="p-2 bg-slate-50 border border-slate-200 rounded"><dt className="text-slate-500">Dalam proses</dt><dd className="font-black font-mono text-lg">{reportStats.dalam_proses + reportStats.menunggu_verifikasi}</dd></div>
              <div className="p-2 bg-slate-50 border border-slate-200 rounded"><dt className="text-slate-500">Selesai menurut instansi</dt><dd className="font-black font-mono text-lg">{reportStats.selesai_menurut_instansi}</dd></div>
              <div className="p-2 bg-gov-light border border-gov-border rounded"><dt className="text-slate-600">Selesai menurut pelapor</dt><dd className="font-black font-mono text-lg text-gov-forest">{reportStats.selesai_menurut_pelapor}</dd></div>
            </dl>
          )}
          {reportStats?.terlambat > 0 && <p className="text-xs text-red-700 flex gap-1.5"><Clock className="w-3.5 h-3.5" />{reportStats.terlambat} laporan melewati batas waktu respons.</p>}
          {publicReports.length ? (
            <ul className="divide-y divide-slate-100 text-xs">
              {publicReports.map((r) => (
                <li key={r.public_id} className="py-2 flex justify-between gap-3">
                  <div className="min-w-0">
                    <p className="font-mono font-bold text-slate-900">{r.public_id}</p>
                    <p className="text-slate-600 truncate">{REPORT_CATEGORIES.find((c) => c.id === r.category)?.title} • {r.region_name}{r.kiosk_name ? ` • ${r.kiosk_name}` : ''}</p>
                  </div>
                  <span className={`shrink-0 text-[11px] font-bold ${r.overdue ? 'text-red-700' : 'text-slate-700'}`}>{r.overdue ? 'Terlambat • ' : ''}{REPORT_STATUS[r.status]?.label}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-xs text-slate-500 flex gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" />Belum ada laporan terverifikasi yang ditampilkan publik. Laporan baru tampil setelah diverifikasi petugas.</p>
          )}
        </div>
        <div className="bg-white border border-slate-200 rounded-gov p-4 space-y-3">
          <h2 className="text-sm font-black text-slate-900">Kanal resmi pemerintah</h2>
          <p className="text-xs text-slate-600">PEPUK melengkapi, tidak menggantikan kanal resmi. Anda juga dapat melapor langsung ke:</p>
          <ul className="space-y-2">
            {OFFICIAL_CHANNELS.map((c) => (
              <li key={c.name}>
                <a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-start justify-between gap-3 p-2.5 border border-slate-200 rounded hover:border-slate-700 text-xs">
                  <span><strong className="text-slate-900 block">{c.name}</strong><span className="text-slate-600">{c.detail}</span></span>
                  <ExternalLink className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
                </a>
              </li>
            ))}
          </ul>
          <button onClick={() => setActivePage('eligibility')} className="w-full px-3 py-2 rounded border border-gov-forest text-gov-forest text-xs font-bold hover:bg-gov-light">Cek apakah saya berhak pupuk subsidi →</button>
        </div>
      </section>
    </div>
  );
}

function HetPanel({ het, fertilizers, source, onReport }) {
  const [fid, setFid] = useState(het[0]?.fertilizer_id);
  const [kg, setKg] = useState('50');
  const [paid, setPaid] = useState('');
  const h = het.find((x) => x.fertilizer_id === fid);
  const name = (id) => fertilizers.find((f) => f.id === id)?.name ?? id;
  const qty = Number(kg) || 0;
  const paidNum = Number(paid) || 0;
  const legal = h ? h.price_per_kg * qty : 0;
  const diff = paidNum - legal;

  return (
    <section className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="bg-white border border-slate-200 rounded-gov p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-black text-slate-900">Harga Eceran Tertinggi (HET) berlaku</h2>
          <SourceBadge source={source} />
        </div>
        <table className="w-full text-xs">
          <thead className="bg-slate-100 font-mono text-[11px] uppercase text-slate-700"><tr><th className="text-left p-2">Pupuk</th><th className="text-right p-2">Per kg</th><th className="text-right p-2">Per sak</th></tr></thead>
          <tbody className="divide-y divide-slate-100">
            {het.map((x) => (
              <tr key={x.fertilizer_id}><td className="p-2 font-medium">{name(x.fertilizer_id)}</td><td className="p-2 text-right font-mono">{rp(x.price_per_kg)}</td><td className="p-2 text-right font-mono">{x.pack_kg ? `${rp(x.price_per_kg * x.pack_kg)} / ${x.pack_kg} kg` : '–'}</td></tr>
            ))}
          </tbody>
        </table>
        {het[0] && <p className="text-[11px] text-slate-500">{het[0].regulation}, berlaku sejak {het[0].effective_from}. Harga di tingkat pengecer resmi (kios), dibayar tunai.</p>}
      </div>

      <div className="bg-white border-2 border-slate-800 rounded-gov p-4 space-y-3">
        <h2 className="text-sm font-black text-slate-900 flex items-center gap-2"><Calculator className="w-4 h-4" />Kalkulator: apakah saya membayar terlalu mahal?</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
          <label className="space-y-1"><span className="font-bold text-slate-700">Jenis pupuk</span>
            <select value={fid} onChange={(e) => setFid(e.target.value)} className="w-full px-2 py-2 rounded border border-slate-300">
              {het.map((x) => <option key={x.fertilizer_id} value={x.fertilizer_id}>{name(x.fertilizer_id)}</option>)}
            </select>
          </label>
          <label className="space-y-1"><span className="font-bold text-slate-700">Jumlah (kg)</span>
            <input type="number" inputMode="decimal" min="1" value={kg} onChange={(e) => setKg(e.target.value)} className="w-full px-2 py-2 rounded border border-slate-300 font-mono" />
          </label>
          <label className="space-y-1"><span className="font-bold text-slate-700">Total dibayar (Rp)</span>
            <input type="number" inputMode="numeric" min="0" value={paid} onChange={(e) => setPaid(e.target.value)} placeholder="mis. 120000" className="w-full px-2 py-2 rounded border border-slate-300 font-mono" />
          </label>
        </div>
        <div className="text-xs p-3 rounded bg-slate-50 border border-slate-200 space-y-1" aria-live="polite">
          <p>Harga resmi untuk {qty.toLocaleString('id-ID')} kg: <strong className="font-mono">{rp(legal)}</strong></p>
          {paidNum > 0 && (diff > 0 ? (
            <p className="text-red-700 font-bold">Anda membayar {rp(diff)} lebih mahal dari HET ({rp(paidNum / qty)}/kg).</p>
          ) : (
            <p className="text-gov-forest font-bold">Harga yang Anda bayar sesuai HET.</p>
          ))}
        </div>
        {paidNum > 0 && diff > 0 && (
          <button onClick={() => onReport({ category: 'harga_di_atas_het', fertilizerId: fid, quantityKg: qty, pricePaidPerKg: Math.round(paidNum / qty) })}
            className="w-full inline-flex items-center justify-center gap-2 px-3 py-2.5 rounded bg-red-700 hover:bg-red-800 text-white text-xs font-bold">
            <Send className="w-3.5 h-3.5" /> Laporkan harga di atas HET
          </button>
        )}
      </div>
    </section>
  );
}
