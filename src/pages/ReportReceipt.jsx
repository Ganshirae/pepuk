import React, { useState } from 'react';
import { Check, Copy, AlertTriangle, Search, FileCheck, ArrowRight, ShieldCheck, Printer } from 'lucide-react';

export default function ReportReceipt({ report, setActivePage, setLookupCode }) {
  const [copied, setCopied] = useState(false);

  if (!report) {
    return (
      <div className="max-w-md mx-auto text-center py-12 space-y-4 font-mono text-xs text-slate-500">
        <p>Tidak ada berkas laporan aktif dalam sesi ini.</p>
        <button
          onClick={() => setActivePage('report')}
          className="px-4 py-2 rounded bg-gov-forest text-white font-bold"
        >
          KIRIM PENGADUAN BARU
        </button>
      </div>
    );
  }

  const handleCopy = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(report.secretCodePlain);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  const handleTrackNow = () => {
    if (setLookupCode) {
      setLookupCode(report.secretCodePlain);
    }
    setActivePage('track');
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Official Filing Header */}
      <div className="bg-white border-2 border-slate-900 rounded-gov p-6 sm:p-8 space-y-6">
        {/* Certificate Header */}
        <div className="border-b-2 border-slate-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <span className="font-mono text-xs font-bold text-gov-forest uppercase tracking-wider block">
              TANDA TERIMA PENGADUAN RESMI
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
              DOKET ID: {report.idPublik}
            </h1>
          </div>
          <div className="self-start sm:self-auto font-mono text-xs font-bold px-3 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800">
            STATUS: DITERIMA SISTEM
          </div>
        </div>

        {/* Secret Code Prominent Box (High-Security Monospace Token) */}
        <div className="bg-slate-50 border-2 border-dashed border-slate-400 p-5 rounded space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-mono text-xs font-black text-slate-800 uppercase tracking-wider">
              KODE RAHASIA PELACAKAN (TOKEN OTENTIKASI ANDA):
            </span>
            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase">KLIK SALIN</span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 bg-white border border-slate-300 p-3 rounded">
            <span className="font-mono text-2xl sm:text-3xl font-black tracking-widest text-slate-900 selection:bg-slate-200">
              {report.secretCodePlain}
            </span>
            <button
              onClick={handleCopy}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold transition-colors"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TERSALIN!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>SALIN KODE</span>
                </>
              )}
            </button>
          </div>
          <p className="text-[11px] font-mono text-slate-600">
            *Kode ini hanya disimpan dalam bentuk hash SHA-256 di basis data untuk melindungi kerahasiaan pelapor.
          </p>
        </div>

        {/* Warning Notice (Standard Civic Practice) */}
        <div className="p-4 bg-amber-light border border-amber-border rounded text-xs text-amber-950 font-mono space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <AlertTriangle className="w-4 h-4 text-amber-700" />
            <span>INSTRUKSI PENTING PENYIMPANAN:</span>
          </div>
          <p className="font-sans leading-relaxed text-slate-700 pt-1">
            Simpan atau tangkap layar (screenshot) kode rahasia di atas. Karena platform ini tidak meminta NIK/KTP, <strong>hanya pemegang kode ini</strong> yang berhak melacak disposisi laporan dan memberikan konfirmasi penyelesaian kasus di lapangan.
          </p>
        </div>

        {/* Docket Summary Metadata */}
        <div className="border border-slate-200 rounded p-4 font-mono text-xs space-y-2">
          <span className="font-bold text-slate-800 uppercase tracking-wider block border-b border-slate-100 pb-1">
            RINGKASAN REKAM DOKET:
          </span>
          <div className="grid grid-cols-2 gap-2 text-slate-600">
            <div>Komoditas: <strong className="text-slate-900">{report.jenisPupuk}</strong></div>
            <div>Wilayah: <strong className="text-slate-900">{report.namaWilayah}</strong></div>
            <div>Waktu Penerimaan: <strong className="text-slate-900">{report.dibuatPada}</strong></div>
            <div>Target Disposisi: <strong className="text-gov-forest font-bold">{report.batasRespons}</strong></div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3 font-mono text-xs font-bold">
          <button
            onClick={handleTrackNow}
            className="flex-1 inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-gov-forest hover:bg-gov-hover text-white transition-colors"
          >
            <Search className="w-4 h-4" />
            <span>BUKA HALAMAN PELACAKAN SEKARANG</span>
          </button>
          <button
            onClick={() => setActivePage('home')}
            className="px-5 py-3 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
          >
            KEMBALI KE BERANDA
          </button>
        </div>
      </div>
    </div>
  );
}
