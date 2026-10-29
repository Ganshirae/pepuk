/**
 * Penyimpanan lokal perangkat (tanpa login):
 * - "Laporan Saya": ID publik + kode rahasia yang dibuat di perangkat ini, agar pelapor tidak kehilangan kode.
 * - Draf formulir laporan (tanpa kontak & foto).
 * Data laporan sebenarnya disimpan di Supabase.
 */

const STORAGE_KEY_MY_REPORTS = 'pepuk_my_reports';
const STORAGE_KEY_DRAFT = 'pepuk_report_draft';

function readJSON(key, fallback) {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : fallback;
  } catch {
    return fallback;
  }
}

export function getMyReports() {
  return readJSON(STORAGE_KEY_MY_REPORTS, []);
}

export function addMyReport(entry) {
  const list = getMyReports();
  if (list.some((item) => item.publicId === entry.publicId)) return;
  list.unshift(entry);
  localStorage.setItem(STORAGE_KEY_MY_REPORTS, JSON.stringify(list));
}

export function clearMyReports() {
  localStorage.removeItem(STORAGE_KEY_MY_REPORTS);
}

export function saveDraft(draft) {
  localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify(draft));
}

export function getDraft() {
  return readJSON(STORAGE_KEY_DRAFT, null);
}

export function clearDraft() {
  localStorage.removeItem(STORAGE_KEY_DRAFT);
}
