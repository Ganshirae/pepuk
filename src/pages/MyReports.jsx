import React, { useState } from 'react';
import { getMyReports, clearMyReports } from '../utils/storage';
import { REPORT_CATEGORIES } from '../data/ntbData';
import { Search, Trash2, FileText } from 'lucide-react';

export default function MyReports({ setActivePage, setLookupCode }) {
  const [list, setList] = useState(getMyReports);

  const handleClear = () => {
    if (window.confirm('Hapus semua ID dan kode rahasia dari perangkat ini? Kode tidak bisa dipulihkan setelah dihapus.')) {
      clearMyReports();
      setList([]);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-5">
      <header className="bg-white border border-slate-200 p-5 sm:p-6 rounded-gov space-y-2">
        <div className="flex items-center justify-between gap-3">
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">Laporan Saya</h1>
          {list.length > 0 && (
            <button onClick={handleClear} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-bold text-red-700 border border-red-300 hover:bg-red-50">
              <Trash2 className="w-3.5 h-3.5" />Hapus dari perangkat
            </button>
          )}
        </div>
        <p className="text-sm text-slate-600">Disimpan hanya di peramban perangkat ini, bukan di server. Jika memakai HP bersama, hapus setelah dicatat.</p>
      </header>

      {list.length === 0 ? (
        <div className="bg-white border border-slate-200 rounded-gov p-10 text-center space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm text-slate-600">Belum ada laporan dari perangkat ini.</p>
          <button onClick={() => setActivePage('report')} className="px-4 py-2 rounded bg-gov-forest text-white text-sm font-bold">Buat laporan</button>
        </div>
      ) : (
        <ul className="space-y-2">
          {list.map((item) => (
            <li key={item.publicId} className="bg-white border border-slate-200 rounded-gov p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="space-y-0.5">
                <p className="font-mono font-black text-slate-900">{item.publicId}</p>
                <p className="text-xs text-slate-600">{REPORT_CATEGORIES.find((c) => c.id === item.category)?.title} • {item.regionName}</p>
                <p className="text-[11px] text-slate-500">Kode: <span className="font-mono font-bold">{item.secretCode}</span> • {new Date(item.createdAt).toLocaleDateString('id-ID', { dateStyle: 'medium' })}</p>
              </div>
              <button
                onClick={() => { setLookupCode({ publicId: item.publicId, secretCode: item.secretCode }); setActivePage('track'); }}
                className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded bg-gov-forest hover:bg-gov-hover text-white text-xs font-bold"
              >
                <Search className="w-3.5 h-3.5" />Lacak
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
