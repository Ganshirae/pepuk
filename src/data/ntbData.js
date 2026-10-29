/**
 * Konstanta statis PEPUK.
 * Angka alokasi/realisasi/HET TIDAK disimpan di sini: semuanya dimuat dari Supabase (lihat src/lib/supabase.js)
 * agar setiap angka punya sumber resmi yang tercatat.
 */

// Kategori laporan (harus sama dengan CHECK constraint public.reports.category)
export const REPORT_CATEGORIES = [
  { id: 'harga_di_atas_het', title: 'Harga di atas HET', desc: 'Kios menjual lebih mahal dari Harga Eceran Tertinggi resmi.' },
  { id: 'stok_kosong', title: 'Stok kosong / tidak kebagian', desc: 'Terdaftar di e-RDKK, tetapi kios menyatakan stok atau kuota habis, atau menolak melayani.' },
  { id: 'tidak_terdaftar', title: 'Nama tidak terdaftar di e-RDKK', desc: 'Sudah mengusulkan lewat kelompok tani/penyuluh, tetapi nama tidak muncul saat menebus.' },
  { id: 'paket_paksa', title: 'Dipaksa membeli paket', desc: 'Penebusan pupuk subsidi disyaratkan membeli pupuk nonsubsidi, pestisida, atau barang lain.' },
  { id: 'penebusan_diwakilkan', title: 'Jatah ditebus orang lain', desc: 'Kuota atas nama Anda tercatat sudah ditebus, padahal Anda tidak menebusnya.' },
  { id: 'pupuk_palsu', title: 'Pupuk diduga palsu / tidak sesuai', desc: 'Kemasan, berat, atau mutu pupuk tidak sesuai standar.' },
  { id: 'lainnya', title: 'Lainnya', desc: 'Masalah distribusi pupuk bersubsidi lain.' }
];

// Status laporan (harus sama dengan CHECK constraint public.reports.status)
export const REPORT_STATUS = {
  diterima: { label: 'Diterima, menunggu verifikasi', tone: 'slate' },
  diverifikasi: { label: 'Diverifikasi petugas', tone: 'blue' },
  diteruskan: { label: 'Diteruskan ke instansi', tone: 'blue' },
  ditindaklanjuti: { label: 'Sedang ditindaklanjuti', tone: 'blue' },
  selesai_instansi: { label: 'Selesai menurut instansi, menunggu konfirmasi pelapor', tone: 'amber' },
  selesai: { label: 'Selesai (dikonfirmasi pelapor)', tone: 'green' },
  dibuka_kembali: { label: 'Dibuka kembali oleh pelapor', tone: 'amber' },
  ditolak: { label: 'Ditolak / tidak dapat diproses', tone: 'red' }
};

// Urutan tahap untuk progress tracker (PermenPANRB 62/2018)
export const STATUS_STEPS = [
  { id: 'diterima', label: 'Diterima', sla: 'Verifikasi maks. 3 hari kerja' },
  { id: 'diverifikasi', label: 'Diverifikasi', sla: '' },
  { id: 'diteruskan', label: 'Diteruskan', sla: 'Tindak lanjut maks. 14 hari kerja (60 bila perlu cek lapangan)' },
  { id: 'ditindaklanjuti', label: 'Ditindaklanjuti', sla: '' },
  { id: 'selesai_instansi', label: 'Selesai menurut instansi', sla: 'Pelapor punya 10 hari untuk konfirmasi' },
  { id: 'selesai', label: 'Dikonfirmasi pelapor', sla: '' }
];

// Kanal pengaduan resmi (diverifikasi 28 Okt 2026). Nomor "Lapor Pak Amran" sengaja tidak dicantumkan
// karena sumber berita tidak konsisten.
export const OFFICIAL_CHANNELS = [
  { name: 'SP4N-LAPOR!', detail: 'Kanal pengaduan nasional, tersedia opsi anonim dan rahasia', url: 'https://www.lapor.go.id' },
  { name: 'Call Center Pupuk Indonesia', detail: '0800-100-800-1 (bebas pulsa)', url: 'https://www.pupuk-indonesia.com' },
  { name: 'Ombudsman RI', detail: 'Telepon 137. Pelaporan resmi memerlukan identitas (KTP)', url: 'https://ombudsman.go.id' },
  { name: 'Cek Subsidi Kementan', detail: 'Cek apakah nama Anda terdaftar sebagai penerima', url: 'https://pupukbersubsidi.pertanian.go.id' }
];

export const KECAMATAN_MAP = {
  '5271': ['Ampenan', 'Cakranegara', 'Mataram', 'Sandubaya', 'Sekarbela', 'Selaparang'],
  '5201': ['Batu Layar', 'Gerung', 'Gunungsari', 'Kediri', 'Kuripan', 'Labuapi', 'Lembar', 'Lingsar', 'Narmada', 'Sekotong'],
  '5202': ['Batukeling', 'Batukeling Utara', 'Janapria', 'Jonggat', 'Kopang', 'Praya', 'Praya Barat', 'Praya Barat Daya', 'Praya Tengah', 'Praya Timur', 'Pringgarata', 'Pujut'],
  '5203': ['Aikmel', 'Jerowaru', 'Keruak', 'Labuhan Haji', 'Masbagik', 'Montong Gading', 'Pringgabaya', 'Sakra', 'Sakra Barat', 'Sakra Timur', 'Sambelia', 'Selong', 'Sembalun', 'Sikur', 'Suela', 'Sukadana', 'Suralaga', 'Terara', 'Wanasaba'],
  '5208': ['Bayan', 'Gangga', 'Kayangan', 'Pemenang', 'Tanjung'],
  '5207': ['Brang Ene', 'Brang Rea', 'Jereweh', 'Maluk', 'Poto Tano', 'Sateluk', 'Sekongkang', 'Taliwang'],
  '5204': ['Alas', 'Alas Barat', 'Batu Lanteh', 'Buer', 'Empang', 'Labangka', 'Labuhan Badas', 'Lape', 'Lenangguar', 'Lopok', 'Lunyuk', 'Maronge', 'Moyo Hilir', 'Moyo Hulu', 'Moyo Utara', 'Plampang', 'Rhee', 'Ropang', 'Sumbawa', 'Tarano', 'Unter Iwes', 'Utan'],
  '5205': ['Dompu', 'Hu\'u', 'Kempo', 'Kilo', 'Manggelewa', 'Pajo', 'Pekat', 'Woja'],
  '5206': ['Belo', 'Bolo', 'Donggo', 'Lambitu', 'Lambu', 'Langgudu', 'Madapangga', 'Monta', 'Palibelo', 'Parado', 'Sanggar', 'Sape', 'Soromandi', 'Tambora', 'Wawo', 'Wera', 'Woha'],
  '5272': ['Asakota', 'Mpunda', 'Raba', 'Rasanae Barat', 'Rasanae Timur']
};
