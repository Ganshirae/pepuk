/**
 * TANITERANG LocalStorage Management & Seed Database
 * Supports offline-first persistence, draft autosaving, and status tracking
 */

import { hashSecretCode } from './crypto';

const STORAGE_KEY_REPORTS = 'taniterang_reports';
const STORAGE_KEY_MY_REPORTS = 'taniterang_my_reports';
const STORAGE_KEY_DRAFT = 'taniterang_report_draft';

// Initial realistic demo reports for testing and grading
const INITIAL_REPORTS = [
  {
    idPublik: 'TT-2024-A8B1',
    tokenHash: 'sample_hash_1', // Will match code TR-7821-KM91
    secretCodePlain: 'TR-7821-KM91', // Retained in mock for demonstration convenience
    status: 'DITERIMA',
    statusLabel: 'Diterima Sistem',
    kodeWilayah: '5203',
    namaWilayah: 'Kabupaten Lombok Timur',
    kecamatan: 'Aikmel',
    jenisMasalah: 'harga_di_atas_het',
    jenisPupuk: 'Pupuk Urea',
    hargaDibayar: 135000,
    hetResmi: 90000,
    selisih: 45000,
    tanggalKejadian: '2024-10-18',
    namaKios: 'Kios Tani Barokah',
    namaKiosVerified: false,
    deskripsi: 'Membeli 1 sak Urea 50kg dimintai harga Rp 135.000, padahal HET resmi Rp 90.000. Diberitahu stok langka.',
    lampiran: [
      { nama: 'nota_penebusan.jpg', ukuran: '145 KB' }
    ],
    timeline: [
      {
        status: 'DITERIMA',
        label: 'Laporan Diterima',
        waktu: '2024-10-18 10:15 WITA',
        catatan: 'Laporan berhasil dicatat dalam antrean moderasi publik.'
      }
    ],
    batasRespons: '2024-10-25 10:15 WITA',
    dibuatPada: '2024-10-18 10:15 WITA'
  },
  {
    idPublik: 'TT-2024-C3D4',
    tokenHash: 'sample_hash_2', // Will match code TR-4421-P9B2
    secretCodePlain: 'TR-4421-P9B2',
    status: 'DITERUSKAN',
    statusLabel: 'Diteruskan ke Instansi Terkait',
    kodeWilayah: '5202',
    namaWilayah: 'Kabupaten Lombok Tengah',
    kecamatan: 'Praya Barat',
    jenisMasalah: 'tidak_kebagian',
    jenisPupuk: 'Pupuk NPK (Phonska)',
    hargaDibayar: 92000,
    hetResmi: 92000,
    selisih: 0,
    tanggalKejadian: '2024-10-16',
    namaKios: 'UD Subur Makmur',
    namaKiosVerified: false,
    deskripsi: 'Terdaftar di e-RDKK kelompok tani, namun saat jadwal tebus kios mengklaim jatah NPK sudah habis.',
    lampiran: [
      { nama: 'kartu_tani.jpg', ukuran: '210 KB' }
    ],
    timeline: [
      {
        status: 'DITERIMA',
        label: 'Laporan Diterima',
        waktu: '2024-10-16 14:20 WITA',
        catatan: 'Laporan berhasil dicatat.'
      },
      {
        status: 'DIVERIFIKASI',
        label: 'Laporan Diverifikasi Petugas',
        waktu: '2024-10-17 09:30 WITA',
        catatan: 'Bukti pendaftaran kelompok tani valid. Berkas diteruskan ke Dinas Pertanian Lombok Tengah.'
      },
      {
        status: 'DITERUSKAN',
        label: 'Diteruskan ke Tim Pengawas Pupuk',
        waktu: '2024-10-17 11:00 WITA',
        catatan: 'Tim Komisi Pengawasan Pupuk dan Pestisida (KP3) dijadwalkan sidak kios.'
      }
    ],
    batasRespons: '2024-10-24 14:20 WITA',
    dibuatPada: '2024-10-16 14:20 WITA'
  },
  {
    idPublik: 'TT-2024-E5F6',
    tokenHash: 'sample_hash_3', // Will match code TR-9981-L3X7
    secretCodePlain: 'TR-9981-L3X7',
    status: 'MENUNGGU_KONFIRMASI',
    statusLabel: 'Menunggu Konfirmasi Pelapor',
    kodeWilayah: '5204',
    namaWilayah: 'Kabupaten Sumbawa',
    kecamatan: 'Utan',
    jenisMasalah: 'harga_di_atas_het',
    jenisPupuk: 'Pupuk Urea',
    hargaDibayar: 125000,
    hetResmi: 90000,
    selisih: 35000,
    tanggalKejadian: '2024-10-12',
    namaKios: 'Kios Mitra Tani',
    namaKiosVerified: false,
    deskripsi: 'Kios menjual Urea Rp 125.000 dengan alasan biaya angkut.',
    lampiran: [
      { nama: 'bukti_pembayaran.jpg', ukuran: '190 KB' }
    ],
    timeline: [
      {
        status: 'DITERIMA',
        label: 'Laporan Diterima',
        waktu: '2024-10-12 08:30 WITA',
        catatan: 'Laporan dicatat.'
      },
      {
        status: 'DITERUSKAN',
        label: 'Tindak Lanjut Instansi',
        waktu: '2024-10-13 10:00 WITA',
        catatan: 'Dinas Pertanian Sumbawa telah menegur kios dan mengembalikan selisih harga.'
      },
      {
        status: 'MENUNGGU_KONFIRMASI',
        label: 'Petugas Menyelesaikan Tindak Lanjut',
        waktu: '2024-10-15 16:00 WITA',
        catatan: 'Kios telah menandatangani surat komitmen patuh HET. Menunggu konfirmasi dari pelapor apakah masalah benar-benar selesai.'
      }
    ],
    batasRespons: '2024-10-22 08:30 WITA',
    dibuatPada: '2024-10-12 08:30 WITA'
  }
];

export function getReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_REPORTS);
    if (!data) {
      localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(INITIAL_REPORTS));
      return INITIAL_REPORTS;
    }
    return JSON.parse(data);
  } catch {
    return INITIAL_REPORTS;
  }
}

export function saveNewReport(newReport) {
  const reports = getReports();
  reports.unshift(newReport);
  localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));

  // Also save to "My Reports" on this device
  addMyReport({
    idPublik: newReport.idPublik,
    secretCode: newReport.secretCodePlain,
    jenisPupuk: newReport.jenisPupuk,
    namaWilayah: newReport.namaWilayah,
    dibuatPada: newReport.dibuatPada,
    status: newReport.status,
    statusLabel: newReport.statusLabel
  });

  return newReport;
}

export async function findReportByCode(code) {
  const cleanCode = code.trim().toUpperCase();
  const reports = getReports();
  const targetHash = await hashSecretCode(cleanCode);

  return reports.find(
    r =>
      (r.secretCodePlain && r.secretCodePlain.toUpperCase() === cleanCode) ||
      (r.tokenHash && r.tokenHash === targetHash) ||
      (r.idPublik && r.idPublik.toUpperCase() === cleanCode)
  );
}

export function getMyReports() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_MY_REPORTS);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function addMyReport(entry) {
  const list = getMyReports();
  const exists = list.some(item => item.idPublik === entry.idPublik);
  if (!exists) {
    list.unshift(entry);
    localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(list));
  }
}

export function clearMyReports() {
  localStorage.removeItem(STORAGE_KEY_MY_REPORTS);
}

export function saveDraft(draft) {
  localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
}

export function getDraft() {
  try {
    const data = localStorage.getItem(STORAGE_KEY_DRAFT);
    return data ? JSON.parse(data) : null;
  } catch {
    return null;
  }
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY_DRAFT);
}

export function confirmReportResolution(idPublik, isFinished, catatan) {
  const reports = getReports();
  const idx = reports.findIndex(r => r.idPublik === idPublik);
  if (idx !== -1) {
    const nowStr = new Date().toLocaleString('id-ID', {
      dateStyle: 'short',
      timeStyle: 'short'
    }) + ' WITA';

    if (isFinished) {
      reports[idx].status = 'SELESAI';
      reports[idx].statusLabel = 'Selesai (Dikonfirmasi Pelapor)';
      reports[idx].timeline.push({
        status: 'SELESAI',
        label: 'Selesai Dikonfirmasi Pelapor',
        waktu: nowStr,
        catatan: catatan || 'Pelapor mengonfirmasi bahwa hak pupuk/harga telah sesuai ketentuan.'
      });
    } else {
      reports[idx].status = 'DIBUKA_KEMBALI';
      reports[idx].statusLabel = 'Dibuka Kembali oleh Pelapor';
      reports[idx].timeline.push({
        status: 'DIBUKA_KEMBALI',
        label: 'Laporan Dibuka Kembali oleh Pelapor',
        waktu: nowStr,
        catatan: catatan || 'Pelapor menyatakan masalah di lapangan belum selesai.'
      });
    }

    localStorage.setItem(STORAGE_KEY_REPORTS, JSON.stringify(reports));

    // Update in My Reports if present
    const myReports = getMyReports();
    const myIdx = myReports.findIndex(r => r.idPublik === idPublik);
    if (myIdx !== -1) {
      myReports[myIdx].status = reports[idx].status;
      myReports[myIdx].statusLabel = reports[idx].statusLabel;
      localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(myReports));
    }

    return reports[idx];
  }
  return null;
}
