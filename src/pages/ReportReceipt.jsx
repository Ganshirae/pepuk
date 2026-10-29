import React, { useState } from 'react';
import { Check, Copy, AlertTriangle, Search, ShieldCheck, Printer, ExternalLink } from 'lucide-react';
import { REPORT_CATEGORIES, OFFICIAL_CHANNELS } from '../data/ntbData';

const dt = (iso) => new Date(iso).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });

export default function ReportReceipt({ report, setActivePage, setLookupCode }) {
  const [copied, setCopied] = useState('');

  if (!report) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4 text-sm text-slate-600">
        <p>Tidak ada tanda terima di sesi ini.</p>
        <button onClick={() => setActivePage('report')} className="px-4 py-2 rounded bg-gov-forest text-white font-bold">Buat laporan</button>
      </div>
    );
  }

  const copy = async (key, text) => {
    await navigator.clipboard?.writeText(text);
    setCopied(key);
    setTimeout(() => setCopied(''), 2000);
  };

  const s = report.summary;
  const forwardText = [
    `Pengaduan pupuk bersubsidi (ref. TaniTerang ${report.publicId})`,
    `Masalah: ${REPORT_CATEGORIES.find((c) => c.id === report.category)?.title}`,
    report.fertilizerName && `Pupuk: ${report.fertilizerName}`,
    `Lokasi: ${[s.desa, s.kecamatan, report.regionName].filter(Boolean).join(', ')}`,
    `Tanggal: ${s.incidentDate}`,
    s.kioskName && `Kios: ${s.kioskName}`,
    Number(s.pricePaidPerKg) > 0 && `Harga dibayar: Rp${Number(s.pricePaidPerKg).toLocaleString('id-ID')}/kg${s.hetPerKg ? ` (HET Rp${s.hetPerKg.toLocaleString('id-ID')}/kg)` : ''}`,
    `Kronologi: ${s.description}`
  ].filter(Boolean).join('\n');

  const CopyBtn = ({ k, text, label }) => (
    <button onClick={() => copy(k, text)} className="inline-flex items-center gap-1.5 px-3 py-2 rounded border border-slate-300 hover:border-slate-800 text-xs font-bold">
      {copied === k ? <Check className="w-3.5 h-3.5 text-gov-forest" /> : <Copy className="w-3.5 h-3.5" />}{copied === k ? 'Tersalin' : label}
    </button>
  );

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <section className="bg-white border-2 border-slate-900 rounded-gov p-5 sm:p-7 space-y-5">
        <div className="flex items-start gap-3">
          <ShieldCheck className="w-8 h-8 text-gov-forest shrink-0" />
          <div>
            <h1 className="text-xl font-black text-slate-900">Laporan terkirim</h1>
            <p className="text-sm text-slate-600">Dicatat {dt(report.createdAt)}. Petugas wajib memverifikasi paling lambat <strong>{dt(report.dueAt)}</strong> (3 hari kerja).</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="p-4 rounded border border-slate-300 space-y-2">
            <p className="text-[11px] font-mono font-bold text-slate-500 uppercase">ID laporan (boleh dibagikan)</p>
            <p className="text-xl font-black font-mono tracking-wider">{report.publicId}</p>
            <CopyBtn k="id" text={report.publicId} label="Salin ID" />
          </div>
          <div className="p-4 rounded border-2 border-amber-500 bg-amber-light space-y-2">
            <p className="text-[11px] font-mono font-bold text-amber-warning uppercase">Kode rahasia (jangan dibagikan)</p>
            <p className="text-xl font-black font-mono tracking-wider">{report.secretCode}</p>
            <CopyBtn k="code" text={report.secretCode} label="Salin kode" />
          </div>
        </div>

        <p className="flex gap-2 text-xs text-amber-900 bg-amber-light border border-amber-border rounded p-3">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          Catat atau foto layar ini. Kode rahasia <strong>tidak bisa dipulihkan</strong> karena server hanya menyimpan versi terenkripsinya. Kode juga tersimpan di menu "Laporan Saya" pada perangkat ini.
        </p>

        <div className="flex flex-wrap gap-2">
          <button onClick={() => { setLookupCode?.({ publicId: report.publicId, secretCode: report.secretCode }); setActivePage('track'); }}
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded bg-gov-forest hover:bg-gov-hover text-white text-sm font-bold">
            <Search className="w-4 h-4" />Lacak sekarang
          </button>
          <button onClick={() => window.print()} className="inline-flex items-center gap-2 px-4 py-2.5 rounded border border-slate-300 text-sm font-bold">
            <Printer className="w-4 h-4" />Cetak / simpan PDF
          </button>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-gov p-5 space-y-3 print:hidden">
        <h2 className="text-sm font-black text-slate-900">Ingin melapor juga ke kanal resmi?</h2>
        <p className="text-xs text-slate-600">Salin ringkasan laporan (tanpa kontak Anda) lalu tempel di kanal berikut.</p>
        <CopyBtn k="fwd" text={forwardText} label="Salin ringkasan laporan" />
        <ul className="grid sm:grid-cols-2 gap-2">
          {OFFICIAL_CHANNELS.slice(0, 3).map((c) => (
            <li key={c.name}><a href={c.url} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-2 p-2.5 border border-slate-200 rounded hover:border-slate-700 text-xs"><span><strong className="block">{c.name}</strong>{c.detail}</span><ExternalLink className="w-3.5 h-3.5 shrink-0" /></a></li>
          ))}
        </ul>
      </section>
    </div>
  );
}
