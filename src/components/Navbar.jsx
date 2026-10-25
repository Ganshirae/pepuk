import React from 'react';
import { LayoutDashboard, Map, Send, Search, BookmarkCheck, Shield, ExternalLink } from 'lucide-react';

export default function Navbar({ activePage, setActivePage, myReportsCount = 0 }) {
  const navTabs = [
    { id: 'home', label: 'Ringkasan & Wilayah', icon: LayoutDashboard },
    { id: 'data', label: 'Peta Spasial & Data', icon: Map },
    { id: 'report', label: 'Form Pengaduan', icon: Send, isAction: true },
    { id: 'track', label: 'Lacak Disposisi', icon: Search },
    { id: 'my-reports', label: 'Berkas Tersimpan', icon: BookmarkCheck, badge: myReportsCount }
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200">
      {/* Top Official Government & Transparency Ribbon */}
      <div className="bg-slate-900 text-slate-300 text-[11px] font-mono tracking-wider px-4 sm:px-8 py-1.5 flex flex-wrap items-center justify-between border-b border-slate-800">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
          <span className="font-bold text-white uppercase tracking-wider">PORTAL KETERBUKAAN PUBLIK</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">PILOT PROVINSI NUSA TENGGARA BARAT</span>
        </div>
        <div className="hidden sm:flex items-center gap-4 text-[10px] text-slate-400">
          <span>SUMBER DATA: e-ALOKASI KEMENTAN & DISTANBUN NTB</span>
          <span>•</span>
          <span className="text-emerald-400 font-bold">AKSES PUBLIK TANPA NIK / KTP</span>
        </div>
      </div>

      {/* Main Navigation Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="h-16 flex items-center justify-between gap-4">
          {/* Logo & Identity */}
          <button
            onClick={() => setActivePage('home')}
            className="flex items-center gap-3 text-left focus:outline-none group"
            aria-label="Kembali ke Beranda TANITERANG"
          >
            <div className="w-9 h-9 rounded bg-gov-forest text-white flex items-center justify-center font-extrabold text-sm border border-gov-dark shadow-sm">
              TT
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="font-black text-lg tracking-tight text-slate-900">
                  TANI<span className="text-gov-forest">TERANG</span>
                </span>
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 border border-slate-200 font-bold">
                  NTB PILOT
                </span>
              </div>
              <p className="text-[11px] text-slate-500 font-medium hidden sm:block">
                Transparansi Alokasi, Realisasi & Harga Acuan Pupuk Bersubsidi
              </p>
            </div>
          </button>

          {/* Desktop Tab Navigation (Clean, Sharp Underlines - Anti AI-Slop) */}
          <nav className="hidden md:flex items-center gap-1 lg:gap-2 h-full" aria-label="Navigasi Utama">
            {navTabs.map((tab) => {
              const Icon = tab.icon;
              const isActive = activePage === tab.id;

              if (tab.isAction) {
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActivePage(tab.id)}
                    className="ml-2 inline-flex items-center gap-2 px-3.5 py-2 rounded bg-gov-forest hover:bg-gov-hover text-white text-xs font-bold transition-colors shadow-sm"
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>Lapor Masalah</span>
                  </button>
                );
              }

              return (
                <button
                  key={tab.id}
                  onClick={() => setActivePage(tab.id)}
                  className={`relative h-full flex items-center gap-1.5 px-3 text-xs font-bold transition-colors border-b-2 ${
                    isActive
                      ? 'border-gov-forest text-gov-forest bg-slate-50/60'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5 text-slate-500" />
                  <span>{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="ml-1 inline-flex items-center justify-center px-1.5 py-0.5 text-[10px] font-mono font-bold leading-none text-slate-900 bg-amber-border rounded">
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>

      {/* Mobile Sticky Bottom Nav (High contrast, clean lines) */}
      <nav
        className="md:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 px-2 py-1 shadow-md"
        aria-label="Navigasi Seluler"
      >
        <div className="grid grid-cols-5 gap-1 items-center max-w-md mx-auto text-center">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activePage === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActivePage(tab.id)}
                className={`py-1.5 px-1 flex flex-col items-center justify-center min-h-[48px] rounded transition-colors ${
                  isActive
                    ? 'text-gov-forest font-bold bg-gov-light'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${tab.isAction ? 'text-gov-forest' : ''}`} />
                <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[62px]">
                  {tab.label.split(' ')[0]}
                </span>
                {tab.badge > 0 && (
                  <span className="absolute top-1 right-2 w-3.5 h-3.5 text-[9px] font-mono font-bold text-slate-900 bg-amber-border rounded-full flex items-center justify-center">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </nav>
    </header>
  );
}
