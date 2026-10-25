import React, { useState, useEffect, useRef } from 'react';
import L from 'leaflet';
import { NTB_REGIONS, HET_RATES, NTB_SUMMARY } from '../data/ntbData';
import { NTB_GEOJSON } from '../data/ntbGeoJSON';
import SourceBadge from '../components/SourceBadge';
import { Download, MapPin, Layers, Send, FileSpreadsheet, CheckCircle2, ChevronRight, BarChart2, ShieldAlert, ArrowUpRight } from 'lucide-react';

export default function DataMap({ setActivePage, preselectedKode, setPrefilledReportData }) {
  const [selectedLayer, setSelectedLayer] = useState('persen'); // 'persen' | 'alokasi' | 'laporan'
  const [selectedRegion, setSelectedRegion] = useState(() => {
    if (preselectedKode) {
      return NTB_REGIONS.find(r => r.kode === preselectedKode) || NTB_REGIONS[0];
    }
    return NTB_REGIONS[0];
  });
  const [searchFilter, setSearchFilter] = useState('');

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const geoJsonLayerRef = useRef(null);

  // Professional Choropleth Color Scale (Data Journalism / High Contrast)
  const getColor = (value, type) => {
    if (type === 'persen') {
      if (value >= 80) return '#114B2C'; // Forest dark
      if (value >= 76) return '#15803D';
      if (value >= 73) return '#22C55E';
      if (value >= 70) return '#86EFAC';
      return '#DCFCE7';
    } else if (type === 'alokasi') {
      if (value >= 50000) return '#0F172A';
      if (value >= 35000) return '#334155';
      if (value >= 20000) return '#64748B';
      if (value >= 10000) return '#94A3B8';
      return '#CBD5E1';
    } else {
      // Jumlah Laporan
      if (value >= 15) return '#991B1B';
      if (value >= 10) return '#DC2626';
      if (value >= 5) return '#EA580C';
      return '#F59E0B';
    }
  };

  // 1. Initialize Leaflet Map on Mount with OpenStreetMap
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Center on NTB (Lombok & Sumbawa archipelago)
    const map = L.map(mapContainerRef.current, {
      center: [-8.65, 117.35],
      zoom: 8,
      minZoom: 7,
      maxZoom: 13,
      scrollWheelZoom: false,
      zoomControl: true
    });

    // 100% Free OpenStreetMap Standard Tile Layer (Zero API Key Required)
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noopener">OpenStreetMap</a> kontributor',
      maxZoom: 18
    }).addTo(map);

    mapInstanceRef.current = map;

    return () => {
      map.remove();
      mapInstanceRef.current = null;
      geoJsonLayerRef.current = null;
    };
  }, []);

  // 2. Update GeoJSON Choropleth Polygons when layer or selectedRegion changes
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (geoJsonLayerRef.current) {
      map.removeLayer(geoJsonLayerRef.current);
    }

    const geoLayer = L.geoJSON(NTB_GEOJSON, {
      style: (feature) => {
        const region = NTB_REGIONS.find(r => r.kode === feature.properties.kode);
        let val = 0;
        if (region) {
          if (selectedLayer === 'persen') val = region.persenRealisasi;
          else if (selectedLayer === 'alokasi') val = region.alokasiTon;
          else val = region.jumlahLaporan;
        }

        const isCurrentSelected = selectedRegion && selectedRegion.kode === feature.properties.kode;

        return {
          fillColor: region ? getColor(val, selectedLayer) : '#E2E8F0',
          weight: isCurrentSelected ? 2.5 : 1,
          opacity: 1,
          color: isCurrentSelected ? '#0F172A' : '#FFFFFF',
          fillOpacity: isCurrentSelected ? 0.95 : 0.82
        };
      },
      onEachFeature: (feature, layer) => {
        const region = NTB_REGIONS.find(r => r.kode === feature.properties.kode);
        if (!region) return;

        const valLabel =
          selectedLayer === 'persen'
            ? `${region.persenRealisasi}% Realisasi Penyaluran`
            : selectedLayer === 'alokasi'
            ? `${region.alokasiTon.toLocaleString('id-ID')} Ton Alokasi Total`
            : `${region.jumlahLaporan} Kasus Aduan Terverifikasi`;

        layer.bindTooltip(
          `<div class="font-sans">
            <span class="font-mono text-[10px] text-slate-500 uppercase font-bold block">KODE BPS: ${region.kode}</span>
            <strong class="font-extrabold text-sm text-slate-900 block">${region.nama}</strong>
            <span class="text-xs font-bold text-gov-forest block mt-0.5">${valLabel}</span>
          </div>`,
          { sticky: true, className: 'leaflet-custom-tooltip' }
        );

        layer.on({
          click: () => {
            setSelectedRegion(region);
          },
          mouseover: (e) => {
            const l = e.target;
            l.setStyle({ weight: 2.5, color: '#0F172A', fillOpacity: 0.95 });
          },
          mouseout: (e) => {
            geoLayer.resetStyle(e.target);
          }
        });
      }
    }).addTo(map);

    geoJsonLayerRef.current = geoLayer;

    // Auto fit boundary once on initial render
    if (!map._hasFitBounds && geoLayer.getBounds().isValid()) {
      map.fitBounds(geoLayer.getBounds(), { padding: [15, 15] });
      map._hasFitBounds = true;
    }
  }, [selectedLayer, selectedRegion]);

  // Export CSV Handler
  const handleDownloadCSV = () => {
    const headers = ['Kode BPS,Nama Wilayah,Pulau,Alokasi (Ton),Realisasi (Ton),Persen Realisasi (%),Sisa Kuota (Ton),Laporan Terdaftar,Periode Data,Sumber Data,Tanggal Akses\n'];
    const rows = NTB_REGIONS.map(r =>
      `"${r.kode}","${r.nama}","${r.pulau}",${r.alokasiTon},${r.realisasiTon},${r.persenRealisasi},${r.selisihTon},${r.jumlahLaporan},"${r.periodeData}","${r.sumber}","${r.tanggalAkses}"`
    );

    const blob = new Blob([headers.concat(rows.join('\n'))], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `data_transparansi_pupuk_ntb_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleLaporRegion = (reg) => {
    if (setPrefilledReportData) {
      setPrefilledReportData({
        kodeWilayah: reg.kode,
        namaWilayah: reg.nama
      });
    }
    setActivePage('report');
  };

  const filteredRegions = NTB_REGIONS.filter(r =>
    r.nama.toLowerCase().includes(searchFilter.toLowerCase()) ||
    r.kode.includes(searchFilter)
  );

  return (
    <div className="space-y-6">
      {/* Editorial Title & Dataset Authority Strip */}
      <section className="bg-white border border-slate-200 p-5 rounded-gov">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="font-mono text-xs font-bold text-gov-forest bg-gov-light px-2 py-0.5 rounded border border-gov-border">
                SERI DATA SPASIAL NTB
              </span>
              <span className="text-slate-400">•</span>
              <span className="text-xs text-slate-500 font-medium">Batas Wilayah Geografis Resmi 10 Kab/Kota</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">
              Peta Keterbukaan Distribusi Pupuk Subsidi NTB
            </h1>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Visualisasi penyerapan kuota pupuk bersubsidi resmi (Urea, NPK, dan Organik) berdasarkan kompilasi data Dinas Pertanian dan Perkebunan NTB serta sistem e-Alokasi Kementan.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <SourceBadge sumber="Distanbun NTB & e-Alokasi" tipe="Dataset Resmi" tanggal="2024-10-15" />
            <button
              onClick={handleDownloadCSV}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded bg-white border border-slate-300 hover:border-slate-800 text-slate-800 text-xs font-bold font-mono transition-colors shadow-sm"
              title="Unduh seluruh data tabel dalam format CSV"
            >
              <Download className="w-3.5 h-3.5 text-gov-forest" />
              <span>UNDUH CSV (DATA MENTAH)</span>
            </button>
          </div>
        </div>
      </section>

      {/* Layer Control Toolbar (Crisp Segmented Bar - Anti AI-Slop) */}
      <section className="bg-white border border-slate-200 px-4 py-3 rounded-gov flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-2 font-bold text-slate-800">
          <Layers className="w-4 h-4 text-gov-forest" />
          <span>INDIKATOR LAYER CHOROPLETH:</span>
        </div>

        <div className="inline-flex rounded border border-slate-300 p-0.5 bg-slate-100 w-full sm:w-auto font-mono text-xs font-semibold">
          <button
            onClick={() => setSelectedLayer('persen')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-gov transition-colors ${
              selectedLayer === 'persen'
                ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            % Penyerapan Realisasi
          </button>
          <button
            onClick={() => setSelectedLayer('alokasi')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-gov transition-colors ${
              selectedLayer === 'alokasi'
                ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Volume Kuota (Ton)
          </button>
          <button
            onClick={() => setSelectedLayer('laporan')}
            className={`flex-1 sm:flex-initial px-3.5 py-1.5 rounded-gov transition-colors ${
              selectedLayer === 'laporan'
                ? 'bg-white text-slate-900 shadow-sm font-bold border border-slate-200'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kasus Aduan Warga
          </button>
        </div>
      </section>

      {/* Main Grid: Data Map on Left + Live Audit Inspector on Right (Split Workspace) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        {/* MAP AREA (Col 7) */}
        <div className="lg:col-span-7 bg-white border border-slate-200 rounded-gov overflow-hidden">
          {/* Map Sub-header */}
          <div className="px-4 py-2.5 bg-slate-50 border-b border-slate-200 flex items-center justify-between text-xs">
            <span className="font-mono text-slate-600">Peta Spasial Kepulauan NTB (Lombok & Sumbawa)</span>
            <span className="font-mono text-slate-500 text-[11px]">Klik poligon untuk inspeksi rincian</span>
          </div>

          {/* Leaflet Container */}
          <div className="relative w-full h-[400px] sm:h-[480px]">
            <div ref={mapContainerRef} className="w-full h-full" />

            {/* Scale Bar Legend (Technical Docked Bottom) */}
            <div className="absolute bottom-2 left-2 z-[400] bg-white/95 backdrop-blur px-3 py-2 border border-slate-300 rounded shadow-sm text-[11px] font-mono">
              <span className="font-bold text-slate-800 block mb-1">
                SKALA {selectedLayer.toUpperCase()}:
              </span>
              {selectedLayer === 'persen' && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="inline-block w-4 h-3 bg-[#DCFCE7] border border-slate-300"></span> &lt;70%
                  <span className="inline-block w-4 h-3 bg-[#86EFAC] ml-1"></span> 70-72%
                  <span className="inline-block w-4 h-3 bg-[#22C55E] ml-1"></span> 73-75%
                  <span className="inline-block w-4 h-3 bg-[#15803D] ml-1"></span> 76-79%
                  <span className="inline-block w-4 h-3 bg-[#114B2C] ml-1"></span> &ge;80%
                </div>
              )}
              {selectedLayer === 'alokasi' && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="inline-block w-4 h-3 bg-[#CBD5E1]"></span> &lt;10k
                  <span className="inline-block w-4 h-3 bg-[#94A3B8] ml-1"></span> 10-20k
                  <span className="inline-block w-4 h-3 bg-[#64748B] ml-1"></span> 20-35k
                  <span className="inline-block w-4 h-3 bg-[#334155] ml-1"></span> 35-50k
                  <span className="inline-block w-4 h-3 bg-[#0F172A] ml-1"></span> &ge;50k Ton
                </div>
              )}
              {selectedLayer === 'laporan' && (
                <div className="flex items-center gap-1.5 text-[10px]">
                  <span className="inline-block w-4 h-3 bg-[#F59E0B]"></span> 1-4
                  <span className="inline-block w-4 h-3 bg-[#EA580C] ml-1"></span> 5-9
                  <span className="inline-block w-4 h-3 bg-[#DC2626] ml-1"></span> 10-14
                  <span className="inline-block w-4 h-3 bg-[#991B1B] ml-1"></span> &ge;15 Kasus
                </div>
              )}
            </div>
          </div>
        </div>

        {/* LIVE REGION INSPECTOR (Col 5) - Real Editorial Transparency */}
        <div className="lg:col-span-5 space-y-4">
          {selectedRegion ? (
            <div className="bg-white border-2 border-slate-800 rounded-gov p-5 space-y-4 shadow-sm">
              <div className="border-b border-slate-200 pb-3">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-bold text-slate-500 uppercase">
                    KODE WILAYAH: {selectedRegion.kode}
                  </span>
                  <span className="px-2 py-0.5 rounded text-xs font-mono font-bold bg-slate-100 text-slate-700 border border-slate-300">
                    Pulau {selectedRegion.pulau}
                  </span>
                </div>
                <h2 className="text-xl font-black text-slate-900 mt-1">
                  {selectedRegion.nama}
                </h2>
                <p className="text-xs text-slate-500 font-mono mt-0.5">
                  Cakupan: {selectedRegion.kecamatanCount} Kecamatan • {selectedRegion.desaCount} Desa / Kelurahan
                </p>
              </div>

              {/* KPI Audit Grid */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">TOTAL ALOKASI</span>
                  <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                    {selectedRegion.alokasiTon.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono"> Ton</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">REALISASI PENYALURAN</span>
                  <span className="text-lg font-black font-mono text-gov-forest tabular-nums">
                    {selectedRegion.realisasiTon.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono"> Ton</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">% PENYERAPAN</span>
                  <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                    {selectedRegion.persenRealisasi}%
                  </span>
                  <span className="text-[10px] text-emerald-700 font-bold block mt-0.5">TERCATAT AKTIF</span>
                </div>
                <div className="p-3 bg-slate-50 border border-slate-200 rounded">
                  <span className="text-[10px] font-mono font-bold text-slate-500 block uppercase">SISA KUOTA</span>
                  <span className="text-lg font-black font-mono text-slate-900 tabular-nums">
                    {selectedRegion.selisihTon.toLocaleString('id-ID')}
                  </span>
                  <span className="text-[11px] text-slate-500 font-mono"> Ton</span>
                </div>
              </div>

              {/* Progress Indicator */}
              <div className="space-y-1">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-600">Realisasi terhadap Kuota Tahunan:</span>
                  <strong className="text-slate-900">{selectedRegion.persenRealisasi}%</strong>
                </div>
                <div className="w-full bg-slate-200 h-2 rounded overflow-hidden">
                  <div
                    className="bg-gov-forest h-2 transition-all duration-300"
                    style={{ width: `${Math.min(selectedRegion.persenRealisasi, 100)}%` }}
                  ></div>
                </div>
              </div>

              {/* Breakdown per Commodity (Urea, NPK, Organik) */}
              <div className="space-y-2 pt-2 border-t border-slate-200">
                <span className="font-mono text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  RINCIAN PER KOMODITAS PUPUK (TON):
                </span>
                <div className="space-y-2 text-xs font-mono">
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Pupuk Urea</span>
                      <span>{selectedRegion.detailPupuk.urea.realisasi.toLocaleString('id-ID')} / {selectedRegion.detailPupuk.urea.alokasi.toLocaleString('id-ID')} Ton</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Pupuk NPK Phonska</span>
                      <span>{selectedRegion.detailPupuk.npk.realisasi.toLocaleString('id-ID')} / {selectedRegion.detailPupuk.npk.alokasi.toLocaleString('id-ID')} Ton</span>
                    </div>
                  </div>
                  <div className="p-2.5 bg-slate-50 border border-slate-200 rounded">
                    <div className="flex justify-between font-bold text-slate-900">
                      <span>Pupuk Organik</span>
                      <span>{selectedRegion.detailPupuk.organik.realisasi.toLocaleString('id-ID')} / {selectedRegion.detailPupuk.organik.alokasi.toLocaleString('id-ID')} Ton</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Direct Action: Laporkan di Wilayah Ini */}
              <div className="pt-2">
                <button
                  onClick={() => handleLaporRegion(selectedRegion)}
                  className="w-full flex items-center justify-center gap-2 px-4 py-2.5 rounded bg-gov-forest hover:bg-gov-hover text-white font-bold text-xs font-mono tracking-wider transition-colors shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>LAPORKAN KENDALA DI {selectedRegion.nama.toUpperCase()}</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-6 bg-white border border-slate-200 text-center font-mono text-xs text-slate-500">
              Pilih salah satu poligon di peta untuk melihat data audit.
            </div>
          )}

          {/* HET Reference Summary Card */}
          <div className="bg-slate-50 border border-slate-200 rounded-gov p-4 space-y-2.5 text-xs">
            <div className="flex items-center justify-between font-mono font-bold text-slate-800">
              <span>HET RESMI (PERMENTAN NO. 01/2024):</span>
              <span className="text-gov-forest">BERLAKU SAAT INI</span>
            </div>
            <div className="grid grid-cols-3 gap-2 font-mono text-[11px]">
              <div className="p-2 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 block">UREA (50KG)</span>
                <strong className="text-slate-900 font-black">Rp 90.000</strong>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 block">NPK (50KG)</span>
                <strong className="text-slate-900 font-black">Rp 92.000</strong>
              </div>
              <div className="p-2 bg-white border border-slate-200 rounded">
                <span className="text-slate-500 block">ORGANIK (40KG)</span>
                <strong className="text-slate-900 font-black">Rp 25.600</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Structured Civic Table (Full Data Density - Government Grade) */}
      <section className="bg-white border border-slate-200 rounded-gov p-5 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-black text-slate-900">
              Tabel Matriks Transparansi 10 Kabupaten/Kota NTB
            </h2>
            <p className="text-xs text-slate-500">
              Perbandingan lengkap volume alokasi, realisasi penyerapan, dan kasus aduan warga.
            </p>
          </div>

          <div className="w-full sm:w-64">
            <input
              type="text"
              placeholder="Cari nama kabupaten/kota..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full px-3 py-1.5 rounded border border-slate-300 text-xs focus:border-slate-800"
            />
          </div>
        </div>

        <div className="overflow-x-auto border border-slate-200 rounded">
          <table className="w-full text-left text-xs font-mono">
            <thead className="bg-slate-100 text-slate-700 border-b border-slate-200 text-[11px]">
              <tr>
                <th className="py-2.5 px-3 font-bold">KODE BPS</th>
                <th className="py-2.5 px-3 font-bold">NAMA WILAYAH</th>
                <th className="py-2.5 px-3 font-bold">PULAU</th>
                <th className="py-2.5 px-3 font-bold text-right">ALOKASI (TON)</th>
                <th className="py-2.5 px-3 font-bold text-right">REALISASI (TON)</th>
                <th className="py-2.5 px-3 font-bold text-center">% PENYERAPAN</th>
                <th className="py-2.5 px-3 font-bold text-right">SISA KUOTA (TON)</th>
                <th className="py-2.5 px-3 font-bold text-center">ADUAN</th>
                <th className="py-2.5 px-3 font-bold text-center">AKSI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredRegions.map((region) => {
                const isSelected = selectedRegion && selectedRegion.kode === region.kode;
                return (
                  <tr
                    key={region.kode}
                    onClick={() => setSelectedRegion(region)}
                    className={`cursor-pointer transition-colors ${
                      isSelected ? 'bg-slate-100/90 font-bold' : 'hover:bg-slate-50'
                    }`}
                  >
                    <td className="py-2.5 px-3 text-slate-500">{region.kode}</td>
                    <td className="py-2.5 px-3 font-sans font-bold text-slate-900">{region.nama}</td>
                    <td className="py-2.5 px-3 text-slate-600">{region.pulau}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums">{region.alokasiTon.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-gov-forest font-bold">{region.realisasiTon.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="px-2 py-0.5 rounded font-bold bg-slate-100 text-slate-900 border border-slate-200">
                        {region.persenRealisasi}%
                      </span>
                    </td>
                    <td className="py-2.5 px-3 text-right tabular-nums text-slate-600">{region.selisihTon.toLocaleString('id-ID')}</td>
                    <td className="py-2.5 px-3 text-center">
                      <span className="font-bold text-amber-700">{region.jumlahLaporan}</span>
                    </td>
                    <td className="py-2.5 px-3 text-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleLaporRegion(region);
                        }}
                        className="text-xs font-bold text-gov-forest hover:underline"
                      >
                        Lapor
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
