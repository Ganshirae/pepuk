import React from 'react';
import { ShieldCheck, Database, Scale, AlertCircle } from 'lucide-react';

export default function Footer({ setActivePage }) {
  return (
    <footer className="bg-white border-t border-slate-200 mt-16 pb-20 md:pb-8 text-xs text-slate-600">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Institutional Statement */}
          <div className="md:col-span-2 space-y-3">
            <div className="flex items-center gap-2">
              <span className="font-black text-lg tracking-tight text-slate-900">
                TANI<span className="text-gov-forest">TERANG</span>
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                PILOT NTB
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-md font-sans">
              Portal keterbukaan data distribusi pupuk bersubsidi resmi untuk Provinsi Nusa Tenggara Barat. Didesain untuk memperkuat pengawasan publik, mencegah monopoli harga di atas HET, dan mengawal hak petani kecil secara independen.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-500 space-y-1">
              <div>• Landasan Hukum: Peraturan Menteri Pertanian No. 01 Tahun 2024</div>
              <div>• Pengawasan Lapangan: Komisi Pengawasan Pupuk dan Pestisida (KP3) NTB</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="font-mono">
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              NAVIGASI DOKET
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActivePage('home')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Ringkasan & Wilayah
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('data')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Peta Spasial & Data NTB
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('report')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Kirim Formulir Pengaduan
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('track')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Lacak Disposisi Doket
                </button>
              </li>
            </ul>
          </div>

          {/* Batasan Sistem */}
          <div className="font-mono">
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              BATASAN PLATFORM
            </h4>
            <p className="text-[11px] text-slate-600 leading-relaxed mb-2 font-sans">
              Platform ini tidak memproses penebusan fisik pupuk atau mengubah daftar e-RDKK. Platform beroperasi sebagai sistem transparansi data dan whistleblowing publik.
            </p>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
              Data kosong bertuliskan <strong>"Belum Tersedia"</strong>, bukan nol.
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>© {new Date().getFullYear()} TANITERANG. DRAFT PERTAMA KOMPETISI MIA 2026 (WEB IN ACTION).</span>
          <span className="text-slate-700 font-bold">TEMA: DESIGNING DIGITAL FUTURES: POWERING PUBLIC TRANSPARENCY</span>
        </div>
      </div>
    </footer>
  );
}
