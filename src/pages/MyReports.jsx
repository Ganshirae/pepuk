import React, { useState, useEffect } from 'react';
import { getMyReports, clearMyReports } from '../utils/storage';
import { Bookmark, Search, Trash2, AlertCircle, FileText, ArrowRight } from 'lucide-react';

export default function MyReports({ setActivePage, setLookupCode }) {
  const [list, setList] = useState([]);

  useEffect(() => {
    setList(getMyReports());
  }, []);

  const handleClear = () => {
    if (window.confirm('Bersihkan seluruh riwayat doket pengaduan dari memori peramban ini?')) {
      clearMyReports();
      setList([]);
    }
  };

  const handleTrackItem = (secretCode) => {
    if (setLookupCode) {
      setLookupCode(secretCode);
    }
    setActivePage('track');
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-gov space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-mono text-xs font-bold text-gov-forest bg-gov-light px-2 py-0.5 rounded border border-gov-border">
              MEMORI PERAMBAN LOKAL
            </span>
            <span className="text-slate-400">•</span>
            <span className="text-xs font-mono text-slate-500">PENYIMPANAN AMAN TANPA LOGIN</span>
          </div>
          {list.length > 0 && (
            <button
              onClick={handleClear}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-mono font-bold text-red-700 hover:bg-red-50 border border-red-300"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>BERSIHKAN RIWAYAT</span>
            </button>
          )}
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Berkas Pengaduan Tersimpan di Perangkat Ini
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Daftar kode pelacakan dan doket pengaduan yang pernah Anda terbitkan melalui peramban ini. Data ini memungkinkan Anda membuka kembali status aduan dengan satu klik tanpa perlu mengingat kode rahasia.
        </p>
      </div>

      {/* Cache Notice */}
      <div className="p-4 bg-amber-light border border-amber-border rounded font-mono text-xs text-amber-950 flex items-start gap-2.5">
        <AlertCircle className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
        <div>
          <strong>CATATAN PENYIMPANAN LOKAL:</strong> Riwayat ini tersimpan dalam basis data <code>localStorage</code> perangkat. Jika Anda menghapus cache browser, daftar cepat ini akan terhapus. Pastikan Anda tetap mencatat kode rahasia di tempat terpisah.
        </div>
      </div>

      {/* List Table / Cards */}
      {list.length === 0 ? (
        <div className="p-8 bg-white border border-slate-200 rounded text-center space-y-3 font-mono text-xs text-slate-500">
          <FileText className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-slate-700 font-bold">Belum Ada Riwayat Pengaduan yang Diterbitkan dari Perangkat Ini</p>
          <p className="max-w-md mx-auto text-slate-500">
            Setiap kali Anda menerbitkan pengaduan melalui form TANITERANG, nomor doket dan token rahasia akan otomatis tersimpan di sini.
          </p>
          <button
            onClick={() => setActivePage('report')}
            className="px-4 py-2 rounded bg-gov-forest text-white font-bold inline-block"
          >
            TERBITKAN PENGADUAN BARU
          </button>
        </div>
      ) : (
        <div className="space-y-3 font-mono">
          {list.map((item) => (
            <div
              key={item.idPublik}
              className="p-4 bg-white border border-slate-200 hover:border-slate-800 rounded transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-slate-900">{item.idPublik}</span>
                  <span className="text-[11px] px-2 py-0.5 bg-slate-100 border border-slate-300 rounded font-bold text-slate-700">
                    TOKEN: {item.secretCode}
                  </span>
                </div>
                <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2 font-sans">
                  <span className="font-bold text-slate-800">{item.jenisPupuk}</span>
                  <span>•</span>
                  <span>{item.namaWilayah}</span>
                  <span>•</span>
                  <span className="font-mono text-[11px]">{item.dibuatPada}</span>
                </div>
              </div>

              <button
                onClick={() => handleTrackItem(item.secretCode)}
                className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded bg-slate-900 hover:bg-black text-white text-xs font-mono font-bold transition-colors"
              >
                <Search className="w-3.5 h-3.5" />
                <span>PERIKSA DOKET</span>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
