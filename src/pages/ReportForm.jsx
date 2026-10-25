import React, { useState, useEffect } from 'react';
import { NTB_REGIONS, KECAMATAN_MAP, HET_RATES } from '../data/ntbData';
import { saveNewReport, saveDraft, getDraft, clearDraft } from '../utils/storage';
import { generatePublicId, generateSecretCode, hashSecretCode } from '../utils/crypto';
import {
  ShieldAlert,
  ChevronLeft,
  ChevronRight,
  Upload,
  Trash2,
  Send,
  FileCheck,
  AlertCircle
} from 'lucide-react';

export default function ReportForm({ setActivePage, setSubmittedReport, prefilledData }) {
  const [step, setStep] = useState(1);
  const [errors, setErrors] = useState({});

  // Form states
  const [jenisMasalah, setJenisMasalah] = useState('harga_di_atas_het');
  const [jenisPupuk, setJenisPupuk] = useState('Pupuk Urea');
  const [kodeWilayah, setKodeWilayah] = useState(prefilledData?.kodeWilayah || '5203');
  const [kecamatan, setKecamatan] = useState('');
  const [desa, setDesa] = useState('');
  const [tanggalKejadian, setTanggalKejadian] = useState(() => new Date().toISOString().slice(0, 10));
  const [namaKios, setNamaKios] = useState('');
  const [hargaDibayar, setHargaDibayar] = useState('');
  const [deskripsi, setDeskripsi] = useState('');
  const [lampiran, setLampiran] = useState([]);
  const [kontakOpsional, setKontakOpsional] = useState('');
  const [setujuPrivasi, setSetujuPrivasi] = useState(true);
  const [captchaAnswer, setCaptchaAnswer] = useState('');
  const [captchaNum1] = useState(5);
  const [captchaNum2] = useState(4);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Restore draft
  useEffect(() => {
    const draft = getDraft();
    if (draft && !prefilledData) {
      if (draft.jenisMasalah) setJenisMasalah(draft.jenisMasalah);
      if (draft.jenisPupuk) setJenisPupuk(draft.jenisPupuk);
      if (draft.kodeWilayah) setKodeWilayah(draft.kodeWilayah);
      if (draft.kecamatan) setKecamatan(draft.kecamatan);
      if (draft.namaKios) setNamaKios(draft.namaKios);
      if (draft.hargaDibayar) setHargaDibayar(draft.hargaDibayar);
      if (draft.deskripsi) setDeskripsi(draft.deskripsi);
    }
  }, [prefilledData]);

  // Auto-save draft
  useEffect(() => {
    const timer = setTimeout(() => {
      saveDraft({
        jenisMasalah,
        jenisPupuk,
        kodeWilayah,
        kecamatan,
        namaKios,
        hargaDibayar,
        deskripsi
      });
    }, 500);
    return () => clearTimeout(timer);
  }, [jenisMasalah, jenisPupuk, kodeWilayah, kecamatan, namaKios, hargaDibayar, deskripsi]);

  const currentHet = HET_RATES.find(h => h.nama.toLowerCase().includes(jenisPupuk.toLowerCase().replace('pupuk ', ''))) || HET_RATES[0];
  const hargaNumber = parseInt(hargaDibayar) || 0;
  const isOverHet = hargaNumber > currentHet.hetPerSak;
  const selisihHarga = isOverHet ? hargaNumber - currentHet.hetPerSak : 0;

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files || []);
    if (lampiran.length + files.length > 3) {
      setErrors(prev => ({ ...prev, lampiran: 'Batas maksimal 3 foto bukti saja.' }));
      return;
    }

    const validFiles = [];
    for (const file of files) {
      if (file.size > 2 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, lampiran: `File "${file.name}" melebihi 2MB. Kecilkan ukuran foto.` }));
        return;
      }
      validFiles.push({
        nama: file.name,
        ukuran: `${(file.size / 1024).toFixed(0)} KB`,
        previewUrl: URL.createObjectURL(file)
      });
    }

    setLampiran(prev => [...prev, ...validFiles]);
    setErrors(prev => {
      const copy = { ...prev };
      delete copy.lampiran;
      return copy;
    });
  };

  const removeFile = (index) => {
    setLampiran(prev => prev.filter((_, i) => i !== index));
  };

  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!jenisMasalah) newErrors.jenisMasalah = 'Pilih klasifikasi pelanggaran.';
      if (!jenisPupuk) newErrors.jenisPupuk = 'Pilih jenis pupuk.';
    } else if (currentStep === 2) {
      if (!kodeWilayah) newErrors.kodeWilayah = 'Pilih kabupaten/kota lokasi kejadian.';
      if (!tanggalKejadian) newErrors.tanggalKejadian = 'Tanggal kejadian wajib diisi.';
    } else if (currentStep === 3) {
      if (jenisMasalah === 'harga_di_atas_het') {
        if (!hargaDibayar || isNaN(hargaNumber) || hargaNumber <= 0) {
          newErrors.hargaDibayar = 'Masukkan harga riil yang Anda bayarkan per sak.';
        }
      }
      if (!deskripsi || deskripsi.trim().length < 10) {
        newErrors.deskripsi = 'Tuliskan rincian kronologi singkat (minimal 10 karakter).';
      }
    } else if (currentStep === 4) {
      if (!setujuPrivasi) {
        newErrors.privasi = 'Persetujuan pernyataan integritas data wajib dicentang.';
      }
      if (parseInt(captchaAnswer) !== captchaNum1 + captchaNum2) {
        newErrors.captcha = `Jawaban salah. Berapa ${captchaNum1} + ${captchaNum2}?`;
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handlePrev = () => {
    setStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(4)) return;

    setIsSubmitting(true);

    const publicId = generatePublicId();
    const secretCode = generateSecretCode();
    const tokenHash = await hashSecretCode(secretCode);

    const selectedRegionObj = NTB_REGIONS.find(r => r.kode === kodeWilayah);
    const namaWilayah = selectedRegionObj ? selectedRegionObj.nama : 'Wilayah NTB';

    const now = new Date();
    const nowStr = now.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) + ' WITA';
    const deadline = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    const deadlineStr = deadline.toLocaleString('id-ID', { dateStyle: 'short', timeStyle: 'short' }) + ' WITA';

    const newReport = {
      idPublik: publicId,
      tokenHash: tokenHash,
      secretCodePlain: secretCode,
      status: 'DITERIMA',
      statusLabel: 'Diterima Sistem Pengawasan',
      kodeWilayah,
      namaWilayah,
      kecamatan: kecamatan || 'Kecamatan Belum Disebut',
      desa: desa || 'Desa Belum Disebut',
      jenisMasalah,
      jenisPupuk,
      hargaDibayar: hargaNumber,
      hetResmi: currentHet.hetPerSak,
      selisih: selisihHarga,
      tanggalKejadian,
      namaKios: namaKios ? namaKios.trim() : 'Tidak Disebutkan',
      namaKiosVerified: false,
      deskripsi,
      lampiran,
      kontakOpsional: kontakOpsional.trim() || null,
      timeline: [
        {
          status: 'DITERIMA',
          label: 'Pengaduan Dicatat dalam Doket Pengawasan',
          waktu: nowStr,
          catatan: 'Laporan berhasil dicatat dalam antrean audit awal. Belum dipublikasikan ke publik demi perlindungan saksi.'
        }
      ],
      batasRespons: deadlineStr,
      dibuatPada: nowStr
    };

    saveNewReport(newReport);
    clearDraft();

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedReport(newReport);
      setActivePage('receipt');
    }, 500);
  };

  const availableKecamatan = KECAMATAN_MAP[kodeWilayah] || [];

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Institutional Form Header */}
      <div className="bg-white border border-slate-200 p-6 rounded-gov space-y-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-xs font-bold text-gov-forest bg-gov-light px-2 py-0.5 rounded border border-gov-border">
            FORMULIR PENGADUAN RESMI
          </span>
          <span className="text-slate-400">•</span>
          <span className="text-xs font-mono text-slate-500">DILINDUNGI PROTOKOL ANONIM</span>
        </div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">
          Formulir Pengaduan Pelanggaran Distribusi Pupuk
        </h1>
        <p className="text-xs text-slate-600 leading-relaxed">
          Gunakan formulir ini untuk melaporkan penjualan pupuk bersubsidi di atas HET, kelangkaan jatah, atau penolakan penebusan resmi. Laporan ini dilacak menggunakan kode rahasia dan tidak dapat ditutup tanpa konfirmasi Anda.
        </p>
      </div>

      {/* Step Progress Bar (Strict Grid Segment - Non AI-Slop) */}
      <div className="bg-white border border-slate-200 rounded-gov p-4">
        <div className="grid grid-cols-4 gap-2 text-center font-mono text-xs">
          {[
            { num: 1, title: '1. MASALAH' },
            { num: 2, title: '2. LOKASI' },
            { num: 3, title: '3. BUKTI' },
            { num: 4, title: '4. VALIDASI' }
          ].map((s) => (
            <div
              key={s.num}
              className={`py-2 px-1 border-b-2 font-bold transition-colors ${
                step === s.num
                  ? 'border-gov-forest text-gov-forest bg-slate-50'
                  : step > s.num
                  ? 'border-slate-800 text-slate-900'
                  : 'border-slate-200 text-slate-400'
              }`}
            >
              {s.title}
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Body */}
      <form onSubmit={handleSubmit} className="bg-white border border-slate-200 rounded-gov p-6 sm:p-8 space-y-6">
        {/* STEP 1: KLASIFIKASI PELANGGARAN */}
        {step === 1 && (
          <div className="space-y-5">
            <div>
              <label className="block text-xs font-bold font-mono text-slate-900 uppercase mb-2">
                PILIH KLASIFIKASI KENDALA DISTRIBUSI <span className="text-red-600">*</span>
              </label>
              <div className="space-y-2">
                {[
                  {
                    id: 'harga_di_atas_het',
                    title: 'Penjualan di Atas Harga Eceran Tertinggi (HET)',
                    desc: 'Kios mematok harga lebih tinggi dari ketetapan resmi (contoh: Urea > Rp 90.000/sak atau NPK > Rp 92.000/sak).'
                  },
                  {
                    id: 'tidak_kebagian',
                    title: 'Jatah Habis / Penolakan Penebusan Kios',
                    desc: 'Petani terdaftar di e-RDKK namun pihak pengecer menyatakan kuota habis atau menolak melayani.'
                  },
                  {
                    id: 'tidak_terdaftar',
                    title: 'Nama Tidak Masuk ke Daftar e-RDKK',
                    desc: 'Sudah menyetor data melalui kelompok tani/penyuluh namun tidak tercatat saat diverifikasi di kios.'
                  },
                  {
                    id: 'kualitas_buruk',
                    title: 'Kualitas Pupuk Rusak / Kemasan Tidak Sesuai',
                    desc: 'Pupuk menggumpal, rusak akibat penyimpanan basah, atau berat timbangan kurang dari kemasan resmi.'
                  }
                ].map((item) => (
                  <label
                    key={item.id}
                    onClick={() => setJenisMasalah(item.id)}
                    className={`block p-3.5 border rounded cursor-pointer transition-colors ${
                      jenisMasalah === item.id
                        ? 'border-gov-forest bg-gov-light/60 border-l-4 border-l-gov-forest'
                        : 'border-slate-200 hover:border-slate-400 bg-white'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <strong className="text-sm font-bold text-slate-900">{item.title}</strong>
                      <input
                        type="radio"
                        name="masalah"
                        checked={jenisMasalah === item.id}
                        onChange={() => setJenisMasalah(item.id)}
                        className="text-gov-forest focus:ring-gov-forest"
                      />
                    </div>
                    <p className="text-xs text-slate-600 mt-1">{item.desc}</p>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="selectPupuk" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                KOMODITAS PUPUK BERSUBSIDI TERKAIT <span className="text-red-600">*</span>
              </label>
              <select
                id="selectPupuk"
                value={jenisPupuk}
                onChange={(e) => setJenisPupuk(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 font-mono text-xs focus:border-slate-800"
              >
                <option value="Pupuk Urea">Pupuk Urea (HET Resmi: Rp 90.000 / sak 50kg)</option>
                <option value="Pupuk NPK (Phonska)">Pupuk NPK Phonska (HET Resmi: Rp 92.000 / sak 50kg)</option>
                <option value="NPK Formula Khusus (Kakao)">NPK Formula Khusus Kakao (HET Resmi: Rp 132.000 / sak 50kg)</option>
                <option value="Pupuk Organik">Pupuk Organik (HET Resmi: Rp 25.600 / sak 40kg)</option>
              </select>
            </div>
          </div>
        )}

        {/* STEP 2: LOKASI & WAKTU */}
        {step === 2 && (
          <div className="space-y-4">
            <div>
              <label htmlFor="selectKabupaten" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                KABUPATEN / KOTA (PROVINSI NTB) <span className="text-red-600">*</span>
              </label>
              <select
                id="selectKabupaten"
                value={kodeWilayah}
                onChange={(e) => {
                  setKodeWilayah(e.target.value);
                  setKecamatan('');
                }}
                className="w-full px-3 py-2 rounded border border-slate-300 font-mono text-xs focus:border-slate-800"
              >
                {NTB_REGIONS.map((r) => (
                  <option key={r.kode} value={r.kode}>
                    [{r.kode}] {r.nama} (Pulau {r.pulau})
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="selectKecamatan" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                  KECAMATAN
                </label>
                <select
                  id="selectKecamatan"
                  value={kecamatan}
                  onChange={(e) => setKecamatan(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 font-mono text-xs focus:border-slate-800"
                >
                  <option value="">-- Pilih Kecamatan Terkait --</option>
                  {availableKecamatan.map((kec) => (
                    <option key={kec} value={kec}>{kec}</option>
                  ))}
                </select>
              </div>

              <div>
                <label htmlFor="inputDesa" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                  DESA / DUSUN (OPSIONAL)
                </label>
                <input
                  id="inputDesa"
                  type="text"
                  placeholder="Nama desa atau lokasi kelompok tani"
                  value={desa}
                  onChange={(e) => setDesa(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-xs focus:border-slate-800"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label htmlFor="inputTanggal" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                  TANGGAL KEJADIAN <span className="text-red-600">*</span>
                </label>
                <input
                  id="inputTanggal"
                  type="date"
                  value={tanggalKejadian}
                  onChange={(e) => setTanggalKejadian(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 font-mono text-xs focus:border-slate-800"
                />
              </div>

              <div>
                <label htmlFor="inputKios" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                  NAMA KIOS PENGECER (OPSIONAL)
                </label>
                <input
                  id="inputKios"
                  type="text"
                  placeholder="Contoh: Kios UD Tani Jaya"
                  value={namaKios}
                  onChange={(e) => setNamaKios(e.target.value)}
                  className="w-full px-3 py-2 rounded border border-slate-300 text-xs focus:border-slate-800"
                />
                <span className="text-[10px] text-slate-500 font-mono block mt-1">
                  *Nama kios dienkripsi dan tidak dipublikasikan sebelum diverifikasi tim pengawas.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: DETAIL, HARGA & BUKTI */}
        {step === 3 && (
          <div className="space-y-4">
            {/* Kalkulator Disparitas Harga (Jika masalah HET) */}
            {jenisMasalah === 'harga_di_atas_het' && (
              <div className="bg-slate-50 border border-slate-300 rounded-gov p-4 space-y-3 font-mono">
                <div>
                  <label htmlFor="inputHarga" className="block text-xs font-bold text-slate-900 uppercase mb-1">
                    HARGA YANG DIMINTA KIOS PER SAK (RP) <span className="text-red-600">*</span>
                  </label>
                  <input
                    id="inputHarga"
                    type="number"
                    placeholder="Contoh: 140000"
                    value={hargaDibayar}
                    onChange={(e) => setHargaDibayar(e.target.value)}
                    className="w-full px-3 py-2 rounded border border-slate-400 font-bold text-sm tabular-nums focus:border-slate-900"
                  />
                  {errors.hargaDibayar && (
                    <p className="mt-1 text-xs text-red-600 font-sans">{errors.hargaDibayar}</p>
                  )}
                </div>

                {/* Audit HET Box */}
                <div className="bg-white border border-slate-200 p-3 rounded text-xs space-y-1">
                  <div className="flex justify-between text-slate-600">
                    <span>HET RESMI (PERMENTAN 01/2024):</span>
                    <strong className="text-slate-900">
                      Rp {currentHet.hetPerSak.toLocaleString('id-ID')} / sak ({currentHet.kemasanKg}kg)
                    </strong>
                  </div>
                  {isOverHet ? (
                    <div className="flex justify-between text-red-700 font-bold pt-1 border-t border-slate-200">
                      <span>DISPARITAS DI ATAS HARGA RESMI:</span>
                      <span>+ Rp {selisihHarga.toLocaleString('id-ID')} / sak</span>
                    </div>
                  ) : hargaNumber > 0 ? (
                    <div className="text-gov-forest font-bold pt-1 border-t border-slate-200">
                      ✓ Harga yang Anda masukkan sesuai atau di bawah HET resmi.
                    </div>
                  ) : null}
                </div>
              </div>
            )}

            <div>
              <label htmlFor="inputKronologi" className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                KRONOLOGI / URAIAN FAKTA KEJADIAN <span className="text-red-600">*</span>
              </label>
              <textarea
                id="inputKronologi"
                rows={4}
                placeholder="Jelaskan secara ringkas kejadian di lapangan (misalnya nama kios menolak memberikan struk, pupuk dibundel dengan barang lain, atau jadwal penebusan dipersulit)..."
                value={deskripsi}
                onChange={(e) => setDeskripsi(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-xs focus:border-slate-800"
              ></textarea>
              {errors.deskripsi && (
                <p className="mt-1 text-xs text-red-600 font-sans">{errors.deskripsi}</p>
              )}
            </div>

            {/* Lampiran Bukti Foto */}
            <div>
              <label className="block text-xs font-bold font-mono text-slate-900 uppercase mb-1">
                LAMPIRAN FOTO BUKTI (MAKSIMAL 3 BERKAS, @2MB)
              </label>
              <p className="text-[11px] text-slate-500 mb-2">
                Dapat berupa foto struk pembayaran, foto kemasan pupuk, atau buku anggota kelompok tani.
              </p>

              {lampiran.length < 3 && (
                <label className="border border-dashed border-slate-300 hover:border-slate-800 rounded p-4 flex flex-col items-center justify-center cursor-pointer bg-slate-50 hover:bg-slate-100 transition-colors">
                  <Upload className="w-5 h-5 text-slate-600 mb-1" />
                  <span className="text-xs font-bold text-slate-800">Unggah Berkas Bukti (JPG, PNG)</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                </label>
              )}

              {lampiran.length > 0 && (
                <div className="grid grid-cols-3 gap-2 mt-3 font-mono text-xs">
                  {lampiran.map((file, idx) => (
                    <div key={idx} className="p-2 bg-slate-50 border border-slate-200 rounded flex justify-between items-center">
                      <span className="truncate max-w-[120px] text-slate-800 font-bold">{file.nama}</span>
                      <button
                        type="button"
                        onClick={() => removeFile(idx)}
                        className="text-red-600 hover:text-red-800 ml-2"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* STEP 4: KONTAK OPSIONAL & INTEGRITAS */}
        {step === 4 && (
          <div className="space-y-4">
            <div className="bg-slate-50 border border-slate-200 rounded-gov p-4 space-y-2">
              <span className="font-mono text-xs font-bold text-slate-800 uppercase block">
                SALURAN NOTIFIKASI OPSIONAL
              </span>
              <p className="text-xs text-slate-600">
                Boleh dikosongkan. Jika Anda mengisi nomor WhatsApp atau email, sistem akan mengirimkan pemberitahuan setiap ada tindak lanjut dari instansi pengawas.
              </p>
              <input
                type="text"
                placeholder="Nomor WhatsApp / Email Aktif (Opsional)"
                value={kontakOpsional}
                onChange={(e) => setKontakOpsional(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 font-mono text-xs focus:border-slate-800"
              />
            </div>

            {/* Anti-Spam Captcha Pertanyaan Matematika */}
            <div className="bg-slate-50 border border-slate-200 rounded-gov p-4 space-y-2 font-mono">
              <label htmlFor="inputCaptcha" className="block text-xs font-bold text-slate-900 uppercase">
                PENGAMAN SISTEM (ANTI-BOT): BERAPA HASIL DARI {captchaNum1} + {captchaNum2}? <span className="text-red-600">*</span>
              </label>
              <input
                id="inputCaptcha"
                type="number"
                placeholder="Ketik angka hasil penjumlahan"
                value={captchaAnswer}
                onChange={(e) => setCaptchaAnswer(e.target.value)}
                className="w-full px-3 py-2 rounded border border-slate-300 text-xs font-bold focus:border-slate-800"
              />
              {errors.captcha && (
                <p className="text-xs text-red-600 font-sans">{errors.captcha}</p>
              )}
            </div>

            {/* Pernyataan Integritas Data */}
            <label className="flex items-start gap-2.5 cursor-pointer pt-2">
              <input
                type="checkbox"
                checked={setujuPrivasi}
                onChange={(e) => setSetujuPrivasi(e.target.checked)}
                className="mt-1 rounded text-gov-forest focus:ring-gov-forest"
              />
              <span className="text-xs text-slate-700 leading-relaxed">
                Saya menyatakan informasi ini adalah benar menurut fakta di lapangan, dan memahami bahwa saya akan diberikan <strong>Kode Rahasia Pelacakan</strong> untuk memverifikasi penyelesaian kasus ini.
              </span>
            </label>
            {errors.privasi && (
              <p className="text-xs text-red-600 font-sans">{errors.privasi}</p>
            )}
          </div>
        )}

        {/* Action Button Strip */}
        <div className="pt-4 border-t border-slate-200 flex items-center justify-between font-mono text-xs font-bold">
          {step > 1 ? (
            <button
              type="button"
              onClick={handlePrev}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded border border-slate-300 hover:bg-slate-50 text-slate-700"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>LANGKAH SEBELUMNYA</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                clearDraft();
                setDeskripsi('');
                setHargaDibayar('');
                setNamaKios('');
              }}
              className="text-slate-500 hover:text-red-600 underline"
            >
              Hapus Draf Isian
            </button>
          )}

          {step < 4 ? (
            <button
              type="button"
              onClick={handleNext}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded bg-slate-900 hover:bg-black text-white"
            >
              <span>LANJUT KE LANGKAH {step + 1}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded bg-gov-forest hover:bg-gov-hover text-white shadow-sm disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              <span>{isSubmitting ? 'MENYIMPAN DOKET...' : 'TERBITKAN PENGADUAN'}</span>
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
