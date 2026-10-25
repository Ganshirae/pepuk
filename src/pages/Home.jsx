import React from 'react';
import { NTB_SUMMARY, NTB_REGIONS, HET_RATES } from '../data/ntbData';
import SourceBadge from '../components/SourceBadge';
import { Send, Search, MapPin, ArrowRight, ShieldCheck, CheckCircle2, AlertTriangle, FileText, ChevronRight, BarChart3, Clock } from 'lucide-react';

export default function Home({ setActivePage, setSelectedRegionKode }) {
  const handleSelectRegion = (kode) => {
    if (setSelectedRegionKode) {
      setSelectedRegionKode(kode);
    }
    setActivePage('data');
  };

  return (
    <div className="space-y-8">
      {/* Editorial Civic Header & Mandate */}
      <section className="bg-white border border-slate-200 p-6 sm:p-8 rounded-gov space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-mono text-xs font-bold text-gov-forest bg-gov-light px-2.5 py-0.5 rounded border border-gov-border">
            INISIATIF AKUNTABILITAS PUBLIK 2024–2026
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-mono text-slate-500">PILOT RESMI PROVINSI NTB (10 KABUPATEN/KOTA)</span>
        </div>

        <div className="max-w-4xl space-y-2">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-slate-900 tracking-tight leading-tight">
            Transparansi Alokasi, Penyerapan, dan Harga Acuan Pupuk Bersubsidi NTB
          </h1>
          <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
            Platform independen pemantauan distribusi pupuk subsidi (Urea, NPK, dan Organik). Membantu petani memeriksa hak kuota per wilayah, membandingkan harga beli terhadap HET resmi pemerintah, serta mengadukan penyimpangan tanpa syarat NIK/KTP.
          </p>
        </div>

        {/* 2 Primary Action Gates (High-Contrast & Utilitarian) */}
        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            onClick={() => setActivePage('report')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-gov-forest hover:bg-gov-hover text-white text-xs sm:text-sm font-bold font-mono tracking-wider transition-colors shadow-sm min-h-[46px]"
          >
            <Send className="w-4 h-4" />
            <span>KIRIM PENGADUAN KENDALA PUPUK</span>
          </button>
          <button
            onClick={() => setActivePage('track')}
            className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded bg-white hover:bg-slate-50 text-slate-900 text-xs sm:text-sm font-bold font-mono tracking-wider border border-slate-300 transition-colors shadow-sm min-h-[46px]"
          >
            <Search className="w-4 h-4 text-slate-600" />
            <span>LACAK DISPOSISI LAPORAN (KODE RAHASIA)</span>
          </button>
          <button
            onClick={() => setActivePage('data')}
            className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs sm:text-sm font-bold font-mono tracking-wider transition-colors min-h-[46px]"
          >
            <MapPin className="w-4 h-4 text-gov-forest" />
            <span>LIHAT PETA SPASIAL NTB</span>
          </button>
        </div>
      </section>

      {/* Audited Key Metric Board (Data-Dense Table-Cards) */}
      <section className="bg-white border border-slate-200 rounded-gov p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase tracking-tight font-mono">
              REKAPITULASI KUOTA & REALISASI PROVINSI NTB
            </h2>
            <p className="text-xs text-slate-500 font-mono">
              Periode Data Resmi: {NTB_SUMMARY.periodeData} • 10 Kabupaten/Kota
            </p>
          </div>
          <SourceBadge sumber={NTB_SUMMARY.sumberResmi} tipe="Dataset Resmi" tanggal={NTB_SUMMARY.tanggalAkses} />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 font-mono">
          {/* Card 1 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">TOTAL ALOKASI TAHUNAN</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {NTB_SUMMARY.totalAlokasiTon.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-slate-500">Ton</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-2">Ditetapkan Surat Keputusan Kementan</span>
          </div>

          {/* Card 2 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">REALISASI PENYALURAN (Lini IV)</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-gov-forest tabular-nums">
                {NTB_SUMMARY.totalRealisasiTon.toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-slate-500">Ton</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-2">Tercatat di sistem penebusan resmi</span>
          </div>

          {/* Card 3 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">PERSENTASE PENYERAPAN</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {NTB_SUMMARY.persenRealisasi}%
              </span>
              <span className="text-xs font-bold text-emerald-700">Tersalurkan</span>
            </div>
            <div className="w-full bg-slate-200 h-1.5 rounded mt-3">
              <div className="bg-gov-forest h-1.5 rounded" style={{ width: `${NTB_SUMMARY.persenRealisasi}%` }}></div>
            </div>
          </div>

          {/* Card 4 */}
          <div className="p-4 bg-slate-50 border border-slate-200 rounded">
            <span className="text-[10px] text-slate-500 font-bold uppercase block">SISA CADANGAN ALOKASI</span>
            <div className="flex items-baseline gap-1 mt-1">
              <span className="text-2xl sm:text-3xl font-black text-slate-900 tabular-nums">
                {(NTB_SUMMARY.totalAlokasiTon - NTB_SUMMARY.totalRealisasiTon).toLocaleString('id-ID')}
              </span>
              <span className="text-xs font-bold text-slate-500">Ton</span>
            </div>
            <span className="text-[11px] text-slate-500 block mt-2">Tersedia untuk masa tanam berikutnya</span>
          </div>
        </div>
      </section>

      {/* Official HET Benchmark Grid (Tabel Acuan Standar) */}
      <section className="bg-white border border-slate-200 rounded-gov p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-slate-200 gap-2">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase font-mono">
              STANDAR HARGA ECERAN TERTINGGI (HET) RESMI
            </h2>
            <p className="text-xs text-slate-500">
              Berdasarkan Peraturan Menteri Pertanian No. 01 Tahun 2024. Penjualan di atas harga ini merupakan pelanggaran hukum.
            </p>
          </div>
          <SourceBadge sumber="Permentan 01/2024" tipe="Regulasi Resmi" tanggal="2024-05-15" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {HET_RATES.slice(0, 3).map((het) => (
            <div key={het.id} className="p-4 bg-slate-50 border border-slate-200 rounded space-y-2">
              <div className="flex items-center justify-between text-xs font-bold font-mono">
                <span className="text-slate-900">{het.nama.toUpperCase()}</span>
                <span className="text-slate-500">{het.kemasanKg} KG</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-black font-mono text-slate-900 tabular-nums">
                  Rp {het.hetPerSak.toLocaleString('id-ID')}
                </span>
                <span className="text-xs text-slate-500 font-mono">/ sak</span>
              </div>
              <div className="text-[11px] font-mono text-slate-500 pt-1 border-t border-slate-200 flex justify-between">
                <span>Tarif per Kg:</span>
                <strong className="text-gov-forest font-bold">Rp {het.hetPerKg.toLocaleString('id-ID')}</strong>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 10 Regions Quick Audit Table */}
      <section className="bg-white border border-slate-200 rounded-gov p-6 space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-200">
          <div>
            <h2 className="text-base font-black text-slate-900 uppercase font-mono">
              STATUS PENYERAPAN PER WILAYAH NTB (10 KABUPATEN/KOTA)
            </h2>
            <p className="text-xs text-slate-500">
              Klik nama wilayah untuk membuka inspeksi data dan peta detail.
            </p>
          </div>
          <button
            onClick={() => setActivePage('data')}
            className="text-xs font-bold font-mono text-gov-forest hover:underline flex items-center gap-1"
          >
            <span>LIHAT PETA PENUH</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {NTB_REGIONS.map((region) => (
            <button
              key={region.kode}
              onClick={() => handleSelectRegion(region.kode)}
              className="text-left p-3 rounded bg-slate-50 hover:bg-slate-100 border border-slate-200 hover:border-slate-400 transition-colors flex flex-col justify-between"
            >
              <div>
                <span className="text-[10px] font-mono text-slate-500 block uppercase">BPS: {region.kode}</span>
                <strong className="text-xs font-bold text-slate-900 block truncate" title={region.nama}>
                  {region.nama}
                </strong>
              </div>
              <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] font-mono">
                <span className="text-slate-600">Realisasi:</span>
                <span className="font-bold text-gov-forest">{region.persenRealisasi}%</span>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Three Pillars of Public Transparency */}
      <section className="bg-slate-900 text-slate-200 rounded-gov p-6 sm:p-8 space-y-6">
        <div>
          <span className="text-[11px] font-mono font-bold text-emerald-400 uppercase tracking-widest block">
            PRINSIP AKUNTABILITAS TANITERANG
          </span>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            Mengapa Platform Ini Berbeda dari Pengaduan Konvensional?
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-slate-300">
          <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
            <strong className="font-bold text-white text-sm block">1. Anonim & Tanpa NIK/KTP</strong>
            <p className="leading-relaxed">
              Petani tidak dibebani keharusan mendaftar akun atau mengunggah KTP. Pengaduan dilindungi secara institusional agar pelapor aman dari intimidasi pihak distributor.
            </p>
          </div>
          <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
            <strong className="font-bold text-white text-sm block">2. Standar Verifikasi Bukti Struk</strong>
            <p className="leading-relaxed">
              Laporan diproses berdasarkan bukti riil nota penebusan dan perhitungan disparitas terhadap HET resmi secara otomatis sebelum diteruskan ke Komisi Pengawasan Pupuk (KP3).
            </p>
          </div>
          <div className="space-y-2 border-l-2 border-emerald-500 pl-4">
            <strong className="font-bold text-white text-sm block">3. Two-Sided Resolution (Konfirmasi Pelapor)</strong>
            <p className="leading-relaxed">
              Instansi tidak dapat menutup status laporan secara sepihak. Laporan hanya dianggap <strong>Selesai</strong> setelah dikonfirmasi langsung oleh pelapor yang bersangkutan.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
