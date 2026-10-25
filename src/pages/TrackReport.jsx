import React, { useState, useEffect } from 'react';
import { findReportByCode, confirmReportResolution } from '../utils/storage';
import {
  Search,
  CheckCircle,
  Clock,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Check,
  RotateCcw,
  Building2,
  FileText,
  UserCheck
} from 'lucide-react';

export default function TrackReport({ initialCode = '', setActivePage }) {
  const [inputCode, setInputCode] = useState(initialCode);
  const [report, setReport] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [konfirmasiCatatan, setKonfirmasiCatatan] = useState('');
  const [confirmationFeedback, setConfirmationFeedback] = useState('');

  const sampleCodes = [
    { label: 'Status: Diterima Sistem', code: 'TR-7821-KM91' },
    { label: 'Status: Diteruskan ke KP3', code: 'TR-4421-P9B2' },
    { label: 'Status: Menunggu Konfirmasi Anda', code: 'TR-9981-L3X7', highlight: true }
  ];

  const handleSearch = async (codeToSearch) => {
    const target = (codeToSearch || inputCode).trim();
    if (!target) {
      setErrorMessage('Ketikkan kode rahasia pelacakan atau ID publik doket.');
      return;
    }

    setIsSearching(true);
    setErrorMessage('');

    try {
      const found = await findReportByCode(target);
      if (found) {
        setReport(found);
      } else {
        setReport(null);
        setErrorMessage('Kode doket tidak ditemukan. Periksa kembali format kode rahasia atau ID laporan Anda.');
      }
    } catch {
      setErrorMessage('Gagal memeriksa basis data pengawasan.');
    } finally {
      setIsSearching(false);
    }
  };

  useEffect(() => {
    if (initialCode) {
      setInputCode(initialCode);
      handleSearch(initialCode);
    }
  }, [initialCode]);

  const handleConfirmAction = (isFinished) => {
    if (!report) return;
    const updated = confirmReportResolution(report.idPublik, isFinished, konfirmasiCatatan);
    if (updated) {
      setReport({ ...updated });
      setConfirmationFeedback(
        isFinished
          ? 'Konfirmasi dicatat: Status laporan resmi selesai dan ditutup atas persetujuan pelapor.'
          : 'Laporan dibuka kembali dan dikembalikan ke antrean tim pengawas untuk investigasi ulang.'
      );
      setKonfirmasiCatatan('');
      setTimeout(() => setConfirmationFeedback(''), 6000);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Title */}
      <div className="bg-white border border-slate-200 p-6 rounded-gov space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gov-forest bg-gov-light px-2 py-0.5 rounded border border-gov-border">
            SISTEM PELACAKAN DOKET PENGADUAN
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-mono text-slate-500">AKUNTABILITAS DUA ARAH</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Lacak Disposisi & Status Laporan Pupuk
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Masukkan token rahasia untuk memeriksa progres tindak lanjut oleh Komisi Pengawasan Pupuk dan Pestisida (KP3), Dinas Pertanian NTB, dan konfirmasi penyelesaian kasus Anda.
        </p>
      </div>

      {/* Code Search Terminal Box */}
      <div className="bg-white border border-slate-200 rounded-gov p-5 sm:p-6 space-y-4">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSearch();
          }}
          className="space-y-3"
        >
          <label htmlFor="inputCodeField" className="block text-xs font-bold font-mono text-slate-900 uppercase">
            MASUKKAN KODE TOKEN RAHASIA / ID PUBLIK:
          </label>
          <div className="flex flex-col sm:flex-row gap-2 font-mono">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                id="inputCodeField"
                type="text"
                placeholder="CONTOH: TR-7821-KM91 ATAU TT-2024-A8B1"
                value={inputCode}
                onChange={(e) => setInputCode(e.target.value)}
                className="w-full pl-9 pr-3 py-2 rounded border border-slate-300 font-mono font-bold text-xs sm:text-sm uppercase focus:border-slate-800"
              />
            </div>
            <button
              type="submit"
              disabled={isSearching}
              className="px-6 py-2 rounded bg-slate-900 hover:bg-black text-white text-xs font-bold font-mono tracking-wider transition-colors"
            >
              {isSearching ? 'MEMERIKSA...' : 'PERIKSA DOKET'}
            </button>
          </div>
        </form>

        {/* Demo Test Tokens (For Judges & Testing) */}
        <div className="pt-2 border-t border-slate-100 font-mono text-xs">
          <span className="text-[10px] text-slate-500 block uppercase mb-1.5 font-bold">
            UJI CEPAT STATUS (KODE CONTOH SIMULASI NTB):
          </span>
          <div className="flex flex-wrap gap-1.5">
            {sampleCodes.map((s) => (
              <button
                key={s.code}
                onClick={() => {
                  setInputCode(s.code);
                  handleSearch(s.code);
                }}
                className={`text-[11px] px-2.5 py-1 rounded border transition-colors ${
                  s.highlight
                    ? 'bg-amber-light text-amber-950 border-amber-border font-bold hover:bg-amber-100'
                    : 'bg-slate-50 text-slate-700 border-slate-300 hover:bg-slate-100'
                }`}
              >
                {s.code} ({s.label})
              </button>
            ))}
          </div>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-50 border border-red-300 rounded font-mono text-xs text-red-800 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-700" />
            <span>{errorMessage}</span>
          </div>
        )}
      </div>

      {confirmationFeedback && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded font-mono text-xs text-emerald-950 font-bold flex items-center gap-2">
          <Check className="w-4 h-4 text-emerald-700 shrink-0" />
          <span>{confirmationFeedback}</span>
        </div>
      )}

      {/* CASE FILE DISPLAY */}
      {report && (
        <div className="space-y-5">
          {/* Main Case Summary Box */}
          <div className="bg-white border-2 border-slate-900 rounded-gov p-6 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
              <div>
                <span className="font-mono text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                  NOMOR DOKET PENGAWASAN
                </span>
                <span className="font-mono text-lg font-black text-slate-900">
                  {report.idPublik}
                </span>
              </div>
              <div className="font-mono text-xs font-bold px-3 py-1 bg-slate-100 border border-slate-300 rounded text-slate-800 self-start sm:self-auto">
                STATUS: {report.statusLabel.toUpperCase()}
              </div>
            </div>

            {/* Case Facts Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 font-mono text-xs">
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block uppercase">KOMODITAS</span>
                <strong className="text-slate-900 font-bold">{report.jenisPupuk}</strong>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block uppercase">LOKASI KASUS</span>
                <strong className="text-slate-900 font-bold">{report.namaWilayah}</strong>
                <span className="text-[10px] text-slate-500 block">{report.kecamatan}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block uppercase">TANGGAL LAPOR</span>
                <span className="text-slate-900 font-bold">{report.dibuatPada}</span>
              </div>
              <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                <span className="text-[10px] text-slate-500 block uppercase">TARGET DISPOSISI (SLA)</span>
                <span className="text-gov-forest font-bold">{report.batasRespons}</span>
              </div>
            </div>

            {/* Price Disparity Alert */}
            {report.selisih > 0 && (
              <div className="p-3 bg-amber-light border border-amber-border rounded font-mono text-xs flex justify-between items-center text-amber-950 font-bold">
                <span>HARGA DIBAYAR: RP {report.hargaDibayar.toLocaleString('id-ID')}</span>
                <span>(HET: RP {report.hetResmi.toLocaleString('id-ID')} • DISPARITAS: +RP {report.selisih.toLocaleString('id-ID')})</span>
              </div>
            )}

            {/* Case Description */}
            <div className="p-3.5 bg-slate-50 border border-slate-200 rounded space-y-1">
              <span className="font-mono text-[10px] font-bold text-slate-500 uppercase block">
                FAKTA PENGADUAN WARGA:
              </span>
              <p className="text-xs text-slate-800 leading-relaxed font-sans">{report.deskripsi}</p>
            </div>

            {/* TWO-SIDED RESOLUTION INTERACTION MODULE (PEMBEDA UTAMA) */}
            {report.status === 'MENUNGGU_KONFIRMASI' && (
              <div className="bg-amber-light border-2 border-amber-500 rounded p-5 space-y-4 font-mono">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-amber-950 font-bold text-sm">
                    <UserCheck className="w-5 h-5 text-amber-700" />
                    <span>INSTANSI TELAH MELAPORKAN TINDAK LANJUT. KONFIRMASI STATUS OLEH PELAPOR:</span>
                  </div>
                  <p className="font-sans text-xs text-slate-700 leading-relaxed">
                    Sesuai prinsip transparansi TANITERANG, laporan <strong>tidak dapat ditutup sepihak oleh dinas/kios</strong>. Apakah Anda telah menerima hak pupuk bersubsidi dengan harga resmi di lapangan?
                  </p>
                </div>

                <div className="space-y-1">
                  <label htmlFor="inputCatatanPelapor" className="block text-[11px] font-bold text-slate-800 uppercase">
                    CATATAN AKHIR ANDA:
                  </label>
                  <input
                    id="inputCatatanPelapor"
                    type="text"
                    placeholder="Contoh: Kios sudah menjual kembali dengan harga normal Rp 90.000 / atau jatah saya belum diserahkan"
                    value={konfirmasiCatatan}
                    onChange={(e) => setKonfirmasiCatatan(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-amber-400 bg-white text-xs font-sans focus:border-slate-800"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                  <button
                    onClick={() => handleConfirmAction(true)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-gov-forest hover:bg-gov-hover text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <CheckCircle className="w-4 h-4" />
                    <span>SUDAH BERES (TUTUP KASUS RESMI)</span>
                  </button>
                  <button
                    onClick={() => handleConfirmAction(false)}
                    className="flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-white hover:bg-red-50 text-red-700 border-2 border-red-400 text-xs font-bold transition-colors shadow-sm"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>BELUM BERES (BUKA KEMBALI KASUS)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Vertical Disposition Timeline */}
          <div className="bg-white border border-slate-200 rounded-gov p-6 space-y-4 font-mono">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2 border-b border-slate-200 pb-2">
              <Clock className="w-4 h-4 text-gov-forest" />
              <span>RIWAYAT AUDIT & TAHAPAN DISPOSISI PENGAWASAN</span>
            </h3>

            <div className="relative pl-6 space-y-5 before:absolute before:left-2 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-300">
              {report.timeline.map((item, idx) => (
                <div key={idx} className="relative">
                  <div className={`absolute -left-6 top-1 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center ${
                    idx === report.timeline.length - 1 ? 'bg-gov-forest' : 'bg-slate-400'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between">
                      <strong className="text-xs font-bold text-slate-900">{item.label}</strong>
                      <span className="text-[10px] text-slate-500">{item.waktu}</span>
                    </div>
                    <p className="font-sans text-xs text-slate-600 leading-relaxed bg-slate-50 border border-slate-200 p-2.5 rounded">
                      {item.catatan}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
