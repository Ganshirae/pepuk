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
                PE<span className="text-gov-forest">PUK</span>
              </span>
              <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-300">
                NASIONAL + NTB
              </span>
            </div>
            <p className="text-slate-600 leading-relaxed max-w-md font-sans">
              Portal independen keterbukaan data distribusi pupuk bersubsidi: data resmi Kementerian Pertanian untuk 38 provinsi dan Satu Data NTB untuk 10 kabupaten/kota. Bukan situs resmi pemerintah.
            </p>
            <div className="pt-2 font-mono text-[11px] text-slate-500 space-y-1">
              <div>• Dasar: Perpres 6/2025, Permentan 15/2025 jo. 3/2026, Kepmentan 1117/2025 (HET)</div>
              <div>• Tenggat tindak lanjut: PermenPANRB 62/2018</div>
            </div>
          </div>

          {/* Quick Links */}
          <div className="font-mono">
            <h4 className="font-bold text-slate-900 mb-3 text-xs uppercase tracking-wider">
              NAVIGASI
            </h4>
            <ul className="space-y-2">
              <li>
                <button
                  onClick={() => setActivePage('home')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Dashboard
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('eligibility')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Cek Hak Subsidi
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('report')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Lapor Masalah
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActivePage('track')}
                  className="text-slate-600 hover:text-gov-forest transition-colors"
                >
                  Lacak Laporan
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
              Platform ini tidak memproses penebusan pupuk, tidak mendaftarkan ke e-RDKK, dan tidak menggantikan kanal pengaduan resmi.
            </p>
            <div className="p-2.5 bg-slate-50 border border-slate-200 rounded text-[11px] text-slate-700">
              Data kosong ditampilkan sebagai <strong>"–"</strong> atau abu-abu, bukan nol.
            </div>
          </div>
        </div>

        {/* Bottom Strip */}
        <div className="border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
          <span>© {new Date().getFullYear()} PEPUK. DRAFT PERTAMA KOMPETISI MIA 2026 (WEB IN ACTION).</span>
          <span className="text-slate-700 font-bold">TEMA: DESIGNING DIGITAL FUTURES: POWERING PUBLIC TRANSPARENCY</span>
        </div>
      </div>
    </footer>
  );
}
